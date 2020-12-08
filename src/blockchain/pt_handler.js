const {TransactionHandler} = require('sawtooth-sdk/processor/handler')

const {PAPER_TRAIL_FAMILY, PAPER_TRAIL_NAMESPACE} = require('./state')

class PaperTrailHandler extends TransactionHandler {
    constructor(){
        super(PAPER_TRAIL_FAMILY, [1.0], [PAPER_TRAIL_NAMESPACE])
    }

    apply(transactionProcessRequest, context) {
        
    }
}