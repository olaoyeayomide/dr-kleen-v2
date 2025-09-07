CREATE TABLE banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    discount VARCHAR(50),
    image TEXT,
    bg_color VARCHAR(20) DEFAULT '#f5ca4f',
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);