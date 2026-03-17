const express = require('express');
const {
  getAllPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy
} = require('../controllers/policyController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Get all policies (public - for menu selector)
router.get('/', getAllPolicies);

// Get single policy (public)
router.get('/:slug', getPolicy);

// Create policy (admin)
router.post('/', protect, admin, createPolicy);

// Update policy (admin)
router.put('/:id', protect, admin, updatePolicy);
router.patch('/:id', protect, admin, updatePolicy);

// Delete policy (admin)
router.delete('/:id', protect, admin, deletePolicy);

module.exports = router;

