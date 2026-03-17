const mongoose = require('mongoose');

const querySubmissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        trim: true
    },
    queryType: {
        type: String,
        enum: ['product_inquiry', 'shipping', 'returns', 'payment', 'technical', 'other'],
        default: 'other',
        required: [true, 'Query type is required']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minlength: [10, 'Description must be at least 10 characters long']
    },
    orderNumber: {
        type: String,
        trim: true
    },
    attachments: [String], // File URLs
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    responses: [{
        responder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        message: String,
        attachments: [String],
        createdAt: { type: Date, default: Date.now }
    }],
    ipAddress: String,
    userAgent: String,
}, { timestamps: true });

// Index for searching
querySubmissionSchema.index({ email: 1, status: 1 });
querySubmissionSchema.index({ queryType: 1 });
querySubmissionSchema.index({ priority: 1, status: 1 });
querySubmissionSchema.index({ createdAt: -1 });

const QuerySubmission = mongoose.model('QuerySubmission', querySubmissionSchema);
module.exports = QuerySubmission;

