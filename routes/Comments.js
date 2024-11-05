import express from "express"
import PostSchema from "../schemas/PostSchema.js";
import Comment from "../schemas/CommentSchema.js"



const router = express.Router();

router.get("/posts?/:postId/comments" , (req , res) => {
    try {
        const comments = PostSchema.find({ post: req.params.postId })
            .populate('user', 'username email')
            .populate({
            path: 'replies',
            populate: { path: 'user', select: 'username' }
            });
        res.status(200).json(comments);
    } catch (error) {
        return       res.status(400).json({ message: error.message });

    }
});

router.post('/posts/:postId/comments', async (req, res) => {
    try {
      const post = await PostSchema.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      const comment = new Comment({ ...req.body, post: post._id });
      await comment.save();

      post.comments.push(comment._id);
      await post.save();
  
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

export default router