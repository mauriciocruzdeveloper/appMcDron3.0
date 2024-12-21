export type InputType = HTMLInputElement | HTMLTextAreaElement;

export interface SelectType {
    value: string;
    label: string;
}

export type MatchType = any & {
    path: string;
}