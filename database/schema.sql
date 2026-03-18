-- FieldSense Database Schema

DROP DATABASE IF EXISTS fieldsense;
CREATE DATABASE fieldsense;
USE fieldsense;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'technician', 'staff') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
    asset_id VARCHAR(50) PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    min_temp_celsius DECIMAL(5, 2) NOT NULL,
    max_temp_celsius DECIMAL(5, 2) NOT NULL,
    expiry_date DATE,
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS technicians (
    tech_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE,
    location VARCHAR(255),
    status ENUM('available', 'busy', 'offline') DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS issues (
    issue_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id VARCHAR(50),
    issue_type VARCHAR(100) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('open', 'assigned', 'reached_spot', 'in_progress', 'needs_help', 'resolved', 'closed') DEFAULT 'open',
    assigned_technician INT NULL,
    reported_by INT NULL,
    assigned_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    resolution_notes TEXT,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_technician) REFERENCES technicians(tech_id) ON DELETE SET NULL,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sensor_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id VARCHAR(50),
    temperature DECIMAL(5, 2),
    power_status VARCHAR(50),
    device_status VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS threshold_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id VARCHAR(50) NOT NULL UNIQUE,
    max_temperature DECIMAL(5, 2),
    min_temperature DECIMAL(5, 2),
    power_failure_alert BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
);

-- Insert default simplified mock users
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin', 'admin', '123', 'admin'),
('Manager One', 'manager1', '123', 'manager'),
('Technician One', 'technician1', '123', 'technician');

-- Insert a default technician matching the user above
INSERT INTO technicians (name, phone, email, location, status) VALUES 
('Technician One', '555-0101', 'technician1', 'Warehouse A', 'available');
