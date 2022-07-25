const nodemailer = require("nodemailer");
const config = require("../config")

const host = config.EMAIL_HOST;
const port = config.EMAIL_PORT;
const user = config.EMAIL_USER;
const pass = config.EMAIL_PASSWORD;

const transport = nodemailer.createTransport({
    host,
    port,
    secure: true,
    auth: {
        user,
        pass,
    },
});

module.exports.sendConfirmationEmail = (name, email, subject, html) => {
    transport.sendMail({
        from: user,
        to: email,
        subject,
        html,
    });
};
