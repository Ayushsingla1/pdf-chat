/*
  Warnings:

  - Added the required column `context` to the `Summary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Summary" ADD COLUMN     "context" TEXT NOT NULL;
