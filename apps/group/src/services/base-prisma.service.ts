import { PrismaClient } from "@prisma/db-group";
import * as PrismaRuntime from "@prisma/client/runtime/library.js";
import { prisma } from "@/lib/database";
import { CachePlus } from "@repo/server/cache";
import { RedisCache } from "cache-manager-ioredis-yet";

export abstract class BaseService {
  constructor(
    private cacheInstance: RedisCache,
    private readonly prisma?: Omit<PrismaClient,PrismaRuntime.ITXClientDenyList>
  ) {
    this.cache = new CachePlus(this.prefixCacheKey(), cacheInstance);
  }

  private cache: CachePlus

  protected getCachePlus(): CachePlus {
    return this.cache
  }

  protected getClient(): PrismaClient | Omit<PrismaClient,PrismaRuntime.ITXClientDenyList> {
    return this.prisma === null || this.prisma === undefined? prisma : this.prisma
  }

  /**
   * 特定的 cache key prefix
   */
  protected abstract prefixCacheKey(): string;

}

