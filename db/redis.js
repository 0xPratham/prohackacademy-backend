const redis = require('redis');

const client = redis.createClient({ socket: { port: 6379 } });
(async () => {
    try {
      await client.connect();
      console.log('🌵 Connected To Redis SuccessFully');
    } catch (err) {
      console.error(err)
    }
  })()

module.exports = client;