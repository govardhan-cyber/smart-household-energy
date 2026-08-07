import React from "react";
import * as pdfjsDist from "pdfjs-dist";

declare global {
  interface AddApplianceEventDetail {
    applianceId: string;
    watts: number;
    hours: number;
    quantity: number;
    displayName: string;
  }

  interface WindowEventMap {
    she_add_appliance: CustomEvent<AddApplianceEventDetail>;
  }

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
