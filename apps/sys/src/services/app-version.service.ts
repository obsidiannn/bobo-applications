import { prisma as db } from "@/lib/database";
import { Prisma } from "@prisma/db-system";
export class AppVersionService {
  static modelName: string = "app_versions";
  private model: Prisma.AppVersionDelegate;
  private static instance: AppVersionService;
  private constructor() {
    this.model = db.appVersion;
  }
  static async make() {
    if (!AppVersionService.instance) {
      AppVersionService.instance = new AppVersionService();
    }
    return AppVersionService.instance;
  }
  static async getList(language: string, platform: string, limit: number = 10, offset: number = 0) {
    const instance = await AppVersionService.make();
    return await instance.model.findMany({
      where: {
        platform,
        language,
      },
      skip: offset,
      take: limit,
      orderBy: {
        versionCode: "desc",
      },
    });
  }
}
