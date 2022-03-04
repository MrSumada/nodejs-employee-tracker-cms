INSERT INTO departments (name)
VALUES
    ('Sales'),
    ('Engineering'),
    ('Finance'),
    ('Legal'),
    ('Human Resources');

INSERT INTO roles (title, salary, department_id)
VALUES
    ('Salesperson', '80000', 1),
    ('Lead Engineer', '150000', 2),
    ('Software Engineer', '120000', 2),
    ('Account Manager', '160000', 3),
    ('Accountant', '125000', 3),
    ('Legal Team Lead', '250000', 4),
    ('Lawyer', '190000', 4),
    ('HR Manager', '130000', 5);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
    ('Adam', 'Payne', 2, NULL),
    ('Morgan', 'Przekurat', 3, 1),
    ('Amy', 'Charowsky', 8, NULL),
    ('Blake', 'Rogers', 6, NULL),
    ('Chris Evan', 'Simpson', 7, 4),
    ('Jacob', 'Horn', 4, NULL),
    ('Lauren', 'Stripling Bodie', 5, 6),
    ('Tori', 'Smith', 1, NULL),
    ('Amanda', 'Mayer', 6, NULL),
    ('Audrey', 'Mattaino', 7, 9),
    ('Dylan', "O'Keeffe", 3, 1),
    ('Miles', 'Lindahl', 5, 6),
    ('Russ', 'Feder', 6, 9),
    ('Nate', 'Brown', 1, NULL);
