DROP TABLE IF EXISTS pool_members;
DROP TABLE IF EXISTS pools;
DROP TABLE IF EXISTS ship_compliance;
DROP TABLE IF EXISTS bank_entries;
DROP TABLE IF EXISTS routes;

CREATE TABLE routes (
  id SERIAL PRIMARY KEY,
  route_id VARCHAR(20),
  vessel_type VARCHAR(50),
  fuel_type VARCHAR(50),
  year INT,
  ghg_intensity FLOAT,
  fuel_consumption FLOAT,
  distance FLOAT,
  total_emissions FLOAT,
  is_baseline BOOLEAN DEFAULT false
);

CREATE TABLE bank_entries (
  id SERIAL PRIMARY KEY,
  ship_id VARCHAR(20),
  year INT,
  amount FLOAT
);

CREATE TABLE ship_compliance (
  id SERIAL PRIMARY KEY,
  ship_id VARCHAR(20),
  year INT,
  cb FLOAT
);

CREATE TABLE pools (
  id SERIAL PRIMARY KEY,
  year INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pool_members (
  pool_id INT,
  ship_id VARCHAR(20),
  cb_before FLOAT,
  cb_after FLOAT
);

INSERT INTO routes (route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline) VALUES
('R001', 'Container', 'HFO', 2024, 91.0, 5000, 12000, 4500, true),
('R002', 'BulkCarrier', 'LNG', 2024, 88.0, 4800, 11500, 4200, false),
('R003', 'Tanker', 'MGO', 2024, 93.5, 5100, 12500, 4700, false),
('R004', 'RoRo', 'HFO', 2025, 89.2, 4900, 11800, 4300, false),
('R005', 'Container', 'LNG', 2025, 90.5, 4950, 11900, 4400, false);
