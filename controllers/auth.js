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
        zipCode: req.body.zipCode,
        city: req.body.city,
        streetAddress: req.body.streetAddress,
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
        if (!user.isNotRegisteredOnlyForCourseApply) {
            // TODO: kiszervezni, szépíteni, email designolása
            const emailHtml = `<h2>Szia ${user.fullName}!</h2>
            <p>Az Évgyűrű Alapítvány honlapján a regisztrációdat ezen a linken keresztül tudod véglegesíteni: </p>
            <a href=https://www.evgyuru.hu/auth/confirm/${user.activationKey}> Kattins ide!</a>
            </div>`
            await sendConfirmationEmail(user.fullName, user.email, 'Évgyűrű regisztráció megerősítés', emailHtml)
        }
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
        throw new CustomError('error.api.invalidPassword', 401)
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
        zipCode: user.zipCode,
        city: user.city,
        streetAddress: user.streetAddress,
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
    const user = await findUserById(req.query.userId )
    const role = await Role.findOne({ name: req.body.roleName } )

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

exports.claimPasswordResetKey =  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email, isNotRegisteredOnlyForCourseApply: false })
    if (!user) {
        throw new CustomError('error.api.invalidOrUsedPasswordResetKey', 404)
    }
    user.passwordResetKey = jwt.sign({ email: user.email }, config.AUTH_SECRET)
    await user.save()
    // TODO: kiszervezni, szépíteni, email designolása
    const emailHtml = `<h2>Szia ${user.fullName}!</h2>
    <p>Az Évgyűrű Alapítvány honlapján a regisztrációdhoz tartozó jelszó visszaállítát ezen a linken keresztül tudod véglegesíteni: </p>
    <a href=https://www.evgyuru.hu/auth/password-reset/${user.passwordResetKey}> Kattins ide!</a>
    </div>`
    await sendConfirmationEmail(user.fullName, user.email, 'Évgyűrű jelszó visszaállítása', emailHtml)
    res.status(200).json({ message: 'success.api.passwordResetKeySent' })
})

exports.isPasswordResetKeyValid =  asyncHandler(async (req, res) => {
    const user = await User.findOne({ passwordResetKey: req.params.passwordResetKey, isNotRegisteredOnlyForCourseApply: false })
    if (!user) {
        throw new CustomError('error.api.userNotFoundWithThisPasswordResetKey', 404)
    }
    res.status(200).json({ message: 'success.api.passwordResetKeyIsValid' })
})

exports.passwordReset =  asyncHandler(async (req, res) => {
    const user = await User.findOne({ passwordResetKey: req.params.passwordResetKey, isNotRegisteredOnlyForCourseApply: false })
    if (!user) {
        throw new CustomError('error.api.userNotFoundWithThisPasswordResetKey', 404)
    }
    user.password = bcrypt.hashSync(req.body.password, 8)
    user.passwordResetKey = ''
    await user.save()
    res.status(200).json({ message: 'success.api.passwordChangedSuccessfully' })
})

exports.activateUser =  asyncHandler(async (req, res) => {
    const user = await User.findOne({ activationKey: req.params.activationKey })
    if (!user) {
        throw new CustomError('User not found with this activation key!', 404)
    }
    user.isActivated = true
    await user.save()
    res.status(200).json({ message: 'User was activated successfully!' })
})

//TODO: itt lehet majd otpimalizálni, hogy csak azt updateljem amit kell??
exports.editMyAccount = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, req.body);
    res.status(200).json({ message: 'success.api.accountUpdatedSuccessFully' })
})

exports.deleteMyAccount = asyncHandler(async (req, res) => {
    await User.findByIdAndRemove(req.user._id);
    res.status(200).json({ message: 'Your account was deleted successfully!' })
})

const findUserById = async (userId) => {
    const user = await User.findById(projectId)
    if (!user) {
        throw new CustomError('Could not find user.', 404)
    }
    return user
}
