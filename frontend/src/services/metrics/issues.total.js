import api from "../axios";

export class IssuesTotalService {
  static async getTotalIssues() {
    try {
      const response = await api.get("/fato-issue/total");
      return {
        success: true,
        data: { total: response.data }
      };
    } catch (error) {
      console.error("Erro ao buscar total de issues:", error);
      return {
        success: false,
        error: error.message || "Erro desconhecido ao buscar total de issues."
      };
    }
  }
}

export default IssuesTotalService;
