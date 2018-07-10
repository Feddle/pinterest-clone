//Create test data
//little ugly due to db models but it works

const mongoose = require("mongoose");
const User = require("../models/user-model");
const Pin = require("../models/pin-model");
const crypto = require("crypto");

function createTestPins(testUserIds, testPinIds, testUserLinks, extraPinIds) {
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

    for(let i = 0, t = 0; i < links.length; i++) {        
        let owner = `test${i+1}`;
        let owner_id = testUserIds[i];
        let owner_link = testUserLinks[i];
        let _id = testPinIds[i];
        if(i >= 5) {            
            owner = "test1";
            owner_id = testUserIds[0];
            owner_link = testUserLinks[0];
            _id = extraPinIds[t];
            t++;
        }
        pins.push({
            _id,
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

let InitializeTestData = () => {
    let testPinIds = [
        "5b3b5c0cb81acf21589e5656",
        "5b3b5c0cb81acf21589e5658",
        "5b3b5c0cb81acf21589e565a",
        "5b3b5c0cb81acf21589e565c",
        "5b3b5c0cb81acf21589e565e"        
    ];  
    let extraPinIds = [
        "5b3b86f0a68fb726c41cb122",
        "5b3b86f0a68fb726c41cb123",
        "5b3b86f0a68fb726c41cb124"
    ];   
    let testUserIds= ["5b3b781577dc760ae82039a4", "5b3b781577dc760ae82039a5", "5b3b781577dc760ae82039a6", "5b3b781577dc760ae82039a7", "5b3b781577dc760ae82039a8"];
    let testUserLinks = [];

    for(let i = 0; i < testPinIds.length; i++) {
        testPinIds[i] = mongoose.Types.ObjectId(testPinIds[i]);
        testUserIds[i] = mongoose.Types.ObjectId(testUserIds[i]);
        testUserLinks[i] = crypto.randomBytes(3).toString("hex");        
    }
    Promise.all([
        Pin.insertMany(createTestPins(testUserIds, testPinIds, testUserLinks, extraPinIds)),
        User.insertMany(createTestUsers(testUserIds, testPinIds, testUserLinks))
    ])
        .then(() => {                
            User.updateOne({_id: testUserIds[0]}, { $push: { image_links: { $each: extraPinIds } } }, (err) => {
                if(err) console.log("Error creating extra test pins");
            });
            console.log("Created test users and pins");
        },
        (reason) => {console.log(reason.message);});                 
    
};

module.exports = InitializeTestData;