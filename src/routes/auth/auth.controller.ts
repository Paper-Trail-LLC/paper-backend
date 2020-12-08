import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { validate } from "class-validator";
import { PoolConnection } from "mysql"
import myPool from "../../helpers/mysql.pool"
import { User } from "../../models/user";
import { UserController } from "../users/user.controller";

const userController = new UserController();
export class AuthController {

    static login = async (req: Request, res: Response) => {
        //Check if email and password are set
        let { email, password } = req.body;
        if (!(email && password)) {
            res.status(400).send();
        }

        //Get user from database
        let user: User;
        try {
            // Fail if no user?
            console.log(email);
            user = await userController.getUserByEmail(email);
            console.table(user);
            user = new User(user.firstname, user.lastname, user.email, user.hash, user.created_on, user.updated_on, user.roles, undefined, user.gender,
                undefined, user.id, user.salt);
            console.table(user);
            //Check if encrypted password match
            if (!user.checkIfUnencryptedPasswordIsValid(password)) {
                res.status(401).send();
                return;
            }

            //Sing JWT, valid for 1 hour
            const token = jwt.sign(
                { userId: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname },
                <string>process.env.jwtSecret,
                { expiresIn: "1h" }
            );

            //Send the jwt in the response
            res.send(token);
        } catch (error) {
            console.log(error);
            res.status(401).send();
        }


    };
    static changePassword = async (req: Request, res: Response) => {
        //Get ID from JWT
        const userId = res.locals.jwtPayload.userId;

        //Get parameters from the body
        const { oldPassword, newPassword } = req.body;
        if (!(oldPassword && newPassword)) {
            res.status(400).send();
        }

        //Get user from the database
        let user: User;
        try {
            // Fail if no user?
            user = await userController.getUserById(userId, true);
            user = new User(user.firstname, user.lastname, user.email, user.hash, user.created_on, user.updated_on, user.roles, undefined, user.gender,
                undefined, user.id, user.salt);
            //Check if old password matchs
            if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
                res.status(401).send();
                return;
            }

            //Validate de model (password lenght)
            user.hash = newPassword;
            // TODO: Actually require a password style (minlength, uppercases, etc)
            // const errors = await validate(user);
            // if (errors.length > 0) {
            //     res.status(400).send(errors);
            //     return;
            // }
            //Hash the new password and save
            user.hashPassword();
            userController.updatePassword(user);
        } catch (userId) {
            res.status(401).send();
        }
        res.status(204).send();
    };
}