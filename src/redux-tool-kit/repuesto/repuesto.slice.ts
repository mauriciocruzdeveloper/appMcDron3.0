import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SelectOption } from '../../types/selectOption';
import { Repuesto } from '../../types/repuesto';

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
});

// Exportar acciones síncronas
export const {
    setFilter,
    setRepuestos,
    setModelosDroneSelect,
    setProveedoresSelect,
} = repuestoSlice.actions;

// Exportar el reducer por defecto
export default repuestoSlice.reducer;
