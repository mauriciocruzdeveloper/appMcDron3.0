import { useState } from "react";
import { connect } from "react-redux";
import { registro } from "../redux-DEPRECATED/root-actions";
import history from "../history";
import RegistroPresentational from "./Registro.presentational";

const Registro = ({ 
  registro,
}) => {
  console.log("REGISTRO container");

  const INITIAL_REGISTRO_DATA = {
    admin: false,
    email: '',
    password: '',
    password2: '',
    NombreUsu: '',
    ApellidoUsu: ''
  };

  const [ registroData, setRegistroData ] = useState(INITIAL_REGISTRO_DATA);

  const changeInputRegistro = target => setRegistroData({ 
    ...registroData, 
    [target.id]: target.value 
  });

  const handleRegistro = async () => {
    await registro(registroData);
    history.push("/login");
  };

  const handleLoguearse = () => {
    history.push("/login");
  }


  return (
    registroData && handleRegistro   ? 
    <RegistroPresentational 
      registroData={registroData}
      changeInputRegistro={changeInputRegistro}
      handleLoguearse={handleLoguearse}
      handleRegistro={handleRegistro}
    /> : null
  );
};

const mapStateToProps = (state) => ({
  isFetching: state.app.isFetching,
});

export default connect(mapStateToProps, { registro })(Registro);