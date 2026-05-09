import React from "react";

interface SavingIndicatorProps {
    isSaving: boolean;
}

export const SavingIndicator: React.FC<SavingIndicatorProps> = ({ isSaving }) => {
    if (!isSaving) return null;
    return <small className="text-muted ms-2">Guardando...</small>;
};
