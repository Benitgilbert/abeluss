import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import { Line, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";
import JournalEntryForm from "../../components/finance/JournalEntryForm";
import LedgerView from "../../components/finance/LedgerView";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import "./FinanceDashboard.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const FinanceDashboard = () => {
    // ... logic remains same ...
    const [summary, setSummary] = useState(null);
    const [activeTab, setActiveTab] = useState("overview"); // overview, journal, ledger

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const res = await axios.get("/finance/summary");
            setSummary(res.data);
        } catch (err) {
            console.error("Failed to fetch financial summary");
        }
    };

    if (!summary) return <div className="p-6">Loading Financial Data...</div>;

    const chartData = {
        labels: ["Revenue", "Expenses", "Net Income"],
        datasets: [
            {
                label: "Financial Overview",
                data: [summary.revenue, summary.expenses, summary.netIncome],
                backgroundColor: ["#10B981", "#EF4444", "#3B82F6"],
                borderColor: ["#059669", "#DC2626", "#2563EB"],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="finance-layout">
            <Sidebar />
            <div className="finance-main">
                <Topbar />
                <div className="finance-content">
                    <div className="finance-header-row">
                        <h1 className="finance-title">Financial Analysis</h1>
                        <div className="finance-tabs">
                            <button
                                onClick={() => setActiveTab("overview")}
                                className={`tab-btn ${activeTab === "overview" ? "active" : "inactive"}`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab("journal")}
                                className={`tab-btn ${activeTab === "journal" ? "active" : "inactive"}`}
                            >
                                Journal Entry
                            </button>
                            <button
                                onClick={() => setActiveTab("ledger")}
                                className={`tab-btn ${activeTab === "ledger" ? "active" : "inactive"}`}
                            >
                                General Ledger
                            </button>
                        </div>
                    </div>

                    {activeTab === "overview" && (
                        <>
                            <div className="overview-grid">
                                {/* Summary Cards */}
                                <div className="summary-card revenue">
                                    <h3 className="card-label">Total Revenue</h3>
                                    <p className="card-value">
                                        RWF {summary.revenue.toLocaleString()}
                                    </p>
                                </div>
                                <div className="summary-card expenses">
                                    <h3 className="card-label">Total Expenses</h3>
                                    <p className="card-value">
                                        RWF {summary.expenses.toLocaleString()}
                                    </p>
                                </div>
                                <div className="summary-card net-income">
                                    <h3 className="card-label">Net Income</h3>
                                    <p className="card-value">
                                        RWF {summary.netIncome.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="charts-grid">
                                <div className="chart-card">
                                    <h3 className="chart-title">Financial Performance</h3>
                                    <div className="chart-container">
                                        <Line
                                            data={chartData}
                                            options={{ maintainAspectRatio: false, responsive: true }}
                                        />
                                    </div>
                                </div>
                                <div className="chart-card">
                                    <h3 className="chart-title">Asset Distribution</h3>
                                    <div className="doughnut-container">
                                        <Doughnut
                                            data={{
                                                labels: ["Assets", "Liabilities", "Equity"],
                                                datasets: [
                                                    {
                                                        data: [summary.assets, summary.liabilities, summary.equity],
                                                        backgroundColor: ["#10B981", "#F59E0B", "#6366F1"],
                                                    },
                                                ],
                                            }}
                                            options={{ maintainAspectRatio: false }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "journal" && <JournalEntryForm onSuccess={fetchSummary} />}
                    {activeTab === "ledger" && <LedgerView />}
                </div>
            </div>
        </div>
    );
};


export default FinanceDashboard;
