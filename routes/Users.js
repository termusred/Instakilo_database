import express from "express";
import User from "../schemas/UsersSchema.js";
import jwt from "jsonwebtoken";
import isLoggedIn from "../Auth/IsLoggedIn.js";
import config from "../utils/config/config.js";
import { UserPostSchema, UserPatchSchema, UserLoginSchema } from "../validators/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of users per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of users with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/users', isLoggedIn, async (req, res) => {
    if (req.role === 'admin') {
        const limit = parseInt(req.query.limit) || 5;
        const page = parseInt(req.query.page) || 1;
        const total = await User.countDocuments();
        const totalPages = Math.ceil(total / limit);
        const users = await User.find()
            .skip((page - 1) * limit)
            .limit(limit);
        res.json({ data: users, total, totalPages });
    } else {
        return res.status(403).send({ msg: 'Forbidden: Only admin can access this route' });
    }
});

/**
 * @swagger
 * /userId:
 *   get:
 *     summary: Get current user ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User ID
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       403:
 *         description: Forbidden - Authentication required
 */
router.get("/userId", isLoggedIn, async (req, res) => {
    try {
        const id = req.userId;
        res.status(200).send(id);
    } catch (error) {
        return res.status(403).send({ msg: 'Forbidden: Only admin can access this route' });
    }
});

/**
 * @swagger
 * /userToken:
 *   get:
 *     summary: Get current user data by token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden - Authentication required
 */
router.get("/userToken", isLoggedIn, async (req, res) => {
    try {
        const id = req.userId;
        const data = await User.findById(id);
        await data.save();
        res.status(200).send({ data });
    } catch (error) {
        return res.status(403).send({ msg: 'Forbidden: Only admin can access this route' });
    }
});

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden - Authentication required
 */
router.get('/users/:userId', isLoggedIn, async (req, res) => {
    try {
        const user = req.params.userId;
        const data = await User.findById({ _id: user });
        res.status(200).json({ data: data });
    } catch (error) {
        console.log(error);
    }
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *               - email
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       400:
 *         description: Username already exists
 *       500:
 *         description: Server error
 */
router.post("/register", async (req, res) => {
    try {
        req.body.password = await bcrypt.hash(req.body.password, 12);
        const userExist = await User.findOne({ username: req.body?.username });
        if (userExist) {
            return res.status(400).send({ msg: 'Username already exists' });
        }
        const user = new User(req.body);
        await user.save();
        const token = jwt.sign({ id: user.id, role: user.role }, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        });
        res.status(201).json({ data: user, token });
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};
        const user = await User.findOne({ email: email });
        const decode = await bcrypt.compare(password, user.password);
        if (!user || !decode) {
            return res.status(401).send({ msg: 'Invalid username or password' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        });
        res.json({ data: user, token });
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});

/**
 * @swagger
 * /users:
 *   delete:
 *     summary: Delete a user (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: User ID required
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete("/users", isLoggedIn, async (req, res) => {
    try {
        if (!req.query.id) {
            return res.status(400).send({ msg: 'User ID is required to delete' });
        }
        if (req.role !== "admin") {
            return res.status(403).send({ msg: 'Forbidden: Only admin can access this route' });
        }
        const data = await User.findOneAndDelete({ _id: req.query.id });
        if (!data) {
            return res.status(404).send({ msg: "User not found" });
        }
        return res.status(200).send({ msg: "User has been deleted" });
    } catch (error) {
        return res.status(500).send({ msg: error.message });
    }
});

/**
 * @swagger
 * /user:
 *   patch:
 *     summary: Update current user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
router.patch("/user", isLoggedIn, async (req, res) => {
    try {
        const userId = req.userId;
        const updates = req.body;
        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *         password:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */