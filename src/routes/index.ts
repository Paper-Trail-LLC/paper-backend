import { homeRouter } from "./home/home"
import { booksRouter } from "./books/books"
import { userBooksRouter } from "./user-books/userbooks"
import { petitionsRouter } from "./petitions/petitions"
import express from "express"

/**
 * Initialize routes (let app know about routes)
 */
export function routesInit(app: express.Application): void {
    app.use("/", homeRouter);
    app.use("/books", booksRouter)
    app.use("/userbooks", userBooksRouter)
    app.use("/petitions", petitionsRouter)
};