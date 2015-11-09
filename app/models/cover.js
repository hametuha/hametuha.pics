var mongoose = require('mongoose');

var CoverSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subTitle: String,
    author: String,
    user: Number,
    type: String,
    size: {
        height: {
            type: Number,
            default: 1920,
            min: 1
        },
        width: {
            type: Number,
            default: 1200,
            min: 1
        }
    },
    created: Date,
    updated: Date
});


// Hook before saving
CoverSchema.pre('save', function (next, done) {
    this.updated = new Date();
    next();
});

// Register model
var Cover = mongoose.model('Cover', CoverSchema);

module.exports = Cover;
