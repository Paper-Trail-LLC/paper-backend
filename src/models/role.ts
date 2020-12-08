enum Roles {
    admin = 'ADMIN',
    member = 'MEMBER',
    guest = 'GUEST'
}
export class Role {
    name: string
    // permissions: Object
    created_on?: Date
    created_by?: string
    constructor(name: string, created_on: Date = new Date(), created_by?: string) {
        this.name = name;
        this.created_on = created_on;
        this.created_by = created_by;
    }
}