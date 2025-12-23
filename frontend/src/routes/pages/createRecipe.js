import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI, recipeAPI } from '../../services/api';
import './createRecipe.css';

const CreateRecipe = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);
  const [steps, setSteps] = useState([{ step_number: 1, instruction: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch user profile to get author_id
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile. Please log in again.');
        setLoading(false);
        // Redirect to login if not authenticated
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Handle adding new ingredient field
  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  // Handle removing ingredient field
  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    }
  };

  // Handle ingredient change
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  // Handle adding new step field
  const addStep = () => {
    setSteps([...steps, { step_number: steps.length + 1, instruction: '' }]);
  };

  // Handle removing step field
  const removeStep = (index) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((_, i) => i !== index);
      // Renumber steps
      newSteps.forEach((step, i) => {
        step.step_number = i + 1;
      });
      setSteps(newSteps);
    }
  };

  // Handle step change
  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index].instruction = value;
    setSteps(newSteps);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate ingredients and steps
    const hasEmptyIngredients = ingredients.some(ing => !ing.name || !ing.amount);
    const hasEmptySteps = steps.some(step => !step.instruction);

    if (hasEmptyIngredients) {
      setError('Please fill in all ingredient fields');
      return;
    }

    if (hasEmptySteps) {
      setError('Please fill in all step instructions');
      return;
    }

    try {
      const recipeData = {
        title,
        description,
        region,
        country,
        author_id: user.id,
        ingredients,
        steps
      };

      const res = await recipeAPI.create(recipeData);

      if (res.status === 201) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create recipe. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="create-recipe-container">
      <nav className="navbar">
        <div className="nav-brand">Recipe Creator</div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/profile">Profile</Link></li>
        </ul>
      </nav>

      <div className="content-wrapper">
        <div className="header">
          <h1>Create New Recipe</h1>
          <p>Share your culinary creation with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="recipe-form">
          {/* Basic Recipe Info */}
          <div className="form-section">
            <h2>Recipe Details</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Recipe Title *</label>
                <input
                  type="text"
                  placeholder="Enter recipe title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Description *</label>
                <textarea
                  placeholder="Describe your recipe"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Region *</label>
                <input
                  type="text"
                  placeholder="e.g., Mediterranean"
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  placeholder="e.g., Italy"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>Ingredients</h2>
              <button
                type="button"
                onClick={addIngredient}
                className="btn btn-add"
              >
                + Add Ingredient
              </button>
            </div>

            <div className="ingredients-list">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-item">
                  <div className="ingredient-number">{index + 1}</div>
                  <div className="ingredient-fields">
                    <input
                      type="text"
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={e => handleIngredientChange(index, 'name', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Amount (e.g., 2 cups)"
                      value={ingredient.amount}
                      onChange={e => handleIngredientChange(index, 'amount', e.target.value)}
                      required
                      className="amount-input"
                    />
                  </div>
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="btn btn-remove"
                      title="Remove ingredient"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Steps Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>Instructions</h2>
              <button
                type="button"
                onClick={addStep}
                className="btn btn-add"
              >
                + Add Step
              </button>
            </div>

            <div className="steps-list">
              {steps.map((step, index) => (
                <div key={index} className="step-item">
                  <div className="step-number">{step.step_number}</div>
                  <div className="step-content">
                    <textarea
                      placeholder={`Describe step ${step.step_number}`}
                      value={step.instruction}
                      onChange={e => handleStepChange(index, e.target.value)}
                      required
                      rows="3"
                    />
                  </div>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="btn btn-remove"
                      title="Remove step"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span>⚠</span> {error}
            </div>
          )}

          <button type="submit" className="btn btn-submit">
            Create Recipe
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRecipe;
