import { Phone } from "./phone";
import { Address } from "./address";
import { Role } from "./role";
import bcrypt from "bcryptjs";
import { Length, IsNotEmpty } from "class-validator";

export class User {
    id?: string
    firstname: string
    lastname: string
    email: string
    gender?: string
    hash: string
    salt?: string
    created_on?: Date
    updated_on?: Date
    phone?: Array<Phone>
    roles: Array<Role>
    address?: Array<Address>
    geolocation : Array<number>
    constructor(
        firstname: string,
        lastname: string,
        email: string,
        hash: string,
        created_on: Date = new Date(),
        updated_on: Date = new Date(),
        roles: Array<Role> = [new Role('MEMBER')],
        geolocation: Array<number> = [0,0],
        gender: string = '',
        phone?: Array<Phone>,
        id?: string,
        salt?: string,
        address?: Array<Address>) {
        this.id = id
        this.firstname = firstname
        this.lastname = lastname
        this.email = email
        this.gender = gender
        this.hash = hash
        if (salt!=undefined && salt!=null && salt!='') {
            this.salt = salt
        }
        else {
            this.salt = bcrypt.genSaltSync();
        }
        this.created_on = created_on
        this.updated_on = updated_on
        this.phone = phone
        this.roles = roles
        this.geolocation = geolocation
        this.address = address
    }

    hashPassword() {
        this.hash = bcrypt.hashSync(this.hash, this.salt);
    }

    checkIfUnencryptedPasswordIsValid(unencryptedPassword: string): boolean {
        return bcrypt.compareSync(unencryptedPassword, this.hash);
    }

}