import multer from "multer"
export const upload =  multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/'); // Specify the directory for storing files
          }, 
          filename : (req , file , cb) => {
            cb(null, Date.now() + '-' + file.originalname); // Add timestamp to the file name
          }
    })
})