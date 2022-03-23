-- CreateEnum
CREATE TYPE "decision_enum" AS ENUM ('YES', 'NO', 'MAYBE');

-- CreateEnum
CREATE TYPE "contract_status_enum" AS ENUM ('DRAFT', 'APPROVED', 'CANCELLED', 'WAIT_APPROVAL', 'SIGNED', 'SENT');

-- CreateEnum
CREATE TYPE "email_status_enum" AS ENUM ('SCHEDULED', 'SENT', 'FAILED', 'NONE', 'DRAFT');

-- CreateEnum
CREATE TYPE "type_enum" AS ENUM ('CV', 'PORTFOLIO', 'FILE');

-- CreateEnum
CREATE TYPE "account_status_enum" AS ENUM ('ACTIVATED', 'PENDING', 'DISABLED', 'UNVERIFIED');

-- CreateTable
CREATE TABLE "applied_role" (
    "applied_role_id" SERIAL NOT NULL,
    "job_application_id" SERIAL NOT NULL,
    "role_id" SERIAL NOT NULL,

    CONSTRAINT "applied_role_pkey" PRIMARY KEY ("applied_role_id")
);

-- CreateTable
CREATE TABLE "attachment" (
    "attachment_id" SERIAL NOT NULL,
    "job_application_id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "type" "type_enum" NOT NULL,

    CONSTRAINT "attachment_pkey" PRIMARY KEY ("attachment_id")
);

-- CreateTable
CREATE TABLE "contract" (
    "contract_id" SERIAL NOT NULL,
    "student_id" SERIAL NOT NULL,
    "project_role_id" SERIAL NOT NULL,
    "information" TEXT,
    "created_by_login_user_id" SERIAL NOT NULL,
    "contract_status" "contract_status_enum" NOT NULL,

    CONSTRAINT "contract_pkey" PRIMARY KEY ("contract_id")
);

-- CreateTable
CREATE TABLE "evaluation" (
    "evaluation_id" SERIAL NOT NULL,
    "login_user_id" SERIAL NOT NULL,
    "job_application_id" SERIAL NOT NULL,
    "decision" "decision_enum" NOT NULL,
    "motivation" TEXT,
    "is_final" BOOLEAN NOT NULL,

    CONSTRAINT "evaluation_pkey" PRIMARY KEY ("evaluation_id")
);

-- CreateTable
CREATE TABLE "job_application" (
    "job_application_id" SERIAL NOT NULL,
    "student_id" SERIAL NOT NULL,
    "student_volunteer_info" TEXT NOT NULL,
    "responsibilities" TEXT,
    "motivation" TEXT,
    "fun_fact" TEXT,
    "student_coach" BOOLEAN NOT NULL,
    "osoc_id" INTEGER NOT NULL,
    "edus" TEXT,
    "edu_level" TEXT,
    "edu_duration" INTEGER,
    "edu_year" INTEGER,
    "edu_institute" TEXT,
    "email_status" "email_status_enum" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "job_application_pkey" PRIMARY KEY ("job_application_id")
);

-- CreateTable
CREATE TABLE "job_application_skill" (
    "job_application_skill_id" SERIAL NOT NULL,
    "job_application_id" SERIAL NOT NULL,
    "skill" TEXT NOT NULL,
    "language_id" SERIAL NOT NULL,
    "level" SMALLINT,
    "is_preferred" BOOLEAN,
    "is_best" BOOLEAN,

    CONSTRAINT "job_application_skill_pkey" PRIMARY KEY ("job_application_skill_id")
);

-- CreateTable
CREATE TABLE "language" (
    "language_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "language_pkey" PRIMARY KEY ("language_id")
);

-- CreateTable
CREATE TABLE "login_user" (
    "login_user_id" SERIAL NOT NULL,
    "person_id" SERIAL NOT NULL,
    "password" TEXT,
    "is_admin" BOOLEAN,
    "is_coach" BOOLEAN,
    "session_keys" TEXT[],
    "account_status" "account_status_enum" NOT NULL,

    CONSTRAINT "login_user_pkey" PRIMARY KEY ("login_user_id")
);

-- CreateTable
CREATE TABLE "osoc" (
    "osoc_id" SERIAL NOT NULL,
    "year" SMALLINT NOT NULL,

    CONSTRAINT "osoc_pkey" PRIMARY KEY ("osoc_id")
);

-- CreateTable
CREATE TABLE "person" (
    "person_id" SERIAL NOT NULL,
    "email" VARCHAR(320),
    "github" TEXT,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,

    CONSTRAINT "person_pkey" PRIMARY KEY ("person_id")
);

-- CreateTable
CREATE TABLE "project" (
    "project_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "osoc_id" SERIAL NOT NULL,
    "partner" TEXT NOT NULL,
    "description" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "positions" SMALLINT NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "project_role" (
    "project_role_id" SERIAL NOT NULL,
    "project_id" SERIAL NOT NULL,
    "role_id" SERIAL NOT NULL,
    "positions" SMALLINT NOT NULL,

    CONSTRAINT "project_role_pkey" PRIMARY KEY ("project_role_id")
);

-- CreateTable
CREATE TABLE "project_user" (
    "project_user_id" SERIAL NOT NULL,
    "login_user_id" SERIAL NOT NULL,
    "project_id" SERIAL NOT NULL,

    CONSTRAINT "project_user_pkey" PRIMARY KEY ("project_user_id")
);

-- CreateTable
CREATE TABLE "role" (
    "role_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "student" (
    "student_id" SERIAL NOT NULL,
    "person_id" SERIAL NOT NULL,
    "gender" TEXT NOT NULL,
    "pronouns" TEXT[],
    "phone_number" TEXT NOT NULL,
    "nickname" TEXT,
    "alumni" BOOLEAN NOT NULL,

    CONSTRAINT "student_pkey" PRIMARY KEY ("student_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "language_name_key" ON "language"("name");

-- CreateIndex
CREATE UNIQUE INDEX "login_user_person_id_key" ON "login_user"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "osoc_year_key" ON "osoc"("year");

-- CreateIndex
CREATE UNIQUE INDEX "person_email_key" ON "person"("email");

-- CreateIndex
CREATE UNIQUE INDEX "person_github_key" ON "person"("github");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "student_person_id_key" ON "student"("person_id");

-- AddForeignKey
ALTER TABLE "applied_role" ADD CONSTRAINT "applied_role_job_application_id_fkey" FOREIGN KEY ("job_application_id") REFERENCES "job_application"("job_application_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applied_role" ADD CONSTRAINT "applied_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_job_application_id_fkey" FOREIGN KEY ("job_application_id") REFERENCES "job_application"("job_application_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_created_by_login_user_id_fkey" FOREIGN KEY ("created_by_login_user_id") REFERENCES "login_user"("login_user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_project_role_id_fkey" FOREIGN KEY ("project_role_id") REFERENCES "project_role"("project_role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("student_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "evaluation" ADD CONSTRAINT "evaluation_job_application_id_fkey" FOREIGN KEY ("job_application_id") REFERENCES "job_application"("job_application_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "evaluation" ADD CONSTRAINT "evaluation_login_user_id_fkey" FOREIGN KEY ("login_user_id") REFERENCES "login_user"("login_user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_osoc_id_fkey" FOREIGN KEY ("osoc_id") REFERENCES "osoc"("osoc_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("student_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_application_skill" ADD CONSTRAINT "job_application_skill_job_application_id_fkey" FOREIGN KEY ("job_application_id") REFERENCES "job_application"("job_application_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_application_skill" ADD CONSTRAINT "job_application_skill_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "language"("language_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "login_user" ADD CONSTRAINT "login_user_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("person_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_osoc_id_fkey" FOREIGN KEY ("osoc_id") REFERENCES "osoc"("osoc_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_role" ADD CONSTRAINT "project_role_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_role" ADD CONSTRAINT "project_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_user" ADD CONSTRAINT "project_user_login_user_id_fkey" FOREIGN KEY ("login_user_id") REFERENCES "login_user"("login_user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_user" ADD CONSTRAINT "project_user_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("person_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
