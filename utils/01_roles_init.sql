INSERT INTO role (id, name, description)
VALUES (UUID_TO_BIN(UUID()), 'ADMIN', 'User that has access to priviledged data and administrative rights to it.');

INSERT INTO role (id, name, description)
VALUES (UUID_TO_BIN(UUID()), 'MEMBER', 'User that has been registered to access our service.');