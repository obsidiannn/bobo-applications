module.exports = {
  apps: [
    {
      name: 'api-gataway',
      instances: 1,
      script: './bin/gateway',
      args: 'run --config run.json',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ]
}
