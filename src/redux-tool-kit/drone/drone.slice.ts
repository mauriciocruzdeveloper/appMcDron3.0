import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Drone } from '../../types/drone';
import { guardarDroneAsync, eliminarDroneAsync } from './drone.actions';

interface DroneState {
  coleccionDrones: Drone[];
  selectedDrone: Drone | null;
  filter: string;
  isFetchingDrone: boolean;
}

const initialState: DroneState = {
  coleccionDrones: [],
  selectedDrone: null,
  filter: '',
  isFetchingDrone: false
};

export const droneSlice = createSlice({
  name: 'drone',
  initialState,
  reducers: {
    setDrones: (state, action: PayloadAction<Drone[]>) => {
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
    }
  },
  extraReducers: (builder) => {
    builder.addCase(guardarDroneAsync.fulfilled, (state, action) => {
      const index = state.coleccionDrones.findIndex(drone => drone.id === action.payload.id);
      if (index !== -1) {
        state.coleccionDrones[index] = action.payload;
      } else {
        state.coleccionDrones.push(action.payload);
      }
    });
    builder.addCase(eliminarDroneAsync.fulfilled, (state, action) => {
      state.coleccionDrones = state.coleccionDrones.filter(
        drone => drone.id !== action.payload
      );
    });
  }
});

export const {
  setDrones,
  setSelectedDrone,
  setFilter,
  setIsFetchingDrone
} = droneSlice.actions;

export default droneSlice.reducer;
