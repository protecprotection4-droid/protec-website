import { QuoteFormInput, validateQuoteInput, ValidationResult } from './validation';

export type QuoteWizardStep = 1 | 2 | 3;

export const TOTAL_QUOTE_STEPS = 3;

export interface QuoteProgressMetrics {
  step: QuoteWizardStep;
  totalSteps: number;
  percent: number;
}

export function computeQuoteProgress(step: QuoteWizardStep): QuoteProgressMetrics {
  const clamped = Math.min(TOTAL_QUOTE_STEPS, Math.max(1, step)) as QuoteWizardStep;
  return {
    step: clamped,
    totalSteps: TOTAL_QUOTE_STEPS,
    percent: Math.round((clamped / TOTAL_QUOTE_STEPS) * 100),
  };
}

export function validateQuoteStep(
  step: QuoteWizardStep,
  input: QuoteFormInput
): ValidationResult {
  const full = validateQuoteInput(input);
  const stepErrors: Record<string, string> = {};

  if (step === 1) {
    for (const key of ['fullName', 'phone', 'email'] as const) {
      if (full.errors[key]) stepErrors[key] = full.errors[key];
    }
  } else if (step === 2) {
    for (const key of ['governorate', 'area', 'address', 'serviceType', 'projectAreaSqm'] as const) {
      if (full.errors[key]) stepErrors[key] = full.errors[key];
    }
  } else {
    for (const key of ['description', 'attachments'] as const) {
      if (full.errors[key]) stepErrors[key] = full.errors[key];
    }
  }

  return {
    valid: Object.keys(stepErrors).length === 0,
    errors: stepErrors,
  };
}

export function firstInvalidQuoteStep(errors: Record<string, string>): QuoteWizardStep {
  if (errors.fullName || errors.phone || errors.email) return 1;
  if (
    errors.governorate ||
    errors.area ||
    errors.address ||
    errors.serviceType ||
    errors.projectAreaSqm
  ) {
    return 2;
  }
  return 3;
}
