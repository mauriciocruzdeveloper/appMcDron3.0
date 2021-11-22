// Este archivo centraliza las acciones
import { 
    login, 
    logout,
    emailOnChangeLogin,
    passwordOnChangeLogin
} from "./Login/Login.actions";

import { 
    agregarEmpleado, 
    getEmpleados, 
    borrarEmpleado, 
    nombreOnChange,
    emailOnChange,
    passwordOnChange,
    adminOnChange,
    cargaFormAlta,
    cargaFormModifica
 } from "./Empleados/Empleados.actions";

 import {
     agregarTipoJornada,
     getTiposJornada,
     borrarTipoJornada,
     tipoOnChange,
     cargaFormTipoJornada
 } from './TipoJornada/TipoJornada.actions';

 import {
    agregarTurnos,
    getTurnos,
    getTurnosPorMes,
    borrarTurnos,
    tipoTurnoOnChange,
    // empleadoOnChange,
    horarioOnChange,
    // diaOnChange,
    // mesOnChange,
    // anioOnChange,
    cargaFormTurnos,
    turnoPermitido
 } from './Turnos/Turnos.actions';

export { 
    login, 
    logout, 
    agregarEmpleado,
    getEmpleados,
    borrarEmpleado,
    nombreOnChange,
    emailOnChange,
    passwordOnChange,
    adminOnChange,
    cargaFormAlta,
    cargaFormModifica,
    agregarTipoJornada,
    getTiposJornada,
    borrarTipoJornada,
    tipoOnChange,
    cargaFormTipoJornada,
    emailOnChangeLogin,
    passwordOnChangeLogin,
    agregarTurnos,
    getTurnos,
    getTurnosPorMes,
    borrarTurnos,
    tipoTurnoOnChange,
    // empleadoOnChange,
    horarioOnChange,
    // diaOnChange,
    // mesOnChange,
    // anioOnChange,
    cargaFormTurnos,
    turnoPermitido
}