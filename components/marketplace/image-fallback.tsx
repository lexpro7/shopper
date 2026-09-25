'use client';
import Image from 'next/image';
import { useState } from 'react';
import localPhotos from '@/data/image-manifest.json';
export function ImageFallback({
  src,
  alt,
  fill = true,
  priority = false,
  className = '',
}: {
  src?: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const [failedSource, setFailedSource] = useState('');
  const photoId = src?.match(/photo-[a-zA-Z0-9-]+/)?.[0];
  const imageSource = photoId && localPhotos.includes(photoId) ? `/images/${photoId}.jpg` : src;
  return (
    <Image
      src={failedSource === imageSource || !imageSource ? '/placeholder.svg' : imageSource}
      alt={alt}
      fill={fill}
      width={fill ? undefined : 600}
      height={fill ? undefined : 500}
      sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 25vw"
      className={className}
      onError={() => setFailedSource(imageSource || '')}
      priority={priority}
      unoptimized
    />
  );
}
