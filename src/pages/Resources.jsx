
export function Resources() {
  const sections = [
    { id: 'relational_theory', label: 'Relational Theory' },
    { id: 'normalization', label: 'Normalization & Normal Forms' },
    { id: 'storage_indexing', label: 'Storage & Access Methods' },
    { id: 'transactions_acid', label: 'Transactions & ACID' },
    { id: 'concurrency_recovery', label: 'Concurrency Control & Recovery' }
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Reference Resources</h1>
          <p>A curated reference library of DBMS core concepts and execution structures.</p>
        </div>
      </div>

      <div className="resources-grid">
        <aside className="resources-toc">
          <h3>Table of Contents</h3>
          {sections.map((sec) => (
            <a key={sec.id} href={`#${sec.id}`} className="toc-link">
              {sec.label}
            </a>
          ))}
        </aside>

        <div className="resources-content">
          <section id="relational_theory" className="resource-section">
            <h2>Relational Theory</h2>
            <p>
              A relational database is based on the relational model of data proposed by E.F. Codd in 1970. 
              The mathematical foundation is set theory and first-order predicate logic.
            </p>
            <h3>Core Terminology</h3>
            <p>
              A <strong>Relation</strong> is a mathematical set of tuples. In database systems, a relation is represented as a <strong>Table</strong>, a tuple as a <strong>Row</strong>, and an attribute as a <strong>Column</strong>.
            </p>
            <h3>Integrity Constraints</h3>
            <p>
              <strong>Entity Integrity:</strong> The primary key column(s) cannot contain NULL values.
              <br />
              <strong>Referential Integrity:</strong> A value in a foreign key column must either match an existing primary key value in the referenced table, or be NULL.
            </p>
          </section>

          <section id="normalization" className="resource-section">
            <h2>Normalization & Normal Forms</h2>
            <p>
              Normalization is the process of structuring a relational database schema to reduce data redundancy 
              and avoid update anomalies (insertion, deletion, and modification anomalies).
            </p>
            <h3>The Normal Forms (NF)</h3>
            
            <h4>1. First Normal Form (1NF)</h4>
            <p>Each column must contain only atomic (indivisible) values. No repeating groups or multi-valued attributes.</p>
            
            <h4>2. Second Normal Form (2NF)</h4>
            <p>Must be in 1NF, and all non-prime attributes must be fully functionally dependent on the entire candidate key (no partial dependencies).</p>
            
            <h4>3. Third Normal Form (3NF)</h4>
            <p>Must be in 2NF, and no non-prime attribute should be transitively dependent on a candidate key (no A → B → C dependencies where A is a key).</p>
            
            <h4>4. Boyce-Codd Normal Form (BCNF)</h4>
            <p>A stronger version of 3NF. For every non-trivial functional dependency X → Y, X must be a superkey.</p>

            <pre className="code-block">
{`-- Example of non-BCNF dependency:
-- R(Student, Course, Instructor)
-- (Student, Course) -> Instructor
-- Instructor -> Course (Instructor teaches only one course)
-- Instructor is not a superkey!`}
            </pre>
          </section>

          <section id="storage_indexing" className="resource-section">
            <h2>Storage & Access Methods</h2>
            <p>
              Database engines manage data layout on physical blocks. Disk access is slow, so minimizing disk read/writes (I/O) is the main optimization goal.
            </p>
            <h3>Slotted Page Architecture</h3>
            <p>
              A page (typically 4KB or 8KB) is divided into a slot directory at the header (containing pointers to the starting byte of each record) and actual record data growing upwards from the bottom of the page. This allows moving records around on the page to defragment space without updating external references.
            </p>
            <h3>Indexes</h3>
            <p>
              An index is an auxiliary data structure that accelerates data retrieval.
            </p>
            <h4>B+ Trees</h4>
            <p>
              Self-balancing search tree optimized for systems that read and write large blocks of data. 
              Key differences from B-Trees: 
              1. Actual data records (or pointers to them) are stored only in the leaf nodes. 
              2. Leaf nodes are linked together in a doubly-linked list for fast range scans.
            </p>
          </section>

          <section id="transactions_acid" className="resource-section">
            <h2>Transactions & ACID</h2>
            <p>
              A transaction is a single logical unit of database processing. To ensure consistency and safety, engines guarantee ACID properties.
            </p>
            <h3>ACID Properties</h3>
            <ul>
              <li><strong>Atomicity:</strong> All operations in a transaction succeed, or the entire transaction is rolled back (All-or-Nothing).</li>
              <li><strong>Consistency:</strong> A transaction transforms the database from one valid state to another, maintaining all integrity constraints.</li>
              <li><strong>Isolation:</strong> The execution of concurrent transactions does not interfere with one another.</li>
              <li><strong>Durability:</strong> Once committed, transaction updates persist permanently, even in the event of a system crash.</li>
            </ul>
          </section>

          <section id="concurrency_recovery" className="resource-section">
            <h2>Concurrency Control & Recovery</h2>
            <p>
              Isolation and Durability are enforced by the Concurrency Controller and the Recovery Manager.
            </p>
            <h3>Two-Phase Locking (2PL)</h3>
            <p>
              Guarantees serializability by restricting transactions to two phases:
              <br />
              1. <strong>Growing Phase:</strong> The transaction can acquire locks but cannot release any.
              <br />
              2. <strong>Shrinking Phase:</strong> The transaction can release locks but cannot acquire new ones.
              <br />
              <em>Strict 2PL</em> holds all exclusive (write) locks until the transaction commits, preventing cascading rollbacks.
            </p>
            <h3>Write-Ahead Logging (WAL)</h3>
            <p>
              Requires that transaction log entries describing database updates are flushed to non-volatile disk storage BEFORE the corresponding database block is written. This ensures that the engine can undo or redo transactions during crash recovery.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
export default Resources;
