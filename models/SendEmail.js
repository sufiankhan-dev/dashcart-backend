// sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
  // Configure your email provider
  let transporter = nodemailer.createTransport({
    service: "Gmail", // Use your email provider here (e.g., Gmail, Mailgun)
    auth: {
      user: process.env.EMAIL, // Your email
      pass: process.env.PASSWORD, // Your email password
    },
  });

  // Set email content
  let mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "OTP for Account Verification",
    text: `Your OTP code is: ${otp}`,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP sent successfully");
  } catch (error) {
    console.error("Error sending OTP: ", error);
  }
};

module.exports = sendEmail;
