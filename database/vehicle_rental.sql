CREATE DATABASE IF NOT EXISTS vehicle_rental
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vehicle_rental;

CREATE TABLE IF NOT EXISTS vehicles (
  vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
  veh_name VARCHAR(100) NOT NULL,
  vehicle_num VARCHAR(30) NOT NULL UNIQUE,
  veh_time VARCHAR(50) NOT NULL,
  veh_model VARCHAR(100) NOT NULL,
  rent_per_day DECIMAL(10,2) NOT NULL,
  status ENUM('Available','Rented','Maintenance') NOT NULL DEFAULT 'Available',
  image_url VARCHAR(500) DEFAULT 'images/car-default.svg',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  booking_date DATE NOT NULL,
  return_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('Booked','Confirmed','Returned','Cancelled') NOT NULL DEFAULT 'Booked',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_vehicle FOREIGN KEY (vehicle_id)
    REFERENCES vehicles(vehicle_id) ON DELETE RESTRICT,
  INDEX idx_booking_vehicle_dates (vehicle_id, booking_date, return_date),
  INDEX idx_booking_status (status)
) ENGINE=InnoDB;

INSERT IGNORE INTO vehicles
  (veh_name, vehicle_num, veh_time, veh_model, rent_per_day, status, image_url)
VALUES
  ('Maruti Suzuki', 'AP02AB1234', '24 Hours', 'Swift VXI', 1500.00, 'Available', 'images/swift.svg'),
  ('Hyundai', 'AP02CD5678', '24 Hours', 'i20 Sportz', 1800.00, 'Available', 'images/i20.svg'),
  ('Honda', 'AP02EF9012', '24 Hours', 'Activa 6G', 500.00, 'Available', 'images/activa.svg'),
  ('Toyota', 'AP02GH3456', '24 Hours', 'Innova Crysta', 2800.00, 'Available', 'images/innova.svg');
