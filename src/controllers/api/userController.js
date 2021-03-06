var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Users = require("../../models/api/userModel");
// const helper = require("../helpers/helper");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenSecret = "a2sd#Fs43d4G3524Kh";
const rounds = 10;
const dateTime = moment().format("YYYY-MM-DD h:mm:ss");
const auth = require("../../middlewares/auth");
const { check, validationResult } = require("express-validator");

//functions
function generateToken(user) {
  return jwt.sign({ data: user }, tokenSecret, { expiresIn: "24h" });
}

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};
  console.log(matches);
  if (matches) {
    if (matches.length !== 3) {
      return new Error("Invalid input string");
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], "base64");
  } else {
    response = "";
  }

  return response;
}

//methods
exports.getUsers = async function (req, res, next) {
  // Validate request parameters, queries using express-validator

  Users.find().then((users) => {
    res.status(200).json({
      status: "1",
      message: "Found!",
      respdata: users,
    });
  });
};

exports.signUp = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  bcrypt.hash(req.body.password, rounds, (error, hash) => {
    if (error) {
      res.status(400).json({
        status: "0",
        message: "Error!",
        respdata: error,
      });
    } else {
      // const token = generateToken(req.body);

      Users.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
          const newUser = Users({
            email: req.body.email,
            password: hash,
            token: "na",
            title: req.body.title,
            name: req.body.name,
            age: req.body.age,
            weight: req.body.weight,
            height: req.body.height,
            country: req.body.country,
            country_code: req.body.country_code,
            country: req.body.country,
            goal: req.body.goal,
            hear_from: req.body.hear_from,
            last_login: "na",
            created_dtime: dateTime,
            image: "na",
          });

          newUser
            .save()
            .then((user) => {
              res.status(200).json({
                status: "1",
                message: "Added!",
                respdata: user,
              });
            })
            .catch((error) => {
              res.status(400).json({
                status: "0",
                message: "Error!",
                respdata: error,
              });
            });
        } else {
          res.status(400).json({
            status: "0",
            message: "User already exists!",
            respdata: {},
          });
        }
      });
    }
  });
};

exports.getLogin = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Users.findOne({ email: req.body.email }).then((user) => {
    if (!user)
      res.status(404).json({
        status: "0",
        message: "User not found!",
        respdata: {},
      });
    else {
      bcrypt.compare(req.body.password, user.password, (error, match) => {
        if (error) {
          res.status(400).json({
            status: "0",
            message: "Error!",
            respdata: error,
          });
        } else if (match) {
          // delete user.token;
          // Users.updateOne({ _id: user._id }, { $set: { token: "na" } });

          const userToken = {
            userId: user._id,
            email: user.email,
            password: user.password,
            title: user.title,
            name: user.name,
            age: user.age,
            weight: user.weight,
            height: user.height,
            country: user.country,
            country_code: user.country_code,
            country: user.country,
            goal: user.goal,
            hear_from: user.hear_from,
          };

          Users.findOneAndUpdate(
            { _id: user._id },
            { $set: { token: generateToken(userToken), last_login: dateTime } },
            { upsert: true },
            function (err, doc) {
              if (err) {
                throw err;
              } else {
                Users.findOne({ _id: user._id }).then((user) => {
                  res.status(200).json({
                    status: "1",
                    message: "Successful!",
                    respdata: user,
                  });
                });
              }
            }
          );
        } else {
          res.status(400).json({
            status: "0",
            message: "Password does not match!",
            respdata: {},
          });
        }
      });
    }
  });
};

exports.getProfile = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Users.findOne({ _id: req.body.user_id }).then((user) => {
    if (!user) {
      res.status(400).json({
        status: "0",
        message: "User does not exist!",
        respdata: {},
      });
    } else {
      // console.log('%s %s %s', req.method, req.url, req.path);
      user.image = req.baseUrl + "/images/" + "test.jpg";
      res.status(400).json({
        status: "1",
        message: "Detalis Found!",
        respdata: user,
      });
    }
  });
};

exports.editProfile = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Users.findOne({ _id: req.body.user_id }).then((user) => {
    if (!user)
      res.status(404).json({
        status: "0",
        message: "User not found!",
        respdata: {},
      });
    else {
      // Users.updateOne({ _id: user._id }, { $set: updData });

      bcrypt.hash(req.body.password, rounds, (error, hash) => {
        var updData = {
          // email: req.body.email,
          password: hash,
          title: req.body.title,
          name: req.body.name,
          age: req.body.age,
          weight: req.body.weight,
          height: req.body.height,
          country: req.body.country,
          country_code: req.body.country_code,
          country: req.body.country,
          goal: req.body.goal,
          hear_from: req.body.hear_from,
          // last_login: dateTime,
        };
        Users.findOneAndUpdate(
          { _id: req.body.user_id },
          { $set: updData },
          { upsert: true },
          function (err, doc) {
            if (err) {
              throw err;
            } else {
              Users.findOne({ _id: req.body.user_id }).then((user) => {
                res.status(200).json({
                  status: "1",
                  message: "Successfully updated!",
                  respdata: user,
                });
              });
            }
          }
        );
      });
    }
  });
};

exports.uploadImage = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Users.findOne({ _id: req.body.user_id }).then((user) => {
    if (!user)
      res.status(404).json({
        status: "0",
        message: "User not found!",
        respdata: {},
      });
    else {
      var decodedImg = decodeBase64Image(req.body.img_base64);
      console.log("sss:");
      console.log(decodedImg);
      if (decodedImg != "") {
        var imageBuffer = decodedImg.data;
        var type = decodedImg.type;
        var extension = mime.extension(type);
        var fileName = "image." + extension;
        try {
          fs.writeFileSync("../uploads/images" + fileName, imageBuffer, "utf8");
          // fs.readFileSync(img_base64, {encoding: 'base64'});
        } catch (err) {
          console.error(err);
        }
      }

      var updData = {
        // email: req.body.email,
        image: "nn",
      };
      Users.findOneAndUpdate(
        { _id: req.body.user_id },
        { $set: updData },
        { upsert: true },
        function (err, doc) {
          if (err) {
            throw err;
          } else {
            Users.findOne({ _id: req.body.user_id }).then((user) => {
              res.status(200).json({
                status: "1",
                message: "Successful!",
                respdata: user,
              });
            });
          }
        }
      );
    }
  });
};

exports.getLogout = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Users.findOne({ _id: req.body.user_id }).then((user) => {
    if (!user)
      res.status(404).json({
        status: "0",
        message: "User not found!",
        respdata: {},
      });
    else {
      // Users.updateOne({ _id: user._id }, { $set: updData });

      var updData = {
        token: "na",
        last_logout: dateTime,
      };
      Users.findOneAndUpdate(
        { _id: req.body.user_id },
        { $set: updData },
        { upsert: true },
        function (err, doc) {
          if (err) {
            throw err;
          } else {
            Users.findOne({ _id: req.body.user_id }).then((user) => {
              res.status(200).json({
                status: "1",
                message: "Successfully loggedout!",
                respdata: user,
              });
            });
          }
        }
      );
    }
  });
};

exports.changePassword = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Users.findOne({ _id: req.body.user_id }).then((user) => {
    if (!user)
      res.status(404).json({
        status: "0",
        message: "User not found!",
        respdata: {},
      });
    else {
      // Users.updateOne({ _id: user._id }, { $set: updData });

      bcrypt.hash(req.body.new_password, rounds, (error, hash) => {
        var updData = {
          password: hash,
          // last_login: dateTime,
        };
        Users.findOneAndUpdate(
          { _id: req.body.user_id },
          { $set: updData },
          { upsert: true },
          function (err, doc) {
            if (err) {
              throw err;
            } else {
              Users.findOne({ _id: req.body.user_id }).then((user) => {
                res.status(200).json({
                  status: "1",
                  message: "Successfully updated!",
                  respdata: user,
                });
              });
            }
          }
        );
      });
    }
  });
};
