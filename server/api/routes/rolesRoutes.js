const express = require('express');
const router = express.Router();
const {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAvailablePermissions,
  assignRoleToUser,
  removeRoleFromUser,
} = require('../controllers/rolesController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// All routes require authentication and admin access
router.use(protect, admin);

// Get all available permissions
router.get('/permissions', getAvailablePermissions);

// CRUD operations for roles
router.get('/', getRoles);
router.get('/:id', getRoleById);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

// User role assignment
router.post('/assign-to-user', assignRoleToUser);
router.post('/remove-from-user', removeRoleFromUser);

module.exports = router;
