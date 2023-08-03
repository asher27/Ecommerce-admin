import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prismadb from '@/lib/prismadb';

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { name, value } = body;

    if (!userId) return new NextResponse('Unauthenticated', { status: 401 });
    if (!name) return new NextResponse('Name required', { status: 400 });
    if (!value) return new NextResponse('Value URL required', { status: 400 });
    if (!params.storeId) return new NextResponse('Store id required', { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) return new NextResponse('Unauthorized', { status: 403 });

    const color = await prismadb.color.create({
      data: {
        name,
        value,
        storeId: params.storeId
      }
    });

    return NextResponse.json(color);
  } catch (e) {
    console.log('[COLORS_POST]', e);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) return new NextResponse('Store id required', { status: 400 });

    const colors = await prismadb.color.findMany({
      where: {
        storeId: params.storeId
      }
    });

    return NextResponse.json(colors);
  } catch (e) {
    console.log('[COLORS_GET]', e);
    return new NextResponse('Internal error', { status: 500 });
  }
}
