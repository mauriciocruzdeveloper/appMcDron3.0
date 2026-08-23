export type SelectBadgeColor = 'success' | 'warning' | 'danger' | 'primary' | 'secondary';

export interface SelectOption {
    value: string;
    label: string;
    badgeText?: string;
    badgeColor?: SelectBadgeColor;
}