INSERT INTO person(email, "name")
VALUES('osoc2@mail.com', 'Osoc TeamTwo');

INSERT INTO login_user(person_id, password, is_admin, is_coach, account_status)
VALUES((SELECT person_id FROM person WHERE email = 'osoc2@mail.com'), '$2b$08$MCblaKGOOBV7NpiW62GEc.km732o6XWDJxU6SfU3NMENxMuCWFlJq', TRUE, FALSE, 'ACTIVATED');