const mongoose = require("mongoose");

const model = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  added_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("mt_categories", model);
