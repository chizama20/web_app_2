# Home Cleaning Service Management System

A full-stack web application for managing home-cleaning services, built with React (frontend) and Node.js/Express (backend) with MySQL database.

## Architecture

The application follows a modular, layered architecture:

### Backend Structure
```
backend/
├── config/          # Configuration files (database, multer, constants)
├── models/          # Data access layer (repositories)
├── services/        # Business logic layer
├── controllers/     # HTTP request handlers
├── routes/          # Route definitions
├── middleware/      # Authentication, authorization, validation, error handling
├── utils/           # Utilities (encryption, validators, errors)
└── server.js        # Main entry point
```

### Frontend Structure
```
frontend/src/
├── components/      # Reusable React components
│   ├── common/      # Shared components
│   ├── client/      # Client-specific components
│   └── contractor/  # Contractor-specific components
├── pages/           # Page-level components
├── routes/          # Route protection components
├── services/        # API service layer
├── utils/           # Utility functions
└── styles/          # Global styles
```

## Prerequisites

- Node.js (v14 or later) and npm
- MySQL (XAMPP, MAMP, or MySQL Server)
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd web_app_2
```

### 2. Database Setup

1. Start MySQL service (XAMPP, MAMP, or MySQL Server)
2. Create the database and run migration:
   ```sql
   -- Open MySQL client (phpMyAdmin or MySQL CLI)
   -- Execute the migration script
   source backend/database_migration.sql
   ```
   
   Or manually:
   ```sql
   CREATE DATABASE jwt_auth_db;
   USE jwt_auth_db;
   -- Copy and paste contents from backend/database_migration.sql
   ```

3. Set up Anna Johnson as contractor (optional for testing):
   ```sql
   UPDATE users SET role = 'contractor' WHERE email = 'anna@example.com';
   -- Replace with Anna's actual email
   ```

### 3. Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database credentials if needed:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=jwt_auth_db
   JWT_SECRET=your_jwt_secret_change_in_production
   ```

4. Start the backend server:
   ```bash
   npm start
   # Or: node server.js
   ```
   
   The backend will run on `http://localhost:5000`

### 4. Frontend Setup

1. Navigate to frontend directory (in a new terminal):
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```
   
   The frontend will run on `http://localhost:3000`

## Usage

### For Clients

1. **Register**: Create an account with your information and credit card details
2. **Submit Service Request**: Create a cleaning service request with photos
3. **Review Quotes**: View quotes from the contractor and accept/renegotiate
4. **Track Orders**: Monitor your service orders
5. **Pay Bills**: View and pay bills, or dispute if needed

### For Contractors (Anna Johnson)

1. **Login**: Access the contractor dashboard
2. **Manage Requests**: View and respond to service requests with quotes or rejections
3. **Manage Orders**: Track and mark orders as completed
4. **Manage Billing**: Create bills and handle disputes

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login user

### Service Requests
- `POST /api/service-requests` - Create service request
- `GET /api/service-requests` - Get all requests
- `GET /api/service-requests/:id` - Get request details
- `POST /api/service-requests/:id/photos` - Upload photos

### Quotes
- `POST /api/quotes` - Create quote or rejection
- `GET /api/quotes/:id` - Get quote details
- `POST /api/quotes/:id/responses` - Respond to quote
- `GET /api/service-requests/:requestId/quotes` - Get quotes for request

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/complete` - Mark order as completed

### Bills
- `GET /api/bills` - Get all bills
- `GET /api/bills/:id` - Get bill details
- `POST /api/bills/:id/responses` - Pay, dispute, or revise bill

## Security Features

- JWT-based authentication
- Role-based access control (client/contractor)
- Credit card data encryption (simulated)
- Input validation and sanitization
- File upload validation
- SQL injection protection (parameterized queries)

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=jwt_auth_db
JWT_SECRET=your_jwt_secret_change_in_production
JWT_EXPIRES_IN=3h
PORT=5000
ENCRYPTION_KEY=your-encryption-key-32-bytes-long!!
NODE_ENV=development
```

## Development

### Code Structure

- **DRY Principle**: Code is modular and reusable
- **Separation of Concerns**: Clear separation between layers
- **Error Handling**: Centralized error handling with custom error classes
- **Validation**: Input validation at middleware and service layers
- **Security**: Encrypted sensitive data, validated inputs

### Testing

The code structure is designed for easy testing:
- Models can be mocked for service tests
- Services can be tested independently
- Controllers handle HTTP layer only

## Troubleshooting

- **Database Connection Issues**: Ensure MySQL is running and credentials in `.env` are correct
- **Port Conflicts**: Change PORT in `.env` if 5000 or 3000 are in use
- **Module Not Found**: Run `npm install` in both backend and frontend directories

## License

ISC
