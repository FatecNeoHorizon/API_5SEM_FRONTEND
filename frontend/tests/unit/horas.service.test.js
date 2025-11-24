import axios from "axios";
import { getHorasPorPeriodo } from "../../src/services/metrics/horas.service"; // :contentReference[oaicite:2]{index=2}

describe("horas.service - getHorasPorPeriodo()", () => {
  test("remove períodos coringa e agrupa por mês", async () => {
    const mockGet = jest.fn().mockResolvedValue({
      data: [
        {
          dimPeriodo: { dia: 10, mes: 8, ano: 2025, semana: 32 },
          horasQuantidade: 5,
        },
        {
          dimPeriodo: { dia: 31, mes: 12, ano: 99, semana: 99 }, // coringa
          horasQuantidade: 100,
        },
      ],
    });

    axios.get.mockImplementationOnce(() => mockGet()); // ou axios.get = mockGet;

    const res = await getHorasPorPeriodo("mes");

    expect(res.length).toBe(1);
    expect(res[0].atividades).toBe(5);
  });
});
