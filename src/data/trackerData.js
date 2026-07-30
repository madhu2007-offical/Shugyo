export const ROADMAP_NODES = [
  {
    id: 'intro',
    name: 'Introduction to DBs',
    description: 'Learn database concepts, schemas, tables, and basic architecture.',
    deps: [],
  },
  {
    id: 'er_model',
    name: 'ER Modeling',
    description: 'Understand entities, attributes, relations, and entity-relationship diagrams.',
    deps: ['intro'],
  },
  {
    id: 'relational_model',
    name: 'Relational Algebra',
    description: 'Master relational operations: select, project, join, and set theory.',
    deps: ['er_model'],
  },
  {
    id: 'sql_basics',
    name: 'SQL Basics',
    description: 'Learn SELECT, WHERE, ORDER BY, and simple aggregate operations.',
    deps: ['relational_model'],
  },
  {
    id: 'sql_joins',
    name: 'Joins & Subqueries',
    description: 'Master INNER, LEFT, RIGHT, FULL OUTER joins, and correlated subqueries.',
    deps: ['sql_basics'],
  },
  {
    id: 'normalization',
    name: 'Schema Normalization',
    description: 'Understand functional dependencies, 1NF, 2NF, 3NF, and BCNF.',
    deps: ['relational_model'],
  },
  {
    id: 'storage_files',
    name: 'Storage & Disk Management',
    description: 'Learn how pages, records, and files are stored on disk.',
    deps: ['intro'],
  },
  {
    id: 'indexing_btrees',
    name: 'Indexing & B+ Trees',
    description: 'Understand search keys, index structures, dense/sparse indexing, and B+ Trees.',
    deps: ['storage_files'],
  },
  {
    id: 'query_opt',
    name: 'Query Optimization',
    description: 'Learn relational algebra equivalence rules, cost estimation, and plan evaluation.',
    deps: ['indexing_btrees', 'sql_joins'],
  },
  {
    id: 'transactions_acid',
    name: 'Transactions & ACID',
    description: 'Understand isolation levels, atomicity, durability, and transaction schedules.',
    deps: ['relational_model'],
  },
  {
    id: 'concurrency',
    name: 'Concurrency Control',
    description: 'Master two-phase locking (2PL), deadlock resolution, and timestamp ordering.',
    deps: ['transactions_acid'],
  },
  {
    id: 'recovery',
    name: 'Crash Recovery',
    description: 'Learn log-based recovery, write-ahead logging (WAL), checkpoints, and ARIES.',
    deps: ['transactions_acid'],
  },
];

export const CHECKLIST_CATEGORIES = [
  {
    id: 'relational_theory',
    title: 'Relational Theory & Normalization',
    items: [
      { id: 'rel_1', text: 'Can explain the difference between candidate, primary, alternate, and foreign keys.' },
      { id: 'rel_2', text: 'Knows relational operators: Selection (σ), Projection (π), Join (⋈), Cartesian Product (×).' },
      { id: 'rel_3', text: 'Can identify functional dependencies and normalize a schema up to 3NF.' },
      { id: 'rel_4', text: 'Can describe Lossless-Join Decomposition and Dependency Preservation.' },
      { id: 'rel_5', text: 'Can contrast BCNF with 3NF and explain when redundancy is preferred.' }
    ]
  },
  {
    id: 'sql_mastery',
    title: 'SQL Development',
    items: [
      { id: 'sql_1', text: 'Can write queries combining INNER, LEFT, RIGHT, and FULL OUTER joins.' },
      { id: 'sql_2', text: 'Understands query execution order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.' },
      { id: 'sql_3', text: 'Can write aggregate queries using GROUP BY and HAVING clauses.' },
      { id: 'sql_4', text: 'Can write subqueries (correlated, nested) and CTEs (WITH expression).' },
      { id: 'sql_5', text: 'Can construct window functions like ROW_NUMBER(), RANK(), and PARTITION BY.' }
    ]
  },
  {
    id: 'storage_indexing',
    title: 'Storage & Access Methods',
    items: [
      { id: 'idx_1', text: 'Understands slotted-page architecture for storing variable-length records.' },
      { id: 'idx_2', text: 'Can explain the difference between clustered and unclustered indexes.' },
      { id: 'idx_3', text: 'Can write/trace B+ Tree insertion and deletion algorithms.' },
      { id: 'idx_4', text: 'Knows when a Hash index is superior/inferior to a B+ Tree index.' },
      { id: 'idx_5', text: 'Understands index-only scans and bitmap index scans.' }
    ]
  },
  {
    id: 'transactions_acid',
    title: 'Transactions & Recovery',
    items: [
      { id: 'tx_1', text: 'Can define all ACID properties and map them to database subsystems.' },
      { id: 'tx_2', text: 'Can draw transaction schedules displaying Dirty Read, Non-repeatable Read, and Phantom Read.' },
      { id: 'tx_3', text: 'Understands Conflict Serializability and can construct a precedence (dependency) graph.' },
      { id: 'tx_4', text: 'Can explain strict 2-Phase Locking (2PL) and how it prevents cascading aborts.' },
      { id: 'tx_5', text: 'Can explain ARIES recovery protocol (Analysis, Redo, Undo phases) and WAL rule.' }
    ]
  }
];

export const QUIZZES = [
  {
    id: 'theory_quiz',
    title: 'Relational Theory & Schema Design',
    description: 'Test your understanding of relational algebra, keys, and normalization principles.',
    questions: [
      {
        question: 'Which of the following relational algebra operations is used to filter rows matching a specific predicate?',
        options: ['Projection (π)', 'Selection (σ)', 'Join (⋈)', 'Intersection (∩)'],
        correctAnswer: 1
      },
      {
        question: 'A relation R is in 2NF if and only if it is in 1NF and:',
        options: [
          'No non-prime attribute is transitively dependent on a candidate key.',
          'No non-prime attribute is partially dependent on any candidate key.',
          'Every determinant is a superkey.',
          'It contains no foreign key cycles.'
        ],
        correctAnswer: 1
      },
      {
        question: 'If a decomposition is dependency-preserving, it means:',
        options: [
          'All functional dependencies can be enforced directly on the individual decomposed relations.',
          'We can reconstruct the original relation without creating spurious tuples.',
          'No two attributes belong to the same candidate key.',
          'It is automatically in Boyce-Codd Normal Form (BCNF).'
        ],
        correctAnswer: 0
      },
      {
        question: 'Which normal form is strictly concerned with eliminating multi-valued dependencies?',
        options: ['Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)', 'Fourth Normal Form (4NF)', 'Fifth Normal Form (5NF)'],
        correctAnswer: 2
      },
      {
        question: 'What is a prime attribute in a relational database?',
        options: [
          'An attribute that belongs to at least one candidate key.',
          'An attribute that is part of the primary key but not foreign keys.',
          'An attribute that cannot be null.',
          'An attribute that uniquely determines all other attributes.'
        ],
        correctAnswer: 0
      }
    ]
  },
  {
    id: 'sql_quiz',
    title: 'SQL Query Processing & Semantics',
    description: 'Evaluate your knowledge of JOIN operations, subqueries, grouping logic, and window functions.',
    questions: [
      {
        question: 'In a standard SQL query, which clause is executed immediately BEFORE the SELECT clause?',
        options: ['WHERE', 'GROUP BY', 'HAVING', 'ORDER BY'],
        correctAnswer: 2
      },
      {
        question: 'What does a LEFT JOIN return if there are no matches in the right table?',
        options: [
          'It skips those rows entirely.',
          'It returns the matching left rows, with NULL values for all right table columns.',
          'It throws a referential integrity violation error.',
          'It returns the entire cartesian product.'
        ],
        correctAnswer: 1
      },
      {
        question: 'What is the primary difference between RANK() and DENSE_RANK() window functions?',
        options: [
          'RANK() skips ranks after ties, whereas DENSE_RANK() does not skip any ranks.',
          'DENSE_RANK() skips ranks after ties, whereas RANK() does not.',
          'RANK() can only be used with integer values.',
          'DENSE_RANK() does not require an ORDER BY sub-clause.'
        ],
        correctAnswer: 0
      },
      {
        question: 'Which of the following is true regarding a correlated subquery?',
        options: [
          'It is executed exactly once before the outer query runs.',
          'It is evaluated once for each row processed by the outer query.',
          'It cannot contain any JOIN conditions.',
          'It must return a single scalar value.'
        ],
        correctAnswer: 1
      },
      {
        question: 'The HAVING clause in SQL is used to filter:',
        options: ['Rows before aggregation.', 'Groups after aggregation.', 'Indexes during execution.', 'Columns in the SELECT list.'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'storage_quiz',
    title: 'Storage, Indexing, and Optimization',
    description: 'Challenge your knowledge of disk layout, B+ Tree properties, and database scan techniques.',
    questions: [
      {
        question: 'Why are B+ Trees preferred over binary search trees (BSTs) for disk-based database indexes?',
        options: [
          'B+ Trees have a much higher branching factor, which dramatically minimizes disk I/O operations.',
          'B+ Trees require less memory to store on disk.',
          'BSTs do not support range queries.',
          'B+ Trees are simpler to implement and rebalance.'
        ],
        correctAnswer: 0
      },
      {
        question: 'In a B+ Tree of order m, each internal node (except the root) must contain at least how many children?',
        options: ['2 children', 'm children', 'ceil(m / 2) children', 'm - 1 children'],
        correctAnswer: 2
      },
      {
        question: 'What is a clustered index?',
        options: [
          'An index that groups multiple columns together.',
          'An index that specifies the physical sorting order of rows in the table.',
          'An index that contains pointers to all index files.',
          'An index created automatically on foreign keys.'
        ],
        correctAnswer: 1
      },
      {
        question: 'Which index type is most efficient for exact-match equality queries but does not support range scans?',
        options: ['B+ Tree Index', 'Hash Index', 'Inverted Index', 'Clustered Index'],
        correctAnswer: 1
      },
      {
        question: 'What is the purpose of a slotted-page architecture?',
        options: [
          'To map logical blocks to physical sectors on a SSD.',
          'To manage variable-length records on a page while keeping free space contiguous.',
          'To optimize CPU cache line alignments for columns.',
          'To divide database tables into partitions.'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'tx_quiz',
    title: 'Transactions & Concurrency Control',
    description: 'Test your grasp of ACID safety guarantees, isolation anomalies, locking, and recovery logging.',
    questions: [
      {
        question: 'Under which SQL isolation level can "phantom reads" occur, but not "dirty reads" or "non-repeatable reads"?',
        options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
        correctAnswer: 2
      },
      {
        question: 'What does the Write-Ahead Logging (WAL) protocol mandate?',
        options: [
          'Logs must be written to disk before the corresponding database page modifications are flushed to disk.',
          'Transactions must log their operations to a local file before notifying the coordinator.',
          'All database modifications must be written directly to the database file at commit time.',
          'Indexes must be updated in log memory before tables are updated.'
        ],
        correctAnswer: 0
      },
      {
        question: 'In the ARIES recovery algorithm, what is the correct sequence of recovery phases?',
        options: [
          'Redo → Undo → Analysis',
          'Analysis → Undo → Redo',
          'Analysis → Redo → Undo',
          'Redo → Analysis → Undo'
        ],
        correctAnswer: 2
      },
      {
        question: 'What problem does Strict Two-Phase Locking (Strict 2PL) solve that basic 2PL does not?',
        options: [
          'It guarantees conflict serializability.',
          'It prevents deadlocks.',
          'It eliminates cascading aborts by holding exclusive locks until the end of the transaction.',
          'It reduces lock contention by releasing shared locks early.'
        ],
        correctAnswer: 2
      },
      {
        question: 'Which property of ACID prevents one transaction from seeing the uncommitted changes of another?',
        options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
        correctAnswer: 2
      }
    ]
  }
];

export const SQL_DRILLS_SCHEMA = `
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER,
  salary INTEGER,
  manager_id INTEGER,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (manager_id) REFERENCES employees(id)
);

INSERT INTO departments VALUES (1, 'Engineering');
INSERT INTO departments VALUES (2, 'Sales');
INSERT INTO departments VALUES (3, 'Marketing');
INSERT INTO departments VALUES (4, 'Human Resources');

INSERT INTO employees VALUES (1, 'Alice Smith', 1, 120000, NULL);
INSERT INTO employees VALUES (2, 'Bob Jones', 1, 95000, 1);
INSERT INTO employees VALUES (3, 'Charlie Brown', 1, 80000, 1);
INSERT INTO employees VALUES (4, 'David Green', 2, 75000, NULL);
INSERT INTO employees VALUES (5, 'Emma White', 2, 90000, 4);
INSERT INTO employees VALUES (6, 'Frank Black', 3, 65000, NULL);
INSERT INTO employees VALUES (7, 'Grace Hall', 4, 70000, NULL);
`;

export const SQL_DRILLS = [
  {
    id: 'drill_1',
    title: 'Basic SELECT & Filtering',
    description: 'Retrieve a list of employees with high salaries.',
    instructions: 'Write a query to select the name and salary of all employees who earn more than $80,000.',
    correctQuery: 'SELECT name, salary FROM employees WHERE salary > 80000;',
  },
  {
    id: 'drill_2',
    title: 'Inner Joins',
    description: 'Match employees to their departments.',
    instructions: 'Write a query to retrieve the employee name and their department name. Use an INNER JOIN.',
    correctQuery: 'SELECT e.name, d.name FROM employees e INNER JOIN departments d ON e.department_id = d.id;',
  },
  {
    id: 'drill_3',
    title: 'Grouping and Aggregation',
    description: 'Calculate average department payroll.',
    instructions: 'Find the department name and the average salary of employees in that department, grouped by department name.',
    correctQuery: `
      SELECT d.name, AVG(e.salary) 
      FROM employees e 
      JOIN departments d ON e.department_id = d.id 
      GROUP BY d.name;
    `,
  },
  {
    id: 'drill_4',
    title: 'Self-Joins (Managers)',
    description: 'Find hierarchical relationships within a single table.',
    instructions: 'Write a query to select the employee name and their manager\'s name. (Filter out employees who do not have a manager).',
    correctQuery: `
      SELECT e.name, m.name 
      FROM employees e 
      JOIN employees m ON e.manager_id = m.id;
    `,
  },
  {
    id: 'drill_5',
    title: 'HAVING Clause',
    description: 'Filter aggregated groups.',
    instructions: 'Find the department name and total salary payroll for departments that spend more than $150,000 in total payroll.',
    correctQuery: `
      SELECT d.name, SUM(e.salary) 
      FROM employees e 
      JOIN departments d ON e.department_id = d.id 
      GROUP BY d.name 
      HAVING SUM(e.salary) > 150000;
    `,
  }
];

export const TROPHIES = [
  { id: 'first_step', name: 'First Step', desc: 'Set at least one roadmap node to "In Progress" or "Done".' },
  { id: 'roadmap_completionist', name: 'Roadmap Completionist', desc: 'Mark all 12 roadmap nodes as "Done".' },
  { id: 'first_drill', name: 'SQL Novice', desc: 'Successfully solve 1 SQL Drill.' },
  { id: 'sql_master', name: 'SQL Master', desc: 'Successfully solve all 5 SQL Drills.' },
  { id: 'master_of_mastery', name: 'Master of Mastery', desc: 'Complete at least 5 concepts in the Mastery Checklist.' },
  { id: 'first_quiz', name: 'Scholar of Theory', desc: 'Attempt at least 1 quiz in the Test Bank.' },
  { id: 'perfect_quiz', name: 'Perfect Score', desc: 'Score 100% on any quiz.' },
  { id: 'consistency_disciple', name: 'Consistency Disciple', desc: 'Establish an active activity streak.' }
];
