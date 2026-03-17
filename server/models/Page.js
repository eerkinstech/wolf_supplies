const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        description: {
            type: String,
            default: ''
        },
        content: {
            type: String,
            default: ''
        },
        metaTitle: {
            type: String,
            default: ''
        },
        metaDescription: {
            type: String,
            default: ''
        },
        metaKeywords: {
            type: String,
            default: ''
        },
        isPublished: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Page', pageSchema);

