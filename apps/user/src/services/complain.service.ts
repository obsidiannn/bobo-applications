import { prisma } from "@/lib/database";
import { Prisma } from "@prisma/db-user";
import { IModel } from "@repo/enums";

export class ComplainService {
    private static instance: ComplainService;
    private model: Prisma.UserComplainDelegate;

    constructor() {
        this.model = prisma.userComplain
    }

    static async make() {
        if (!ComplainService.instance) {
            ComplainService.instance = new ComplainService()
        }
        return ComplainService.instance
    }

    static async doComplain(currentUserId: bigint, userId: bigint, imageUrls: string[], content?: string) {
        const instance = await ComplainService.make();
        const result = await instance.model.create({
            data: {
                fromUId: currentUserId,
                complainUserId: userId,
                imageUrls: imageUrls.join(','),
                content,
                status: IModel.ICommon.IActiveEnum.ACTIVE
            }
        })
        return result
    }
}