import type React from "react";

type ModelViewerAttrs = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string;
  poster?: string;
  alt?: string;
  ar?: boolean | string;
  "ar-modes"?: string;
  "ios-src"?: string;
  "camera-controls"?: boolean | string;
  "auto-rotate"?: boolean | string;
  "touch-action"?: string;
  "shadow-intensity"?: string;
  exposure?: string;
  "environment-image"?: string;
  "interaction-prompt"?: string;
  loading?: string;
  reveal?: string;
};

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttrs;
    }
  }
}
