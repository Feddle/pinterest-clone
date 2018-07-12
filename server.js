
require("dotenv").config();
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
const Pin = require("./models/pin-model");
const bodyParser = require("body-parser");
let validator = require("validator");
const app = express();
const url = "mongodb://"+process.env.DB_USER+":"+process.env.DB_PASS+"@"+process.env.DB_HOST+":"+process.env.DB_PORT+"/"+process.env.DB_NAME;
const urlencodedParser = bodyParser.urlencoded({ extended: false });

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

mongoose.connect(url, {useNewUrlParser: true}, () => {
    console.log("connected to mongodb");   
    let InitializeTestData = require("./utils/testData.js");
    InitializeTestData();
});



app.get("/", (req, res, next) => {
    Pin.find({}, (err, items) => {
        if(err) return next(err);               
        res.render("index.njk", {user: req.user, items});
    });    
});


app.post("/add", authCheck, urlencodedParser, (req, res) => {    
    let link = req.body.link+"";
    let title = req.body.title+"";
    if(!title.length > 0) return res.send("Title cannot be empty, please try again.");
    if(title.length > 90) return res.send("Title is too long");
    if(validator.isURL(link)) {
        link = link.match(/https?/gm) ? link : "https://" + link;        
        new Pin({
            owner: req.user.username,
            owner_id: req.user.id,  
            owner_link: req.user.link,  
            link,    
            title
        }).save((err, pin) => {            
            if(err) return res.send("Error occurred, please check fields and try again.");
            User.updateOne({_id: req.user.id}, {$push: {image_links: pin.id}}, (err) => {
                if(err) return res.send("Error occurred, please try again");
                return res.send(pin);
            });            
        });
    }
    else return res.send("Please check the image url and try again.");
});

app.post("/remove", authCheck, urlencodedParser, (req, res, next) => {
    let pin_id = req.body.pin_id;
    let isOwn = false;
    req.user.image_links.forEach(e => {if(e == pin_id) isOwn = true;return;});
    if(!isOwn) return res.send("Auth error");

    //Not good if operation partially succeeds
    Promise.all([
        Pin.deleteOne({_id: pin_id}),
        User.updateOne({_id: req.user.id}, {$pull: {image_links: pin_id}})
    ])
        .then(() => {return res.redirect("/");})
        .catch((e) => next(e));
});

app.get("/user/:link", (req, res, next) => {
    let username;
    User.findOne({link: req.params.link})
        .then((user) => {
            username = user.username;
            let pins = user.image_links;            
            return Pin.find({_id: {$in: pins}});
        })
        .then((pins) => {            
            res.render("index.njk", {user: req.user, items: pins, username});
        })
        .catch((err) => {
            next(err);
        });
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

function authCheck(req, res, next) {
    if(!req.user){
        return res.redirect("/auth");
    } else {
        return next();
    }
}


