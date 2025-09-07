-- Migration: add_admin_email_verification
-- Created at: 1756168551

-- Add email verification columns to admin_users table
ALTER TABLE admin_users 
ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN email_verification_token VARCHAR(255),
ADD COLUMN verification_token_expires_at TIMESTAMP,
ADD COLUMN verification_sent_at TIMESTAMP;;