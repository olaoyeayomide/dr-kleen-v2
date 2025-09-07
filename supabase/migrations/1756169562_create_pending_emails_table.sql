-- Migration: create_pending_emails_table
-- Created at: 1756169562

-- Create table for storing emails when external services are unavailable
CREATE TABLE pending_emails (
    id SERIAL PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    email_type VARCHAR(50) NOT NULL,
    verification_token VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    error_message TEXT
);;