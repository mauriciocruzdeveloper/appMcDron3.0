/**
 * search.types.ts
 * 
 * Tipos TypeScript para el sistema de búsqueda y filtros.
 * Define criterios, filtros, vistas guardadas y resultados.
 * 
 * **Phase 4 - T4.4:** Búsqueda y Filtros Avanzados
 * 
 * @module Types/Search
 */

/**
 * Criterio de ordenamiento
 */
export type SortField =
    | 'fecha'
    | 'estado'
    | 'cliente'
    | 'drone'
    | 'presupuesto'
    | 'prioridad';

/**
 * Dirección de ordenamiento
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Operadores para filtros
 */
export type FilterOperator =
    | 'equals'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'greaterThan'
    | 'lessThan'
    | 'between'
    | 'in'
    | 'notIn';

/**
 * Filtro individual
 */
export interface SearchFilter {
    /** Campo a filtrar */
    field: string;
    
    /** Operador */
    operator: FilterOperator;
    
    /** Valor(es) */
    value: string | number | Date | Array<string | number>;
    
    /** Activo/inactivo */
    enabled: boolean;
}

/**
 * Criterios de búsqueda completos
 */
export interface SearchCriteria {
    /** Texto de búsqueda global */
    query?: string;
    
    /** Filtros aplicados */
    filters: SearchFilter[];
    
    /** Campo de ordenamiento */
    sortBy?: SortField;
    
    /** Dirección de ordenamiento */
    sortDirection?: SortDirection;
    
    /** Número de página (para paginación) */
    page?: number;
    
    /** Tamaño de página */
    pageSize?: number;
}

/**
 * Resultado de búsqueda
 */
export interface SearchResult<T> {
    /** Items encontrados */
    items: T[];
    
    /** Total de resultados (sin paginación) */
    total: number;
    
    /** Página actual */
    page: number;
    
    /** Tamaño de página */
    pageSize: number;
    
    /** Total de páginas */
    totalPages: number;
    
    /** Tiempo de búsqueda (ms) */
    searchTime?: number;
    
    /** Términos resaltados */
    highlights?: Map<string, string[]>;
}

/**
 * Vista guardada de filtros
 */
export interface SavedView {
    /** ID único */
    id: string;
    
    /** Nombre de la vista */
    name: string;
    
    /** Descripción */
    description?: string;
    
    /** Criterios guardados */
    criteria: SearchCriteria;
    
    /** Usuario creador */
    createdBy: string;
    
    /** Fecha de creación */
    createdAt: Date;
    
    /** Es vista pública (compartida) */
    isPublic: boolean;
    
    /** Color para identificación */
    color?: string;
    
    /** Icono */
    icon?: string;
}

/**
 * Filtro rápido predefinido
 */
export interface QuickFilter {
    /** ID único */
    id: string;
    
    /** Etiqueta a mostrar */
    label: string;
    
    /** Icono */
    icon?: string;
    
    /** Color del badge */
    color?: string;
    
    /** Criterios que aplica */
    criteria: SearchCriteria;
    
    /** Contador (opcional) */
    count?: number;
}

/**
 * Configuración de búsqueda
 */
export interface SearchConfig {
    /** Campos en los que buscar por defecto */
    searchableFields: string[];
    
    /** Campos filtrables */
    filterableFields: Array<{
        field: string;
        label: string;
        type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
        options?: Array<{ label: string; value: string | number }>;
    }>;
    
    /** Campos ordenables */
    sortableFields: Array<{
        field: SortField;
        label: string;
    }>;
    
    /** Delay para debounce (ms) */
    debounceDelay: number;
    
    /** Mínimo de caracteres para buscar */
    minSearchLength: number;
    
    /** Resaltar coincidencias */
    enableHighlighting: boolean;
}

/**
 * Sugerencia de búsqueda
 */
export interface SearchSuggestion {
    /** Texto sugerido */
    text: string;
    
    /** Tipo de sugerencia */
    type: 'recent' | 'popular' | 'autocomplete';
    
    /** Contador de veces usada */
    count?: number;
    
    /** Fecha de último uso */
    lastUsed?: Date;
}

/**
 * Historial de búsqueda
 */
export interface SearchHistory {
    /** ID único */
    id: string;
    
    /** Usuario */
    userId: string;
    
    /** Query buscado */
    query: string;
    
    /** Criterios completos */
    criteria: SearchCriteria;
    
    /** Fecha de búsqueda */
    searchedAt: Date;
    
    /** Número de resultados */
    resultsCount: number;
}

/**
 * Estadísticas de búsqueda
 */
export interface SearchStats {
    /** Total de búsquedas */
    totalSearches: number;
    
    /** Búsquedas hoy */
    searchesToday: number;
    
    /** Términos más buscados */
    topQueries: Array<{
        query: string;
        count: number;
    }>;
    
    /** Filtros más usados */
    topFilters: Array<{
        field: string;
        count: number;
    }>;
    
    /** Tiempo promedio de búsqueda (ms) */
    avgSearchTime: number;
}
