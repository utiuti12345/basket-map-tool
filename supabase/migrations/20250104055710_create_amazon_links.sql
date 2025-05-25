CREATE TABLE amazon_links (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    description TEXT,
    price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);
