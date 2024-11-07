import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    title: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    content: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    media: [{
        type: mongoose.SchemaTypes.String,
        required: false,
    }],
    comments: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Comment",  
        },
    ],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    slug : {
        type : mongoose.SchemaTypes.String,
        required : true
    }
});

export default mongoose.model('Post', PostSchema);
