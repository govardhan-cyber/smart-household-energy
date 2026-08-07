import type { ApplianceSpec } from '../../services/energyEstimator';

export interface Message {
  role: 'user' | 'model';
  text: string;
  applianceSpec?: ApplianceSpec;
  timestamp?: number; // NEW: unix ms timestamp for relative time display
}

export interface ChatBotLogoProps {
  className?: string;
  isHovered?: boolean;
}
