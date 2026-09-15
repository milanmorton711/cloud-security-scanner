import { useEffect, useState } from "react";

const API = "http://localhost:8080/api";

function App() {
  const [page, setPage] = useState("scan");
  const [scan, setScan] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  async function runScan() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/scan`);

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      setScan(data);
    } catch {
      setError("Could not connect to the scanner backend.");
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    setHistoryLoading(true);

    try {
      const response = await fetch(`${API}/scans`);

      if (!response.ok) {
        throw new Error();
      }

      setHistory(await response.json());
    } catch {
      setError("Could not load scan history.");
    } finally {
      setHistoryLoading(false);
    }
  }

  async function deleteScan(id) {
    if (!window.confirm("Delete this scan?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/scans/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error();
      }

      setHistory((current) =>
        current.filter((scan) => scan.id !== id)
      );

      if (selectedScan?.id === id) {
        setSelectedScan(null);
      }
    } catch {
      setError("Could not delete the scan.");
    }
  }

  async function updateFindingStatus(id, status) {
    try {
      const response = await fetch(
        `${API}/findings/${id}/status?status=${status}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      const updatedFinding = await response.json();

      if (selectedScan) {
        setSelectedScan((current) => ({
          ...current,
          findings: current.findings.map((finding) =>
            finding.id === id ? updatedFinding : finding
          ),
        }));
      }

      if (scan) {
        setScan((current) => ({
          ...current,
          findings: current.findings.map((finding) =>
            finding.id === id ? updatedFinding : finding
          ),
        }));
      }
    } catch {
      setError("Could not update finding status.");
    }
  }

  useEffect(() => {
    if (page === "history") {
      loadHistory();
    }
  }, [page]);

  return (
    <div className="min-h-screen bg-[#080a0f] text-zinc-100">

      <header className="border-b border-white/[0.07] bg-[#080a0f]/95">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">

          <button
            onClick={() => {
              setPage("scan");
              setSelectedScan(null);
            }}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xs font-bold">
              CS
            </div>

            <div className="text-left">
              <div className="text-sm font-semibold">
                Cloud Security Scanner
              </div>

              <div className="text-[11px] text-zinc-500">
                Security assessment platform
              </div>
            </div>
          </button>

          <div className="flex rounded-xl border border-white/[0.07] bg-white/[0.025] p-1">

            <button
              onClick={() => {
                setPage("scan");
                setSelectedScan(null);
              }}
              className={`rounded-lg px-5 py-2 text-xs font-medium ${
                page === "scan"
                  ? "bg-white text-black"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              Scan
            </button>

            <button
              onClick={() => {
                setPage("history");
                setSelectedScan(null);
                loadHistory();
              }}
              className={`rounded-lg px-5 py-2 text-xs font-medium ${
                page === "history"
                  ? "bg-white text-black"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              History
            </button>

          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {selectedScan ? (
          <ScanDetails
            scan={selectedScan}
            onBack={() => setSelectedScan(null)}
            onStatusChange={updateFindingStatus}
          />
        ) : page === "scan" ? (
          <ScanPage
            scan={scan}
            loading={loading}
            runScan={runScan}
            onStatusChange={updateFindingStatus}
          />
        ) : (
          <HistoryPage
            history={history}
            loading={historyLoading}
            openScan={setSelectedScan}
            deleteScan={deleteScan}
          />
        )}

      </main>
    </div>
  );
}

function ScanPage({ scan, loading, runScan, onStatusChange }) {
  return (
    <div className="space-y-8">

      <section className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-8 sm:p-10">

        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">

          <div>
            <div className="mb-3 text-[10px] font-bold tracking-[0.2em] text-zinc-500">
              SECURITY ASSESSMENT
            </div>

            <h2 className="text-3xl font-semibold tracking-tight">
              Scan your cloud environment
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
              Identify misconfigurations, excessive permissions,
              and publicly exposed resources.
            </p>
          </div>

          <button
            onClick={runScan}
            disabled={loading}
            className="group flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-zinc-200 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Scanning..." : "Run Security Scan"}

            {!loading && (
              <span className="text-lg transition-transform group-hover:translate-x-1">
                →
              </span>
            )}
          </button>

        </div>
      </section>

      {!scan && !loading && (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-white/[0.08]">
          <h3 className="text-sm font-semibold">
            No scan results yet
          </h3>

          <p className="mt-2 text-xs text-zinc-600">
            Run a scan to analyze your cloud resources.
          </p>
        </div>
      )}

      {scan && (
        <>
          <Summary scan={scan} />

          <section>
            <div className="mb-5">
              <div className="mb-2 text-[10px] font-bold tracking-[0.2em] text-zinc-500">
                LATEST SCAN
              </div>

              <h3 className="text-xl font-semibold">
                Security Findings
              </h3>
            </div>

            <Findings
              findings={scan.findings}
              onStatusChange={onStatusChange}
            />
          </section>
        </>
      )}
    </div>
  );
}

function HistoryPage({
  history,
  loading,
  openScan,
  deleteScan,
}) {
  return (
    <div>

      <section className="mb-8">
        <div className="mb-2 text-[10px] font-bold tracking-[0.2em] text-zinc-500">
          SCANS
        </div>

        <h2 className="text-3xl font-semibold tracking-tight">
          Scan History
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Review previous security assessments.
        </p>
      </section>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-3xl border border-white/[0.07] text-sm text-zinc-500">
          Loading scan history...
        </div>
      ) : history.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-white/[0.08]">
          <h3 className="text-sm font-semibold">
            No scans found
          </h3>
        </div>
      ) : (
        <div className="space-y-4">

          {[...history].reverse().map((item, index) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5 transition hover:border-white/[0.13]"
            >

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-xs font-bold text-zinc-500">
                    #{history.length - index}
                  </div>

                  <div>
                    <div className="text-sm font-semibold">
                      Security Scan
                    </div>

                    <div className="mt-1 font-mono text-[10px] text-zinc-600">
                      {item.id}
                    </div>

                    <div className="mt-1 text-xs text-zinc-500">
                      {item.startedAt
                        ? new Date(item.startedAt).toLocaleString()
                        : "Unknown"}
                    </div>
                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-3">

                  <div className="rounded-xl border border-white/[0.06] bg-black/10 px-4 py-2.5 text-center">
                    <div className="text-sm font-semibold text-zinc-200">
                      {item.totalFindings}
                    </div>

                    <div className="text-[9px] uppercase tracking-wider text-zinc-600">
                      Findings
                    </div>
                  </div>

                  <button
                    onClick={() => openScan(item)}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-zinc-200 transition hover:bg-white/[0.08]"
                  >
                    View Scan →
                  </button>

                  <button
                    onClick={() => deleteScan(item.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/10 bg-red-500/[0.03] text-lg text-zinc-600 transition hover:border-red-500/25 hover:bg-red-500/[0.08] hover:text-red-400"
                    title="Delete scan"
                  >
                    ×
                  </button>

                </div>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}

function ScanDetails({ scan, onBack, onStatusChange }) {
  return (
    <div>

      <button
        onClick={onBack}
        className="mb-8 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-2.5 text-xs text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
      >
        ← Back to History
      </button>

      <section className="mb-8">
        <div className="mb-2 text-[10px] font-bold tracking-[0.2em] text-zinc-500">
          SCAN DETAILS
        </div>

        <h2 className="text-3xl font-semibold tracking-tight">
          Security Findings
        </h2>

        <p className="mt-2 text-xs text-zinc-600">
          {scan.startedAt
            ? new Date(scan.startedAt).toLocaleString()
            : ""}
        </p>
      </section>

      <Summary scan={scan} />

      <section className="mt-10">
        <Findings
          findings={scan.findings}
          onStatusChange={onStatusChange}
        />
      </section>
    </div>
  );
}

function Summary({ scan }) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">

      <SummaryCard
        label="Critical"
        value={scan.critical}
        color="text-red-400"
      />

      <SummaryCard
        label="High"
        value={scan.high}
        color="text-orange-400"
      />

      <SummaryCard
        label="Medium"
        value={scan.medium}
        color="text-yellow-400"
      />

      <SummaryCard
        label="Total Findings"
        value={scan.totalFindings}
        color="text-zinc-100"
      />

    </section>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5">
      <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-600">
        {label}
      </div>

      <div className={`mt-3 text-3xl font-semibold ${color}`}>
        {value}
      </div>
    </div>
  );
}

function Findings({ findings, onStatusChange }) {
  return (
    <div className="space-y-3">

      {findings.map((finding) => (
        <div
          key={finding.id}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5"
        >

          <div className="flex gap-4">

            <SeverityBadge severity={finding.severity} />

            <div className="min-w-0 flex-1">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                <div>
                  <h4 className="text-sm font-semibold">
                    {finding.title}
                  </h4>

                  <div className="mt-1 font-mono text-[10px] text-zinc-600">
                    {finding.resourceType} · {finding.resourceId}
                  </div>
                </div>

                <FindingStatus status={finding.status} />

              </div>

              <p className="mt-4 text-xs leading-5 text-zinc-500">
                {finding.description}
              </p>

              <div className="mt-4 rounded-xl border border-white/[0.05] bg-black/10 p-4">

                <div className="text-[9px] font-bold tracking-[0.15em] text-zinc-600">
                  REMEDIATION
                </div>

                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  {finding.remediation}
                </p>

              </div>

              <div className="mt-4 flex flex-wrap gap-2">

                {finding.status === "NOT_STARTED" && (
                  <button
                    onClick={() =>
                      onStatusChange(
                        finding.id,
                        "IN_PROGRESS"
                      )
                    }
                    className="rounded-xl border border-blue-500/20 bg-blue-500/[0.06] px-3 py-2 text-[10px] font-semibold text-blue-400 transition hover:bg-blue-500/[0.12]"
                  >
                    Start Remediation
                  </button>
                )}

                {finding.status === "IN_PROGRESS" && (
                  <button
                    onClick={() =>
                      onStatusChange(
                        finding.id,
                        "RESOLVED"
                      )
                    }
                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2 text-[10px] font-semibold text-emerald-400 transition hover:bg-emerald-500/[0.12]"
                  >
                    Mark Resolved
                  </button>
                )}

                {finding.status === "RESOLVED" && (
                  <button
                    onClick={() =>
                      onStatusChange(
                        finding.id,
                        "NOT_STARTED"
                      )
                    }
                    className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[10px] font-semibold text-zinc-400 transition hover:bg-white/[0.07]"
                  >
                    Reopen
                  </button>
                )}

              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FindingStatus({ status }) {
  const styles = {
    NOT_STARTED:
      "border-zinc-500/20 bg-zinc-500/[0.06] text-zinc-400",

    IN_PROGRESS:
      "border-blue-500/20 bg-blue-500/[0.06] text-blue-400",

    RESOLVED:
      "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400",
  };

  const labels = {
    NOT_STARTED: "Not Started",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
  };

  return (
    <div
      className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-[9px] font-bold uppercase tracking-wider ${
        styles[status] || styles.NOT_STARTED
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status] || "Not Started"}
    </div>
  );
}

function SeverityBadge({ severity }) {
  const styles = {
    CRITICAL:
      "border-red-500/20 bg-red-500/[0.08] text-red-400",
    HIGH:
      "border-orange-500/20 bg-orange-500/[0.08] text-orange-400",
    MEDIUM:
      "border-yellow-500/20 bg-yellow-500/[0.08] text-yellow-400",
    LOW:
      "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400",
    INFO:
      "border-blue-500/20 bg-blue-500/[0.08] text-blue-400",
  };

  return (
    <div
      className={`h-fit shrink-0 rounded-lg border px-2.5 py-1.5 text-[9px] font-bold tracking-wider ${
        styles[severity] || styles.INFO
      }`}
    >
      {severity}
    </div>
  );
}

export default App;