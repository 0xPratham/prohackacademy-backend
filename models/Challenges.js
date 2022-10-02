const mongoose = require('mongoose');
const { Schema } = mongoose;

//creating a challenges collection
const Challenges = new Schema({
    challenge_name: {
        type: String,
        required: [true, "Challenge Name Is Required"],
        unique: true,
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
    difficulty: {
        type: String,
        required: [true, "Challenge difficulty Is Required"],
        trim: true,
        lowercase: true
    },
    first_solve: {
        type: String,
        lowercase: true,
        trim: true,
        default: null
    },
    description: {
        type: String,
        required: [true, "Challenge Description Is Required"],
    },
    download_link: {
        type: String,
        trim: true,
        default: null
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

const Challenge = mongoose.model('Challenges', Challenges);
module.exports = Challenge;
