/**
 * search.service.ts
 * 
 * Servicio para búsqueda y filtrado avanzado de reparaciones.
 * Incluye búsqueda full-text, filtros combinables, y vistas guardadas.
 * 
 * **Phase 4 - T4.4:** Búsqueda y Filtros Avanzados
 * 
 * @module Services/Search
 */

import type { ReparacionType } from '../types/reparacion.types';
import type {
    SearchCriteria,
    SearchResult,
    SearchFilter,
    SavedView,
    QuickFilter,
    SearchSuggestion,
    SearchHistory,
} from '../types/search.types';

/**
 * Configuración del servicio
 */
const CONFIG = {
    debounceDelay: 300,
    minSearchLength: 2,
    maxHistoryItems: 50,
    maxSuggestions: 10,
};

/**
 * Clase principal del servicio de búsqueda
 */
class SearchService {
    private searchHistory: SearchHistory[] = [];
    private savedViews: SavedView[] = [];

    /**
     * Busca reparaciones con criterios avanzados
     */
    search(
        items: ReparacionType[],
        criteria: SearchCriteria
    ): SearchResult<ReparacionType> {
        const startTime = performance.now();
        
        let results = [...items];

        // 1. Aplicar búsqueda de texto
        if (criteria.query && criteria.query.length >= CONFIG.minSearchLength) {
            results = this.searchByText(results, criteria.query);
        }

        // 2. Aplicar filtros
        results = this.applyFilters(results, criteria.filters);

        // 3. Ordenar resultados
        if (criteria.sortBy) {
            results = this.sortResults(results, criteria.sortBy, criteria.sortDirection || 'asc');
        }

        // 4. Calcular paginación
        const page = criteria.page || 1;
        const pageSize = criteria.pageSize || 20;
        const totalPages = Math.ceil(results.length / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedResults = results.slice(startIndex, endIndex);

        const searchTime = performance.now() - startTime;

        // Guardar en historial
        this.addToHistory({
            id: Date.now().toString(),
            userId: 'current-user', // TODO: Get from auth
            query: criteria.query || '',
            criteria,
            searchedAt: new Date(),
            resultsCount: results.length,
        });

        return {
            items: paginatedResults,
            total: results.length,
            page,
            pageSize,
            totalPages,
            searchTime,
        };
    }

    /**
     * Búsqueda por texto en múltiples campos
     */
    private searchByText(items: ReparacionType[], query: string): ReparacionType[] {
        const searchTerm = query.toLowerCase().trim();
        const tokens = searchTerm.split(' ').filter(t => t.length > 0);

        return items.filter(item => {
            // Campos en los que buscar
            const searchableText = [
                item.id || '',
                item.UsuarioRep || '',
                item.DroneRep || '',
                item.ModeloDroneNameRep || '',
                item.EstadoRep || '',
                item.ObsRep || '',
                item.ObsRepuestos || '',
                item.NumSerieDrone || '',
            ].join(' ').toLowerCase();

            // Buscar todos los tokens
            return tokens.every(token => searchableText.includes(token));
        });
    }

    /**
     * Aplica filtros a los resultados
     */
    private applyFilters(items: ReparacionType[], filters: SearchFilter[]): ReparacionType[] {
        let results = [...items];

        for (const filter of filters) {
            if (!filter.enabled) continue;

            results = results.filter(item => {
                const fieldValue = this.getFieldValue(item, filter.field);
                
                switch (filter.operator) {
                    case 'equals':
                        return fieldValue === filter.value;
                    
                    case 'contains':
                        return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
                    
                    case 'startsWith':
                        return String(fieldValue).toLowerCase().startsWith(String(filter.value).toLowerCase());
                    
                    case 'endsWith':
                        return String(fieldValue).toLowerCase().endsWith(String(filter.value).toLowerCase());
                    
                    case 'greaterThan':
                        return Number(fieldValue) > Number(filter.value);
                    
                    case 'lessThan':
                        return Number(fieldValue) < Number(filter.value);
                    
                    case 'between':
                        if (Array.isArray(filter.value) && filter.value.length === 2) {
                            const val = Number(fieldValue);
                            return val >= Number(filter.value[0]) && val <= Number(filter.value[1]);
                        }
                        return false;
                    
                    case 'in':
                        if (Array.isArray(filter.value)) {
                            return filter.value.includes(fieldValue);
                        }
                        return false;
                    
                    case 'notIn':
                        if (Array.isArray(filter.value)) {
                            return !filter.value.includes(fieldValue);
                        }
                        return true;
                    
                    default:
                        return true;
                }
            });
        }

        return results;
    }

    /**
     * Ordena resultados
     */
    private sortResults(
        items: ReparacionType[],
        sortBy: string,
        direction: 'asc' | 'desc'
    ): ReparacionType[] {
        return [...items].sort((a, b) => {
            const aValue = this.getFieldValue(a, sortBy);
            const bValue = this.getFieldValue(b, sortBy);

            let comparison = 0;

            if (aValue < bValue) comparison = -1;
            if (aValue > bValue) comparison = 1;

            return direction === 'asc' ? comparison : -comparison;
        });
    }

    /**
     * Obtiene el valor de un campo (con soporte para nested)
     */
    private getFieldValue(item: ReparacionType, field: string): unknown {
        // Mapeo de campos especiales
        const fieldMap: Record<string, string> = {
            'fecha': 'FeConRep',
            'estado': 'EstadoRep',
            'cliente': 'UsuarioRep',
            'drone': 'DroneRep',
            'presupuesto': 'PresuFiRep',
            'modelo': 'ModeloDroneNameRep',
        };

        const mappedField = fieldMap[field] || field;
        return (item as Record<string, unknown>)[mappedField];
    }

    /**
     * Guarda una vista de filtros
     */
    saveView(view: Omit<SavedView, 'id' | 'createdAt'>): SavedView {
        const newView: SavedView = {
            ...view,
            id: Date.now().toString(),
            createdAt: new Date(),
        };

        this.savedViews.push(newView);
        this.persistViews();
        
        return newView;
    }

    /**
     * Obtiene todas las vistas guardadas
     */
    getSavedViews(userId?: string): SavedView[] {
        this.loadViews();
        
        if (userId) {
            return this.savedViews.filter(v => v.createdBy === userId || v.isPublic);
        }
        
        return this.savedViews;
    }

    /**
     * Elimina una vista guardada
     */
    deleteView(viewId: string): void {
        this.savedViews = this.savedViews.filter(v => v.id !== viewId);
        this.persistViews();
    }

    /**
     * Obtiene filtros rápidos predefinidos
     */
    getQuickFilters(): QuickFilter[] {
        return [
            {
                id: 'pending',
                label: 'Pendientes',
                icon: 'clock',
                color: 'warning',
                criteria: {
                    query: '',
                    filters: [
                        {
                            field: 'estado',
                            operator: 'in',
                            value: ['Consulta', 'Transito', 'Recibido', 'Revisado'],
                            enabled: true,
                        },
                    ],
                },
            },
            {
                id: 'in-progress',
                label: 'En Reparación',
                icon: 'tools',
                color: 'primary',
                criteria: {
                    query: '',
                    filters: [
                        {
                            field: 'estado',
                            operator: 'in',
                            value: ['Presupuestado', 'Aceptado', 'Reparado', 'Repuestos'],
                            enabled: true,
                        },
                    ],
                },
            },
            {
                id: 'completed',
                label: 'Finalizadas',
                icon: 'check-circle',
                color: 'success',
                criteria: {
                    query: '',
                    filters: [
                        {
                            field: 'estado',
                            operator: 'in',
                            value: ['Diagnosticado', 'Cobrado', 'Enviado', 'Finalizado'],
                            enabled: true,
                        },
                    ],
                },
            },
            {
                id: 'urgent',
                label: 'Urgentes',
                icon: 'exclamation-triangle',
                color: 'danger',
                criteria: {
                    query: '',
                    filters: [
                        {
                            field: 'prioridad',
                            operator: 'equals',
                            value: 1,
                            enabled: true,
                        },
                    ],
                    sortBy: 'fecha',
                    sortDirection: 'asc',
                },
            },
            {
                id: 'waiting-parts',
                label: 'Esperando Repuestos',
                icon: 'box-seam',
                color: 'info',
                criteria: {
                    query: '',
                    filters: [
                        {
                            field: 'estado',
                            operator: 'equals',
                            value: 'Repuestos',
                            enabled: true,
                        },
                    ],
                },
            },
        ];
    }

    /**
     * Obtiene sugerencias de búsqueda
     */
    getSuggestions(query: string): SearchSuggestion[] {
        this.loadHistory();
        
        const suggestions: SearchSuggestion[] = [];

        // Sugerencias del historial
        const historySuggestions = this.searchHistory
            .filter(h => h.query.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5)
            .map(h => ({
                text: h.query,
                type: 'recent' as const,
                lastUsed: h.searchedAt,
            }));

        suggestions.push(...historySuggestions);

        return suggestions.slice(0, CONFIG.maxSuggestions);
    }

    /**
     * Obtiene historial de búsqueda
     */
    getHistory(userId?: string): SearchHistory[] {
        this.loadHistory();
        
        if (userId) {
            return this.searchHistory.filter(h => h.userId === userId);
        }
        
        return this.searchHistory;
    }

    /**
     * Limpia historial de búsqueda
     */
    clearHistory(userId?: string): void {
        if (userId) {
            this.searchHistory = this.searchHistory.filter(h => h.userId !== userId);
        } else {
            this.searchHistory = [];
        }
        
        this.persistHistory();
    }

    /**
     * Agrega búsqueda al historial
     */
    private addToHistory(entry: SearchHistory): void {
        this.searchHistory.unshift(entry);
        
        // Mantener solo las últimas N búsquedas
        if (this.searchHistory.length > CONFIG.maxHistoryItems) {
            this.searchHistory = this.searchHistory.slice(0, CONFIG.maxHistoryItems);
        }
        
        this.persistHistory();
    }

    /**
     * Persiste historial en localStorage
     */
    private persistHistory(): void {
        try {
            localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    }

    /**
     * Carga historial desde localStorage
     */
    private loadHistory(): void {
        try {
            const stored = localStorage.getItem('search_history');
            if (stored) {
                this.searchHistory = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading search history:', error);
            this.searchHistory = [];
        }
    }

    /**
     * Persiste vistas en localStorage
     */
    private persistViews(): void {
        try {
            localStorage.setItem('saved_views', JSON.stringify(this.savedViews));
        } catch (error) {
            console.error('Error saving views:', error);
        }
    }

    /**
     * Carga vistas desde localStorage
     */
    private loadViews(): void {
        try {
            const stored = localStorage.getItem('saved_views');
            if (stored) {
                this.savedViews = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading views:', error);
            this.savedViews = [];
        }
    }
}

/**
 * Instancia singleton del servicio
 */
export const searchService = new SearchService();

/**
 * Hook para usar el servicio de búsqueda
 */
export function useSearch(): {
    search: (items: ReparacionType[], criteria: SearchCriteria) => SearchResult<ReparacionType>;
    saveView: (view: Omit<SavedView, 'id' | 'createdAt'>) => SavedView;
    getSavedViews: (userId?: string) => SavedView[];
    deleteView: (viewId: string) => void;
    getQuickFilters: () => QuickFilter[];
    getSuggestions: (query: string) => SearchSuggestion[];
    getHistory: (userId?: string) => SearchHistory[];
    clearHistory: (userId?: string) => void;
} {
    return {
        search: (items, criteria) => searchService.search(items, criteria),
        saveView: (view) => searchService.saveView(view),
        getSavedViews: (userId) => searchService.getSavedViews(userId),
        deleteView: (viewId) => searchService.deleteView(viewId),
        getQuickFilters: () => searchService.getQuickFilters(),
        getSuggestions: (query) => searchService.getSuggestions(query),
        getHistory: (userId) => searchService.getHistory(userId),
        clearHistory: (userId) => searchService.clearHistory(userId),
    };
}
