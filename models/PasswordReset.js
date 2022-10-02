const mongoose = require('mongoose');
const { Schema } = mongoose;

//creating a reset password user collection
const PasswordResetSchema = new Schema({
    userId: String,
    resetString: String,
    createdAt: Date,
    expiresAt: Date
});

const PasswordReset = mongoose.model('PasswordReset', PasswordResetSchema);
module.exports = PasswordReset;