import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080"
});

export class IssuesProjetoService {
  static async getTotalIssues() {
    try {
      const [proj1, proj2] = await Promise.all([
        api.get("/issue/por-projeto/1"),
        api.get("/issue/por-projeto/2")
      ]);

      return {
        success: true,
        data: [
          {
            projectName: proj1.data[0].projectName,
            totalIssues: proj1.data[0].totalIssues
          },
          {
            projectName: proj2.data[0].projectName,
            totalIssues: proj2.data[0].totalIssues
          }
        ]
      };
    } catch (error) {
      console.error("Erro ao buscar total de issues:", error);
      return {
        success: false,
        error: error.message || "Erro desconhecido ao buscar total de issues"
      };
    }
  }
}

export default IssuesProjetoService;