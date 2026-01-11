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
import { FaChartLine, FaBook, FaFileInvoice } from "react-icons/fa";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const FinanceDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [summary, setSummary] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => { fetchSummary(); }, []);

    const fetchSummary = async () => {
        try {
            const res = await axios.get("/finance/summary");
            setSummary(res.data);
        } catch (err) {
            console.error("Failed to fetch financial summary");
        }
    };

    if (!summary) {
        return (
            <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-terracotta-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-charcoal-500 dark:text-charcoal-400">Loading Financial Data...</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <FaChartLine /> },
        { id: 'journal', label: 'Journal Entry', icon: <FaBook /> },
        { id: 'ledger', label: 'General Ledger', icon: <FaFileInvoice /> },
    ];

    const chartData = {
        labels: ["Revenue", "Expenses", "Net Income"],
        datasets: [{
            label: "Financial Overview",
            data: [summary.revenue, summary.expenses, summary.netIncome],
            backgroundColor: ["#7C9A82", "#C67C4E", "#3B82F6"],
            borderColor: ["#5a7a60", "#a65c2e", "#2563EB"],
            borderWidth: 2,
        }],
    };

    const doughnutData = {
        labels: ["Assets", "Liabilities", "Equity"],
        datasets: [{
            data: [summary.assets, summary.liabilities, summary.equity],
            backgroundColor: ["#7C9A82", "#D4A574", "#6366F1"],
        }],
    };

    return (
        <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 transition-colors duration-300">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="lg:ml-64 min-h-screen flex flex-col transition-all duration-300">
                <Topbar onMenuClick={() => setSidebarOpen(true)} title="Finance" />
                <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
                    {/* Header with Tabs */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-charcoal-800 dark:text-white">Financial Analysis</h1>
                            <p className="text-charcoal-500 dark:text-charcoal-400 text-sm mt-1">Track revenue, expenses, and financial health</p>
                        </div>
                        <div className="flex bg-white dark:bg-charcoal-800 rounded-xl p-1 border border-cream-200 dark:border-charcoal-700">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === tab.id ? 'bg-terracotta-500 text-white' : 'text-charcoal-600 dark:text-charcoal-400 hover:bg-cream-100 dark:hover:bg-charcoal-700'}`}>
                                    {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeTab === "overview" && (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-sage-500 to-sage-600 rounded-2xl p-6 text-white shadow-lg">
                                    <h3 className="text-sage-100 font-medium text-sm uppercase tracking-wider">Total Revenue</h3>
                                    <p className="text-3xl font-bold mt-2">RWF {summary.revenue?.toLocaleString() || 0}</p>
                                </div>
                                <div className="bg-gradient-to-br from-terracotta-500 to-terracotta-600 rounded-2xl p-6 text-white shadow-lg">
                                    <h3 className="text-terracotta-100 font-medium text-sm uppercase tracking-wider">Total Expenses</h3>
                                    <p className="text-3xl font-bold mt-2">RWF {summary.expenses?.toLocaleString() || 0}</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                                    <h3 className="text-blue-100 font-medium text-sm uppercase tracking-wider">Net Income</h3>
                                    <p className="text-3xl font-bold mt-2">RWF {summary.netIncome?.toLocaleString() || 0}</p>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-charcoal-800 rounded-2xl border border-cream-200 dark:border-charcoal-700 p-6">
                                    <h3 className="text-lg font-bold text-charcoal-800 dark:text-white mb-4">Financial Performance</h3>
                                    <div className="h-64">
                                        <Line data={chartData} options={{ maintainAspectRatio: false, responsive: true, plugins: { legend: { labels: { color: '#6b7280' } } }, scales: { x: { ticks: { color: '#6b7280' } }, y: { ticks: { color: '#6b7280' } } } }} />
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-charcoal-800 rounded-2xl border border-cream-200 dark:border-charcoal-700 p-6">
                                    <h3 className="text-lg font-bold text-charcoal-800 dark:text-white mb-4">Asset Distribution</h3>
                                    <div className="h-64 flex items-center justify-center">
                                        <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#6b7280' } } } }} />
                                    </div>
                                </div>
                            </div>

                            {/* Balance Sheet Preview */}
                            <div className="mt-6 bg-white dark:bg-charcoal-800 rounded-2xl border border-cream-200 dark:border-charcoal-700 p-6">
                                <h3 className="text-lg font-bold text-charcoal-800 dark:text-white mb-4">Balance Sheet Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-sage-50 dark:bg-sage-900/20 rounded-xl">
                                        <p className="text-sm text-sage-600 dark:text-sage-400 font-medium">Total Assets</p>
                                        <p className="text-2xl font-bold text-sage-700 dark:text-sage-300 mt-1">RWF {summary.assets?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="p-4 bg-sand-50 dark:bg-sand-900/20 rounded-xl">
                                        <p className="text-sm text-sand-600 dark:text-sand-400 font-medium">Total Liabilities</p>
                                        <p className="text-2xl font-bold text-sand-700 dark:text-sand-300 mt-1">RWF {summary.liabilities?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                        <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Owner's Equity</p>
                                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">RWF {summary.equity?.toLocaleString() || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "journal" && (
                        <div className="bg-white dark:bg-charcoal-800 rounded-2xl border border-cream-200 dark:border-charcoal-700 p-6">
                            <JournalEntryForm onSuccess={fetchSummary} />
                        </div>
                    )}

                    {activeTab === "ledger" && (
                        <div className="bg-white dark:bg-charcoal-800 rounded-2xl border border-cream-200 dark:border-charcoal-700 p-6">
                            <LedgerView />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default FinanceDashboard;
