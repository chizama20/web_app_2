// Recipe utility functions

// Format recipe data for display
export const formatRecipeData = (recipe) => {
  return {
    ...recipe,
    createdAt: new Date(recipe.created_at).toLocaleDateString()
  };
};

// Validate recipe form data
export const validateRecipeForm = (recipeData) => {
  const errors = {};

  if (!recipeData.title || recipeData.title.trim() === '') {
    errors.title = 'Title is required';
  }

  if (!recipeData.description || recipeData.description.trim() === '') {
    errors.description = 'Description is required';
  }

  if (!recipeData.ingredients || recipeData.ingredients.length === 0) {
    errors.ingredients = 'At least one ingredient is required';
  }

  if (!recipeData.steps || recipeData.steps.length === 0) {
    errors.steps = 'At least one step is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
