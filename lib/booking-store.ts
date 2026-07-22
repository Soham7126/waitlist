import { randomUUID } from 'crypto';
import type { Db } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { encrypt, decrypt, isEncrypted } from '@/lib/crypto';

export type BookingType = 'walkin' | 'dineout' | 'swiggy';

export interface BookingRecord {
  id: string;
  name: string;
  partySize: number;
  phone?: string;
  type: BookingType;
  date: string;
  time: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingInput {
  name: string;
  partySize: number;
  phone?: string;
  type: BookingType;
  date: string;
  time: string;
}

export interface Booking extends Omit<BookingRecord, 'phone'> {
  phone?: string;
}

const BOOKINGS_COLLECTION = 'bookings';

function getBookingCollection(database: Db) {
  return database.collection<BookingRecord>(BOOKINGS_COLLECTION);
}

function encryptPhone(phone: string | undefined): string | undefined {
  return phone ? encrypt(phone) : undefined;
}

function decryptRecord(record: BookingRecord): Booking {
  if (record.phone && isEncrypted(record.phone)) {
    try {
      return { ...record, phone: decrypt(record.phone) };
    } catch {
      return { ...record, phone: undefined };
    }
  }
  return { ...record, phone: record.phone };
}

export async function listBookings(): Promise<Booking[]> {
  const database = await getDatabase();
  const collection = getBookingCollection(database);
  const records = await collection.find().sort({ date: 1, time: 1 }).toArray();
  return records.map(decryptRecord);
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const database = await getDatabase();
  const collection = getBookingCollection(database);
  const record = await collection.findOne({ id });
  return record ? decryptRecord(record) : null;
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const database = await getDatabase();
  const collection = getBookingCollection(database);

  const now = new Date();
  const booking: BookingRecord = {
    id: randomUUID(),
    name: input.name,
    partySize: input.partySize,
    phone: encryptPhone(input.phone),
    type: input.type,
    date: input.date,
    time: input.time,
    createdAt: now,
    updatedAt: now,
  };

  await collection.insertOne(booking);
  return decryptRecord(booking);
}

export async function updateBooking(id: string, updates: Partial<CreateBookingInput>): Promise<Booking | null> {
  const database = await getDatabase();
  const collection = getBookingCollection(database);

  const fieldsToUpdate: Record<string, unknown> = { updatedAt: new Date() };

  if (updates.name !== undefined) fieldsToUpdate.name = updates.name;
  if (updates.partySize !== undefined) fieldsToUpdate.partySize = updates.partySize;
  if (updates.phone !== undefined) fieldsToUpdate.phone = encryptPhone(updates.phone);
  if (updates.type !== undefined) fieldsToUpdate.type = updates.type;
  if (updates.date !== undefined) fieldsToUpdate.date = updates.date;
  if (updates.time !== undefined) fieldsToUpdate.time = updates.time;

  const record = await collection.findOneAndUpdate(
    { id },
    { $set: fieldsToUpdate },
    { returnDocument: 'after' }
  );

  return record ? decryptRecord(record) : null;
}

export async function deleteBooking(id: string): Promise<boolean> {
  const database = await getDatabase();
  const collection = getBookingCollection(database);
  const result = await collection.deleteOne({ id });
  return result.deletedCount === 1;
}
