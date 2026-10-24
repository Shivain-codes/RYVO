export type Meters = number & { readonly __unit: 'meters' };
export type SecondsPerMeter = number & { readonly __unit: 'seconds-per-meter' };
export type CadenceSpm = number & { readonly __unit: 'steps-per-minute' };
export type Bpm = number & { readonly __unit: 'beats-per-minute' };
export type Milliseconds = number & { readonly __unit: 'milliseconds' };

export const asMeters = (value: number): Meters => value as Meters;
export const asSecondsPerMeter = (value: number): SecondsPerMeter => value as SecondsPerMeter;
export const asCadenceSpm = (value: number): CadenceSpm => value as CadenceSpm;
export const asBpm = (value: number): Bpm => value as Bpm;
export const asMilliseconds = (value: number): Milliseconds => value as Milliseconds;
