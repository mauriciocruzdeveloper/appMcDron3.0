/**
 * Types para Tabs de Reparación
 * 
 * Define las props comunes y específicas para cada tab.
 */

import { ReparacionType } from '../../../types/reparacion';
import { Usuario } from '../../../types/usuario';
import { Drone } from '../../../types/drone';
import { ModeloDrone } from '../../../types/modeloDrone';

/**
 * Props base para todos los tabs
 */
export interface BaseTabProps {
  reparacion: ReparacionType;
  isAdmin: boolean;
}

/**
 * Props para GeneralTab
 */
export interface GeneralTabProps extends BaseTabProps {
  usuario: Usuario | null;
  drone: Drone | null;
  modelo: ModeloDrone | null;
}

/**
 * Props para DiagnosticoTab
 */
export type DiagnosticoTabProps = BaseTabProps;

/**
 * Props para PresupuestoTab
 */
export type PresupuestoTabProps = BaseTabProps;

/**
 * Props para ReparacionTab
 */
export type ReparacionTabProps = BaseTabProps;

/**
 * Props para GaleriaTab
 */
export type GaleriaTabProps = BaseTabProps;

/**
 * Props para IntervencionesTab
 */
export type IntervencionesTabProps = BaseTabProps;

/**
 * Props para FinalizacionTab
 */
export type FinalizacionTabProps = BaseTabProps;

/**
 * Configuración de un tab
 */
export interface TabConfig {
  id: string;
  label: string;
  icon: string;
  component: React.LazyExoticComponent<React.ComponentType<BaseTabProps>>;
  visibleFrom: number; // etapa mínima
  badge?: () => number;
}
