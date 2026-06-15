import { NextResponse } from 'next/server';
import { deleteCustomer, getCustomerById, updateCustomerStatus } from '@/lib/customer-store';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body?.status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    }

    const existingCustomer = await getCustomerById(id);

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customer = await updateCustomerStatus(id, body.status);

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('PATCH /api/customers/[id] failed', error);
    return NextResponse.json({ error: 'Failed to update customer status' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteCustomer(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/customers/[id] failed', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
