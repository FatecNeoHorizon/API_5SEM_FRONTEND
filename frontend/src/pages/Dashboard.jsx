import React from "react";
import Layout from "../components/Layout/Layout";
import IssuesTotalChart from "../components/Charts/IssuesTotalChart";
import CostsChart from "../components/Charts/CostsChart";

const Dashboard = () => {
  return (
    <Layout>
      <div className="container-fluid py-4">
        <IssuesTotalChart />
      </div>

      <div className="container-fluid py-4">
        <CostsChart/>
      </div>
    </Layout>
  );
};

export default Dashboard;
