// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v1.181.2
//   protoc               v3.19.1
// source: protos/notify.proto

/* eslint-disable */
import {
  type CallOptions,
  ChannelCredentials,
  Client,
  type ClientOptions,
  type ClientUnaryCall,
  type handleUnaryCall,
  makeGenericClientConstructor,
  Metadata,
  type ServiceError,
  type UntypedServiceImplementation,
} from "@grpc/grpc-js";
import Long from "long";
import _m0 from "protobufjs/minimal.js";
import { BoolValue } from "../google/protobuf/wrappers.js";

export const protobufPackage = "notify_proto";

export enum SocketEventTypeEnum {
  CHAT = 0,
  SYSTEM = 1,
  UNRECOGNIZED = -1,
}

export function socketEventTypeEnumFromJSON(object: any): SocketEventTypeEnum {
  switch (object) {
    case 0:
    case "CHAT":
      return SocketEventTypeEnum.CHAT;
    case 1:
    case "SYSTEM":
      return SocketEventTypeEnum.SYSTEM;
    case -1:
    case "UNRECOGNIZED":
    default:
      return SocketEventTypeEnum.UNRECOGNIZED;
  }
}

export function socketEventTypeEnumToJSON(object: SocketEventTypeEnum): string {
  switch (object) {
    case SocketEventTypeEnum.CHAT:
      return "CHAT";
    case SocketEventTypeEnum.SYSTEM:
      return "SYSTEM";
    case SocketEventTypeEnum.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface PushRequest {
  userIds: bigint[];
  topics: string[];
  title: string;
  body: string;
  data: string;
}

export interface SocketEventRequest {
  type: number;
  channel: string;
  sequence: number;
  senderId: bigint;
  dateMills: bigint;
  metadata: string;
  recieverIds: bigint[];
}

function createBasePushRequest(): PushRequest {
  return { userIds: [], topics: [], title: "", body: "", data: "" };
}

export const PushRequest = {
  encode(message: PushRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.userIds) {
      if (BigInt.asIntN(64, v) !== v) {
        throw new globalThis.Error("a value provided in array field userIds of type int64 is too large");
      }
      writer.int64(v.toString());
    }
    writer.ldelim();
    for (const v of message.topics) {
      writer.uint32(18).string(v!);
    }
    if (message.title !== "") {
      writer.uint32(26).string(message.title);
    }
    if (message.body !== "") {
      writer.uint32(34).string(message.body);
    }
    if (message.data !== "") {
      writer.uint32(42).string(message.data);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PushRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePushRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag === 8) {
            message.userIds.push(longToBigint(reader.int64() as Long));

            continue;
          }

          if (tag === 10) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.userIds.push(longToBigint(reader.int64() as Long));
            }

            continue;
          }

          break;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.topics.push(reader.string());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.title = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.body = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.data = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PushRequest {
    return {
      userIds: globalThis.Array.isArray(object?.userIds) ? object.userIds.map((e: any) => BigInt(e)) : [],
      topics: globalThis.Array.isArray(object?.topics) ? object.topics.map((e: any) => globalThis.String(e)) : [],
      title: isSet(object.title) ? globalThis.String(object.title) : "",
      body: isSet(object.body) ? globalThis.String(object.body) : "",
      data: isSet(object.data) ? globalThis.String(object.data) : "",
    };
  },

  toJSON(message: PushRequest): unknown {
    const obj: any = {};
    if (message.userIds?.length) {
      obj.userIds = message.userIds.map((e) => e.toString());
    }
    if (message.topics?.length) {
      obj.topics = message.topics;
    }
    if (message.title !== "") {
      obj.title = message.title;
    }
    if (message.body !== "") {
      obj.body = message.body;
    }
    if (message.data !== "") {
      obj.data = message.data;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PushRequest>, I>>(base?: I): PushRequest {
    return PushRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<PushRequest>, I>>(object: I): PushRequest {
    const message = createBasePushRequest();
    message.userIds = object.userIds?.map((e) => e) || [];
    message.topics = object.topics?.map((e) => e) || [];
    message.title = object.title ?? "";
    message.body = object.body ?? "";
    message.data = object.data ?? "";
    return message;
  },
};

function createBaseSocketEventRequest(): SocketEventRequest {
  return { type: 0, channel: "", sequence: 0, senderId: 0n, dateMills: 0n, metadata: "", recieverIds: [] };
}

export const SocketEventRequest = {
  encode(message: SocketEventRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }
    if (message.channel !== "") {
      writer.uint32(18).string(message.channel);
    }
    if (message.sequence !== 0) {
      writer.uint32(24).int32(message.sequence);
    }
    if (message.senderId !== 0n) {
      if (BigInt.asIntN(64, message.senderId) !== message.senderId) {
        throw new globalThis.Error("value provided for field message.senderId of type int64 too large");
      }
      writer.uint32(32).int64(message.senderId.toString());
    }
    if (message.dateMills !== 0n) {
      if (BigInt.asIntN(64, message.dateMills) !== message.dateMills) {
        throw new globalThis.Error("value provided for field message.dateMills of type int64 too large");
      }
      writer.uint32(40).int64(message.dateMills.toString());
    }
    if (message.metadata !== "") {
      writer.uint32(50).string(message.metadata);
    }
    writer.uint32(58).fork();
    for (const v of message.recieverIds) {
      if (BigInt.asIntN(64, v) !== v) {
        throw new globalThis.Error("a value provided in array field recieverIds of type int64 is too large");
      }
      writer.int64(v.toString());
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SocketEventRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSocketEventRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.type = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.channel = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.sequence = reader.int32();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.senderId = longToBigint(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.dateMills = longToBigint(reader.int64() as Long);
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.metadata = reader.string();
          continue;
        case 7:
          if (tag === 56) {
            message.recieverIds.push(longToBigint(reader.int64() as Long));

            continue;
          }

          if (tag === 58) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.recieverIds.push(longToBigint(reader.int64() as Long));
            }

            continue;
          }

          break;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SocketEventRequest {
    return {
      type: isSet(object.type) ? globalThis.Number(object.type) : 0,
      channel: isSet(object.channel) ? globalThis.String(object.channel) : "",
      sequence: isSet(object.sequence) ? globalThis.Number(object.sequence) : 0,
      senderId: isSet(object.senderId) ? BigInt(object.senderId) : 0n,
      dateMills: isSet(object.dateMills) ? BigInt(object.dateMills) : 0n,
      metadata: isSet(object.metadata) ? globalThis.String(object.metadata) : "",
      recieverIds: globalThis.Array.isArray(object?.recieverIds) ? object.recieverIds.map((e: any) => BigInt(e)) : [],
    };
  },

  toJSON(message: SocketEventRequest): unknown {
    const obj: any = {};
    if (message.type !== 0) {
      obj.type = Math.round(message.type);
    }
    if (message.channel !== "") {
      obj.channel = message.channel;
    }
    if (message.sequence !== 0) {
      obj.sequence = Math.round(message.sequence);
    }
    if (message.senderId !== 0n) {
      obj.senderId = message.senderId.toString();
    }
    if (message.dateMills !== 0n) {
      obj.dateMills = message.dateMills.toString();
    }
    if (message.metadata !== "") {
      obj.metadata = message.metadata;
    }
    if (message.recieverIds?.length) {
      obj.recieverIds = message.recieverIds.map((e) => e.toString());
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<SocketEventRequest>, I>>(base?: I): SocketEventRequest {
    return SocketEventRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<SocketEventRequest>, I>>(object: I): SocketEventRequest {
    const message = createBaseSocketEventRequest();
    message.type = object.type ?? 0;
    message.channel = object.channel ?? "";
    message.sequence = object.sequence ?? 0;
    message.senderId = object.senderId ?? 0n;
    message.dateMills = object.dateMills ?? 0n;
    message.metadata = object.metadata ?? "";
    message.recieverIds = object.recieverIds?.map((e) => e) || [];
    return message;
  },
};

export type NotifyProtoService = typeof NotifyProtoService;
export const NotifyProtoService = {
  pushMessage: {
    path: "/notify_proto.NotifyProto/PushMessage",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: PushRequest) => Buffer.from(PushRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => PushRequest.decode(value),
    responseSerialize: (value: boolean | undefined) =>
      Buffer.from(BoolValue.encode({ value: value ?? false }).finish()),
    responseDeserialize: (value: Buffer) => BoolValue.decode(value).value,
  },
  sendSocket: {
    path: "/notify_proto.NotifyProto/SendSocket",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: SocketEventRequest) => Buffer.from(SocketEventRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => SocketEventRequest.decode(value),
    responseSerialize: (value: boolean | undefined) =>
      Buffer.from(BoolValue.encode({ value: value ?? false }).finish()),
    responseDeserialize: (value: Buffer) => BoolValue.decode(value).value,
  },
} as const;

export interface NotifyProtoServer extends UntypedServiceImplementation {
  pushMessage: handleUnaryCall<PushRequest, boolean | undefined>;
  sendSocket: handleUnaryCall<SocketEventRequest, boolean | undefined>;
}

export interface NotifyProtoClient extends Client {
  pushMessage(
    request: PushRequest,
    callback: (error: ServiceError | null, response: boolean | undefined) => void,
  ): ClientUnaryCall;
  pushMessage(
    request: PushRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: boolean | undefined) => void,
  ): ClientUnaryCall;
  pushMessage(
    request: PushRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: boolean | undefined) => void,
  ): ClientUnaryCall;
  sendSocket(
    request: SocketEventRequest,
    callback: (error: ServiceError | null, response: boolean | undefined) => void,
  ): ClientUnaryCall;
  sendSocket(
    request: SocketEventRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: boolean | undefined) => void,
  ): ClientUnaryCall;
  sendSocket(
    request: SocketEventRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: boolean | undefined) => void,
  ): ClientUnaryCall;
}

export const NotifyProtoClient = makeGenericClientConstructor(
  NotifyProtoService,
  "notify_proto.NotifyProto",
) as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): NotifyProtoClient;
  service: typeof NotifyProtoService;
  serviceName: string;
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | bigint | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string } ? { [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]> } & { $case: T["$case"] }
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToBigint(long: Long) {
  return BigInt(long.toString());
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
