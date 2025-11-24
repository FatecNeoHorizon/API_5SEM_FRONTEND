// frontend/tests/integration/ModalCustoDev.integration.test.jsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ModalCustoDev from "../../src/components/Modal/ModalCustoDev.jsx";
import * as modalService from "../../src/services/metrics/modal.service";

jest.mock("../../src/services/metrics/modal.service");

describe("ModalCustoDev - integração com modal.service", () => {
  const onClose = jest.fn();
  const onSaveSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("carrega devs, filtra 'Não atribuido', permite edição e recalcula custo ao salvar", async () => {
    // 1) Mock das chamadas ao service
    modalService.listDevs.mockResolvedValueOnce([
      { id: 1, nome: "Não atribuido", custoHora: 0 },
      { id: 2, nome: "Alice", custoHora: 100 },
    ]);

    modalService.listFatos.mockResolvedValueOnce([
      {
        id: 10,
        horasQuantidade: 5,
        dimDev: { id: 2, nome: "Alice" },
        dimProjeto: { id: 99 },
        dimPeriodo: { id: 50 },
        custo: 500,
      },
    ]);

    modalService.updateDev.mockResolvedValue({});
    modalService.updateFato.mockResolvedValue({});

    // 2) Mock do confirm para sempre "OK"
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <ModalCustoDev show={true} onClose={onClose} onSaveSuccess={onSaveSuccess} />
    );

    // 3) Aguarda carregamento dos devs
    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    // "Não atribuido" não deve aparecer na tabela
    expect(screen.queryByText(/não atribuido/i)).not.toBeInTheDocument();

    // 4) Editar custo da Alice: 100 -> 150
    // assumindo que o campo de custo é um <input type="number">
    const inputCusto = screen.getByRole("spinbutton");
    await userEvent.clear(inputCusto);
    await userEvent.type(inputCusto, "150");

    // 5) Clicar em "Salvar"
    const botaoSalvar = screen.getByRole("button", { name: /salvar/i });
    await userEvent.click(botaoSalvar);

    // 6) Verificar que os services foram chamados corretamente
    await waitFor(() => {
      expect(modalService.updateDev).toHaveBeenCalledTimes(1);
      expect(modalService.updateFato).toHaveBeenCalledTimes(1);
    });

    // Dev atualizado: custoHora alterado
    const devAtualizado = modalService.updateDev.mock.calls[0][0];
    expect(devAtualizado).toMatchObject({ id: 2, custoHora: 150 });

    // Fato atualizado: custo = novoCustoHora * horasQuantidade = 150 * 5 = 750
    const fatoAtualizado = modalService.updateFato.mock.calls[0][0];
    expect(fatoAtualizado.custo).toBe(750);
    expect(fatoAtualizado.dimDev.id).toBe(2);

    // Callback de sucesso chamado
    expect(onSaveSuccess).toHaveBeenCalled();

    // Limpando o spy
    confirmSpy.mockRestore();
  });

  test("não chama updateDev/updateFato se o usuário cancela o confirm", async () => {
    modalService.listDevs.mockResolvedValueOnce([
      { id: 2, nome: "Alice", custoHora: 100 },
    ]);

    modalService.listFatos.mockResolvedValueOnce([
      {
        id: 10,
        horasQuantidade: 5,
        dimDev: { id: 2, nome: "Alice" },
        dimProjeto: { id: 99 },
        dimPeriodo: { id: 50 },
        custo: 500,
      },
    ]);

    modalService.updateDev.mockResolvedValue({});
    modalService.updateFato.mockResolvedValue({});

    // confirm = false (usuário cancela)
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);

    render(
      <ModalCustoDev show={true} onClose={onClose} onSaveSuccess={onSaveSuccess} />
    );

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    const inputCusto = screen.getByRole("spinbutton");
    await userEvent.clear(inputCusto);
    await userEvent.type(inputCusto, "150");

    const botaoSalvar = screen.getByRole("button", { name: /salvar/i });
    await userEvent.click(botaoSalvar);

    // Como o usuário cancelou o confirm, nenhuma atualização deve ocorrer
    expect(modalService.updateDev).not.toHaveBeenCalled();
    expect(modalService.updateFato).not.toHaveBeenCalled();
    expect(onSaveSuccess).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});
