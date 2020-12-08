const {TransactionProcessor} = require('sawtooth-sdk/processor')
const PTHandler = require('./pt_handler')

const adress = 'tcp://sawtooth-validator-default:4004'
const transactionProcessor = new TransactionProcessor(adress)

transactionProcessor.start()