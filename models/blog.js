var mongoose = require("mongoose"),
passportlocalmongoose = require("passport-local-mongoose");

var blogschema = mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now},
    user: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        username: String
    }
})
blogschema.plugin(passportlocalmongoose);


module.exports= mongoose.model("blog",blogschema);