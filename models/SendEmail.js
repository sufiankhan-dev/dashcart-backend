// sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail", 
    auth: {
      user: process.env.EMAIL, 
      pass: process.env.PASSWORD, 
    },
  });

  // Set email content
  let mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "OTP for Account Verification",
    text: `Your OTP code is: ${otp}`,
  };


  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP sent successfully");
  } catch (error) {
    console.error("Error sending OTP: ", error);
  }
};

module.exports = sendEmail;
