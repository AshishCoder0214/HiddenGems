import express from 'express';
import { getGems, createGem, toggleSaveGem, deleteGem } from '../controllers/gemController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createGemSchema, queryGemSchema } from '../middleware/validationSchemas.js';

const router = express.Router();

router.get('/', validate(queryGemSchema), getGems);
router.post('/', protect, validate(createGemSchema), createGem);
router.post('/:id/save', protect, toggleSaveGem);
router.delete('/:id', protect, deleteGem);

export default router;
