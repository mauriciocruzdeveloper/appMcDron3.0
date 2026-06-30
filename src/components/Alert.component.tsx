import React, { useEffect, useRef } from 'react';

interface AlertComponentProps {
    show: boolean;
    titulo: string;
    mensaje: string;
    tipo: string;
}

const AlertComponent = (props: AlertComponentProps) => {
    const { show } = props;
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (show) {
            if (!dialog.open) dialog.showModal();
        } else {
            if (dialog.open) dialog.close();
        }
    }, [show]);

    return (
        <dialog ref={dialogRef} className="mc-modal" style={{ textAlign: 'center' }}>
            <div className="mc-modal-body">
                <span
                    className="spinner-grow"
                    role="status"
                    style={{ float: 'right' }}
                />
            </div>
        </dialog>
    );
};

export default AlertComponent;