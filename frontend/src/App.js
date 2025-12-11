// Author: Anik Tahabilder
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PrivateRoute from './routes/PrivateRoute';
import RoleRoute from './routes/RoleRoute';

// Client components
import ServiceRequestForm from './components/client/ServiceRequestForm';
import MyRequests from './components/client/MyRequests';
import RequestDetail from './components/client/RequestDetail';
import MyOrders from './components/client/MyOrders';
import MyBills from './components/client/MyBills';

// Contractor components
import ContractorDashboard from './components/contractor/ContractorDashboard';
import RequestManagement from './components/contractor/RequestManagement';
import OrderManagement from './components/contractor/OrderManagement';
import BillingManagement from './components/contractor/BillingManagement';
import AnalyticsDashboard from './components/contractor/AnalyticsDashboard';

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

        {/* Client routes */}
        <Route
          path="/service-request"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['client']}>
                <ServiceRequestForm />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/my-requests"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['client']}>
                <MyRequests />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/requests/:id"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['client']}>
                <RequestDetail />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['client']}>
                <MyOrders />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/my-bills"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['client']}>
                <MyBills />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        {/* Contractor routes */}
        <Route
          path="/contractor/dashboard"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['contractor']}>
                <ContractorDashboard />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/contractor/requests"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['contractor']}>
                <RequestManagement />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/contractor/orders"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['contractor']}>
                <OrderManagement />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/contractor/billing"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['contractor']}>
                <BillingManagement />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/contractor/analytics"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['contractor']}>
                <AnalyticsDashboard />
              </RoleRoute>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
