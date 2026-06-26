const app = require('./app');
const { connectDatabase } = require('./config/database');
const { env } = require('./config/env');

async function start() {
  await connectDatabase();
  app.listen(env.port, () => {
    console.log(`VEGI14 listening on ${env.baseUrl}`);
  });
}

start().catch((error) => {
  console.error('Failed to start VEGI14', error);
  process.exit(1);
});
