import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Drone, Drones } from '../../types/drone';
import { guardarDroneAsync, eliminarDroneAsync, getDroneAsync, getDronesPorModeloDroneAsync, getDronesPorPropietarioAsync } from './drone.actions';

interface DroneState {
  coleccionDrones: Drones;
  selectedDrone: Drone | null;
  filter: string;
  isFetchingDrone: boolean;
}

const initialState: DroneState = {
  coleccionDrones: {},
  selectedDrone: null,
  filter: '',
  isFetchingDrone: false
};

export const droneSlice = createSlice({
  name: 'drone',
  initialState,
  reducers: {
    setDrones: (state, action: PayloadAction<Drone[]>) => {
      // Convierte array a diccionario para optimización O(1)
      state.coleccionDrones = action.payload.reduce((acc, drone) => {
        acc[drone.id] = drone;
        return acc;
      }, {} as Drones);
    },
    setDronesDictionary: (state, action: PayloadAction<Drones>) => {
      state.coleccionDrones = action.payload;
    },
    setSelectedDrone: (state, action: PayloadAction<Drone | null>) => {
      state.selectedDrone = action.payload;
    },
    setFilter: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
    },
    setIsFetchingDrone: (state, action: PayloadAction<boolean>) => {
      state.isFetchingDrone = action.payload;
    },
    addDrone: (state, action: PayloadAction<Drone>) => {
      state.coleccionDrones[action.payload.id] = action.payload;
    },
    updateDrone: (state, action: PayloadAction<Drone>) => {
      if (state.coleccionDrones[action.payload.id]) {
        state.coleccionDrones[action.payload.id] = action.payload;
      }
    },
    removeDrone: (state, action: PayloadAction<string>) => {
      delete state.coleccionDrones[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(guardarDroneAsync.fulfilled, (state, action) => {
      // Acceso O(1) por ID en lugar de findIndex O(n)
      state.coleccionDrones[action.payload.id] = action.payload;
    });
    builder.addCase(eliminarDroneAsync.fulfilled, (state, action) => {
      // Eliminación O(1) por ID en lugar de filter O(n)
      delete state.coleccionDrones[action.payload];
    });
    builder.addCase(getDroneAsync.fulfilled, (state, action) => {
      // Actualizar/agregar drone obtenido
      state.coleccionDrones[action.payload.id] = action.payload;
    });
    builder.addCase(getDronesPorModeloDroneAsync.fulfilled, (state, action) => {
      // Actualizar múltiples drones por modelo
      action.payload.forEach(drone => {
        state.coleccionDrones[drone.id] = drone;
      });
    });
    builder.addCase(getDronesPorPropietarioAsync.fulfilled, (state, action) => {
      // Actualizar múltiples drones por propietario
      action.payload.forEach(drone => {
        state.coleccionDrones[drone.id] = drone;
      });
    });
  }
});

export const {
  setDrones,
  setDronesDictionary,
  setSelectedDrone,
  setFilter,
  setIsFetchingDrone,
  addDrone,
  updateDrone,
  removeDrone,
} = droneSlice.actions;

export default droneSlice.reducer;
