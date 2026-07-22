export type CheatMode = 'off' | 'custom';

export interface CheatSettings {
  mode: CheatMode;
  rotationPreLook: boolean;
  rawBlockPlace: boolean;
  airPlace: boolean;
}
