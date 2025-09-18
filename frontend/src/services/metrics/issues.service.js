import api from '../axios';

/**
 * Service para consumir métricas de issues
 */
export class IssuesService {
  /**
   * Busca o total de issues do backend
   * @returns {Promise<Object>} Dados do total de issues
   */
  static async getTotalIssues() {
    try {
      const response = await api.get('/metrics/issues/total');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao buscar total de issues:', error);
      
      // Mock temporário para desenvolvimento enquanto API não está pronta
      console.warn('API não disponível, usando dados mock temporários');
      
      const mockData = {
        total: 37,
        time: 5,
        controle: {
          concluidas: 15,
          emAtraso: 6,
          emAndamento: 16
        },
        horasTrabalhadasPorTask: [
          { task: 'ADC', horas: 8 },
          { task: 'SFC', horas: 12 },
          { task: 'DEL', horas: 6 },
          { task: 'FEI', horas: 15 },
          { task: 'FLI', horas: 10 },
          { task: 'NJM', horas: 20 },
          { task: 'ORS', horas: 9 },
          { task: 'TUV', horas: 11 },
          { task: 'XYZ', horas: 7 }
        ],
        andamentoTarefas: {
          teste: { porcentagem: 72.4 },
          sprint2: { porcentagem: 15.6 },
          sprint3: { porcentagem: 12.0 }
        },
        horasPorDev: [
          { dev: 'Tarefa 1', horas: 25 },
          { dev: 'Tarefa 2', horas: 20 },
          { dev: 'Tarefa 3', horas: 18 },
          { dev: 'Tarefa 4', horas: 22 },
          { dev: 'Tarefa 5', horas: 16 }
        ],
        tempoPorMes: [
          { mes: 'Janeiro', tempo: 8 },
          { mes: 'Fevereiro', tempo: 12 },
          { mes: 'Março', tempo: 15 },
          { mes: 'Abril', tempo: 18 },
          { mes: 'Maio', tempo: 25 },
          { mes: 'Junho', tempo: 12 },
          { mes: 'Julho', tempo: 16 },
          { mes: 'Agosto', tempo: 20 },
          { mes: 'Setembro', tempo: 14 },
          { mes: 'Outubro', tempo: 18 },
          { mes: 'Novembro', tempo: 22 },
          { mes: 'Dezembro', tempo: 19 }
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