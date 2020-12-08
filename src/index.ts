/**
 * Required External Modules
 */
import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { routesInit } from "./routes/index"
import { Server } from "http";

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
};
console.log(`Running with env: ${process.env.NODE_ENV}`);
dotenv.config({
  path: `./env/${process.env.NODE_ENV}.env`
});
/**
 * App Variables
 */
if (!process.env.PORT) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);
const app: express.Application = express();
let server: Server;
/**
 *  App Configuration
 */
app.use(helmet());
app.use(cors());
app.use(express.json());
routesInit(app);

/**
 * Webpack HMR Activation
 */
type ModuleId = string | number;

interface WebpackHotModule {
  hot?: {
    data: any;
    accept(
      dependencies: string[],
      callback?: (updatedDependencies: ModuleId[]) => void,
    ): void;
    accept(dependency: string, callback?: () => void): void;
    accept(errHandler?: (err: Error) => void): void;
    dispose(callback: (data: any) => void): void;
  };
}

declare const module: WebpackHotModule;

if (!process.env.NODE_ENV.toLowerCase().includes("test")) {
  /**
   * Server Activation
   */
  server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => server.close());
 }
}
export default app
