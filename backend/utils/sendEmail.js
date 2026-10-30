require("dotenv").config();

const nodemailer = require("nodemailer");

const sendTrainerEmail = async (email, name, password) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,

      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"BR Academy" <${process.env.MAIL_FROM}>`,
      to: email,
      subject: "BR Academy - Trainer Login Details",

      html: `
        <h2>Welcome to BR Academy</h2>

        <p>Hello <b>${name}</b>,</p>

        <p>Your trainer account has been created.</p>

        <h3>Login Details</h3>

        <p><b>Email:</b> ${email}</p>
        <p><b>Password:</b> ${password}</p>

        <p>
          Please use these credentials to login to the
          Trainer Portal.
        </p>

        <br>

        <p>Regards,</p>
        <p><b>BR Academy</b></p>
      `,
    });

    console.log("Trainer email sent successfully");

    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};

module.exports = sendTrainerEmail;
