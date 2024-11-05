import express from "express";
import PostSchema from "../schemas/PostSchema.js";
import User from "../schemas/UsersSchema.js";
import IsLoggedIn from "../Auth/IsLoggedIn.js";

const router = express.Router();

router.get("/posts", IsLoggedIn, async (req, res) => {
    try {
        const posts = await PostSchema.find()
            .populate("author", "username email")
            .populate({
                path: "comments",
                populate: { path: "user", select: "username" }
            });
        res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get("/posts/user", IsLoggedIn, async (req, res) => {
    try {
        const userId = req.userId;
        const posts = await PostSchema.find({ author: userId })
            .populate("author", "username email")
            .populate({
                path: "comments",
                populate: { path: "user", select: "username" }
            });

        if (posts.length === 0) {
            return res.status(404).json({ message: "No posts found for this user" });
        }

        res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post("/posts", IsLoggedIn, async (req, res) => {
    try {
        const userId = req.userId; 
        const { title, content } = req.body; 
        const TitleExists = await PostSchema.findOne({title})
        if(TitleExists){
            return res.status(401).send("Title already exist")
        }
        const newPost = new PostSchema({
            title,
            content,
            author: userId 
        });

        await newPost.save(); 
        res.status(201).json(newPost); 
    } catch (error) {
        return res.status(400).json({ message: error.message }); 
    }
});

export default router;
