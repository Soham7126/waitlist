import { NextResponse } from 'next/server';
import {
  createCustomer,
  getWaitlistPosition,
  listCustomers,
  updateCustomer,
} from '@/lib/customer-store';
import { buildWaitlistAddedMessage, sendSms } from '@/lib/twilio';

function parseTableNumbers(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }

  const tableNumbers = value.map(Number);
  return tableNumbers.length >= 1 &&
    tableNumbers.length <= 2 &&
    tableNumbers.every((tableNumber) => Number.isInteger(tableNumber) && tableNumber > 0)
    ? tableNumbers
    : null;
}

export async function GET() {
  const customers = await listCustomers();
  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tableNumbers = parseTableNumbers(body?.tableNumbers);

    if (!body?.name || !body?.partySize || !body?.waitTime || !body?.type || !body?.phone || !tableNumbers) {
      return NextResponse.json(
        { error: 'Missing or invalid required customer fields' },
        { status: 400 },
      );
    }

    const customer = await createCustomer({
      name: body.name,
      partySize: Number(body.partySize),
      waitTime: Number(body.waitTime),
      type: body.type,
      phone: body.phone,
      tableNumbers,
    });

    try {
      const position = await getWaitlistPosition(customer.sequence);
      await sendSms(
        customer.phone!,
        buildWaitlistAddedMessage({
          name: customer.name,
          position,
          partySize: customer.partySize,
          estimatedWait: customer.waitTime,
        }),
      );
    } catch (error) {
      console.error('Failed to send waitlist SMS', error);
    }

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('POST /api/customers failed', error);
    return NextResponse.json({ error: 'Failed to add customer' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const tableNumbers =
      body.tableNumbers !== undefined ? parseTableNumbers(body.tableNumbers) : undefined;

    if (!body?.id) {
      return NextResponse.json({ error: 'Missing customer id' }, { status: 400 });
    }

    if (body.tableNumbers !== undefined && !tableNumbers) {
      return NextResponse.json({ error: 'Enter one or two valid table numbers' }, { status: 400 });
    }

    const validTableNumbers = tableNumbers ?? undefined;
    const customer = await updateCustomer(body.id, {
      name: body.name,
      partySize: body.partySize !== undefined ? Number(body.partySize) : undefined,
      waitTime: body.waitTime !== undefined ? Number(body.waitTime) : undefined,
      type: body.type,
      phone: body.phone,
      tableNumbers: validTableNumbers,
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('PATCH /api/customers failed', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}
