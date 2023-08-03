import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prismadb from '@/lib/prismadb';

export async function GET(req: NextRequest, { params }: { params: { productId: string } }) {
  try {
    if (!params.productId) {
      return new NextResponse('Product id is required', { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId
      },
      include: {
        images: true,
        category: true,
        color: true,
        size: true
      }
    });

    return NextResponse.json(product);
  } catch (e) {
    console.log('[PRODUCT_GET]', e);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { name, price, categoryId, colorId, sizeId, isFeatured, isArchived, images } = body;

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 });
    }

    if (!name) return new NextResponse('Name required', { status: 400 });
    if (!price) return new NextResponse('Price required', { status: 400 });
    if (!categoryId) return new NextResponse('Category id required', { status: 400 });
    if (!colorId) return new NextResponse('Color id required', { status: 400 });
    if (!sizeId) return new NextResponse('Size id required', { status: 400 });
    if (!images || !images.length) return new NextResponse('Images are required', { status: 400 });

    if (!params.storeId) return new NextResponse('Store id required', { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) return new NextResponse('Unauthorized', { status: 403 });

    await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        name,
        price,
        categoryId,
        colorId,
        sizeId,
        isFeatured,
        isArchived,
        images: {
          deleteMany: {}
        }
      }
    });
    const product = await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        images: {
          createMany: { data: [...images.map((image: { url: string }) => image)] }
        }
      }
    });

    return NextResponse.json(product);
  } catch (e) {
    console.log('[PRODUCT_PATCH]', e);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse('Store id is required', { status: 400 });
    }

    if (!params.productId) {
      return new NextResponse('Product id is required', { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) return new NextResponse('Unauthorized', { status: 403 });

    const product = await prismadb.product.deleteMany({
      where: {
        id: params.productId
      }
    });

    return NextResponse.json(product);
  } catch (e) {
    console.log('[PRODUCT_DELETE]', e);
    return new NextResponse('Internal error', { status: 500 });
  }
}
