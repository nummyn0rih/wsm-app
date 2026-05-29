-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPERATOR', 'USER', 'MANAGER');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PLANNED', 'SHIPPED', 'ARRIVED');

-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('ACTIVE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "TaraKind" AS ENUM ('BOX', 'DRUM_METAL', 'DRUM_PLASTIC');

-- CreateEnum
CREATE TYPE "IngredientUnit" AS ENUM ('LITER', 'TON', 'KG');

-- CreateEnum
CREATE TYPE "QualityParamRole" AS ENUM ('PAYABLE', 'NONSTD', 'REJECT', 'INFO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultUnit" TEXT NOT NULL DEFAULT 'кг',
    "colorBg" TEXT NOT NULL,
    "colorDot" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityParam" (
    "id" TEXT NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'кг',
    "role" "QualityParamRole" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QualityParam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carrier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Carrier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "fio" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "carrierId" TEXT,
    "info" TEXT,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inn" TEXT,
    "legalForm" TEXT,
    "legalAddr" TEXT,
    "factAddr" TEXT,
    "status" "SupplierStatus" NOT NULL DEFAULT 'ACTIVE',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startDate" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvgTripWeight" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "autoKg" DECIMAL(12,2),
    "manualKg" DECIMAL(12,2),
    "useManual" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AvgTripWeight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaraType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "TaraKind" NOT NULL,

    CONSTRAINT "TaraType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" "IngredientUnit" NOT NULL,
    "qtyOnPlant" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "shipDate" TIMESTAMP(3),
    "arrDate" TIMESTAMP(3) NOT NULL,
    "driverId" TEXT,
    "carrierId" TEXT,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PLANNED',
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipmentItem" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "kg" DECIMAL(12,2) NOT NULL,
    "supplierId" TEXT NOT NULL,
    "taraTypeId" TEXT,
    "taraCount" INTEGER,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "actNumber" TEXT,

    CONSTRAINT "ShipmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quality" (
    "id" TEXT NOT NULL,
    "shipmentItemId" TEXT NOT NULL,
    "factKg" DECIMAL(12,2) NOT NULL,
    "rejectKg" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "nonStdKg" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "nonStdPaidSeparately" BOOLEAN NOT NULL DEFAULT false,
    "nonStdPrice" DECIMAL(12,2),
    "payableKg" DECIMAL(12,2) NOT NULL,
    "payablePct" DECIMAL(5,2) NOT NULL,
    "actNumber" TEXT,
    "pdfName" TEXT,
    "pdfPath" TEXT,
    "pdfSize" TEXT,
    "comment" TEXT,
    "hasData" BOOLEAN NOT NULL DEFAULT false,
    "hasPdf" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Quality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityCaliber" (
    "id" TEXT NOT NULL,
    "qualityId" TEXT NOT NULL,
    "qualityParamId" TEXT NOT NULL,
    "kg" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "QualityCaliber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekPlanCell" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "planKg" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "WeekPlanCell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekPlanRawVisibility" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WeekPlanRawVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterial_name_key" ON "RawMaterial"("name");

-- CreateIndex
CREATE INDEX "QualityParam_rawMaterialId_idx" ON "QualityParam"("rawMaterialId");

-- CreateIndex
CREATE UNIQUE INDEX "Carrier_name_key" ON "Carrier"("name");

-- CreateIndex
CREATE INDEX "Driver_carrierId_idx" ON "Driver"("carrierId");

-- CreateIndex
CREATE UNIQUE INDEX "AvgTripWeight_supplierId_rawMaterialId_key" ON "AvgTripWeight"("supplierId", "rawMaterialId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_name_key" ON "Season"("name");

-- CreateIndex
CREATE INDEX "Shipment_arrDate_idx" ON "Shipment"("arrDate");

-- CreateIndex
CREATE INDEX "Shipment_status_idx" ON "Shipment"("status");

-- CreateIndex
CREATE INDEX "ShipmentItem_shipmentId_idx" ON "ShipmentItem"("shipmentId");

-- CreateIndex
CREATE INDEX "ShipmentItem_rawMaterialId_idx" ON "ShipmentItem"("rawMaterialId");

-- CreateIndex
CREATE INDEX "ShipmentItem_supplierId_idx" ON "ShipmentItem"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "Quality_shipmentItemId_key" ON "Quality"("shipmentItemId");

-- CreateIndex
CREATE UNIQUE INDEX "QualityCaliber_qualityId_qualityParamId_key" ON "QualityCaliber"("qualityId", "qualityParamId");

-- CreateIndex
CREATE INDEX "WeekPlanCell_year_weekNumber_idx" ON "WeekPlanCell"("year", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WeekPlanCell_year_weekNumber_rawMaterialId_dayOfWeek_key" ON "WeekPlanCell"("year", "weekNumber", "rawMaterialId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "WeekPlanRawVisibility_year_weekNumber_idx" ON "WeekPlanRawVisibility"("year", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WeekPlanRawVisibility_year_weekNumber_rawMaterialId_key" ON "WeekPlanRawVisibility"("year", "weekNumber", "rawMaterialId");

-- AddForeignKey
ALTER TABLE "QualityParam" ADD CONSTRAINT "QualityParam_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvgTripWeight" ADD CONSTRAINT "AvgTripWeight_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvgTripWeight" ADD CONSTRAINT "AvgTripWeight_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentItem" ADD CONSTRAINT "ShipmentItem_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentItem" ADD CONSTRAINT "ShipmentItem_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentItem" ADD CONSTRAINT "ShipmentItem_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentItem" ADD CONSTRAINT "ShipmentItem_taraTypeId_fkey" FOREIGN KEY ("taraTypeId") REFERENCES "TaraType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quality" ADD CONSTRAINT "Quality_shipmentItemId_fkey" FOREIGN KEY ("shipmentItemId") REFERENCES "ShipmentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityCaliber" ADD CONSTRAINT "QualityCaliber_qualityId_fkey" FOREIGN KEY ("qualityId") REFERENCES "Quality"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityCaliber" ADD CONSTRAINT "QualityCaliber_qualityParamId_fkey" FOREIGN KEY ("qualityParamId") REFERENCES "QualityParam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekPlanCell" ADD CONSTRAINT "WeekPlanCell_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekPlanRawVisibility" ADD CONSTRAINT "WeekPlanRawVisibility_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
