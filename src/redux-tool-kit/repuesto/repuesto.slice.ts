import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SelectOption } from '../../types/selectOption';
import { Repuesto } from '../../types/repuesto';
import { guardarRepuestoAsync, eliminarRepuestoAsync } from './repuesto.actions';

// Tipos para el estado inicial
interface RepuestoState {
    filter: string;
    coleccionRepuestos: Repuesto[];
    modelosDroneSelect: SelectOption[];
    proveedoresSelect: SelectOption[];
}

// Estado inicial
const initialState: RepuestoState = {
    filter: '',
    coleccionRepuestos: [],
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
            state.coleccionRepuestos = action.payload;
        },
        setRepuesto: (state, action: PayloadAction<Repuesto>) => {
            const index = state.coleccionRepuestos.findIndex(repuesto => repuesto.id === action.payload.id);
            if (index !== -1) {
                state.coleccionRepuestos[index] = action.payload;
            } else {
                state.coleccionRepuestos.push(action.payload);
            }
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
            const index = state.coleccionRepuestos.findIndex(repuesto => repuesto.id === action.payload.id);
            if (index !== -1) {
                state.coleccionRepuestos[index] = action.payload;
            } else {
                state.coleccionRepuestos.push(action.payload);
            }
        });
        builder.addCase(eliminarRepuestoAsync.fulfilled, (state, action) => {
            state.coleccionRepuestos = state.coleccionRepuestos.filter(
                repuesto => repuesto.id !== action.payload
            );
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
