import { Meilisearch } from "meilisearch";

let client: Meilisearch | null

const getClient = () => {
    if (!client) {
        client = new Meilisearch({
            host: process.env.MEILISEARCH_ADDR,
            apiKey: process.env.MEILISEARCH_API_KEY
        })
    }
    return client
}

export default {
    getClient
}