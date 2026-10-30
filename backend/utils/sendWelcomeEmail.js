const transporter = require("../config/mail");

const sendWelcomeEmail = async ({
  studentName,
  email,
  password,
  courseName,
}) => {
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: email,

    subject: "Welcome to BNR Academy - Your Login Details",

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">

        <h2 style="color: #2c3e50;">
          Welcome to BNR Academy
        </h2>

        <p>
          Dear <strong>${studentName}</strong>,
        </p>

        <p>
          Welcome to BNR Academy!
        </p>

        <p>
          Your student account has been successfully created.
        </p>

        <h3>Login Details</h3>

        <div style="
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        ">

          <p>
            <strong>Email:</strong> ${email}
          </p>

          <p>
            <strong>Password:</strong> ${password}
          </p>

          <p>
            <strong>Course:</strong> ${courseName}
          </p>

        </div>

        <p>
          You can use these credentials to login to the BNR Academy LMS.
        </p>

        <p>
          Please keep your login credentials safe.
        </p>
        <p>Happy learning buddy</P>

        <br>

        <p>
          Regards,<br>
          <strong>BNR Academy</strong>
        </p>

      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendWelcomeEmail;