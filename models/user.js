const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true
        },
        fullName: {
            type: String,
            required: true
        },
        telephoneNumber: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        streetAddress: {
            type: String,
            required: true
        },
        password: {
            type: String
        },
        passwordResetKey: {
            type: String,
        },
        acceptNewsletter: {
            type: Boolean,
        },
        activationKey: {
            type: String,
            unique: true,
        },
        isActivated: {
            type: Boolean,
            default: false,
        },
        isNotRegisteredOnlyForCourseApply: {
            type: Boolean,
            default: false,
        },
        roles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Role"
            }
        ],
        reservations: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Reservation"
            }
        ],
    },
    { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
