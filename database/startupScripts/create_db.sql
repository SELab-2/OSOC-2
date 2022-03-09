CREATE TABLE IF NOT EXISTS person(
   person_id    SERIAL             PRIMARY KEY,
   email        VARCHAR (255),
   github       VARCHAR (255),   
   firstname    VARCHAR (50)      NOT NULL,
   lastname     VARCHAR (50)      NOT NULL,
   gender       VARCHAR (20)      NOT NULL,
   CONSTRAINT login CHECK (email IS NOT NULL OR github IS NOT NULL)
);


CREATE TABLE IF NOT EXISTS student(
   student_id      SERIAL          PRIMARY KEY,
   person_id       SERIAL          NOT NULL     REFERENCES person (person_id),
   pronouns        TEXT [],
   phone_number    VARCHAR (13)    NOT NULL,
   nickname        VARCHAR (50),
   alumni          BOOLEAN         NOT NULL
);


CREATE TABLE IF NOT EXISTS login_user (
    login_user_id    SERIAL     PRIMARY KEY,
    person_id        SERIAL     NOT NULL REFERENCES person(person_id),
    password         VARCHAR    NOT NULL, 
    /* TODO: dit mag wel null zijn als we inloggen met github? via een trigger? */
    /* TODO2: Wat als je zowel email als github hebt */
    is_admin         BOOLEAN,
    is_coach         BOOLEAN,
    CONSTRAINT admin_or_coach_not_null CHECK (is_admin IS NOT NULL OR is_coach IS NOT NULL),
    CONSTRAINT admin_or_coach_true CHECK (is_admin IS TRUE or is_coach IS TRUE)
);


CREATE TABLE IF NOT EXISTS osoc(
   osoc_id    SERIAL      PRIMARY KEY,
   year       SMALLINT    NOT NULL
);


/* enum used in job appliction for the email status */
CREATE TYPE email_status_enum AS ENUM ('Scheduled', 'Sent', 'Failed', 'None');

CREATE TABLE IF NOT EXISTS job_application (
    job_application_id    SERIAL               PRIMARY KEY,
    student_id            SERIAL               NOT NULL REFERENCES student(student_id),
    responsibilities      VARCHAR,
    motivation            VARCHAR,
    fun_fact              VARCHAR,
    is_volunteer          BOOLEAN              NOT NULL,
    student_coach         BOOLEAN              NOT NULL,
    osoc_id               INT                  NOT NULL REFERENCES osoc(osoc_id),
    edus                  VARCHAR,
    edu_level             VARCHAR (250),
    edu_duration          INT,
    edu_year              INT,
    edu_institute         VARCHAR (250),
    email_status          email_status_enum    NOT NULL
);


/* enum used in evaluation for the possible decisions */
CREATE TYPE decision_enum AS ENUM ('YES', 'NO', 'MAYBE');

CREATE TABLE IF NOT EXISTS evaluation (
    evaluation_id         SERIAL           PRIMARY KEY,
    login_user_id         SERIAL           NOT NULL REFERENCES login_user(login_user_id),
    job_application_id    SERIAL           NOT NULL REFERENCES job_application(job_application_id),
    decision              decision_enum    NOT NULL,
    motivation            VARCHAR,
    is_final              BOOLEAN          NOT NULL
);


CREATE TABLE IF NOT EXISTS role (
    role_id    SERIAL    PRIMARY KEY,
    name       VARCHAR
);


CREATE TABLE IF NOT EXISTS project (
   project_id    SERIAL           PRIMARY KEY,
   name          VARCHAR (255)    NOT NULL,
   osoc_id       SERIAL           NOT NULL REFERENCES osoc (osoc_id),
   partner       VARCHAR (255)    NOT NULL,
   start_date    DATE             NOT NULL,
   end_data      DATE             NOT NULL,
   positions     SMALLINT         NOT NULL
);


CREATE TABLE IF NOT EXISTS project_user (
   project_user_id    SERIAL    PRIMARY KEY,
   login_user_id      SERIAL    NOT NULL REFERENCES login_user (login_user_id),
   project_id         SERIAL    NOT NULL REFERENCES project (project_id)
);


CREATE TABLE IF NOT EXISTS project_role (
    project_role_id    SERIAL      PRIMARY KEY,
    project_id         SERIAL      NOT NULL REFERENCES project(project_id),
    role_id            SERIAL      NOT NULL REFERENCES role(role_id),
    positions          SMALLINT    NOT NULL
);


/* enum used in job appliction for the contract status */
CREATE TYPE contract_status_enum AS ENUM ('Draft', 'Approved', 'Cancelled', 'Wait_Approval', 'Signed', 'Sent');

CREATE TABLE IF NOT EXISTS contract(
   contract_id                 SERIAL                  PRIMARY KEY,
   student_id                  SERIAL                  NOT NULL REFERENCES student (student_id),
   project_role_id             SERIAL                  NOT NULL REFERENCES project_role (project_role_id),
   information                 VARCHAR,
   created_by_login_user_id    SERIAL                  NOT NULL REFERENCES login_user (login_user_id),
   contract_status             contract_status_enum    NOT NULL
);


CREATE TABLE IF NOT EXISTS applied_role (
    applied_role_id       SERIAL    PRIMARY KEY,
    job_application_id    SERIAL    NOT NULL REFERENCES job_application(job_application_id),
    role_id               SERIAL    NOT NULL REFERENCES role(role_id)
);


CREATE TABLE IF NOT EXISTS language (
    language_id    SERIAL         PRIMARY KEY,
    name           VARCHAR(50)    NOT NULL
);


CREATE TABLE IF NOT EXISTS job_application_skill (
    job_application_skill_id    SERIAL         PRIMARY KEY,
    job_application_id          SERIAL         NOT NULL REFERENCES job_application(job_application_id),
    skill                       VARCHAR(50)    NOT NULL,
    language_id                 SERIAL         NOT NULL REFERENCES language(language_id),
    level                       SMALLINT       NOT NULL CHECK(level >= 0 AND level <= 5),
    is_preferred                BOOLEAN,
    is_best                     BOOLEAN
);


/* enum used in attachment for the possible types */
CREATE TYPE type_enum AS ENUM ('CV', 'Portfolio', 'File');

CREATE TABLE IF NOT EXISTS attachment(
   attachment_id         SERIAL       PRIMARY KEY,
   job_application_id    SERIAL       NOT NULL REFERENCES job_application (job_application_id),
   url                   VARCHAR      NOT NULL,
   type                  type_enum    NOT NULL
);
