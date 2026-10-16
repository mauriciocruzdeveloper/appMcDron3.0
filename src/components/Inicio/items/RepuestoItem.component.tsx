import React from 'react';
import { useAppSelector } from 'redux-tool-kit/hooks/useAppSelector';
import { selectModelosNombresByRepuestoId } from 'redux-tool-kit/repuesto/repuesto.selectors';
import { Repuesto } from '../../../types/repuesto';
import RepuestoCard from '../../RepuestoCard.component';

interface RepuestoItemProps {
  repuesto: Repuesto & { vecesUsado?: number };
  onClick: () => void;
}

const RepuestoItem = ({ repuesto, onClick }: RepuestoItemProps): React.ReactElement => {
  const modelosNombres = useAppSelector(selectModelosNombresByRepuestoId(repuesto.id));

  return (
    <RepuestoCard
      repuesto={repuesto}
      modelosNombres={modelosNombres}
      estado="Agotado"
      vecesUsado={repuesto.vecesUsado || 0}
      onClick={onClick}
    />
  );
};

export default RepuestoItem;
