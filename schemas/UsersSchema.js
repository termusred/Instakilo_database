import mongoose from "mongoose";

const User = new mongoose.Schema({
    username : {
        type : mongoose.SchemaTypes.String,
        required : true,
        unique : true,
        minlegth : 3
    },
    role : {
        type : mongoose.SchemaTypes.String,
        enum : ["user" , "admin"],
        default : "user"
    },
    password :{
        type : mongoose.SchemaTypes.String,
        required : true
    },
    email : {
        type : mongoose.SchemaTypes.String,
        required : true,
        minlegth : 6
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    Desc : {
        type : mongoose.SchemaTypes.String,
    }
})

export default mongoose.model('User', User);

