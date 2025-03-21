import express from "express";
import PostSchema from "../schemas/PostSchema.js";
import User from "../schemas/UsersSchema.js";
import IsLoggedIn from "../Auth/IsLoggedIn.js";
import { upload } from "../utils/multer.js";

const router = express.Router();

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /post/{slug}:
 *   get:
 *     summary: Get a post by slug
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Post slug
 *     responses:
 *       200:
 *         description: Post details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Slug not found
 *       500:
 *         description: Server error
 */
router.get("/post/:slug", IsLoggedIn, async (req, res) => {
    try {
        const Slug = req.params.slug;
        const post = await PostSchema.findOne({ slug: Slug })
            .populate("author", "username email")
            .populate({
                path: "comments",
                populate: { path: "user", select: "username" }
            });
        if (!post) {
            res.status(404).send("Slug not found");
        }
        res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /posts/user:
 *   get:
 *     summary: Get posts by current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       404:
 *         description: No posts found for this user
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *             required:
 *               - title
 *               - content
 *     responses:
 *       201:
 *         description: Post created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Title or slug already exists
 */
router.post("/posts", upload.array("images"), IsLoggedIn, async (req, res) => {
    try {
        const userId = req.userId;
        const { title, content } = req.body;
        const Slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
        
        const TitleExists = await PostSchema.findOne({ title });
        const SlugExists = await PostSchema.findOne({ slug: Slug });
        if (TitleExists) {
            return res.status(401).send("Title already exist");
        }
        if (SlugExists) {
            return res.status(401).send("Slug already exist");
        }
        const images = req.files.map(file => file.filename);
        const newPost = new PostSchema({
            title,
            content,
            author: userId,
            media: images,
            slug: Slug
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         slug:
 *           type: string
 *         author:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             email:
 *               type: string
 *         media:
 *           type: array
 *           items:
 *             type: string
 *         comments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

export default router;