const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true
        },
        email: {
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
        courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course"
            }
        ],
    },
    { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
