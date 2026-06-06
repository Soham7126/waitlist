import { NextResponse } from 'next/server';
import {
  createCustomer,
  getWaitlistPosition,
  listCustomers,
  updateCustomer,
} from '@/lib/customer-store';
import { buildWaitlistAddedMessage, sendSms } from '@/lib/twilio';

export async function GET() {
  const customers = await listCustomers();
  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.name || !body?.partySize || !body?.waitTime || !body?.type || !body?.phone) {
      return NextResponse.json(
        { error: 'Missing required customer fields (name, partySize, waitTime, type, phone)' },
        { status: 400 },
      );
    }

    const customer = await createCustomer({
      name: body.name,
      partySize: Number(body.partySize),
      waitTime: Number(body.waitTime),
      type: body.type,
      phone: body.phone,
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

    if (!body?.id) {
      return NextResponse.json({ error: 'Missing customer id' }, { status: 400 });
    }

    const customer = await updateCustomer(body.id, {
      name: body.name,
      partySize: body.partySize !== undefined ? Number(body.partySize) : undefined,
      waitTime: body.waitTime !== undefined ? Number(body.waitTime) : undefined,
      type: body.type,
      phone: body.phone,
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
