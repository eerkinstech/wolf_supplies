const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  // Permissions: array of page IDs that this role can access
  // e.g., ['dashboard', 'products', 'inventory', 'categories', etc.]
  permissions: {
    type: [String],
    default: []
  },
  isSystem: {
    type: Boolean,
    default: false // System roles like 'admin' and 'user' cannot be deleted
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;
