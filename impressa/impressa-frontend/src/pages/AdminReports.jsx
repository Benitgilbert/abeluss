import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../utils/axiosInstance";
import "./AdminReports.css";

function AdminReports() {
  const [type, setType] = useState("monthly");
  const [format, setFormat] = useState("pdf");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await api.get("/orders/report/logs", { params: { page: 1, limit: 20 } });
      setLogs(res.data?.logs || []);
    } catch (err) {
      console.error("Failed to load report logs:", err?.response?.data || err.message);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      // Build params mapping for backend expectations
      const paramsObj = { type, format };
      if (type === "monthly") {
        const now = new Date();
        const month = (now.getMonth() + 1).toString();
        const year = now.getFullYear().toString();
        paramsObj.month = month;
        paramsObj.year = year;
      } else if (type === "daily") {
        paramsObj.date = (from || new Date().toISOString().slice(0, 10));
      } else if (type === "custom-range" || type === "revenue" || type === "customer-analytics") {
        if (from) paramsObj.start = from;
        if (to) paramsObj.end = to;
      } else if (from) {
        // generic filters
        paramsObj.from = from;
        if (to) paramsObj.to = to;
      }

      if (format === "pdf") {
        // Open PDF inline
        const params = new URLSearchParams(paramsObj);
        const url = `${api.defaults.baseURL.replace(/\/$/, "")}/orders/report?${params.toString()}`;
        const token = localStorage.getItem("authToken");

        // Fetch PDF as blob with auth
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to generate PDF");
          } else {
            throw new Error(`Failed to generate PDF (Status: ${res.status})`);
          }
        }

        // Open PDF in new window
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const w = window.open(blobUrl, "_blank");
        if (!w) {
          // Fallback if popup blocked
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${type}-report.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // CSV download
        const res = await api.get("/orders/report", {
          params: paramsObj,
          responseType: "blob",
        });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${type}-report.csv`);
        document.body.appendChild(link);
        link.click();
      }
      setMessage("✅ Report generated");
      fetchLogs();
    } catch (err) {
      console.error("Report generation failed:", err);
      const errorMsg = err.response?.data?.message || err.message || "Unknown error";
      setMessage(`❌ Failed to generate report: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadLogsCsv = async () => {
    try {
      const res = await api.get("/orders/report/logs", { params: { format: "csv" }, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "report-logs.csv");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Logs CSV download failed:", err);
    }
  };

  return (
    <div className="reports-layout">
      <Sidebar />
      <div className="reports-main">
        <Topbar />
        <main className="reports-content">
          <div className="reports-card">
            <div className="reports-header-row">
              <div className="reports-title">
                <h2>Reports</h2>
                <p>Generate PDF/CSV and view history.</p>
              </div>
              <button onClick={downloadLogsCsv} className="btn-download-logs">Download Logs CSV</button>
            </div>

            {message && (
              <div className={`report-message ${message.startsWith("✅") ? "success" : "error"}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleGenerate} className="reports-form">
              <div className="form-group">
                <label>Report Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="form-select">
                  <option value="monthly">Monthly</option>
                  <option value="daily">Daily</option>
                  <option value="custom-range">Custom Range</option>
                  <option value="customer">By Customer</option>
                  <option value="customer-analytics">Customer Analytics (Acquisition/Retention)</option>
                  <option value="status">By Status</option>
                  <option value="revenue">Revenue</option>
                </select>
              </div>
              <div className="form-group">
                <label>Format</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)} className="form-select">
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div className="form-group">
                <label>From</label>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="form-input" />
              </div>
              <div className="form-group">
                <label>To</label>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="form-input" />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading} className="btn-generate">
                  {loading ? "Generating…" : "Generate Report"}
                </button>
              </div>
            </form>

            <div className="logs-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Type</th>
                    <th>Format</th>
                    <th>Generated By</th>
                    <th>AI Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {logsLoading && (
                    <tr><td colSpan={5} className="state-loading">Loading logs…</td></tr>
                  )}
                  {!logsLoading && logs.length === 0 && (
                    <tr><td colSpan={5} className="state-empty">No report logs yet.</td></tr>
                  )}
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td className="log-date">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="log-type">{log.type}</td>
                      <td><span className="log-format">{log.format}</span></td>
                      <td>
                        {log.generatedBy?.name}
                        {log.generatedBy?.email && <div className="log-user-email">({log.generatedBy.email})</div>}
                      </td>
                      <td>
                        <div className="log-summary" title={log.aiSummary}>{log.aiSummary}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminReports;


