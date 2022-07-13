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

// TODO: confirmation e-mail szépítése, beégetett paraméterek kivétele
module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
    transport.sendMail({
        from: user,
        to: email,
        subject: "Évgyűrű regisztráció megerősítés",
        html: `<h2>Szia ${name}!</h2>
        <p>Az Évgyűrű Alapítvány honlapján a regisztrációdat erre a linkre keresztül tudod véglegesíteni: </p>
        <a href=http://www.evgyuru.hu/auth/confirm/${confirmationCode}> Kattins ide!</a>
        </div>`,
    });
};
