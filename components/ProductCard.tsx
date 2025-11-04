import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/db';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const cardContent = (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
      {product.imageUrl && (
        <div className="w-full aspect-square bg-white">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-2 sm:p-3 lg:p-4 flex-1 flex flex-col">
        <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
        {product.price !== undefined && (
          <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">$ {product.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        )}
        {product.description && (
          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 hidden sm:block">{product.description}</p>
        )}
      </div>
    </div>
  );

  // Si tiene link, hacer toda la tarjeta clickeable
  if (product.link) {
    return (
      <Link
        href={product.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {cardContent}
      </Link>
    );
  }

  // Si no tiene link, solo mostrar el contenido
  return cardContent;
}
