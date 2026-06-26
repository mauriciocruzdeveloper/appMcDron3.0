import {
    useState,
    useRef,
    useEffect,
    useMemo,
    useCallback,
    KeyboardEvent,
} from "react";
import { SelectOption } from "../../types/selectOption";

export interface ComboBoxProps {
    /** Opciones a mostrar en la lista desplegable. */
    options: SelectOption[];
    /**
     * Valor seleccionado.
     * - Modo simple: `string` (el `value` de la opción, o texto libre si `allowCustomValue`).
     * - Modo múltiple (`isMulti`): `string[]` con los `value` seleccionados.
     */
    value: string | string[];
    /**
     * Selección simple: se dispara al elegir una opción de la lista
     * (o `null` al limpiar). Es el "gancho" para disparar una función al elegir
     * (ej. traer datos del cliente, traer las ciudades de una provincia, etc.).
     */
    onChange?: (option: SelectOption | null) => void;
    /** Selección múltiple: se dispara con la lista completa de opciones elegidas. */
    onChangeMulti?: (options: SelectOption[]) => void;
    /**
     * Se dispara en cada pulsación cuando el usuario escribe.
     * Útil junto con `allowCustomValue` para persistir texto libre (ej. el email).
     */
    onInputChange?: (text: string) => void;
    /** Activa la selección múltiple (con etiquetas/chips). */
    isMulti?: boolean;
    /** Permite escribir y conservar valores que no están en la lista (solo modo simple). */
    allowCustomValue?: boolean;
    placeholder?: string;
    disabled?: boolean;
    /** Muestra un botón para limpiar la selección. */
    isClearable?: boolean;
    /** Mensaje cuando no hay opciones que coincidan. */
    noOptionsMessage?: string;
    id?: string;
    className?: string;
}

/**
 * Combo / lista desplegable reutilizable (el "select de toda la vida").
 *
 * Permite:
 * - Escribir y editar libremente el texto del campo y filtrar la lista.
 * - Disparar opcionalmente una función al seleccionar un item (`onChange` / `onChangeMulti`).
 * - Conservar texto libre que no está en la lista (`allowCustomValue`, solo modo simple).
 * - Selección múltiple con chips (`isMulti`).
 *
 * Al desenfocar sin elegir una opción válida (modo simple sin `allowCustomValue`),
 * se revierte al valor previo o queda vacío: nunca autoselecciona una opción.
 */
export function ComboBox({
    options,
    value,
    onChange,
    onChangeMulti,
    onInputChange,
    isMulti = false,
    allowCustomValue = false,
    placeholder = "Seleccionar...",
    disabled = false,
    isClearable = false,
    noOptionsMessage = "No hay opciones",
    id,
    className = "",
}: ComboBoxProps): JSX.Element {
    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState("");
    const [filtering, setFiltering] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const selectedValues = useMemo<string[]>(() => {
        if (isMulti) return Array.isArray(value) ? value : [];
        const v = (value as string) ?? "";
        return v ? [v] : [];
    }, [isMulti, value]);

    // Etiqueta a mostrar para el valor actual (modo simple).
    const selectedLabel = useMemo(() => {
        if (isMulti) return "";
        const v = (value as string) ?? "";
        // Sin valor => no se muestra ninguna etiqueta (se ve el placeholder),
        // aunque la lista tenga una opción con value vacío.
        if (!v) return "";
        const opt = options.find(o => o.value === v);
        if (opt) return opt.label;
        return allowCustomValue ? v : "";
    }, [options, value, allowCustomValue, isMulti]);

    // Opciones seleccionadas (modo múltiple).
    const selectedOptions = useMemo<SelectOption[]>(() => {
        if (!isMulti) return [];
        return selectedValues.map(
            v => options.find(o => o.value === v) ?? { value: v, label: v }
        );
    }, [isMulti, selectedValues, options]);

    // Opciones visibles: si el usuario aún no escribió, se muestran todas
    // (en modo múltiple se excluyen las ya seleccionadas).
    const filteredOptions = useMemo(() => {
        const base = isMulti
            ? options.filter(o => !selectedValues.includes(o.value))
            : options;
        if (!filtering) return base;
        const q = inputText.trim().toLowerCase();
        if (!q) return base;
        return base.filter(o => o.label.toLowerCase().includes(q));
    }, [options, inputText, filtering, isMulti, selectedValues]);

    const closeAndRevert = useCallback(() => {
        setIsOpen(false);
        setFiltering(false);
        setHighlightedIndex(-1);
        setInputText(isMulti ? "" : selectedLabel);
    }, [selectedLabel, isMulti]);

    // Cierre por blur / Tab / click-fuera: confirma el estado del campo.
    // - Modo simple: si el usuario vacío el texto, se limpia la selección
    //   (queda el placeholder); si dejó texto sin confirmar una opción, se
    //   revierte al valor previo (nunca se autoselecciona uno).
    const commitAndClose = useCallback(() => {
        setIsOpen(false);
        setFiltering(false);
        setHighlightedIndex(-1);
        if (isMulti) {
            setInputText("");
            return;
        }
        if (inputText.trim() === "") {
            setInputText("");
            if (((value as string) ?? "") !== "") onChange?.(null);
            if (allowCustomValue) onInputChange?.("");
        } else {
            setInputText(selectedLabel);
        }
    }, [isMulti, inputText, value, onChange, onInputChange, allowCustomValue, selectedLabel]);

    // Cerrar al hacer click fuera del componente.
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                commitAndClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen, commitAndClose]);

    // Mantener visible la opción resaltada.
    useEffect(() => {
        if (highlightedIndex < 0 || !listRef.current) return;
        const node = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
        node?.scrollIntoView({ block: "nearest" });
    }, [highlightedIndex]);

    const openMenu = () => {
        if (disabled) return;
        // En modo simple, partir el texto editable desde la etiqueta actual
        // para poder filtrar sin perder lo ya seleccionado.
        if (!isMulti) setInputText(selectedLabel);
        setIsOpen(true);
        setFiltering(false);
        setHighlightedIndex(-1);
    };

    const handleSelect = (option: SelectOption) => {
        if (isMulti) {
            onChangeMulti?.([...selectedOptions, option]);
            setInputText("");
            setFiltering(false);
            setHighlightedIndex(-1);
            inputRef.current?.focus();
            return;
        }
        setIsOpen(false);
        setFiltering(false);
        setHighlightedIndex(-1);
        setInputText(option.label);
        onChange?.(option);
        inputRef.current?.blur();
    };

    const handleRemove = (val: string) => {
        onChangeMulti?.(selectedOptions.filter(o => o.value !== val));
        inputRef.current?.focus();
    };

    const handleInputChange = (text: string) => {
        setInputText(text);
        setFiltering(true);
        setHighlightedIndex(-1);
        if (!isOpen) setIsOpen(true);
        if (!isMulti && allowCustomValue) onInputChange?.(text);
    };

    const handleClear = () => {
        setInputText("");
        setFiltering(false);
        setHighlightedIndex(-1);
        if (isMulti) {
            onChangeMulti?.([]);
        } else {
            onChange?.(null);
            if (allowCustomValue) onInputChange?.("");
        }
        inputRef.current?.focus();
        setIsOpen(true);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                if (!isOpen) {
                    openMenu();
                    return;
                }
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                if (!isOpen) {
                    openMenu();
                    return;
                }
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
                break;
            case "Enter":
                if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    e.preventDefault();
                    handleSelect(filteredOptions[highlightedIndex]);
                } else if (isOpen) {
                    e.preventDefault();
                    if (!isMulti) {
                        setIsOpen(false);
                        setFiltering(false);
                    }
                }
                break;
            case "Backspace":
                if (isMulti && inputText === "" && selectedOptions.length > 0) {
                    handleRemove(selectedOptions[selectedOptions.length - 1].value);
                }
                break;
            case "Escape":
                if (isOpen) {
                    e.preventDefault();
                    closeAndRevert();
                }
                break;
            case "Tab":
                // Al salir con Tab se confirma el campo: si quedó vacío se limpia
                // (placeholder); si hay texto sin confirmar, se revierte.
                if (isOpen) commitAndClose();
                break;
            default:
                break;
        }
    };

    const hasValue = isMulti
        ? selectedValues.length > 0
        : inputText.length > 0 || ((value as string) ?? "").length > 0;
    const showClear = isClearable && !disabled && hasValue;

    const renderDropdown = () =>
        isOpen ? (
            <ul
                ref={listRef}
                role="listbox"
                className="list-group position-absolute w-100 shadow-sm"
                style={{
                    zIndex: 1056,
                    maxHeight: "16rem",
                    overflowY: "auto",
                    marginTop: "0.125rem",
                }}
            >
                {filteredOptions.length === 0 ? (
                    <li className="list-group-item text-secondary small">
                        {noOptionsMessage}
                    </li>
                ) : (
                    filteredOptions.map((option, index) => (
                        <li
                            key={`${option.value}-${index}`}
                            role="option"
                            aria-selected={selectedValues.includes(option.value)}
                            className={`list-group-item list-group-item-action ${
                                index === highlightedIndex ? "active" : ""
                            } ${selectedValues.includes(option.value) ? "fw-semibold" : ""}`}
                            style={{ cursor: "pointer" }}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            onMouseDown={e => {
                                // Evita que el blur del input cierre la lista antes del click.
                                e.preventDefault();
                                handleSelect(option);
                            }}
                        >
                            {option.label}
                        </li>
                    ))
                )}
            </ul>
        ) : null;

    if (isMulti) {
        return (
            <div className={`position-relative ${className}`} ref={containerRef}>
                <div className="position-relative">
                    <div
                        className="form-control d-flex flex-wrap align-items-center gap-1"
                        style={{
                            paddingRight: showClear ? "3.5rem" : "2rem",
                            cursor: disabled ? "not-allowed" : "text",
                            backgroundColor: disabled ? "#e9ecef" : undefined,
                        }}
                        onMouseDown={e => {
                            if (e.target === e.currentTarget && !disabled) {
                                openMenu();
                                inputRef.current?.focus();
                            }
                        }}
                    >
                        {selectedOptions.map(opt => (
                            <span
                                key={opt.value}
                                className="badge bg-secondary d-inline-flex align-items-center gap-1"
                            >
                                {opt.label}
                                {!disabled && (
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        aria-label={`Quitar ${opt.label}`}
                                        className="btn-close btn-close-white"
                                        style={{ fontSize: "0.5rem" }}
                                        onMouseDown={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={() => handleRemove(opt.value)}
                                    ></button>
                                )}
                            </span>
                        ))}
                        <input
                            ref={inputRef}
                            id={id}
                            type="text"
                            className="border-0 flex-grow-1 p-0"
                            style={{
                                outline: "none",
                                minWidth: "5rem",
                                background: "transparent",
                            }}
                            role="combobox"
                            aria-expanded={isOpen}
                            aria-autocomplete="list"
                            autoComplete="off"
                            value={inputText}
                            placeholder={selectedOptions.length === 0 ? placeholder : ""}
                            disabled={disabled}
                            onChange={e => handleInputChange(e.target.value)}
                            onFocus={openMenu}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    {showClear && (
                        <button
                            type="button"
                            tabIndex={-1}
                            aria-label="Limpiar"
                            onClick={handleClear}
                            className="btn btn-sm border-0 bg-transparent p-0 position-absolute top-50 translate-middle-y"
                            style={{ right: "2rem", lineHeight: 1 }}
                        >
                            <i className="bi bi-x-lg text-secondary"></i>
                        </button>
                    )}

                    <span
                        className="position-absolute top-50 translate-middle-y text-secondary"
                        style={{ right: "0.75rem", pointerEvents: "none" }}
                    >
                        <i className={`bi ${isOpen ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
                    </span>
                </div>

                {renderDropdown()}
            </div>
        );
    }

    return (
        <div className={`position-relative ${className}`} ref={containerRef}>
            <div className="position-relative">
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    className="form-control"
                    style={{ paddingRight: showClear ? "3.5rem" : "2rem" }}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-autocomplete="list"
                    autoComplete="off"
                    value={isOpen ? inputText : selectedLabel}
                    placeholder={placeholder}
                    disabled={disabled}
                    onChange={e => handleInputChange(e.target.value)}
                    onFocus={openMenu}
                    onMouseDown={() => { if (!isOpen) openMenu(); }}
                    onKeyDown={handleKeyDown}
                />

                {showClear && (
                    <button
                        type="button"
                        tabIndex={-1}
                        aria-label="Limpiar"
                        onClick={handleClear}
                        className="btn btn-sm border-0 bg-transparent p-0 position-absolute top-50 translate-middle-y"
                        style={{ right: "2rem", lineHeight: 1 }}
                    >
                        <i className="bi bi-x-lg text-secondary"></i>
                    </button>
                )}

                <span
                    className="position-absolute top-50 translate-middle-y text-secondary"
                    style={{ right: "0.75rem", pointerEvents: "none" }}
                >
                    <i className={`bi ${isOpen ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
                </span>
            </div>

            {renderDropdown()}
        </div>
    );
}

export default ComboBox;
