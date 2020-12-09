import {createContext, CryptoFactory} from 'sawtooth-sdk/signing'
import cbor from 'cbor'
import {protobuf} from 'sawtooth-sdk'
import crypto from 'crypto'
import { ExchangeTransaction } from '../models/exchangeTransaction'
import Axios, { AxiosInstance } from 'axios'
import { OwnershipHistory } from '../models/ownershipHistory'

const context = createContext('secp256k1')
const privateKey = context.newRandomPrivateKey()
const signer = new CryptoFactory(context).newSigner(privateKey)

const hashFunction = (x: any, length: number) => crypto.createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, length)

const PAPER_TRAIL_FAMILY = 'paper_trail'
const PAPER_TRAIL_NAMESPACE = hashFunction(PAPER_TRAIL_FAMILY, 6)

const ADDRESS_TYPE = {
    EXCHANGE: 'book-exchange-transaction',
    OWNERSHIP: 'ownership-change-transaction'
}

const OPERATIONS = {
    GET_EXCHANGE_TRANSACTIONS: 'get-exchange-transaction-history',
    GET_OWNERSHIP_HISTORY: 'get-ownership-history',
    ADD_EXCHANGE_TRANSACTION: 'book-exchange-transaction',
    REGISTER_OWNERSHIP_CHANGE: 'ownership-change-transaction'
}

const makeAddress = (x: any, addressType: string) => PAPER_TRAIL_NAMESPACE + hashFunction(addressType, 32) + hashFunction(x, 32)

const _serialize = (data: any, addressType: string) => {
    if(addressType == ADDRESS_TYPE.EXCHANGE){
        let exchanges = []
        for(let e of data){
            let userBookId = e[0]
            let exchangeTransactions = e[1]
            let et = exchangeTransactions.map((x: any) => [userBookId, x.ownerId, x.giver, x.receiver].join(','))
            exchanges.push(et.join(';'))
        }
        return Buffer.from(exchanges.join('|'))
    } else if(addressType == ADDRESS_TYPE.OWNERSHIP){
        let ownerships = []
        for(let o of data){
            let userBookId = o[0]
            let ownershipHistory = o[1]
            let oh = ownershipHistory.map((x: any) => [userBookId, x.currentOwnerId, x.newOwnerId].join(','))
            ownerships.push(oh.join(';'))
        }
        return Buffer.from(ownerships.join('|'))

    } else {
        throw new Error('Address type not supported or missing')
    }
}

const _deserialize = (data: any, addressType: string) => {
    if(addressType == ADDRESS_TYPE.EXCHANGE){
        let exchangeTransactions = data
            .split('|')
            .map((x: any) => x.split(';'))
            .map((y: any) => y.map((z: any) => z.split(',')))
            .map((exchangeList: any) => {
                return [
                    exchangeList[0][0],
                    exchangeList.map((x: any) => {
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
            .map((x: any) => x.split(';'))
            .map((y: any) => y.map((z: any) => z.split(',')))
            .map((ownershipList: any) => {
                return [
                    ownershipList[0][0],
                    ownershipList.map((x: any) => {
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
        throw new Error('Address type not supported or missing')
    }
}

export default class BlockchainClient {
    axios: AxiosInstance

    constructor(){
        this.axios = Axios.create({
            baseURL: 'tcp://rest-api-0:8008',
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        })
    }

    public async getExchangeTransactionsOfUserBook(userBookId: string): Promise<ExchangeTransaction[]>{
        return new Promise(async (resolve, reject) => {
            try{
                const payload = `${OPERATIONS.GET_EXCHANGE_TRANSACTIONS},${userBookId}`
                const address = makeAddress(userBookId, ADDRESS_TYPE.EXCHANGE)

                const body = this._createRequestBatch(payload, [address], [address])
                // const response = await this.axios.post('/batches', body)
                const response = await this.axios.get(`/state/${address}`)
                const result = _deserialize(Buffer.from(response.data.data).toString(), ADDRESS_TYPE.EXCHANGE)
                console.log(result)

                const exchanges:any[] = result.get(userBookId) as any[]
                resolve(exchanges.map<ExchangeTransaction>(exchange => new ExchangeTransaction(
                    exchange.userBookId,
                    exchange.ownerId,
                    exchange.giver,
                    exchange.receiver
                )))

            } catch(error) {
                reject(error)
            }
        })
    }

    public async getOwnershipHistoryOfUserBook(userBookId: string): Promise<OwnershipHistory[]>{
        return new Promise<OwnershipHistory[]>(async (resolve, reject) => {
            try{
                const payload = `${OPERATIONS.GET_OWNERSHIP_HISTORY},${userBookId}`
                const address = makeAddress(userBookId, ADDRESS_TYPE.OWNERSHIP)

                const body = this._createRequestBatch(payload, [address], [address])
                // const response = await this.axios.post('/batches', body)
                const response = await this.axios.get(`/state/${address}`)
                console.log(response)
                const result = _deserialize(Buffer.from(response.data.data).toString(), ADDRESS_TYPE.OWNERSHIP)
                console.log(result)

                const ownerships:any[] = result.get(userBookId) as any[]
                resolve(ownerships.map<OwnershipHistory>(ownership => new OwnershipHistory(
                    ownership.userBookId,
                    ownership.currentOwnerId,
                    ownership.newOwnerId
                )))

            } catch(error) {
                reject(error)
            }
        })
    }

    public async addExhangeTransaction(userBookId: string, ownerId: string, giver: string, receiver: string): Promise<any>{
        return new Promise<any>(async (resolve, reject) => {
            try{
                const payload = `${OPERATIONS.ADD_EXCHANGE_TRANSACTION},${userBookId},${ownerId},${giver},${receiver}`
                const address = makeAddress(userBookId, ADDRESS_TYPE.EXCHANGE)

                const body = this._createRequestBatch(payload, [address], [address])
                const response = await this.axios.post('/batches', body)

                resolve(response.data)

            } catch(error) {
                reject(error)
            }
        })
    }

    public async registerOwnershipChange(userBookId: string, currentOwnerId: string, newOwnerId: string): Promise<any>{
        return new Promise<any>(async (resolve, reject) => {
            try{
                const payload = `${OPERATIONS.REGISTER_OWNERSHIP_CHANGE},${userBookId},${currentOwnerId},${newOwnerId}`
                const address = makeAddress(userBookId, ADDRESS_TYPE.OWNERSHIP)

                const body = this._createRequestBatch(payload, [address], [address])
                const response = await this.axios.post('/batches', body)

                resolve(response.data)

            } catch(error) {
                reject(error)
            }
        })
    }

    private _createRequestBatch(payload: string, inputs: string[], outputs: string[]){
        // const bytes: Buffer = cbor.encode(payload) as Buffer
        const bytes: Buffer = Buffer.from(payload)

        const transactionHeaderBytes = protobuf.TransactionHeader.encode({
            familyName: PAPER_TRAIL_FAMILY,
            familyVersion: '1.0',
            inputs: inputs,
            outputs: outputs,
            signerPublicKey: signer.getPublicKey().asHex(),
            batcherPublicKey: signer.getPublicKey().asHex(),
            dependencies:[],
            payloadSha512: crypto.createHash('sha512').update(bytes).digest('hex')
        }).finish()

        const s1 = signer.sign(transactionHeaderBytes as Buffer)
        const transaction = protobuf.Transaction.create({
            header: transactionHeaderBytes,
            headerSignature: s1,
            payload: bytes
        })

        const transactions = [transaction]
        const batchHeaderBytes = protobuf.BatchHeader.encode({
            signerPublicKey: signer.getPublicKey().asHex(),
            transactionIds: transactions.map((tx) => tx.headerSignature)
        }).finish()

        const s2 = signer.sign(batchHeaderBytes as Buffer)
        const batch = protobuf.Batch.create({
            header: batchHeaderBytes,
            headerSignature: s2,
            transactions: transactions
        })

        const batchListBytes = protobuf.BatchList.encode({
            batches: [batch]
        }).finish()

        return batchListBytes
    }
}