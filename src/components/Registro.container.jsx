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
    admin: false,
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
      openModal({
        mensaje: `Error de registro: ${result.error.message}`,
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
