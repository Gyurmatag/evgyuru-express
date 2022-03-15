const mongoose = require('mongoose')

const db = {
    mongoose,

    user: require('./user'),
    role: require('./role'),
    project: require('./project'),
    course: require('./course'),
    reservation: require('./reservation'),

    ROLES: ['user', 'moderator', 'admin']
}

module.exports = db
