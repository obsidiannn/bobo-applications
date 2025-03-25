module.exports = {
  apps: [
    {
      name: "event-grpc",
      script: "dist/grpc.js"
    },
    {
      name:'event-queue',
      script:'dist/queue.js'
    }
  ]
}
