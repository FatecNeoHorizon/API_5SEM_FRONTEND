import { toStackedByDay } from "../../src/services/metrics/atividades.service";

describe("atividades.service - toStackedByDay()", () => {
  test("gera matriz empilhada por dia", () => {
    const input = [
      {
        devId: 1,
        atividades: [
          {
            atividadeNome: "Bugfix",
            diasApontamentos: [
              { data: "2025-10-10", horas: 2 },
              { data: "2025-10-11", horas: 1 },
            ],
          },
        ],
      },
      {
        devId: 2,
        atividades: [
          {
            atividadeNome: "Feature",
            diasApontamentos: [{ data: "2025-10-10", horas: 3 }],
          },
        ],
      },
    ];

    const { rows, activities, dates } = toStackedByDay(input);

    expect(activities).toEqual(["Bugfix", "Feature"]);
    expect(dates).toEqual(["2025-10-10", "2025-10-11"]);
    expect(rows).toEqual([
      { date: "2025-10-10", Bugfix: 2, Feature: 3, total: 5 },
      { date: "2025-10-11", Bugfix: 1, Feature: 0, total: 1 },
    ]);
  });
});
