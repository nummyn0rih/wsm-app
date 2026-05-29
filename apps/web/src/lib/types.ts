import type {
  IngredientUnit,
  QualityParamRole,
  ShipmentStatus,
  SupplierStatus,
  TaraKind,
} from '@wsm/shared';

// API JSON shapes (Prisma serialises Decimal/Date as string).
export interface RawMaterial {
  id: string;
  name: string;
  defaultUnit: string;
  colorBg: string;
  colorDot: string;
  qualityParams?: QualityParam[];
}
export interface QualityParam {
  id: string;
  rawMaterialId: string;
  name: string;
  unit: string;
  role: QualityParamRole;
  order: number;
}
export interface Carrier { id: string; name: string }
export interface Driver { id: string; fio: string; phone: string; carrierId: string | null; info: string | null; carrier?: Carrier | null }
export interface Supplier {
  id: string; name: string; inn: string | null; legalForm: string | null;
  legalAddr: string | null; factAddr: string | null; status: SupplierStatus;
  tags: string[]; startDate: string | null; note: string | null;
}
export interface TaraType { id: string; name: string; kind: TaraKind }
export interface Ingredient { id: string; name: string; unit: IngredientUnit; qtyOnPlant: string }
export interface Season { id: string; name: string; isCurrent: boolean }

export interface QualityCaliber { id: string; qualityParamId: string; kg: string }
export interface Quality {
  id: string; factKg: string; rejectKg: string; nonStdKg: string;
  nonStdPaidSeparately: boolean; nonStdPrice: string | null;
  payableKg: string; payablePct: string; actNumber: string | null;
  pdfName: string | null; pdfPath: string | null; pdfSize: string | null;
  comment: string | null; hasData: boolean; hasPdf: boolean; calibers: QualityCaliber[];
}
export interface ShipmentItem {
  id: string; rawMaterialId: string; kg: string; supplierId: string;
  taraTypeId: string | null; taraCount: number | null; processed: boolean; actNumber: string | null;
  rawMaterial: RawMaterial; supplier: Supplier; taraType: TaraType | null; quality: Quality | null;
}
export interface Shipment {
  id: string; shipDate: string | null; arrDate: string; driverId: string | null; carrierId: string | null;
  status: ShipmentStatus; comment: string | null;
  driver: Driver | null; carrier: Carrier | null; items: ShipmentItem[];
}

export interface WeekPlanResponse {
  year: number; week: number;
  raws: RawMaterial[];
  cells: { rawMaterialId: string; dayOfWeek: number; planKg: number }[];
  visibility: { rawMaterialId: string; visible: boolean }[];
  fact: Record<string, Record<number, number>>;
}
