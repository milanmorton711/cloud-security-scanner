import { useEffect, useState } from "react";

const API = "http://localhost:8080/api";

const SEVERITIES = {
  CRITICAL: { label: "Critical", color: "var(--color-crit)", badge: "bg-crit/12 text-crit ring-crit/25" },
  HIGH: { label: "High", color: "var(--color-high)", badge: "bg-high/12 text-high ring-high/25" },
  MEDIUM: { label: "Medium", color: "var(--color-med)", badge: "bg-med/12 text-med ring-med/25" },
  LOW: { label: "Low", color: "var(--color-low)", badge: "bg-low/12 text-low ring-low/25" },
};

const COLUMNS = [
  { status: "NOT_STARTED", title: "Not started", action: "Start remediation", next: "IN_PROGRESS" },
  { status: "IN_PROGRESS", title: "In progress", action: "Mark resolved", next: "RESOLVED" },
  { status: "RESOLVED", title: "Resolved", action: "Reopen", next: "NOT_STARTED" },
];

const RESOURCE_NAMES = {
  S3_BUCKET: "S3 buckets",
  IAM_POLICY: "IAM policies",
  IAM_ROLE: "IAM roles",
  SECURITY_GROUP: "Security groups",
  EC2_INSTANCE: "EC2 instances",
  RDS_INSTANCE: "RDS instances",
  LAMBDA_FUNCTION: "Lambda functions",
  VPC: "VPCs",
};

const ORDER = Object.keys(SEVERITIES);
const bySeverity = (a, b) => ORDER.indexOf(a.severity) - ORDER.indexOf(b.severity);
const newestFirst = (scans) => [...scans].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
const formatDate = (value, options = { dateStyle: "medium", timeStyle: "short" }) =>
  value ? new Date(value).toLocaleString(undefined, options) : "";

async function request(path, method = "GET") {
  const response = await fetch(`${API}${path}`, { method });
  if (!response.ok) throw new Error(response.status);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function Stat({ label, value, tone = "text-ink", children }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-5">
      <div className="text-sm text-muted">{label}</div>
      <div className={`mt-2 text-3xl font-semibold tabular-nums ${tone}`}>{value}</div>
      {children}
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-xl border border-line bg-paper p-5">
      <h2 className="mb-5 text-sm font-medium text-muted">{title}</h2>
      {children}
    </section>
  );
}

function Donut({ findings }) {
  const total = findings.length;
  const slices = ORDER.map((key) => ({
    key,
    count: findings.filter((f) => f.severity === key).length,
  })).map((slice, i, all) => ({
    ...slice,
    percent: total ? (slice.count / total) * 100 : 0,
    offset: 25 - all.slice(0, i).reduce((sum, s) => sum + (total ? (s.count / total) * 100 : 0), 0),
  }));

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 42 42" className="h-36 w-36 shrink-0">
        <circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--color-line)" strokeWidth="5" />
        {slices
          .filter((s) => s.count > 0)
          .map((s) => (
            <circle
              key={s.key}
              cx="21"
              cy="21"
              r="15.9155"
              fill="none"
              stroke={SEVERITIES[s.key].color}
              strokeWidth="5"
              strokeDasharray={`${s.percent} ${100 - s.percent}`}
              strokeDashoffset={s.offset}
            />
          ))}
        <text x="21" y="22.5" textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--color-ink)">
          {total}
        </text>
        <text x="21" y="28" textAnchor="middle" fontSize="3.2" fill="var(--color-muted)">
          findings
        </text>
      </svg>
      <ul className="flex-1 space-y-2.5 text-sm">
        {slices.map((s) => (
          <li key={s.key} className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: SEVERITIES[s.key].color }} />
              {SEVERITIES[s.key].label}
            </span>
            <span className="tabular-nums text-muted">{s.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResourceBars({ findings }) {
  const counts = Object.entries(
    findings.reduce((acc, f) => ({ ...acc, [f.resourceType]: (acc[f.resourceType] ?? 0) + 1 }), {})
  ).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...counts.map(([, count]) => count));

  if (counts.length === 0) return <p className="text-sm text-muted">No findings in this scan.</p>;

  return (
    <ul className="space-y-4">
      {counts.map(([type, count]) => (
        <li key={type}>
          <div className="mb-1.5 flex justify-between text-sm">
            <span>{RESOURCE_NAMES[type] ?? type}</span>
            <span className="tabular-nums text-muted">{count}</span>
          </div>
          <div className="h-2 rounded-full bg-line">
            <div className="h-2 rounded-full bg-accent" style={{ width: `${(count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Trend({ scans }) {
  const recent = [...scans].reverse().slice(-12);
  const max = Math.max(1, ...recent.map((s) => s.totalFindings));

  if (recent.length < 2) return <p className="text-sm text-muted">Run a few more scans to see the trend.</p>;

  return (
    <div>
      <div className="flex h-36 items-end justify-around gap-1.5">
        {recent.map((scan) => (
          <div
            key={scan.id}
            title={`${formatDate(scan.startedAt)}: ${scan.totalFindings} findings`}
            className="flex max-w-10 flex-1 flex-col-reverse overflow-hidden rounded bg-line"
            style={{ height: `${Math.max(4, (scan.totalFindings / max) * 100)}%` }}
          >
            {ORDER.map((key) => (
              <div key={key} style={{ flexGrow: scan[key.toLowerCase()] ?? 0, background: SEVERITIES[key].color }} />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>{formatDate(recent[0].startedAt, { dateStyle: "short" })}</span>
        <span>{formatDate(recent.at(-1).startedAt, { dateStyle: "short" })}</span>
      </div>
    </div>
  );
}

function Card({ finding, column, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const severity = SEVERITIES[finding.severity] ?? SEVERITIES.LOW;

  return (
    <article
      className={`rounded-lg border border-line bg-paper p-4 transition-colors hover:border-muted/40 ${
        column.status === "RESOLVED" ? "opacity-60" : ""
      }`}
    >
      <button onClick={() => setOpen(!open)} className="w-full text-left">
        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${severity.badge}`}>
          {severity.label}
        </span>
        <h4 className="mt-2.5 font-medium leading-snug">{finding.title}</h4>
        <p className="mt-1 truncate font-mono text-xs text-muted">{finding.resourceId}</p>
      </button>

      {open && (
        <div className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
          <p className="text-ink/85">{finding.description}</p>
          <div className="rounded-md bg-accent/[0.07] p-3">
            <div className="text-xs font-semibold text-accent">How to fix it</div>
            <p className="mt-1 text-ink/85">{finding.remediation}</p>
          </div>
          <button
            onClick={() => onStatusChange(finding.id, column.next)}
            className="w-full rounded-md bg-accent py-2 font-medium text-on-accent hover:bg-accent-strong"
          >
            {column.action}
          </button>
        </div>
      )}
    </article>
  );
}

function Board({ findings, onStatusChange }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {COLUMNS.map((column) => {
        const items = findings.filter((f) => f.status === column.status).sort(bySeverity);

        return (
          <div key={column.status} className="rounded-xl border border-line bg-sidebar/60 p-3">
            <h3 className="mb-3 flex items-center justify-between px-1 text-sm font-medium">
              {column.title}
              <span className="rounded-full bg-ink/[0.07] px-2 py-0.5 text-xs text-muted">{items.length}</span>
            </h3>
            <div className="space-y-2.5">
              {items.map((finding) => (
                <Card key={finding.id} finding={finding} column={column} onStatusChange={onStatusChange} />
              ))}
              {items.length === 0 && <p className="py-8 text-center text-xs text-muted">Nothing here</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Dashboard({ scan, scans, onStatusChange }) {
  const findings = scan.findings ?? [];
  const resolved = findings.filter((f) => f.status === "RESOLVED").length;
  const open = findings.length - resolved;
  const criticalOpen = findings.filter((f) => f.severity === "CRITICAL" && f.status !== "RESOLVED").length;
  const progress = findings.length ? Math.round((resolved / findings.length) * 100) : 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total findings" value={findings.length} />
        <Stat label="Open" value={open} tone={open ? "text-high" : "text-ink"} />
        <Stat label="Critical still open" value={criticalOpen} tone={criticalOpen ? "text-crit" : "text-ink"} />
        <Stat label="Remediated" value={`${progress}%`} tone="text-accent">
          <div className="mt-3 h-1.5 rounded-full bg-line">
            <div className="h-1.5 rounded-full bg-accent" style={{ width: `${progress}%` }} />
          </div>
        </Stat>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Severity breakdown">
          <Donut findings={findings} />
        </Panel>
        <Panel title="Findings by resource">
          <ResourceBars findings={findings} />
        </Panel>
        <Panel title="Findings per scan">
          <Trend scans={scans} />
        </Panel>
      </div>

      <Board findings={findings} onStatusChange={onStatusChange} />
    </div>
  );
}

function History({ scans, onOpen, onDelete }) {
  if (scans.length === 0) return <p className="text-sm text-muted">No saved scans yet.</p>;

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-paper">
      {scans.map((scan) => (
        <li key={scan.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
          <div className="min-w-0 basis-full sm:basis-0 sm:flex-1">
            <div className="font-medium">{formatDate(scan.startedAt)}</div>
            <div className="truncate font-mono text-[11px] text-muted">{scan.id}</div>
          </div>
          <div className="flex h-2 w-32 overflow-hidden rounded-full bg-line">
            {ORDER.map((key) => (
              <div key={key} style={{ flexGrow: scan[key.toLowerCase()] ?? 0, background: SEVERITIES[key].color }} />
            ))}
          </div>
          <span className="w-24 text-sm text-muted">{scan.totalFindings} findings</span>
          <button
            onClick={() => onOpen(scan.id)}
            className="ml-auto rounded-md bg-accent px-3.5 py-1.5 text-[13px] font-medium text-on-accent hover:bg-accent-strong"
          >
            Open
          </button>
          <button
            onClick={() => onDelete(scan.id)}
            className="rounded-md border border-line px-3 py-1.5 text-[13px] text-muted hover:text-crit"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [scans, setScans] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    request("/scans")
      .then((data) => setScans(newestFirst(data)))
      .catch(() => setError("Could not reach the backend on port 8080."));
  }, []);

  const scan = scans.find((s) => s.id === selectedId) ?? scans[0];

  async function runScan() {
    setLoading(true);
    setError("");
    try {
      await request("/scan");
      setScans(newestFirst(await request("/scans")));
      setSelectedId(null);
      setPage("dashboard");
    } catch {
      setError("The scan failed. Check that the backend is running on port 8080.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      const updated = await request(`/findings/${id}/status?status=${status}`, "PATCH");
      setScans((current) =>
        current.map((s) => ({ ...s, findings: s.findings.map((f) => (f.id === id ? updated : f)) }))
      );
    } catch {
      setError("Could not update the finding.");
    }
  }

  async function deleteScan(id) {
    if (!window.confirm("Delete this scan?")) return;
    try {
      await request(`/scans/${id}`, "DELETE");
      setScans((current) => current.filter((s) => s.id !== id));
    } catch {
      setError("Could not delete the scan.");
    }
  }

  function openScan(id) {
    setSelectedId(id);
    setPage("dashboard");
  }

  const tab = (id, text) => (
    <button
      onClick={() => setPage(id)}
      className={`border-b-2 px-1 text-sm font-medium ${
        page === id ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
      }`}
    >
      {text}
    </button>
  );

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-sidebar">
        <div className="mx-auto flex h-16 max-w-7xl items-stretch gap-6 px-4 sm:px-6">
          <div className="flex items-center gap-2.5 font-semibold">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Cloud Security Scanner</span>
          </div>
          <nav className="flex gap-5">
            {tab("dashboard", "Dashboard")}
            {tab("history", "History")}
          </nav>
          <div className="ml-auto flex items-center">
            <button
              onClick={runScan}
              disabled={loading}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent hover:bg-accent-strong disabled:opacity-70"
            >
              {loading ? "Scanning..." : "Run scan"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {error && (
          <div className="mb-6 rounded-lg border border-crit/30 bg-crit/[0.06] px-4 py-3 text-sm text-crit">{error}</div>
        )}

        {page === "history" ? (
          <>
            <h1 className="mb-6 text-2xl font-semibold">Scan history</h1>
            <History scans={scans} onOpen={openScan} onDelete={deleteScan} />
          </>
        ) : scan ? (
          <>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold">Security overview</h1>
                <p className="mt-1 text-sm text-muted">Results from the scan on {formatDate(scan.startedAt)}</p>
              </div>
              {selectedId && selectedId !== scans[0]?.id && (
                <button onClick={() => setSelectedId(null)} className="text-sm font-medium text-accent hover:underline">
                  Back to latest scan
                </button>
              )}
            </div>
            <Dashboard scan={scan} scans={scans} onStatusChange={updateStatus} />
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-line px-6 py-20 text-center">
            <h1 className="text-lg font-semibold">No scans yet</h1>
            <p className="mt-1 text-sm text-muted">Press Run scan to check your cloud resources.</p>
          </div>
        )}
      </main>
    </div>
  );
}