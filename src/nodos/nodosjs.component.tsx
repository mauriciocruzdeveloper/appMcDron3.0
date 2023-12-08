// Este debería ser un componente wrapper, que dentro tenga un route.
// La idea es que el nodo enrute. Y el nodo vaya cargando el objeto de nodos en la media que

import { ReactNode } from "react";

// se van montando. Todo esto sucedería en el arhivo routes.
interface NodosComponentProps {
    match: any;
    admin: boolean;
    Component: ReactNode;
}

export const NodosComponent = () => {
    return(
        <div></div>
        // <Route exact path={`${match.path}`} render = {props => <Inicio {...props} admin = {admin}/>} />
    );
}