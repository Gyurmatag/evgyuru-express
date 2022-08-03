const nodemailer = require("nodemailer");
const Email = require('email-templates');
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

const email = new Email({
    message: {
        from: "Évgyűrű Alapítvány <info@evgyuru.hu>",
    },
    send: true,
    transport,
});

// TODO: paraméterek refaktorálása (túl sok paraméter - objetumba szervezés)
// TODO: nyelvesítések bevezetése
module.exports.sendEmail = (to, subject, template, variables, headers = null, icalEvent = null) => {
    email.send({
        template,
        message: {
            to,
            subject,
            icalEvent,
            headers,
        },
        locals: variables,
    });
};
