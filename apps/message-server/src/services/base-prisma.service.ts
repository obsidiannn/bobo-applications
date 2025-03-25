import { PrismaClient } from '@prisma/db-message'
import * as PrismaRuntime from '@prisma/db-message/runtime/library.js'
import { prisma } from '../lib/database'

export class BasicPrismaContext {
  constructor(
    private readonly prisma?: Omit<
      PrismaClient,
      PrismaRuntime.ITXClientDenyList
    >
  ) { }

  protected getClient(): PrismaClient | Omit<
    PrismaClient,
    PrismaRuntime.ITXClientDenyList
  > {
    return this.prisma === null || this.prisma === undefined
      ? prisma
      : this.prisma
  }
}
