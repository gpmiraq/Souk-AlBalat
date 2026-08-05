import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { INITIAL_PRODUCTS, INITIAL_VENDORS } from '../../../data/mockData';
import { ProductDetailClient } from '@/app/product/[id]/ProductDetailClient';
import { Product } from '../../../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

interface ProductPageProps {
  params: {
    id: string;
  };
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const docSnap = await getDoc(doc(db, 'products', id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
  } catch (err) {
    console.error('Failed to fetch product from Firestore:', err);
  }
  return INITIAL_PRODUCTS.find((p) => p.id === id) || null;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: 'المنتج غير موجود | سوق البالات',
    };
  }

  const vendor = INITIAL_VENDORS.find((v) => v.id === product.vendorId);
  const conditionLabel = (product.condition || 'NEW').replace('_', ' ');

  return {
    title: `${product.title} | سوق البالات أمازون`,
    description: `${product.description} - السعر: ${product.outletPrice?.toLocaleString('ar-IQ') || 0} د.ع`,
    openGraph: {
      title: `${product.title} (${conditionLabel})`,
      description: `${product.description} | متوفر لدى: ${vendor?.name || 'سوق البالات'}`,
      url: `https://amazon-outlet.iq/product/${product.id}`,
      siteName: 'سوق البالات - Amazon Outlet IQ',
      images: [
        {
          url: product.images?.[0] || '',
          width: 800,
          height: 600,
          alt: product.title,
        },
      ],
      type: 'article',
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const vendor = INITIAL_VENDORS.find((v) => v.id === product.vendorId) || INITIAL_VENDORS[0];
  const relatedProducts = INITIAL_PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.vendorId === product.vendorId)
  ).slice(0, 3);

  return (
    <ProductDetailClient
      product={product}
      vendor={vendor}
      relatedProducts={relatedProducts}
    />
  );
}
