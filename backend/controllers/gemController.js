import mongoose from 'mongoose';
import { Gem } from '../models/Gem.js';
import { User } from '../models/User.js';
import { logger } from '../config/logger.js';

// Gamification milestones check
function recalculateExplorerStats(contributions) {
  const explorerLevel = Math.floor(contributions / 1.2) + 1;
  const badges = [];

  if (contributions >= 1) badges.push('First Discovery');
  if (contributions >= 5) badges.push('Reviewer Pro');
  if (contributions >= 10) badges.push('Local Guide');
  if (contributions >= 20) badges.push('Master Explorer');
  if (contributions >= 30) badges.push('Local Legend');

  return { explorerLevel, badges };
}

// Get all gems (Paginated, filtered, sorted, geoqueries supported)
export const getGems = async (req, res, next) => {
  try {
    const { page, limit, sort, category, search, noise, crowd, safety, lon, lat, maxDistance } = req.query;

    const query = { deletedAt: null };

    if (category && category !== 'All') {
      query.category = category;
    }
    if (noise !== undefined) {
      query.noiseLevel = { $lte: noise };
    }
    if (crowd !== undefined) {
      query.crowdLevel = { $lte: crowd };
    }
    if (safety !== undefined) {
      query.safetyRating = { $gte: safety };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // GeoSpatial query
    if (lon !== undefined && lat !== undefined) {
      const maxDistMeters = maxDistance ? maxDistance * 1000 : 50000;
      query.coordinates = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lon, lat]
          },
          $maxDistance: maxDistMeters
        }
      };
    }

    // Pagination
    const skip = (page - 1) * limit;
    const total = await Gem.countDocuments(query);
    
    let gemsQuery = Gem.find(query)
      .populate('submittedBy', 'name explorerLevel')
      .skip(skip)
      .limit(limit);

    if (sort) {
      gemsQuery = gemsQuery.sort(sort);
    }

    const gems = await gemsQuery;
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: gems,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    next(err);
  }
};

// Create new gem
export const createGem = async (req, res, next) => {
  try {
    const { title, description, category, images, coordinates, costEstimate, crowdLevel, noiseLevel, safetyRating, wiFiAvailable } = req.body;

    const costVal = parseInt(costEstimate, 10) || 2;
    const crowdVal = parseInt(crowdLevel, 10) || 3;
    const noiseVal = parseInt(noiseLevel, 10) || 3;
    const safetyVal = parseFloat(safetyRating) || 4.2;
    const wifiBool = wiFiAvailable === true;

    // Automatic calculation for the "Hidden Gem Score" (range of 1.0 - 10.0)
    const rawScore = (10 - noiseVal - crowdVal + safetyVal + (wifiBool ? 2 : 0) + (4 - costVal)) / 2 + 3.5;
    const finalScore = Math.min(10, Math.max(1, parseFloat(rawScore.toFixed(1))));

    const gemData = {
      title,
      description,
      category,
      images: images && images.length ? images : ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80'],
      coordinates: {
        type: 'Point',
        coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
      },
      costEstimate: costVal,
      crowdLevel: crowdVal,
      noiseLevel: noiseVal,
      safetyRating: safetyVal,
      wiFiAvailable: wifiBool,
      hiddenGemScore: finalScore,
      submittedBy: req.user._id
    };

    const newGem = await Gem.create(gemData);

    // Update user contributions count and explorer Level
    const user = await User.findById(req.user._id);
    if (user) {
      user.contributionsCount += 1;
      const stats = recalculateExplorerStats(user.contributionsCount);
      user.explorerLevel = stats.explorerLevel;
      user.badges = stats.badges;
      await user.save();
    }

    const populatedGem = await Gem.findById(newGem._id).populate('submittedBy', 'name explorerLevel');

    logger.info('New hidden gem listing submitted successfully', { gemId: newGem._id, userId: req.user._id });
    res.status(201).json(populatedGem);
  } catch (err) {
    next(err);
  }
};

// Toggle saving a gem (Bookmarks)
export const toggleSaveGem = async (req, res, next) => {
  try {
    const gemId = req.params.id;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const gemExists = await Gem.findOne({ _id: gemId, deletedAt: null });
    if (!gemExists) {
      return res.status(404).json({ error: 'The requested hidden gem could not be located.' });
    }

    const idIndex = user.savedPlaces.indexOf(gemExists._id);
    let isSaved = false;

    if (idIndex > -1) {
      user.savedPlaces.splice(idIndex, 1);
      isSaved = false;
    } else {
      user.savedPlaces.push(gemExists._id);
      isSaved = true;
    }

    await user.save();
    logger.info('User bookmark saved list toggled', { userId: req.user._id, gemId, isSaved });
    res.json({ message: isSaved ? 'Gem added to saved places' : 'Gem removed from saved places', isSaved });
  } catch (err) {
    next(err);
  }
};

// Delete a Gem (Soft Delete, Ownership Checked)
export const deleteGem = async (req, res, next) => {
  try {
    const gemId = req.params.id;

    const gem = await Gem.findById(gemId);
    if (!gem) {
      return res.status(404).json({ error: 'Gem not found' });
    }

    // Ownership validation (anti-BOLA)
    if (gem.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this gem.' });
    }

    gem.deletedAt = new Date();
    await gem.save();

    logger.info('Gem soft deleted successfully', { gemId, userId: req.user._id });
    res.json({ message: 'Gem successfully removed.' });
  } catch (err) {
    next(err);
  }
};
