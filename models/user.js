var mongoose = require("mongoose"),
passportlocalmongoose = require("passport-local-mongoose");

var userschema = mongoose.Schema({
    email: String,
    username: String,
    password: String,
})

userschema.plugin(passportlocalmongoose);

module.exports = mongoose.model("user",userschema);