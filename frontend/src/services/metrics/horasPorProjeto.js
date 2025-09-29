import api from "../axios";
import { DimProjeto } from "../DimProjeto";

export class HorasPorProjeto {

  static async getHorasPorProjeto() {
    let listaHorasPorProjeto = [];
    
    try {
      let response = await DimProjeto.getDimProjeto();
      let listaProjetos = response.data;

      for (let i = 0; i < listaProjetos.length; i++) {
        let projeto_id = listaProjetos[i].id;
        let projeto_nome = listaProjetos[i].nome;
        let totalHorasPorProjeto = 0;

        const params = new URLSearchParams();
        params.append("projeto_id", projeto_id);
        params.append("periodo_id", "0");
        params.append("dev_id", "0");

        response = await api.get("/fato-custo-hora/filter", {
          params: params
        });

        if (response.data.length > 0) {
          let fatoCustoHora = response.data;
          if (fatoCustoHora.length > 0) {

            for (let j = 0; j < fatoCustoHora.length; j++) {
              totalHorasPorProjeto += fatoCustoHora[j].horas_quantidade;
            }

            const singleHorasPorProjeto = {
              task: projeto_nome,
              horas: totalHorasPorProjeto
            };

            listaHorasPorProjeto.push(singleHorasPorProjeto);
          }
        }
      }
      return listaHorasPorProjeto;
    } catch (error) {
      return error;

    }
  }
}