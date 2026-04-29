const express = require("express");
const UserModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGen = require("otp-generator");
const OtpModel = require("../models/otp.model");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2

cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key:process.env.CLOUD_KEY,
  api_secret:process.env.CLOUD_SECRET
})

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_MAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const addUserToDB = async (req, res) => {
  const { firstName, lastName, email, password, gender, profileImage } = req.body;
  try {
    console.log(req.body);
    const saltRound = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltRound);
     
    const image = await cloudinary.uploader.upload(profileImage)
  

    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      gender,
      profileImage:{
        public_id:image.public_id,
        secure_url:image.secure_url
      }
    });

    const token = await jwt.sign({ id: user._id }, process.env.APP_TOKEN, {
      expiresIn: "5h",
    });

    res.status(201).send({
      message: "User created successfully",
      data: {
        firstName,
        lastName,
        email,
        gender: gender ? gender : null,
        token,
      },
    });

    let mailOptions = {
      from: process.env.APP_MAIL,
      bcc: [
        email,
        "adegoketemiloluwa3@gmail.com",
        "idris2xaderemi@gmail.com",
        "wumifunmiadeniji@gmail.com",
        "halimahfasakin@gmail.com",
        "abubakriluqman7@gmail.com",
        "tobilobaa_18@outlook.com",
      ],
      subject: `Welcome to HimerTicks, ${firstName}`,
      // text: 'That was easy!'
      html: `
      
      
        <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Document</title>
              <style>
                  .greet{
                      color: blue;
                  }
              </style>
          </head>
          <body>
              <h1>Welcome to HimerTicks</h1>
              <p class="greet">Welcome ${firstName + " " + lastName}</p>
          </body>
          </html>
      `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.log(error);
    if (error.code == "11000") {
      res.status(400).send({
        message: "User already exists",
      });

      return;
    }

    res.status(400).send({
      message: "user failed to create",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  try {
    const isUser = await UserModel.findOne({ email });
    if (!isUser) {
      res.status(400).send({
        message: "Invalid credentials",
      });

      return;
    }

    const isMatch = await bcrypt.compare(password, isUser.password);

    if (!isMatch) {
      res.status(400).json({
        message: "Invalid credentials",
      });

      return;
    }

    const token = await jwt.sign({ id: isUser._id }, process.env.APP_TOKEN, {
      expiresIn: "5h",
    });
    res.status(200).json({
      message: "user logged in successfully",
      data: {
        firstName: isUser.firstName,
        lastName: isUser.lastName,
        email,
        token,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(400).send({
      message: "Invalid credentials",
    });

    return;
  }
};

const requestOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const isUser = await UserModel.findOne({ email });

    if (!isUser) {
      res.status(404).send({
        message: "user not found, please proceed to account creation",
      });

      return;
    }
    const otpToken = await otpGen.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });

    const otpSend = await OtpModel.create({ email, otp: otpToken });

    res.status(200).send({
      message: "Otp sent successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(400).send({
      message: "Failed to send otp",
    });
  }
};
const forgotPassword = async (req, res) => {
  const { email, password, otp } = req.body;

  try {
    const isUser = await UserModel.findOne(email);

    if (!isUser) {
      res.status(404).send({
        message: "user not found, please proceed to account creation",
      });

      return;
    }
  } catch (error) {}
};

const getUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");

    res.status(200).send({
      message: "users fetched successfully",
      data: users,
    });
  } catch (error) {
    res.status(400).send({
      message: "cannot fetch users",
    });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findById(id).select("-password");

    if (!user) {
      res.status(404).send({
        message: "user not found",
      });
      return;
    }
    res.status(200).send({
      message: "user fetched successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);

    res.status(400).send({
      message: "error fetching user",
    });
  }
};

const changePassword = async (req, res) => {
  const id = req.user;
  const { oldPassword, newPassword } = req.body;
  try {
    console.log(id);

    const isUser = await UserModel.findById(id);
    if (!isUser) {
      res.status(404).send({
        message: "user not found",
      });

      return;
    }

    const isMatch = await bcrypt.compare(oldPassword, isUser.password);

    if (!isMatch) {
      res.status(400).send({
        message: "Error with Password validation",
      });

      return;
    }
    let saltRound = 20;
    const salt = await bcrypt.genSalt(saltRound);
    const hashedPass = await bcrypt.hash(newPassword, salt);
    await UserModel.findByIdAndUpdate(
      id,
      { password: hashedPass },
      { new: true }
    );

    res.status(200).send({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(400).send({
      message: "Error with Password validation",
    });
  }
};

const verifyUser = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]
    ? req.headers["authorization"]?.split(" ")[1]
    : req.headers["authorization"]?.split(" ")[0];
  try {
    //if there is no token, send error response
    //if there is token decrypt and log the user id
    const user = jwt.verify(
      token,
      process.env.APP_TOKEN,
      function (err, decoded) {
        if (err) {
          console.log(err);
          res.status(401).send({
            message: "User unauthorized",
          });

          return;
        }

        console.log(decoded);
        req.user = decoded.id;
        next();
      }
    );
  } catch (error) {
    //send an authorization error response
    console.log(error);

    res.status(401).send({
      message: "User unauthorized",
    });
  }
};

const deleteUser = async (req, res) => {};

module.exports = {
  addUserToDB,
  getUsers,
  getUser,
  login,
  verifyUser,
  changePassword,
  requestOTP,
};
