import api from "../axios";
import { DimDev } from "../DimDev";

export class HorasPorDev {

  static async getHorasPorDev() {
    let listaHorasPorDev = [];
    
    try {
      let response = await DimDev.getDimDev();
      let listaDevs = response.data;

      for (let i = 0; i < listaDevs.length; i++) {
        let dev_id = listaDevs[i].id;
        let dev_nome = listaDevs[i].nome;
        let totalHorasPorDev = 0;

        const params = new URLSearchParams();
        params.append("projeto_id", "0");
        params.append("periodo_id", "0");
        params.append("dev_id", dev_id);

        response = await api.get("/fato-custo-hora/filter", {
          params: params
        });

        if (response.data.length > 0) {
          let fatoCustoHora = response.data;
          if (fatoCustoHora.length > 0) {

            for (let j = 0; j < fatoCustoHora.length; j++) {
              totalHorasPorDev += fatoCustoHora[j].horas_quantidade;
            }

            const singleHorasPorDev = {
              dev: dev_nome,
              horas: totalHorasPorDev
            };

            listaHorasPorDev.push(singleHorasPorDev);
          }
        }
      }
      return listaHorasPorDev;
    } catch (error) {
      return error;

    }
  }
}