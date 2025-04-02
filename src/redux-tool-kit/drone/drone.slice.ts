import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Drone } from '../../types/drone';

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
  }
});

export const {
  setDrones,
  setSelectedDrone,
  setFilter,
  setIsFetchingDrone
} = droneSlice.actions;

export default droneSlice.reducer;
