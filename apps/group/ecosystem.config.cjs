module.exports = {
  apps: [
    {
      name: 'group-api',
      script: 'dist/index.js'
    },
    {
      name: "group-grpc",
      script: "dist/grpc.js"
    }
  ]
}
