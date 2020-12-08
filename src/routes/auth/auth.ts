import express, { Request, Response } from "express";
import { AuthController } from './auth.controller';
import { checkJwt } from '../../helpers/checkJwt';
/**
 * Router Definition
 */
export const authRouter = express.Router();

/**
 * Routes and method definitions
 */
const authController: AuthController = new AuthController()

/**
 * Login route
 */
authRouter.post('/login', AuthController.login);

authRouter.post('/change-password', [checkJwt], AuthController.changePassword);