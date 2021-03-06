const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");


//database
const mongoose = require("mongoose");
const dbURI = "mongodb+srv://snigdhoU1:MdzrUIxkbf0CGPhW@cluster0.vwhnn.mongodb.net/ukfitness";
// const dbURI = "mongodb://61.16.131.204:27017/ukfitness";

app.use(express.json());

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
mongoose.Promise = global.Promise;

db.on("error", (err) => {
  console.error(err);
});
db.once("open", () => {
  // console.log(db);
  console.log(" DB started successfully");
});

// set the view engine to ejs
app.set("view engine", "ejs");

// adding Helmet to enhance your API's security
app.use(helmet());
// using bodyParser to parse JSON bodies into JS objects
// app.use(bodyParser.json());
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
// enabling CORS for all requests

// var corsOptions = {
//   origin: "http://localhost:3000"
// };
// app.use(cors(corsOptions));

app.use(cors());
// adding morgan to log HTTP requests
app.use(morgan("combined"));

//routes

var routes = require("./src/routes/routes.js");
var web = require("./src/routes/web.js");
var api = require("./src/routes/api.js");

app.use("/", web);
app.use("/api", api);
app.use("/routes", routes); //test


// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   var err = new Error("Not Found");
//   err.status = 404;
//   next(err);
// });

//snigdho upadhyay
app.listen(port, () => console.log(`App listening on port ${port}!`));
