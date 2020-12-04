enum Roles {
    admin = 'ADMIN',
    member = 'MEMBER',
    guest = 'GUEST'

}
export class Role {
    name: string
    permissions: Object
    created_by: string
    created_on: Date
    constructor(name: string, permissions: Object, created_by:  string, created_on: Date) {
        this.name = name;
        this.permissions = permissions;
        this.created_by = created_by;
        this.created_on = created_on;
    }

}