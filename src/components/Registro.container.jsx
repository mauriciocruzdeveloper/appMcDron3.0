import { useState } from "react";
import { useHistory } from "../hooks/useHistory";
import RegistroPresentational from "./Registro.presentational";
import { registroAsync } from "../redux-tool-kit/app/app.actions";
import { useAppDispatch } from "../redux-tool-kit/hooks/useAppDispatch";
import { useModal } from "./Modal/useModal";

export default function Registro() {
  console.log("REGISTRO container");

  const dispatch = useAppDispatch();
  const history = useHistory();

  const {
    openModal,
  } = useModal();

  const INITIAL_REGISTRO_DATA = {
    role: 'cliente',
    email: '',
    password: '',
    password2: '',
    NombreUsu: '',
    ApellidoUsu: ''
  };

  const [registroData, setRegistroData] = useState(INITIAL_REGISTRO_DATA);

  const changeInputRegistro = target => setRegistroData({
    ...registroData,
    [target.id]: target.value
  });

  const handleRegistro = async () => {
    const result = await dispatch(registroAsync(registroData));
    if (result.meta.requestStatus === 'fulfilled') {
      openModal({ // TODO: verificar
        mensaje: 'Verifique su email para completar el registro',
        titulo: 'Registro',
        tipo: 'warning',
      });
      history.push("/login");
    } else {
      // Extraer mensaje de error de forma segura
      let errorMessage = 'Error desconocido en el registro';
      
      if (result.error) {
        // Intentar extraer el mensaje del objeto de error
        const errorObj = result.error.message;
        
        if (typeof errorObj === 'string') {
          errorMessage = errorObj;
        } else if (errorObj && typeof errorObj === 'object') {
          // Si es un objeto, intentar extraer el mensaje
          if (errorObj.error) {
            errorMessage = errorObj.error;
            // Si hay detalles, agregarlos
            if (errorObj.details && errorObj.details.message) {
              errorMessage += ': ' + errorObj.details.message;
            }
          } else if (errorObj.name) {
            errorMessage = errorObj.name;
          } else if (errorObj.message) {
            errorMessage = errorObj.message;
          } else {
            // Como último recurso, convertir a JSON legible
            errorMessage = JSON.stringify(errorObj, null, 2);
          }
        } else if (typeof result.error === 'string') {
          errorMessage = result.error;
        }
      }
      
      openModal({
        mensaje: `Error de registro:\n${errorMessage}`,
        titulo: 'Error',
        tipo: 'danger',
      });
    }
  };

  const handleLoguearse = () => {
    history.push("/login");
  }


  return (
    registroData && handleRegistro ?
      <RegistroPresentational
        registroData={registroData}
        changeInputRegistro={changeInputRegistro}
        handleLoguearse={handleLoguearse}
        handleRegistro={handleRegistro}
      /> : null
  );
}
