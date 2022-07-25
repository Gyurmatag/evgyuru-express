const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const config = require("../config")
const db = require("../models")
const CustomError = require("../utils/CustomError")
const { sendConfirmationEmail } = require("../utils/nodemailer");
const User = db.user
const Role = db.role

exports.signup =  asyncHandler(async (req, res) => {
    const role = await Role.findOne({ name: 'user' } )
    const onlyForCourseApplyUser = req.user
    const userDoc = {
        email: req.body.email,
        fullName: req.body.fullName,
        telephoneNumber: req.body.telephoneNumber,
        address: req.body.address,
        password: req.body.password ? bcrypt.hashSync(req.body.password, 8): null,
        acceptNewsletter: req.body.acceptNewsletter,
        activationKey: jwt.sign({ email: req.body.email }, config.AUTH_SECRET),
        isNotRegisteredOnlyForCourseApply: req.body.isNotRegisteredOnlyForCourseApply,
        roles: [role._id]
    }
    const user = new User(userDoc)
    if (onlyForCourseApplyUser) {
        await User.updateOne({ email: req.user.email }, userDoc)
    } else {
        await user.save()
        // TODO: kiszervezni, szépíteni, email designolása
        const emailHtml = `<h2>Szia ${user.fullName}!</h2>
        <p>Az Évgyűrű Alapítvány honlapján a regisztrációdat erre a linkre keresztül tudod véglegesíteni: </p>
        <a href=http://www.evgyuru.hu/auth/confirm/${user.activationKey}> Kattins ide!</a>
        </div>`
        await sendConfirmationEmail(user.fullName, user.email, 'Évgyűrű regisztráció megerősítés', emailHtml)
    }

    res.status(201).json({ message: 'User was registered successfully!' })
})

exports.signin = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).populate(['roles', 'reservations'])

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

    const token = jwt.sign({_id: user.id}, config.AUTH_SECRET, {
        expiresIn: config.ACCESS_TOKEN_EXPIRE_TIME_IN_MS
    })
    const authorities = []
    for (const role of user.roles) {
        authorities.push("ROLE_" + role.name.toUpperCase())
    }

    res.status(200).json({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        telephoneNumber: user.telephoneNumber,
        address: user.address,
        reservations: user.reservations,
        roles: authorities,
        isActivated: user.isActivated,
        accessToken: token,
        accessTokenExpireTimeInMs: config.ACCESS_TOKEN_EXPIRE_TIME_IN_MS,
    })
})

exports.isEmailAlreadyRegistered = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.query.email, isNotRegisteredOnlyForCourseApply: false })
    let isEmailAlreadyRegistered = false

    if (user) {
        isEmailAlreadyRegistered = true
    }

    res.status(200).json({
        isEmailAlreadyRegistered
    })
})

exports.assignRoleToUser =  asyncHandler(async (req, res) => {
    const user = await User.findOne({ name: req.query.userId } )
    const role = await Role.findOne({ name: req.body.roleName } )

    if (!user) {
        throw new CustomError('User not Found.', 404)
    }

    if (!role) {
        throw new CustomError('Role not Found.', 404)
    }

    for (const userRole of user.roles) {
        if (userRole.name === role.name) {
            throw new CustomError(`${role.name} Role is already assigned to ${user.email}!`, 409)
        }
    }

    user.roles.push(role)
    await user.save()
    res.status(201).json({ message: 'User role was successfully added!' })
})

exports.activateUser =  asyncHandler(async (req, res) => {
    const user = await User.findOne({ activationKey: req.params.activationKey })
    if (!user) {
        throw new CustomError('User not found with this activation key!', 404)
    }
    user.isActivated = true
    user.activationKey = ''
    await user.save()
    res.status(200).json({ message: 'User was activated successfully!' })
})

exports.deleteMyAccount = asyncHandler(async (req, res) => {
    await User.findByIdAndRemove(req.user._id);
    res.status(200).json({ message: 'Your account was deleted successfully!' })
})
