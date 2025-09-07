CREATE TABLE service_requests (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    service_type VARCHAR(100) NOT NULL,
    property_type VARCHAR(100),
    property_size VARCHAR(100),
    preferred_date DATE,
    preferred_time VARCHAR(50),
    special_instructions TEXT,
    estimated_cost DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);