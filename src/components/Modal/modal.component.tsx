import React, { useEffect, useRef } from 'react';
import { useModal } from './useModal';

export const ModalComponent: React.FC = () => {
    const {
        isOpen,
        titulo,
        mensaje,
        tipo,
        closeModal,
        onConfirm,
    } = useModal();

    const dialogRef = useRef<HTMLDialogElement>(null);

    // Abrir/cerrar el <dialog> nativo en sincronía con el estado Redux
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (isOpen) {
            if (!dialog.open) dialog.showModal();
        } else {
            if (dialog.open) dialog.close();
        }
    }, [isOpen]);

    // Cerrar al hacer click en el backdrop (fuera del dialog)
    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        const rect = dialogRef.current?.getBoundingClientRect();
        if (!rect) return;
        const { clientX, clientY } = e;
        if (
            clientX < rect.left || clientX > rect.right ||
            clientY < rect.top  || clientY > rect.bottom
        ) {
            closeModal();
        }
    };

    const handleOnConfirm = () => {
        onConfirm?.();
        closeModal();
    };

    // Mapa de variante → clase de alert
    const variantClass: Record<string, string> = {
        primary:   'alert-primary',
        secondary: 'alert-secondary',
        success:   'alert-success',
        danger:    'alert-danger',
        warning:   'alert-warning',
        info:      'alert-info',
        light:     'alert-light',
        dark:      'alert-dark',
    };

    return (
        <dialog
            ref={dialogRef}
            className="mc-modal"
            onClick={handleBackdropClick}
            onCancel={(e) => { e.preventDefault(); closeModal(); }}
        >
            {/* Título / Header */}
            <div className={`mc-modal-header alert ${variantClass[tipo] ?? 'alert-primary'} mb-0`}
                style={{ borderRadius: '0.5rem 0.5rem 0 0', margin: 0, borderBottom: 'none' }}
            >
                <strong>{titulo}</strong>
            </div>

            {/* Body */}
            <div className="mc-modal-body">
                {mensaje}
            </div>

            {/* Footer */}
            <div className="mc-modal-footer">
                <button
                    className="btn bg-bluemcdron text-white"
                    onClick={closeModal}
                    type="button"
                >
                    Cerrar
                </button>
                {onConfirm && (
                    <button
                        className="btn bg-bluemcdron text-white"
                        onClick={handleOnConfirm}
                        type="button"
                    >
                        Confirmar
                    </button>
                )}
            </div>
        </dialog>
    );
};
