/**
 * Required External Modules and Interfaces
 */
import express, { Request, Response } from "express";

/**
 * Router Definition
 */
// export class HomeRoute {
//     public initialize(router:Router): void{
//         router.get('/', this.welcome.bind(this));
//     }
//     private async welcome(req: Request, res: Response): Promise<void> {
// 		res.json({
// 			message: 'Welcome to Paper Trail',
// 			query: req.query
// 		});
// 	}
// };

export const homeRouter = express.Router();
/**
 * Controller Definitions
 */
homeRouter.get('/', async (req: Request, res: Response): Promise<void> => {
    res.json({
        message: 'Welcome to Paper Trail!',
        query: req.query
    });
});