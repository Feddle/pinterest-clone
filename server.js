
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
const Pin = require("./models/pin-model");
const crypto = require("crypto");
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
    let testPinIds = [
        "5b3b5c0cb81acf21589e5656",
        "5b3b5c0cb81acf21589e5658",
        "5b3b5c0cb81acf21589e565a",
        "5b3b5c0cb81acf21589e565c",
        "5b3b5c0cb81acf21589e565e"        
    ];     
    let testUserIds= ["5b3b781577dc760ae82039a4", "5b3b781577dc760ae82039a5", "5b3b781577dc760ae82039a6", "5b3b781577dc760ae82039a7", "5b3b781577dc760ae82039a8"];
    let testUserLinks = [];
    for(let i = 0; i < testPinIds.length; i++) {
        testPinIds[i] = mongoose.Types.ObjectId(testPinIds[i]);
        testUserIds[i] = mongoose.Types.ObjectId(testUserIds[i]);
        testUserLinks[i] = crypto.randomBytes(3).toString("hex");
        //console.log(mongoose.Types.ObjectId());
    }
    Promise.all([
        Pin.insertMany(createTestPins(testUserIds, testPinIds, testUserLinks)),
        User.insertMany(createTestUsers(testUserIds, testPinIds, testUserLinks))
    ])
        .then(
            () => {
                let extraPinIds = [
                    "5b3b86f0a68fb726c41cb122",
                    "5b3b86f0a68fb726c41cb123",
                    "5b3b86f0a68fb726c41cb124"
                ];
                User.updateOne({_id: testUserIds[0]}, { $push: { image_links: { $each: extraPinIds } } }, (err) => {
                    if(err) console.log("Error creating extra test pins");
                });
                console.log("Created test users and pins");
            },
            (reason) => {console.log(reason.message);});                 
    
});

function createTestPins(testUserIds, testPinIds, testUserLinks) {
    let pins = [];
    let links = [
        "https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-663610.jpg",
        "https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-662361.jpg",
        "https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-661881.jpg",
        "https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-664352.jpg",
        "https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-666357.jpg",
        "https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-668354.jpg",
        "https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-662117.jpg",
        "https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-662290.jpg",
        "https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-3208.jpg",
        "https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-23950.jpg"
        
    ];
    let titles = [
        "I often see the time 11:11 or 12:34 on clocks",
        "Lets all be unique together",
        "I am never at home on Sundays",
        "There was no ice cream in the freezer",
        "He was not there yesterday",
        "It was a lovely sight",
        "I'd rather be a bird than a fish",
        "I love eating toasted cheese and tuna sandwiches",
        "The old apple revels in its authority",
        "Writing a list of random sentences is harder than I initially thought it would be"
    ];

    for(let i = 0; i < links.length; i++) {
        let owner = `test${i+1}`;
        let owner_id = testUserIds[i];
        let owner_link = testUserLinks[i];
        if(i >= 5) {
            owner = "test1";
            owner_id = testUserIds[0];
            owner_link = testUserLinks[0];
        }
        pins.push({
            _id: testPinIds[i],
            owner,
            owner_id,
            owner_link,
            title: titles[i],
            link: links[i]
        });
    }
    return pins;
}

function createTestUsers(testUserIds, testPinIds, testUserLinks) {    
    let users = [];
    for(let i = 0; i < testUserIds.length; i++) {                 
        users.push({   
            _id: testUserIds[i],         
            username: `test${i+1}`,
            password: "12345", 
            link: testUserLinks[i],
            image_links: [testPinIds[i]]
        });
    }    
    return users;
}


app.get("/", (req, res, next) => {
    Pin.find({}, (err, items) => {
        if(err) return next(err);               
        res.render("index.njk", {user: req.user, items});
    });    
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


