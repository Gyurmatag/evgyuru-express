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
        address: {
            type: String,
            required: true
        },
        password: {
            type: String
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
