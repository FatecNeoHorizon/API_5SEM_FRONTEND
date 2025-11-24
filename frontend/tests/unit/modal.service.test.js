// frontend/tests/unit/modal.service.test.js
jest.mock("axios", () => {
  const instances = [];

  const create = jest.fn((config) => {
    const api = {
      get: jest.fn(),
      put: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
      __config: config, // só para debug se quiser ver baseURL
    };
    instances.push(api);
    return api;
  });

  return {
    __esModule: true,
    default: { create },
    create,
    instances,
  };
});

import { instances } from "axios";
import {
  listDevs,
  updateDev,
  listFatos,
  updateFato,
} from "../../src/services/metrics/modal.service";

describe("modal.service", () => {
  beforeEach(() => {
    instances.forEach((api) => {
      api.get.mockReset();
      api.put.mockReset();
      api.post.mockReset();
      api.delete.mockReset();
    });
  });

  test("listDevs retorna dados do endpoint /dim-dev", async () => {
    const devApi = instances[0]; // primeiro axios.create => dim-dev
    devApi.get.mockResolvedValue({
      data: [{ id: 1, nome: "Alice" }],
    });

    const res = await listDevs();

    expect(res).toEqual([{ id: 1, nome: "Alice" }]);
    expect(devApi.get).toHaveBeenCalledWith("");
  });

  test("updateDev envia PUT correto para /dim-dev/:id", async () => {
    const devApi = instances[0];

    devApi.put.mockResolvedValue({
      data: { ok: true },
    });

    const dev = { id: 2, nome: "Bob", custoHora: 150 };

    const res = await updateDev(dev);

    expect(devApi.put).toHaveBeenCalledWith("/2", dev);
    expect(res).toEqual({ ok: true });
  });

  test("listFatos usa fatoApi (base /fato-custo-hora)", async () => {
    const fatoApi = instances[1]; // segundo axios.create => fato-custo-hora

    fatoApi.get.mockResolvedValue({
      data: [{ id: 10 }],
    });

    const res = await listFatos();

    expect(res).toEqual([{ id: 10 }]);
    expect(fatoApi.get).toHaveBeenCalledWith("");
  });

  test("updateFato envia PUT correto para /fato-custo-hora/:id", async () => {
    const fatoApi = instances[1];

    const fato = { id: 10, custo: 500 };

    fatoApi.put.mockResolvedValue({
      data: { ok: true },
    });

    const res = await updateFato(fato);

    expect(fatoApi.put).toHaveBeenCalledWith("/10", fato);
    expect(res).toEqual({ ok: true });
  });
});
