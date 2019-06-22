var express = require("express"),
app = express(),
expressanitizer = require("express-sanitizer"),
mongoose = require("mongoose"),
methodoverride = require("method-override"), 
bodyparser = require("body-parser");

mongoose.connect("mongodb://localhost/RESTfulBlog",{ useNewUrlParser: true });
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(methodoverride("_method"));
app.use(bodyparser.urlencoded({extended: true}));
app.use(expressanitizer());

var blogschema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
})

var blog = mongoose.model("blog",blogschema);

//restfull routes
app.get("/",function(req,res){
    res.redirect("/blogs");
})

// INDEX ROUTE
app.get("/blogs",function(req,res){
    blog.find({},function(err,blogs){
        if(err){
            console.log("ERROR!");
        }
        else{
            res.render("index",{blogs: blogs});
        }
    })
})

// NEW ROUTE
app.get("/blogs/new",function(req,res){
    res.render("new");
})

// CREATE ROUTE
app.post("/blogs",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blog.create(req.body.blog,function(err,newblog){
        if(err){
            res.render("new");
        }
        else{
            res.redirect("/blogs")
        }
    })
})

// SHOW ROUTE
app.get("/blogs/:id",function(req,res){
    blog.findById(req.params.id,function(err,foundblog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("show",{blog: foundblog})
        }
    })
}) 

// EDIT ROUTE
app.get("/blogs/:id/edit",function(req,res){
    blog.findById(req.params.id,function(err,foundblog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("edit",{blog: foundblog})
        }
    })
})

// UPDATE ROUTE
app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updateblog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/"+req.params.id)
        }
    })
})

// DESTROY ROUTE
app.delete("/blog/:id",function(req,res){
    blog.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/blogs")
        }
        else{
            res.redirect("/blogs")
        }
    })
})

app.listen(process.env.PORT,process.env.IP,function(){
    console.log("hello jazz");
})