import React from "react";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { ReparacionHeader } from "./ReparacionHeader";

jest.mock("../../../redux-tool-kit/hooks/useAppSelector");
jest.mock("../../../redux-tool-kit/reparacion", () => ({
    selectReparacionById: jest.fn(),
    selectReparacionesByParentId: jest.fn(),
}));
jest.mock("../../../redux-tool-kit/usuario/usuario.selectors", () => ({
    selectUsuarioPorId: jest.fn(),
}));
jest.mock("../../../redux-tool-kit/drone/drone.selectors", () => ({
    selectDroneById: jest.fn(),
}));
jest.mock("../../../redux-tool-kit/modeloDrone/modeloDrone.selectors", () => ({
    selectModeloDronePorId: jest.fn(),
}));

const mockUseAppSelector = useAppSelector as jest.Mock;

const renderHeader = () => render(
    <MemoryRouter>
        <ReparacionHeader reparacionId="repair-1" />
    </MemoryRouter>
);

test("muestra cada acceso junto al dato correspondiente con su ruta", () => {
    mockUseAppSelector
        .mockReturnValueOnce({ id: "repair-1", data: { DroneId: "drone-1", EstadoRep: "Consulta" } })
        .mockReturnValueOnce({ id: "user-1", data: { NombreUsu: "Pilar", ApellidoUsu: "Cullen" } })
        .mockReturnValueOnce({ data: { Nombre: "Mini 3 - Pilar Cullen 2" } })
        .mockReturnValueOnce({ data: { NombreModelo: "Mini 3" } })
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce([]);

    renderHeader();

    const droneRow = screen.getByText("Drone: Mini 3 - Pilar Cullen 2").parentElement!;
    const clienteRow = screen.getByText("Cliente: Pilar Cullen").parentElement!;
    expect(within(droneRow).getByRole("link", { name: "Ver drone" }).getAttribute("href"))
        .toBe("/inicio/drones/drone-1");
    expect(within(clienteRow).getByRole("link", { name: "Ver cliente" }).getAttribute("href"))
        .toBe("/inicio/usuarios/user-1");
});

test("no muestra accesos sin drone ni cliente vinculados", () => {
    mockUseAppSelector
        .mockReturnValueOnce({ id: "repair-1", data: { EstadoRep: "Consulta" } })
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce([]);

    renderHeader();

    expect(screen.queryByRole("link", { name: "Ver drone" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Ver cliente" })).toBeNull();
});