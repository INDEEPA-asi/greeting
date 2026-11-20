import { useState, type CSSProperties } from 'react';
import type { GardenPhoto } from '../../config/schema';
import { RoseMark } from './Ornaments';

type ImageProps = {
  photo?: GardenPhoto;
  sizes?: string;
  eager?: boolean;
  decorative?: boolean;
  className?: string;
  style?: CSSProperties;
  fallback?: string;
  as?: 'div' | 'span';
};

export function GardenImage({ photo, sizes = '100vw', eager = false, decorative = false, className = '', style, fallback = 'A place for your photograph', as: Container = 'div' }: ImageProps) {
  const [failed, setFailed] = useState<string>();
  const responsive = photo?.width && photo.variants?.length
    ? [...photo.variants.filter(({ width }) => width !== photo.width), { src: photo.src, width: photo.width }]
      .map(({ src, width }) => `${src} ${width}w`).join(', ')
    : undefined;
  return (
    <Container className={`garden-image ${className}`} style={style}>
      {photo && failed !== photo.src ? (
        <img
          src={photo.src}
          srcSet={responsive}
          sizes={responsive ? sizes : undefined}
          alt={decorative ? '' : photo.alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(photo.src)}
        />
      ) : (
        <span className="image-fallback" aria-hidden={decorative || undefined}>
          <RoseMark size={46} />
          <span>{photo ? 'Photograph unavailable' : fallback}</span>
        </span>
      )}
    </Container>
  );
}
