var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Category = require("../../models/api/categoryModel");
const Exercise = require("../../models/api/exerciseModel");
const Equipment = require("../../models/api/equipmentModel");
// const helper = require("../helpers/helper");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenSecret = "a2sd#Fs43d4G3524Kh";
const rounds = 10;
const dateTime = moment().format("YYYY-MM-DD h:mm:ss");
const auth = require("../../middlewares/auth");
// var { getAllActiveSessions } = require("../../middlewares/redis");
const { check, validationResult } = require("express-validator");
// var uuid = require("uuid");
var crypto = require("crypto");
var randId = crypto.randomBytes(20).toString("hex");
const multer = require("multer");
const request = require('request');

//methods

exports.getData = async function (req, res, next) {
  // Validate request parameters, queries using express-validator

  var pageTitle = req.app.locals.siteName + " - Exercise List";

  Exercise.find().then((exercise) => {
    res.render("pages/exercise/list", {
      siteName: req.app.locals.siteName,
      pageTitle: pageTitle,
      userFullName: req.session.user.name,
      userImage: req.session.user.image_url,
      userEmail: req.session.user.email,
      year: moment().format("YYYY"),
      requrl: req.app.locals.requrl,
      status: 0,
      message: "found!",
      respdata: {
        list: exercise,
      },
    });
  });
};

exports.addData = async function (req, res, next) {
  var pageTitle = req.app.locals.siteName + " - Add Exercise";

  Category.find().then((category) => {
    Equipment.find().then((equipment) => {
      res.render("pages/exercise/create", {
        siteName: req.app.locals.siteName,
        pageTitle: pageTitle,
        userFullName: req.session.user.name,
        userImage: req.session.user.image_url,
        userEmail: req.session.user.email,
        year: moment().format("YYYY"),
        requrl: req.app.locals.requrl,
        status: 0,
        message: "found!",
        respdata: {
          category: category,
          equipment: equipment,
        },
      });
    });
  });

};



exports.getSubCatData = async function (req, res, next) {

  Category.find().then((category) => {

  });

};

exports.createData = async function (req, res, next) {
  var pageName = "Exercise";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    res.render("pages/sub-filter/create", {
      status: 0,
      siteName: req.app.locals.siteName,
      userFullName: req.session.user.name,
      userImage: req.session.user.image_url,
      userEmail: req.session.user.email,
      pageName: pageName,
      pageTitle: pageTitle,
      year: moment().format("YYYY"),
      message: "Validation error!",
      requrl: req.app.locals.requrl,
      respdata: errors.array(),
    });

  } else {

    Exercise.findOne({ name: req.body.sub_filter }).then((exercise) => {
      if (exercise) {
        res.render("pages/sub-filter/create", {
          status: 0,
          siteName: req.app.locals.siteName,
          userFullName: req.session.user.name,
          userImage: req.session.user.image_url,
          userEmail: req.session.user.email,
          pageName: pageName,
          pageTitle: pageTitle,
          year: moment().format("YYYY"),
          message: "Already exists!",
          requrl: req.app.locals.requrl,
          respdata: {},
        });
      } else {
        //image uplaod

        const folderPath = "./public/images/exercises/";
        const path = Date.now() + ".png";
        var image_url = '';
        image_url = req.app.locals.requrl + "/public/images/no-image.jpg";

        console.log('output 1 !!!!');
        // console.log(req.body);
        // console.log(req.files);

        const handleError = (err, res) => {
          res
            .status(500)
            .contentType("text/plain")
            .end("Oops! Something went wrong!");
        };

        const upload = multer({
          dest: folderPath
          // you might also want to set some limits: https://github.com/expressjs/multer#limits
        });


        upload.single("file" /* name attribute of <file> element in your form */),
          (req, res) => {
            console.log('output 2 !!!!');
            const tempPath = req.file.path;
            const targetPath = path.join(__dirname, "./uploads/image.png");

            if (path.extname(req.file.originalname).toLowerCase() === ".png") {
              fs.rename(tempPath, targetPath, err => {
                if (err) return handleError(err, res);

                res
                  .status(200)
                  .contentType("text/plain")
                  .end("File uploaded!");
              });
            } else {
              fs.unlink(tempPath, err => {
                if (err) return handleError(err, res);

                res
                  .status(403)
                  .contentType("text/plain")
                  .end("Only .png files are allowed!");
              });
            }
          }


        console.log('output 4 !!!!');

        // console.log(image_url);

        const newEx = Exercise({
          category_id: req.body.body_focus,
          sub_category_ids: req.body.sub_filter,
          equipment_ids: req.body.equipments,
          name: req.body.exercise_name,
          description: req.body.description,
          video_url: req.body.video_url,
          default_time: req.body.default_time,
          weight: req.body.weight,
          weight_unit: req.body.weight_unit,
          reps: req.body.reps,
          sets: req.body.sets,
          break: req.body.break,
          image: image_url,
          added_dtime: dateTime,
        });

        newEx
          .save()
          .then((exercise) => {
            res.render("pages/sub-filter/create", {
              status: 0,
              siteName: req.app.locals.siteName,
              pageName: pageName,
              pageTitle: pageTitle,
              userFullName: req.session.user.name,
              userImage: req.session.user.image_url,
              userEmail: req.session.user.email,
              year: moment().format("YYYY"),
              message: "Added!",
              requrl: req.app.locals.requrl,
              respdata: exercise,
            });
          })
          .catch((error) => {
            console.log(error);
            res.render("pages/sub-filter/create", {
              status: 0,
              pageName: pageName,
              siteName: req.app.locals.siteName,
              userFullName: req.session.user.name,
              userImage: req.session.user.image_url,
              userEmail: req.session.user.email,
              pageTitle: pageTitle,
              year: moment().format("YYYY"),
              requrl: req.app.locals.requrl,
              message: "Error!",
              respdata: error,
            });
          });
      }
    });
  }

};


exports.deleteData = async function (req, res, next) {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({
  //     status: "0",
  //     message: "Validation error!",
  //     respdata: errors.array(),
  //   });
  // }

  const del_id = mongoose.Types.ObjectId(req.params.id);
  // console.log(del_id);

  Exercise.findOne({ _id: del_id }).then((exercise) => {
    if (!exercise) {
      res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
      });
    } else {
      //delete

      Exercise.deleteOne({ _id: del_id }, function (err, obj) {
        if (err) throw err;
        res.redirect("/sub-filters");
      });
    }
  });
};