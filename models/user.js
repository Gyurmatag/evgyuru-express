const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
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
