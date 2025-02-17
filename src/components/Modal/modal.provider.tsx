import { useState } from "react";
import { ModalContext } from "./modal.context";

export interface OpenModalProps {
    titulo: string;
    mensaje: string;
    tipo: string;
    confirmCallback?: () => Promise<void> | void;
}

interface ValuesProps {
    isOpen: boolean;
    titulo: string;
    mensaje: string;
    tipo: string;
    onConfirm?: () => Promise<void> | void;
}

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [values, setValues] = useState<ValuesProps>({
        isOpen: false,
        titulo: '',
        mensaje: '',
        tipo: '',
    });

    const openModal = ({ titulo, mensaje, tipo, confirmCallback }: OpenModalProps) => {
        setValues({ isOpen: true, titulo, mensaje, tipo, onConfirm: confirmCallback });
    };

    const closeModal = () => {
        setValues({ isOpen: false, titulo: '', mensaje: '', tipo: '', onConfirm: undefined });
    };

    return (
        <ModalContext.Provider value={{ ...values, openModal, closeModal}}>
            {children}
        </ModalContext.Provider>
    );
};