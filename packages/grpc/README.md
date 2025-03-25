# grpc

使用：


```typescript


import { messageProtoClient } from '@repo/grpc/proto-client'

const grpcClient = messageProtoClient('0.0.0.0:50051')

grpcClient.SendOfficial({
  senderId: 1,
  userIds: [1, 2, 3],
  officialType: 1,
  content: 'content',
  remark: 'remark'
},  (err: any, response:any) => {
  console.log('response::', response);
})
```