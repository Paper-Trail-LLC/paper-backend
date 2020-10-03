import { homeRouter } from "./home/home"
import { booksRouter } from "./books/books"
import express from "express"

/**
 * Initialize routes (let app know about routes)
 */
export function routesInit(app: express.Application): void {
    app.use("/", homeRouter);
    app.use("/books", booksRouter)
};