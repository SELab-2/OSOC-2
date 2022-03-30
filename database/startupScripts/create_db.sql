CREATE TABLE IF NOT EXISTS person(
   person_id    SERIAL             PRIMARY KEY,
   email        VARCHAR(320)       UNIQUE, /* max email length is 320 characters */
   github       TEXT               UNIQUE,
   firstname    TEXT      NOT NULL,
   lastname     TEXT      NOT NULL,
   CONSTRAINT login CHECK (email IS NOT NULL OR github IS NOT NULL),
   CONSTRAINT email_check CHECK (email is NULL or email LIKE '%_@__%.__%')
);


CREATE TABLE IF NOT EXISTS student(
   student_id      SERIAL          PRIMARY KEY,
   person_id       SERIAL          NOT NULL UNIQUE     REFERENCES person(person_id),
   gender          TEXT            NOT NULL,
   pronouns        TEXT [],
   phone_number    TEXT            NOT NULL,
   nickname        TEXT,
   alumni          BOOLEAN         NOT NULL
);


/* function used in login user to retrieve if email is used in person */
CREATE FUNCTION get_email_used(personId integer, given_password text)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS
$$
declare
    email_used text;
begin
    select email into email_used from person where person_id = personId;

    if (email_used IS NOT NULL) and (given_password is null) then
        return false;
    end if;

    return true;
END;
$$;

/* enum used in login_user to show the account status */
CREATE TYPE account_status_enum as ENUM ('ACTIVATED', 'PENDING', 'DISABLED', 'UNVERIFIED');

CREATE TABLE IF NOT EXISTS login_user(
    login_user_id    SERIAL     PRIMARY KEY,
    person_id        SERIAL     NOT NULL UNIQUE REFERENCES person(person_id),
    "password"         TEXT     NULL,
    is_admin         BOOLEAN NOT NULL,
    is_coach         BOOLEAN NOT NULL,
    account_status   account_status_enum NOT NULL,
    CONSTRAINT admin_or_coach_not_null CHECK (is_admin IS NOT NULL OR is_coach IS NOT NULL),
    CONSTRAINT admin_or_coach_true CHECK (is_admin IS TRUE or is_coach IS TRUE),
    CONSTRAINT password_not_null CHECK (get_email_used(person_id, "password"))
);

CREATE TABLE IF NOT EXISTS session_keys(
   session_key_id     SERIAL         PRIMARY KEY,
   login_user_id      SERIAL         NOT NULL REFERENCES login_user(login_user_id),
   session_key        VARCHAR(128)   NOT NULL UNIQUE
 );


CREATE TABLE IF NOT EXISTS osoc(
   osoc_id    SERIAL      PRIMARY KEY,
   year       SMALLINT    NOT NULL UNIQUE,
   CONSTRAINT valid_year CHECK (year >= date_part('year', CURRENT_DATE))
);


/* enum used in job appliction for the email status */
CREATE TYPE email_status_enum AS ENUM ('SCHEDULED', 'SENT', 'FAILED', 'NONE', 'DRAFT');

CREATE TABLE IF NOT EXISTS job_application (
    job_application_id        SERIAL               PRIMARY KEY,
    student_id                SERIAL               NOT NULL REFERENCES student(student_id),
    student_volunteer_info    TEXT                 NOT NULL,
    responsibilities          TEXT,
    fun_fact                  TEXT                 NOT NULL,
    student_coach             BOOLEAN              NOT NULL,
    osoc_id                   INT                  NOT NULL REFERENCES osoc(osoc_id),
    edus                      TEXT []              NOT NULL,
    edu_level                 TEXT                 NOT NULL,
    edu_duration              INT                  NOT NULL,
    edu_year                  INT                  NOT NULL,
    edu_institute             TEXT                 NOT NULL,
    email_status              email_status_enum    NOT NULL,
    created_at                TIMESTAMP WITH TIME ZONE NOT NULL /* used to sort to get the latest application */
);


/* enum used in evaluation for the possible decisions */
CREATE TYPE decision_enum AS ENUM ('YES', 'NO', 'MAYBE');

CREATE TABLE IF NOT EXISTS evaluation (
    evaluation_id         SERIAL           PRIMARY KEY,
    login_user_id         SERIAL           NOT NULL REFERENCES login_user(login_user_id),
    job_application_id    SERIAL           NOT NULL REFERENCES job_application(job_application_id),
    decision              decision_enum    NOT NULL,
    motivation            TEXT,
    is_final              BOOLEAN          NOT NULL
);


CREATE TABLE IF NOT EXISTS role (
    role_id    SERIAL    PRIMARY KEY,
    name       TEXT      NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS project (
   project_id    SERIAL           PRIMARY KEY,
   name          TEXT             NOT NULL,
   osoc_id       SERIAL           NOT NULL REFERENCES osoc (osoc_id),
   partner       TEXT             NOT NULL,
   description   TEXT,
   start_date    DATE             NOT NULL,
   end_date      DATE             NOT NULL,
   positions     SMALLINT         NOT NULL,
   CONSTRAINT dates CHECK (start_date <= end_date),
   CONSTRAINT valid_positions CHECK (positions > 0)
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
    positions          SMALLINT    NOT NULL,
    CONSTRAINT valid_positions CHECK (positions > 0)
);


/* enum used in job appliction for the contract status */
CREATE TYPE contract_status_enum AS ENUM ('DRAFT', 'APPROVED', 'CANCELLED', 'WAIT_APPROVAL', 'SIGNED', 'SENT');

CREATE TABLE IF NOT EXISTS contract(
   contract_id                 SERIAL                  PRIMARY KEY,
   student_id                  SERIAL                  NOT NULL REFERENCES student (student_id),
   project_role_id             SERIAL                  NOT NULL REFERENCES project_role (project_role_id),
   information                 TEXT,
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
    name           TEXT           NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS job_application_skill (
    job_application_skill_id    SERIAL         PRIMARY KEY,
    job_application_id          SERIAL         NOT NULL REFERENCES job_application(job_application_id),
    skill                       TEXT           NOT NULL,
    language_id                 SERIAL         NOT NULL REFERENCES language(language_id),
    level                       SMALLINT       NULL CHECK(level >= 0 AND level <= 5),
    is_preferred                BOOLEAN,
    is_best                     BOOLEAN
);


/* enum used in attachment for the possible types */
CREATE TYPE type_enum AS ENUM ('CV_URL', 'PORTFOLIO_URL', 'FILE_URL', 'MOTIVATION_STRING', 'MOTIVATION_URL');

CREATE TABLE IF NOT EXISTS attachment(
   attachment_id         SERIAL       PRIMARY KEY,
   job_application_id    SERIAL       NOT NULL REFERENCES job_application (job_application_id),
   data                  TEXT         NOT NULL,
   type                  type_enum    NOT NULL
);
