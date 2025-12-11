-- Home Cleaning Service Management System - Database Migration
-- Run this script to set up all required tables for the application

USE jwt_auth_db;

-- Add role column to users table
ALTER TABLE users ADD COLUMN role ENUM('client', 'contractor') DEFAULT 'client' AFTER cvv;

-- Create service_requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  service_address VARCHAR(255) NOT NULL,
  cleaning_type ENUM('basic', 'deep cleaning', 'move-out') NOT NULL,
  num_rooms INT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  proposed_budget DECIMAL(10,2) NOT NULL,
  notes TEXT,
  status ENUM('pending', 'quote_sent', 'accepted', 'rejected', 'canceled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_client_id (client_id),
  INDEX idx_status (status)
);

-- Create service_request_photos table
CREATE TABLE IF NOT EXISTS service_request_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  photo_path VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  INDEX idx_request_id (request_id)
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  contractor_id INT,
  adjusted_price DECIMAL(10,2) NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time_start TIME NOT NULL,
  scheduled_time_end TIME NOT NULL,
  notes TEXT,
  status ENUM('pending', 'accepted', 'rejected', 'renegotiating') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_rejection BOOLEAN DEFAULT FALSE,
  rejection_reason TEXT,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (contractor_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_request_id (request_id),
  INDEX idx_status (status)
);

-- Create quote_responses table
CREATE TABLE IF NOT EXISTS quote_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quote_id INT NOT NULL,
  responder_id INT NOT NULL,
  response_type ENUM('accept', 'renegotiate', 'counter') NOT NULL,
  counter_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
  FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_quote_id (quote_id),
  INDEX idx_responder_id (responder_id)
);

-- Create service_orders table
CREATE TABLE IF NOT EXISTS service_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  quote_id INT NOT NULL,
  client_id INT NOT NULL,
  status ENUM('scheduled', 'in_progress', 'completed', 'canceled') DEFAULT 'scheduled',
  scheduled_date DATE NOT NULL,
  scheduled_time_start TIME NOT NULL,
  scheduled_time_end TIME NOT NULL,
  final_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_client_id (client_id),
  INDEX idx_status (status)
);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  client_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'paid', 'disputed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL,
  FOREIGN KEY (order_id) REFERENCES service_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_client_id (client_id),
  INDEX idx_status (status)
);

-- Create bill_responses table
CREATE TABLE IF NOT EXISTS bill_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bill_id INT NOT NULL,
  responder_id INT NOT NULL,
  response_type ENUM('pay', 'dispute', 'revise') NOT NULL,
  dispute_note TEXT,
  revised_amount DECIMAL(10,2),
  revision_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
  FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_bill_id (bill_id),
  INDEX idx_responder_id (responder_id)
);

