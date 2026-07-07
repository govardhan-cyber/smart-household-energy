import React from "react";
import * as pdfjsDist from "pdfjs-dist";

declare global {
  interface Window {
    pdfjsLib?: typeof pdfjsDist;
  }

  namespace JSX {
    interface IntrinsicElements {
      "spline-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          url?: string;
          loading?: string;
        },
        HTMLElement
      >;
    }
  }
}
export {};
