const crypto = require('crypto')
const {InvalidTransaction} = require('sawtooth-sdk/processor/exceptions')

const hashFunction = (x, length) => crypto.createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, length)

const PAPER_TRAIL_FAMILY = 'paper_trail'
const PAPER_TRAIL_NAMESPACE = hashFunction(PAPER_TRAIL_FAMILY, 64).substring(0,6)

const ADDRESS_TYPE = {
    EXCHANGE: 'book-exchange-transaction',
    OWNERSHIP: 'ownership-change-transaction'
}

const makeAddress = (x, addressType) => PAPER_TRAIL_NAMESPACE + hashFunction(addressType, 32) + hashFunction(x, 32)

class PaperTrailState {
    constructor(context){
        this.context = context
        // this.cache = new Map([])
        this.timeout = 500
    }

    getExchangeTransactions(userBookId){
        return this._loadExchangeTransactions(userBookId).then((transactions) => transactions.get(userBookId))
    }

    getOwnershipHistory(userBookId){
        return this._loadOwnershipHistory(userBookId).then((ownership) => ownership.get(userBookId))
    }

    addExchangeTransaction(userBookId, ownerId, giver, receiver){
        let address = makeAddress(userBookId, ADDRESS_TYPE.EXCHANGE)
        return this._loadExchangeTransactions(userBookId)
            .then((transactions) => {
                if(!transactions){
                    transactions = new Map()
                } else if(!transactions.get(userBookId)){
                    transactions.set(userBookId, [])
                }
                transactions.get(userBookId).push({
                    userBookId,
                    ownerId,
                    giver,
                    receiver
                })
                return transactions
            }).then((transactions) => {
                let data = this._serialize(transactions, ADDRESS_TYPE.EXCHANGE)
                return this.context.setState({
                    [address]: data
                }, this.timeout)
            })
    }

    registerNewOwnership(userBookId, currentOwnerId, newOwnerId){
        let address = makeAddress(userBookId, ADDRESS_TYPE.OWNERSHIP)
        return this._loadOwnershipHistory(userBookId)
            .then((ownerships) => {
                if(!ownerships){
                    ownerships = new Map()
                } else if(!ownerships.get(userBookId)){
                    ownerships.set(userBookId, [])
                }
                ownerships.get(userBookId).push({
                    userBookId,
                    currentOwnerId,
                    newOwnerId
                })
                return ownerships
            }).then((ownerships) => {
                let data = this._serialize(ownerships, ADDRESS_TYPE.OWNERSHIP)
                return this.context.setState({
                    [address]: data
                }, this.timeout)
            })
    }

    _loadExchangeTransactions(userBookId){
        let address = makeAddress(userBookId, ADDRESS_TYPE.EXCHANGE)
        return this.context.getState([address], this.timeout).then((values) => {
            if(!values[address].toString()){
                return new Map([])
            } else {
                let data = values[address].toString()
                return this._deserialize(data, ADDRESS_TYPE.EXCHANGE)
            }
        })
    }

    _loadOwnershipHistory(userBookId){
        let address = makeAddress(userBookId, ADDRESS_TYPE.OWNERSHIP)
        return this.context.getState([address], this.timeout).then((values) => {
            if(!values[address].toString()){
                return new Map([])
            } else {
                let data = values[address].toString()
                return this._deserialize(data, ADDRESS_TYPE.OWNERSHIP)
            }
        })
    }

    _serialize(data, addressType){
        if(addressType == ADDRESS_TYPE.EXCHANGE){
            let exchanges = []
            for(let e of data){
                let userBookId = e[0]
                let exchangeTransactions = e[1]
                let et = exchangeTransactions.map(x => [userBookId, x.ownerId, x.giver, x.receiver].join(','))
                exchanges.push(et.join(';'))
            }
            return Buffer.from(exchanges.join('|'))
        } else if(addressType == ADDRESS_TYPE.OWNERSHIP){
            let ownerships = []
            for(let o of data){
                let userBookId = o[0]
                let ownershipHistory = o[1]
                let oh = ownershipHistory.map(x => [userBookId, x.currentOwnerId, x.newOwnerId].join(','))
                ownerships.push(oh.join(';'))
            }
            return Buffer.from(ownerships.join('|'))

        } else {
            throw new InvalidTransaction('Address type not supported or missing')
        }
    }

    _deserialize(data, addressType){
        if(addressType == ADDRESS_TYPE.EXCHANGE){
            let exchangeTransactions = data
                .split('|')
                .map((x) => x.split(';'))
                .map((y) => y.map((z) => z.split(',')))
                .map((exchangeList) => {
                    return [
                        exchangeList[0][0],
                        exchangeList.map((x) => {
                            return {
                                userBookId: x[0],
                                ownerId: x[1],
                                giver: x[2],
                                receiver: x[3]
                            }
                        }
                    )]
                })
            return new Map(exchangeTransactions)

        } else if (addressType == ADDRESS_TYPE.OWNERSHIP){
            let ownerships = data
                .split('|')
                .map((x) => x.split(';'))
                .map((y) => y.map((z) => z.split(',')))
                .map((ownershipList) => {
                    return [
                        ownershipList[0][0],
                        ownershipList.map((x) => {
                            return {
                                userBookId: x[0],
                                currentOwnerId: x[1],
                                newOwnerId: x[2]
                            }
                        }
                    )]
                })
            return new Map(ownerships)

        } else {
            throw new InvalidTransaction('Address type not supported or missing')
        }
    }
}

module.exports = {
    PAPER_TRAIL_FAMILY,
    PAPER_TRAIL_NAMESPACE,
    PaperTrailState
}