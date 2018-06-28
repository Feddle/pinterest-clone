const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {type: String, unique: true},
    githubId: String,
    password: String,    
    link: {type: String, required: true, unique: true},    
    image_links: [
        {
            title: {type: String, required: true},
            link: {type: String, required: true}
        }
    ]
});

const User = mongoose.model("book-club-users", userSchema);


module.exports = User;
