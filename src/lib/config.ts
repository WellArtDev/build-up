/**
 * BuildUp Configuration
 * Centralized config — never hardcode values in components.
 */

export const CONFIG = {
  APP_NAME: 'BuildUp',
  APP_DESCRIPTION: 'Indonesia\'s leading grassroots sports management platform',
  DEFAULT_TRIAL_DAYS: 15,
  MAX_UPLOAD_SIZE_MB: 5,
  MAX_TOTAL_STORAGE_MB: { starter: 50, growth: 200, professional: 500, enterprise: 2000 },
  STUDENT_LIMITS: { starter: 30, growth: 100, professional: 300, enterprise: Infinity },
  COACH_LIMITS: { starter: 2, growth: 5, professional: 15, enterprise: Infinity },
  SPORTS: ['football', 'basketball', 'martial_arts', 'swimming', 'other'] as const,
  AGE_GROUPS: ['U-8', 'U-10', 'U-12', 'U-14', 'U-16', 'U-18', 'U-21', 'Senior'] as const,
  ASSESSMENT_SCALE: { min: 1, max: 10 },
  WABLAS_BASE_URL: process.env.WABLAS_API_URL || 'https://wablas.com',
  PASSWORD_MIN_LENGTH: 6,
  SESSION_MAX_AGE_HOURS: 24,
} as const;
