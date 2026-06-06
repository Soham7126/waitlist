import { MongoClient } from 'mongodb';

const cached = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

function getConnectionString() {
  const connectionString = process.env.MONGODB_URL ?? process.env.MONGODB_URI;

  if (!connectionString) {
    throw new Error('Missing MONGODB_URL or MONGODB_URI environment variable');
  }

  return connectionString;
}

function getDatabaseName() {
  const connectionString = getConnectionString();
  const databaseNameFromConnectionString = new URL(connectionString).pathname.replace(/^\//, '');
  if (process.env.MONGODB_DB) {
    return process.env.MONGODB_DB;
  }

  if (databaseNameFromConnectionString) {
    return databaseNameFromConnectionString;
  }

  return 'queue_management';
}

export async function getDatabase() {
  const connectionString = getConnectionString();

  if (!cached.mongoClientPromise) {
    const client = new MongoClient(connectionString);
    cached.mongoClientPromise = client.connect();
  }

  const client = await cached.mongoClientPromise;
  return client.db(getDatabaseName());
}