import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './routes/pages/HomePage';
import Login from './routes/pages/Login';
import Register from './routes/pages/Register';
import Dashboard from './routes/pages/Dashboard';
import Profile from './routes/pages/Profile';
import CreateRecipe from './routes/pages/createRecipe';
import PrivateRoute from './routes/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="/CreateRecipe"
          element={
            <PrivateRoute>
              <CreateRecipe />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
