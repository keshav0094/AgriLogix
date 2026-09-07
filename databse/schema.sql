-- AgriLogix PostgreSQL Master Schema

-- 1. Users Table (Farmers, Buyers, Drivers)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('FARMER', 'BUYER', 'DRIVER')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crop Listings Table
CREATE TABLE listings (
    listing_id SERIAL PRIMARY KEY,
    farmer_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    crop_name VARCHAR(50) NOT NULL,
    quantity_quintals NUMERIC(10, 2) NOT NULL,
    price_per_quintal NUMERIC(10, 2) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Escrow Transactions Table
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    buyer_id INT REFERENCES users(user_id),
    listing_id INT REFERENCES listings(listing_id),
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('PENDING', 'LOCKED', 'RELEASED', 'CANCELLED')) DEFAULT 'LOCKED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Optimized Routes Table
CREATE TABLE routes (
    route_id SERIAL PRIMARY KEY,
    truck_capacity_quintals NUMERIC(10, 2),
    total_distance_km NUMERIC(10, 2),
    co2_saved_kg NUMERIC(10, 2),
    waypoint_sequence JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
