import React, { useState, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface AccordionItem { q: string; a: string; }
interface QuizQuestion { q: string; options: string[]; correct: number; explanation: string; }
interface SheetTab { name: string; color: string; headers: string[]; rows: string[][]; highlights: number[][]; tasks: string[]; }

// ─── Data ────────────────────────────────────────────────────────────────────
const faqs: AccordionItem[] = [
  { q: "What is the difference between Sort Sheet and Sort Range?", a: "Sort Sheet sorts the ENTIRE sheet's data based on one column — every row moves together. Sort Range sorts only a SELECTED range of cells without touching the rest of the sheet. Use Sort Sheet for single-table sheets and Sort Range when you have multiple separate tables on one sheet." },
  { q: "Does sorting from the Data Menu permanently change my data?", a: "Yes! Menu-based sorting (Sort Sheet / Sort Range) permanently rearranges your rows. Always use Ctrl+Z (Undo) immediately if you make a mistake. If you want non-destructive sorting, use the SORT() or SORTN() formula functions instead — they create a new sorted view and never touch your original data." },
  { q: "How does 'Data has header row' work in Advanced Sort?", a: "When you tick the 'Data has header row' checkbox in Advanced Range Sorting Options, Google Sheets treats the first row of your selection as headers and keeps it fixed at the top. If you don't check it, the header row will be sorted along with the rest of your data, which usually causes problems." },
  { q: "Can I sort by multiple colors at the same time?", a: "No — Google Sheets only allows you to sort one color to the top or bottom per operation. To arrange multiple colors in a specific order (e.g., Red → Yellow → Green), apply the sorts in REVERSE order: first sort Green to top, then Yellow to top, then Red to top. The last sort always 'wins' and ends up on top." },
  { q: "What does the SORT formula do differently than menu sorting?", a: "The SORT function is dynamic — it creates a sorted output in a new cell range that automatically updates whenever your source data changes. It never modifies the original data. Menu sorting is a one-time permanent change. Use SORT() when you need a live sorted view that stays up to date." },
  { q: "What are the display_ties_mode values in SORTN?", a: "Mode 0: Default — returns exactly N rows. Mode 1: Show Boundary Ties — returns N+ rows if the Nth row has ties (e.g., asking for Top 3 but 2 rows tie for 3rd place, so 4 rows are returned). Mode 2: Remove Duplicates — returns only unique rows. Mode 3: Unique + Ties — removes duplicates AND shows boundary ties." },
  { q: "When should I use SORTN instead of SORT?", a: "Use SORTN when you only want the Top N results (e.g., Top 5 sales, Top 10 students). It's perfect for leaderboards, dashboards, and summary views. Use SORT when you want all rows sorted. SORTN also handles tie-breaking with 4 different modes, giving you precise control over edge cases." },
];

const quizData: QuizQuestion[] = [
  { q: "Which sorting option in the Data Menu affects the ENTIRE sheet, moving all rows together?", options: ["Sort Range", "Sort Sheet", "Advanced Sort", "SORT Function"], correct: 1, explanation: "Sort Sheet rearranges all rows across every column simultaneously, preserving row relationships throughout the entire sheet." },
  { q: "In SORTN, which display_ties_mode returns ONLY unique (deduplicated) rows?", options: ["Mode 0", "Mode 1", "Mode 2", "Mode 3"], correct: 2, explanation: "Mode 2 (Remove Duplicates) filters out duplicate rows, returning only unique entries from the sorted results." },
  { q: "You want to sort Red → Yellow → Green from top to bottom using Sort by Color. In what ORDER should you apply the sorts?", options: ["Red first, then Yellow, then Green", "Green first, then Yellow, then Red", "Yellow first, then Red, then Green", "All at once in one step"], correct: 1, explanation: "Always sort in REVERSE order. Sort Green to top first, then Yellow to top, then Red to top. The last sort wins and stays on top." },
  { q: "Which SORT formula correctly sorts range A2:C50 by the 2nd column in DESCENDING order?", options: ["=SORT(A2:C50, 2, TRUE)", "=SORT(A2:C50, 1, FALSE)", "=SORT(A2:C50, 2, FALSE)", "=SORTN(A2:C50, 2)"], correct: 2, explanation: "=SORT(range, sort_column, is_ascending). Column 2 = 2, Descending = FALSE. So =SORT(A2:C50, 2, FALSE) is correct." },
  { q: "What is the KEY advantage of formula-based SORT over menu-based sorting?", options: ["It is faster to apply", "It permanently rearranges data", "It is dynamic and auto-updates when source data changes", "It works without selecting a range"], correct: 2, explanation: "Formula-based SORT creates a live sorted view that automatically updates whenever the source data changes, without ever modifying the original data." },
];

const sheetTabs: SheetTab[] = [
  {
    name: "Sort Sheet Practice",
    color: "#2F5DA8",
    headers: ["Employee", "Department", "Salary", "Joining Date"],
    rows: [
      ["Alice Brown", "Marketing", "72,000", "2021-03-15"],
      ["Bob Smith", "Engineering", "95,000", "2019-07-22"],
      ["Carol White", "HR", "58,000", "2022-01-10"],
      ["Dave Jones", "Engineering", "88,000", "2020-11-05"],
      ["Eve Davis", "Marketing", "65,000", "2023-02-28"],
    ],
    highlights: [[1,2],[3,2],[0,1]],
    tasks: ["Sort sheet A→Z by Employee name","Sort sheet Z→A by Salary","Undo both sorts with Ctrl+Z"],
  },
  {
    name: "Sort Range Practice",
    color: "#2E9E58",
    headers: ["Product", "Category", "Units Sold", "Revenue"],
    rows: [
      ["Laptop Pro", "Electronics", "340", "$510,000"],
      ["Office Chair", "Furniture", "120", "$48,000"],
      ["Wireless Mouse", "Electronics", "890", "$44,500"],
      ["Standing Desk", "Furniture", "75", "$67,500"],
      ["USB Hub", "Electronics", "1200", "$36,000"],
    ],
    highlights: [[0,0],[2,2],[4,3]],
    tasks: ["Select A1:D6 and sort by Revenue Z→A","Add secondary sort by Units Sold A→Z","Test with header row checkbox"],
  },
  {
    name: "Sort by Color",
    color: "#E94B2C",
    headers: ["Task", "Priority", "Owner", "Status"],
    rows: [
      ["Fix login bug", "🔴 Urgent", "Alice", "In Progress"],
      ["Write docs", "🟢 Low", "Bob", "Done"],
      ["Deploy v2.1", "🔴 Urgent", "Carol", "Pending"],
      ["Design review", "🟡 Medium", "Dave", "In Progress"],
      ["Code review", "🟡 Medium", "Eve", "Done"],
    ],
    highlights: [[0,1],[2,1],[3,1]],
    tasks: ["Apply red fill to Urgent rows","Sort Red to top via right-click","Then sort Yellow to top (reverse order strategy)"],
  },
  {
    name: "SORT Formula",
    color: "#F5A623",
    headers: ["Student", "Score", "Grade", "Class"],
    rows: [
      ["Maya", "92", "A", "10B"],
      ["Raj", "78", "B", "10A"],
      ["Sara", "96", "A+", "10B"],
      ["Liam", "65", "C", "10A"],
      ["Noah", "88", "B+", "10B"],
    ],
    highlights: [[2,1],[0,1],[4,1]],
    tasks: ["Write =SORT(A2:D6,2,FALSE) in cell F2","Sort by Grade A→Z as secondary sort","Observe dynamic update when scores change"],
  },
  {
    name: "SORTN Leaderboard",
    color: "#9B59B6",
    headers: ["Sales Rep", "Region", "Total Sales", "Rank"],
    rows: [
      ["James K.", "North", "$145,000", "1"],
      ["Priya M.", "South", "$138,500", "2"],
      ["Chen W.", "East", "$127,200", "3"],
      ["Sofia R.", "West", "$127,200", "3"],
      ["Ahmed B.", "North", "$118,900", "5"],
    ],
    highlights: [[0,2],[1,2],[2,2],[3,2]],
    tasks: ["Write =SORTN(A2:C20,5,1,3,FALSE) for Top 5","Use Mode 1 to include tied 3rd place rows","Try Mode 2 to see unique-only results"],
  },
];

// ─── Helper Components ────────────────────────────────────────────────────────

function FormulaBox({ formula, label, note }: { formula: string; label?: string; note?: string }) {
  return (
    <div style={{ background: "#0d1117", borderRadius: 10, padding: "16px 20px", margin: "14px 0", border: "1px solid #30363d", fontFamily: "monospace" }}>
      {label && <div style={{ color: "#8b949e", fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>📋 {label}</div>}
      <code style={{ color: "#79c0ff", fontSize: 15, wordBreak: "break-all" }}>{formula}</code>
      {note && <div style={{ color: "#cdd6f4", fontSize: 12, marginTop: 8 }}>{note}</div>}
    </div>
  );
}

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderLeft: "4px solid #2E9E58", borderRadius: 10, padding: "14px 18px", margin: "14px 0", color: "#1a5c35" }}>
      <span style={{ fontWeight: 700 }}>💡 Pro Tip: </span>{children}
    </div>
  );
}

function WarnBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderLeft: "4px solid #E94B2C", borderRadius: 10, padding: "14px 18px", margin: "14px 0", color: "#8a2015" }}>
      <span style={{ fontWeight: 700 }}>⚠️ Warning: </span>{children}
    </div>
  );
}

function SectionBadge({ text, color = "#2F5DA8" }: { text: string; color?: string }) {
  return (
    <span style={{ background: color, color: "#fff", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 10, display: "inline-block" }}>{text}</span>
  );
}

function KeyCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="key-card" style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "all 0.25s" }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontWeight: 700, color: "#2F5DA8", fontSize: 15, marginBottom: 6 }}>{title}</div>
      <div style={{ color: "#4b5563", fontSize: 13.5, lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

// ─── Step Box ─────────────────────────────────────────────────────────────────
function StepBox({ steps }: { steps: string[] }) {
  return (
    <div style={{ margin: "14px 0" }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
          <div style={{ background: "#2F5DA8", color: "#fff", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
          <div style={{ color: "#2B2B2B", fontSize: 14, lineHeight: 1.6, paddingTop: 3 }}>{s}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Comparison Table ─────────────────────────────────────────────────────────
function CompareTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div style={{ overflowX: "auto", margin: "16px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <thead>
          <tr style={{ background: "#2F5DA8" }}>
            {headers.map((h, i) => <th key={i} style={{ color: "#fff", padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 700 }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : "#f0f5ff" }}>
              {row.map((cell, ci) => <td key={ci} style={{ padding: "11px 16px", color: "#2B2B2B", fontSize: 13.5, borderBottom: "1px solid #e5e7eb" }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  const dark = ["#2E9E58", "#2F5DA8", "#E94B2C", "#9B59B6"];
  const textCol = dark.includes(color) ? "#fff" : "#2B2B2B";
  return <span style={{ background: color, color: textCol, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>{text}</span>;
}

// ─── Accordion ────────────────────────────────────────────────────────────────
function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{ width: "100%", background: "none", border: "none", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left", gap: 12 }}
          >
            <span style={{ color: "#2B2B2B", fontWeight: 600, fontSize: 15 }}>{item.q}</span>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#2F5DA8" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ transform: open === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", flexShrink: 0 }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div style={{ maxHeight: open === i ? 400 : 0, overflow: "hidden", transition: "max-height 0.4s ease" }}>
            <div style={{ padding: "0 20px 16px", color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>{item.a}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));

  const handleAnswer = (qi: number, oi: number) => {
    if (answers[qi] !== null) return;
    const newA = [...answers];
    newA[qi] = oi;
    setAnswers(newA);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {questions.map((q, qi) => {
        const selected = answers[qi];
        const answered = selected !== null;
        return (
          <div key={qi} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight: 700, color: "#2B2B2B", fontSize: 15, marginBottom: 14 }}>
              <span style={{ background: "#2F5DA8", color: "#fff", borderRadius: "50%", width: 26, height: 26, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, marginRight: 10, fontWeight: 700 }}>Q{qi + 1}</span>
              {q.q}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {q.options.map((opt, oi) => {
                let bg = "#f9fafb";
                let border = "1.5px solid #e5e7eb";
                let color = "#2B2B2B";
                if (answered) {
                  if (oi === q.correct) { bg = "#d1fae5"; border = "1.5px solid #2E9E58"; color = "#1a5c35"; }
                  else if (oi === selected) { bg = "#fee2e2"; border = "1.5px solid #E94B2C"; color = "#8a2015"; }
                }
                return (
                  <button
                    key={oi}
                    onClick={() => handleAnswer(qi, oi)}
                    disabled={answered}
                    style={{ background: bg, border, borderRadius: 8, padding: "11px 14px", cursor: answered ? "default" : "pointer", color, fontWeight: answered && oi === q.correct ? 700 : 500, textAlign: "left", fontSize: 13.5, transition: "all 0.2s" }}
                  >
                    <span style={{ fontWeight: 700, marginRight: 8 }}>{["A","B","C","D"][oi]}.</span>{opt}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div style={{ marginTop: 12, background: "#f0f5ff", borderRadius: 8, padding: "10px 14px", color: "#2F5DA8", fontSize: 13.5 }}>
                {selected === q.correct ? "✅ Correct! " : `❌ Incorrect. The correct answer is: ${["A","B","C","D"][q.correct]}. `}
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Sheet Preview Modal ──────────────────────────────────────────────────────
function SheetModal({ onClose, sheets, onDownload }: { onClose: () => void; sheets: SheetTab[]; onDownload: () => void }) {
  const [active, setActive] = useState(0);
  const s = sheets[active];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, maxWidth: 820, width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "#1f2a3a", padding: "16px 24px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>📊 Sheet Preview</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#aaa", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e5e7eb", overflowX: "auto" }}>
          {sheets.map((sh, i) => (
            <button key={i} onClick={() => setActive(i)} style={{ padding: "12px 18px", border: "none", background: active === i ? sh.color : "#f3f4f6", color: active === i ? "#fff" : "#6B7280", fontWeight: active === i ? 700 : 500, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s", borderBottom: active === i ? `3px solid ${sh.color}` : "3px solid transparent" }}>
              {sh.name}
            </button>
          ))}
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: s.color }}>
                  {s.headers.map((h, i) => <th key={i} style={{ color: "#fff", padding: "10px 14px", textAlign: "left", fontWeight: 700 }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {s.rows.map((row, ri) => {
                  const isHighlight = s.highlights.some(([r]) => r === ri);
                  return (
                    <tr key={ri} style={{ background: isHighlight ? "#fff9e6" : (ri % 2 === 0 ? "#fff" : "#f9fafb") }}>
                      {row.map((cell, ci) => {
                        const cellHL = s.highlights.some(([r, c]) => r === ri && c === ci);
                        return <td key={ci} style={{ padding: "10px 14px", color: "#2B2B2B", borderBottom: "1px solid #e5e7eb", fontWeight: cellHL ? 700 : 400, background: cellHL ? "#fef3c7" : "transparent" }}>{cell}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 18, background: "#f0f5ff", borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ color: "#2F5DA8", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>📋 Tasks for this sheet:</div>
            {s.tasks.map((t, i) => <div key={i} style={{ color: "#2B2B2B", fontSize: 13.5, marginBottom: 6 }}>✅ Task {i + 1}: {t}</div>)}
          </div>
          <button onClick={onDownload} style={{ marginTop: 18, background: "#2E9E58", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%" }}>
            ⬇️ Download Full Practice File (CSV)
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: 30, right: 24, background: "#2E9E58", color: "#fff", borderRadius: 12, padding: "14px 22px", fontWeight: 700, fontSize: 15, boxShadow: "0 8px 30px rgba(0,0,0,0.2)", zIndex: 99999, display: "flex", alignItems: "center", gap: 10, animation: "slideUp 0.3s ease" }}>
      ✅ {message}
    </div>
  );
}

// ─── CSV Download ─────────────────────────────────────────────────────────────
function downloadCSV() {
  const csv = `Google Sheets Sorting Practice File — Data Explore
Generated by: Data Explore | dataexplore_prosenjit
Topic: Sort & SortN — Built-in Tools Functions & Advanced Sorting

==============================
SHEET 1: Sort Sheet Practice
==============================
Employee,Department,Salary,Joining Date
Alice Brown,Marketing,72000,2021-03-15
Bob Smith,Engineering,95000,2019-07-22
Carol White,HR,58000,2022-01-10
Dave Jones,Engineering,88000,2020-11-05
Eve Davis,Marketing,65000,2023-02-28
Frank Lee,HR,62000,2021-09-14
Grace Kim,Engineering,102000,2018-04-30
Harry Patel,Marketing,71000,2022-06-20

TASKS:
Task 1: Sort Sheet A to Z by Employee Name
Task 2: Sort Sheet Z to A by Salary
Task 3: Undo both sorts (Ctrl+Z) and practice again

==============================
SHEET 2: Sort Range Practice
==============================
Product,Category,Units Sold,Revenue
Laptop Pro,Electronics,340,510000
Office Chair,Furniture,120,48000
Wireless Mouse,Electronics,890,44500
Standing Desk,Furniture,75,67500
USB Hub,Electronics,1200,36000
Monitor 4K,Electronics,210,189000
Bookshelf,Furniture,95,28500
Keyboard Pro,Electronics,560,84000
Lamp,Furniture,430,43000
Webcam HD,Electronics,740,66600

TASKS:
Task 1: Select A1:D11 and sort by Revenue Z to A
Task 2: Add secondary sort by Units Sold A to Z
Task 3: Test the Data has header row checkbox
Task 4: Sort only rows 3 to 7 without affecting the rest

==============================
SHEET 3: Sort by Color Practice
==============================
Task,Priority,Owner,Status,Color Code
Fix login bug,Urgent,Alice,In Progress,RED
Write docs,Low,Bob,Done,GREEN
Deploy v2.1,Urgent,Carol,Pending,RED
Design review,Medium,Dave,In Progress,YELLOW
Code review,Medium,Eve,Done,YELLOW
Database backup,Urgent,Frank,Pending,RED
API testing,Low,Grace,Done,GREEN
UI mockups,Medium,Harry,In Progress,YELLOW
Security audit,Urgent,Iris,Pending,RED
Newsletter,Low,Jake,Pending,GREEN

COLOR LEGEND:
RED = Urgent Priority
YELLOW = Medium Priority
GREEN = Low Priority

TASKS:
Task 1: Apply RED fill color to all Urgent rows
Task 2: Apply YELLOW fill to Medium rows
Task 3: Apply GREEN fill to Low rows
Task 4: Sort RED to top using right-click Sort by Color
Task 5: Strategy — Sort Green first then Yellow then Red to get Red on top

==============================
SHEET 4: SORT Formula Practice
==============================
Student,Score,Grade,Class
Maya,92,A,10B
Raj,78,B,10A
Sara,96,A+,10B
Liam,65,C,10A
Noah,88,B+,10B
Priya,74,B-,10A
Chen,91,A,10B
Sofia,82,B+,10A
Ahmed,99,A+,10B
Emma,70,B-,10A

FORMULA TASKS:
Task 1: In cell F2 write: =SORT(A2:D11,2,FALSE) — Sort by Score descending
Task 2: In cell K2 write: =SORT(A2:D11,3,TRUE) — Sort by Grade A to Z
Task 3: Multi-sort: =SORT(A2:D11,4,TRUE,2,FALSE) — Class A-Z then Score Z-A
Task 4: Change a score in column B and watch the formula auto-update

==============================
SHEET 5: SORTN Leaderboard
==============================
Sales Rep,Region,Total Sales,Month
James K.,North,145000,January
Priya M.,South,138500,January
Chen W.,East,127200,January
Sofia R.,West,127200,January
Ahmed B.,North,118900,January
Emma L.,South,118900,January
Raj P.,East,109750,January
Grace T.,West,103000,January
Liam D.,North,98500,January
Noah C.,South,94200,January

SORTN FORMULA TASKS:
Task 1: =SORTN(A2:D11,5,0,3,FALSE) — Exact Top 5 by Sales
Task 2: =SORTN(A2:D11,5,1,3,FALSE) — Top 5 with tied boundary rows included
Task 3: =SORTN(A2:D11,10,2,3,FALSE) — All unique rows ranked by sales
Task 4: =SORTN(A2:D11,3,3,3,FALSE) — Unique entries with boundary ties

==============================
ANSWER KEY
==============================
Sheet 1 Expected Result (by Salary Z-A):
Grace Kim - 102000
Bob Smith - 95000
Dave Jones - 88000
Alice Brown - 72000
Harry Patel - 71000
Eve Davis - 65000
Frank Lee - 62000
Carol White - 58000

Sheet 4 SORT Formula Result (by Score Z-A):
Ahmed - 99 - A+ - 10B
Sara - 96 - A+ - 10B
Maya - 92 - A - 10B
Chen - 91 - A - 10B
Noah - 88 - B+ - 10B
Sofia - 82 - B+ - 10A
Raj - 78 - B - 10A
Priya - 74 - B- - 10A
Emma - 70 - B- - 10A
Liam - 65 - C - 10A

Sheet 5 SORTN Top 5 with Ties (Mode 1):
James K. - 145000
Priya M. - 138500
Chen W. - 127200
Sofia R. - 127200 (tie included)
Ahmed B. - 118900

© 2026 Data Explore | Follow: youtube.com/@dataexplore_prosenjit`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Sort_SortN_Practice_File_DataExplore.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleDownload = () => {
    downloadCSV();
    setToast(true);
    setModalOpen(false);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { id: "part1", label: "Data Menu" },
    { id: "part2", label: "Sort by Color" },
    { id: "part3", label: "Formulas" },
    { id: "download", label: "Practice File" },
    { id: "quiz", label: "Quiz" },
    { id: "faq", label: "FAQ" },
    { id: "summary", label: "Summary" },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", background: "#f8f9fb", color: "#2B2B2B", minHeight: "100vh" }}>

      {/* ── Global Styles ── */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        .key-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(47,93,168,0.15) !important; }
        .nav-link:hover { color: #2F5DA8 !important; }
        .btn-primary:hover { background: #1a4a9e !important; transform: translateY(-1px); }
        .btn-green:hover { background: #1f7040 !important; transform: translateY(-1px); }
        .btn-outline:hover { background: rgba(46,158,88,0.12) !important; }
        .social-icon:hover { background: #2F5DA8 !important; transform: scale(1.12); }
        .dl-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.18) !important; }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .hero-animate { animation: fadeIn 0.8s ease both; }
        .section-card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); margin-bottom: 28px; }
        @media (max-width: 768px) {
          .section-card { padding: 20px 16px; }
          .two-col { grid-template-columns: 1fr !important; }
          .three-col { grid-template-columns: 1fr !important; }
          .quiz-options { grid-template-columns: 1fr !important; }
          .hero-stats { flex-direction: column; gap: 12px !important; align-items: flex-start !important; }
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
        @media (min-width: 769px) { .nav-mobile-btn { display: none !important; } .mobile-menu { display: none !important; } }
        .highlight-red { background: #fee2e2 !important; }
        .highlight-green { background: #d1fae5 !important; }
        .highlight-yellow { background: #fef3c7 !important; }
        .highlight-blue { background: #dbeafe !important; }
        .highlight-orange { background: #ffedd5 !important; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .tag-pill { background: #1a5c35; color: #fff; borderRadius: 20; padding: 4px 12px; fontSize: 12px; fontWeight: 600; display: inline-block; }
      `}</style>

      {/* ── Sticky Nav ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: navScrolled ? "rgba(255,255,255,0.97)" : "#fff", boxShadow: navScrolled ? "0 2px 20px rgba(0,0,0,0.12)" : "0 1px 4px rgba(0,0,0,0.07)", backdropFilter: "blur(8px)", transition: "all 0.3s" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "#2F5DA8", color: "#fff", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>D</div>
            <span style={{ fontWeight: 800, color: "#2F5DA8", fontSize: 17 }}>Data Explore</span>
          </div>
          <div className="nav-desktop" style={{ display: "flex", gap: 6 }}>
            {navLinks.map(l => (
              <button key={l.id} className="nav-link" onClick={() => scrollTo(l.id)} style={{ background: "none", border: "none", color: "#6B7280", fontWeight: 600, fontSize: 13.5, cursor: "pointer", padding: "6px 12px", borderRadius: 8, transition: "color 0.2s" }}>{l.label}</button>
            ))}
          </div>
          <button className="nav-mobile-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "none", flexDirection: "column", gap: 5 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 22, height: 2.5, background: "#2B2B2B", borderRadius: 2 }} />)}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="mobile-menu" style={{ background: "#fff", borderTop: "1px solid #e5e7eb", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
            {navLinks.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)} style={{ background: "none", border: "none", color: "#2B2B2B", fontWeight: 600, fontSize: 14, cursor: "pointer", padding: "10px 0", textAlign: "left", borderBottom: "1px solid #f3f4f6" }}>{l.label}</button>
            ))}
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: "linear-gradient(135deg, #1f2a3a 0%, #2F5DA8 60%, #1a4a9e 100%)", paddingTop: 100, paddingBottom: 70, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, background: "rgba(245,166,35,0.12)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 350, height: 350, background: "rgba(46,158,88,0.10)", borderRadius: "50%" }} />
        <div className="hero-animate" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <div style={{ marginBottom: 14 }}>
            <span style={{ background: "#F5A623", color: "#1f2a3a", borderRadius: 20, padding: "5px 16px", fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>📊 Google Sheets Mastery</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 900, lineHeight: 1.15, marginBottom: 18, maxWidth: 800 }}>
            Complete Guide to<br />
            <span style={{ color: "#F5A623" }}>Sort & SortN</span>
          </h1>
          <p style={{ color: "#cdd6f4", fontSize: "clamp(14px, 2vw, 18px)", maxWidth: 680, lineHeight: 1.7, marginBottom: 32 }}>
            Master built-in sorting tools, Sort by Color, and powerful formula functions — SORT & SORTN. From beginner basics to advanced multi-level sorting strategies.
          </p>
          <div className="hero-stats" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { icon: "📂", label: "3 Core Parts", color: "#F5A623" },
              { icon: "🎨", label: "Sort by Color", color: "#2E9E58" },
              { icon: "⚡", label: "SORT & SORTN", color: "#E94B2C" },
              { icon: "🏆", label: "5 Practice Sheets", color: "#F2C94C" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", borderRadius: 40, padding: "8px 18px" }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{s.label}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 36, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => scrollTo("part1")} style={{ background: "#2F5DA8", border: "2px solid #fff", color: "#fff", borderRadius: 12, padding: "14px 28px", fontWeight: 800, fontSize: 15, cursor: "pointer", transition: "all 0.2s" }}>Start Learning →</button>
            <button className="btn-green" onClick={() => scrollTo("download")} style={{ background: "#2E9E58", border: "none", color: "#fff", borderRadius: 12, padding: "14px 28px", fontWeight: 800, fontSize: 15, cursor: "pointer", transition: "all 0.2s" }}>⬇ Download Practice File</button>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>

        {/* ── PART 1: Data Menu Sorting ── */}
        <div id="part1">
          <div style={{ marginBottom: 20 }}>
            <SectionBadge text="PART 1" color="#2F5DA8" />
            <h2 style={{ color: "#2F5DA8", fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, marginTop: 8 }}>Sorting from the Data Menu</h2>
            <p style={{ color: "#6B7280", fontSize: 15, marginTop: 6 }}>The most visual, no-formula way to sort your Google Sheets data instantly.</p>
          </div>

          <div className="section-card">
            <h3 style={{ color: "#2F5DA8", fontWeight: 800, fontSize: 20, marginBottom: 12 }}>📖 What is Data Menu Sorting?</h3>
            <p style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 14 }}>Sorting from the Data Menu is the most basic and visual method to sort data in Google Sheets — no formulas required. Simply click inside your data, navigate to the <strong style={{ color: "#2B2B2B" }}>Data menu</strong>, and choose your sorting option. It's perfect for quick, one-time data organization.</p>
            <TipBox>Always click any cell <em>inside</em> your data before opening the Data menu. This helps Google Sheets auto-detect your data range correctly.</TipBox>
            <h4 style={{ color: "#2B2B2B", fontWeight: 700, fontSize: 16, margin: "20px 0 12px" }}>🔑 How to Access Sort</h4>
            <StepBox steps={["Click on any cell inside your data range", "Go to the top menu bar → click \"Data\"", "You will see Sort Sheet, Sort Range, and Sort by Color options"]} />
          </div>

          {/* Sort Sheet */}
          <div className="section-card">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ background: "#dbeafe", borderRadius: 10, padding: "8px 14px" }}>
                <span style={{ fontSize: 24 }}>📋</span>
              </div>
              <div>
                <h3 style={{ color: "#2F5DA8", fontWeight: 800, fontSize: 20 }}>1.3 Sort Sheet</h3>
                <p style={{ color: "#6B7280", fontSize: 13.5 }}>Sorts the entire sheet based on one selected column</p>
              </div>
            </div>
            <p style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 16 }}>
              <strong style={{ color: "#2B2B2B" }}>Sort Sheet</strong> rearranges ALL rows in the entire sheet based on the values in one selected column. Every column moves together, keeping your data relationships perfectly intact.
            </p>
            <FormulaBox formula="Data Menu → Sort Sheet → Sort Sheet by Column A (A→Z or Z→A)" label="Navigation Path" note="💡 Only one column can be chosen as the sort key for Sort Sheet." />
            <h4 style={{ color: "#2B2B2B", fontWeight: 700, fontSize: 15, margin: "20px 0 10px" }}>Steps to Sort Sheet:</h4>
            <StepBox steps={[
              "Click any cell in the column you want to sort by",
              "Go to the Data Menu in the top toolbar",
              "Hover over \"Sort Sheet\"",
              "Choose → \"Sort Sheet by Column A, A→Z\" for Ascending",
              "Or choose → \"Sort Sheet by Column A, Z→A\" for Descending",
              "✅ The entire sheet gets sorted immediately"
            ]} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 12, marginTop: 20 }} className="three-col">
              {[
                { icon: "🔗", title: "Preserves Relationships", desc: "All columns in each row move together — data stays aligned" },
                { icon: "👁️", title: "Auto-Detects Header", desc: "The header row is automatically detected and kept at the top" },
                { icon: "↩️", title: "Undo Available", desc: "This permanently changes data — press Ctrl+Z to undo" },
              ].map((c, i) => <KeyCard key={i} {...c} />)}
            </div>
          </div>

          {/* Sort Range */}
          <div className="section-card">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ background: "#d1fae5", borderRadius: 10, padding: "8px 14px" }}>
                <span style={{ fontSize: 24 }}>🎯</span>
              </div>
              <div>
                <h3 style={{ color: "#2F5DA8", fontWeight: 800, fontSize: 20 }}>1.4 Sort Range</h3>
                <p style={{ color: "#6B7280", fontSize: 13.5 }}>Sorts only a specific selected range — more precise control</p>
              </div>
            </div>
            <p style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 16 }}>
              <strong style={{ color: "#2B2B2B" }}>Sort Range</strong> sorts only the cells you have highlighted — the rest of the sheet is completely untouched. It is the go-to option when you have multiple separate tables on one sheet.
            </p>
            <FormulaBox formula="Data Menu → Sort Range → Advanced Range Sorting Options..." label="Navigation Path for Advanced Sort" note="Use Advanced Options for multi-level sorting with full control." />
            <h4 style={{ color: "#2B2B2B", fontWeight: 700, fontSize: 15, margin: "20px 0 10px" }}>Advanced Sort Dialog Box:</h4>
            <div style={{ background: "#0d1117", borderRadius: 10, padding: 20, fontFamily: "monospace", fontSize: 13, color: "#cdd6f4", marginBottom: 20, border: "1px solid #30363d" }}>
              <div style={{ color: "#8b949e", marginBottom: 10 }}>┌─────────────────────────────────────────────┐</div>
              <div style={{ color: "#fff", marginBottom: 6 }}>│ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Sort Range (Advanced) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
              <div style={{ color: "#cdd6f4", marginBottom: 6 }}>│ &nbsp;&nbsp;☑ Data has header row &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
              <div style={{ color: "#79c0ff", marginBottom: 6 }}>│ &nbsp;&nbsp;Sort by: [Column A ▼] &nbsp;[A→Z ▼] &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
              <div style={{ color: "#2E9E58", marginBottom: 6 }}>│ &nbsp;&nbsp;+ Add another sort column &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
              <div style={{ color: "#8b949e" }}>└─────────────────────────────────────────────┘</div>
            </div>
            <h4 style={{ color: "#2B2B2B", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Multi-Level Sort Example:</h4>
            <div style={{ background: "#f0f5ff", borderRadius: 10, padding: "16px 20px", borderLeft: "4px solid #2F5DA8" }}>
              <div style={{ color: "#2B2B2B", fontFamily: "monospace", fontSize: 13.5, lineHeight: 2 }}>
                <div>🔵 <strong>Primary Sort:</strong> &nbsp;&nbsp;Department (A→Z)</div>
                <div>🟡 <strong>Secondary Sort:</strong> &nbsp;Salary (Z→A) — within same department</div>
                <div>🟢 <strong>Tertiary Sort:</strong> &nbsp;&nbsp;Name (A→Z) — when department & salary match</div>
              </div>
            </div>
          </div>

          {/* Sort Sheet vs Sort Range */}
          <div className="section-card">
            <h3 style={{ color: "#2F5DA8", fontWeight: 800, fontSize: 20, marginBottom: 16 }}>⚖️ Sort Sheet vs Sort Range — Comparison</h3>
            <CompareTable
              headers={["Feature", "Sort Sheet", "Sort Range"]}
              rows={[
                ["What gets sorted", "Entire sheet (all rows & columns)", "Selected range only"],
                ["Header handling", <Badge text="Auto-detected" color="#2E9E58" />, <Badge text="Manual checkbox" color="#F5A623" />],
                ["Multi-level sort", <Badge text="❌ Not available" color="#E94B2C" />, <Badge text="✅ Available in Advanced" color="#2E9E58" />],
                ["Other data affected?", <Badge text="Yes — everything moves" color="#F5A623" />, <Badge text="No — only selection" color="#2E9E58" />],
                ["Best use case", "Single-table sheets", "Multiple tables or partial data"],
              ]}
            />
          </div>
        </div>

        {/* ── PART 2: Sort by Color ── */}
        <div id="part2">
          <div style={{ marginBottom: 20, marginTop: 40 }}>
            <SectionBadge text="PART 2" color="#E94B2C" />
            <h2 style={{ color: "#2F5DA8", fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, marginTop: 8 }}>Sort by Cell Color & Text Color</h2>
            <p style={{ color: "#6B7280", fontSize: 15, marginTop: 6 }}>Organize color-coded data visually — sort by background fill or font color.</p>
          </div>

          <div className="section-card">
            <h3 style={{ color: "#2F5DA8", fontWeight: 800, fontSize: 20, marginBottom: 12 }}>🎨 What is Sort by Color?</h3>
            <p style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 16 }}>After applying cell background colors or text/font colors (manually or via Conditional Formatting), Google Sheets lets you sort data based on those colors. This is extremely powerful for priority-based, category-based, or visually grouped datasets.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12 }} className="three-col">
              {[
                { icon: "🔴", title: "Red = Urgent", desc: "Move urgent/high-priority items to the top instantly" },
                { icon: "🟢", title: "Green = Done", desc: "Group completed items together at the bottom" },
                { icon: "🟡", title: "Yellow = Pending", desc: "Visually cluster medium-priority items in the middle" },
              ].map((c, i) => <KeyCard key={i} {...c} />)}
            </div>
          </div>

          <div className="section-card">
            <h3 style={{ color: "#2F5DA8", fontWeight: 800, fontSize: 19, marginBottom: 14 }}>🖌️ How to Apply Colors (Pre-requisite)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }} className="three-col">
              {[
                { title: "Method 1 — Manual Fill", steps: ["Select the cells you want to color", "Click the Fill Color bucket icon in the toolbar", "Choose your color from the palette", "Cells now have a background color for sorting"] },
                { title: "Method 2 — Conditional Formatting", steps: ["Select your data range", "Go to Format → Conditional Formatting", "Set rules: value > 100 → Green, value < 50 → Red", "Colors apply automatically as data changes"] },
                { title: "Method 3 — Text/Font Color", steps: ["Select the cells with the text to color", "Click the Text Color (A icon) in the toolbar", "Choose your font color", "Rows can now be sorted by this font color"] },
              ].map((m, i) => (
                <div key={i} style={{ background: "#f8f9fb", borderRadius: 12, padding: "18px 16px", border: "1px solid #e5e7eb" }}>
                  <div style={{ fontWeight: 800, color: "#2F5DA8", fontSize: 14, marginBottom: 12 }}>{m.title}</div>
                  <StepBox steps={m.steps} />
                </div>
              ))}
            </div>
          </div>

          {/* Before/After */}
          <div className="section-card">
            <h3 style={{ color: "#2F5DA8", fontWeight: 800, fontSize: 19, marginBottom: 16 }}>📊 Visual Before & After — Sort by Cell Color</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="two-col">
              <div>
                <div style={{ fontWeight: 700, color: "#6B7280", fontSize: 13, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>BEFORE Sorting</div>
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                  {[
                    { name: "Alice", status: "Pending", color: "#fef9c3", dot: "🟡" },
                    { name: "Bob", status: "Done", color: "#dcfce7", dot: "🟢" },
                    { name: "Carol", status: "Urgent", color: "#fee2e2", dot: "🔴" },
                    { name: "Dave", status: "Pending", color: "#fef9c3", dot: "🟡" },
                    { name: "Eve", status: "Done", color: "#dcfce7", dot: "🟢" },
                    { name: "Frank", status: "Urgent", color: "#fee2e2", dot: "🔴" },
                  ].map((r, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", padding: "10px 14px", background: r.color, borderBottom: "1px solid #e5e7eb", color: "#2B2B2B", fontSize: 13.5 }}>
                      <span>{r.name}</span><span>{r.status}</span><span>{r.dot}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#2E9E58", fontSize: 13, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>AFTER — Red Moved to Top</div>
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                  {[
                    { name: "Carol", status: "Urgent", color: "#fee2e2", dot: "🔴", tag: "↑ Moved to top" },
                    { name: "Frank", status: "Urgent", color: "#fee2e2", dot: "🔴", tag: "↑ Moved to top" },
                    { name: "Alice", status: "Pending", color: "#fef9c3", dot: "🟡", tag: "" },
                    { name: "Dave", status: "Pending", color: "#fef9c3", dot: "🟡", tag: "" },
                    { name: "Bob", status: "Done", color: "#dcfce7", dot: "🟢", tag: "" },
                    { name: "Eve", status: "Done", color: "#dcfce7", dot: "🟢", tag: "" },
                  ].map((r, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", padding: "10px 14px", background: r.color, borderBottom: "1px solid #e5e7eb", color: "#2B2B2B", fontSize: 13.5, position: "relative" }}>
                      <span style={{ fontWeight: r.tag ? 700 : 400 }}>{r.name}</span><span>{r.status}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{r.dot}{r.tag && <span style={{ background: "#E94B2C", color: "#fff", borderRadius: 4, padding: "1px 5px", fontSize: 9, fontWeight: 700 }}>TOP</span>}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Multi-color strategy */}
          <div className="section-card">
            <h3 style={{ color: "#2F5DA8", fontWeight: 800, fontSize: 19, marginBottom: 14 }}>🧠 Multi-Color Sorting Strategy</h3>
            <WarnBox>Google Sheets only allows you to sort ONE color at a time. To arrange multiple colors in a specific order, you must sort them in REVERSE order of your desired sequence!</WarnBox>
            <div style={{ background: "#0d1117", borderRadius: 10, padding: 20, fontFamily: "monospace", fontSize: 13.5, color: "#cdd6f4", margin: "16px 0", border: "1px solid #30363d" }}>
              <div style={{ color: "#f2c94c", marginBottom: 10, fontWeight: 700 }}>Goal: Red on top → Yellow in middle → Green at bottom</div>
              <div style={{ color: "#8b949e", marginBottom: 14 }}>Strategy (work in REVERSE order):</div>
              <div style={{ color: "#2E9E58", marginBottom: 6 }}>Step 1: Sort <span style={{ color: "#4ade80" }}>Green</span> → Move to Top</div>
              <div style={{ color: "#F2C94C", marginBottom: 6 }}>Step 2: Sort <span style={{ color: "#fde047" }}>Yellow</span> → Move to Top</div>
              <div style={{ color: "#E94B2C", marginBottom: 14 }}>Step 3: Sort <span style={{ color: "#f87171" }}>Red</span> → Move to Top</div>
              <div style={{ color: "#79c0ff", marginBottom: 6 }}>Final Result:</div>
              <div>🔴 Red &nbsp;&nbsp; ← on top (last sorted, wins)</div>
              <div>🟡 Yellow ← in middle</div>
              <div>🟢 Green &nbsp; ← at bottom</div>
            </div>
            <CompareTable
              headers={["Rule", "Detail"]}
              rows={[
                ["Only ONE color per sort operation", "Repeat the step for each color you want to position"],
                ["Move to Top / Bottom only", "Cannot arrange multiple colors in custom order in one step"],
                ["Works with conditional formatting", <Badge text="✅ Yes" color="#2E9E58" />],
                ["Works with manually applied colors", <Badge text="✅ Yes" color="#2E9E58" />],
                ["Permanent change", "Yes — Ctrl+Z to undo anytime"],
              ]}
            />
          </div>
        </div>

        {/* ── PART 3: SORT & SORTN ── */}
        <div id="part3">
          <div style={{ marginBottom: 20, marginTop: 40 }}>
            <SectionBadge text="PART 3" color="#2E9E58" />
            <h2 style={{ color: "#2F5DA8", fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, marginTop: 8 }}>SORT & SORTN Formula Functions</h2>
            <p style={{ color: "#6B7280", fontSize: 15, marginTop: 6 }}>Dynamic, non-destructive sorting using Google Sheets built-in formula functions.</p>
          </div>

          <div className="section-card">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ background: "#d1fae5", borderRadius: 10, padding: "8px 14px" }}><span style={{ fontSize: 24 }}>⚡</span></div>
              <div><h3 style={{ color: "#2F5DA8", fontWeight: 800, fontSize: 20 }}>3.1 SORT Function</h3><p style={{ color: "#6B7280", fontSize: 13.5 }}>Returns all rows sorted — dynamic and non-destructive</p></div>
            </div>
            <FormulaBox formula="=SORT(range, sort_column, is_ascending, [sort_column2, is_ascending2, ...])" label="Syntax" note="✅ Required: range, sort_column, is_ascending | 🔵 Optional: additional sort columns" />
            <CompareTable
              headers={["Parameter", "Description", "Required"]}
              rows={[
                ["range", "The data range to sort (e.g., A2:D100)", <Badge text="✅ Required" color="#2E9E58" />],
                ["sort_column", "Column number to sort by (1 = first column in range)", <Badge text="✅ Required" color="#2E9E58" />],
                ["is_ascending", "TRUE = A→Z (Ascending) | FALSE = Z→A (Descending)", <Badge text="✅ Required" color="#2E9E58" />],
                ["sort_column2", "Second column to sort by (for multi-level sort)", <Badge text="❌ Optional" color="#6B7280" />],
                ["is_ascending2", "Ascending/Descending order for the second sort column", <Badge text="❌ Optional" color="#6B7280" />],
              ]}
            />
            <h4 style={{ color: "#2B2B2B", fontWeight: 700, fontSize: 15, margin: "20px 0 10px" }}>Formula Examples:</h4>
            <FormulaBox formula="=SORT(A2:C10, 1, TRUE)" label="Example 1 — Sort by Column 1, Ascending (A→Z)" note="Sorts range A2:C10 by the first column alphabetically ascending." />
            <FormulaBox formula="=SORT(A2:C10, 2, FALSE)" label="Example 2 — Sort by Column 2, Descending (Z→A)" note="Sorts range A2:C10 by the second column from highest to lowest." />
            <FormulaBox formula="=SORT(A2:D20, 1, TRUE, 2, FALSE)" label="Example 3 — Multi-Level Sort" note="Primary: Column 1 Ascending → Secondary: Column 2 Descending" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 12, marginTop: 16 }} className="three-col">
              {[
                { icon: "🔄", title: "Dynamic Output", desc: "Auto-updates when source data changes" },
                { icon: "🛡️", title: "Non-Destructive", desc: "Original data is never modified or rearranged" },
                { icon: "📅", title: "Handles All Types", desc: "Works with text, numbers, dates, and mixed data" },
              ].map((c, i) => <KeyCard key={i} {...c} />)}
            </div>
          </div>

          <div className="section-card">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ background: "#ede9fe", borderRadius: 10, padding: "8px 14px" }}><span style={{ fontSize: 24 }}>🏆</span></div>
              <div><h3 style={{ color: "#2F5DA8", fontWeight: 800, fontSize: 20 }}>3.2 SORTN Function</h3><p style={{ color: "#6B7280", fontSize: 13.5 }}>Returns only Top N rows — perfect for leaderboards and dashboards</p></div>
            </div>
            <FormulaBox formula="=SORTN(range, [n], [display_ties_mode], [sort_column1, is_ascending1, ...])" label="Syntax" note="✅ Required: range | 🔵 Optional: n, display_ties_mode, sort columns" />
            <CompareTable
              headers={["Parameter", "Description", "Required"]}
              rows={[
                ["range", "The data range to sort and filter", <Badge text="✅ Required" color="#2E9E58" />],
                ["n", "Number of rows to return (e.g., 5 = Top 5)", <Badge text="❌ Optional" color="#6B7280" />],
                ["display_ties_mode", "0, 1, 2, or 3 — controls tie and duplicate handling", <Badge text="❌ Optional" color="#6B7280" />],
                ["sort_column", "Column number to sort by", <Badge text="❌ Optional" color="#6B7280" />],
                ["is_ascending", "TRUE = A→Z | FALSE = Z→A", <Badge text="❌ Optional" color="#6B7280" />],
              ]}
            />
            <h4 style={{ color: "#2B2B2B", fontWeight: 700, fontSize: 15, margin: "20px 0 10px" }}>🧮 display_ties_mode Explained:</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 12 }} className="two-col">
              {[
                { mode: "Mode 0", name: "Default", color: "#6B7280", desc: "Returns exactly N rows. No special tie handling — straightforward." },
                { mode: "Mode 1", name: "Show Boundary Ties", color: "#2F5DA8", desc: "Returns N+ rows if the Nth position has tied values (all ties included)." },
                { mode: "Mode 2", name: "Remove Duplicates", color: "#2E9E58", desc: "Returns only unique rows — duplicates are removed entirely." },
                { mode: "Mode 3", name: "Unique + Ties", color: "#9B59B6", desc: "Removes duplicates AND includes boundary tie rows. Most complete mode." },
              ].map((m, i) => (
                <div key={i} style={{ background: "#f8f9fb", borderRadius: 12, padding: "16px", border: `2px solid ${m.color}20` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ background: m.color, color: "#fff", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 800 }}>{m.mode}</span>
                    <span style={{ fontWeight: 700, color: "#2B2B2B", fontSize: 14 }}>{m.name}</span>
                  </div>
                  <p style={{ color: "#4b5563", fontSize: 13.5, lineHeight: 1.6 }}>{m.desc}</p>
                </div>
              ))}
            </div>
            <h4 style={{ color: "#2B2B2B", fontWeight: 700, fontSize: 15, margin: "20px 0 10px" }}>Formula Examples:</h4>
            <FormulaBox formula="=SORTN(A2:B100, 5, 0, 2, FALSE)" label="Example 1 — Exact Top 5 by Column 2 Descending" note="Returns exactly 5 rows, sorted by column 2 from highest to lowest." />
            <FormulaBox formula="=SORTN(A2:B50, 3, 1, 2, FALSE)" label="Example 2 — Top 3 with Tied Boundary Rows" note="If the 3rd place is tied (e.g., two rows with same value), all tied rows are included." />
            <FormulaBox formula="=SORTN(A2:A100, 10, 2, 1, TRUE)" label="Example 3 — Top 10 Unique Values Only" note="Removes duplicates and returns only 10 unique sorted entries." />
          </div>

          <div className="section-card">
            <h3 style={{ color: "#2F5DA8", fontWeight: 800, fontSize: 19, marginBottom: 16 }}>⚔️ SORT vs SORTN — Full Comparison</h3>
            <CompareTable
              headers={["Feature", "SORT", "SORTN"]}
              rows={[
                ["Returns all rows", <Badge text="✅ Yes" color="#2E9E58" />, <Badge text="❌ No (limited by N)" color="#E94B2C" />],
                ["Limit rows (Top N)", <Badge text="❌ Not available" color="#E94B2C" />, <Badge text="✅ Yes" color="#2E9E58" />],
                ["Multi-column sort", <Badge text="✅ Yes" color="#2E9E58" />, <Badge text="✅ Yes" color="#2E9E58" />],
                ["Tie/Duplicate handling", <Badge text="❌ No" color="#E94B2C" />, <Badge text="✅ 4 Modes" color="#2E9E58" />],
                ["Dynamic output", <Badge text="✅ Auto-updates" color="#2E9E58" />, <Badge text="✅ Auto-updates" color="#2E9E58" />],
                ["Best for", "Full sorted lists, filtered views", "Top N leaderboards, dashboards, summaries"],
              ]}
            />
          </div>
        </div>

        {/* ── Quick Reference ── */}
        <div className="section-card" style={{ background: "linear-gradient(135deg, #1f2a3a 0%, #2F5DA8 100%)" }}>
          <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 22, marginBottom: 6 }}>📌 Quick Reference Table — All Sort Methods</h3>
          <p style={{ color: "#cdd6f4", marginBottom: 20, fontSize: 14 }}>Everything you need to know at a glance</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", borderRadius: 10, overflow: "hidden" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.15)" }}>
                  {["Method", "Access Via", "What Gets Sorted", "Multi-Level", "Dynamic", "Best For"].map(h => (
                    <th key={h} style={{ color: "#fff", padding: "12px 14px", textAlign: "left", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Sort Sheet", "Data Menu", "Entire Sheet", "❌", "❌", "Quick full-sheet sort"],
                  ["Sort Range", "Data Menu", "Selected Range", "✅", "❌", "Multiple tables, precision"],
                  ["Sort by Color", "Right-click / Menu", "Selected Range", "Partial", "❌", "Color-coded data"],
                  ["SORT Formula", "Formula bar", "New output range", "✅", "✅", "Live sorted view"],
                  ["SORTN Formula", "Formula bar", "New output (Top N)", "✅", "✅", "Leaderboards, Top N"],
                ].map((row, ri) => (
                  <tr key={ri} style={{ background: ri % 2 === 0 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)" }}>
                    {row.map((cell, ci) => <td key={ci} style={{ padding: "11px 14px", color: ci === 0 ? "#F5A623" : "#cdd6f4", fontSize: 13.5, fontWeight: ci === 0 ? 700 : 400, borderBottom: "1px solid rgba(255,255,255,0.08)", whiteSpace: ci < 2 ? "nowrap" : "normal" }}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Pro Tips ── */}
        <div className="section-card">
          <h3 style={{ color: "#2F5DA8", fontWeight: 800, fontSize: 22, marginBottom: 20 }}>🚀 Pro Tips from the Trainer</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 16 }} className="two-col">
            {[
              { icon: "💡", color: "#d1fae5", border: "#2E9E58", text: "text: #1a5c35", tip: "Use SORT() formulas on a separate sheet tab to keep your original data always clean and untouched. Name it 'Sorted View' for clarity.", tag: "Non-Destructive Tip" },
              { icon: "⚡", color: "#dbeafe", border: "#2F5DA8", text: "text: #1e3a70", tip: "When using Advanced Range Sort with multiple levels, always check 'Data has header row' FIRST — before adding sort columns. This prevents your headers from getting sorted into the data.", tag: "Common Mistake Fix" },
              { icon: "🎨", color: "#fef3c7", border: "#F5A623", text: "text: #7c5a00", tip: "Combine Conditional Formatting + Sort by Color for powerful automated workflows. Set rules to color rows automatically, then sort by color to group them — all without writing a single formula.", tag: "Power User Trick" },
              { icon: "🏆", color: "#ede9fe", border: "#9B59B6", text: "text: #5b21b6", tip: "For leaderboards, use =SORTN(A2:C100, 10, 1, 3, FALSE). Mode 1 ensures that if two salespeople tie for the 10th spot, both appear — your leaderboard is always fair and complete.", tag: "SORTN Best Practice" },
              { icon: "🔄", color: "#d1fae5", border: "#2E9E58", text: "text: #1a5c35", tip: "SORT formulas spill automatically. Make sure the output area is empty — if any cell in the spill range has data, you'll get a #SPILL! error. Leave plenty of blank rows below your formula.", tag: "Avoid #SPILL! Error" },
              { icon: "↩️", color: "#fee2e2", border: "#E94B2C", text: "text: #8a2015", tip: "Before doing ANY menu-based sort on important data, press Ctrl+S to save first, then sort. If something goes wrong, you can use File → Version History to recover your original data.", tag: "Data Safety First" },
            ].map((t, i) => (
              <div key={i} style={{ background: t.color, border: `1.5px solid ${t.border}40`, borderLeft: `4px solid ${t.border}`, borderRadius: 12, padding: "18px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>{t.icon}</span>
                  <span style={{ background: t.border, color: "#fff", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700 }}>{t.tag}</span>
                </div>
                <p style={{ color: "#2B2B2B", fontSize: 13.5, lineHeight: 1.65 }}>{t.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Download Section ── */}
        <div id="download">
          <div style={{ background: "linear-gradient(135deg, #0f1c2e 0%, #1a2d45 50%, #0f1c2e 100%)", borderRadius: 20, padding: "40px 32px", marginBottom: 28, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 250, height: 250, background: "rgba(46,158,88,0.08)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", bottom: -60, left: -60, width: 300, height: 300, background: "rgba(47,93,168,0.08)", borderRadius: "50%" }} />
            <div style={{ position: "relative" }}>
              <span style={{ background: "#2E9E58", color: "#fff", borderRadius: 20, padding: "5px 16px", fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>📥 PRACTICE FILES</span>
              <h2 style={{ color: "#fff", fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, marginTop: 14, marginBottom: 10 }}>Download Your Practice File</h2>
              <p style={{ color: "#94a3b8", fontSize: 15, maxWidth: 600, marginBottom: 28, lineHeight: 1.6 }}>A complete, structured practice file with 5 task sheets covering every sorting method — Sort Sheet, Sort Range, Sort by Color, SORT Formula, and SORTN Leaderboard.</p>

              {/* Main Download Card */}
              <div className="dl-card" style={{ background: "#1a2d45", borderRadius: 16, padding: "28px 24px", border: "1px solid rgba(46,158,88,0.3)", maxWidth: 720, boxShadow: "0 8px 30px rgba(0,0,0,0.2)", transition: "all 0.25s", marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
                  <div style={{ background: "rgba(46,158,88,0.15)", borderRadius: 14, padding: "18px 20px", border: "2px solid rgba(46,158,88,0.4)", flexShrink: 0 }}>
                    <div style={{ fontSize: 44, lineHeight: 1 }}>📊</div>
                    <div style={{ color: "#2E9E58", fontWeight: 800, fontSize: 12, marginTop: 8, textAlign: "center" }}>CSV / XLS</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Sort_SortN_Practice_File_DataExplore.csv</div>
                    <div style={{ color: "#94a3b8", fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>Complete Google Sheets sorting practice file with 5 structured sheets, step-by-step tasks, formulas, and a full answer key.</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                      {[["📁 Format", "CSV (Opens in Google Sheets)"], ["📑 Sheets", "5 Practice Sheets"], ["✅ Tasks", "25+ Practice Tasks"], ["🎯 Level", "Beginner → Advanced"]].map(([k, v], i) => (
                        <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "6px 12px" }}>
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>{k}: </span>
                          <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ color: "#cdd6f4", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>✅ What's Included:</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {["Sort Sheet Tasks", "Sort Range Tasks", "Sort by Color", "Multi-Level Sort", "SORT Formulas", "SORTN Leaderboard", "Answer Key", "Step-by-Step Guide"].map((tag, i) => (
                          <span key={i} style={{ background: "rgba(46,158,88,0.2)", color: "#4ade80", border: "1px solid rgba(46,158,88,0.4)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <button className="btn-green" onClick={handleDownload} style={{ background: "#2E9E58", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 800, fontSize: 15, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8 }}>
                        ⬇️ Download Practice File
                      </button>
                      <button className="btn-outline" onClick={() => setModalOpen(true)} style={{ background: "transparent", color: "#2E9E58", border: "2px solid #2E9E58", borderRadius: 10, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
                        👁️ Preview Sheets
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sheet Tabs Grid */}
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, marginBottom: 16 }}>📋 Sheet Preview Cards</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                  {sheetTabs.map((sheet, si) => (
                    <div key={si} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
                      <div style={{ background: sheet.color, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 6, padding: "2px 10px", color: "#fff", fontSize: 12, fontWeight: 700 }}>Sheet {si + 1}</div>
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{sheet.name}</span>
                      </div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                          <thead>
                            <tr style={{ background: `${sheet.color}20` }}>
                              {sheet.headers.slice(0, 3).map((h, i) => <th key={i} style={{ padding: "6px 8px", color: "#2B2B2B", fontWeight: 700, textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>{h}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {sheet.rows.slice(0, 3).map((row, ri) => (
                              <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : "#f9fafb" }}>
                                {row.slice(0, 3).map((cell, ci) => <td key={ci} style={{ padding: "5px 8px", color: "#2B2B2B", borderBottom: "1px solid #f3f4f6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 80 }}>{cell}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ padding: "10px 14px", background: "#f8f9fb", borderTop: "1px solid #e5e7eb" }}>
                        {sheet.tasks.slice(0, 2).map((task, ti) => (
                          <div key={ti} style={{ color: "#2B2B2B", fontSize: 11.5, marginBottom: 4, display: "flex", gap: 6, alignItems: "flex-start" }}>
                            <span style={{ color: sheet.color, fontWeight: 700, flexShrink: 0 }}>▸</span>
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How to Use */}
              <div style={{ background: "#1a2d45", borderRadius: 14, padding: "24px 22px", marginTop: 28, border: "1px solid rgba(47,93,168,0.3)" }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 17, marginBottom: 16 }}>📖 How to Use This Practice File</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 14 }}>
                  {[
                    { n: 1, icon: "⬇️", title: "Download the File", desc: "Click the Download button to get the CSV practice file on your device." },
                    { n: 2, icon: "📂", title: "Open in Google Sheets", desc: "Go to sheets.google.com → File → Import → Upload the CSV file." },
                    { n: 3, icon: "📋", title: "Read the Instructions", desc: "Each sheet has clear task instructions and context at the top rows." },
                    { n: 4, icon: "🎯", title: "Complete the Tasks", desc: "Work through each numbered task on the sheet independently." },
                    { n: 5, icon: "✅", title: "Check the Answer Key", desc: "Compare your results with the Answer Key section in the CSV file." },
                    { n: 6, icon: "🔁", title: "Repeat & Reinforce", desc: "Reset the data and repeat each task until you feel fully confident." },
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ background: "#2F5DA8", color: "#fff", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{step.n}</div>
                      <div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{step.icon} {step.title}</div>
                        <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.5 }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quiz ── */}
        <div id="quiz" className="section-card">
          <div style={{ marginBottom: 24 }}>
            <SectionBadge text="KNOWLEDGE CHECK" color="#E94B2C" />
            <h2 style={{ color: "#2F5DA8", fontSize: "clamp(20px,4vw,30px)", fontWeight: 900, marginTop: 10 }}>🧠 Interactive Quiz</h2>
            <p style={{ color: "#6B7280", marginTop: 6, fontSize: 14 }}>Test your understanding — click an option to reveal the answer and explanation.</p>
          </div>
          <Quiz questions={quizData} />
        </div>

        {/* ── FAQ ── */}
        <div id="faq" className="section-card">
          <div style={{ marginBottom: 24 }}>
            <SectionBadge text="FAQ" color="#9B59B6" />
            <h2 style={{ color: "#2F5DA8", fontSize: "clamp(20px,4vw,30px)", fontWeight: 900, marginTop: 10 }}>❓ Frequently Asked Questions</h2>
            <p style={{ color: "#6B7280", marginTop: 6, fontSize: 14 }}>Click any question to expand the detailed answer.</p>
          </div>
          <Accordion items={faqs} />
        </div>

        {/* ── Summary ── */}
        <div id="summary" style={{ background: "linear-gradient(135deg, #1f2a3a 0%, #2F5DA8 100%)", borderRadius: 20, padding: "40px 32px", marginBottom: 28, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "rgba(242,201,76,0.1)", borderRadius: "50%" }} />
          <div style={{ position: "relative" }}>
            <SectionBadge text="SUMMARY" color="#F2C94C" />
            <h2 style={{ color: "#fff", fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, marginTop: 12, marginBottom: 20 }}>🎓 Complete Summary</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 16 }}>
              {[
                { icon: "📋", title: "Data Menu Sorting", color: "#2F5DA8", bg: "rgba(47,93,168,0.2)", points: ["Sort Sheet: Sorts entire sheet, all rows move together", "Sort Range: Sorts only selected cells, rest untouched", "Advanced Options: Multi-level sorting with header checkbox", "Permanent change — use Ctrl+Z to undo"] },
                { icon: "🎨", title: "Sort by Color", color: "#E94B2C", bg: "rgba(233,75,44,0.2)", points: ["Sort by cell background fill color", "Sort by text/font color", "Only one color per operation — work in reverse order", "Works with conditional formatting and manual colors"] },
                { icon: "⚡", title: "SORT Formula", color: "#2E9E58", bg: "rgba(46,158,88,0.2)", points: ["=SORT(range, sort_column, is_ascending)", "Returns all rows sorted dynamically", "Multi-level: add more column/order pairs", "Never modifies original data — purely dynamic"] },
                { icon: "🏆", title: "SORTN Formula", color: "#F5A623", bg: "rgba(245,166,35,0.2)", points: ["=SORTN(range, n, display_ties_mode, ...)", "Returns only Top N rows", "4 tie modes: Default, Boundary Ties, Unique, Unique+Ties", "Perfect for leaderboards and Top N dashboards"] },
              ].map((sec, i) => (
                <div key={i} style={{ background: sec.bg, borderRadius: 14, padding: "20px 18px", border: `1px solid ${sec.color}40` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <span style={{ fontSize: 24 }}>{sec.icon}</span>
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{sec.title}</span>
                  </div>
                  {sec.points.map((p, pi) => (
                    <div key={pi} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                      <span style={{ color: sec.color, fontWeight: 900, flexShrink: 0, fontSize: 14 }}>✓</span>
                      <span style={{ color: "#cdd6f4", fontSize: 13.5, lineHeight: 1.5 }}>{p}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28, background: "rgba(242,201,76,0.15)", borderRadius: 12, padding: "18px 20px", borderLeft: "4px solid #F2C94C" }}>
              <div style={{ color: "#F2C94C", fontWeight: 800, fontSize: 16, marginBottom: 8 }}>💡 Golden Rule to Remember:</div>
              <div style={{ color: "#cdd6f4", fontSize: 14, lineHeight: 1.7 }}>
                Use <strong style={{ color: "#F5A623" }}>Data Menu Sort</strong> for quick, one-time permanent sorting → Use <strong style={{ color: "#4ade80" }}>SORT/SORTN formulas</strong> for dynamic auto-updating sorted views → Use <strong style={{ color: "#f87171" }}>Sort by Color</strong> when your data is color-coded for categories or priorities!
              </div>
            </div>
          </div>
        </div>

      </div>{/* end max-width container */}

      {/* ── Footer ── */}
      <footer style={{ background: "#1f2a3a", padding: "28px 32px 20px", marginTop: 20 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ color: "#cdd6f4", fontSize: 14 }}>
            © 2026 All rights reserved by <strong style={{ color: "#fff" }}>Data Explore</strong>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Follow Us</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              {/* Facebook */}
              <a href="https://www.facebook.com/profile.php?id=61587418725142" target="_blank" rel="noopener noreferrer" className="social-icon" style={{ background: "#2d3748", borderRadius: "50%", width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s", cursor: "pointer" }} title="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.026 4.438 11.02 10.125 11.927v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796v8.437C19.562 23.093 24 18.099 24 12.073z"/></svg>
              </a>
              {/* LinkedIn */}
              <a href="https://www.linkedin.com/in/prosenjitbappii/" target="_blank" rel="noopener noreferrer" className="social-icon" style={{ background: "#2d3748", borderRadius: "50%", width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s", cursor: "pointer" }} title="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              {/* YouTube */}
              <a href="https://www.youtube.com/@dataexplore_prosenjit" target="_blank" rel="noopener noreferrer" className="social-icon" style={{ background: "#2d3748", borderRadius: "50%", width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s", cursor: "pointer" }} title="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
              </a>
            </div>
          </div>
        </div>
        {/* Info button */}
        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-start" }}>
          <button title="About Data Explore" style={{ background: "#2d3748", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#94a3b8", fontSize: 14, fontStyle: "italic", fontWeight: 700 }}>i</button>
        </div>
      </footer>

      {/* ── Sheet Modal ── */}
      {modalOpen && <SheetModal onClose={() => setModalOpen(false)} sheets={sheetTabs} onDownload={handleDownload} />}

      {/* ── Toast ── */}
      {toast && <Toast message="Practice file downloaded successfully! Open in Google Sheets." onDone={() => setToast(false)} />}

    </div>
  );
}
