const mongoose = require('mongoose');
const { Schema } = mongoose;

//creating a challenges category collection
const Category = new Schema({
    name: {
        type: String,
        required: [true, "Challenge Name Is Required"],
        unique: true,
        lowercase: true
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

const ChallengeCategory = mongoose.model('ChallengeCategory', Category);
module.exports = ChallengeCategory;