import React from "react";
import Layout from "../components/Layout/Layout";
import HorasChart from "../components/Charts/HorasChart";
import AtividadesChart from "../components/Charts/AtividadesChart";
import CustosChart from "../components/Charts/CustosChart";
import Hint from "../components/Hint/Hint";

const Dashboard = () => {
  return (
    <Layout>

      <div className="container-fluid py-4">
        <div className="container-fluid p-3">
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-secondary px-sm-3 fs-4"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapse_atividades_container"
              aria-expanded="false"
              aria-controls="collapse_atividades_container"
            >
              Atividades
            </button>
            <Hint 
              text="Esta seção mostra métricas sobre as atividades desenvolvidas no projeto, incluindo total de atividades, distribuição por projeto, evolução temporal e horas por desenvolvedor." 
              position="right"
              size="md"
            />
          </div>
          <hr />

          <div className="collapse show" id="collapse_atividades_container">
            <div className="row g-3">
              <div className="">
                <div className="container-fluid py-4">
                  <AtividadesChart />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container-fluid py-4">
        <div className="container-fluid p-3">
          <div className="d-flex align-items-center gap-2">
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
            <Hint 
              text="Esta seção apresenta análises das horas trabalhadas, incluindo distribuição por projeto, por desenvolvedor, bugs e manutenções realizadas ao longo do tempo." 
              position="right"
              size="md"
            />
          </div>
          <hr />

          <div className="collapse show" id="collapse_horas_container">
            <div className="row g-3">

              <div className="">
                <div className="container-fluid py-4">
                  <HorasChart />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-4">
        <div className="container-fluid p-3">
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-secondary px-sm-3 fs-4"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapse_custos_container"
              aria-expanded="false"
              aria-controls="collapse_custos_container"
            >
              Custos
            </button>
            <Hint 
              text="Esta seção exibe informações financeiras do projeto, incluindo custo total, média de custo por hora, distribuição de custos por projeto e desenvolvedor, além da evolução temporal dos gastos." 
              position="right"
              size="md"
            />
          </div>
          <hr />

          <div className="collapse show" id="collapse_custos_container">
            <div className="row g-3">
              <div className="">
                <div className="container-fluid py-4">
                  <CustosChart />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;