/*
  Warnings:

  - You are about to drop the column `is_volunteer` on the `job_application` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `person` table. All the data in the column will be lost.
  - Added the required column `student_volunteer_info` to the `job_application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "job_application" DROP COLUMN "is_volunteer",
ADD COLUMN     "student_volunteer_info" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "person" DROP COLUMN "gender";

-- AlterTable
ALTER TABLE "student" ADD COLUMN     "gender" TEXT NOT NULL;
