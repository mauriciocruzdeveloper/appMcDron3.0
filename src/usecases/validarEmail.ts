export const MENSAJE_EMAIL_INVALIDO =
    'El email ingresado no es válido. Verifique que tenga formato usuario@dominio.com y no contenga tildes, letra ñ ni espacios.';

const PARTE_LOCAL_PERMITIDA = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
const ETIQUETA_DOMINIO_PERMITIDA = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
const TLD_PERMITIDO = /^(?:[a-zA-Z]{2,}|xn--[a-zA-Z0-9]{2,})$/;

export const normalizarEmail = (email?: string | null): string => (email ?? '').trim();

export const esEmailValido = (email?: string | null): boolean => {
    const limpio = normalizarEmail(email);
    if (!limpio || limpio.length > 254) return false;

    const partes = limpio.split('@');
    if (partes.length !== 2) return false;

    const [parteLocal, dominio] = partes;
    if (!parteLocal || parteLocal.length > 64) return false;
    if (parteLocal.startsWith('.') || parteLocal.endsWith('.') || parteLocal.includes('..')) {
        return false;
    }
    if (!PARTE_LOCAL_PERMITIDA.test(parteLocal)) return false;

    if (!dominio || dominio.length > 253) return false;
    const etiquetas = dominio.split('.');
    if (etiquetas.length < 2) return false;

    const todasLasEtiquetasValidas = etiquetas.every(
        (etiqueta) => etiqueta.length > 0 && etiqueta.length <= 63 && ETIQUETA_DOMINIO_PERMITIDA.test(etiqueta),
    );
    if (!todasLasEtiquetasValidas) return false;

    const tld = etiquetas[etiquetas.length - 1];
    return TLD_PERMITIDO.test(tld);
};

export const esEmailOpcionalValido = (email?: string | null): boolean => {
    if (!normalizarEmail(email)) return true;
    return esEmailValido(email);
};

export const validarEmail = (email?: string | null): void => {
    if (!esEmailValido(email)) {
        throw new Error(MENSAJE_EMAIL_INVALIDO);
    }
};

export const validarEmailOpcional = (email?: string | null): void => {
    if (!esEmailOpcionalValido(email)) {
        throw new Error(MENSAJE_EMAIL_INVALIDO);
    }
};
