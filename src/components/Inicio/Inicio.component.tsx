import React from 'react';
import { usePermissions } from 'hooks/usePermissions';
import InicioAdmin from './InicioAdmin.component';
import InicioCliente from './InicioCliente.component';

interface InicioProps {
  admin: boolean;
}

/**
 * Componente orquestador de Inicio
 * Decide qué vista mostrar según el rol del usuario
 */
const Inicio = (props: InicioProps): React.ReactElement => {
  const { currentRole } = usePermissions();

  console.log('INICIO - Role:', currentRole);

  // Admin ve el dashboard operativo completo
  if (currentRole === 'admin') {
    return <InicioAdmin />;
  }

  // Cliente y Partner ven sus reparaciones en curso
  // (Partner tendrá su propia vista en el futuro)
  return <InicioCliente />;
};

export default Inicio;
