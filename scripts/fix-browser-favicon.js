/**
 * Cordova hook: after_prepare
 *
 * Cordova browser platform sobrescribe favicon.ico con su propio logo
 * (almacenado en platforms/browser/platform_www/favicon.ico).
 * Este hook copia el favicon personalizado de la app después de cada prepare/build.
 */

const fs = require('fs');
const path = require('path');

module.exports = function (context) {
    const platforms = context.opts.platforms || [];

    // Solo aplica a la plataforma browser
    if (!platforms.includes('browser')) return;

    const projectRoot = context.opts.projectRoot;
    const srcFavicon = path.join(projectRoot, 'www', 'favicon.ico');
    const destFavicon = path.join(projectRoot, 'platforms', 'browser', 'www', 'favicon.ico');

    if (!fs.existsSync(srcFavicon)) {
        console.warn('[fix-browser-favicon] WARN: No se encontró www/favicon.ico');
        return;
    }

    fs.copyFileSync(srcFavicon, destFavicon);
    console.log('[fix-browser-favicon] favicon.ico personalizado copiado a platforms/browser/www/');
};
