import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";

// Crear un `useDispatch` tipado
export const useAppDispatch: () => AppDispatch = useDispatch;
