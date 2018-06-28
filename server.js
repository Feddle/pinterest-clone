
require("dotenv").config();
//const {createTestUsers} = require("./utils/utilFunc");
const express = require("express");
const nunjucks = require("nunjucks");
const helmet = require("helmet");
const passport = require("passport");
require("./config/passport-setup");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth-routes");
const User = require("./models/user-model");
const app = express();
const url = "mongodb://"+process.env.DB_USER+":"+process.env.DB_PASS+"@"+process.env.DB_HOST+":"+process.env.DB_PORT+"/"+process.env.DB_NAME;


app.use(express.static("public"));
app.use(cookieParser());


nunjucks.configure("views", {
    autoescape: true,
    express: app
});

app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY],
    secure: process.env.ENVIRONMENT === "production" ? true : false,
    sameSite: "lax"
}));

app.use(passport.initialize());
app.use(passport.session());

//Configure TLS if production
if(process.env.ENVIRONMENT === "production") {
    app.use(helmet(require("./config/helmet-setup")));  
    app.all("*", (req, res, next) => {
        if(req.get("X-Forwarded-Proto").indexOf("https") != -1) return next();
        else res.redirect("https://" + req.hostname + req.url);
    });
}


//Routes
app.use("/auth", authRoutes);

mongoose.connect(url, () => {
    console.log("connected to mongodb");    
    /*User.insertMany(createTestUsers(), (err) => {
        if(err) console.log("Test users already exist, creation skipped");
        else console.log("Test users created");
    });*/
});

app.get("/", (req, res) => {
    res.render("index.njk", {user: req.user});
});

app.get("/auth", (req, res) => {
    if(req.user) res.redirect("/");
    else res.render("sign-in.njk", {message: req.flash("error")});
});


//Default route
app.get("*", (req, res) => {
    res.status(404).end("Page not found");
});

//Route default error handler
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).send(err.message);
});



const listener = app.listen(process.env.PORT, () => {
    console.log(`Your app is listening on port ${listener.address().port}`);
});


