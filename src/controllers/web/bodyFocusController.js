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

//methods
exports.getData = async function (req, res, next) {
  // Validate request parameters, queries using express-validator

  var pageName = "Body Focus";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";

  Category.find().then((category) => {
    res.render("pages/body-focus/list", {
      siteName: req.app.locals.siteName,
      pageName: pageName,
      pageTitle: pageTitle,
      userFullName: req.session.user.name,
      userImage: req.session.user.image_url,
      userEmail: req.session.user.email,
      year: moment().format("YYYY"),
      requrl: req.app.locals.requrl,
      status: 0,
      message: "found!",
      respdata: {
        list: category,
      },
    });
  });
};

exports.addData = async function (req, res, next) {
  // Validate request parameters, queries using express-validator

  var pageName = "Body Focus";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;

  //   Users.find().then((users) => {
  res.render("pages/body-focus/create", {
    status: 1,
    siteName: req.app.locals.siteName,
    pageName: pageName,
    pageTitle: pageTitle,
    userFullName: req.session.user.name,
    userImage: req.session.user.image_url,
    userEmail: req.session.user.email,
    year: moment().format("YYYY"),
    requrl: req.app.locals.requrl,
    message: "",
    respdata: {},
  });
  //   });
};

exports.createData = async function (req, res, next) {
  var pageName = "Body Focus";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("pages/body-focus/create", {
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
  }

  Category.findOne({ name: req.body.focus_name }).then((category) => {
    if (category) {
      res.render("pages/body-focus/create", {
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
      var image_url = req.app.locals.requrl + "/public/images/no-image.jpg";
      // console.log(image_url);

      const newCat = Category({
        name: req.body.focus_name,
        description: req.body.description,
        image: image_url,
        added_dtime: dateTime,
      });

      newCat
        .save()
        .then((category) => {
          res.render("pages/body-focus/create", {
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
            respdata: category,
          });
        })
        .catch((error) => {
          res.render("pages/body-focus/create", {
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
};

exports.editData = async function (req, res, next) {
  // Validate request parameters, queries using express-validator

  var pageName = "Body Focus";
  var pageTitle = req.app.locals.siteName + " - Edit " + pageName;

  const user_id = mongoose.Types.ObjectId(req.params.id);

  Category.findOne({ _id: user_id }).then((category) => {
    res.render("pages/body-focus/edit", {
      status: 1,
      siteName: req.app.locals.siteName,
      pageName: pageName,
      pageTitle: pageTitle,
      userFullName: req.session.user.name,
      userImage: req.session.user.image_url,
      userEmail: req.session.user.email,
      year: moment().format("YYYY"),
      requrl: req.app.locals.requrl,
      message: "",
      respdata: category,
    });
  });
};

exports.updateData = async function (req, res, next) {
  var pageName = "Body Focus";
  var pageTitle = req.app.locals.siteName + " - Edit " + pageName;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("pages/body-focus/edit", {
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
      respdata: {},
    });
  }

  const cat_id = mongoose.Types.ObjectId(req.body.cat_id);
  // console.log(cat_id);
  Category.findOne({ name: req.body.focus_name }).then((category) => {
    if (category) {
      res.render("pages/body-focus/edit", {
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
      var updData = {
        name: req.body.focus_name,
        description: req.body.description,
        // image: image_url,
      };
      Category.findOneAndUpdate(
        { _id: cat_id },
        { $set: updData },
        { upsert: true },
        function (err, doc) {
          if (err) {
            throw err;
          } else {
            res.redirect("/edit-body-focus/" + req.body.cat_id);
            // Category.findOne({ _id: cat_id }).then((category) => {
            //   //
            // });
          }
        }
      );
    }
  });
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

  Category.findOne({ _id: del_id }).then((category) => {
    if (!category) {
      res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
      });
    } else {
      //delete

      Category.deleteOne({ _id: del_id }, function (err, obj) {
        if (err) throw err;
        res.redirect("/body-focus");
      });
    }
  });
};
