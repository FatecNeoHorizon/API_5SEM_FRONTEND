import React from "react";
import TotalIssueChart from "./IssueTotalChart";
import IssueProjetoChart from "./IssueProjetoChart";

export default function Dashboard() {
  return (
    <div className="container-fluid">
      <div className="row g-4">
        <div className="col-md-4">
          <TotalIssueChart />
        </div>

        <div className="col-md-3">
          <IssueProjetoChart />
        </div>
      </div>
    </div>
  );
}