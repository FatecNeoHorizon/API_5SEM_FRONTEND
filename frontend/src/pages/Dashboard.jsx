import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [envData, setEnvData] = useState(null);

  // Variáveis do .env
  const apiUrl = process.env.REACT_APP_API_URL;
  const buttonText = process.env.REACT_APP_BUTTON_TEXT;

  // Testando API pública
  async function getUsers() {
    try {
      const response = await axios.get("https://jsonplaceholder.typicode.com/users");
      console.log("Usuários (API pública):", response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("Erro na API pública:", error);
    }
  }

  // Testando API local usando .env
  async function testEnvApi() {
    try {
      const response = await axios.get(`${apiUrl}/teste`);
      console.log("Resposta da API local (.env):", response.data);
      setEnvData(response.data);
    } catch (error) {
      console.error("Erro na API local (.env), usando mock:", error);
      // Mock da resposta caso a API local não exista
      const fakeResponse = { status: "ok", mensagem: "Resposta mockada da API local" };
      setEnvData(fakeResponse);
    }
  }

  useEffect(() => {
    getUsers();
    testEnvApi();
  }, []);

  // Gráfico com dados mockados
  const mockChartData = [
    { name: "Jan", vendas: 40 },
    { name: "Fev", vendas: 30 },
    { name: "Mar", vendas: 20 },
    { name: "Abr", vendas: 27 },
    { name: "Mai", vendas: 18 },
    { name: "Jun", vendas: 23 },
  ];

  // Gráfico dinâmico baseado nos usuários da API pública
  const userChartData = users.map((user) => ({
    name: user.name.split(" ")[0], // primeiro nome
    letras: user.name.length,      // tamanho do nome
  }));

  return (
    <div className="container mt-4">
      <h1>Dashboard</h1>
      <button type="button" className="btn btn-outline-primary">
        {buttonText}
      </button>

      {/* Teste do .env */}
      <div className="mt-4">
        <h3>Variáveis do .env</h3>
        <ul>
          <li><strong>API URL:</strong> {apiUrl}</li>
          <li><strong>Texto do botão:</strong> {buttonText}</li>
        </ul>
      </div>

      {/* Teste da API local (mock incluído) */}
      <div className="mt-4">
        <h3>Resposta da API Local (.env)</h3>
        {envData ? (
          <pre>{JSON.stringify(envData, null, 2)}</pre>
        ) : (
          <p>Sem resposta ou erro na API local</p>
        )}
      </div>

      {/* Gráfico mockado */}
      <div className="mt-4" style={{ width: "100%", height: 300 }}>
        <h3>Vendas Mockadas</h3>
        <ResponsiveContainer>
          <LineChart data={mockChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="vendas" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico dinâmico com usuários */}
      <div className="mt-4" style={{ width: "100%", height: 300 }}>
        <h3>Tamanho do Nome dos Usuários (API Pública)</h3>
        <ResponsiveContainer>
          <LineChart data={userChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="letras" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Lista de usuários */}
      <div className="mt-4">
        <h3>Usuários da API Pública:</h3>
        <ul className="list-group">
          {users.map((user) => (
            <li key={user.id} className="list-group-item">
              <strong>{user.name}</strong> - {user.email}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
