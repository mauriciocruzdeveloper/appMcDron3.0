import React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { SavingIndicator } from "./SavingIndicator";

interface FormTextareaProps {
    label: string;
    id?: string;
    value: string;
    onChange: (value: string) => void;
    rows?: number;
    disabled?: boolean;
    isSaving?: boolean;
    placeholder?: string;
}

/**
 * Área de texto estándar de la app: label + TextareaAutosize Bootstrap con indicador de guardado.
 */
export const FormTextarea: React.FC<FormTextareaProps> = ({
    label,
    id,
    value,
    onChange,
    rows = 3,
    disabled = false,
    isSaving = false,
    placeholder,
}) => {
    return (
        <div>
            <label className="form-label">
                {label}
                <SavingIndicator isSaving={isSaving} />
            </label>
            <TextareaAutosize
                id={id}
                className="form-control"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                disabled={disabled}
                placeholder={placeholder}
            />
        </div>
    );
};
