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
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model('Course', courseSchema)
