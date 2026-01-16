import React from 'react';
import CasosDeUsoSection from './CasosDeUsoSection.component';
import ReparacionesPrioritariasSection from './ReparacionesPrioritariasSection.component';
import ReparacionesEsperandoRepuestosSection from './ReparacionesEsperandoRepuestosSection.component';
import RepuestosAgotadosSection from './RepuestosAgotadosSection.component';
import RepuestosPedidosSection from './RepuestosPedidosSection.component';

/**
 * Vista de inicio para administradores
 * Muestra el dashboard operativo completo con casos de uso, 
 * reparaciones prioritarias, repuestos, etc.
 */
const InicioAdmin = (): React.ReactElement => {
  return (
    <div className='p-4'>
      <img className='mb-4' src='./img/logo.png' alt='McDron Logo' width='100%' style={{ maxWidth: '100px' }} />
      
      <CasosDeUsoSection />
      <ReparacionesPrioritariasSection />
      <ReparacionesEsperandoRepuestosSection />
      <RepuestosAgotadosSection />
      <RepuestosPedidosSection />
    </div>
  );
};

export default InicioAdmin;
