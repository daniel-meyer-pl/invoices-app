CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================
-- USERS
-- ===============================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) NOT NULL,
    google_account_id VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    bank_account_number VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    nip VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_google_account_id ON users (google_account_id);
CREATE INDEX idx_users_email ON users (email);


-- ===============================
-- CUSTOMERS
-- ===============================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    company_name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    nip VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customers_nip ON customers (nip);
CREATE INDEX idx_customers_firstname ON customers (firstname);
CREATE INDEX idx_customers_lastname ON customers (lastname);
CREATE INDEX idx_customers_company_name ON customers (company_name);


-- ===============================
-- INVOICES
-- ===============================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type_enum') THEN
        CREATE TYPE payment_type_enum AS ENUM ('transfer', 'cash');
    END IF;
END$$;

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    invoice_number VARCHAR(255) NOT NULL UNIQUE,
    payment_deadline DATE NOT NULL,
    payment_type payment_type_enum DEFAULT 'transfer',
    paid_status BOOLEAN DEFAULT FALSE,
    created_date DATE DEFAULT CURRENT_DATE,
    paid_date DATE,
    price_netto NUMERIC(10, 2) NOT NULL CHECK (price_netto >= 0),
    price_gross NUMERIC(10, 2) NOT NULL CHECK (price_gross >= price_netto),
    currency_code CHAR(3) NOT NULL DEFAULT 'PLN'
);


-- ===============================
-- INVOICE ITEMS
-- ===============================
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    unit VARCHAR(50) NOT NULL,
    price_netto DECIMAL(10, 2) NOT NULL CHECK (price_netto >= 0),
    price_gross DECIMAL(10, 2) NOT NULL CHECK (price_gross >= price_netto),
    tax SMALLINT NOT NULL CHECK (tax >= 0 AND tax <= 100)
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items (invoice_id);
CREATE INDEX idx_invoice_items_product_name ON invoice_items (product_name);
