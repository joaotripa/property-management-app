-- Note: Replace the user_id values with actual user IDs from your system
-- You can get user IDs by running: SELECT id, email FROM users;

-- Test Properties with realistic data for Portugal
INSERT INTO properties (
    id, name, address, city, state, zip_code, country, 
    purchase_price, market_value, rent, tenants, type, occupancy,
    user_id, created_at, updated_at
) VALUES 
-- Property 1: Luxury Lisbon Apartment
(
    gen_random_uuid(),
    'Apartamento de Luxo no Chiado',
    'Rua Garrett, 45 - 3º Esquerdo',
    'Lisboa',
    'Lisboa',
    '1200-204',
    'Portugal',
    450000.00,  -- purchase_price
    520000.00,  -- market_value (15.6% appreciation)
    2100.00,    -- monthly rent
    2,          -- tenants
    'APARTMENT',
    'OCCUPIED',
    '@user_id', -- Replace with actual user ID
    '2025-03-15 10:00:00'::timestamptz,
    now()
),

-- Property 2: Porto Family House
(
    gen_random_uuid(),
    'Moradia Familiar na Foz',
    'Rua do Molhe, 123',
    'Porto',
    'Porto',
    '4150-568',
    'Portugal',
    280000.00,  -- purchase_price
    315000.00,  -- market_value (12.5% appreciation)
    1400.00,    -- monthly rent
    1,          -- tenants
    'HOUSE',
    'OCCUPIED',
    '@user_id',
    '2025-03-10 14:00:00'::timestamptz,
    now()
),

-- Property 3: Algarve Beach Apartment
(
    gen_random_uuid(),
    'Apartamento Praia da Rocha',
    'Avenida Tomás Cabreira, 67 - 2º A',
    'Portimão',
    'Faro',
    '8500-802',
    'Portugal',
    220000.00,  -- purchase_price
    275000.00,  -- market_value (25% appreciation - tourist area)
    1800.00,    -- monthly rent (seasonal premium)
    0,          -- tenants
    'APARTMENT',
    'AVAILABLE',
    '@user_id',
    '2025-04-20 09:00:00'::timestamptz,
    now()
),

-- Property 4: Commercial Office in Cascais
(
    gen_random_uuid(),
    'Escritório Cascais Business Center',
    'Avenida da República, 2000 - Sala 15',
    'Cascais',
    'Lisboa',
    '2750-642',
    'Portugal',
    180000.00,  -- purchase_price
    195000.00,  -- market_value (8.3% appreciation)
    1200.00,    -- monthly rent
    1,          -- tenants (business tenant)
    'OFFICE',
    'OCCUPIED',
    '@user_id',
    '2025-03-05 11:00:00'::timestamptz,
    now()
),

-- Property 5: Student Studio in Coimbra
(
    gen_random_uuid(),
    'Studio Universitário Coimbra',
    'Rua da Sofia, 98 - R/C Direito',
    'Coimbra',
    'Coimbra',
    '3000-394',
    'Portugal',
    95000.00,   -- purchase_price
    110000.00,  -- market_value (15.8% appreciation)
    650.00,     -- monthly rent (student accommodation)
    1,          -- tenants
    'STUDIO',
    'OCCUPIED',
    '@user_id',
    '2025-03-12 16:00:00'::timestamptz,
    now()
);


-- Simple Transaction Data for 6 months (Mar 2025 - Sep 2025)
-- Income Transactions (Rental Income) - Only for occupied periods
WITH property_data AS (
    SELECT id, rent, occupancy, created_at::date as start_date
    FROM properties 
    WHERE user_id = '@user_id'
),
rental_income AS (
    SELECT 
        p.id as property_id,
        p.rent,
        DATE(date_trunc('month', generate_series(
            DATE '2025-03-01',
            DATE '2025-09-01',
            interval '1 month'
        ))) as transaction_date
    FROM property_data p
    WHERE p.occupancy = 'OCCUPIED' -- Only generate income for currently occupied properties
    
    UNION ALL
    
    -- For vacant properties, generate partial rental income (showing they had tenants before)
    SELECT 
        p.id as property_id,
        p.rent,
        DATE(date_trunc('month', generate_series(
            DATE '2025-03-01',
            DATE '2025-05-01', -- 3 months of income, then vacant
            interval '1 month'
        ))) as transaction_date
    FROM property_data p
    WHERE p.occupancy = 'AVAILABLE' -- Vacant properties had income in the past
)
INSERT INTO transactions (
    id, amount, type, description, transaction_date, is_recurring,
    user_id, property_id, category_id, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    ri.rent * (0.95 + random() * 0.1), -- ±5% variation in rent
    'INCOME',
    'Monthly Rent Payment',
    ri.transaction_date,
    true, -- recurring income
    '@user_id',
    ri.property_id,
    COALESCE((SELECT id FROM categories WHERE name = 'Rental Income' AND type = 'INCOME' LIMIT 1), (SELECT id FROM categories WHERE name = 'Other Income' AND type = 'INCOME' LIMIT 1)),
    ri.transaction_date::timestamptz,
    now()
FROM rental_income ri;

-- Expense Transactions (Simple 6-month data)
-- Property Management Fees (5% of rent monthly)
WITH property_data AS (
    SELECT id, rent, created_at::date as start_date
    FROM properties 
    WHERE user_id = '@user_id'
),
management_fees AS (
    SELECT 
        p.id as property_id,
        p.rent * 0.05 as fee_amount, -- 5% of rent
        DATE(date_trunc('month', generate_series(
            DATE '2025-03-01',
            DATE '2025-09-01',
            interval '1 month'
        ))) as transaction_date
    FROM property_data p
)
INSERT INTO transactions (
    id, amount, type, description, transaction_date, is_recurring,
    user_id, property_id, category_id, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    mf.fee_amount,
    'EXPENSE',
    'Property Management Fee',
    mf.transaction_date,
    true,
    '@user_id',
    mf.property_id,
    COALESCE((SELECT id FROM categories WHERE name = 'Property Management' AND type = 'EXPENSE' LIMIT 1), (SELECT id FROM categories WHERE name = 'Other' AND type = 'EXPENSE' LIMIT 1)),
    mf.transaction_date::timestamptz,
    now()
FROM management_fees mf;

-- Simple Maintenance (one per property)
WITH property_data AS (
    SELECT id, name, created_at::date as start_date
    FROM properties 
    WHERE user_id = '@user_id'
),
maintenance_events AS (
    SELECT 
        p.id as property_id,
        p.name,
        DATE '2025-05-15' as event_date, -- Single maintenance date
        250.00 as amount -- Fixed €250 maintenance cost
    FROM property_data p
)
INSERT INTO transactions (
    id, amount, type, description, transaction_date, is_recurring,
    user_id, property_id, category_id, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    me.amount,
    'EXPENSE',
    'Property Maintenance',
    me.event_date,
    false,
    '@user_id',
    me.property_id,
    COALESCE((SELECT id FROM categories WHERE name = 'Maintenance' AND type = 'EXPENSE' LIMIT 1), (SELECT id FROM categories WHERE name = 'Other' AND type = 'EXPENSE' LIMIT 1)),
    me.event_date::timestamptz,
    now()
FROM maintenance_events me;

-- Simple Insurance (one payment per property)
WITH property_data AS (
    SELECT id, purchase_price, created_at::date as start_date
    FROM properties 
    WHERE user_id = '@user_id'
),
insurance_payments AS (
    SELECT 
        p.id as property_id,
        (p.purchase_price * 0.002)::numeric(10,2) as annual_premium, -- 0.2% of property value
        DATE '2025-03-01' as payment_date -- Single payment in March
    FROM property_data p
)
INSERT INTO transactions (
    id, amount, type, description, transaction_date, is_recurring,
    user_id, property_id, category_id, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    ip.annual_premium, -- annual payment
    'EXPENSE',
    'Property Insurance Premium',
    ip.payment_date,
    true,
    '@user_id',
    ip.property_id,
    COALESCE((SELECT id FROM categories WHERE name = 'Insurance' AND type = 'EXPENSE' LIMIT 1), (SELECT id FROM categories WHERE name = 'Other' AND type = 'EXPENSE' LIMIT 1)),
    ip.payment_date::timestamptz,
    now()
FROM insurance_payments ip;

-- Simple Property Tax (IMI - one payment per property)
WITH property_data AS (
    SELECT id, purchase_price, created_at::date as start_date
    FROM properties 
    WHERE user_id = '@user_id'
),
tax_payments AS (
    SELECT 
        p.id as property_id,
        (p.purchase_price * 0.003)::numeric(10,2) as annual_tax, -- 0.3% of property value
        DATE '2025-05-01' as payment_date -- Single payment in May
    FROM property_data p
)
INSERT INTO transactions (
    id, amount, type, description, transaction_date, is_recurring,
    user_id, property_id, category_id, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    tp.annual_tax, -- annual payment
    'EXPENSE',
    'Property Tax Payment',
    tp.payment_date,
    true,
    '@user_id',
    tp.property_id,
    COALESCE((SELECT id FROM categories WHERE name = 'Taxes' AND type = 'EXPENSE' LIMIT 1), (SELECT id FROM categories WHERE name = 'Other' AND type = 'EXPENSE' LIMIT 1)),
    tp.payment_date::timestamptz,
    now()
FROM tax_payments tp;

-- Simple Utilities (monthly for vacant properties)
WITH property_data AS (
    SELECT id, occupancy, created_at::date as start_date
    FROM properties 
    WHERE user_id = '@user_id' AND occupancy = 'AVAILABLE'
),
utility_bills AS (
    SELECT 
        p.id as property_id,
        60.00 as monthly_utility, -- €60/month utility costs
        DATE(date_trunc('month', generate_series(
            DATE '2025-06-01',
            DATE '2025-09-01',
            interval '1 month'
        ))) as bill_date
    FROM property_data p
)
INSERT INTO transactions (
    id, amount, type, description, transaction_date, is_recurring,
    user_id, property_id, category_id, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    ub.monthly_utility,
    'EXPENSE',
    'Utilities (Vacant Property)',
    ub.bill_date,
    true,
    '@user_id',
    ub.property_id,
    COALESCE((SELECT id FROM categories WHERE name = 'Utilities' AND type = 'EXPENSE' LIMIT 1), (SELECT id FROM categories WHERE name = 'Other' AND type = 'EXPENSE' LIMIT 1)),
    ub.bill_date::timestamptz,
    now()
FROM utility_bills ub;

-- Generate Monthly Metrics for efficient analytics queries
WITH property_data AS (
    SELECT id, purchase_price, created_at::date as start_date
    FROM properties 
    WHERE user_id = '@user_id'
),
community_fees AS (
    SELECT 
        p.id as property_id,
        (30 + random() * 50)::numeric(10,2) as monthly_fee, -- €30-€80/month
        DATE(date_trunc('month', generate_series(
            DATE '2025-03-01',
            DATE '2025-09-01',
            interval '1 month'
        ))) as fee_date
    FROM property_data p
    WHERE random() < 0.7 -- 70% of properties have community charges (apartments/condos)
)
INSERT INTO transactions (
    id, amount, type, description, transaction_date, is_recurring,
    user_id, property_id, category_id, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    cf.monthly_fee,
    'EXPENSE',
    'Monthly Community/Condominium Fees',
    cf.fee_date,
    true,
    '@user_id',
    cf.property_id,
    COALESCE((SELECT id FROM categories WHERE name = 'Community Charges' AND type = 'EXPENSE' LIMIT 1), (SELECT id FROM categories WHERE name = 'Other' AND type = 'EXPENSE' LIMIT 1)),
    cf.fee_date::timestamptz,
    now()
FROM community_fees cf;

-- Mortgage Interest (monthly mortgage payments)
WITH property_data AS (
    SELECT id, purchase_price, created_at::date as start_date
    FROM properties 
    WHERE user_id = '@user_id'
),
mortgage_payments AS (
    SELECT 
        p.id as property_id,
        (p.purchase_price * 0.002)::numeric(10,2) as monthly_interest, -- ~2.4% annual rate (reduced)
        DATE(date_trunc('month', generate_series(
            DATE '2025-03-01',
            DATE '2025-09-01',
            interval '1 month'
        ))) as payment_date
    FROM property_data p
    WHERE random() < 0.8 -- 80% of properties have mortgages
)
INSERT INTO transactions (
    id, amount, type, description, transaction_date, is_recurring,
    user_id, property_id, category_id, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    mp.monthly_interest,
    'EXPENSE',
    'Monthly Mortgage Interest Payment',
    mp.payment_date,
    true,
    '@user_id',
    mp.property_id,
    COALESCE((SELECT id FROM categories WHERE name = 'Mortgage Interest' AND type = 'EXPENSE' LIMIT 1), (SELECT id FROM categories WHERE name = 'Other' AND type = 'EXPENSE' LIMIT 1)),
    mp.payment_date::timestamptz,
    now()
FROM mortgage_payments mp;

-- Capital Improvements (major one-time expenses)
WITH property_data AS (
    SELECT id, name, created_at::date as start_date
    FROM properties 
    WHERE user_id = '@user_id'
),
improvements AS (
    SELECT 
        p.id as property_id,
        p.name,
        DATE '2025-07-15' as improvement_date,
        (800 + random() * 1200)::numeric(10,2) as improvement_cost -- €800-€2,000 (reduced)
    FROM property_data p
    WHERE random() < 0.3 -- 30% of properties get improvements (reduced)
)
INSERT INTO transactions (
    id, amount, type, description, transaction_date, is_recurring,
    user_id, property_id, category_id, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    i.improvement_cost,
    'EXPENSE',
    CASE 
        WHEN random() < 0.25 THEN 'Kitchen Renovation'
        WHEN random() < 0.5 THEN 'Bathroom Upgrade'
        WHEN random() < 0.75 THEN 'Flooring Replacement'
        ELSE 'HVAC System Upgrade'
    END,
    i.improvement_date,
    false,
    '@user_id',
    i.property_id,
    COALESCE((SELECT id FROM categories WHERE name = 'Capital Improvements' AND type = 'EXPENSE' LIMIT 1), (SELECT id FROM categories WHERE name = 'Other' AND type = 'EXPENSE' LIMIT 1)),
    i.improvement_date::timestamptz,
    now()
FROM improvements i;

-- Monthly Metrics --
INSERT INTO monthly_metrics (
    id, property_id, user_id, year, month, 
    total_income, total_expenses, cash_flow, transaction_count,
    created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    p.id,
    '@user_id',
    EXTRACT(YEAR FROM month_date)::int,
    EXTRACT(MONTH FROM month_date)::int,
    COALESCE(income.total, 0) as total_income,
    COALESCE(expenses.total, 0) as total_expenses,
    COALESCE(income.total, 0) - COALESCE(expenses.total, 0) as cash_flow,
    COALESCE(income.count, 0) + COALESCE(expenses.count, 0) as transaction_count,
    now(),
    now()
FROM 
    properties p
    CROSS JOIN generate_series('2025-03-01'::date, '2025-09-01'::date, interval '1 month') as month_date
    LEFT JOIN (
        SELECT 
            property_id,
            EXTRACT(YEAR FROM transaction_date) as year,
            EXTRACT(MONTH FROM transaction_date) as month,
            SUM(amount) as total,
            COUNT(*) as count
        FROM transactions 
        WHERE user_id = '@user_id' AND type = 'INCOME'
        GROUP BY property_id, EXTRACT(YEAR FROM transaction_date), EXTRACT(MONTH FROM transaction_date)
    ) income ON p.id = income.property_id 
        AND EXTRACT(YEAR FROM month_date) = income.year 
        AND EXTRACT(MONTH FROM month_date) = income.month
    LEFT JOIN (
        SELECT 
            property_id,
            EXTRACT(YEAR FROM transaction_date) as year,
            EXTRACT(MONTH FROM transaction_date) as month,
            SUM(amount) as total,
            COUNT(*) as count
        FROM transactions 
        WHERE user_id = '@user_id' AND type = 'EXPENSE'
        GROUP BY property_id, EXTRACT(YEAR FROM transaction_date), EXTRACT(MONTH FROM transaction_date)
    ) expenses ON p.id = expenses.property_id 
        AND EXTRACT(YEAR FROM month_date) = expenses.year 
        AND EXTRACT(MONTH FROM month_date) = expenses.month
WHERE 
    p.user_id = '@user_id'
    AND month_date >= p.created_at::date;