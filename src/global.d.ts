import React from "react";

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
