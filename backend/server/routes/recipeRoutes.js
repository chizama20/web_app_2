const express = require('express');
const router = express.Router();
const { getRecipe, createRecipe } = require('../controllers/recipesController');

// GET /api/recipes/:id
router.get('/:id', getRecipe);
router.post('/', createRecipe);


module.exports = router;
