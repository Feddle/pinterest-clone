const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pinSchema = new Schema({    
    owner: {type: String, required: true},
    owner_id: {type: Schema.Types.ObjectId, required: true},  
    owner_link: {type: String, required: true},  
    link: {type: String, required: true, unique: true},    
    title: {type: String, required: true}
});

const Pin = mongoose.model("pinterest-clone-pins", pinSchema);


module.exports = Pin;
