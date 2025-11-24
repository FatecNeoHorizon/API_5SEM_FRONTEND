// frontend/tests/unit/custos.service.test.js
// Mocka o módulo "axios" com uma instância reutilizável
jest.mock("axios", () => {
  const instance = {
    get: jest.fn(),
  };

  const create = jest.fn(() => instance);

  return {
    __esModule: true,
    default: { create },
    create,
    instance,
  };
});

import { instance } from "axios";
import { getCustoPorDev } from "../../src/services/metrics/custos.service";

describe("custos.service - getCustoPorDev()", () => {
  beforeEach(() => {
    instance.get.mockReset();
  });

  test("filtra corretamente IDs e nomes 'Não atribuido'", async () => {
    instance.get.mockResolvedValue({
      data: [
        { id: 1, nome: "Não atribuido" },
        { id: 2, nome: "Alice" },
        { id: 3, nome: "Nao Atribuido" },
        { id: 4, nome: "Bob" },
      ],
    });

    const result = await getCustoPorDev();

    expect(result).toEqual([
      { id: 2, nome: "Alice" },
      { id: 4, nome: "Bob" },
    ]);

    expect(instance.get).toHaveBeenCalledWith("/por-dev");
  });

  test("lança erro amigável ao falhar", async () => {
    instance.get.mockRejectedValue(new Error("qualquer erro interno"));

    await expect(getCustoPorDev()).rejects.toThrow(
      "Falha ao buscar custo por dev",
    );
  });
});
