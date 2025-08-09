-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- USERS TABLE POLICIES
-- =============================================================================

-- Users can only see and update their own profile
CREATE POLICY "users_own_profile" ON users
    FOR ALL
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow users to insert their own record during signup
CREATE POLICY "users_insert_own" ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- =============================================================================
-- PROPERTIES TABLE POLICIES
-- =============================================================================

-- Users can only access their own properties
CREATE POLICY "properties_own_only" ON properties
    FOR ALL
    TO authenticated
    USING (auth.uid() = properties.user_id)
    WITH CHECK (auth.uid() = properties.user_id);

-- =============================================================================
-- CATEGORIES TABLE POLICIES
-- =============================================================================

-- All authenticated users can read all categories (fixed/shared categories)
CREATE POLICY "categories_read_all" ON categories
    FOR SELECT
    TO authenticated
    USING (true);

-- =============================================================================
-- TRANSACTIONS TABLE POLICIES
-- =============================================================================

-- Users can only access transactions for their own properties
CREATE POLICY "transactions_own_properties_only" ON transactions
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = transactions.user_id AND
        EXISTS (
            SELECT 1 FROM properties p 
            WHERE p.id = transactions.property_id
            AND p.user_id = auth.uid()
        )
    );

-- Users can only insert transactions for their own properties
CREATE POLICY "transactions_insert_own_properties" ON transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = transactions.user_id AND
        EXISTS (
            SELECT 1 FROM properties p 
            WHERE p.id = transactions.property_id
            AND p.user_id = auth.uid()
        )
    );

-- Users can only update transactions for their own properties
CREATE POLICY "transactions_update_own_properties" ON transactions
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = transactions.user_id AND
        EXISTS (
            SELECT 1 FROM properties p 
            WHERE p.id = transactions.property_id
            AND p.user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() = transactions.user_id AND
        EXISTS (
            SELECT 1 FROM properties p 
            WHERE p.id = transactions.property_id
            AND p.user_id = auth.uid()
        )
    );

-- Users can only delete transactions for their own properties
CREATE POLICY "transactions_delete_own_properties" ON transactions
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = transactions.user_id AND
        EXISTS (
            SELECT 1 FROM properties p 
            WHERE p.id = transactions.property_id
            AND p.user_id = auth.uid()
        )
    );

-- =============================================================================
-- ADDITIONAL SECURITY FUNCTIONS
-- =============================================================================

-- Function to check if user owns a property (useful for application logic)
CREATE OR REPLACE FUNCTION user_owns_property(property_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM properties 
        WHERE id = property_uuid 
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's property IDs (useful for queries)
CREATE OR REPLACE FUNCTION get_user_property_ids()
RETURNS UUID[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT id FROM properties 
        WHERE user_id = auth.uid() 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- INDEXES FOR RLS PERFORMANCE
-- =============================================================================

-- These indexes improve RLS policy performance
CREATE INDEX IF NOT EXISTS idx_properties_user_id_is_active 
    ON properties(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id_property_id 
    ON transactions(user_id, property_id);

CREATE INDEX IF NOT EXISTS idx_categories_type_is_active 
    ON categories(type, is_active);

-- =============================================================================
-- GRANTS FOR AUTHENTICATED USERS
-- =============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON properties TO authenticated;
GRANT SELECT ON categories TO authenticated;  -- Only SELECT for categories
GRANT SELECT, INSERT, UPDATE, DELETE ON transactions TO authenticated;

-- Grant usage on sequences (for auto-incrementing if any)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- TESTING RLS POLICIES (Optional - for development)
-- =============================================================================

/*
-- Test queries to verify RLS is working (run as specific user)

-- Should only return current user's properties
SELECT * FROM properties;

-- Should return all fixed categories (available to all users)
SELECT * FROM categories ORDER BY type, name;

-- Should only return transactions for user's properties
SELECT t.*, p.name as property_name 
FROM transactions t 
JOIN properties p ON t.property_id = p.id;

-- Should fail if trying to insert transaction for property not owned
INSERT INTO transactions (user_id, property_id, category_id, type, amount, transaction_date)
VALUES ('other-user-id', 'property-not-owned', 'some-category', 'INCOME', 1000, CURRENT_DATE);

-- Should fail if trying to modify categories (users can only read)
UPDATE categories SET name = 'Modified Name' WHERE id = 'some-id'; -- Should fail
INSERT INTO categories (name, type) VALUES ('Custom Category', 'INCOME'); -- Should fail
*/

-- =============================================================================
-- SUPABASE ADMIN ACCESS
-- =============================================================================

-- Note: Supabase automatically handles admin access for:
-- - Database backups and maintenance
-- - Supabase Dashboard access
-- - RLS bypass for service_role key operations
-- 
-- No manual superuser policies needed - Supabase manages this internally