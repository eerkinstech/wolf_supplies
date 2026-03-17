const User = require('../models/User.js');
const Cart = require('../models/Cart.js');
const Wishlist = require('../models/Wishlist.js');
const generateToken = require('../utils/generateToken.js');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user - pre-save hook will automatically hash password
    const user = await User.create({ name, email, password, phone });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || null,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Registration failed' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(401).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email }).populate('customRole');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      role: user.role,
      customRole: user.customRole || null,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').populate('customRole');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Get all admin employees
// @route   GET /api/users/employees
// @access  Private/Admin
const getAdminEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'admin' })
      .select('-password')
      .populate('customRole', 'name permissions')
      .sort({ createdAt: -1 });
    res.json({ employees });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get employee by ID
// @route   GET /api/users/employees/:id
// @access  Private/Admin
const getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)
      .select('-password')
      .populate('customRole', 'name permissions');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create admin employee
// @route   POST /api/users/employees
// @access  Private/Admin
const createAdminEmployee = async (req, res) => {
  try {
    const { name, email, password, plainPassword, phone, customRole } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create admin employee
    const employee = await User.create({
      name,
      email,
      password,
      plainPassword: plainPassword || password, // Store plain password
      phone: phone || '',
      role: 'admin', // Set as admin
      customRole: customRole || null, // Assign custom role if provided
    });

    // Populate customRole if assigned
    await employee.populate('customRole', 'name permissions');

    res.status(201).json({
      message: 'Employee created successfully',
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        plainPassword: employee.plainPassword,
        role: employee.role,
        customRole: employee.customRole,
        createdAt: employee.createdAt,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to create employee' });
  }
};

// @desc    Update admin employee
// @route   PUT /api/users/employees/:id
// @access  Private/Admin
const updateAdminEmployee = async (req, res) => {
  try {
    const { name, email, phone, customRole, password, plainPassword } = req.body;
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Prevent admin from modifying their own role
    if (employee._id.toString() === req.user._id.toString() && customRole) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    // Update fields
    if (name) employee.name = name;
    if (email) {
      // Check if new email is already in use by another user
      const emailExists = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      employee.email = email;
    }
    if (phone !== undefined) employee.phone = phone;
    if (customRole !== undefined) employee.customRole = customRole || null;
    
    // Update password if provided (will be auto-hashed by User model's pre-save hook)
    if (password && password.trim()) {
      employee.password = password;
      // Also update plainPassword with the new password
      if (plainPassword) {
        employee.plainPassword = plainPassword;
      } else {
        employee.plainPassword = password;
      }
    }

    const updatedEmployee = await employee.save();
    await updatedEmployee.populate('customRole', 'name permissions');

    res.json({
      message: 'Employee updated successfully',
      employee: {
        _id: updatedEmployee._id,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        phone: updatedEmployee.phone,
        plainPassword: updatedEmployee.plainPassword,
        role: updatedEmployee.role,
        customRole: updatedEmployee.customRole,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to update employee' });
  }
};

// @desc    Delete admin employee
// @route   DELETE /api/users/employees/:id
// @access  Private/Admin
const deleteAdminEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Prevent deleting yourself
    if (employee._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Delete user's cart and wishlist
    await Cart.deleteMany({ userId: req.params.id });
    await Wishlist.deleteMany({ userId: req.params.id });

    // Delete the employee
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete employee' });
  }
};

module.exports = { 
  registerUser, 
  authUser, 
  getUserProfile, 
  updateUserProfile,
  getAdminEmployees,
  getEmployeeById,
  createAdminEmployee,
  updateAdminEmployee,
  deleteAdminEmployee,
};

