const chatCacheKey = (id: string): string => {
  return `chat:${id}`
}

const messageCacheKey = (id: string): string => {
  return `message:${id}`
}



export default {
  chatCacheKey,
  messageCacheKey,
}
