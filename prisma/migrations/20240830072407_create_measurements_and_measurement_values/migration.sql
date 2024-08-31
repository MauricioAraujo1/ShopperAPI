-- CreateEnum
CREATE TYPE "MeasureType" AS ENUM ('WATER', 'GAS');

-- CreateTable
CREATE TABLE "measurements" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "customer_code" TEXT NOT NULL,
    "measure_datetime" TIMESTAMP(3) NOT NULL,
    "measure_type" "MeasureType" NOT NULL,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurement_values" (
    "id" TEXT NOT NULL,
    "measure_uuid" TEXT NOT NULL,
    "confirmed_value" INTEGER NOT NULL,
    "measurementId" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "measurement_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "measurement_values_measure_uuid_key" ON "measurement_values"("measure_uuid");

-- AddForeignKey
ALTER TABLE "measurement_values" ADD CONSTRAINT "measurement_values_measurementId_fkey" FOREIGN KEY ("measurementId") REFERENCES "measurements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
