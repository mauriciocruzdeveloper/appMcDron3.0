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
    <div className='d-flex flex-column' style={{ height: '100vh' }}>
      {/* Header fijo */}
      <div className='p-4 pb-2 bg-white border-bottom' style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <h3 className='mb-0'>Inicio</h3>
      </div>

      {/* Contenido con scroll */}
      <div className='flex-grow-1 overflow-auto'>
        <div className='p-4 pt-3'>
          <img className='mb-4' src='./img/logo.png' alt='McDron Logo' width='100%' style={{ maxWidth: '100px' }} />
          
          <CasosDeUsoSection />
          <ReparacionesPrioritariasSection />
          <ReparacionesEsperandoRepuestosSection />
          <RepuestosAgotadosSection />
          <RepuestosPedidosSection />
        </div>
      </div>
    </div>
  );
};

export default InicioAdmin;
