-- CreateTable
CREATE TABLE "UserInternal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SalesDealer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nama_dealer" TEXT NOT NULL,
    "nama_sales" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PengajuanKredit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'BARU_DISUBMIT_SALES',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "salesDealerId" TEXT NOT NULL,
    "marketingId" TEXT,
    "atasanId" TEXT,
    CONSTRAINT "PengajuanKredit_salesDealerId_fkey" FOREIGN KEY ("salesDealerId") REFERENCES "SalesDealer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PengajuanKredit_marketingId_fkey" FOREIGN KEY ("marketingId") REFERENCES "UserInternal" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PengajuanKredit_atasanId_fkey" FOREIGN KEY ("atasanId") REFERENCES "UserInternal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataKonsumen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pengajuanId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "tanggalLahir" DATETIME NOT NULL,
    "statusPerkawinan" TEXT NOT NULL,
    "dataPasangan" TEXT,
    CONSTRAINT "DataKonsumen_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "PengajuanKredit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataKendaraan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pengajuanId" TEXT NOT NULL,
    "dealer" TEXT NOT NULL,
    "merkKendaraan" TEXT NOT NULL,
    "modelKendaraan" TEXT NOT NULL,
    "tipeKendaraan" TEXT NOT NULL,
    "warnaKendaraan" TEXT NOT NULL,
    "hargaKendaraan" REAL NOT NULL,
    CONSTRAINT "DataKendaraan_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "PengajuanKredit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataPinjaman" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pengajuanId" TEXT NOT NULL,
    "asuransi" TEXT NOT NULL,
    "downPayment" REAL NOT NULL,
    "lamaKreditBulan" INTEGER NOT NULL,
    "angsuranBulanan" REAL NOT NULL,
    CONSTRAINT "DataPinjaman_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "PengajuanKredit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Dokumen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pengajuanId" TEXT NOT NULL,
    "jenisDokumen" TEXT NOT NULL,
    "urlFile" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Dokumen_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "PengajuanKredit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HistoriApproval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pengajuanId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusDari" TEXT NOT NULL,
    "statusKe" TEXT NOT NULL,
    "catatan" TEXT,
    "olehUser" TEXT NOT NULL,
    CONSTRAINT "HistoriApproval_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "PengajuanKredit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserInternal_username_key" ON "UserInternal"("username");

-- CreateIndex
CREATE UNIQUE INDEX "SalesDealer_username_key" ON "SalesDealer"("username");

-- CreateIndex
CREATE UNIQUE INDEX "DataKonsumen_pengajuanId_key" ON "DataKonsumen"("pengajuanId");

-- CreateIndex
CREATE UNIQUE INDEX "DataKendaraan_pengajuanId_key" ON "DataKendaraan"("pengajuanId");

-- CreateIndex
CREATE UNIQUE INDEX "DataPinjaman_pengajuanId_key" ON "DataPinjaman"("pengajuanId");
