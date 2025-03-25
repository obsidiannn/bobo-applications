import { prisma as db } from "@/lib/database";
import { Prisma } from "@prisma/db-system";
export class CategoryService {
    static modelName: string = "sys_categories";
    private model: Prisma.SysCategoryDelegate;
    private static instance: CategoryService;
    private constructor() {
        this.model = db.sysCategory;
    }
    static async make() {
        if (!CategoryService.instance) {
            CategoryService.instance = new CategoryService();
        }
        return CategoryService.instance;
    }
    static async getList(type: number) {
        const instance = await CategoryService.make();
        return await instance.model.findMany({
            where: {
                type
            },
            orderBy: {
                sort: 'asc'
            },
        });
    }
}
