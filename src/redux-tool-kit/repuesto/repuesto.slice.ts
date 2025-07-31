import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SelectOption } from '../../types/selectOption';
import { Repuesto, Repuestos } from '../../types/repuesto';
import { guardarRepuestoAsync, eliminarRepuestoAsync } from './repuesto.actions';

// Tipos para el estado inicial
interface RepuestoState {
    filter: string;
    coleccionRepuestos: Repuestos;
    modelosDroneSelect: SelectOption[];
    proveedoresSelect: SelectOption[];
}

// Estado inicial
const initialState: RepuestoState = {
    filter: '',
    coleccionRepuestos: {},
    modelosDroneSelect: [],
    proveedoresSelect: [],
};

// ---------------------------------------------------------
// SLICE PRINCIPAL
// ---------------------------------------------------------
const repuestoSlice = createSlice({
    name: 'repuesto',
    initialState,
    reducers: {
        setRepuestos: (state, action: PayloadAction<Repuesto[]>) => {
            // Convertir el array de repuestos a un objeto con ID como clave
            const repuestosObj: Repuestos = {};
            action.payload.forEach(repuesto => {
                repuestosObj[repuesto.id] = repuesto;
            });
            state.coleccionRepuestos = repuestosObj;
        },
        setRepuesto: (state, action: PayloadAction<Repuesto>) => {
            // Actualizar o añadir un repuesto específico
            const repuesto = action.payload;
            state.coleccionRepuestos[repuesto.id] = repuesto;
        },
        setModelosDroneSelect: (state, action: PayloadAction<SelectOption[]>) => {
            state.modelosDroneSelect = action.payload;
        },
        setProveedoresSelect: (state, action: PayloadAction<SelectOption[]>) => {
            state.proveedoresSelect = action.payload;
        },
        setFilter: (state, action: PayloadAction<string>) => {
            state.filter = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(guardarRepuestoAsync.fulfilled, (state, action) => {
            const repuesto = action.payload;
            // Actualizar o añadir el repuesto en la colección
            state.coleccionRepuestos[repuesto.id] = repuesto;
        });
        builder.addCase(eliminarRepuestoAsync.fulfilled, (state, action) => {
            const repuestoId = action.payload;
            // Eliminar el repuesto de la colección
            delete state.coleccionRepuestos[repuestoId];
        });
    },
});

// Exportar acciones síncronas
export const {
    setFilter,
    setRepuestos,
    setRepuesto,
    setModelosDroneSelect,
    setProveedoresSelect,
} = repuestoSlice.actions;

// Exportar el reducer por defecto
export default repuestoSlice.reducer;
