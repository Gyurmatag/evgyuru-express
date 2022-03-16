const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const config = require("../config")
const db = require("../models")
const CustomError = require("../utils/CustomError")
const User = db.user
const Role = db.role

exports.signup =  asyncHandler(async (req, res) => {
    const role = await Role.findOne({ name: 'user' } )
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        roles: [role._id]
    })
    await user.save()
    res.status(201).json({ message: 'User was registered successfully!' })
})

exports.signin = asyncHandler(async (req, res) => {
    const user = await User.findOne({ username: req.body.username }).populate('roles')

    if (!user) {
        throw new CustomError('User not Found.', 404)
    }

    const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
    )
    if (!passwordIsValid) {
        throw new CustomError('Invalid password.', 401)
    }

    const token = jwt.sign({id: user.id}, config.AUTH_SECRET, {
        expiresIn: 86400 // 24 hours
    })
    const authorities = []
    for (const role of user.roles) {
        authorities.push("ROLE_" + role.name.toUpperCase())
    }

    res.status(200).json({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        accessToken: token
    })
})

exports.isEmailAlreadyRegistered = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.query.email })
    let isEmailAlreadyRegistered = false

    if (user) {
        isEmailAlreadyRegistered = true
    }

    res.status(200).json({
        isEmailAlreadyRegistered
    })
})
