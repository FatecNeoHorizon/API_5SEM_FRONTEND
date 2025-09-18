import React from "react";
import Layout from "../components/Layout/Layout";
import IssuesTotalChart from "../components/Charts/IssuesTotalChart";

const Dashboard = () => {
  return (
    <Layout>
      <div className="container-fluid py-4">
        <IssuesTotalChart />
      </div>
    </Layout>
  );
};

export default Dashboard;
