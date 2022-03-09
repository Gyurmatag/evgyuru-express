const express = require('express');
const dotEnv = require('dotenv')
const bodyParser = require('body-parser');
const cors = require("cors");

dotEnv.config();
const config = require('./config')

const projectRoutes = require('./routes/projects');
const courseRoutes = require('./routes/courses');
const authRoutes = require('./routes/auth');

const index = express();

const corsOptions = {
    origin: "http://localhost:8081"
};

index.use(bodyParser.json());

index.use(cors(corsOptions));

index.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept');
    next();
});

index.use('/project', projectRoutes);
index.use('/course', courseRoutes);
index.use('/auth', authRoutes);

index.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

const db = require("./models");
const Role = db.role;

db.mongoose
    .connect(
        config.MONGODB_URI
    )
    .then(_ => {
        console.log("App started")
        initial();
        index.listen(config.PORT);
    })
    .catch(err => console.log(err));

function initial() {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("Added 'user' to roles collection.");
            });

            new Role({
                name: "moderator"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("Added 'moderator' to roles collection.");
            });

            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("Added 'admin' to roles collection.");
            });
        }
    });
}
