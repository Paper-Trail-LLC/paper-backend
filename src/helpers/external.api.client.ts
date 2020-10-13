import axios from "axios"

const ExternalAPI = axios.create({
    baseURL: 'https://api2.isbndb.com/',
    headers: {
        'Authorization':'44606_bedee731eedae1de2bd55812d4186410'
    }
})

export default ExternalAPI