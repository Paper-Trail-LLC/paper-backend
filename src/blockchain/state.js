const crypto = require('crypto')

const hashFunction = (x) => crypto.createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, 64)

const PAPER_TRAIL_FAMILY = 'paper_trail'
const PAPER_TRAIL_NAMESPACE = hashFunction(PAPER_TRAIL_FAMILY).substring(0,6)

module.exports = {
    PAPER_TRAIL_FAMILY,
    PAPER_TRAIL_NAMESPACE
}