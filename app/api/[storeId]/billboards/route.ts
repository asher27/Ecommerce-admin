import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prismadb from '@/lib/prismadb';

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { label, imageUrl } = body;

    if (!userId) return new NextResponse('Unauthenticated', { status: 401 });
    if (!label) return new NextResponse('Label required', { status: 400 });
    if (!imageUrl) return new NextResponse('Image URL required', { status: 400 });
    if (!params.storeId) return new NextResponse('Store id required', { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) return new NextResponse('Unauthorized', { status: 403 });

    const billboard = await prismadb.billboard.create({
      data: {
        label,
        imageUrl,
        storeId: params.storeId
      }
    });

    return NextResponse.json(billboard);
  } catch (e) {
    console.log('[BILLBOARDS_POST]', e);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) return new NextResponse('Store id required', { status: 400 });

    const billboards = await prismadb.billboard.findMany({
      where: {
        storeId: params.storeId
      }
    });

    return NextResponse.json(billboards);
  } catch (e) {
    console.log('[BILLBOARDS_GET]', e);
    return new NextResponse('Internal error', { status: 500 });
  }
}
