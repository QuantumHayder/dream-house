/*
  Warnings:

  - You are about to drop the column `Fname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Hash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Lname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Username` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_Username_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "Fname",
DROP COLUMN "Hash",
DROP COLUMN "Lname",
DROP COLUMN "Role",
DROP COLUMN "Username",
ADD COLUMN     "fname" TEXT,
ADD COLUMN     "hash" TEXT NOT NULL,
ADD COLUMN     "lname" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_wishlistUnits" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_wishlistUnits_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_wishlistUnits_B_index" ON "_wishlistUnits"("B");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "_wishlistUnits" ADD CONSTRAINT "_wishlistUnits_A_fkey" FOREIGN KEY ("A") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_wishlistUnits" ADD CONSTRAINT "_wishlistUnits_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
