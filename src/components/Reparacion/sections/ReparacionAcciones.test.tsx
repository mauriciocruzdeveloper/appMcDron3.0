/// <reference types="jest" />

import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ReparacionAcciones } from "./ReparacionAcciones";
import { cancelarAvisoAbandonoAsync, cambiarEstadoReparacionAsync, eliminarReparacionAsync, enviarAvisoAbandonoAsync } from "../../../redux-tool-kit/reparacion/reparacion.actions";

const mockDispatch = jest.fn();
const mockOpenModal = jest.fn();
const mockHistoryReplace = jest.fn();
const mockHistoryGoBack = jest.fn();
let mockPuedeEnviarAviso = false;
let mockPuedeCancelarAviso = false;
let mockPuedeAbandonar = true;

jest.mock("../../../redux-tool-kit/hooks/useAppDispatch", () => ({
    useAppDispatch: () => mockDispatch,
}));

jest.mock("../../../redux-tool-kit/hooks/useAppSelector", () => ({
    useAppSelector: (selector: (state: unknown) => unknown) => selector({}),
}));

jest.mock("../../../redux-tool-kit/reparacion", () => ({
    selectReparacionById: () => () => ({ id: "rep-1", data: {} }),
}));

jest.mock("../../../usecases/abandonoReparacion", () => ({
    puedeEnviarAvisoAbandono: () => mockPuedeEnviarAviso,
    puedeCancelarAvisoAbandono: () => mockPuedeCancelarAviso,
    puedeConfirmarAbandono: () => mockPuedeAbandonar,
    obtenerFechaHabilitacionAbandono: () => Date.now(),
}));

jest.mock("../../../hooks/useHistory", () => ({
    useHistory: () => ({
        push: jest.fn(),
        replace: mockHistoryReplace,
        goBack: mockHistoryGoBack,
    }),
}));

jest.mock("../../Modal/useModal", () => ({
    useModal: () => ({ openModal: mockOpenModal }),
}));

jest.mock("../../../redux-tool-kit/reparacion/reparacion.actions", () => ({
    enviarAvisoAbandonoAsync: jest.fn((id: string) => ({ type: "enviarAviso", payload: id })),
    cancelarAvisoAbandonoAsync: jest.fn((id: string) => ({ type: "cancelarAviso", payload: id })),
    cambiarEstadoReparacionAsync: jest.fn((payload) => ({ type: "cambiarEstado", payload })),
    eliminarReparacionAsync: jest.fn((id: string) => ({ type: "eliminar", payload: id })),
    crearAmpliacionReparacionAsync: jest.fn(),
}));

describe("ReparacionAcciones", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPuedeEnviarAviso = false;
        mockPuedeCancelarAviso = false;
        mockPuedeAbandonar = true;
        (enviarAvisoAbandonoAsync as unknown as jest.Mock).mockImplementation(
            (id: string) => ({ type: "enviarAviso", payload: id })
        );
        (cancelarAvisoAbandonoAsync as unknown as jest.Mock).mockImplementation(
            (id: string) => ({ type: "cancelarAviso", payload: id })
        );
        (cambiarEstadoReparacionAsync as unknown as jest.Mock).mockImplementation(
            (payload) => ({ type: "cambiarEstado", payload })
        );
        (eliminarReparacionAsync as unknown as jest.Mock).mockImplementation(
            (id: string) => ({ type: "eliminar", payload: id })
        );
        mockDispatch.mockImplementation((action) => {
            if (["enviarAviso", "cancelarAviso", "cambiarEstado"].includes(action?.type)) {
                return Promise.resolve({ meta: { requestStatus: "fulfilled" } });
            }
            return { unwrap: () => Promise.resolve() };
        });
    });

    it("confirma el abandono definitivo sin enviar otro email", async () => {
        render(<ReparacionAcciones reparacionId="rep-1" isAdmin />);

        fireEvent.click(screen.getByRole("button", { name: "Marcar como Abandonado" }));
        expect(cambiarEstadoReparacionAsync).not.toHaveBeenCalled();
        const confirmCallback = mockOpenModal.mock.calls[0][0].confirmCallback;

        await act(async () => {
            await confirmCallback();
        });

        expect(cambiarEstadoReparacionAsync).toHaveBeenCalledWith({
            reparacionId: "rep-1",
            nuevoEstado: "Abandonado",
            enviarEmail: false,
        });
        expect(mockOpenModal).toHaveBeenLastCalledWith(expect.objectContaining({
            tipo: "success",
            titulo: "Drone Abandonado",
        }));
    });

    it("envía el aviso sin cambiar el estado", async () => {
        mockPuedeEnviarAviso = true;
        mockPuedeAbandonar = false;

        render(<ReparacionAcciones reparacionId="rep-1" isAdmin />);

        fireEvent.click(screen.getByRole("button", { name: "Enviar aviso de abandono" }));
        expect(enviarAvisoAbandonoAsync).not.toHaveBeenCalled();
        const confirmCallback = mockOpenModal.mock.calls[0][0].confirmCallback;

        await act(async () => {
            await confirmCallback();
        });

        expect(enviarAvisoAbandonoAsync).toHaveBeenCalledWith("rep-1");
        expect(cambiarEstadoReparacionAsync).not.toHaveBeenCalled();
    });

    it("cancela un aviso activo sin cambiar el estado", async () => {
        mockPuedeCancelarAviso = true;
        mockPuedeAbandonar = false;

        render(<ReparacionAcciones reparacionId="rep-1" isAdmin />);

        fireEvent.click(screen.getByRole("button", { name: "Cancelar aviso de abandono" }));
        const confirmCallback = mockOpenModal.mock.calls[0][0].confirmCallback;

        await act(async () => {
            await confirmCallback();
        });

        expect(cancelarAvisoAbandonoAsync).toHaveBeenCalledWith("rep-1");
        expect(cambiarEstadoReparacionAsync).not.toHaveBeenCalled();
    });

    it("oculta las acciones cuando ninguna condición está cumplida", () => {
        mockPuedeAbandonar = false;

        render(<ReparacionAcciones reparacionId="rep-1" isAdmin />);

        expect(screen.queryByRole("button", { name: "Enviar aviso de abandono" })).toBeNull();
        expect(screen.queryByRole("button", { name: "Cancelar aviso de abandono" })).toBeNull();
        expect(screen.queryByRole("button", { name: "Marcar como Abandonado" })).toBeNull();
    });

    it("reemplaza el detalle eliminado por la lista de reparaciones", async () => {
        render(<ReparacionAcciones reparacionId="rep-1" isAdmin />);

        fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
        const confirmCallback = mockOpenModal.mock.calls[0][0].confirmCallback;

        await act(async () => {
            await confirmCallback();
        });

        expect(eliminarReparacionAsync).toHaveBeenCalledWith("rep-1");
        expect(mockHistoryReplace).toHaveBeenCalledWith("/inicio/reparaciones");
        expect(mockHistoryGoBack).not.toHaveBeenCalled();
    });
});