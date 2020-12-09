const {TransactionHandler} = require('sawtooth-sdk/processor/handler')
const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions')

const {PAPER_TRAIL_FAMILY, PAPER_TRAIL_NAMESPACE, PaperTrailState} = require('./pt_state')
const PaperTrailPayload = require('./pt_payload')

class PaperTrailHandler extends TransactionHandler {
    constructor(){
        super(PAPER_TRAIL_FAMILY, ['1.0'], [PAPER_TRAIL_NAMESPACE])
    }

    apply(transactionProcessRequest, context) {
        let payload = PaperTrailPayload.fromBytes(transactionProcessRequest.payload)
        let state = new PaperTrailState(context)

        if(payload.operation == 'book-exchange-transaction'){
            return state.addExchangeTransaction(payload.data.userBookId, payload.data.ownerId, payload.data.giver, payload.data.receiver)

        } else if(payload.operation == 'ownership-change-transaction'){
            return state.registerNewOwnership(payload.data.userBookId, payload.data.currentOwnerId, payload.data.newOwnerId)

        } else if(payload.operation == 'get-exchange-transaction-history'){
            return state.getExchangeTransactions(payload.data.userBookId)

        } else if(payload.operation == 'get-ownership-history'){
            return state.getOwnershipHistory(payload.data.userBookId)

        } else {
            throw new InvalidTransaction('Operation not supported or is missing.')
        }
    }
}

module.exports = PaperTrailHandler