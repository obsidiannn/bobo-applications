module.exports = {
  apps: [
    {
      name: 'message-server',
      script: 'dist/index.js'
    },
    {
      name: "message-grpc",
      script: "dist/grpc.js"
    }
  ]
}
