const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    nic: {
        type: String,
        required: true
    },
    gender: {
        type:String,
        required:true
    },
    email: {
        type: String,
        required:true
    },
    passwordHash: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    addressline1: {
        type: String,
        default: ''
    },
    addressline2: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    province: {
        type: String,
        required: true
    },
    profilePhoto: {
        type: String,
        required: true
    }
})

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;