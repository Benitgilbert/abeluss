import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import { FaUserPlus, FaFileInvoiceDollar, FaCheck, FaTimes, FaMoneyBillWave, FaPrint } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

const AdminAbonne = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showFicheModal, setShowFicheModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);

    const [newClient, setNewClient] = useState({ name: "", phone: "", email: "" });
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientFiche, setClientFiche] = useState([]);
    const [payAmount, setPayAmount] = useState("");

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await axios.get("/abonnes");
            if (res.data.success) {
                setClients(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch abonnes", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClient = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/abonnes", newClient);
            if (res.data.success) {
                setClients([...clients, res.data.data].sort((a, b) => a.name.localeCompare(b.name)));
                setShowAddModal(false);
                setNewClient({ name: "", phone: "", email: "" });
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add client");
        }
    };

    const handleViewFiche = async (client) => {
        setSelectedClient(client);
        try {
            const res = await axios.get(`/abonnes/${client._id}/fiche`);
            if (res.data.success) {
                setClientFiche(res.data.transactions);
                setShowFicheModal(true);
            }
        } catch (err) {
            alert("Failed to load fiche");
        }
    };

    const handlePayDebt = async (e) => {
        e.preventDefault();
        if (!payAmount || isNaN(payAmount) || payAmount <= 0) return alert("Enter a valid amount");

        try {
            const res = await axios.post(`/abonnes/${selectedClient._id}/pay`, { amount: Number(payAmount) });
            if (res.data.success) {
                // Update client in list
                setClients(clients.map(c => c._id === selectedClient._id ? res.data.data : c));
                setShowPayModal(false);
                setPayAmount("");
                alert("Payment recorded successfully!");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to record payment");
        }
    };

    const printFiche = () => {
        const printContent = document.getElementById("fiche-print-area").innerHTML;
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); // Reload to restore React state bindings
    };

    return (
        <div className="flex h-screen bg-cream-50 dark:bg-charcoal-900 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
                <Topbar />
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-charcoal-900 dark:text-white">Clients Abonnés</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage regular clients and their tabs</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-terracotta-500/30"
                        >
                            <FaUserPlus /> New Client
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-gray-500 font-bold">Loading clients...</div>
                    ) : (
                        <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-sm border border-gray-100 dark:border-charcoal-700 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-charcoal-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                                        <th className="p-4 font-bold">Client Name</th>
                                        <th className="p-4 font-bold">Contact</th>
                                        <th className="p-4 font-bold">Total Debt (RWF)</th>
                                        <th className="p-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-charcoal-700">
                                    {clients.map(client => (
                                        <tr key={client._id} className="hover:bg-gray-50 dark:hover:bg-charcoal-700/30 transition-colors">
                                            <td className="p-4 font-bold text-charcoal-900 dark:text-white">{client.name}</td>
                                            <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">
                                                {client.phone || client.email || "N/A"}
                                            </td>
                                            <td className="p-4">
                                                <span className={\`font-black \${client.totalDebt > 0 ? 'text-red-500' : 'text-green-500'}\`}>
                                                    {client.totalDebt.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-3">
                                                <button
                                                    onClick={() => {
                                                        setSelectedClient(client);
                                                        setShowPayModal(true);
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-bold hover:bg-green-200 transition-colors"
                                                    title="Record Payment"
                                                >
                                                    <FaMoneyBillWave /> Pay
                                                </button>
                                                <button
                                                    onClick={() => handleViewFiche(client)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-200 transition-colors"
                                                    title="View Fiche"
                                                >
                                                    <FaFileInvoiceDollar /> Fiche
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {clients.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-gray-500 font-medium">No abonné clients found. Add one to get started!</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-charcoal-800 rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-2xl font-black mb-4 text-charcoal-900 dark:text-white">Add Client Abonné</h2>
                        <form onSubmit={handleAddClient} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-charcoal-700 border border-gray-200 dark:border-charcoal-600 rounded-xl outline-none focus:border-terracotta-500 dark:text-white"
                                    value={newClient.name}
                                    onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-charcoal-700 border border-gray-200 dark:border-charcoal-600 rounded-xl outline-none focus:border-terracotta-500 dark:text-white"
                                    value={newClient.phone}
                                    onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 bg-gray-200 dark:bg-charcoal-700 text-charcoal-800 dark:text-white rounded-xl font-bold hover:bg-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-terracotta-500 text-white rounded-xl font-bold hover:bg-terracotta-600 transition-all"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Pay Debt Modal */}
            {showPayModal && selectedClient && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-charcoal-800 rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-2xl font-black mb-1 text-charcoal-900 dark:text-white">Record Bank Payment</h2>
                        <p className="text-gray-500 text-sm mb-6">For: {selectedClient.name} (Owes RWF {selectedClient.totalDebt.toLocaleString()})</p>
                        <form onSubmit={handlePayDebt} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Amount Paid (RWF)</label>
                                <input
                                    type="number"
                                    required
                                    max={selectedClient.totalDebt}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-charcoal-700 border border-gray-200 dark:border-charcoal-600 rounded-xl outline-none focus:border-terracotta-500 text-xl font-bold dark:text-white"
                                    value={payAmount}
                                    onChange={e => setPayAmount(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowPayModal(false)}
                                    className="flex-1 py-3 bg-gray-200 dark:bg-charcoal-700 text-charcoal-800 dark:text-white rounded-xl font-bold hover:bg-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all"
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Fiche Modal */}
            {showFicheModal && selectedClient && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-charcoal-800 rounded-2xl w-full max-w-5xl p-6 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-charcoal-900 dark:text-white">Fiche de Client Abonné</h2>
                            <div className="flex gap-3">
                                <button onClick={printFiche} className="flex items-center gap-2 px-4 py-2 bg-charcoal-900 text-white rounded-lg font-bold hover:bg-charcoal-800"><FaPrint /> Print</button>
                                <button onClick={() => setShowFicheModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg font-bold hover:bg-gray-300"><FaTimes /></button>
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 bg-white" id="fiche-print-area">
                            <style>
                                {\`
                                @media print {
                                    @page { margin: 20px; }
                                    body { font-family: sans-serif; background: white; color: black; }
                                    .print-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                                    .print-table th, .print-table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                                    .print-header { margin-bottom: 30px; }
                                    .no-print { display: none; }
                                }
                                \`}
                            </style>
                            <div className="p-8">
                                <div className="print-header flex justify-between items-end mb-8 border-b-2 border-black pb-4">
                                    <div>
                                        <h1 className="text-3xl font-black uppercase mb-1">FICHE DE CLIENT ABONNÉ</h1>
                                        <p className="text-lg font-bold">NOM DU CLIENT: <span className="underline decoration-dotted underline-offset-4">{selectedClient.name}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm">Total Debt: <span className="font-black text-lg">RWF {selectedClient.totalDebt.toLocaleString()}</span></p>
                                    </div>
                                </div>

                                <table className="print-table w-full border border-gray-300 text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border border-gray-300 p-2">DATE</th>
                                            <th className="border border-gray-300 p-2">DESIGNATION</th>
                                            <th className="border border-gray-300 p-2">QUANTITY</th>
                                            <th className="border border-gray-300 p-2">PU (RWF)</th>
                                            <th className="border border-gray-300 p-2">PT (RWF)</th>
                                            <th className="border border-gray-300 p-2 text-red-600">OWED (RWF)</th>
                                            <th className="border border-gray-300 p-2">RESPONSIBLE</th>
                                            <th className="border border-gray-300 p-2">SIGNATURE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientFiche.map((tx, idx) => (
                                            <tr key={idx}>
                                                <td className="border border-gray-300 p-2">{new Date(tx.date).toLocaleDateString()}</td>
                                                <td className="border border-gray-300 p-2 font-bold">{tx.designation}</td>
                                                <td className="border border-gray-300 p-2 text-center">{tx.quantity}</td>
                                                <td className="border border-gray-300 p-2 text-right">{tx.pu.toLocaleString()}</td>
                                                <td className="border border-gray-300 p-2 text-right">{tx.pt.toLocaleString()}</td>
                                                <td className="border border-gray-300 p-2 text-right font-bold text-red-600">{tx.debtAmount.toLocaleString()}</td>
                                                <td className="border border-gray-300 p-2">{tx.responsible?.name || "System"}</td>
                                                <td className="border border-gray-300 p-2"></td>
                                            </tr>
                                        ))}
                                        {clientFiche.length === 0 && (
                                            <tr>
                                                <td colSpan="8" className="p-8 text-center text-gray-500">No unpaid transactions.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {clientFiche.length > 0 && (
                                        <tfoot>
                                            <tr className="bg-gray-100 font-black">
                                                <td colSpan="4" className="border border-gray-300 p-2 text-right">TOTAL GLOBAL (TG):</td>
                                                <td className="border border-gray-300 p-2 text-right">{clientFiche.reduce((sum, tx) => sum + tx.pt, 0).toLocaleString()}</td>
                                                <td className="border border-gray-300 p-2 text-right text-red-600">{selectedClient.totalDebt.toLocaleString()}</td>
                                                <td colSpan="2" className="border border-gray-300 p-2"></td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAbonne;
