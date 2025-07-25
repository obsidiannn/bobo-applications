// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v1.181.2
//   protoc               v3.19.1
// source: protos/bot.proto

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
import { Chat } from "./chat.js";

export const protobufPackage = "bot_proto";

export interface CreateChatRequest {
  botId: bigint;
  userId: bigint;
}

export interface DropChatRequest {
  botId: bigint;
  userId: bigint;
}

export interface SendMessageByUserIdsRequest {
  botId: bigint;
  content: string;
  receiverUserIds: bigint[];
}

export interface SendMessageByBotIdsRequest {
  content: string;
  botIds: bigint[];
}

function createBaseCreateChatRequest(): CreateChatRequest {
  return { botId: 0n, userId: 0n };
}

export const CreateChatRequest = {
  encode(message: CreateChatRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.botId !== 0n) {
      if (BigInt.asIntN(64, message.botId) !== message.botId) {
        throw new globalThis.Error("value provided for field message.botId of type int64 too large");
      }
      writer.uint32(8).int64(message.botId.toString());
    }
    if (message.userId !== 0n) {
      if (BigInt.asIntN(64, message.userId) !== message.userId) {
        throw new globalThis.Error("value provided for field message.userId of type int64 too large");
      }
      writer.uint32(16).int64(message.userId.toString());
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateChatRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateChatRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.botId = longToBigint(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.userId = longToBigint(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CreateChatRequest {
    return {
      botId: isSet(object.botId) ? BigInt(object.botId) : 0n,
      userId: isSet(object.userId) ? BigInt(object.userId) : 0n,
    };
  },

  toJSON(message: CreateChatRequest): unknown {
    const obj: any = {};
    if (message.botId !== 0n) {
      obj.botId = message.botId.toString();
    }
    if (message.userId !== 0n) {
      obj.userId = message.userId.toString();
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CreateChatRequest>, I>>(base?: I): CreateChatRequest {
    return CreateChatRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CreateChatRequest>, I>>(object: I): CreateChatRequest {
    const message = createBaseCreateChatRequest();
    message.botId = object.botId ?? 0n;
    message.userId = object.userId ?? 0n;
    return message;
  },
};

function createBaseDropChatRequest(): DropChatRequest {
  return { botId: 0n, userId: 0n };
}

export const DropChatRequest = {
  encode(message: DropChatRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.botId !== 0n) {
      if (BigInt.asIntN(64, message.botId) !== message.botId) {
        throw new globalThis.Error("value provided for field message.botId of type int64 too large");
      }
      writer.uint32(8).int64(message.botId.toString());
    }
    if (message.userId !== 0n) {
      if (BigInt.asIntN(64, message.userId) !== message.userId) {
        throw new globalThis.Error("value provided for field message.userId of type int64 too large");
      }
      writer.uint32(16).int64(message.userId.toString());
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DropChatRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDropChatRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.botId = longToBigint(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.userId = longToBigint(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DropChatRequest {
    return {
      botId: isSet(object.botId) ? BigInt(object.botId) : 0n,
      userId: isSet(object.userId) ? BigInt(object.userId) : 0n,
    };
  },

  toJSON(message: DropChatRequest): unknown {
    const obj: any = {};
    if (message.botId !== 0n) {
      obj.botId = message.botId.toString();
    }
    if (message.userId !== 0n) {
      obj.userId = message.userId.toString();
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<DropChatRequest>, I>>(base?: I): DropChatRequest {
    return DropChatRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<DropChatRequest>, I>>(object: I): DropChatRequest {
    const message = createBaseDropChatRequest();
    message.botId = object.botId ?? 0n;
    message.userId = object.userId ?? 0n;
    return message;
  },
};

function createBaseSendMessageByUserIdsRequest(): SendMessageByUserIdsRequest {
  return { botId: 0n, content: "", receiverUserIds: [] };
}

export const SendMessageByUserIdsRequest = {
  encode(message: SendMessageByUserIdsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.botId !== 0n) {
      if (BigInt.asIntN(64, message.botId) !== message.botId) {
        throw new globalThis.Error("value provided for field message.botId of type int64 too large");
      }
      writer.uint32(8).int64(message.botId.toString());
    }
    if (message.content !== "") {
      writer.uint32(18).string(message.content);
    }
    writer.uint32(26).fork();
    for (const v of message.receiverUserIds) {
      if (BigInt.asIntN(64, v) !== v) {
        throw new globalThis.Error("a value provided in array field receiverUserIds of type int64 is too large");
      }
      writer.int64(v.toString());
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SendMessageByUserIdsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSendMessageByUserIdsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.botId = longToBigint(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.content = reader.string();
          continue;
        case 3:
          if (tag === 24) {
            message.receiverUserIds.push(longToBigint(reader.int64() as Long));

            continue;
          }

          if (tag === 26) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.receiverUserIds.push(longToBigint(reader.int64() as Long));
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

  fromJSON(object: any): SendMessageByUserIdsRequest {
    return {
      botId: isSet(object.botId) ? BigInt(object.botId) : 0n,
      content: isSet(object.content) ? globalThis.String(object.content) : "",
      receiverUserIds: globalThis.Array.isArray(object?.receiverUserIds)
        ? object.receiverUserIds.map((e: any) => BigInt(e))
        : [],
    };
  },

  toJSON(message: SendMessageByUserIdsRequest): unknown {
    const obj: any = {};
    if (message.botId !== 0n) {
      obj.botId = message.botId.toString();
    }
    if (message.content !== "") {
      obj.content = message.content;
    }
    if (message.receiverUserIds?.length) {
      obj.receiverUserIds = message.receiverUserIds.map((e) => e.toString());
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<SendMessageByUserIdsRequest>, I>>(base?: I): SendMessageByUserIdsRequest {
    return SendMessageByUserIdsRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<SendMessageByUserIdsRequest>, I>>(object: I): SendMessageByUserIdsRequest {
    const message = createBaseSendMessageByUserIdsRequest();
    message.botId = object.botId ?? 0n;
    message.content = object.content ?? "";
    message.receiverUserIds = object.receiverUserIds?.map((e) => e) || [];
    return message;
  },
};

function createBaseSendMessageByBotIdsRequest(): SendMessageByBotIdsRequest {
  return { content: "", botIds: [] };
}

export const SendMessageByBotIdsRequest = {
  encode(message: SendMessageByBotIdsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.content !== "") {
      writer.uint32(10).string(message.content);
    }
    writer.uint32(18).fork();
    for (const v of message.botIds) {
      if (BigInt.asIntN(64, v) !== v) {
        throw new globalThis.Error("a value provided in array field botIds of type int64 is too large");
      }
      writer.int64(v.toString());
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SendMessageByBotIdsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSendMessageByBotIdsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.content = reader.string();
          continue;
        case 2:
          if (tag === 16) {
            message.botIds.push(longToBigint(reader.int64() as Long));

            continue;
          }

          if (tag === 18) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.botIds.push(longToBigint(reader.int64() as Long));
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

  fromJSON(object: any): SendMessageByBotIdsRequest {
    return {
      content: isSet(object.content) ? globalThis.String(object.content) : "",
      botIds: globalThis.Array.isArray(object?.botIds) ? object.botIds.map((e: any) => BigInt(e)) : [],
    };
  },

  toJSON(message: SendMessageByBotIdsRequest): unknown {
    const obj: any = {};
    if (message.content !== "") {
      obj.content = message.content;
    }
    if (message.botIds?.length) {
      obj.botIds = message.botIds.map((e) => e.toString());
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<SendMessageByBotIdsRequest>, I>>(base?: I): SendMessageByBotIdsRequest {
    return SendMessageByBotIdsRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<SendMessageByBotIdsRequest>, I>>(object: I): SendMessageByBotIdsRequest {
    const message = createBaseSendMessageByBotIdsRequest();
    message.content = object.content ?? "";
    message.botIds = object.botIds?.map((e) => e) || [];
    return message;
  },
};

export type BotProtoService = typeof BotProtoService;
export const BotProtoService = {
  createChat: {
    path: "/bot_proto.BotProto/CreateChat",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateChatRequest) => Buffer.from(CreateChatRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateChatRequest.decode(value),
    responseSerialize: (value: Chat) => Buffer.from(Chat.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Chat.decode(value),
  },
  dropChat: {
    path: "/bot_proto.BotProto/DropChat",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: DropChatRequest) => Buffer.from(DropChatRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => DropChatRequest.decode(value),
    responseSerialize: (value: boolean | undefined) =>
      Buffer.from(BoolValue.encode({ value: value ?? false }).finish()),
    responseDeserialize: (value: Buffer) => BoolValue.decode(value).value,
  },
  sendMessageByUserIds: {
    path: "/bot_proto.BotProto/SendMessageByUserIds",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: SendMessageByUserIdsRequest) =>
      Buffer.from(SendMessageByUserIdsRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => SendMessageByUserIdsRequest.decode(value),
    responseSerialize: (value: boolean | undefined) =>
      Buffer.from(BoolValue.encode({ value: value ?? false }).finish()),
    responseDeserialize: (value: Buffer) => BoolValue.decode(value).value,
  },
  sendMessageByBotIds: {
    path: "/bot_proto.BotProto/SendMessageByBotIds",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: SendMessageByBotIdsRequest) =>
      Buffer.from(SendMessageByBotIdsRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => SendMessageByBotIdsRequest.decode(value),
    responseSerialize: (value: boolean | undefined) =>
      Buffer.from(BoolValue.encode({ value: value ?? false }).finish()),
    responseDeserialize: (value: Buffer) => BoolValue.decode(value).value,
  },
} as const;

export interface BotProtoServer extends UntypedServiceImplementation {
  createChat: handleUnaryCall<CreateChatRequest, Chat>;
  dropChat: handleUnaryCall<DropChatRequest, boolean | undefined>;
  sendMessageByUserIds: handleUnaryCall<SendMessageByUserIdsRequest, boolean | undefined>;
  sendMessageByBotIds: handleUnaryCall<SendMessageByBotIdsRequest, boolean | undefined>;
}

export interface BotProtoClient extends Client {
  createChat(
    request: CreateChatRequest,
    callback: (error: ServiceError | null, response: Chat) => void,
  ): ClientUnaryCall;
  createChat(
    request: CreateChatRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Chat) => void,
  ): ClientUnaryCall;
  createChat(
    request: CreateChatRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Chat) => void,
  ): ClientUnaryCall;
  dropChat(
    request: DropChatRequest,
    callback: (error: ServiceError | null, response: boolean | undefined) => void,
  ): ClientUnaryCall;
  dropChat(
    request: DropChatRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: boolean | undefined) => void,
  ): ClientUnaryCall;
  dropChat(
    request: DropChatRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: boolean | undefined) => void,
  ): ClientUnaryCall;
  sendMessageByUserIds(
    request: SendMessageByUserIdsRequest,
    callback: (error: ServiceError | null, response: boolean | undefined) => void,
  ): ClientUnaryCall;
  sendMessageByUserIds(
    request: SendMessageByUserIdsRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: boolean | undefined) => void,
  ): ClientUnaryCall;
  sendMessageByUserIds(
    request: SendMessageByUserIdsRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: boolean | undefined) => void,
  ): ClientUnaryCall;
  sendMessageByBotIds(
    request: SendMessageByBotIdsRequest,
    callback: (error: ServiceError | null, response: boolean | undefined) => void,
  ): ClientUnaryCall;
  sendMessageByBotIds(
    request: SendMessageByBotIdsRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: boolean | undefined) => void,
  ): ClientUnaryCall;
  sendMessageByBotIds(
    request: SendMessageByBotIdsRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: boolean | undefined) => void,
  ): ClientUnaryCall;
}

export const BotProtoClient = makeGenericClientConstructor(BotProtoService, "bot_proto.BotProto") as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): BotProtoClient;
  service: typeof BotProtoService;
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
