import { createInstance } from '../req'
import { IServer } from "@repo/types";


export const getLists = async (): Promise<{
    nodes: IServer.INode[]
}> => await createInstance(false).post('/sys/nodes/getLists')