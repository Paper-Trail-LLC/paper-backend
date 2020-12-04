/**
 *
 *
 * @export
 * @class Phone
 */
export class Phone {
    country_code: string
    number: string
    type: string
    created_on: Date
    /**
     *Creates an instance of Phone.
     * @param {string} country_code
     * @param {string} number
     * @param {string} type
     * @param {Date} created_on
     * @memberof Phone
     */
    constructor(    country_code: string,
        number: string,
        type: string,
        created_on: Date){
        this.country_code = country_code
        this.number = number
        this.type = type
        this.created_on = created_on
    }
    
}