// db/index.js
import mongoose from "mongoose";
import config from "../utils/config/config.js";

export default async function Connector() {
  try {
    // Check if already connected to avoid multiple connections
    if (mongoose.connection.readyState === 1) {
      console.log("Already connected to MongoDB");
      return mongoose.connection;
    }

    const connection = await mongoose.connect(
      `mongodb+srv://${config.db.username}:${config.db.password}@cluster0.clshw.mongodb.net/?retryWrites=true&w=majority&appName=${config.db.database}`,
      {
        // Optional: Add connection options if needed
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        connectTimeoutMS: 10000, // Connection timeout
      }
    );
    console.log("Db connected successfully");
    return connection;
  } catch (err) {
    console.error("Error while connecting to MongoDB:", err.message);
    throw err; // Rethrow the error so the caller can handle it
  }
}