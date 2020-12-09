import express, { Request, Response } from "express";
import { UserController } from './user.controller';
import { checkJwt } from '../../helpers/checkJwt';
import { checkRole } from '../../helpers/checkRole';
import { User } from "../../models/user";
import { Role } from "../../models/role";
import { userBooksRouter } from "../user-books/userbooks";
import { isError } from "util";
/**
 * Router Definition
 */
export const userRouter = express.Router();

/**
 * Routes and method definitions
 */
const userController: UserController = new UserController()

// Get all users
//  [checkJwt, checkRole(['ADMIN'])],
userRouter.get('/', [checkJwt, checkRole(['ADMIN'])], async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await userController.getAllUsers();
        //Send the users object
        res.send(users);
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
});
// Get user by id
userRouter.get('/me', [checkJwt, checkRole(['MEMBER', 'ADMIN'])], async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await userController.getUserById(res.locals.jwtPayload.userId);
        res.send(user);
    } catch (err) {
        res.status(404).send("User not found");
    }
});

// Get user by id
userRouter.get('/:id', [checkJwt, checkRole(['ADMIN'])], async (req: Request, res: Response): Promise<void> => {
    //Get the ID from the url
    const id: string = req.params.id;
    if (!id) {
        res.status(400).json({
            error: "Query parameters 'id' is required."
        })
    }
    else {
        try {
            const user = await userController.getUserById(id);
            res.send(user);
        } catch (err) {
            res.status(404).send("User not found");
        }
    }
});
// Create new user [checkJwt, checkRole(['ADMIN'])],
userRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
    //Get parameters from the body
    let { firstname, lastname, email, gender, hash, phone } = req.body;
    //Validade if the parameters are ok
    if (!firstname || !lastname || !email || !hash || !phone) {
        res.status(400).json({
            error: "Need at least firstname, lastname, email, hash, and a phone number."
        })
        return
    }
    let user = new User(firstname, lastname, email, hash, undefined, undefined, undefined, undefined, gender, [phone]);
    //Hash the password, to securely store on DB
    user.hashPassword();
    console.info(user);
    //Try to save. If fails, the email is already in use
    try {
        const userId = await userController.createUser(user);
        user.id = userId;
    } catch (e) {
        console.error(e);
        res.status(409).send("Email already in use");
        return;
    }

    //If all ok, send 201 response
    res.status(201).send("User created");
});

// Create new user [checkJwt, checkRole(['ADMIN'])],
userRouter.post('/', [checkJwt, checkRole(['ADMIN'])], async (req: Request, res: Response): Promise<void> => {
    //Get parameters from the body
    let { firstname, lastname, email, gender, hash, phone, address } = req.body;
    //Validade if the parameters are ok
    if (!firstname || !lastname || !email || !hash || !phone) {
        res.status(400).json({
            error: "Need at least firstname, lastname, email, hash, and a phone number."
        })
        return
    }
    let user = new User(firstname, lastname, email, hash, undefined, undefined, undefined, undefined, gender, [phone]);
    //Hash the password, to securely store on DB
    user.hashPassword();
    console.info(user);
    //Try to save. If fails, the email is already in use
    try {
        const userId = await userController.createUser(user);
        user.id = userId;
    } catch (e) {
        console.error(e);
        res.status(409).send("Email already in use");
        return;
    }

    //If all ok, send 201 response
    res.status(201).send("User created");
});
// Edit user
userRouter.patch('/:id', [checkJwt, checkRole(['ADMIN'])], async (req: Request, res: Response): Promise<void> => {
    // userController.editUser
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    const { firstname, lastname, email, gender, geolocation } = req.body;

    //Try to find user on database
    let user;
    try {
        user = await userController.getUserById(id);
    } catch (error) {
        //If not found, send a 404 response
        res.status(404).send("User not found");
        return;
    }

    //Validate the new values on model
    user.firstname = firstname ? firstname : user.firstname;
    user.lastname = lastname ? lastname : user.lastname;
    user.email = email ? email : user.email;
    user.gender = gender ? gender : user.gender;
    user.geolocation = geolocation ? geolocation : user.geolocation;

    //Try to safe, if fails, that means username already in use
    try {
        await userController.editUser(user);
    } catch (e) {
        res.status(409).send("username already in use");
        return;
    }
    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
});

// "Delete" user
userRouter.delete('/:id', [checkJwt, checkRole(['ADMIN'])], async (req: Request, res: Response): Promise<void> => {
    //Get the ID from the url
    const id = req.params.id;

    let user: User;
    try {
        user = await userController.getUserById(id);
    } catch (error) {
        res.status(404).send("User not found");
        return;
    }
    userController.deleteUser(id);

    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
});

// Add new role to user [checkJwt, checkRole(['ADMIN'])],
userRouter.post('/role/:id', [checkJwt, checkRole(['ADMIN'])], async (req: Request, res: Response): Promise<void> => {
    //Get parameters from the body
    const id = req.params.id;
    const { role_name } = req.body;
    //Validade if the parameters are ok
    if (!role_name) {
        res.status(400).json({
            error: "The information required was not provided."
        })
        return
    }
    //Try to find user on database
    let user: User;
    try {
        user = await userController.getUserById(id);
    } catch (error) {
        res.status(404).send("User not found");
        return;
    }
    // See if role not already assigned
    let roles: Array<Role>;
    try {
        roles = await userController.getUserRoles(id);
        if (roles.map((r) => { return r.name }).indexOf(role_name) > -1) {
            res.status(409).send("Couldn't assign role.");
            return;
        }
    } catch (error) {
        res.status(404).send("User or roles");
        return;
    }
    // Add role to user
    try {
        await userController.assignUserRole(id, role_name, res.locals.jwtPayload.userId);
    } catch (error) {
        res.status(500).send("Couldn't add role.");
        return;
    }


    //If all ok, send 204 response
    res.status(204).send();
});

