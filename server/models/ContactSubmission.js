const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ['user', 'admin'],
        required: true
    },
    senderName: {
        type: String,
        required: true,
        trim: true
    },
    senderEmail: {
        type: String,
        required: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    senderPhone: {
        type: String,
        trim: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    subject: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        minlength: [1, 'Message cannot be empty']
    },
    isRead: {
        type: Boolean,
        default: false
    },
    ipAddress: String,
    userAgent: String,
}, { timestamps: true });

const contactSubmissionSchema = new mongoose.Schema({
    // Conversation metadata
    conversationId: {
        type: String,
        unique: true,
        sparse: true,
        default: () => new mongoose.Types.ObjectId().toString()
    },
    userEmail: {
        type: String,
        required: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    userName: {
        type: String,
        trim: true
    },
    userPhone: {
        type: String,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Chat history - array of messages
    messages: [messageSchema],
    // Conversation status
    status: {
        type: String,
        enum: ['active', 'closed', 'archived'],
        default: 'active'
    },
    // Last message info
    lastMessage: String,
    lastMessageAt: Date,
    lastMessageSender: {
        type: String,
        enum: ['user', 'admin']
    },
    // Admin assignment
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Metadata
    messageCount: {
        type: Number,
        default: 0
    },
    unreadCount: {
        type: Number,
        default: 0
    },
    movedToChat: {
        type: Boolean,
        default: false
    },
    movedToChatAt: Date,
    fromContactForm: {
        type: Boolean,
        default: true
    },
    ipAddress: String,
    userAgent: String,
}, { timestamps: true });

// Indexes for efficient querying
contactSubmissionSchema.index({ userEmail: 1, createdAt: -1 });
contactSubmissionSchema.index({ status: 1, lastMessageAt: -1 });
contactSubmissionSchema.index({ assignedTo: 1, status: 1 });
contactSubmissionSchema.index({ createdAt: -1 });

const ContactSubmission = mongoose.model('ContactSubmission', contactSubmissionSchema);
module.exports = ContactSubmission;

