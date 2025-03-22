import express from "express";
import serverless from "serverless-http";
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

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(express.json());

// Lazy-load database connection
let isConnected = false;
async function connectToDb() {
  if (!isConnected) {
    try {
      await Connector();
      isConnected = true;
      console.log("Database connection established");
    } catch (error) {
      console.error("Failed to connect to database:", error.message);
      // Don't throw here; let the app continue without DB if needed
    }
  }
}

// Static files
app.use("/images", express.static("uploads"));

// Swagger setup
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
  apis: ["./routes/*.js"],
};

try {
  const swaggerDocs = swaggerJsdoc(swaggerOptions);
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocs, {
      swaggerOptions: {
        url: "/api-docs/swagger.json",
      },
    })
  );
} catch (error) {
  console.error("Swagger setup failed:", error.message);
}

// Routes with DB check
app.use(async (req, res, next) => {
  await connectToDb();
  if (!isConnected) {
    return res.status(503).send("Service Unavailable: Database not connected");
  }
  next();
});
app.use(UsersRoute);
app.use(PostsRoute);
app.use(CommentRoute);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).send("Internal Server Error");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", dbConnected: isConnected });
});

export default serverless(app);