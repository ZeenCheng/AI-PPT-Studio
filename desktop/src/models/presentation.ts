
export type ElementType = "text" | "shape" | "image";

export interface SlideElement {
  id: string;
  type: ElementType;

  // Position and size in inches
  x: number;
  y: number;
  w: number;
  h: number;

  text?: string;
  src?: string;
}

export interface Slide {
  id: string;
  background: string;
  elements: SlideElement[];
}

export interface Presentation {
  schemaVersion: "0.1.0";
  id: string;
  title: string;
  slides: Slide[];
}

export const SLIDE_WIDTH = 13.333;
export const SLIDE_HEIGHT = 7.5;

export function createPresentation(
  title = "Untitled Presentation"
): Presentation {
  return {
    schemaVersion: "0.1.0",
    id: crypto.randomUUID(),
    title,
    slides: [
      {
        id: crypto.randomUUID(),
        background: "#FFFFFF",
        elements: [
          {
            id: crypto.randomUUID(),
            type: "text",
            x: 1,
            y: 2,
            w: 11,
            h: 1,
            text: "AI PPT Studio",
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            x: 1,
            y: 3.2,
            w: 11,
            h: 0.6,
            text: "Create presentations with AI",
          },
        ],
      },
    ],
  };
}
