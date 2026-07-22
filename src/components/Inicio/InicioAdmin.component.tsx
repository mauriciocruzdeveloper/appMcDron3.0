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
    <div className='app-page'>
      <header className='app-page-header'>
        <div>
          <h3 className='mb-1'>Inicio</h3>
          <p className='mb-0 text-muted'>Panel operativo</p>
        </div>
        <img className='app-page-logo' src='./img/logo.png' alt='McDron' />
      </header>

      <main className='app-page-content dashboard-content'>
        <div className='dashboard-actions'>
          <CasosDeUsoSection />
        </div>

        <div className='dashboard-grid'>
          <section className='dashboard-main' aria-label='Reparaciones'>
            <div className='dashboard-panel dashboard-panel-priority'>
              <ReparacionesPrioritariasSection />
            </div>
            <div className='dashboard-panel'>
              <ReparacionesEsperandoRepuestosSection />
            </div>
          </section>

          <aside className='dashboard-sidebar' aria-label='Inventario'>
            <div className='dashboard-panel'>
              <RepuestosAgotadosSection />
            </div>
            <div className='dashboard-panel'>
              <RepuestosPedidosSection />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default InicioAdmin;
