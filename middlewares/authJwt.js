const jwt = require("jsonwebtoken");
const config = require("../config");
const db = require("../models");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }
    jwt.verify(token, config.AUTH_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized!" });
        }
        req.userId = decoded.id;
        next();
    });
};
isAdmin = (req, res, next) => hasSpecificRole(req, res, next,"admin")
isModerator = (req, res, next) => hasSpecificRole(req, res, next,"moderator")

const hasSpecificRole = (req, res, next, roleName) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === roleName) {
                        next();
                        return;
                    }
                }
                res.status(403).send({ message: `Require ${roleName} Role!` });
            }
        );
    });
};

const authJwt = {
    verifyToken,
    isAdmin,
    isModerator
};
module.exports = authJwt;
