import React, { useState } from 'react';
import { useAppSelector } from 'redux-tool-kit/hooks/useAppSelector';
import { selectModelosNombresByRepuestoId } from 'redux-tool-kit/repuesto/repuesto.selectors';
import { ImageGallery } from '../../ImageGallery';
import { getThumbnailUrl } from '../../../utils/imageUtils';

interface RepuestoItemProps {
  repuesto: any;
  onClick: () => void;
}

const RepuestoItem = ({ repuesto, onClick }: RepuestoItemProps): React.ReactElement => {
  const modelosNombres = useAppSelector(selectModelosNombresByRepuestoId(repuesto.id));
  const vecesUsado = repuesto.vecesUsado || 0;
  const [showFotoModal, setShowFotoModal] = useState(false);

  return (
    <>
      <div
        className='list-group-item list-group-item-action mb-2'
        onClick={onClick}
        style={{ cursor: 'pointer' }}
      >
        <div className='d-flex justify-content-between align-items-center gap-2'>
          {repuesto.data?.FotoRepu && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowFotoModal(true);
              }}
              title="Haga clic para ver la foto"
              style={{ cursor: 'pointer' }}
            >
              <img
                src={getThumbnailUrl(repuesto.data.FotoRepu)}
                alt={repuesto.data.NombreRepu}
                className='rounded border me-1 shadow-sm'
                style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== repuesto.data.FotoRepu) {
                    target.src = repuesto.data.FotoRepu;
                  }
                }}
              />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h6 className='mb-1'>{repuesto.data.NombreRepu}</h6>
            <p className='mb-1 text-muted'>{repuesto.data.ProveedorRepu}</p>
            <small className='text-muted d-block'>
              {modelosNombres.length > 0 ? modelosNombres.join(', ') : 'Sin modelos asignados'}
            </small>
            <small className={`badge mt-1 ${vecesUsado > 0 ? 'bg-info text-dark' : 'bg-secondary'}`}>
              {vecesUsado > 0 
                ? `📊 Usado ${vecesUsado} ${vecesUsado === 1 ? 'vez' : 'veces'} en reparaciones`
                : '⚪ No usado en reparaciones'
              }
            </small>
          </div>
          <span
            className='badge ms-2'
            style={{
              backgroundColor: '#dc3545',
              color: 'white'
            }}
          >
            Agotado
          </span>
        </div>
      </div>

      {showFotoModal && repuesto.data?.FotoRepu && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}
          onClick={() => setShowFotoModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content bg-dark text-white border-0 shadow-lg">
              <div className="modal-header border-bottom border-secondary py-2">
                <h6 className="modal-title mb-0">{repuesto.data.NombreRepu}</h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowFotoModal(false)}
                ></button>
              </div>
              <div className="modal-body p-3 text-center">
                <ImageGallery
                  images={[repuesto.data.FotoRepu]}
                  isAdmin={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RepuestoItem;
