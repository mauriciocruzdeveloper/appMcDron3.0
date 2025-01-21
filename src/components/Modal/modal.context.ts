import { createContext } from 'react';
import { OpenModalProps } from './modal.provider';

type ModalContextType = {
  isOpen: boolean;
  titulo: string; 
  mensaje: string;
  tipo: string;
  openModal: (props: OpenModalProps) => void;
  closeModal: () => void;
  onConfirm?: () => void;
};

export const ModalContext = createContext<ModalContextType | undefined>(undefined);
