/// <reference types="jest" />

import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
    obtenerSeccionIdPorEstado,
    ReparacionSeccionColapsable,
    ReparacionSeccionesProvider,
} from "./ReparacionSeccionColapsable";

const ContenidoConEstado: React.FC = () => {
    const [valor, setValor] = useState("");

    return (
        <input
            aria-label="Campo de prueba"
            value={valor}
            onChange={event => setValor(event.target.value)}
        />
    );
};

describe("ReparacionSeccionColapsable", () => {
    it("muestra abierta y coloreada la sección del estado actual", () => {
        render(
            <ReparacionSeccionesProvider seccionActivaId="seccion-prueba" colorEstado="#007aff">
                <ReparacionSeccionColapsable id="seccion-prueba" titulo="PRUEBA">
                    <span>Contenido</span>
                </ReparacionSeccionColapsable>
            </ReparacionSeccionesProvider>
        );

        const boton = screen.getByRole("button", { name: "PRUEBA" });
        const contenido = screen.getByText("Contenido").parentElement;

        expect(boton.getAttribute("aria-expanded")).toBe("true");
        expect(boton.getAttribute("aria-controls")).toBe("seccion-prueba-contenido");
        expect(contenido?.id).toBe("seccion-prueba-contenido");
        expect(contenido?.hasAttribute("hidden")).toBe(false);
        expect(boton.parentElement?.style.backgroundColor).toBe("rgb(0, 122, 255)");
    });

    it("muestra colapsadas por defecto las secciones que no están activas", () => {
        render(
            <ReparacionSeccionesProvider seccionActivaId="otra-seccion" colorEstado="#007aff">
                <ReparacionSeccionColapsable id="seccion-prueba" titulo="PRUEBA">
                    <ContenidoConEstado />
                </ReparacionSeccionColapsable>
            </ReparacionSeccionesProvider>
        );

        const boton = screen.getByRole("button", { name: "PRUEBA" });
        const campo = screen.getByLabelText("Campo de prueba") as HTMLInputElement;
        expect(boton.getAttribute("aria-expanded")).toBe("false");
        expect(campo.parentElement?.hasAttribute("hidden")).toBe(true);

        fireEvent.click(boton);
        fireEvent.change(campo, { target: { value: "valor conservado" } });

        fireEvent.click(boton);
        expect(boton.getAttribute("aria-expanded")).toBe("false");
        expect(campo.parentElement?.hasAttribute("hidden")).toBe(true);

        fireEvent.click(boton);
        expect(campo.value).toBe("valor conservado");
        expect(campo.parentElement?.hasAttribute("hidden")).toBe(false);
    });

    it("asocia el estado Repuestos con su sección homónima", () => {
        expect(obtenerSeccionIdPorEstado("Repuestos")).toBe("seccion-repuestos");
    });
});