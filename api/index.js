import express from "express";
import Connector from "../db/index.js";
import UsersRoute from "../routes/Users.js";
import CommentRoute from "../routes/Comments.js";
import PostsRoute from "../routes/Posts.js";
import cors from "cors";
import { config } from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

config();

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));

app.use(express.json());

Connector();

app.use("/images", express.static("uploads"));

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Your API Documentation",
            version: "1.0.0",
            description: "API documentation for your project",
        },
        servers: [
            { url: process.env.VERCEL_URL || "http://localhost:3000" },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: ["../routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(UsersRoute);
app.use(PostsRoute);
app.use(CommentRoute);

export default app;