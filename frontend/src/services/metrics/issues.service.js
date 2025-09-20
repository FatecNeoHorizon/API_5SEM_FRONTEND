import api from "../axios";

export class IssuesService {
  static async getTotalIssues() {
    try {
      const response = await api.get("/metrics/issues/total");
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Erro ao buscar total de issues:", error);
      console.warn("API não disponível, usando dados mock temporários");
      const mockData = {
        total: 42,
        time: 125000,
        controle: {
          concluidas: 18,
          emAtraso: 8,
          emAndamento: 16
        },
        horasTrabalhadasPorTask: [
          { task: "E-Commerce", horas: 120 },
          { task: "Dashboard", horas: 85 },
          { task: "API Gateway", horas: 95 },
          { task: "Mobile App", horas: 110 },
          { task: "CRM System", horas: 75 },
          { task: "Analytics", horas: 60 }
        ],
        andamentoTarefas: {
          "E-Commerce": { porcentagem: 30 },
          "Dashboard": { porcentagem: 25 },
          "API Gateway": { porcentagem: 20 },
          "Mobile App": { porcentagem: 15 },
          "Outros": { porcentagem: 10 }
        },
        horasPorDev: [
          {
            dev: "João Silva",
            horas: 168,
            atividades: ["Frontend", "API Integration", "Testing"],
            diasTrabalhados: 21,
            horasMediaPorDia: 8,
            projetosAtivos: ["E-Commerce", "Dashboard"]
          },
          {
            dev: "Maria Santos",
            horas: 152,
            atividades: ["Backend", "Database", "DevOps"],
            diasTrabalhados: 19,
            horasMediaPorDia: 8,
            projetosAtivos: ["API Gateway", "CRM System"]
          },
          {
            dev: "Pedro Costa",
            horas: 144,
            atividades: ["Mobile", "UI/UX", "Design"],
            diasTrabalhados: 18,
            horasMediaPorDia: 8,
            projetosAtivos: ["Mobile App", "E-Commerce"]
          },
          {
            dev: "Ana Lima",
            horas: 136,
            atividades: ["Analytics", "Reports", "QA"],
            diasTrabalhados: 17,
            horasMediaPorDia: 8,
            projetosAtivos: ["Analytics", "Dashboard"]
          }
        ],
        tempoPorMes: [
          { mes: "Janeiro", tempo: 280 },
          { mes: "Fevereiro", tempo: 320 },
          { mes: "Março", tempo: 350 },
          { mes: "Abril", tempo: 310 },
          { mes: "Maio", tempo: 390 },
          { mes: "Junho", tempo: 420 },
          { mes: "Julho", tempo: 380 },
          { mes: "Agosto", tempo: 360 },
          { mes: "Setembro", tempo: 400 },
          { mes: "Outubro", tempo: 440 },
          { mes: "Novembro", tempo: 460 },
          { mes: "Dezembro", tempo: 380 }
        ]
      };
      return {
        success: true,
        data: mockData,
        isMock: true
      };
    }
  }
}

export default IssuesService;