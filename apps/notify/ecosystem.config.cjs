module.exports = {
  apps: [
    {
      name: 'notify-api',
      script: 'dist/index.js'
    },
    {
      name: "notify-grpc",
      script: "dist/grpc.js"
    },
    {
      name:'notify-queue',
      script:'dist/queue.js'
    }
  ]
}
