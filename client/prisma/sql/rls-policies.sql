-- =============================================================================
-- HELPER FUNCTION FOR CURRENT USER (PERFORMANCE OPTIMIZATION)
-- =============================================================================

-- Create a stable function that returns the current user ID
-- This is evaluated once per statement instead of once per row
-- Fixes Supabase warning about current_setting() performance
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid;
$$ LANGUAGE sql STABLE;

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE timezones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- USERS TABLE POLICIES
-- =============================================================================

-- Users can only see and update their own profile (includes INSERT)
CREATE POLICY "users_own_profile" ON users
    FOR ALL
    TO authenticated
    USING (public.current_user_id() = id)
    WITH CHECK (public.current_user_id() = id);

-- =============================================================================
-- PROPERTIES TABLE POLICIES
-- =============================================================================

-- Users can only access their own properties
CREATE POLICY "properties_own_only" ON properties
    FOR ALL
    TO authenticated
    USING (public.current_user_id() = properties.user_id)
    WITH CHECK (public.current_user_id() = properties.user_id);

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
        public.current_user_id() = transactions.user_id AND
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = transactions.property_id
            AND p.user_id = public.current_user_id()
        )
    );

-- Users can only insert transactions for their own properties
CREATE POLICY "transactions_insert_own_properties" ON transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.current_user_id() = transactions.user_id AND
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = transactions.property_id
            AND p.user_id = public.current_user_id()
        )
    );

-- Users can only update transactions for their own properties
CREATE POLICY "transactions_update_own_properties" ON transactions
    FOR UPDATE
    TO authenticated
    USING (
        public.current_user_id() = transactions.user_id AND
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = transactions.property_id
            AND p.user_id = public.current_user_id()
        )
    )
    WITH CHECK (
        public.current_user_id() = transactions.user_id AND
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = transactions.property_id
            AND p.user_id = public.current_user_id()
        )
    );

-- Users can only delete transactions for their own properties
CREATE POLICY "transactions_delete_own_properties" ON transactions
    FOR DELETE
    TO authenticated
    USING (
        public.current_user_id() = transactions.user_id AND
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = transactions.property_id
            AND p.user_id = public.current_user_id()
        )
    );

-- =============================================================================
-- PROPERTY IMAGES TABLE POLICIES
-- =============================================================================

-- Users can only access images for their own properties
CREATE POLICY "property_images_own_properties_only" ON property_images
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = property_images.property_id
            AND p.user_id = public.current_user_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = property_images.property_id
            AND p.user_id = public.current_user_id()
        )
    );

-- =============================================================================
-- MONTHLY METRICS TABLE POLICIES
-- =============================================================================

-- Users can only access metrics for their own properties
CREATE POLICY "monthly_metrics_own_properties_only" ON monthly_metrics
    FOR ALL
    TO authenticated
    USING (
        public.current_user_id() = monthly_metrics.user_id AND
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = monthly_metrics.property_id
            AND p.user_id = public.current_user_id()
        )
    )
    WITH CHECK (
        public.current_user_id() = monthly_metrics.user_id AND
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = monthly_metrics.property_id
            AND p.user_id = public.current_user_id()
        )
    );

-- =============================================================================
-- ACCOUNTS TABLE POLICIES
-- =============================================================================

-- Users can only access their own OAuth accounts
CREATE POLICY "accounts_own_only" ON accounts
    FOR ALL
    TO authenticated
    USING (public.current_user_id() = accounts.user_id)
    WITH CHECK (public.current_user_id() = accounts.user_id);

-- =============================================================================
-- SESSIONS TABLE POLICIES
-- =============================================================================

-- Users can only access their own sessions
CREATE POLICY "sessions_own_only" ON sessions
    FOR ALL
    TO authenticated
    USING (public.current_user_id() = sessions.user_id)
    WITH CHECK (public.current_user_id() = sessions.user_id);

-- =============================================================================
-- VERIFICATION TOKENS TABLE POLICIES
-- =============================================================================

-- Verification tokens are system-managed, no user access needed
-- RLS enabled but no policies = no access (system only)

-- =============================================================================
-- CURRENCIES TABLE POLICIES
-- =============================================================================

-- All authenticated users can read currencies (system-wide reference data)
CREATE POLICY "currencies_read_all" ON currencies
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- =============================================================================
-- TIMEZONES TABLE POLICIES
-- =============================================================================

-- All authenticated users can read timezones (system-wide reference data)
CREATE POLICY "timezones_read_all" ON timezones
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- =============================================================================
-- USER SETTINGS TABLE POLICIES
-- =============================================================================

-- Users can only access their own settings
CREATE POLICY "user_settings_own_only" ON user_settings
    FOR ALL
    TO authenticated
    USING (public.current_user_id() = user_settings.user_id)
    WITH CHECK (public.current_user_id() = user_settings.user_id);

-- =============================================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- =============================================================================

-- Users can only access their own subscription
CREATE POLICY "subscriptions_own_only" ON subscriptions
    FOR ALL
    TO authenticated
    USING (public.current_user_id() = subscriptions.user_id)
    WITH CHECK (public.current_user_id() = subscriptions.user_id);

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
        AND user_id = public.current_user_id()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's property IDs (useful for queries)
CREATE OR REPLACE FUNCTION get_user_property_ids()
RETURNS UUID[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT id FROM properties
        WHERE user_id = public.current_user_id()
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a subscription (useful for billing logic)
CREATE OR REPLACE FUNCTION user_owns_subscription()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM subscriptions
        WHERE user_id = public.current_user_id()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's subscription status (useful for access control)
CREATE OR REPLACE FUNCTION get_user_subscription_status()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT status::TEXT FROM subscriptions
        WHERE user_id = public.current_user_id()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has completed onboarding
CREATE OR REPLACE FUNCTION user_has_completed_onboarding()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT has_completed_onboarding FROM user_settings
        WHERE user_id = public.current_user_id()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- GRANTS FOR AUTHENTICATED USERS
-- =============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON properties TO authenticated;
GRANT SELECT ON categories TO authenticated; 
GRANT SELECT, INSERT, UPDATE, DELETE ON transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON property_images TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON monthly_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sessions TO authenticated;
GRANT SELECT ON currencies TO authenticated;
GRANT SELECT ON timezones TO authenticated; 
GRANT SELECT, INSERT, UPDATE, DELETE ON user_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON subscriptions TO authenticated;

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

-- Should only return property images for user's properties
SELECT pi.*, p.name as property_name 
FROM property_images pi 
JOIN properties p ON pi.property_id = p.id;

-- Should only return monthly metrics for user's properties
SELECT mm.*, p.name as property_name 
FROM monthly_metrics mm 
JOIN properties p ON mm.property_id = p.id;

-- Should only return user's own accounts
SELECT * FROM accounts;

-- Should only return user's own sessions
SELECT * FROM sessions;

-- Should return all active currencies (system reference data)
SELECT * FROM currencies WHERE is_active = true;

-- Should return all active timezones (system reference data)
SELECT * FROM timezones WHERE is_active = true;

-- Should only return user's own settings
SELECT * FROM user_settings;

-- Should only return user's own subscription
SELECT * FROM subscriptions;

-- Should fail if trying to insert transaction for property not owned
INSERT INTO transactions (user_id, property_id, category_id, type, amount, transaction_date)
VALUES ('other-user-id', 'property-not-owned', 'some-category', 'INCOME', 1000, CURRENT_DATE);

-- Should fail if trying to modify categories (users can only read)
UPDATE categories SET name = 'Modified Name' WHERE id = 'some-id'; -- Should fail
INSERT INTO categories (name, type) VALUES ('Custom Category', 'INCOME'); -- Should fail

-- Should fail if trying to access verification tokens (system only)
SELECT * FROM verification_tokens; -- Should fail

-- Should fail if trying to modify currencies (users can only read)
UPDATE currencies SET name = 'Modified Currency' WHERE id = 'some-id'; -- Should fail

-- Should fail if trying to access other user's subscription
SELECT * FROM subscriptions WHERE user_id = 'other-user-id'; -- Should fail
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