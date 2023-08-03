import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prismadb from '@/lib/prismadb';

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { name, billboardId } = body;

    if (!userId) return new NextResponse('Unauthenticated', { status: 401 });
    if (!name) return new NextResponse('Name required', { status: 400 });
    if (!billboardId) return new NextResponse('Billboard id required', { status: 400 });
    if (!params.storeId) return new NextResponse('Store id required', { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) return new NextResponse('Unauthorized', { status: 403 });

    const category = await prismadb.category.create({
      data: {
        name,
        billboardId,
        storeId: params.storeId
      }
    });

    return NextResponse.json(category);
  } catch (e) {
    console.log('[CATEGORIES_POST]', e);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) return new NextResponse('Store id required', { status: 400 });

    const categoriess = await prismadb.category.findMany({
      where: {
        storeId: params.storeId
      }
    });

    return NextResponse.json(categoriess);
  } catch (e) {
    console.log('[CATEGORIES_GET]', e);
    return new NextResponse('Internal error', { status: 500 });
  }
}
