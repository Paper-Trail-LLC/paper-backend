import { userRouter } from "@src/routes/users/user";
import { Request, Response, NextFunction } from "express";
import { UserController } from '../routes/users/user.controller';
import { Role } from '../models/role'
const userController: UserController = new UserController()
export const checkRole = (roles: Array<string>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        //Get the user ID from previous midleware
        const userId = res.locals.jwtPayload.userId;
        // These will be that user roles from the DB
        let userRoles: Array<Role>;
        // Assume it doesn't have the role
        let hasRole = false;
        try {
            //Get user roles from the database
            userRoles = await userController.getUserRoles(userId);
            console.log(userRoles);
            //Check if array of authorized roles includes the user's role
            userRoles.forEach(r => {
                // >-1 meains that a role match between what the user has and what is needed
                if (roles.indexOf(r.name) > -1) {
                    hasRole = true;
                    next();
                    return;
                }
            });
            if (!hasRole) {
                res.status(401).send();
            }
        } catch (err) {
            console.log(err)
            res.status(401).send();
            return
        }
        // If by here you didn't find a matching role, then send unauthorized

    }
}