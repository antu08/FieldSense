-- FieldSense Database Schema

CREATE DATABASE IF NOT EXISTS fieldsense;
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
    asset_type VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    installation_date DATE,
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS technicians (
    tech_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE,
    status ENUM('available', 'busy', 'offline') DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS issues (
    issue_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id VARCHAR(50),
    issue_type VARCHAR(100) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('open', 'assigned', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    assigned_technician INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_technician) REFERENCES technicians(tech_id) ON DELETE SET NULL
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
    asset_type VARCHAR(100) NOT NULL UNIQUE,
    max_temperature DECIMAL(5, 2),
    min_temperature DECIMAL(5, 2),
    power_failure_alert BOOLEAN DEFAULT TRUE
);

-- Insert a default admin user (Password: Admin@123)
-- bcrypt hash for Admin@123
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Admin', 'admin@fieldsense.local', '$2b$10$S/G1.e3T.T2WwzV3w5Tbxeb3I2UfXhGjD6gXYBf4E0tD2tPzjPXiG', 'admin')
ON DUPLICATE KEY UPDATE email=email;
