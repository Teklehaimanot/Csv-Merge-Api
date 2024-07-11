const nodemailer = require("nodemailer");

const emailHandler = async (req, res) => {
  try {
    console.log(req.body);

    const { name, email, message } = req.body.formData;
    const transporter = nodemailer.createTransport({
      service: "gmail", // use your email service
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your email password or app-specific password
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER, // your email
      subject: `New message from ${name} and His/Her email is ${email}`,
      text: message,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Message sent: %s", info.messageId);
    });
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
};

module.exports = {
  emailHandler,
};
