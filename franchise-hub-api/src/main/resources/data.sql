-- Insert demo users (passwords are 'password123' encoded with BCrypt)
INSERT INTO users (id, email, first_name, last_name, role, phone, company, password, is_active, created_at, updated_at) VALUES
('demo-business-user', 'business@demo.com', 'John', 'Smith', 'BUSINESS', '+91-9876543210', 'Smith Enterprises', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('demo-partner-user', 'partner@demo.com', 'Jane', 'Doe', 'PARTNER', '+91-9876543211', 'Doe Investments', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('admin-user', 'admin@franchisehub.com', 'Admin', 'User', 'ADMIN', '+91-9876543212', 'FranchiseHub', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert demo franchises
INSERT INTO franchises (id, name, description, category, status, business_owner_id, business_owner_name, franchise_fee, royalty_fee, marketing_fee, liquid_capital_required, net_worth_required, year_established, total_units, franchised_units, company_owned_units, created_at, updated_at) VALUES
('franchise-1', 'Chaayos', 'Premium tea cafe chain offering a wide variety of teas and snacks', 'FOOD_BEVERAGE', 'ACTIVE', 'demo-business-user', 'John Smith', 1500000.00, 6.00, 2.00, 2500000.00, 5000000.00, 2012, 150, 120, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('franchise-2', 'Wow! Momo', 'Popular momo and fast food chain', 'FOOD_BEVERAGE', 'ACTIVE', 'demo-business-user', 'John Smith', 1200000.00, 5.50, 1.50, 2000000.00, 4000000.00, 2008, 200, 180, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('franchise-3', 'The Laundry Basket', 'Professional laundry and dry cleaning services', 'SERVICES', 'ACTIVE', 'demo-business-user', 'John Smith', 800000.00, 4.00, 1.00, 1500000.00, 3000000.00, 2015, 80, 70, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert demo applications (simplified to match actual schema)
INSERT INTO applications (id, franchise_id, franchise_name, applicant_id, applicant_name, applicant_email, status, application_fee, payment_status, submitted_at, updated_at, is_active) VALUES
('app-1', 'franchise-1', 'Chaayos', 'demo-partner-user', 'Jane Doe', 'partner@demo.com', 'SUBMITTED', 25000.00, 'PAID', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),
('app-2', 'franchise-2', 'Wow! Momo', 'demo-partner-user', 'Jane Doe', 'partner@demo.com', 'UNDER_REVIEW', 20000.00, 'PAID', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),
('app-3', 'franchise-3', 'The Laundry Basket', 'demo-partner-user', 'Jane Doe', 'partner@demo.com', 'APPROVED', 15000.00, 'PAID', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true);

-- Insert demo payment transactions (simplified to match actual schema)
INSERT INTO payment_transactions (id, user_id, franchise_id, application_id, type, amount, platform_fee, net_amount, method, status, currency, description, processed_at, created_at, updated_at) VALUES
('txn-1', 'demo-partner-user', 'franchise-1', 'app-1', 'APPLICATION_FEE', 25000.00, 500.00, 24500.00, 'UPI', 'SUCCESS', 'INR', 'Application fee for Chaayos franchise', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('txn-2', 'demo-partner-user', 'franchise-2', 'app-2', 'APPLICATION_FEE', 20000.00, 400.00, 19600.00, 'CREDIT_CARD', 'SUCCESS', 'INR', 'Application fee for Wow! Momo franchise', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('txn-3', 'demo-partner-user', 'franchise-3', 'app-3', 'APPLICATION_FEE', 15000.00, 300.00, 14700.00, 'NET_BANKING', 'SUCCESS', 'INR', 'Application fee for The Laundry Basket franchise', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert demo payment requests (simplified to match actual schema)
INSERT INTO payment_requests (id, from_user_id, to_user_id, franchise_id, application_id, amount, currency, type, status, title, description, due_date, created_at, updated_at) VALUES
('pr-1', 'demo-business-user', 'demo-partner-user', 'franchise-1', 'app-1', 50000.00, 'INR', 'SETUP_FEE', 'PENDING', 'Setup Fee Payment', 'Initial setup fee for Chaayos franchise', datetime('now', '+30 days'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pr-2', 'demo-business-user', 'demo-partner-user', 'franchise-2', 'app-2', 75000.00, 'INR', 'TRAINING_FEE', 'PENDING', 'Training Fee Payment', 'Training program fee for Wow! Momo franchise', datetime('now', '+45 days'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert demo notifications (simplified to match actual schema)
INSERT INTO notifications (id, user_id, type, title, message, status, application_id, franchise_id, payment_request_id, priority, created_at) VALUES
('notif-1', 'demo-partner-user', 'APPLICATION_UPDATE', 'Application Approved', 'Your application for The Laundry Basket franchise has been approved!', 'UNREAD', 'app-3', 'franchise-3', null, 'HIGH', CURRENT_TIMESTAMP),
('notif-2', 'demo-partner-user', 'PAYMENT_REQUEST', 'Payment Request Received', 'You have received a payment request for ₹50,000 for Chaayos franchise setup fee.', 'UNREAD', 'app-1', 'franchise-1', 'pr-1', 'MEDIUM', CURRENT_TIMESTAMP),
('notif-3', 'demo-business-user', 'APPLICATION_UPDATE', 'New Application Received', 'You have received a new franchise application for Chaayos.', 'UNREAD', 'app-1', 'franchise-1', null, 'MEDIUM', CURRENT_TIMESTAMP);

-- Note: Initial investment ranges will be set via embedded objects in the entity
