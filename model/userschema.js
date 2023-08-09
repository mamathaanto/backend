const mongoose = require('mongoose');
const Schema = mongoose.Schema({                                               
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    facultyname:{
        type:String,                                                         
     }
});

const documentData = mongoose.model('users',Schema);
module.exports = documentData;
