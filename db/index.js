import mongoose from "mongoose";
import config from "../utils/config/config.js";

export default async function Connector(){
    return mongoose
        .connect(`mongodb+srv://${config.db.username}:${config.db.password}@cluster0.clshw.mongodb.net/?retryWrites=true&w=majority&appName=${config.db.database}`)
        .then((res) => console.log("Db connected successfully"))
        .catch((err) => console.log("Error while connecting : " + err.message))
}