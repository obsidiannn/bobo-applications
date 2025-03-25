import meilisearch from "@/lib/meilisearch"
import { protos } from '@repo/grpc/proto'
import { TaskStatus } from "meilisearch"

export class SearchService {
    private static instance: SearchService
    static getInstance(): SearchService {
        if (!this.instance) {
            this.instance = new SearchService()
        }
        return this.instance
    }

    idKey(type: protos.search.SearchResultTypeEnum, id: string): string {
        return this.enumKey(type) + "_" + id
    }

    enumKey(type: protos.search.SearchResultTypeEnum) {
        switch (type) {
            case protos.search.SearchResultTypeEnum.GROUP:
                return "groups"
        }
        return "default"
    }

    async createIndex(req: protos.search.SearchIndexRequest) {
        console.log('create index', req, req.searchType.toString());

        const client = meilisearch.getClient()
        let index = client.index(this.enumKey(req.searchType))

        const result = await index.addDocuments(
            [{
                ...req,
                id: this.idKey(req.searchType, req.refId)
            }],
            { primaryKey: "id" }
        )

        console.log('create index result ', result);

        return result.status === TaskStatus.TASK_SUCCEEDED
    }

    async search(type: protos.search.SearchResultTypeEnum, limit: number, offset: number, keyword?: string) {
        console.log(type, limit, offset, keyword);

        const client = meilisearch.getClient()
        const index = client.index(this.enumKey(type))
        
        return index.search(keyword, {
            limit, offset,
            attributesToRetrieve: ["refId"],
        })

    }

    async deleteIdx(req: protos.search.DropIndexRequest) {
        const inStr = req.refIds.join(',')
        const client = meilisearch.getClient()
        const index = client.index(this.enumKey(req.searchType))
        const result = await index.deleteDocuments({
            filter: [
                "refId in [" + inStr + "]"
            ]
        })
        return result.status === TaskStatus.TASK_SUCCEEDED
    }

}
