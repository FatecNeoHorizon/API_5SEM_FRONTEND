import React from "react";
import Layout from "../components/Layout/Layout";
import IssuesPeriodo from "../components/Charts/IssuesPeriodo";

const Dashboard = () => {
  return (
    <Layout>
      <div className="container-fluid py-4">
        <IssuesPeriodo />
      </div>
    </Layout>
  );
};

export default Dashboard;
