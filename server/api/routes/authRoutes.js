const express = require('express');
const {
  authUser,
  getUserProfile,
  updateUserProfile,
  getAdminEmployees,
  getEmployeeById,
  createAdminEmployee,
  updateAdminEmployee,
  deleteAdminEmployee,
} = require('../controllers/authController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Only admin login is available (users login through admin login endpoint)
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Employee management routes (admin only)
router.get('/employees', protect, admin, getAdminEmployees);
router.get('/employees/:id', protect, admin, getEmployeeById);
router.post('/employees', protect, admin, createAdminEmployee);
router.put('/employees/:id', protect, admin, updateAdminEmployee);
router.delete('/employees/:id', protect, admin, deleteAdminEmployee);

module.exports = router;