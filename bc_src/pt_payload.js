const {InvalidTransaction} = require('sawtooth-sdk/processor/exceptions')
const cbor = require('cbor')

class PaperTrailPayload {
    constructor(operation, data){
        this.operation = operation
        this.data = data
    }

    static fromBytes(payload) {
        payload = payload.toString().split(',')
        let operation = payload[0]

        switch(operation){
            case 'book-exchange-transaction':
                let bet = {
                    userBookId: payload[1],
                    ownerId: payload[2],
                    giver: payload[3],
                    receiver: payload[4]
                }
                return new PaperTrailPayload(operation, bet)

            case 'ownership-change-transaction':
                let oct = {
                    userBookId: payload[1],
                    currentOwnerId: payload[2],
                    newOwnerId: payload[3]
                }
                return new PaperTrailPayload(operation, oct)

            case 'get-exchange-transaction-history':
                let geth = {
                    userBookId: payload[1]
                }
                return new PaperTrailPayload(operation, geth)

            case 'get-ownership-history':
                let goh = {
                    userBookId: payload[1]
                }
                return new PaperTrailPayload(operation, goh)
                
            default:
                throw new InvalidTransaction('Operation type was not provided or is not supported')
        }
    }
}

module.exports = PaperTrailPayload