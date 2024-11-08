import express from "express"
import PostSchema from "../schemas/PostSchema.js";
import Comment from "../schemas/CommentSchema.js"
import IsLoggedIn from "../Auth/IsLoggedIn.js"



const router = express.Router();

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

router.post('/posts/:postId/comments', IsLoggedIn ,async (req, res) => {
    try {
      const post = await PostSchema.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      const user = req.userId
  
      const comment = new Comment({ ...req.body, post: post._id , user : user });
      await comment.save();

      post.comments.push(comment._id);
      await post.save();
  
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

export default router