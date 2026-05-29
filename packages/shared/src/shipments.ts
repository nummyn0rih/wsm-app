import { z } from 'zod';
import { ShipmentStatus } from './enums.js';

// ── Позиция отгрузки ──
export const shipmentItemInput = z.object({
  rawMaterialId: z.string(),
  kg: z.number().positive(),
  supplierId: z.string(),
  taraTypeId: z.string().nullish(),
  taraCount: z.number().int().positive().nullish(),
});
export type ShipmentItemInput = z.infer<typeof shipmentItemInput>;

// ── Отгрузка ──
export const shipmentCreate = z.object({
  arrDate: z.string().datetime(),
  shipDate: z.string().datetime().nullish(),
  driverId: z.string().nullish(),
  carrierId: z.string().nullish(),
  status: ShipmentStatus.default('PLANNED'),
  comment: z.string().nullish(),
  items: z.array(shipmentItemInput).min(1),
});
export type ShipmentCreate = z.infer<typeof shipmentCreate>;

export const shipmentUpdate = shipmentCreate.partial();

// ── Смена статуса ──
export const shipmentStatusChange = z.object({ to: ShipmentStatus });
export type ShipmentStatusChange = z.infer<typeof shipmentStatusChange>;

// ── Качество приёмки ──
export const qualityCaliberInput = z.object({
  qualityParamId: z.string(),
  kg: z.number().min(0),
});
export const qualityInput = z.object({
  factKg: z.number().positive(),
  rejectKg: z.number().min(0).default(0),
  nonStdKg: z.number().min(0).default(0),
  nonStdPaidSeparately: z.boolean().default(false),
  nonStdPrice: z.number().min(0).nullish(),
  actNumber: z.string().nullish(),
  comment: z.string().nullish(),
  calibers: z.array(qualityCaliberInput).default([]),
});
export type QualityInput = z.infer<typeof qualityInput>;

// ── Фильтры списка отгрузок ──
export const shipmentFilters = z.object({
  year: z.coerce.number().int().optional(),
  week: z.coerce.number().int().optional(),
  supplierId: z.string().optional(),
  rawMaterialId: z.string().optional(),
  status: ShipmentStatus.optional(),
  processed: z
    .union([z.literal('true'), z.literal('false')])
    .transform((v) => v === 'true')
    .optional(),
});
export type ShipmentFilters = z.infer<typeof shipmentFilters>;
