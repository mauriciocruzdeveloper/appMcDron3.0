import React from "react";

type ButtonVariant =
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark"
    | "outline-primary"
    | "outline-secondary"
    | "outline-success"
    | "outline-danger"
    | "outline-warning"
    | "outline-info";

interface AppButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: ButtonVariant;
    disabled?: boolean;
    className?: string;
    type?: "button" | "submit" | "reset";
}

/**
 * Botón estándar de la app. Envuelve el botón Bootstrap con variante configurable.
 */
export const AppButton: React.FC<AppButtonProps> = ({
    children,
    onClick,
    variant = "primary",
    disabled = false,
    className = "",
    type = "button",
}) => {
    return (
        <button
            type={type}
            className={`btn btn-${variant} ${className}`.trim()}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};
