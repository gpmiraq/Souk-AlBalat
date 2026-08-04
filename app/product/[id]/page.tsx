import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { INITIAL_PRODUCTS, INITIAL_VENDORS } from '../../../data/mockData';
import { ProductDetailClient } from '@/app/product/[id]/ProductDetailClient';


interface ProductPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = INITIAL_PRODUCTS.find((p) => p.id === params.id);
  
  if (!product) {
    return {
      title: 'المنتج غير موجود | سوق البالات',
    };
  }

  const vendor = INITIAL_VENDORS.find((v) => v.id === product.vendorId);
  const conditionLabel = product.condition.replace('_', ' ');

  return {
    title: `${product.title} | سوق البالات أمازون`,
    description: `${product.description} - حالة القطعة: ${conditionLabel} - السعر: ${product.outletPrice.toLocaleString('ar-IQ')} د.ع (خصم من ${product.retailPrice.toLocaleString('ar-IQ')} د.ع)`,
    openGraph: {
      title: `${product.title} (${conditionLabel})`,
      description: `${product.description} | متوفر لدى: ${vendor?.name || 'سوق البالات'}`,
      url: `https://amazon-outlet.iq/product/${product.id}`,
      siteName: 'سوق البالات - Amazon Outlet IQ',
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 600,
          alt: product.title,
        },
      ],
      type: 'article',
    },
    other: {
      'product:price:amount': product.outletPrice.toString(),
      'product:price:currency': 'IQD',
      'product:condition': product.condition,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
      images: [product.images[0]],
    },
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = INITIAL_PRODUCTS.find((p) => p.id === params.id);

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
