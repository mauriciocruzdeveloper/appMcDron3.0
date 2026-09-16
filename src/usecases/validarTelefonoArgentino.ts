export const MENSAJE_TELEFONO_ARGENTINO_INVALIDO =
    'El teléfono ingresado no es válido. Use un formato argentino, por ejemplo: 3416559834, 03416559834 o +5493416559834.';

const TELEFONO_NACIONAL = /^(?:0)?[1-3]\d{9}$/;
const TELEFONO_INTERNACIONAL = /^\+54(?:9)?[1-3]\d{9}$/;
const CARACTERES_PERMITIDOS = /^[+\d\s().-]+$/;
const SEPARADORES_VISUALES = /[\s().-]/g;

const esMovilNacionalTradicional = (telefono: string): boolean => {
    if (!/^0\d{12}$/.test(telefono)) return false;

    for (let longitudCodigoArea = 2; longitudCodigoArea <= 4; longitudCodigoArea += 1) {
        const codigoArea = telefono.slice(1, 1 + longitudCodigoArea);
        const indicadorMovil = telefono.slice(1 + longitudCodigoArea, 3 + longitudCodigoArea);
        const numeroAbonado = telefono.slice(3 + longitudCodigoArea);

        if (
            /^[1-3]\d+$/.test(codigoArea) &&
            indicadorMovil === '15' &&
            numeroAbonado.length === 10 - longitudCodigoArea
        ) {
            return true;
        }
    }

    return false;
};

export const esTelefonoArgentinoValido = (telefono?: string | null): boolean => {
    if (!telefono?.trim()) return true;
    if (!CARACTERES_PERMITIDOS.test(telefono)) return false;

    const telefonoCompacto = telefono.replace(SEPARADORES_VISUALES, '');

    return TELEFONO_NACIONAL.test(telefonoCompacto) ||
        TELEFONO_INTERNACIONAL.test(telefonoCompacto) ||
        esMovilNacionalTradicional(telefonoCompacto);
};

export const validarTelefonoArgentino = (telefono?: string | null): void => {
    if (!esTelefonoArgentinoValido(telefono)) {
        throw new Error(MENSAJE_TELEFONO_ARGENTINO_INVALIDO);
    }
};