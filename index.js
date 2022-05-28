const express = require('express')
const dotEnv = require('dotenv')
const bodyParser = require('body-parser')
const cors = require("cors")

dotEnv.config()
const config = require('./config')

const projectRoutes = require('./routes/projects')
const courseRoutes = require('./routes/courses')
const authRoutes = require('./routes/auth')
const reservationRoutes = require('./routes/reservation')
const externalRoutes = require('./routes/external')

const index = express()

const corsOptions = {
    origin: config.FRONTEND_CORS_ORIGIN
}

index.use(bodyParser.json({ limit: '50mb' }))

index.use(cors(corsOptions))

index.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    )
    res.setHeader('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept')
    next()
})

index.use('/project', projectRoutes)
index.use('/course', courseRoutes)
index.use('/auth', authRoutes)
index.use('/reservation', reservationRoutes)
index.use('/external', externalRoutes)

index.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500
    const message = error.message
    const data = error.data
    res.status(status).json({ message, data })
})

const db = require("./models")
const asyncHandler = require("express-async-handler")
const Role = db.role

db.mongoose
    .connect(
        config.MONGODB_URI
    )
    .then(_ => {
        console.log("App started")
        initial()
        index.listen(config.PORT)
    })
    .catch(err => console.log(err))

// TODO: tesztelni, hogy működik-e
const initial = asyncHandler(async () => {
    const rolesLength = db.ROLES.length
    const dbRolesLength = await Role.find().countDocuments()

    if (rolesLength !== dbRolesLength) {
        await new Role({ name: 'user' }).save()
        await new Role({ name: 'moderator' }).save()
        await new Role({ name: 'admin' }).save()
    }
})
