import mongoose from "mongoose";

const Comment = new mongoose.Schema({
    content : {
        type : mongoose.SchemaTypes.String,
        required : true
    },
    likes : {
        type : mongoose.SchemaTypes.Number,
        required : false,
        default : 0
    },
    replysCount : {
        type : mongoose.SchemaTypes.Number,
        required : false,
        default : 0
    },
    replies : {
        type : mongoose.SchemaTypes.ObjectId,
        ref : "Comment"
    },
    user : [{
        type : mongoose.SchemaTypes.ObjectId,
        ref : "User",
        required : true
    }],
    post : {
        type : mongoose.SchemaTypes.ObjectId,
        ref : "Post"
    }
})

export default mongoose.model('Comment', Comment);

