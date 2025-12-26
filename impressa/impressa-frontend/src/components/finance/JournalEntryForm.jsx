import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";

import "./JournalEntryForm.css";

const JournalEntryForm = ({ onSuccess }) => {
    // ... logic remains same ...
    const [accounts, setAccounts] = useState([]);
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [entries, setEntries] = useState([
        { account: "", debit: 0, credit: 0 },
        { account: "", debit: 0, credit: 0 },
    ]);

    useEffect(() => {
        axios.get("/finance/accounts").then((res) => setAccounts(res.data));
    }, []);

    const handleEntryChange = (index, field, value) => {
        const newEntries = [...entries];
        newEntries[index][field] = value;
        setEntries(newEntries);
    };

    const addRow = () => {
        setEntries([...entries, { account: "", debit: 0, credit: 0 }]);
    };

    const removeRow = (index) => {
        setEntries(entries.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/finance/transactions", {
                date,
                description,
                type: "Journal",
                entries: entries.map(e => ({
                    account: e.account,
                    debit: parseFloat(e.debit) || 0,
                    credit: parseFloat(e.credit) || 0
                }))
            });
            alert("Transaction recorded successfully!");
            setDescription("");
            setEntries([
                { account: "", debit: 0, credit: 0 },
                { account: "", debit: 0, credit: 0 },
            ]);
            if (onSuccess) onSuccess();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to record transaction");
        }
    };

    const totalDebit = entries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    return (
        <div className="journal-form-card">
            <h2 className="journal-header">New Journal Entry</h2>
            <form onSubmit={handleSubmit}>
                <div className="journal-grid">
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input
                            type="date"
                            className="journal-input"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <input
                            type="text"
                            className="journal-input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Office Supplies"
                            required
                        />
                    </div>
                </div>

                <table className="journal-table">
                    <thead>
                        <tr>
                            <th>Account</th>
                            <th>Debit</th>
                            <th>Credit</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry, index) => (
                            <tr key={index}>
                                <td>
                                    <select
                                        className="journal-select"
                                        value={entry.account}
                                        onChange={(e) => handleEntryChange(index, "account", e.target.value)}
                                        required
                                    >
                                        <option value="">Select Account</option>
                                        {accounts.map((acc) => (
                                            <option key={acc._id} value={acc._id}>
                                                {acc.code} - {acc.name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="table-input"
                                        value={entry.debit}
                                        onChange={(e) => handleEntryChange(index, "debit", e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="table-input"
                                        value={entry.credit}
                                        onChange={(e) => handleEntryChange(index, "credit", e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                </td>
                                <td className="text-center">
                                    {entries.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeRow(index)}
                                            className="row-remove-btn"
                                            title="Remove line"
                                        >
                                            &times;
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="journal-footer-row">
                            <td className="total-label">Total:</td>
                            <td className={`total-value ${isBalanced ? "balanced" : "unbalanced"}`}>
                                {totalDebit.toFixed(2)}
                            </td>
                            <td className={`total-value ${isBalanced ? "balanced" : "unbalanced"}`}>
                                {totalCredit.toFixed(2)}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>

                <div className="journal-actions">
                    <button
                        type="button"
                        onClick={addRow}
                        className="btn-add-line"
                    >
                        + Add Line
                    </button>
                    <button
                        type="submit"
                        disabled={!isBalanced || totalDebit === 0}
                        className={`btn-record ${isBalanced && totalDebit > 0 ? "active" : "disabled"}`}
                    >
                        Record Transaction
                    </button>
                </div>
                {!isBalanced && (
                    <p className="error-message">
                        Debits must equal Credits.
                    </p>
                )}
            </form>
        </div>
    );
};

export default JournalEntryForm;
