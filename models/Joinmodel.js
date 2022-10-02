const dotenv = require('dotenv');
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '../config.env') });
const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator');
const bcrypt = require('bcryptjs');

const JoinSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username Is Required"],
        trim: true,
        unique: [true, "Username Is Already Registered"],
        lowercase: true,
        minlength: [3, "Username Can't Be Shorter Than 3 charaters"],
        maxlength: [20, "Username Can't Be Longer Than 20 charaters"],
        validate(value) {
            validator.escape(value);
            if (value.includes("$") || value.includes("^") || value.includes("\\") || value.includes("/")) {
                throw new Error(
                    "Username Contain Bad Charaters"
                );
            }
        },
    },
    email: {
        type: String,
        trim: true,
        required: [true, "Email Is Required"],
        unique: [true, "Email Is Already Registered"],
        lowercase: true,
        minlength: [6, "Email Can't Be Shorter Than 6 charaters"],
        maxlength: [64, "Email Can't Be Longer Than 64 charaters"],
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error(
                    "Email Is Not Correct"
                );
            }
        },
    },
    password: {
        type: String,
        required: [true, "Password Is Required"],
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error(
                    "Password Is Not Strong"
                );
            }
        },
    },
    date: {
        type: Date,
        default: Date.now,
    },
    verified: {
        type: Boolean,
        default: false
    },
    approved: {
        type: Boolean,
        default: true
    },
    points: {
        type: Number,
        default: "0"
    },
    last_solve_date: {
        type: Date,
        default: null,
    }
});

// hashing the password with salt and pepper
JoinSchema.pre('save', async function (next) {
    const pass = this.password + process.env.PEPPER.toString();
    const salt = await bcrypt.genSalt(10);
    const strong_pass = await bcrypt.hash(pass, salt);
    this.password = strong_pass;
    next();
});

const User = mongoose.model('Users', JoinSchema);
User.createIndexes();
module.exports = User;