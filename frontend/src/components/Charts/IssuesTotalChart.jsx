import React, { useState, useEffect } from "react";
import IssuesTotalService from "../../services/metrics/issues.total";

export default function TotalIssueChart() {
  const [totalIssues, setTotalIssues] = useState(0);

  useEffect(() => {
    const fetchTotalIssues = async () => {
      try {
        const response = await IssuesTotalService.getTotalIssues();
        if (response.success) {
          setTotalIssues(response.data.total);
        }
      } catch (err) {
        console.error("Erro ao buscar total de issues:", err);
      }
    };
    fetchTotalIssues();
  }, []);

  return (
    <div className="card w-100 text-center shadow-sm">
      <div className="card-body d-flex flex-column justify-content-center">
        <h5 className="card-subtitle text-muted mb-1 fs-50 fw-semibold">📋 Total de Issues</h5>
        <div className="display-6 text-primary fw-semibold">{totalIssues}</div>
      </div>
    </div>
  );
}