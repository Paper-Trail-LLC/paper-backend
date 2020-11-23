import { Agreement } from "./agreement";

export class MeetingAgreement extends Agreement {
    geolocation?: [number, number]
    place?: string
    meetingDate?: Date
    requests: Object[]

    constructor(userBookId: string, userId: string, status: string, createdOn: Date, updatedOn: Date, requests: Object[], id?: string, geolocation?: [number, number], place?: string, meetingDate?: Date) {
        super(userBookId, userId, status, createdOn, updatedOn, id)
        this.geolocation = geolocation
        this.place = place
        this.meetingDate = meetingDate
        this.requests = requests
    }
}