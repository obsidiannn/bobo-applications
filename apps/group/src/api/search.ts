import { search } from '@repo/grpc/client'

export const searchClient = new search.SearchProtoClient(process.env.SEARCH_GRPC_ADDR);
// import { search } from '@repo/grpc/client'

// export const searchClient = new search.SearchProtoClient(process.env.SEARCH_GRPC_ADDR);