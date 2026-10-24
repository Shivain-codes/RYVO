export type PulseErrorCode =
  | 'PERMISSION_DENIED'
  | 'CAPABILITY_UNSUPPORTED'
  | 'SENSOR_LOST'
  | 'GPS_UNAVAILABLE'
  | 'AUDIO_DECODE_FAILED'
  | 'AUDIO_PROCESSOR_FAILED'
  | 'AUDIO_UNDERRUN'
  | 'VALIDATION_FAILED'
  | 'AUTH_REQUIRED'
  | 'INTERNAL_ERROR';

export type PulseError = {
  code: PulseErrorCode;
  message: string;
  retryable: boolean;
};
