/**
 * Authentication Routes
 * Handles login, logout, and user info
 */

const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * POST /api/auth/login
 * User login
 */
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const result = await authService.login(username, password);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticate, (req, res) => {
    res.json({
        success: true,
        data: req.user
    });
});

/**
 * POST /api/auth/register
 * User registration with auto-login
 */
router.post('/register', async (req, res, next) => {
    try {
        const { username, password, role, full_name, email, phone } = req.body;

        if (!username || !password || !role || !full_name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Username, password, role, full_name, and email are required'
            });
        }

        if (!['student', 'driver', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be student, driver, or admin.'
            });
        }

        // Register new user
        await authService.register({ username, password, role, full_name, email, phone });

        // Auto-login after registration
        const result = await authService.login(username, password);

        res.json({
            success: true,
            data: result,
            message: 'Account created and logged in successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /api/auth/logout
 * User logout (client-side token removal)
 */
router.post('/logout', authenticate, (req, res) => {
    // JWT is stateless, so logout is handled client-side
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});


module.exports = router;
