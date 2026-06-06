import { NextResponse } from 'next/server';
import { createCustomer, listCustomers, updateCustomer } from '@/lib/customer-store';

export async function GET() {
  const customers = await listCustomers();
  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body?.name || !body?.partySize || !body?.waitTime || !body?.type) {
    return NextResponse.json({ error: 'Missing required customer fields' }, { status: 400 });
  }

  const customer = await createCustomer({
    name: body.name,
    partySize: Number(body.partySize),
    waitTime: Number(body.waitTime),
    type: body.type,
    phone: body.phone,
  });

  return NextResponse.json(customer, { status: 201 });
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