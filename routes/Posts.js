import express from "express";
import PostSchema from "../schemas/PostSchema.js";
import User from "../schemas/UsersSchema.js";
import IsLoggedIn from "../Auth/IsLoggedIn.js";
import {upload} from "../utils/multer.js"

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

router.get("/post/:slug", IsLoggedIn, async (req, res) => {
    try {
        const Slug = req.params.slug
        const post = await PostSchema.findOne({slug : Slug})
            .populate("author", "username email")
            .populate({
                path: "comments",
                populate: { path: "user", select: "username" }
        });
        if(!post){
            res.status(404).send("Slug not found")
        }
            
        res.status(200).json(post);
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

router.post("/posts", upload.array("images") , IsLoggedIn, async (req, res) => {
    try {
        const userId = req.userId; 
        const { title, content } = req.body; 
        const Slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'); 
        
        const TitleExists = await PostSchema.findOne({title})
        const SlugExists = await PostSchema.findOne({Slug})
        if(TitleExists){
            return res.status(401).send("Title already exist")
        }
        if(SlugExists){
            return res.status(401).send("Slug already exist")
        }
        const images = req.files.map(file => file.filename); 
        const newPost = new PostSchema({
            title,
            content,
            author: userId,
            media : images,
            slug : Slug
        });

        await newPost.save(); 
        res.status(201).json(newPost); 
    } catch (error) {
        return res.status(400).json({ message: error.message }); 
    }
});

export default router;
