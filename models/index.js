const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user");
db.role = require("./role");
db.project = require("./project");
db.course = require("./course");

db.ROLES = ["user", "moderator", "admin"];

module.exports = db;
