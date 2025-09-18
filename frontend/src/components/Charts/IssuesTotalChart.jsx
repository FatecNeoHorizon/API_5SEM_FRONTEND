import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import IssuesService from '../../services/metrics/issues.service';

const IssuesTotalChart = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await IssuesService.getTotalIssues();
        
        if (response.success) {
          setData(response.data);
          setIsMock(response.isMock || false);
        } else {
          setError('Erro ao carregar dados');
        }
      } catch (err) {
        setError('Erro na conexão com o servidor');
        console.error('Erro ao buscar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Erro!</h4>
        <p>{error}</p>
        <button 
          className="btn btn-outline-danger" 
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="alert alert-info" role="alert">
        <h4 className="alert-heading">Sem dados</h4>
        <p>Não há dados disponíveis para exibição no momento.</p>
      </div>
    );
  }

  const barColors = ['#007bff', '#28a745', '#17a2b8', '#ffc107', '#fd7e14'];

  const controleData = [
    { name: 'Concluídas', value: data.controle.concluidas, color: '#28a745' },
    { name: 'Em Atraso', value: data.controle.emAtraso, color: '#dc3545' },
    { name: 'Em Andamento', value: data.controle.emAndamento, color: '#ffc107' }
  ];

  const andamentoData = Object.entries(data.andamentoTarefas).map(([key, value]) => ({
    name: key,
    value: value.porcentagem
  }));

  return (
    <div className="container-fluid">
      {/* Header com métricas principais */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center mb-3">
            <h2>📊 Tarefas</h2>
            {isMock && (
              <span className="badge bg-warning ms-2">Dados Mock</span>
            )}
          </div>
          
          <div className="row">
            <div className="col-md-2">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Total:</h5>
                  <h3 className="text-primary">{data.total}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Time:</h5>
                  <h3 className="text-info">{data.time}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-8">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Controle:</h5>
                  <div className="row">
                    <div className="col-4 text-center">
                      <span className="badge bg-success fs-6">{data.controle.concluidas} concluídas</span>
                    </div>
                    <div className="col-4 text-center">
                      <span className="badge bg-danger fs-6">{data.controle.emAtraso} em atraso</span>
                    </div>
                    <div className="col-4 text-center">
                      <span className="badge bg-warning fs-6">{data.controle.emAndamento} em andamento</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primeira linha de gráficos */}
      <div className="row mb-4">
        {/* Gráfico de Horas Trabalhadas por Task */}
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0">📊 Horas trabalhadas por task</h6>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.horasTrabalhadasPorTask} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="task" type="category" width={40} />
                  <Tooltip 
                    formatter={(value) => [value, 'Horas']}
                    labelStyle={{ color: '#333' }}
                  />
                  <Bar dataKey="horas" fill="#007bff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gráfico de Controle (Pie Chart) */}
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0">🎯 Andamento - Tarefas</h6>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={controleData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {controleData.map((entry) => (
                      <Cell key={`controle-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Tarefas']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gráfico de Horas por Dev */}
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0">🕒 Horas p/ Dev</h6>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={andamentoData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {andamentoData.map((entry, index) => (
                      <Cell key={`andamento-${entry.name}`} fill={barColors[index % barColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Progresso']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Segunda linha de gráficos */}
      <div className="row">
        {/* Gráfico de Tempo por Mês */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">📅 Tempo</h6>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.tempoPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="mes" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [value, 'Horas']}
                    labelStyle={{ color: '#333' }}
                  />
                  <Bar dataKey="tempo" fill="#17a2b8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gráfico de Horas por Dev (Vertical) */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">⏱️ Tempo</h6>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.horasPorDev} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="dev" type="category" width={60} />
                  <Tooltip 
                    formatter={(value) => [value, 'Horas']}
                    labelStyle={{ color: '#333' }}
                  />
                  <Bar dataKey="horas" fill="#fd7e14" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssuesTotalChart;