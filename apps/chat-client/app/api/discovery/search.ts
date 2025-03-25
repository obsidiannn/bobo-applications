import { createInstance } from '../req';


const query = async (param: {
    type: number
    keyword?: string
    page?: number
    limit?: number
}): Promise<{items: number[],total: number}> => await createInstance(true).post('/discovery/query', param);


export default {
    query
}