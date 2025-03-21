import express from "express";
import PostSchema from "../schemas/PostSchema.js";
import Comment from "../schemas/CommentSchema.js";
import IsLoggedIn from "../Auth/IsLoggedIn.js";

const router = express.Router();

/**
 * @swagger
 * /posts/{postId}/comments:
 *   get:
 *     summary: Get comments for a specific post
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of comments to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of comments to skip
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Bad request
 */
router.get("/posts/:postId/comments", async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const skip = parseInt(req.query.skip) || 0;

    try {
        const comments = await PostSchema.find({ post: req.params.postId })
            .populate('user', 'username email')
            .populate({
                path: 'replies',
                populate: { path: 'user', select: 'username' }
            })
            .limit(limit)
            .skip(skip);

        res.status(200).json(comments);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /posts/{postId}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *             required:
 *               - content
 *     responses:
 *       201:
 *         description: Comment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Post not found
 */
router.post('/posts/:postId/comments', IsLoggedIn, async (req, res) => {
    try {
        const post = await PostSchema.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const user = req.userId;

        const comment = new Comment({ ...req.body, post: post._id, user: user });
        await comment.save();

        post.comments.push(comment._id);
        await post.save();

        res.status(201).json(comment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         content:
 *           type: string
 *         post:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             email:
 *               type: string
 *         replies:
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