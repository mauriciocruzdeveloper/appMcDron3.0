import { combineReducers } from "redux";
import AppReducer from "./App/App.reducer";

// Aquí se centralizan los reducers. Cuando se importan los reducers desde otros archivos, se hace desde éste.
export default combineReducers({ 
    app: AppReducer
});