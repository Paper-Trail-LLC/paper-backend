import { BookPetition } from "../../models/petition";


export class PetitionsController {

    public async searchPetitions(status?: string, lending?: number, selling?: number, currentLocation?: number, expired?: boolean, page: number = 1, limit: number = 25): Promise<BookPetition[]> {
        return new Promise<BookPetition[]>((resolve, reject) => {
            console.log(status, lending, selling, currentLocation, expired, page, limit)
            resolve([])
        })
    }

    public async getPetitionById(petitionId: string): Promise<BookPetition> {
        return new Promise<BookPetition>((resolve, reject) => {
            console.log(petitionId)
            resolve()
        })
    }

    public async getPetitionsByUser(userId: string, status?: string, lending?: number, selling?: number, expired?: boolean, page: number = 1, limit: number = 25): Promise<BookPetition[]> {
        return new Promise<BookPetition[]>((resolve, reject) => {
            console.log(userId, status, lending, selling, expired, page, limit)
        })
    }

    public async insertBookPetition(userId: string, bookId: string, status: string, description: string, lending: number, selling: number, geolocation: [number, number], locationRadius: number, expirationDate: Date): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            console.log(status, lending, selling, description, geolocation, locationRadius, expirationDate)
            resolve('')
        })
    }

    public async updateBookPetition(petitionId: string, status?: string, description?: string, lending?: number, selling?: number, geolocation?: [number, number], locationRadius?: number, expirationDate?: Date): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            console.log(status, lending, selling, description, geolocation, locationRadius, expirationDate)
            resolve('')
        })
    }
}