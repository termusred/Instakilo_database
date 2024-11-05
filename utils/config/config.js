import dotenv from "dotenv"
dotenv.config()
 const   config = {
    db : {
        username : process.env.DB_USER ,
        password :  process.env.DB_PASS,
        database : process.env.DB_NAME
    } ,
    jwt : {
        secret : process.env.JWT_SECRET ,
        expiresIn : process.env.JWT_EXPIRES_IN,
    } ,
    port : process.env.PORT
}

export default config;