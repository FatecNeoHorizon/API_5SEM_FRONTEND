import React from "react";
import Layout from "../components/Layout/Layout";
import DevTooltip from "../components/Charts/DevTooltip";
import HorasDevChart from "../components/Charts/HorasDevChart";
import HorasPorPeriodo from "../components/Charts/horasPorPeriodo";
import HoraProjetoChart from "../components/Charts/HorasProjetoChart";
import IssuesTotalChart from "../components/Charts/IssuesTotalChart";
import CostsChart from "../components/Charts/CostsChart";
import IssuesProjetoChart from "../components/Charts/IssuesProjetoChart";
import ProjetoTooltip from "../components/Charts/ProjetoTooltip";

const Dashboard = () => {
  return (
    <Layout>
      <div className="container-fluid py-4">
        <DevTooltip />
      </div>
            <div className="container-fluid py-4">
        <HorasDevChart />
      </div>
            <div className="container-fluid py-4">
        <HorasPorPeriodo />
      </div>
            <div className="container-fluid py-4">
        <HoraProjetoChart />
      </div>
            <div className="container-fluid py-4">
        <div className="row g-4">
          <div className="col-md-4">
            <IssuesTotalChart />
          </div>

          <div className="col-md-3">
            <IssuesProjetoChart />
          </div>
        </div>
      </div>

      <div className="container-fluid py-4">
        <CostsChart/>
      </div>
            <div className="container-fluid py-4">
        <ProjetoTooltip />
      </div>
    </Layout>
  );
};

export default Dashboard;