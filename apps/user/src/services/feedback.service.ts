import { prisma } from "@/lib/database";
import { Prisma } from "@prisma/db-user";
import { IModel } from "@repo/enums";

export class FeedbackService {
    private static instance: FeedbackService;
    private model: Prisma.UserFeedbackDelegate;

    constructor() {
        this.model = prisma.userFeedback
    }

    static async make() {
        if (!FeedbackService.instance) {
            FeedbackService.instance = new FeedbackService()
        }
        return FeedbackService.instance
    }

    static async doFeedback(currentUserId: bigint, imageUrls: string[], categoryId: bigint, content?: string) {
        const instance = await FeedbackService.make();
        const result = await instance.model.create({
            data: {
                fromUId: currentUserId,
                imageUrls: imageUrls.join(','),
                content,
                categoryId,
                status: IModel.ICommon.IActiveEnum.ACTIVE
            }
        })
        return result
    }
}