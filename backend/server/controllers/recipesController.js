const db = require('../config/db');
const util = require('util');

const query = util.promisify(db.query).bind(db); // for promise-based queries (async/await)

const getRecipe = async (req, res) => {
  const recipeID = req.params.id;

  const recipeSQL = 'SELECT id, title, description, region, country, author_id, created_at FROM recipes WHERE id = ?';
  const ingredientsSQL = 'SELECT name, amount FROM ingredients WHERE recipe_id = ?';
  const stepsSQL = 'SELECT step_number, instruction FROM steps WHERE recipe_id = ? ORDER BY step_number ASC';

  try {
    // Get the recipe
    const recipeResults = await query(recipeSQL, [recipeID]);
    if (recipeResults.length === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Get ingredients
    const ingredientResults = await query(ingredientsSQL, [recipeID]);

    // Get steps
    const stepResults = await query(stepsSQL, [recipeID]);

    // Send response
    res.json({
      recipe: recipeResults[0],
      ingredients: ingredientResults,
      steps: stepResults
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

const createRecipe = async (req, res) => {
  const { title, description, region, country, author_id, ingredients, steps } = req.body;

  // Basic validation
  if (!title || !description || !region || !country || !author_id || !ingredients || !steps) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Insert recipe
    const recipeSQL = 'INSERT INTO recipes (title, description, region, country, author_id) VALUES (?, ?, ?, ?, ?)';
    const recipeResult = await query(recipeSQL, [title, description, region, country, author_id]);
    const recipeID = recipeResult.insertId;

    // Insert ingredients
    const ingredientsSQL = 'INSERT INTO ingredients (recipe_id, name, amount) VALUES (?, ?, ?)';
    for (const ing of ingredients) {
      await query(ingredientsSQL, [recipeID, ing.name, ing.amount]);
    }

    // Insert steps
    const stepsSQL = 'INSERT INTO steps (recipe_id, step_number, instruction) VALUES (?, ?, ?)';
    for (const st of steps) {
      await query(stepsSQL, [recipeID, st.step_number, st.instruction]);
    }

    // Send response
    res.status(201).json({ message: 'Recipe created successfully', recipe_id: recipeID });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

module.exports = { getRecipe, createRecipe };
