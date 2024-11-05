import jwt from "jsonwebtoken";

const isLoggedIn = async (req, res, next) => {
    try {
        // Check if the Authorization header is present
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({ msg: 'JWT token required' });
        }

        const token = authHeader.split(' ')[1];
        
        const decoded = jwt.verify(token, 'bluryface'); 
        
        req.userId = decoded.id;
        req.role = decoded.role; 

        next();
    } catch (error) {
        console.error('JWT Verification Error:', error);
        return res.status(401).send({ msg: 'Invalid JWT token' });
    }
};

export default isLoggedIn;
