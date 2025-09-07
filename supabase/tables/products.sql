CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC NOT NULL,
    image TEXT,
    category VARCHAR(100),
    description TEXT,
    is_new BOOLEAN DEFAULT false,
    discount INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    original_price NUMERIC,
    specs JSONB,
    stock INTEGER DEFAULT 0,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);