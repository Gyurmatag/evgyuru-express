const mongoose = require('mongoose')
const Schema = mongoose.Schema

const courseSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        // TODO: ezt majd későbbiekben át lehetne alakítani koordinátákra, maps integrációval?
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
        dateFrom: {
            type: Date,
            required: true
        },
        dateTo: {
            type: Date,
            required: true
        },
        maxGroupSize: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        occasions: {
            type: Number,
            required: true
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        reservations: [{
            type: Schema.Types.ObjectId,
            ref: 'Reservation',
            required: true
        }]
    },
    { timestamps: true }
)

module.exports = mongoose.model('Course', courseSchema)
