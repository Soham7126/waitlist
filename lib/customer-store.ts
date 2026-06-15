import { randomUUID } from 'crypto';
import type { Db } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { decrypt, encrypt, isEncrypted } from '@/lib/crypto';

export type CustomerStatus = 'waiting' | 'ready' | 'seated' | 'cancelled';

export interface CustomerRecord {
  id: string;
  name: string;
  partySize: number;
  waitTime: number;
  type: string;
  phone?: string;
  tableNumbers: number[];
  addedAt: Date;
  status: CustomerStatus;
  token: string;
  sequence: number;
}

export interface CreateCustomerInput {
  name: string;
  partySize: number;
  waitTime: number;
  type: string;
  phone?: string;
  tableNumbers: number[];
}

function encryptPhone(phone: string | undefined): string | undefined {
  return phone ? encrypt(phone) : undefined;
}

function decryptRecord(record: CustomerRecord): CustomerRecord {
  if (record.phone && isEncrypted(record.phone)) {
    return { ...record, phone: decrypt(record.phone) };
  }
  return record;
}

const CUSTOMERS_COLLECTION = 'customers';
const COUNTERS_COLLECTION = 'counters';
const CUSTOMER_TOKEN_COUNTER = 'customerToken';

function getCollections(database: Db) {
  return {
    customers: database.collection<CustomerRecord>(CUSTOMERS_COLLECTION),
    counters: database.collection<{ _id: string; sequence: number }>(COUNTERS_COLLECTION),
  };
}

export async function listCustomers() {
  const database = await getDatabase();
  const { customers } = getCollections(database);
  const records = await customers.find().sort({ sequence: 1, addedAt: 1 }).toArray();
  return records.map(decryptRecord);
}

export async function getCustomerById(id: string) {
  const database = await getDatabase();
  const { customers } = getCollections(database);
  const record = await customers.findOne({ id });
  return record ? decryptRecord(record) : null;
}

export async function getWaitlistPosition(sequence: number) {
  const database = await getDatabase();
  const { customers } = getCollections(database);
  return customers.countDocuments({ status: 'waiting', sequence: { $lte: sequence } });
}

export async function createCustomer(input: CreateCustomerInput) {
  const database = await getDatabase();
  const { customers, counters } = getCollections(database);

  const nextCounter = await counters.findOneAndUpdate(
    { _id: CUSTOMER_TOKEN_COUNTER },
    { $inc: { sequence: 1 } },
    { upsert: true, returnDocument: 'after' }
  );

  const counterDocument: { sequence?: number } | null =
    nextCounter && typeof nextCounter === 'object' && 'value' in nextCounter
      ? (nextCounter.value as { sequence?: number } | null)
      : nextCounter;
  const sequence = counterDocument?.sequence ?? 1;
  const customer: CustomerRecord = {
    id: randomUUID(),
    name: input.name,
    partySize: input.partySize,
    waitTime: input.waitTime,
    type: input.type,
    phone: encryptPhone(input.phone),
    tableNumbers: input.tableNumbers,
    addedAt: new Date(),
    status: 'waiting',
    token: `A${sequence}`,
    sequence,
  };

  await customers.insertOne(customer);
  return decryptRecord(customer);
}

export async function updateCustomer(id: string, updates: Partial<CreateCustomerInput>) {
  const database = await getDatabase();
  const { customers } = getCollections(database);

  const fieldsToUpdate = {
    ...(updates.name !== undefined ? { name: updates.name } : {}),
    ...(updates.partySize !== undefined ? { partySize: updates.partySize } : {}),
    ...(updates.waitTime !== undefined ? { waitTime: updates.waitTime } : {}),
    ...(updates.type !== undefined ? { type: updates.type } : {}),
    ...(updates.phone !== undefined ? { phone: encryptPhone(updates.phone) } : {}),
    ...(updates.tableNumbers !== undefined ? { tableNumbers: updates.tableNumbers } : {}),
  };

  const updateResult = await customers.updateOne({ id }, { $set: fieldsToUpdate });

  if (updateResult.matchedCount === 0) {
    return null;
  }

  const record = await customers.findOne({ id });
  return record ? decryptRecord(record) : null;
}

export async function updateCustomerStatus(id: string, status: CustomerStatus) {
  const database = await getDatabase();
  const { customers } = getCollections(database);

  const updateResult = await customers.updateOne(
    { id },
    { $set: { status } },
  );

  if (updateResult.matchedCount === 0) {
    return null;
  }

  const record = await customers.findOne({ id });
  return record ? decryptRecord(record) : null;
}

export async function deleteCustomer(id: string) {
  const database = await getDatabase();
  const { customers } = getCollections(database);
  return customers.deleteOne({ id });
}
