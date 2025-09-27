import React from "react";
import Layout from "../components/Layout/Layout";
import IssuesTotalChart from "../components/Charts/IssuesTotalChart";
import CostsChart from "../components/Charts/CostsChart";
import IssuesProjetoChart from "../components/Charts/IssuesProjetoChart";
import IssuesPeriodoChart from "../components/Charts/IssuesPeriodoChart";

const Dashboard = () => {
  return (
    <Layout>
      <div className="container-fluid py-4">
        <div className="row g-4">
          <div className="col-md-4">
            <IssuesTotalChart />
          </div>
          <div className="col-md-3">
            <IssuesProjetoChart />
          </div>
          <div className="col-md-5">
            <IssuesPeriodoChart />
          </div>
        </div>
      </div>

      

      <div className="container-fluid py-4">
        <CostsChart/>
      </div>
    </Layout>
  );
};

export default Dashboard;
