import React from 'react';
import { useAppSelector } from 'redux-tool-kit/hooks/useAppSelector';
import { selectModelosNombresByRepuestoId } from 'redux-tool-kit/repuesto/repuesto.selectors';
import { Repuesto } from '../../../types/repuesto';
import RepuestoCard from '../../RepuestoCard.component';

interface RepuestoPedidoItemProps {
  repuesto: Repuesto & { vecesUsado?: number; cantidadPedida: number };
  onClick: () => void;
}

const RepuestoPedidoItem = ({ repuesto, onClick }: RepuestoPedidoItemProps): React.ReactElement => {
  const modelosNombres = useAppSelector(selectModelosNombresByRepuestoId(repuesto.id));

  return (
    <RepuestoCard
      repuesto={repuesto}
      modelosNombres={modelosNombres}
      estado="En Pedido"
      cantidadPedida={repuesto.cantidadPedida}
      vecesUsado={repuesto.vecesUsado || 0}
      onClick={onClick}
    />
  );
};

export default RepuestoPedidoItem;
