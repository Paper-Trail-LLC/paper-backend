import express, { Request, Response } from "express";
import { UserController } from './user.controller';
import { checkJwt } from '../../helpers/checkJwt';
import { checkRole } from '../../helpers/checkRole';
/**
 * Router Definition
 */
export const userRouter = express.Router();

/**
 * Routes and method definitions
 */
const userController: UserController = new UserController()

// Get all users
userRouter.get('/', [checkJwt, checkRole(['ADMIN'])], userController.getAllUsers);
// Get user by id
userRouter.get('/:id', [checkJwt, checkRole(['ADMIN'])], userController.getUserById);
// Create new user
userRouter.post('/',  [checkJwt, checkRole(['ADMIN'])], userController.createUser);
// Edit user
userRouter.patch('/:id', [checkJwt, checkRole(['ADMIN'])], userController.editUser);
// "Delete" user
userRouter.delete('/:id', [checkJwt, checkRole(['ADMIN'])], userController.deleteUser);