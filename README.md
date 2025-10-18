Edited by Christian :

SITES User Management Database

Date: October 16 20225

Overview

This project sets up a MySQL database for the SITES Admin Dashboard, which allows administrators to manage users, including adding, editing, deleting, and assigning roles. The database structure is designed for secure storage of user credentials and role-based access control.

Database Name

sites_db


-- Create database if not exists
CREATE DATABASE IF NOT EXISTS sites_db;
USE sites_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('Admin', 'Leader', 'Member') NOT NULL
);

-- Example inserts
INSERT INTO users (username, password, name, role)
VALUES 
('admin1', '$2y$...', 'Admin User', 'Admin'),
('leader1', '$2y$...', 'Leader User', 'Leader'),
('member1', '$2y$...', 'Member User', 'Member');



Notes:

Passwords should always be stored in hashed format for security.

Roles are restricted to Admin, Leader, or Member to enforce access levels.

This schema is suitable for integration with PHP-based admin dashboards.


New Features Added:
User Management

Add new users with username, name, password, and role.

Edit existing users, including role updates and password changes.

Delete users safely with confirmation.

Role-Based Access

Roles: Admin, Leader, Member.

Only Admins can access the dashboard and manage users.

Security

Passwords stored as hashed values using password_hash() in PHP.

Session-based login required for access.

Alerts & Notifications

JavaScript alert messages for:

User added successfully.

User deleted successfully.

Alerts are shown only once and disappear after refresh using history.replaceState().

Frontend Table

Users are displayed in a table with options to:

Edit user details.

Delete a user.

Passwords are masked in the table for security.

Dashboard Features

Logout button redirects to login.html.

Confirmation prompts before deleting a user.

Fornt end for leaders done

Seamless update and delete operations with visual feedback.

Adding features for all features in admin

------------------------------------------------------------------------
