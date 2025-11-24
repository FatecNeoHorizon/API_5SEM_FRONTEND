// frontend/tests/unit/dim.test.js
jest.mock("../../src/services/axios", () => {
  const get = jest.fn();
  const api = { get };

  return {
    __esModule: true,
    default: api,
    get,
    api,
  };
});

import api, { get } from "../../src/services/axios";
import { DimDev } from "../../src/services/DimDev";
import { DimProjeto } from "../../src/services/DimProjeto";

describe("Dimensão Services", () => {
  beforeEach(() => {
    get.mockReset();
  });

  test("DimDev.getDimDev retorna success=true e dados", async () => {
    get.mockResolvedValueOnce({
      data: [{ id: 1, nome: "Alice" }],
    });

    const res = await DimDev.getDimDev();

    expect(res.success).toBe(true);
    expect(res.data).toEqual([{ id: 1, nome: "Alice" }]);
    expect(get).toHaveBeenCalledWith("/dim-dev");
  });

  test("DimProjeto.getDimProjeto retorna success=true e dados", async () => {
    get.mockResolvedValueOnce({
      data: [{ id: 10, nome: "Projeto A" }],
    });

    const res = await DimProjeto.getDimProjeto();

    expect(res.success).toBe(true);
    expect(res.data).toEqual([{ id: 10, nome: "Projeto A" }]);
    expect(get).toHaveBeenCalledWith("/dim-projeto");
  });
});
