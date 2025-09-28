import React from "react";
import Layout from "../components/Layout/Layout";
import HorasDevChart from "../components/Charts/HorasDevChart";
import HorasPorPeriodo from "../components/Charts/horasPorPeriodo";
import HoraProjetoChart from "../components/Charts/HorasProjetoChart";
import IssuesTotalChart from "../components/Charts/IssuesTotalChart";
import CostsChart from "../components/Charts/CostsChart";
import IssuesProjetoChart from "../components/Charts/IssuesProjetoChart";
import IssuesPeriodoChart from "../components/Charts/IssuesPeriodoChart";
import DevHoursByActivityDayChart from "../components/Charts/DevHoursByActivityDayChart";

const Dashboard = () => {
  return (
    <Layout>

        <div className="container-fluid p-3">
          <div>
            <button
              className="btn btn-secondary px-sm-3 fs-4"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapse_issues_container"
              aria-expanded="false"
              aria-controls="collapse_issues_container"
            >
              Issues
            </button>
          </div>
          <hr />
          <div className="collapse show" id="collapse_issues_container">
            <div className="row g-4">
              <div className="full-width">
                <IssuesTotalChart />
              </div>
              <div className="col-2">
                <IssuesProjetoChart />
              </div>
              <div className="col-10">
                <IssuesPeriodoChart />
              </div>
              <div>
                <DevHoursByActivityDayChart/>
              </div>
            </div>
          </div>
        </div>
      
      <div className="container-fluid py-4">
        <div className="container-fluid p-3">
          <div>
            <button
              className="btn btn-secondary px-sm-3 fs-4"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapse_horas_container"
              aria-expanded="false"
              aria-controls="collapse_horas_container"
            >
              Horas
            </button>
          </div>
          <hr />

          <div className="collapse show" id="collapse_horas_container">
            <div className="row g-3">

              <div className="col-md-6">
                <div className="container-fluid py-4">
                  <HoraProjetoChart />
                </div>
              </div>

              <div className="col-md-6">
                <div className="container-fluid py-4">
                  <HorasDevChart />
                </div>
              </div>

              <div className="container-fluid py-4">
                <HorasPorPeriodo />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-4">
        <CostsChart />
      </div>
    </Layout>
  );
};

export default Dashboard;