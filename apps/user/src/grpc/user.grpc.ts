import * as grpc from '@grpc/grpc-js';
import { protos } from '@repo/grpc/proto';
import { UserService } from '@/services/user.service';
import { User } from '@prisma/db-user';
import dayjs from 'dayjs';
import JsonBigInt from 'json-bigint'
const dateVal = (d: Date | null): bigint => {
    return d ? BigInt(dayjs(d).unix()) : 0n
}

const transformUser = (user: User): protos.user.User => {
    return {
        id: BigInt(user.id),
        addr: user.addr ?? "",
        userName: user.userName ?? "",
        nickName: user.nickName ?? "",
        avatar: user.avatar ?? "",
        gender: user.gender ?? 1,
        status: user.status ?? 1,
        pubKey: user.pubKey ?? "",
        createdAt: dateVal(user.createdAt),
        updatedAt: dateVal(user.updatedAt),
        deletedAt: dateVal(user.deletedAt),
        sign: user.sign ?? ''
    }
}
export const findUsersByAddrs = async (call: grpc.ServerUnaryCall<protos.user.FindUsersByAddrsRequest, protos.user.UserListResponse>, callback: grpc.sendUnaryData<protos.user.UserListResponse>) => {
    const request = call.request;
    console.log('address', request);

    const users = (await UserService.findByAddrs(request.addrs)).map((item) => transformUser(item))
    console.log('grpc addrs users', users);
    console.log('Response:', JsonBigInt.stringify({ users }, null, 2));
    callback(null, { users } as protos.user.UserListResponse);

};
export const findUsersByIds = async (call: grpc.ServerUnaryCall<protos.user.FindUsersByIdsRequest, protos.user.UserListResponse>, callback: grpc.sendUnaryData<protos.user.UserListResponse>) => {
    const request = call.request;
    const users = await UserService.findByIds(request.ids.map(BigInt));
    callback(null, {
        users: users.map((item) => transformUser(item)),
    });
}