var express = require("express"),
    app = express(),
    expressanitizer = require("express-sanitizer"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    passportlocal = require("passport-local"),
    passportmongoose = require("passport-local-mongoose"),
    methodoverride = require("method-override"),
    bodyparser = require("body-parser"),
    user = require("./models/user"),
    blog = require("./models/blog");

mongoose.connect("mongodb+srv://jaspreet:singh@cluster0-aw4yr.mongodb.net/test?retryWrites=true&w=majority",{ useNewUrlParser: true,useFindAndModify: false, useCreateIndex: true  });
// mongoose.connect("mongodb://localhost/RESTfulBlog", { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true });


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodoverride("_method"));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(expressanitizer());

app.use(require("express-session")({
    secret: "testing authentication",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportlocal(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentuser = req.user;
    next();
})


//restfull routes
app.get("/", function(req, res) {
    res.redirect("/blogs");
})

// INDEX ROUTE
app.get("/blogs", function(req, res) {
    blog.find({}, function(err, blogs) {
        if (err) {
            console.log("ERROR!");
        }
        else {
            res.render("index", { blogs: blogs,pagetitle:"RESTfulBlog" });
        }
    })
})

// NEW ROUTE
app.get("/blogs/new", isLoggedIn, function(req, res) {
    res.render("new",{pagetitle:"Create New Post"});
})

// CREATE ROUTE
app.post("/blogs", function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blog.create(req.body.blog, function(err, newblog) {
        if (err) {
            console.log(err)
            res.render("new");
        }
        else {
            newblog.user.id = req.user._id;
            newblog.user.username = req.user.username;
            newblog.save();
            res.redirect("/blogs")
        }
    })
})

// SHOW ROUTE
app.get("/blogs/:id", isLoggedIn, function(req, res) {
    blog.findById(req.params.id, function(err, foundblog) {
        if (err) {
            res.redirect("/blogs");
        }
        else {
            res.render("show", { blog: foundblog,pagetitle: foundblog.title})
        }
    })
})

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
    blog.findById(req.params.id, function(err, foundblog) {
        if (err) {
            res.redirect("/blogs");
        }
        else {
            res.render("edit", { blog: foundblog,pagetitle: "Edit: " + foundblog.title})
        }
    })
})

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updateblog) {
        if (err) {
            res.redirect("/blogs");
        }
        else {
            res.redirect("/blogs/" + req.params.id)
        }
    })
})

// DESTROY ROUTE
app.delete("/blog/:id", function(req, res) {
    blog.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/blogs")
        }
        else {
            res.redirect("/blogs")
        }
    })
})

//REGISTRATION
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.get("/register", function(req, res) {
    res.render("register",{pagetitle:"Complete Your Registration"});
})

app.post("/register", function(req, res) {
    user.register(new user({ email: req.body.email, username: req.body.username }), req.body.password, function(err, newuser) {
        if (err) {
            console.log(err);
            return res.render("register")
        }
        else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/login");
            })
        }
    })
})

app.get("/login", function(req, res) {
    res.render("login",{pagetitle:"Login Page"});
})

app.post("/login", passport.authenticate("local", { successRedirect: "/", failureRedirect: "/login" }), function(req, res) {})

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
})

app.get("/user", function(req, res) {
    blog.find({}, function(err, blogs) {
        if (err) {
            console.log("ERROR!");
        }
        else {
            // console.log(req.user);
            res.render("user", { blogs: blogs,pagetitle:"Dashboard"});
        }
    })
})


app.listen(process.env.PORT, process.env.IP, function() {
    console.log("hello jazz");
})
