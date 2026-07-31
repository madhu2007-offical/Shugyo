export const QUOTES = [
  { text: "Simplicity is a prerequisite for reliability.", author: "Edsger W. Dijkstra" },
  { text: "The most dangerous phrase in the language is, 'We've always done it this way.'", author: "Grace Hopper" },
  { text: "Everything fails, all the time — design for it.", author: "Werner Vogels, Amazon CTO" },
  { text: "Data is a precious thing and will last longer than the systems themselves.", author: "Tim Berners-Lee" },
  { text: "The purpose of computing is insight, not numbers.", author: "Richard Hamming" }
];

export const PRESSURE_QUOTES = [
  'Every week you skip this, someone else is finishing it instead of you.',
  'The interviewer won\'t ask if you meant to learn indexing. They\'ll just ask about indexing.',
  'You already know the schedule. The only variable left is whether you show up.',
  'Nobody drowns in a topic. They drown in the weeks they kept postponing it.',
  'The gap between "I know SQL" and "I understand the engine" is exactly this roadmap.',
  'P0 takes a week. Regretting not starting it takes a lot longer.'
];

export const ROADMAP_NODES = [
  {
    id: 0, code: "P0", name: "Foundations", time: "1–2 weeks", lane: 0, col: 0, deps: [], optional: false,
    punchline: "Every schema war starts here.",
    topics: "Relational model, ER-to-schema mapping, keys, normalization (1NF–BCNF), relational algebra.",
    resources: [
      { name:"NPTEL — Database Management System", type:"Course", origin:"in", desc:"IIT Kharagpur, Prof. Partha Pratim Das — rigorous, exam-grade fundamentals.", link:"https://nptel.ac.in/courses/106105175" },
      { name:"CMU 15-445 Intro to Database Systems", type:"Course", origin:"intl", desc:"Andy Pavlo's full course, free on YouTube — the gold standard.", link:"https://15445.courses.cs.cmu.edu/" },
      { name:"GeeksforGeeks — DBMS", type:"Reading", origin:"in", desc:"Fast concept reviews paired with practice questions.", link:"https://www.geeksforgeeks.org/dbms/dbms/" },
      { name:"Stanford Databases (Widom)", type:"Course", origin:"intl", desc:"Self-paced relational theory + SQL, via Stanford Online.", link:"https://online.stanford.edu/courses/soe-ydatabases-databases" }
    ]
  },
  {
    id: 1, code: "P1", name: "SQL as a Tool of Thought", time: "2 weeks", lane: 0, col: 1, deps: [0], optional: false,
    punchline: "Queries aren't spells. They're logic.",
    topics: "Joins, correlated subqueries, window functions, recursive CTEs, reading EXPLAIN plans.",
    resources: [
      { name:"CodeHelp — DBMS for Placements", type:"Playlist", origin:"in", desc:"Love Babbar & Lakshay Kumar — structured, placement-focused SQL depth.", link:"https://www.youtube.com/@CodeHelp/playlists" },
      { name:"Apna College — DBMS Notes", type:"Video course", origin:"in", desc:"Shradha Khapra's full DBMS-for-placements lecture with notes.", link:"https://www.youtube.com/watch?v=f1oV46r69YM" },
      { name:"Use The Index, Luke", type:"Free book", origin:"intl", desc:"The best resource on indexing and reading execution plans.", link:"https://use-the-index-luke.com/" },
      { name:"LeetCode — Top SQL 50", type:"Practice", origin:"intl", desc:"Highest-leverage SQL practice set for interviews and mastery alike.", link:"https://leetcode.com/studyplan/top-sql-50/" },
      { name:"SQLZoo", type:"Interactive", origin:"intl", desc:"Drills for joins and query fundamentals.", link:"https://sqlzoo.net/" }
    ]
  },
  {
    id: 2, code: "P2", name: "Storage & Indexing Internals", time: "3 weeks", lane: 0, col: 2, deps: [1], optional: false,
    punchline: "Where 'it's slow' finally gets an answer.",
    topics: "Pages, buffer pools, B+ trees, hash indexes, LSM trees, write-ahead logging.",
    resources: [
      { name:"Database Internals — Alex Petrov", type:"Book", origin:"intl", desc:"The definitive modern book on storage engines. Read this phase alongside it.", link:"https://www.oreilly.com/library/view/database-internals/9781492040330/" },
      { name:"CMU 15-445 — Storage & Indexes lectures", type:"Course", origin:"intl", desc:"Lectures 3–8 cover buffer pools, hash tables, tree indexes in depth.", link:"https://15445.courses.cs.cmu.edu/fall2024/schedule.html" },
      { name:"Let's Build a Simple Database", type:"Hands-on tutorial", origin:"intl", desc:"Build a SQLite clone in C — the fastest way to internalize B-trees.", link:"https://cstack.github.io/db_tutorial/" }
    ]
  },
  {
    id: 3, code: "P3", name: "Transactions & Concurrency", time: "2–3 weeks", lane: 0, col: 3, deps: [2], optional: false,
    punchline: "Where race conditions get caught.",
    topics: "ACID, isolation levels, 2PL, MVCC, deadlocks, ARIES recovery.",
    resources: [
      { name:"CMU 15-445 — Concurrency Control & Recovery", type:"Course", origin:"intl", desc:"How real engines implement isolation and crash recovery.", link:"https://15445.courses.cs.cmu.edu/" },
      { name:"NPTEL — Transaction Management module", type:"Course", origin:"in", desc:"Formal treatment of schedules, serializability, and locking protocols.", link:"https://nptel.ac.in/courses/106105175" },
      { name:"InterviewBit — DBMS Questions", type:"Reading", origin:"in", desc:"Curated question bank, strong on transaction-isolation edge cases.", link:"https://www.interviewbit.com/dbms-interview-questions/" }
    ]
  },
  {
    id: 4, code: "P4", name: "Distributed Databases", time: "3–4 weeks", lane: 0, col: 4, deps: [3], optional: false,
    punchline: "One server was never going to be enough.",
    topics: "CAP/PACELC, replication, sharding, Paxos/Raft, 2PC, Spanner-style architectures.",
    resources: [
      { name:"Designing Data-Intensive Applications", type:"Book", origin:"intl", desc:"Martin Kleppmann — the modern classic. Read cover to cover.", link:"https://dataintensive.net/" },
      { name:"MIT 6.824 — Distributed Systems", type:"Course + labs", origin:"intl", desc:"Free course with a real Raft implementation lab.", link:"https://pdos.csail.mit.edu/6.824/" },
      { name:"Google Spanner paper", type:"Research paper", origin:"intl", desc:"Primary source for globally-distributed strongly-consistent DBs.", link:"https://research.google/pubs/pub39966/" },
      { name:"Amazon Dynamo paper", type:"Research paper", origin:"intl", desc:"The paper that shaped Cassandra, Riak, and DynamoDB.", link:"https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf" }
    ]
  },
  {
    id: 5, code: "P5", name: "Query Optimization & Modern Engines", time: "2 weeks", lane: 0, col: 5, deps: [4], optional: false,
    punchline: "Make the planner work for you.",
    topics: "Cost-based optimizers, join ordering, columnar storage, vectorized execution.",
    resources: [
      { name:"CMU 15-721 Advanced Database Systems", type:"Course", origin:"intl", desc:"Andy Pavlo's sequel course — modern OLAP engine internals.", link:"https://15721.courses.cs.cmu.edu/" },
      { name:"DuckDB Docs", type:"Docs", origin:"intl", desc:"Extremely well-documented modern columnar engine.", link:"https://duckdb.org/docs/" },
      { name:"System Design Primer", type:"Reading", origin:"intl", desc:"Free GitHub repo — DB scaling patterns with diagrams.", link:"https://github.com/donnemartin/system-design-primer" }
    ]
  },
  {
    id: 6, code: "P6", name: "NoSQL & Polyglot Persistence", time: "1–2 weeks", lane: 1, col: 3, deps: [2], optional: true,
    punchline: "Not every problem is a table.",
    topics: "Document, key-value, wide-column, and graph models — and when each actually fits.",
    resources: [
      { name:"MongoDB University", type:"Free courses", origin:"intl", desc:"Hands-on document-model courses, official and free.", link:"https://learn.mongodb.com/" },
      { name:"Cassandra Architecture Docs", type:"Docs", origin:"intl", desc:"Official docs on wide-column storage and gossip protocols.", link:"https://cassandra.apache.org/doc/latest/cassandra/architecture/" }
    ]
  },
  {
    id: 7, code: "P7", name: "SQL Interview Drilling", time: "ongoing", lane: 1, col: 1, deps: [1], optional: true,
    punchline: "Reps beat talent under pressure.",
    topics: "Timed SQL practice sets and pattern recognition — run in parallel with P2 onward.",
    resources: [
      { name:"LeetCode — Top SQL 50", type:"Practice", origin:"intl", desc:"Highest-leverage SQL practice set for interviews and mastery alike.", link:"https://leetcode.com/studyplan/top-sql-50/" },
      { name:"StrataScratch", type:"Practice", origin:"intl", desc:"Real company SQL interview questions.", link:"https://www.stratascratch.com/" }
    ]
  },
  {
    id: 8, code: "P8", name: "System Design Capstone", time: "2–3 weeks", lane: 0, col: 6, deps: [5, 6], optional: false,
    punchline: "Everything you learned, on the clock.",
    topics: "Combine everything — design a sharded, replicated, HTAP-aware system end to end.",
    resources: [
      { name:"System Design Primer", type:"Reading", origin:"intl", desc:"Free GitHub repo — DB scaling patterns with diagrams.", link:"https://github.com/donnemartin/system-design-primer" },
      { name:"Designing Data-Intensive Applications", type:"Book", origin:"intl", desc:"Revisit chapters 5–9 with implementation experience behind you now.", link:"https://dataintensive.net/" }
    ]
  }
];

export const BOOKS = [
  { title:"Database System Concepts", author:"Silberschatz, Korth, Sudarshan" },
  { title:"Database Internals", author:"Alex Petrov" },
  { title:"Designing Data-Intensive Applications", author:"Martin Kleppmann" },
  { title:"Use The Index, Luke", author:"Markus Winand (free)" },
  { title:"Readings in Database Systems (Red Book)", author:"redbook.io (free)" }
];

export const MILESTONES = [
  "Normalize a messy real-world schema to BCNF from memory",
  "Read an EXPLAIN ANALYZE output and explain the plan chosen",
  "Explain why B+ trees, not binary trees, back most indexes",
  "Implement a basic B-tree-backed key-value store by hand",
  "Explain MVCC and how Postgres/InnoDB use it",
  "Trace what happens when two transactions race at Read Committed vs Serializable",
  "Explain CAP theorem with a concrete system example, not just the buzzword",
  "Implement Raft leader election in the MIT 6.824 lab",
  "Explain when you'd choose a wide-column store over a relational one",
  "Read the Dynamo or Spanner paper and summarize the core design in your own words"
];

export const SQL_DRILLS_SCHEMA = `
CREATE TABLE departments (
  dept_id INTEGER PRIMARY KEY,
  dept_name TEXT NOT NULL,
  budget INTEGER
);

CREATE TABLE employees (
  emp_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  dept_id INTEGER,
  salary INTEGER,
  manager_id INTEGER,
  hire_date TEXT,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id),
  FOREIGN KEY (manager_id) REFERENCES employees(emp_id)
);

CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT
);

CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  emp_id INTEGER,
  order_date TEXT,
  amount INTEGER,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (emp_id) REFERENCES employees(emp_id)
);

INSERT INTO departments VALUES (1, 'Engineering', 800000);
INSERT INTO departments VALUES (2, 'Sales', 400000);
INSERT INTO departments VALUES (3, 'Data', 600000);
INSERT INTO departments VALUES (4, 'HR', 150000);

INSERT INTO employees VALUES (1, 'Aarav Shah', 1, 95000, NULL, '2019-03-11');
INSERT INTO employees VALUES (2, 'Priya Nair', 1, 78000, 1, '2020-06-01');
INSERT INTO employees VALUES (3, 'Rohan Mehta', 1, 71000, 1, '2021-01-15');
INSERT INTO employees VALUES (4, 'Sneha Iyer', 2, 88000, NULL, '2018-09-20');
INSERT INTO employees VALUES (5, 'Karan Verma', 2, 62000, 4, '2022-02-10');
INSERT INTO employees VALUES (6, 'Ananya Rao', 3, 105000, NULL, '2017-05-05');
INSERT INTO employees VALUES (7, 'Vikram Joshi', 3, 69000, 6, '2021-11-01');
INSERT INTO employees VALUES (8, 'Ishita Desai', 3, 73000, 6, '2020-08-19');
INSERT INTO employees VALUES (9, 'Manish Gupta', 4, 54000, NULL, '2023-01-09');
INSERT INTO employees VALUES (10, 'Divya Kulkarni', 1, 82000, 1, '2019-12-03');

INSERT INTO customers VALUES (1, 'Blue Fern Traders', 'Pune');
INSERT INTO customers VALUES (2, 'Amber Retail Co', 'Mumbai');
INSERT INTO customers VALUES (3, 'North Star Foods', 'Delhi');
INSERT INTO customers VALUES (4, 'Kite & Key Ltd', 'Bengaluru');
INSERT INTO customers VALUES (5, 'Solace Interiors', 'Chennai');
INSERT INTO customers VALUES (6, 'Never Ordered Inc', 'Pune');

INSERT INTO orders VALUES (1, 1, 2, '2024-01-05', 12000);
INSERT INTO orders VALUES (2, 2, 2, '2024-01-19', 8500);
INSERT INTO orders VALUES (3, 1, 5, '2024-02-02', 15500);
INSERT INTO orders VALUES (4, 3, 5, '2024-02-14', 4200);
INSERT INTO orders VALUES (5, 4, 2, '2024-02-28', 9800);
INSERT INTO orders VALUES (6, 2, 5, '2024-03-03', 21000);
INSERT INTO orders VALUES (7, 5, 2, '2024-03-10', 6300);
INSERT INTO orders VALUES (8, 1, 5, '2024-03-22', 11200);
INSERT INTO orders VALUES (9, 3, 2, '2024-04-01', 17800);
INSERT INTO orders VALUES (10, 4, 5, '2024-04-15', 5400);
`;

export const SQL_DRILLS = [
  {
    topic: "SELECT / WHERE / ORDER BY", difficulty: "easy", checkOrder: true,
    prompt: "List every employee in the Engineering department (dept_id 1), ordered by salary from highest to lowest. Return name and salary.",
    solution: "SELECT name, salary FROM employees WHERE dept_id = 1 ORDER BY salary DESC",
    explain: "Filters rows with WHERE before ORDER BY sorts the remaining set — a classic first drill for reading query execution order (FROM → WHERE → SELECT → ORDER BY)."
  },
  {
    topic: "LIMIT / Top-N", difficulty: "easy", checkOrder: true,
    prompt: "Find the 3 highest-paid employees company-wide. Return name and salary.",
    solution: "SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3",
    explain: "LIMIT after ORDER BY is the standard 'top-N' pattern — without the ORDER BY, LIMIT would return an arbitrary 3 rows."
  },
  {
    topic: "Aggregate + GROUP BY", difficulty: "easy", checkOrder: false,
    prompt: "Find the average salary per department. Return dept_id and the average salary as avg_salary.",
    solution: "SELECT dept_id, AVG(salary) AS avg_salary FROM employees GROUP BY dept_id",
    explain: "GROUP BY collapses rows sharing a dept_id into one group, and AVG() computes one value per group — every non-aggregated column in SELECT must appear in GROUP BY."
  },
  {
    topic: "HAVING", difficulty: "medium", checkOrder: false,
    prompt: "Find departments with more than 2 employees. Return dept_id and the employee count as emp_count.",
    solution: "SELECT dept_id, COUNT(*) AS emp_count FROM employees GROUP BY dept_id HAVING COUNT(*) > 2",
    explain: "HAVING filters groups after aggregation — WHERE can't be used here since COUNT(*) doesn't exist until the rows are grouped."
  },
  {
    topic: "INNER JOIN", difficulty: "medium", checkOrder: false,
    prompt: "List each order's order_id and amount alongside the name of the employee who processed it.",
    solution: "SELECT o.order_id, o.amount, e.name FROM orders o JOIN employees e ON o.emp_id = e.emp_id",
    explain: "An inner join only returns rows where the join key matches on both sides — every order here does have a valid emp_id, so no rows are dropped."
  },
  {
    topic: "LEFT JOIN", difficulty: "medium", checkOrder: false,
    prompt: "List every department's dept_name and how many employees it has — including departments with zero employees. Return dept_name and emp_count.",
    solution: "SELECT d.dept_name, COUNT(e.emp_id) AS emp_count FROM departments d LEFT JOIN employees e ON d.dept_id = e.dept_id GROUP BY d.dept_name",
    explain: "LEFT JOIN keeps every row from departments even when there's no matching employee; COUNT(e.emp_id) (not COUNT(*)) correctly counts 0 for unmatched rows since emp_id is NULL there."
  },
  {
    topic: "Subquery (non-correlated)", difficulty: "medium", checkOrder: false,
    prompt: "Find employees who earn more than the company-wide average salary. Return name and salary.",
    solution: "SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)",
    explain: "The subquery runs once, independently, producing a single scalar value that the outer query compares every row against."
  },
  {
    topic: "Correlated subquery", difficulty: "hard", checkOrder: false,
    prompt: "Find employees who earn more than their own department's average salary. Return name and dept_id.",
    solution: "SELECT e1.name, e1.dept_id FROM employees e1 WHERE e1.salary > (SELECT AVG(e2.salary) FROM employees e2 WHERE e2.dept_id = e1.dept_id)",
    explain: "This subquery references the outer row's dept_id, so it re-runs once per outer row — much more expensive than a non-correlated subquery on large tables."
  },
  {
    topic: "Self JOIN", difficulty: "medium", checkOrder: false,
    prompt: "List every employee alongside their manager's name. Return the employee's name as emp_name and the manager's name as manager_name. Only include employees who have a manager.",
    solution: "SELECT e.name AS emp_name, m.name AS manager_name FROM employees e JOIN employees m ON e.manager_id = m.emp_id",
    explain: "A self join treats the same table as two logical tables via aliases (e and m) — a plain JOIN here naturally excludes employees with a NULL manager_id."
  },
  {
    topic: "CASE WHEN", difficulty: "medium", checkOrder: false,
    prompt: "Categorize each employee into a salary band: 'High' if salary > 80000, 'Mid' if between 50000 and 80000 inclusive, otherwise 'Low'. Return name and the band as salary_band.",
    solution: "SELECT name, CASE WHEN salary > 80000 THEN 'High' WHEN salary >= 50000 THEN 'Mid' ELSE 'Low' END AS salary_band FROM employees",
    explain: "CASE WHEN evaluates conditions top to bottom and stops at the first match — order the conditions carefully, since a later broader condition can shadow an earlier one if flipped."
  },
  {
    topic: "Anti-join (NOT IN)", difficulty: "hard", checkOrder: false,
    prompt: "Find customers who have never placed an order. Return name.",
    solution: "SELECT name FROM customers WHERE customer_id NOT IN (SELECT customer_id FROM orders)",
    explain: "This is the classic anti-join pattern — it can also be written as a LEFT JOIN ... WHERE orders.customer_id IS NULL, which usually performs better on NULL-heavy real data."
  },
  {
    topic: "Window function", difficulty: "hard", checkOrder: false,
    prompt: "Rank employees by salary within their own department (highest salary = rank 1). Return name, dept_id, salary, and the rank as salary_rank.",
    solution: "SELECT name, dept_id, salary, RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS salary_rank FROM employees",
    explain: "PARTITION BY resets the ranking for each department separately, while ORDER BY inside the OVER() clause controls the ranking order within each partition."
  },
  {
    topic: "CTE (WITH clause)", difficulty: "hard", checkOrder: true,
    prompt: "Using a CTE, find the top 3 customers by total order amount. Return name and total_amount, ordered highest first.",
    solution: "WITH totals AS (SELECT customer_id, SUM(amount) AS total_amount FROM orders GROUP BY customer_id) SELECT c.name, t.total_amount FROM totals t JOIN customers c ON t.customer_id = c.customer_id ORDER BY t.total_amount DESC LIMIT 3",
    explain: "The CTE (totals) computes the aggregate once and gives it a name, which the outer query then joins against — this keeps a multi-step query readable instead of nesting subqueries."
  },
  {
    topic: "Multi-table JOIN + aggregate", difficulty: "advanced", checkOrder: false,
    prompt: "Find total revenue per department, based on which employee's department processed each order. Return dept_name and total_revenue.",
    solution: "SELECT d.dept_name, SUM(o.amount) AS total_revenue FROM orders o JOIN employees e ON o.emp_id = e.emp_id JOIN departments d ON e.dept_id = d.dept_id GROUP BY d.dept_name",
    explain: "Chaining two joins (orders → employees → departments) before aggregating is a very common real-world reporting pattern — get the join right first, then group."
  }
];

export const TEST_QUESTIONS = [
  // ================= EASY =================
  { src:"company", diff:"easy", tag:"Amazon", topic:"Fundamentals", q:"What is the difference between DBMS and RDBMS?", a:"A DBMS manages data as files/collections without enforcing relationships. An RDBMS specifically stores data in related tables governed by keys and enforces integrity constraints like normalization and ACID properties." },
  { src:"company", diff:"easy", tag:"Microsoft", topic:"SQL Basics", q:"Explain the difference between DELETE, TRUNCATE, and DROP.", a:"DELETE removes rows (filterable, logged, rollback-able). TRUNCATE removes all rows fast with minimal logging and resets identity counters. DROP removes the entire table structure and data permanently." },
  { src:"company", diff:"easy", tag:"Oracle", topic:"Keys", q:"What's the difference between a primary key and a unique key?", a:"Both enforce uniqueness, but a table can have only one primary key (which also disallows NULLs) versus multiple unique keys (which typically allow one NULL, depending on the RDBMS)." },
  { src:"company", diff:"easy", tag:"Adobe", topic:"OLTP vs OLAP", q:"What's the difference between OLTP and OLAP systems?", a:"OLTP handles many short, concurrent read/write transactions optimized for row access. OLAP handles complex analytical queries over large historical datasets, optimized with columnar storage and aggregation." },
  { src:"company", diff:"easy", tag:"Zomato", topic:"Constraints", q:"What are the common types of integrity constraints in a DBMS?", a:"Entity integrity (primary key can't be NULL), referential integrity (foreign keys must match an existing primary key or be NULL), domain constraints (valid data type/range), and key constraints (uniqueness)." },
  { src:"company", diff:"easy", tag:"PhonePe", topic:"SQL Basics", q:"What's the difference between WHERE and HAVING?", a:"WHERE filters individual rows before grouping/aggregation happens. HAVING filters groups after aggregation, so it's used with GROUP BY and can reference aggregate functions like COUNT() or SUM()." },
  { src:"company", diff:"easy", tag:"Infosys", topic:"Joins", q:"What is a self join, and when would you use one?", a:"A self join joins a table to itself using aliases, typically to compare rows within the same table — e.g., finding employees who report to a manager stored in the same Employees table." },
  { src:"company", diff:"easy", tag:"Wipro", topic:"Views", q:"What is a view in SQL, and why would you use one?", a:"A view is a virtual table defined by a stored SELECT query — it doesn't store data itself. It's used to simplify complex queries, restrict access to specific columns/rows, and present a consistent interface even if underlying tables change." },
  { src:"gate", diff:"easy", tag:"GATE-style", topic:"Keys", q:"What is the difference between a superkey and a candidate key? Give an example.", a:"A superkey is any set of attributes that uniquely identifies a tuple. A candidate key is a minimal superkey. E.g., {RollNo, Name} is a superkey; {RollNo} alone is the candidate key." },
  { src:"gate", diff:"easy", tag:"GATE-style", topic:"Locking", q:"What is the Two-Phase Locking (2PL) protocol? Does it guarantee serializability?", a:"2PL requires a transaction to acquire all locks before releasing any (growing phase, then shrinking phase). It guarantees conflict-serializability, but does NOT prevent deadlocks." },
  { src:"gate", diff:"easy", tag:"GATE-style", topic:"ER Model", q:"What is a weak entity, and how is it represented differently in an ER diagram?", a:"A weak entity has no primary key of its own and depends on a 'strong' owner entity's key plus a partial key (discriminator) for uniqueness. It's shown with a double-outlined rectangle, connected via an identifying relationship." },
  { src:"gate", diff:"easy", tag:"GATE-style", topic:"Architecture", q:"What is data independence, and what are its two types?", a:"Data independence is the ability to change a schema at one level without affecting the schema at a higher level. Logical data independence: change the conceptual schema without affecting external schemas/apps. Physical data independence: change physical storage without affecting the conceptual schema." },
  { src:"gate", diff:"easy", tag:"GATE-style", topic:"SQL Language Categories", q:"What's the difference between DDL, DML, DCL, and TCL commands? Give one example of each.", a:"DDL defines structure (CREATE, ALTER, DROP). DML manipulates data (INSERT, UPDATE, DELETE, SELECT). DCL controls access (GRANT, REVOKE). TCL manages transactions (COMMIT, ROLLBACK, SAVEPOINT)." },
  { src:"intl", diff:"easy", tag:"CMU/Stanford-style", topic:"Concurrency", q:"What is MVCC (Multi-Version Concurrency Control), and how does it let readers avoid blocking on write locks?", a:"MVCC keeps multiple versions of a row tagged with a transaction/timestamp. Readers see a consistent snapshot based on when their transaction started, reading an older version instead of waiting on a writer's lock." },
  { src:"intl", diff:"easy", tag:"CMU/Stanford-style", topic:"Storage", q:"What is a database index, and why does adding one always involve a tradeoff?", a:"An index is an auxiliary structure (usually a B+ tree) that speeds up lookups on a column. The tradeoff: every index must also be updated on every INSERT/UPDATE/DELETE, so more indexes mean faster reads but slower writes and more storage." },
  { src:"intl", diff:"easy", tag:"CMU/Stanford-style", topic:"NoSQL", q:"What are the four broad categories of NoSQL databases, and what's one example of each?", a:"Document stores (MongoDB), key-value stores (Redis), wide-column stores (Cassandra), and graph databases (Neo4j) — each optimized for a different access pattern rather than being a general drop-in replacement for relational DBs." },
  { src:"company", diff:"easy", tag:"Swiggy", topic:"Transactions", q:"What does 'commit' and 'rollback' mean in the context of a transaction?", a:"COMMIT permanently saves all changes made during a transaction. ROLLBACK undoes all changes made since the transaction began, returning the data to its prior state." },
  { src:"company", diff:"easy", tag:"Paytm", topic:"Stored Logic", q:"What's the difference between a stored procedure and a function in SQL?", a:"A stored procedure can perform actions (INSERT/UPDATE/DELETE), doesn't have to return a value, and can't generally be used inside a SELECT statement. A function must return a value and can be used inline within queries, but usually can't modify data." },
  { src:"gate", diff:"easy", tag:"GATE-style", topic:"Normalization", q:"What anomalies does normalization aim to eliminate?", a:"Insertion anomalies (can't add data without unrelated data), update anomalies (the same fact stored in multiple places can go out of sync), and deletion anomalies (deleting one fact accidentally deletes another unrelated fact)." },
  { src:"intl", diff:"easy", tag:"CMU/Stanford-style", topic:"SQL", q:"What's the difference between UNION and UNION ALL?", a:"UNION combines result sets and removes duplicate rows. UNION ALL combines result sets and keeps all duplicates, which is faster since no deduplication work is done." },
  { src:"company", diff:"easy", tag:"TCS", topic:"Triggers", q:"What is a trigger in a database, and give one real-world use case.", a:"A trigger is a block of code that automatically executes in response to an event (INSERT/UPDATE/DELETE) on a table. Example: automatically logging every change to a 'sensitive_data' table into an audit table." },
  { src:"gate", diff:"easy", tag:"GATE-style", topic:"Relational Model", q:"What is the difference between a schema and an instance of a database?", a:"A schema is the fixed structural design of the database (table definitions, columns, constraints). An instance is the actual data stored at a given point in time." },
  { src:"intl", diff:"easy", tag:"CMU/Stanford-style", topic:"Constraints", q:"What is referential integrity, and what happens if you try to violate it?", a:"Referential integrity requires that a foreign key value either matches an existing primary key value in the referenced table or is NULL. Violating it is rejected by the database." },
  { src:"company", diff:"easy", tag:"Accenture", topic:"SQL Basics", q:"What's the difference between CHAR and VARCHAR data types?", a:"CHAR is fixed-length and pads shorter values with spaces up to the declared length. VARCHAR is variable-length, storing only the actual characters plus a small length prefix." },
  { src:"gate", diff:"easy", tag:"GATE-style", topic:"ER Model", q:"What is the difference between generalization and specialization in ER modeling?", a:"Generalization is a bottom-up process: combining common attributes of several entities into a single higher-level entity. Specialization is top-down: splitting a general entity into more specific sub-entities based on distinguishing attributes." },

  // ================= MEDIUM =================
  { src:"company", diff:"medium", tag:"Google", topic:"Concurrency", q:"What is a deadlock, and how can a DBMS prevent or detect one?", a:"A deadlock is a cycle of transactions each waiting on a resource held by the next. Prevention: ordering resource requests, or wait-die/wound-wait schemes. Detection: building a wait-for graph and periodically checking for cycles, aborting one transaction to break it." },
  { src:"company", diff:"medium", tag:"Service-based (TCS/Infosys)", topic:"Normalization", q:"Explain normalization and denormalization with an example of when you'd choose each.", a:"Normalization splits data to remove redundancy and anomalies. Denormalization intentionally reintroduces redundancy — e.g., in a read-heavy reporting table — to avoid expensive joins at query time." },
  { src:"company", diff:"medium", tag:"Flipkart", topic:"Transactions", q:"What are the ACID properties? Give a concrete example transaction that illustrates each.", a:"Atomicity: a bank transfer either fully completes or not at all. Consistency: total balance stays correct after the transfer. Isolation: concurrent transfers don't see each other's uncommitted state. Durability: once committed, the transfer survives a crash." },
  { src:"gate", diff:"medium", tag:"GATE-style", topic:"Indexing", q:"In a B+ tree of order p, what is the maximum number of keys allowed in a leaf node?", a:"A leaf node in a B+ tree of order p can hold at most p−1 keys." },
  { src:"gate", diff:"medium", tag:"GATE-style", topic:"Relational Algebra", q:"If relation R has cardinality 100 and relation S has cardinality 50, what is the maximum possible cardinality of R natural-join S if they share no common attribute values?", a:"With no matching values on the join attribute, the natural join produces 0 tuples." },
  { src:"intl", diff:"medium", tag:"CMU/Stanford-style", topic:"Distributed Systems", q:"Explain the CAP theorem and give an example of a real system that intentionally chooses AP over CP.", a:"CAP says a distributed system can only guarantee two of Consistency, Availability, and Partition tolerance during a network partition. DynamoDB/Cassandra choose AP — they stay available and use eventual consistency during partitions." },
  { src:"intl", diff:"medium", tag:"CMU/Stanford-style", topic:"Concurrency", q:"What's the difference between optimistic and pessimistic concurrency control, and when would you prefer each?", a:"Pessimistic locks resources upfront, assuming conflicts are likely. Optimistic lets transactions proceed and validates for conflicts only at commit time — good for low-contention, read-heavy workloads." },
  { src:"intl", diff:"medium", tag:"CMU/Stanford-style", topic:"Recovery", q:"What is a Write-Ahead Log (WAL), and why is it critical for crash recovery?", a:"A WAL records every change as a log entry before it's applied to the actual data pages. On crash recovery, the DB replays the log to redo committed changes not yet flushed and undo uncommitted ones." },
  { src:"company", diff:"medium", tag:"Meta", topic:"Subqueries", q:"What's the difference between a correlated and a non-correlated subquery?", a:"A non-correlated subquery runs once, independently of the outer query. A correlated subquery references a column from the outer query and re-runs once per outer row, which can be much slower on large tables." },
  { src:"company", diff:"medium", tag:"Amazon", topic:"Views", q:"What's the difference between a view and a materialized view?", a:"A regular view re-runs its underlying query every time it's accessed — always fresh. A materialized view physically stores the query result and must be refreshed — fast to read, but can serve stale data." },
  { src:"gate", diff:"medium", tag:"GATE-style", topic:"Isolation Levels", q:"Name the four standard SQL isolation levels and the anomaly each one newly prevents compared to the level below it.", a:"Read Uncommitted (allows dirty reads) → Read Committed (prevents dirty reads) → Repeatable Read (also prevents non-repeatable reads) → Serializable (also prevents phantom reads)." },
  { src:"company", diff:"medium", tag:"Uber", topic:"Partitioning", q:"What's the difference between horizontal and vertical partitioning of a table?", a:"Horizontal partitioning splits rows across multiple tables/servers. Vertical partitioning splits columns into separate tables (frequently-accessed vs rarely-accessed)." },
  { src:"intl", diff:"medium", tag:"CMU/Stanford-style", topic:"Data Warehousing", q:"What's the difference between a star schema and a snowflake schema in data warehousing?", a:"A star schema has a central fact table connected directly to denormalized dimension tables. A snowflake schema normalizes those dimension tables further into sub-dimensions." },
  { src:"company", diff:"medium", tag:"Zomato", topic:"SQL", q:"What is a window function, and how does it differ from a normal aggregate function?", a:"A normal aggregate collapses multiple rows into one. A window function computes the aggregate across a 'window' of related rows but still returns one output row per input row, so you keep row-level detail." },
  { src:"gate", diff:"medium", tag:"GATE-style", topic:"Recursive Queries", q:"What is a recursive CTE (Common Table Expression), and what's a typical use case?", a:"A recursive CTE repeatedly references itself to process hierarchical or graph-like data — e.g., org charts or parent-child categories." },
  { src:"company", diff:"medium", tag:"Adobe", topic:"Replication", q:"What is replication lag, and why can it cause a user not to see their own just-submitted data?", a:"Replication lag is the delay between a write landing on the primary and propagating to read replicas. If the app reads from a replica immediately after writing, it may read stale data." },
  { src:"intl", diff:"medium", tag:"CMU/Stanford-style", topic:"Query Optimization", q:"What is a query execution plan, and what's the difference between EXPLAIN and EXPLAIN ANALYZE?", a:"An execution plan shows the sequence of operations the database chose to run a query. EXPLAIN shows the planner's estimates without running the query; EXPLAIN ANALYZE actually executes it and shows real timing/row counts." },
  { src:"company", diff:"medium", tag:"PhonePe", topic:"Application Patterns", q:"What is the N+1 query problem, and how do you fix it?", a:"It happens when code fetches a list of N parent records, then issues one additional query per record to fetch related data. Fix: use a JOIN, or batch-fetch related records with a single WHERE IN (...) query." },
  { src:"gate", diff:"medium", tag:"GATE-style", topic:"Functional Dependencies", q:"What is a functional dependency, and how does it differ from a key?", a:"A functional dependency X→Y means that if two tuples agree on X, they must agree on Y. A key is a special case: a set of attributes whose functional dependency closure includes every attribute in the relation." },
  { src:"intl", diff:"medium", tag:"CMU/Stanford-style", topic:"Storage", q:"What's the difference between row-oriented and column-oriented storage, and which workload favors each?", a:"Row storage keeps all columns of a record together — efficient for OLTP. Columnar storage groups each column's values together — efficient for OLAP/analytics." },
  { src:"company", diff:"medium", tag:"Swiggy", topic:"Backup", q:"What's the difference between a full backup, an incremental backup, and a differential backup?", a:"A full backup copies everything. An incremental backup copies only what changed since the last backup of any kind. A differential backup copies everything changed since the last full backup." },
  { src:"gate", diff:"medium", tag:"GATE-style", topic:"ER to Relational Mapping", q:"How is a many-to-many relationship between two entities represented in the relational model?", a:"It requires a separate junction table containing the foreign keys of both entities as its composite primary key." },
  { src:"company", diff:"medium", tag:"Oracle", topic:"Constraints", q:"What do ON DELETE CASCADE, ON DELETE SET NULL, and ON DELETE RESTRICT do on a foreign key?", a:"CASCADE deletes child rows when the parent is deleted. SET NULL sets the foreign key to NULL. RESTRICT blocks the delete if dependent rows exist." },
  { src:"intl", diff:"medium", tag:"CMU/Stanford-style", topic:"Indexing", q:"What is a covering index, and why can it make a query much faster?", a:"A covering index includes every column a query needs, so the database can answer the query entirely from the index without a separate lookup into the actual table rows." },
  { src:"company", diff:"medium", tag:"Paytm", topic:"Connection Management", q:"What is connection pooling, and why is it important for a database-backed application?", a:"Connection pooling keeps a set of reusable open connections ready, avoiding the overhead of opening a new database connection per request." },
  { src:"gate", diff:"medium", tag:"GATE-style", topic:"Aggregation vs Composition", q:"In ER modeling, what is 'aggregation,' and what problem does it solve?", a:"Aggregation lets you treat an entire relationship as a higher-level entity, so it can itself participate in another relationship." },
  { src:"company", diff:"medium", tag:"Microsoft", topic:"JSON in RDBMS", q:"What are the tradeoffs of storing JSON in a column of a relational database versus normalizing it into separate tables?", a:"JSON columns are flexible for semi-structured data, but you lose strong typing, easy indexing, and referential integrity enforcement — normalized tables give you all of that back at the cost of more schema rigidity." },
  { src:"intl", diff:"medium", tag:"CMU/Stanford-style", topic:"Indexing", q:"What is index selectivity, and why does a low-selectivity index (e.g., on a boolean 'is_active' column) often not help query performance?", a:"Selectivity is the fraction of distinct values relative to total rows. A boolean column has very low selectivity, so the optimizer often decides a full table scan is cheaper than using the index." },
  { src:"company", diff:"medium", tag:"Infosys", topic:"Data Types", q:"Why is it generally a bad idea to store monetary values using the FLOAT or DOUBLE data type?", a:"Floating-point types use binary approximations that cause rounding errors. DECIMAL/NUMERIC types store exact fixed-precision values, which is why they're the standard for currency." },

  // ================= HARD =================
  { src:"company", diff:"hard", tag:"Uber", topic:"Distributed Systems", q:"How would you shard a users table for 100M+ users, and what tradeoffs come with your choice of shard key?", a:"Hash-based sharding on user_id gives even distribution but makes range queries expensive. Range-based sharding helps locality but risks hot shards if access isn't uniform." },
  { src:"gate", diff:"hard", tag:"GATE-style", topic:"Normalization", q:"Given R(A,B,C,D) with functional dependencies A→B, B→C, C→D, find all candidate keys and determine the highest normal form R satisfies.", a:"Closure of A gives {A,B,C,D}, so A is the sole candidate key. R is in 1NF but violates 3NF/BCNF, since B→C and C→D are transitive dependencies whose left-hand sides aren't superkeys." },
  { src:"gate", diff:"hard", tag:"GATE-style", topic:"Concurrency", q:"Explain conflict serializability with an example of how a precedence graph determines whether a schedule is conflict-serializable.", a:"Build a precedence graph based on conflicting operations; if the graph has no cycle, the schedule is conflict-serializable, and a topological sort gives an equivalent serial order." },
  { src:"gate", diff:"hard", tag:"GATE-style", topic:"Locking", q:"Differentiate between strict and rigorous Two-Phase Locking.", a:"Strict 2PL holds exclusive (write) locks until commit/abort, preventing cascading aborts. Rigorous 2PL holds both shared and exclusive locks until commit/abort, guaranteeing transactions serialize in their commit order." },
  { src:"intl", diff:"hard", tag:"CMU/Stanford-style", topic:"Storage", q:"How does a Log-Structured Merge (LSM) tree differ from a B+ tree, and when would you prefer one over the other?", a:"LSM trees buffer writes in memory and flush them as sorted SSTables, merging them later — very fast writes. B+ trees update in place — fast reads. LSM suits write-heavy workloads (RocksDB); B+ trees suit read-heavy OLTP." },
  { src:"intl", diff:"hard", tag:"CMU/Stanford-style", topic:"Distributed Systems", q:"What is the Raft consensus algorithm used for, and why does leader election matter?", a:"Raft keeps a replicated log consistent across nodes. A single leader handles all writes and replicates them; leader election ensures the cluster recovers a leader quickly after a failure without split-brain." },
  { src:"intl", diff:"hard", tag:"CMU/Stanford-style", topic:"Replication", q:"What's the difference between synchronous and asynchronous replication, and what tradeoff does each make?", a:"Synchronous waits for replica(s) to confirm before acknowledging the client — stronger durability, higher latency. Asynchronous acknowledges immediately — lower latency, but a crash can lose committed data." },
  { src:"gate", diff:"hard", tag:"GATE-style", topic:"Higher Normal Forms", q:"What is a multivalued dependency, and how does 4NF differ from BCNF in what it eliminates?", a:"A multivalued dependency A↠B means for a given A, the set of B values is independent of other attributes, causing redundancy even in BCNF (e.g. repeated skill-language pairs). 4NF requires no non-trivial multivalued dependencies unless the left side is a superkey." },
  { src:"gate", diff:"hard", tag:"GATE-style", topic:"Join Dependency", q:"What is a join dependency, and what does 5NF (Project-Join Normal Form) require?", a:"A join dependency means a relation can be losslessly reconstructed by joining several of its projections. 5NF requires every join dependency to be implied by the candidate keys — it eliminates redundancy from non-trivial join dependencies." },
  { src:"intl", diff:"hard", tag:"CMU/Stanford-style", topic:"Query Optimization", q:"Why is finding the optimal join order for a multi-way join considered NP-hard, and what technique do real optimizers use to make it tractable?", a:"The number of possible join orderings grows super-exponentially. Real optimizers use dynamic programming to build up optimal plans for subsets of tables, or switch to greedy search for very large joins." },
  { src:"company", diff:"hard", tag:"Meta", topic:"Consistent Hashing", q:"Why do distributed databases use consistent hashing instead of simple modulo hashing (key % N) when sharding across nodes?", a:"With modulo hashing, adding/removing a node changes almost every key's target shard, forcing a massive reshuffle. Consistent hashing maps keys onto a hash ring, so adding/removing a node only reassigns adjacent keys." },
  { src:"gate", diff:"hard", tag:"GATE-style", topic:"Concurrency", q:"How does timestamp-ordering concurrency control decide whether to allow or reject a read/write operation, and what happens on a rejection?", a:"Each transaction gets a timestamp; read/write is rejected if it would violate the serialization order based on timestamps. Rejections abort and restart the transaction with a new, later timestamp." },
  { src:"intl", diff:"hard", tag:"CMU/Stanford-style", topic:"Distributed Systems", q:"What is the quorum condition R + W > N in a replicated system, and what does it guarantee?", a:"N is the number of replicas, W is the write quorum, and R is the read quorum. If R + W > N, the read set is guaranteed to overlap with the write set by at least one replica, ensuring readers see the most recent successful write." },
  { src:"company", diff:"hard", tag:"Google", topic:"Two-Phase Commit", q:"Walk through the Two-Phase Commit (2PC) protocol for a distributed transaction, and explain its main weakness.", a:"Phase 1 (prepare): coordinator asks participants to vote. Phase 2 (commit): coordinator commits/aborts based on votes. Main weakness: if coordinator crashes after prepare, participants who voted yes are stuck holding locks." },
  { src:"intl", diff:"hard", tag:"CMU/Stanford-style", topic:"Storage", q:"What is a covering/index-only scan, and how does the database know it can skip visiting the actual table (heap) rows?", a:"An index-only scan happens when every column needed by a query exists within the index itself, so the planner can answer the query by reading only the index, skipping heap lookups." },
  { src:"gate", diff:"hard", tag:"GATE-style", topic:"Recovery", q:"What is the difference between a fuzzy checkpoint and a consistent (sharp) checkpoint during database recovery?", a:"A consistent checkpoint pauses all activity to flush dirty pages. A fuzzy checkpoint records active transactions/pages without halting, letting dirty pages flush asynchronously." },
  { src:"company", diff:"hard", tag:"Amazon", topic:"Compression", q:"Why does columnar storage compress far better than row storage, and name two columnar compression techniques.", a:"Columnar storage keeps similar datatypes together. Techniques: dictionary encoding and run-length encoding." },
  { src:"intl", diff:"hard", tag:"CMU/Stanford-style", topic:"Query Execution", q:"What is vectorized query execution, and how does it differ from traditional row-at-a-time (Volcano-style) execution?", a:"Volcano-style execution pulls one row at a time via function calls. Vectorized execution processes a whole batch (vector) of rows per operator call using tight, SIMD-friendly loops over columnar data." },
  { src:"gate", diff:"hard", tag:"GATE-style", topic:"Distributed Deadlock", q:"Why is deadlock detection harder in a distributed database than in a single-node one, and name one common algorithm family used for it.", a:"No single node has a complete view of every lock/wait relationship. Distributed deadlock detection algorithms like path-pushing are used to reconstruct or approximate the global picture." },
  { src:"company", diff:"hard", tag:"Microsoft", topic:"Phantom Reads", q:"What causes a phantom read, and how does predicate/next-key locking prevent it where ordinary row locks can't?", a:"A phantom read happens when range queries return new rows. Predicate/next-key/gap locking locks the gap itself, blocking inserts that would fall within it." },

  // ================= ADVANCED =================
  { src:"company", diff:"advanced", tag:"System Design (FAANG-level)", topic:"Distributed Systems", q:"Design the indexing and concurrency strategy for a globally-distributed SQL database Spanner-style. What do you sacrifice?", a:"Range-partitioned data with Raft range replication, hybrid logical clocks for global transaction ordering, and MVCC for snapshot reads. Cross-region writes pay speed-of-light latency for consensus." },
  { src:"company", diff:"advanced", tag:"System Design (FAANG-level)", topic:"Storage", q:"You need a storage engine that can sustain 1M writes/sec for a deduplication system. Which engine family would you pick?", a:"LSM-tree-based engine (RocksDB/Cassandra-style). Keying with a hash prefix avoids write hotspots. Tradeoff accepted: write/read/space amplification and compaction latency spikes." },
  { src:"gate", diff:"advanced", tag:"GATE-style (advanced)", topic:"Decomposition", q:"Given R(A,B,C,D,E) with FDs {A→BC, CD→E, B→D, E→A}, compute a minimal cover and derive a 3NF synthesis.", a:"Minimal cover FDs: {A→B, A→C, CD→E, B→D, E→A}. 3NF synthesis: R1(A,B,C), R2(C,D,E), R3(B,D), R4(E,A). Prereq: closure checks and dependency preservation is guaranteed by construction." },
  { src:"gate", diff:"advanced", tag:"GATE-style (advanced)", topic:"Concurrency", q:"Prove why Strict Two-Phase Locking guarantees cascadelessness.", a:"Strict 2PL holds write locks until commit/abort, so other transactions cannot read uncommitted data, preventing cascading aborts by definition." },
  { src:"intl", diff:"advanced", tag:"CMU/Stanford-style (advanced)", topic:"Concurrency", q:"What is the 'write skew' anomaly under Snapshot Isolation? Give a concrete example.", a:"Write skew happens when transactions read overlapping data but write to different rows, violating a multi-row constraint. Example: two accounts with combined balance check withdraw simultaneously." },
  { src:"intl", diff:"advanced", tag:"CMU/Stanford-style (advanced)", topic:"Distributed Systems", q:"Explain how Google Spanner achieves external consistency using TrueTime and 'commit-wait.'", a:"TrueTime provides GPS/atomic clock backed intervals [earliest, latest] with uncertainty bounds. Spanner waits out this uncertainty before committing, ensuring transaction timestamps respect real-time order." },
  { src:"intl", diff:"advanced", tag:"CMU/Stanford-style (advanced)", topic:"Consistency Models", q:"Are serializability and linearizability the same thing?", a:"No. Serializability is transactional ordering matching some serial order. Linearizability is single-operation real-time ordering." },
  { src:"intl", diff:"advanced", tag:"CMU/Stanford-style (advanced)", topic:"Replication", q:"In a Dynamo-style leaderless replication system using vector clocks, how are concurrent conflicting writes resolved?", a:"Conflicting writes create siblings. On reads, the client receives all siblings and must merge them, writing back a unified version to resolve conflict." },
  { src:"intl", diff:"advanced", tag:"CMU/Stanford-style (advanced)", topic:"Recovery", q:"Walk through the three phases of the ARIES recovery algorithm (Analysis, Redo, Undo).", a:"Analysis rebuilds active transactions and dirty page lists. Redo replays all logged updates ('repeating history') to restore pre-crash state. Undo rolls back still-active transactions, writing CLRs." },
  { src:"intl", diff:"advanced", tag:"Research paper-level", topic:"Consensus", q:"What's the core practical difference between Paxos and Raft?", a:"Multi-Paxos has looser leader specifications and log ordering complexity. Raft decomposes consensus into leader election, replication, and safety with strict log update ordering constraints." },
  { src:"intl", diff:"advanced", tag:"Research paper-level", topic:"Fault Tolerance", q:"What's the difference between crash-fault-tolerant (CFT) and Byzantine-fault-tolerant (BFT) systems?", a:"CFT assumes nodes stop or drop packets without lying. BFT tolerates arbitrary/malicious behavior. Databases use CFT as the operator controls the private network." },
  { src:"intl", diff:"advanced", tag:"Research paper-level", topic:"Distributed Transactions", q:"Google's Percolator system builds distributed transactions on top of Bigtable. How does it achieve atomicity?", a:"Uses single-row operations on a primary lock row. Writing the primary lock commit timestamp signifies transaction commit; other row locks reference the primary lock and are cleared lazily." },
  { src:"intl", diff:"advanced", tag:"Research paper-level", topic:"Deterministic Databases", q:"What is a 'deterministic database' and how does it avoid distributed locks or 2PC?", a:"Agrees on transaction execution order via consensus beforehand. replicas execute transactions sequentially in the exact same order without lock coordination." },
  { src:"intl", diff:"advanced", tag:"Research paper-level", topic:"Storage", q:"What is a B-link tree, and what problem does it solve for concurrent B+ tree access?", a:"Adds right-link pointers to sibling nodes. Sibling reads follow right-links during concurrent splits without holding write latches on the parent node." },
  { src:"intl", diff:"advanced", tag:"Research paper-level", topic:"Consistency Models", q:"What is causal consistency, and how does it sit between eventual consistency and linearizability?", a:"Guarantees that causally-related operations are seen in the same order. Stronger than eventual consistency, weaker than linearizability, and avoids global coordination cost." },
  { src:"gate", diff:"advanced", tag:"GATE-style (advanced)", topic:"Query Optimization", q:"Explain why cardinality estimation errors for a chain of joins compound multiplicatively.", a:"Each join output feeds into the next. Small estimation errors multiply across a chain, resulting in plan failures (e.g., nesting loop scans when hash scans are optimal)." },
  { src:"company", diff:"advanced", tag:"System Design (FAANG-level)", topic:"HTAP", q:"What is an HTAP architecture, and what's the core engineering tension it resolves?", a:"HTAP handles both OLTP and OLAP on a single cluster. The tension is row-store writes vs columnar-store scans; resolved by writing to a row-store and replicating to a columnar-store in near-real-time." },
  { src:"intl", diff:"advanced", tag:"Research paper-level", topic:"Offline-first Systems", q:"What is a CRDT (Conflict-free Replicated Data Type)?", a:"Data structure where concurrent merges are commutative, associative, and idempotent. Allows replicas to merge offline changes without coordinators." },
  { src:"gate", diff:"advanced", tag:"GATE-style (advanced)", topic:"Three-Phase Commit", q:"How does Three-Phase Commit (3PC) attempt to fix Two-Phase Commit's blocking problem?", a:"Introduces a 'pre-commit' phase and timeouts to prevent indefinite coordinator wait stalls. However, it still fails to guarantee safety under network partitions." }
];

export const TROPHIES = [
  { id: 'first-steps', name: 'First Steps', desc: 'Complete Phase 0 — Foundations.' },
  { id: 'halfway', name: 'Halfway There', desc: 'Complete 5 of 9 roadmap phases.' },
  { id: 'full-stack', name: 'Full-Stack DB Engineer', desc: 'Complete every phase on the roadmap.' },
  { id: 'checklist-crusher', name: 'Checklist Crusher', desc: 'Check off all 10 mastery milestones.' },
  { id: 'query-whisperer', name: 'Query Whisperer', desc: 'Solve 5 SQL drills correctly.' },
  { id: 'sql-grandmaster', name: 'SQL Grandmaster', desc: 'Solve every SQL drill correctly.' },
  { id: 'on-a-roll', name: 'On a Roll', desc: 'Hit a 3-day study streak.' },
  { id: 'unstoppable', name: 'Unstoppable', desc: 'Hit a 7-day study streak.' },
  { id: 'iron-will', name: 'Iron Will', desc: 'Hit a 30-day study streak.' },
  { id: 'sharp-mind', name: 'Sharp Mind', desc: 'Self-grade 20 test questions.' },
  { id: 'know-it-all', name: 'Know-It-All', desc: '90%+ accuracy across 30+ graded questions.' },
  { id: 'under-pressure', name: 'Under Pressure', desc: 'Complete a full Exam Mode session.' },
  { id: 'fearless', name: 'Fearless', desc: 'Correctly know an Advanced-tier question.' }
];
