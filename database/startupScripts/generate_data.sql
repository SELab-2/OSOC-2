/* Insert data into person table */
INSERT INTO person(email, firstname, lastname)
VALUES('Alice.student@gmail.com', 'Alice', 'Smith'),
('Bob@admin@osoc.com', 'Bob', 'Jones'), ('Trudy@coach@gmail.com', 'Trudy', 'Taylor');

/* Insert data into student table */
INSERT INTO student(person_id, gender, pronouns, phone_number, nickname, alumni)
VALUES((SELECT person_id FROM person WHERE firstname = 'Alice'), 
'Female', '{None}', '0032476553498', 'Unicorn', TRUE);

/* Insert data into login_user table */
INSERT INTO login_user(person_id, password, is_admin, is_coach, session_keys, account_status)
VALUES((SELECT person_id FROM person WHERE firstname = 'Bob'), 'Bob4life', TRUE, TRUE, array[]::text[], 'ACTIVATED'),
((SELECT person_id FROM person WHERE firstname = 'Trudy'), 'TrudyRulesAll777', FALSE, TRUE, array[]::text[], 'PENDING');

/* Insert data into osoc table */
INSERT INTO osoc(year)VALUES(2022);

/* Insert data into job_application table */
INSERT INTO job_application(student_id, osoc_id, student_volunteer_info, responsibilities, fun_fact, student_coach,
 edus, edu_level, edu_duration, edu_year, edu_institute, email_status, created_at)VALUES
 ((SELECT student_id FROM student WHERE phone_number = '0032476553498'), (SELECT osoc_id FROM osoc WHERE year = 2022), 
 'Yes, I can work with a student employment agreement in Belgium', 'Very responsible',  'I am a very funny fact', TRUE, 'Informatics',
 'Universitarian', 3, 3, 'Ghent University', 'NONE', '2022-03-14 23:10:00+01');

 /* Insert data into evaluation table */
 INSERT INTO evaluation(login_user_id, job_application_id, decision, motivation, is_final)VALUES
 ((SELECT login_user_id FROM login_user WHERE is_admin = TRUE), (SELECT job_application_id FROM job_application), 
 'YES', 'Simply the best', TRUE);

/* Insert data into role table */
INSERT INTO role(name)VALUES('Developer');

 /* Insert data into project table */
 INSERT INTO project(name, osoc_id, partner, start_date, end_date, positions)VALUES('OSOC Platform', 
 (SELECT osoc_id FROM osoc WHERE year = 2022), 'UGent', DATE '2022-07-01', DATE '2022-08-15', 7);

/* Insert data into project_user table */
INSERT INTO project_user(login_user_id, project_id)VALUES((SELECT login_user_id FROM login_user WHERE is_admin = TRUE), 
(SELECT project_id FROM project WHERE name = 'OSOC Platform'));

/* Insert data into project_role table */
INSERT INTO project_role(project_id, role_id, positions) VALUES((SELECT project_id FROM project WHERE name = 'OSOC Platform'), 
(SELECT role_id FROM role WHERE name = 'Developer'), 2);

/* Insert data into contract table */
INSERT INTO contract(student_id, project_role_id, information, created_by_login_user_id, contract_status) VALUES
((SELECT student_id FROM student WHERE phone_number = '0032476553498'), 
(SELECT project_role_id FROM project_role WHERE positions = 2), 'Developer contract for osoc platform', 
(SELECT login_user_id FROM login_user WHERE is_admin = TRUE), 'DRAFT');

/* Insert data into applied_role table */
INSERT INTO applied_role(job_application_id, role_id)VALUES
((SELECT job_application_id from job_application WHERE fun_fact = 'I am a very funny fact'), 
(SELECT role_id FROM role WHERE name = 'Developer'));

/* Insert data into language table */
INSERT INTO language(name)VALUES('Dutch');

/* Insert data into job_application_skill table */
INSERT INTO job_application_skill(job_application_id, skill, language_id, level, is_preferred, is_best) VALUES
((SELECT job_application_id from job_application WHERE fun_fact = 'I am a very funny fact'), 'Typing', 
(SELECT language_id FROM language WHERE name = 'Dutch'), 2, TRUE, TRUE);

/* Insert data into attachment table */
INSERT INTO attachment(job_application_id, data, type)VALUES
((SELECT job_application_id from job_application WHERE fun_fact = 'I am a very funny fact'), 
'https://github.com/SELab-2/OSOC-2', 'CV_URL');

INSERT INTO attachment(job_application_id, data, type)VALUES
((SELECT job_application_id from job_application WHERE fun_fact = 'I am a very funny fact'),
'I really need the money', 'MOTIVATION_STRING');