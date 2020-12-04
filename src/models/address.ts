/**
 *
 *
 * @export
 * @class Address
 */
export class Address {
    id: string
    address: string
    address2?: string
    city: string
    country: string
    zip: string
    created_on: Date
    /**
     *Creates an instance of Address.
     * @param {string} id
     * @param {string} address
     * @param {string} city
     * @param {string} country
     * @param {string} zip
     * @param {Date} created_on
     * @param {string} [address2]
     * @memberof Address
     */
    constructor(id: string,
        address: string,
        city: string,
        country: string,
        zip: string,
        created_on: Date,
        address2?: string,) {
            this.id= id;
            this.address= address;
            this.address2= address2;
            this.city= city;
            this.country= country;
            this.zip= zip;
            this.created_on= created_on; 
    }

}