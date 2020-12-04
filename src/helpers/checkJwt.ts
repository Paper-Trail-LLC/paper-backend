import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
    // Get jwt token from the head
    const token = <string>req.headers["auth"];
    const jwtSecret = <string>process.env.jwtSecret
    let jwtPayload;

    // Try to validate the token and get data
    try {
        // Create model to eliminate 'any'
        jwtPayload = <any>jwt.verify(token, jwtSecret);
        res.locals.jwtPayload = jwtPayload;
    } catch (err) {
        // If token is not valid, respond with 401 (unauthorized)
        res.status(401).send();
        return
    }

    //The token is valid for 1 hour
    //We want to send a new token on every request
    const { userId, email } = jwtPayload;
    const newToken = jwt.sign({ userId, email }, jwtSecret, {
        expiresIn: "1h"
    });
    res.setHeader("token", newToken);

    //Call the next middleware or controller
    next();
}