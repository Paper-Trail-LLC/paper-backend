import { BookPetition } from "../../models/petition";


export class PetitionsController {

    public async searchPetitions(status?: string, lending?: number, selling?: number, currentLocation?: number, locationRadius?: number, page: number = 1, limit: number = 25): Promise<BookPetition[]> {
        return new Promise<BookPetition[]>((resolve, reject) => {

        })
    }

    public async getPetitionsByUser(userId: string, status?: string, lending?: number, selling?: number, page: number = 1, limit: number = 25): Promise<BookPetition[]> {
        return new Promise<BookPetition[]>((resolve, reject) => {

        })
    }

}