// React
import { useEffect, useCallback, useState } from "react";
// 
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import history from "../history";
// Actions
import { 
    getReparacion,
    guardarReparacion,
    eliminarReparacion,
    abreModal,
    confirm,
  } from "../redux/root-actions";
// No se si está bien. Me gusta más que lo traiga la persistencia mediante una acción.
import { estados } from '../datos/estados.json';
// Components
import ReparacionPresentational from './Reparacion.presentational';

const Reparacion = ({ 
    getReparacion,
    guardarReparacion,
    eliminarReparacion,
    abreModal,
    confirm,
    coleccionReparaciones,
}) => {

    console.log("REPARACION container");

    const { id } = useParams();

    const [ reparacion, setReparacion ] = useState();

    const inicializarFormulario = useCallback(async () => {
        coleccionReparaciones?.length
        ? setReparacion(coleccionReparaciones.find(reparacion => reparacion.id == id))
        : await getReparacion(id)
                .catch(error => {
                    abreModal("Error buscando Reparación ", `Código - ${error.code}`, "danger" );
                    history.goBack();
                })
    // Cuando cambia la colección de reparaciones, el escuchador lo ve, y se actualiza la colección
    // entonces la pongo como dependencia del useCallback para que se vuelva a renderizar la función
    // y vuelva a setear la reparación como está en la actualidad.
    }, [coleccionReparaciones]);
    
    useEffect(() => {
        inicializarFormulario();
    }, [inicializarFormulario]);
    
    const changeInputRep = target => {
        let value = null;
        if(target.type == "date"){
            let anio = target.value.substr(0, 4);
            let mes = target.value.substr(5, 2)-1;
            let dia = target.value.substr(8, 2);
            value = new Date(anio, mes, dia).getTime()+10800001; // Se agrega este número para que de bien la fecha.
        }else{
            value = target.value;
        };
        setReparacion({ 
            ...reparacion, 
            data: {
                ...reparacion.data,
                [target.id]: value
            } 
        });
    };
    // Tengo que hacer una función aparte porque cuando modifica el estado de la reparación
    // también tengo que modificar la prioridad. Se podría hacer diferente quizás con 
    // id, value y otra prop del botón.
    const setEstado = estado => {
        setReparacion({
            ...reparacion, 
            data: {
                ...reparacion.data,
                EstadoRep: estado.nombre, 
                PrioridadRep: estado.prioridad 
            }
        });
    }

    const handleGuardarReparacion = () => {
        confirm(
            "Guardar Reparación?",
            "Atención",
            "warning",
            () => {
                guardarReparacion(reparacion)
                .then(reparacion => abreModal("Guardado con éxito", "Reparación: " + reparacion.id, "success" ))
                .catch(error => abreModal("Error al guardar ", `Código - ${error.code}`, "danger" ));
            }
        );
    }

    const handleEliminarReparacion = () => {
        confirm(
            "Eliminar Reparación?",
            "Atención",
            "danger",
            () => {
                console.log("llega al callBacK de confirm") ;
                eliminarReparacion(reparacion.id)
                .then(id => {
                        abreModal("Reparación eliminada con éxito", "Reparación: " + id, "success" );
                        history.goBack();
                })
                .catch(error => abreModal("Error al guardar ", `Código - ${error.code}`, "danger" ))
            }
        );
    }

    return(
        // Sólo se renderiza el commponente presentacional cuando están los datos necesarios ya cargados.
        estados && reparacion ?
        <ReparacionPresentational
            reparacion={reparacion}
            estados={estados}
            setEstado={setEstado}
            changeInputRep={changeInputRep}
            handleGuardarReparacion={handleGuardarReparacion}
            handleEliminarReparacion={handleEliminarReparacion}
        /> : null
    )
}

const mapStateToProps = (state) => ({
    coleccionReparaciones: state.app?.coleccionReparaciones
});


export default connect(
    mapStateToProps, 
    {
        getReparacion,
        guardarReparacion, 
        eliminarReparacion, 
        abreModal,
        confirm,
    })(Reparacion);