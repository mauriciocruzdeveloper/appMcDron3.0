/// <reference types="jest" />

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import ReparacionesAvisoAbandonoSection from "./ReparacionesAvisoAbandonoSection.component";
import { selectReparacionesListasParaAvisoAbandono } from "../../redux-tool-kit/reparacion/reparacion.selectors";

const mockHistoryPush = jest.fn();

jest.mock("../../hooks/useHistory", () => ({
  useHistory: () => ({ push: mockHistoryPush }),
}));

jest.mock("../../redux-tool-kit/hooks/useAppSelector", () => ({
  useAppSelector: (selector: (state: unknown) => unknown) => selector({}),
}));

jest.mock("../../redux-tool-kit/reparacion/reparacion.selectors", () => ({
  selectReparacionesListasParaAvisoAbandono: jest.fn(),
}));

jest.mock("../../utils/utils", () => ({
  convertTimestampCORTO: () => "20/05/2026",
}));

const selectorMock = selectReparacionesListasParaAvisoAbandono as unknown as jest.Mock;

describe("ReparacionesAvisoAbandonoSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    selectorMock.mockReturnValue([{
      id: "rep-1",
      data: {
        EstadoRep: "Presupuestado",
        ModeloDroneNameRep: "DJI Mini 4 Pro",
        NombreUsu: "Ada",
        ApellidoUsu: "Lovelace",
        FeRecRep: 1,
      },
    }]);
  });

  it("renderiza la lista obtenida por el selector y navega al detalle", () => {
    render(<ReparacionesAvisoAbandonoSection />);

    expect(selectorMock).toHaveBeenCalledWith({}, expect.any(Number));
    expect(screen.getByText("Avisos de abandono pendientes")).toBeTruthy();
    expect(screen.getByText("Ada Lovelace")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /DJI Mini 4 Pro/ }));

    expect(mockHistoryPush).toHaveBeenCalledWith("/inicio/reparaciones/rep-1");
  });

  it("muestra el estado vacío entregado por el selector", () => {
    selectorMock.mockReturnValue([]);

    render(<ReparacionesAvisoAbandonoSection />);

    expect(screen.getByText("No hay avisos de abandono pendientes")).toBeTruthy();
  });
});
