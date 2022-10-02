const mongoose = require('mongoose');
const { Schema } = mongoose;

//creating a reset password user collection
const Feedbacks = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    difficulty: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    experience: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    play_more: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    overall_experience: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    suggestion: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Feedback = mongoose.model('feedback', Feedbacks);
module.exports = Feedback;