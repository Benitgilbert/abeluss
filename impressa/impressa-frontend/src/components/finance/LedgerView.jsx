import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";

import "./LedgerView.css";

const LedgerView = () => {
    // ... logic remains same ...
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get("/finance/accounts").then((res) => {
            setAccounts(res.data);
            if (res.data.length > 0) {
                setSelectedAccount(res.data[0]._id);
            }
        });
    }, []);

    useEffect(() => {
        if (selectedAccount) {
            fetchLedger(selectedAccount);
        }
    }, [selectedAccount]);

    const fetchLedger = async (accountId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/finance/ledger/${accountId}`);
            setTransactions(res.data);
        } catch (err) {
            console.error("Failed to fetch ledger");
        } finally {
            setLoading(false);
        }
    };

    const getEntryForAccount = (transaction, accountId) => {
        return transaction.entries.find((e) => e.account._id === accountId || e.account === accountId);
    };

    return (
        <div className="ledger-card">
            <div className="ledger-header">
                <h2 className="ledger-title">General Ledger</h2>
                <div className="ledger-controls">
                    <select
                        className="ledger-select"
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                    >
                        {accounts.map((acc) => (
                            <option key={acc._id} value={acc._id}>
                                {acc.code} - {acc.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <p className="ledger-loading">Loading transactions...</p>
            ) : transactions.length === 0 ? (
                <p className="ledger-empty">No transactions found for this account.</p>
            ) : (
                <div className="ledger-table-container">
                    <table className="ledger-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Reference</th>
                                <th className="text-right">Debit</th>
                                <th className="text-right">Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => {
                                const entry = getEntryForAccount(tx, selectedAccount);
                                return (
                                    <tr key={tx._id}>
                                        <td className="col-date">{new Date(tx.date).toLocaleDateString()}</td>
                                        <td className="col-desc">{tx.description}</td>
                                        <td className="col-ref">{tx.reference || "-"}</td>
                                        <td className="col-amount">
                                            {entry?.debit ? entry.debit.toFixed(2) : "-"}
                                        </td>
                                        <td className="col-amount">
                                            {entry?.credit ? entry.credit.toFixed(2) : "-"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LedgerView;
