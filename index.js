import express from "express"
import Connector from "./db/index.js"
import UsersRoute from "./routes/Users.js"
import CommentRoute from "./routes/Comments.js"
import cors from "cors"
import PostsRoute from "./routes/Posts.js"

const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true // If you're dealing with cookies or sessions
}));

app.use(express.json())

Connector()
app.use("/images", express.static("uploads"))
app.use(UsersRoute)
app.use(PostsRoute)
app.use(CommentRoute)



app.listen(3000 , (req , res)=>{
    console.log("Running good");
})

