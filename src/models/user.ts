import { Phone } from "./phone";
import { Address } from "./address";
import { Role } from "./role";
import bcrypt from "bcryptjs";
import { Length, IsNotEmpty } from "class-validator";

export class User {
    id: string
    firstname: string
    lastname: string
    email: string
    gender?: string
    hash: string
    salt: string
    created_on: Date
    updated_on: Date
    phone?: Array<Phone>
    roles?: Array<Role>
    address?: Array<Address>
    constructor(id: string, firstname: string, lastname: string, email: string, hash: string, salt: string="justCapstone2020", created_on: Date,
        updated_on: Date, phone?: Array<Phone>, roles?: Array<Role>, address?: Array<Address>, gender?: string) {
        this.id = id
        this.firstname = firstname
        this.lastname = lastname
        this.email = email
        this.gender = gender
        this.hash = hash
        this.salt = salt
        this.created_on = created_on
        this.updated_on = updated_on
        this.phone = phone
        this.roles = roles
        this.address = address
    }

    hashPassword() {
        this.hash = bcrypt.hashSync(this.hash, this.salt);
    }

    checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
        return bcrypt.compareSync(unencryptedPassword, this.hash);
    }

}