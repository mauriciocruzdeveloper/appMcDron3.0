import React from 'react';
import CasosDeUsoSection from './CasosDeUsoSection.component';
import ReparacionesPrioritariasSection from './ReparacionesPrioritariasSection.component';
import ReparacionesEsperandoRepuestosSection from './ReparacionesEsperandoRepuestosSection.component';
import RepuestosAgotadosSection from './RepuestosAgotadosSection.component';
import RepuestosPedidosSection from './RepuestosPedidosSection.component';

interface InicioProps {
  admin: boolean;
}

const Inicio = (props: InicioProps): React.ReactElement => {
  const { admin } = props;

  console.log('INICIO');

  return (
    <div className='p-4'>
      <img className='mb-4' src='./img/logo.png' alt='' width='100%' max-width='100px' />
      
      <CasosDeUsoSection />
      <ReparacionesPrioritariasSection />
      <ReparacionesEsperandoRepuestosSection />
      <RepuestosAgotadosSection />
      <RepuestosPedidosSection />
    </div>
  )
};

export default Inicio;
