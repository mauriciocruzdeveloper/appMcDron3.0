/// <reference types="jest" />

import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ReparacionAcciones } from "./ReparacionAcciones";
import { eliminarReparacionAsync } from "../../../redux-tool-kit/reparacion/reparacion.actions";

const mockDispatch = jest.fn();
const mockOpenModal = jest.fn();
const mockHistoryReplace = jest.fn();
const mockHistoryGoBack = jest.fn();

jest.mock("../../../redux-tool-kit/hooks/useAppDispatch", () => ({
    useAppDispatch: () => mockDispatch,
}));

jest.mock("../../../redux-tool-kit/hooks/useAppSelector", () => ({
    useAppSelector: () => ({ id: "rep-1", data: {} }),
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
    eliminarReparacionAsync: jest.fn((id: string) => ({ type: "eliminar", payload: id })),
    crearAmpliacionReparacionAsync: jest.fn(),
}));

describe("ReparacionAcciones", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDispatch.mockReturnValue({ unwrap: () => Promise.resolve() });
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