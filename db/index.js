import mongoose from "mongoose";
import config from "../utils/config/config.js";

export default async function Connector() {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("Already connected to MongoDB");
      return mongoose.connection;
    }

    const connection = await mongoose.connect(
      `mongodb+srv://${config.db.username}:${config.db.password}@cluster0.clshw.mongodb.net/?retryWrites=true&w=majority&appName=${config.db.database}`,
      {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      }
    );
    console.log("Db connected successfully");
    return connection;
  } catch (err) {
    console.error("Error while connecting to MongoDB:", err.message);
    throw err;
  }
}