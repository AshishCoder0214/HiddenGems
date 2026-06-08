import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';
import { Gem } from '../models/Gem.js';

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('CRITICAL: MONGODB_URI is not set in backend/.env!');
  process.exit(1);
}

const mockUser = {
  name: 'Explorer Alex',
  email: 'explorer.alex@hiddengems.co',
  password: 'password123', // Hashed pre-save by User model hook
  contributionsCount: 17,
  explorerLevel: 14,
  badges: ['First Discovery', 'Reviewer Pro', 'Local Guide']
};

const mockGems = [
  {
    title: 'The Secret Garden Cafe',
    description: 'Hidden behind a legacy vintage bookstore, this tranquil oasis offers premium artisan pour-overs and a hand-curated botanical greenhouse space. Perfect for deep focus sessions or stepping away from the metropolitan buzz.',
    category: 'Cafe',
    images: ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=1200&q=80'],
    coordinates: {
      type: 'Point',
      coordinates: [-0.1983, 51.5014] // Kensington, London
    },
    costEstimate: 2,
    crowdLevel: 2,
    noiseLevel: 2,
    safetyRating: 5,
    wiFiAvailable: true,
    hiddenGemScore: 9.8
  },
  {
    title: 'The Secret Greenhouse',
    description: 'A botanical glasshouse paradise nestled beside an antique library. Features hanging ferns, velvet seating, and exceptional filter brews in a serene ambient setting.',
    category: 'Study',
    images: ['https://images.unsplash.com/photo-1406857013876-17608298e26a?auto=format&fit=crop&w=1200&q=80'],
    coordinates: {
      type: 'Point',
      coordinates: [-0.1278, 51.5246] // Bloomsbury, London
    },
    costEstimate: 1,
    crowdLevel: 2,
    noiseLevel: 1,
    safetyRating: 4.8,
    wiFiAvailable: true,
    hiddenGemScore: 9.6
  },
  {
    title: 'Midnight Blue Lounge',
    description: 'An atmospheric, subterranean live music sanctuary behind an unmarked vintage wooden door. Illuminated by glowing filament bulbs and deep navy neon hues, providing perfect acoustics for jazz lovers.',
    category: 'Food',
    images: ['https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1200&q=80'],
    coordinates: {
      type: 'Point',
      coordinates: [-0.0787, 51.5262] // Shoreditch, London
    },
    costEstimate: 3,
    crowdLevel: 4,
    noiseLevel: 4,
    safetyRating: 4.5,
    wiFiAvailable: false,
    hiddenGemScore: 9.4
  },
  {
    title: 'The Loft Lab',
    description: 'Minimalist industrial coffee workshop inside a decommissioned brick loft. Light wash oak panels, massive high-arched skylights, perfect Wi-Fi, and unparalleled calm for remote working sessions.',
    category: 'Study',
    images: ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80'],
    coordinates: {
      type: 'Point',
      coordinates: [-0.0825, 51.5218] // Old Street, London
    },
    costEstimate: 2,
    crowdLevel: 2,
    noiseLevel: 2,
    safetyRating: 4.9,
    wiFiAvailable: true,
    hiddenGemScore: 9.5
  },
  {
    title: 'Primrose Hill Sunset Point',
    description: 'The highest natural vantage point in Kensington area providing a fully unblocked scenic sweep of the London Skyline. Spectacular during sunset.',
    category: 'Viewpoint',
    images: ['https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?auto=format&fit=crop&w=1200&q=80'],
    coordinates: {
      type: 'Point',
      coordinates: [-0.1601, 51.5411] // Primrose Hill
    },
    costEstimate: 1,
    crowdLevel: 3,
    noiseLevel: 3,
    safetyRating: 5,
    wiFiAvailable: false,
    hiddenGemScore: 9.2
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB successfully connected for seeding.');

    // Clear existing data
    await User.deleteMany({});
    await Gem.deleteMany({});
    console.log('Cleaned existing collections.');

    // Create user
    const createdUser = await User.create(mockUser);
    console.log(`Preseeded user: ${createdUser.email} (password: password123)`);

    // Create gems and associate to user
    const gemsToInsert = mockGems.map(gem => ({
      ...gem,
      submittedBy: createdUser._id
    }));

    const insertedGems = await Gem.insertMany(gemsToInsert);
    console.log(`Successfully preseeded ${insertedGems.length} gems.`);

    // Bookmark first two gems for user savedPlaces
    createdUser.savedPlaces = [insertedGems[0]._id, insertedGems[1]._id];
    await createdUser.save();
    console.log('Populated saved bookmark associations.');

    console.log('Database seeding process completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('CRITICAL: Database seeding execution failed.', err);
    process.exit(1);
  }
};

seedDB();
