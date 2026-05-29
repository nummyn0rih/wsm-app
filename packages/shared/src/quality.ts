// Quality (приёмка) calculations — shared by API (persist) and web (live preview).

export interface PayableInput {
  factKg: number;
  rejectKg: number;
  nonStdKg: number;
  nonStdPaidSeparately: boolean;
}

export interface PayableResult {
  payableKg: number;
  payablePct: number; // % от факта, округлён до 2 знаков
}

/**
 * Вес к оплате:
 *   = факт − брак − нестандарт          (если нестандарт НЕ оплачивается отдельно)
 *   = факт − брак                       (если нестандарт оплачивается отдельно)
 */
export function calcPayable(input: PayableInput): PayableResult {
  const { factKg, rejectKg, nonStdKg, nonStdPaidSeparately } = input;
  const payableKg = factKg - rejectKg - (nonStdPaidSeparately ? 0 : nonStdKg);
  const payablePct = factKg > 0 ? Math.round((payableKg / factKg) * 10000) / 100 : 0;
  return { payableKg, payablePct };
}

export interface PayableSumCheck {
  ok: boolean;
  sum: number;
  target: number;
  diff: number; // sum − target
}

/**
 * Σ калибров с ролью PAYABLE должна сходиться с весом к оплате.
 * tolerance — допустимое отклонение в кг (по умолчанию 0).
 */
export function checkPayableSum(caliberKgs: number[], payableKg: number, tolerance = 0): PayableSumCheck {
  const sum = caliberKgs.reduce((s, n) => s + n, 0);
  const diff = sum - payableKg;
  return { ok: Math.abs(diff) <= tolerance, sum, target: payableKg, diff };
}
