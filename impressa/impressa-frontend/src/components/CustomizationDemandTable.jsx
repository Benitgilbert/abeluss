import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

function CustomizationDemandTable() {
  const [demandData, setDemandData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomizationDemand = async () => {
      try {
        const res = await axios.get("/analytics/customization-demand");
        setDemandData(res.data);
      } catch (err) {
        console.error("Failed to fetch customization demand:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomizationDemand();
  }, []);

  if (loading) return (
    <div className="card">
      <div style={{ padding: "1rem" }}>Loading customization data...</div>
    </div>
  );
  if (!demandData) return (
    <div className="card">
      <div style={{ padding: "1rem" }}>No data available</div>
    </div>
  );

  return (
    <div className="card h-full">
      <h3 className="card-title">Customization Demand</h3>
      <div className="table-container" style={{ boxShadow: "none", borderRadius: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Customization Type</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Custom Text</td>
              <td>{demandData.customText}</td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "100%", maxWidth: "100px", height: "0.5rem", backgroundColor: "#e5e7eb", borderRadius: "9999px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%", borderRadius: "9999px",
                        backgroundColor: "#3b82f6",
                        width: `${(demandData.customText / demandData.total * 100) || 0}%`
                      }}
                    ></div>
                  </div>
                  <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>{((demandData.customText / demandData.total * 100) || 0).toFixed(1)}%</span>
                </div>
              </td>
            </tr>
            <tr>
              <td>Custom File Upload</td>
              <td>{demandData.customFile}</td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "100%", maxWidth: "100px", height: "0.5rem", backgroundColor: "#e5e7eb", borderRadius: "9999px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%", borderRadius: "9999px",
                        backgroundColor: "#22c55e",
                        width: `${(demandData.customFile / demandData.total * 100) || 0}%`
                      }}
                    ></div>
                  </div>
                  <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>{((demandData.customFile / demandData.total * 100) || 0).toFixed(1)}%</span>
                </div>
              </td>
            </tr>
            <tr>
              <td>Cloud Link</td>
              <td>{demandData.cloudLink}</td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "100%", maxWidth: "100px", height: "0.5rem", backgroundColor: "#e5e7eb", borderRadius: "9999px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%", borderRadius: "9999px",
                        backgroundColor: "#a855f7",
                        width: `${(demandData.cloudLink / demandData.total * 100) || 0}%`
                      }}
                    ></div>
                  </div>
                  <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>{((demandData.cloudLink / demandData.total * 100) || 0).toFixed(1)}%</span>
                </div>
              </td>
            </tr>
            <tr style={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
              <td>Total Customizations</td>
              <td>{demandData.total}</td>
              <td>100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomizationDemandTable;