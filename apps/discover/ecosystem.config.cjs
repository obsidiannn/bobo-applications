const dotenv = require('dotenv');
dotenv.config();
const { MEILISEARCH_API_KEY,MEILISEARCH_ADDR } = process.env;
module.exports = {
  apps: [
    {
      name: 'friend-api',
      script: 'dist/index.js'
    },
    {
      name: 'meilisearch',
      script: 'meilisearch',
      env: {
        MEILISEARCH_ADDR,
        MEILISEARCH_API_KEY
      },
    },
  ]
}