-- CreateTable
CREATE TABLE "Facilitator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FacilitatorAttendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilitatorId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "clockIn" DATETIME,
    "clockOut" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FacilitatorAttendance_facilitatorId_fkey" FOREIGN KEY ("facilitatorId") REFERENCES "Facilitator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DeviceBinding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviceId" TEXT NOT NULL,
    "studentId" TEXT,
    "facilitatorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DeviceBinding_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DeviceBinding_facilitatorId_fkey" FOREIGN KEY ("facilitatorId") REFERENCES "Facilitator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DeviceBinding" ("createdAt", "deviceId", "id", "studentId", "updatedAt") SELECT "createdAt", "deviceId", "id", "studentId", "updatedAt" FROM "DeviceBinding";
DROP TABLE "DeviceBinding";
ALTER TABLE "new_DeviceBinding" RENAME TO "DeviceBinding";
CREATE UNIQUE INDEX "DeviceBinding_deviceId_key" ON "DeviceBinding"("deviceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Facilitator_name_key" ON "Facilitator"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FacilitatorAttendance_facilitatorId_date_key" ON "FacilitatorAttendance"("facilitatorId", "date");
