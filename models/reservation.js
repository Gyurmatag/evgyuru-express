const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reservationSchema = new Schema(
    {
        course: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        children: [{
            type: Schema.Types.ObjectId,
            ref: 'Child',
            required: true
        }],
        activationKey: {
            type: String,
        },
        isActivated: {
            type: Boolean,
            required: true,
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model('Reservation', reservationSchema)
