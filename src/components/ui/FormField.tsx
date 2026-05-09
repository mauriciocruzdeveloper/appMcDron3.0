import React from "react";
import { SavingIndicator } from "./SavingIndicator";

interface FormFieldProps {
    label: string;
    id?: string;
    value: string;
    onChange: (value: string) => void;
    type?: React.HTMLInputTypeAttribute;
    disabled?: boolean;
    isSaving?: boolean;
    placeholder?: string;
}

/**
 * Campo de formulario estándar: label + input Bootstrap con indicador de guardado.
 */
export const FormField: React.FC<FormFieldProps> = ({
    label,
    id,
    value,
    onChange,
    type = "text",
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
            <input
                id={id}
                type={type}
                className="form-control"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
            />
        </div>
    );
};
