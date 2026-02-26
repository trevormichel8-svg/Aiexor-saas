-- CreateTable
CREATE TABLE "GalleryItem" (
  "id" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "image" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "model" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);
