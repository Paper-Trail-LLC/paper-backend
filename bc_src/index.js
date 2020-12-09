const {TransactionProcessor} = require('sawtooth-sdk/processor')
const PaperTrailHandler = require('./pt_handler')

const address = process.env.VALIDATOR_ADDRESS
const transactionProcessor = new TransactionProcessor(address)

transactionProcessor.addHandler(new PaperTrailHandler())

transactionProcessor.start()