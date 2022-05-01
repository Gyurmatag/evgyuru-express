const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reservationSchema = new Schema(
    {
        childName: {
            type: String,
        },
        course: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model('Reservation', reservationSchema)
