const mongoose = require('mongoose');
const { Schema } = mongoose;

//creating a challenges collection
const Solves = new Schema({
    userId: {
        type: String,
        required: [true, "UserID Is Required"],
        trim: true
    },
    username: {
        type: String,
        required: [true, "Username Is Required"],
        lowercase: true,
        trim: true
    },
    challenge_name: {
        type: String,
        required: [true, "Challenge Name Is Required"],
        lowercase: true,
        trim: true
    },
    challenge_category: {
        type: String,
        required: [true, "Challenge Category Is Required"],
        lowercase: true,
        trim: true
    },
    points: {
        type: Number,
        required: [true, "Challenge points Is Required"],
        trim: true
    },
    flag: {
        type: String,
        required: [true, "Challenge Flag Is Required"],
        trim: true
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

const Solve = mongoose.model('solves', Solves);
module.exports = Solve;