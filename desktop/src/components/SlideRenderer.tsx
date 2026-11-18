
import type { CSSProperties, PointerEvent } from 'react';
import {
  SLIDE_WIDTH,
  SLIDE_HEIGHT,
  type Slide,
  type SlideElement,
} from '../models/presentation';

type SlideRendererProps = {
  slide: Slide;
  selectedElementId?: string | null;
  interactive?: boolean;
  onSelectElement?: (id: string | null) => void;
  onPointerDownElement?: (
    event: PointerEvent<HTMLDivElement>,
    element: SlideElement
  ) => void;
  onPointerMoveElement?: (
    event: PointerEvent<HTMLDivElement>
  ) => void;
  onPointerUpElement?: (
    event: PointerEvent<HTMLDivElement>
  ) => void;
};

export default function SlideRenderer({
  slide,
  selectedElementId = null,
  interactive = false,
  onSelectElement,
  onPointerDownElement,
  onPointerMoveElement,
  onPointerUpElement,
}: SlideRendererProps) {
  return (
    <div
      className={`slide-renderer ${
        interactive ? 'interactive' : 'thumbnail'
      }`}
      style={{ background: slide.background }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onSelectElement?.(null);
        }
      }}
    >
      {slide.elements.map((element, index) => {
        const style: CSSProperties = {
          position: 'absolute',
          left: `${(element.x / SLIDE_WIDTH) * 100}%`,
          top: `${(element.y / SLIDE_HEIGHT) * 100}%`,
          width: `${(element.w / SLIDE_WIDTH) * 100}%`,
          height: `${(element.h / SLIDE_HEIGHT) * 100}%`,
          boxSizing: 'border-box',
        };

        if (element.type === 'text') {
          return (
            <div
              key={element.id}
              className={
                'slide-renderer-element ' +
                (index === 0
                  ? 'renderer-title '
                  : 'renderer-body ') +
                (interactive &&
                selectedElementId === element.id
                  ? 'renderer-selected'
                  : '')
              }
              style={style}
              onPointerDown={
                interactive
                  ? (event) =>
                      onPointerDownElement?.(event, element)
                  : undefined
              }
              onPointerMove={
                interactive ? onPointerMoveElement : undefined
              }
              onPointerUp={
                interactive ? onPointerUpElement : undefined
              }
              onPointerCancel={
                interactive ? onPointerUpElement : undefined
              }
            >
              {element.text}
            </div>
          );
        }

        if (element.type === 'image' && element.src) {
          return (
            <img
              key={element.id}
              src={element.src}
              alt=""
              style={{
                ...style,
                objectFit: 'contain',
                pointerEvents: interactive ? 'auto' : 'none',
              }}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
