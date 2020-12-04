import { userRouter } from "@src/routes/users/user";
import { Request, Response, NextFunction } from "express";
import { UserController } from '../routes/users/user.controller';

const userController: UserController = new UserController()
export const checkRole = (roles: Array<string>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        //Get the user ID from previous midleware
        const userId = res.locals.jwtPayload.userId;
        // These will be that user roles from the DB
        let userRoles: Array<string>;
        // Assume it doesn't have the role
        let hasRole = false;
        try {
            //Get user roles from the database
            userRoles = await userController.getUserRoles(userId);
            //Check if array of authorized roles includes the user's role
            userRoles.forEach(r => {
                if (roles.indexOf(r) > -1) {
                    hasRole = true;
                }
            });
        } catch (userId) {
            res.status(401).send();
        }
        // TODO: Test if this works, if not, put inside try, after the forEach
        if (hasRole) next();
        else res.status(401).send();
    }
}