module.exports = {
  apps: [
    {
      name: 'user-api',
      script: 'dist/index.js'
    },
    {
      name: "user-grpc",
      script: "dist/grpc.js"
    }
  ]
}
