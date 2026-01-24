# 🚀 Checklist para Producción - AppMcDron 3.0

**Fecha de análisis**: 24 de enero de 2026

Este documento detalla los aspectos pendientes y recomendaciones para llevar la aplicación AppMcDron 3.0 a un entorno de producción seguro y estable.

---

## 🚨 **Aspectos Críticos de Seguridad**

### 1. **Variables de Entorno**
- ❌ `.env` está en `.gitignore` pero necesitas validar que NUNCA se haya commiteado
- ✅ Tienes `.env.example` configurado correctamente
- ⚠️ **CRÍTICO**: `REACT_APP_SUPABASE_SERVICE_KEY` NO debe exponerse en el cliente - esto es solo para backend

**Acción requerida**:
```bash
# Verificar historial de git
git log --all --full-history -- .env

# Remover del historial si existe
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

### 2. **Claves y Secretos Hardcodeados**
- 🔍 Usuarios hardcodeados en el README (admin/invitado con passwords simples: "123456")
- 🔍 API keys de LLaMA, OpenAI, Claude en variables de entorno del cliente
- ⚠️ Cambiar todas las contraseñas por defecto antes de producción

**Acción requerida**:
- Crear usuarios con contraseñas seguras (mínimo 12 caracteres, mezcla de mayúsculas, minúsculas, números y símbolos)
- Eliminar credenciales de ejemplo del README
- Considerar mover API keys de IA a backend para evitar exposición

### 3. **Configuración de Firebase/Supabase**
- ✅ El archivo `configProd.js` está en `.gitignore`
- ⚠️ Necesitas validar configuración de reglas de seguridad de Firestore/Storage
- ⚠️ Configurar Row Level Security (RLS) en Supabase

**Acción requerida**:
```javascript
// Ejemplo de reglas de Firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reparaciones/{repairId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

---

## 📊 **Logging y Monitoreo**

### 4. **Logs de Desarrollo**
- ⚠️ Hay MUCHOS `console.log()` activos en código de producción
  - `src/persistencia/persistenciaSupabase/reparacionesPersistencia.js` (múltiples líneas)
  - `src/index.js` (líneas 26, 31)
  - `src/routes/Routes.tsx` (línea 8)
  - Y muchos más...

**Acción requerida**:
```bash
# Buscar y eliminar console.logs
grep -r "console\.log" src/ --exclude-dir=node_modules

# Implementar sistema de logging
npm install loglevel
# o
npm install winston
```

Ejemplo de implementación:
```javascript
// src/utils/logger.js
import log from 'loglevel';

if (process.env.NODE_ENV === 'production') {
  log.setLevel('error');
} else {
  log.setLevel('debug');
}

export default log;

// Uso
import logger from './utils/logger';
logger.debug('Debug info'); // Solo en desarrollo
logger.error('Error crítico'); // En producción y desarrollo
```

### 5. **Manejo de Errores**
- ✅ Hay try-catch en varios lugares
- ⚠️ Los errores se muestran al usuario sin sanitizar
- ❌ No hay centralización de manejo de errores
- ❌ No hay tracking de errores en producción

**Acción requerida**:
```bash
# Implementar Sentry
npm install @sentry/react @sentry/tracing
```

```javascript
// src/index.js
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV
});
```

---

## 🧪 **Testing**

### 6. **Cobertura de Tests**
- ⚠️ Solo 1 archivo de test encontrado: `src/usecases/estadosReparacion.test.ts`
- ❌ No hay tests unitarios para componentes
- ❌ No hay tests de integración
- ❌ No hay tests E2E

**Acción requerida**:
```bash
# Configurar Jest y React Testing Library (ya instalados)
npm run test -- --coverage

# Para E2E
npm install --save-dev cypress
# o
npm install --save-dev playwright
```

**Objetivo de cobertura mínima**:
- Componentes críticos: 80%
- Lógica de negocio: 90%
- Utils: 70%

**Prioridad de tests**:
1. `src/usecases/estadosReparacion.ts` (✅ ya tiene)
2. `src/persistencia/persistenciaSupabase/reparacionesPersistencia.js`
3. `src/components/Reparacion/` (todos los componentes)
4. `src/redux-tool-kit/` (slices y reducers)

---

## 🔄 **CI/CD**

### 7. **Pipelines de Despliegue**
- ❌ No hay archivos de CI/CD (`.gitlab-ci.yml`, GitHub Actions, `.github/workflows/`)
- ❌ No hay automatización de builds
- ❌ No hay validación automática de linting/tests

**Acción requerida**:
Crear `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '14'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint
        
      - name: Run tests
        run: npm test -- --coverage
        
      - name: Build
        run: npm run build
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        
  build-android:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'adopt'
          java-version: '8'
          
      - name: Build Android
        run: |
          npm ci
          npm run build
          cordova build android --release
          
      - name: Sign APK
        run: |
          # Firmar APK con keystore
          jarsigner -verbose -sigalg SHA256withRSA \
            -digestalg SHA-256 \
            -keystore ${{ secrets.KEYSTORE_FILE }} \
            -storepass ${{ secrets.KEYSTORE_PASSWORD }} \
            platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk \
            ${{ secrets.KEY_ALIAS }}
```

---

## 📦 **Optimización y Performance**

### 8. **Build de Producción**
- ⚠️ Validar optimización del build de React
- ⚠️ Implementar code splitting y lazy loading
- ⚠️ Optimizar imágenes y assets
- ⚠️ Implementar caché apropiado

**Acción requerida**:
```javascript
// src/routes/Routes.tsx - Implementar lazy loading
import React, { lazy, Suspense } from 'react';

const Reparaciones = lazy(() => import('./components/Reparaciones.component'));
const Usuarios = lazy(() => import('./components/Usuarios.component'));

function Routes() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Switch>
        <Route path="/reparaciones" component={Reparaciones} />
        <Route path="/usuarios" component={Usuarios} />
      </Switch>
    </Suspense>
  );
}
```

**Optimizar imágenes**:
```bash
# Instalar herramientas
npm install --save-dev imagemin imagemin-webp imagemin-mozjpeg imagemin-pngquant

# Crear script de optimización
node scripts/optimize-images.js
```

### 9. **Bundle Size**
- ⚠️ Revisar dependencias no usadas
- ⚠️ Analizar tamaño del bundle

**Acción requerida**:
```bash
# Analizar bundle
npm run build
npx source-map-explorer build/static/js/*.js

# Buscar dependencias no usadas
npx depcheck

# Considerar alternativas más ligeras
# Ejemplo: date-fns en lugar de moment.js
```

---

## 🔐 **Seguridad**

### 10. **Content Security Policy (CSP)**
- ⚠️ Configurar headers de seguridad apropiados
- ⚠️ CORS correctamente configurado

**Acción requerida**:
```html
<!-- public/index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://www.gstatic.com; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               font-src 'self' data:; 
               connect-src 'self' https://*.supabase.co https://*.firebase.com">
```

### 11. **Autenticación y Autorización**
- ✅ Tienes sistema de roles (admin/invitado)
- ⚠️ Validar que las reglas de acceso estén correctamente implementadas en el backend
- ⚠️ Tokens de sesión guardados en localStorage (vulnerable a XSS) - considerar httpOnly cookies

**Problema actual**:
```javascript
// src/components/Login.container.tsx - línea 53
localStorage.setItem('loginData', JSON.stringify(loginData)); // ⚠️ Vulnerable a XSS
```

**Solución recomendada**:
- Usar httpOnly cookies en lugar de localStorage
- Implementar refresh tokens
- Configurar CSRF protection

---

## 📱 **Móvil (Cordova)**

### 12. **Configuración Android**
- ⚠️ Validar permisos requeridos en AndroidManifest
- ⚠️ Configurar políticas de actualización
- ⚠️ Implementar crash reporting (Firebase Crashlytics)

**Acción requerida**:
```bash
# Instalar Firebase Crashlytics
cordova plugin add cordova-plugin-firebase-crashlytics

# Configurar en config.xml
```

```xml
<!-- config.xml -->
<platform name="android">
    <preference name="android-minSdkVersion" value="23" />
    <preference name="android-targetSdkVersion" value="33" />
    
    <!-- Permisos necesarios -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
</platform>
```

---

## 📝 **Documentación**

### 13. **Documentación Técnica**
- ✅ README básico presente
- ❌ Falta documentación de API
- ❌ Falta guía de despliegue
- ❌ Falta runbook para operaciones

**Acción requerida**:
Crear los siguientes documentos:
- `docs/API.md` - Documentación de endpoints
- `docs/DEPLOYMENT.md` - Guía de despliegue
- `docs/ARCHITECTURE.md` - Arquitectura del sistema
- `docs/RUNBOOK.md` - Procedimientos operacionales
- `docs/TROUBLESHOOTING.md` - Solución de problemas comunes

### 14. **Documentación de Usuario**
- ❌ Manual de usuario
- ❌ FAQ
- ❌ Videos tutoriales

**Acción requerida**:
- Crear manual de usuario en formato PDF
- Sección de ayuda en la aplicación
- Videos demostrativos para funciones clave

---

## 🔄 **Backup y Recuperación**

### 15. **Estrategia de Backup**
- ⚠️ Configurar backups automáticos de Firebase/Supabase
- ❌ Plan de recuperación ante desastres
- ❌ Políticas de retención de datos

**Acción requerida**:

**Para Firebase**:
```bash
# Exportar datos automáticamente
gcloud firestore export gs://[BUCKET_NAME] \
  --project=[PROJECT_ID] \
  --collection-ids='reparaciones,usuarios,drones'
```

**Para Supabase**:
```sql
-- Configurar backups automáticos en el dashboard de Supabase
-- O crear script de backup:
pg_dump -h [HOST] -U [USER] -d [DATABASE] > backup_$(date +%Y%m%d).sql
```

**Plan de recuperación**:
1. Backups diarios automáticos
2. Retención: 30 días
3. Pruebas de restauración mensuales
4. Documentar procedimiento de recuperación

---

## 📈 **Analytics y Métricas**

### 16. **Análisis de Uso**
- ❌ No hay integración de analytics (Google Analytics, Mixpanel)
- ❌ No hay métricas de negocio implementadas

**Acción requerida**:
```bash
# Instalar Google Analytics
npm install react-ga4
```

```javascript
// src/index.js
import ReactGA from 'react-ga4';

if (process.env.NODE_ENV === 'production') {
  ReactGA.initialize(process.env.REACT_APP_GA_TRACKING_ID);
}

// En cada ruta
ReactGA.send({ hitType: "pageview", page: window.location.pathname });
```

**Métricas clave a trackear**:
- Número de reparaciones creadas
- Tiempo promedio de reparación
- Estados más comunes
- Usuarios activos diarios/mensuales
- Tasa de conversión (consulta → presupuesto → reparación)

---

## 🌐 **Infraestructura**

### 17. **Hosting**
- ⚠️ Definir estrategia de hosting para web
- ⚠️ Configurar CDN para assets estáticos
- ⚠️ SSL/TLS configurado

**Opciones recomendadas**:

**Para Web**:
- Vercel (recomendado para React)
- Netlify
- AWS S3 + CloudFront
- Firebase Hosting

**Configuración recomendada**:
```bash
# Para Vercel
npm install -g vercel
vercel --prod

# Para Netlify
npm install -g netlify-cli
netlify deploy --prod
```

**SSL/TLS**:
- Usar certificados gratuitos de Let's Encrypt
- Forzar HTTPS en todas las conexiones
- Configurar HSTS headers

### 18. **Base de Datos**
- ⚠️ Parece haber migración/evaluación de Firebase a Supabase - **definir estrategia final**
- ⚠️ Configurar índices apropiados
- ⚠️ Políticas RLS (Row Level Security) en Supabase

**Acción requerida**:

**Decisión crítica**: ¿Firebase o Supabase?
- Firebase: Más maduro, mejor integración con Cordova, offline first
- Supabase: Open source, PostgreSQL, más control, mejor para queries complejas

**Si eliges Supabase**:
```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE repair ENABLE ROW LEVEL SECURITY;
ALTER TABLE drone ENABLE ROW LEVEL SECURITY;
ALTER TABLE user ENABLE ROW LEVEL SECURITY;

-- Políticas de ejemplo
CREATE POLICY "Usuarios pueden ver sus propias reparaciones"
  ON repair FOR SELECT
  USING (auth.uid() = user_id OR 
         EXISTS (SELECT 1 FROM user WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Solo admins pueden modificar reparaciones"
  ON repair FOR UPDATE
  USING (EXISTS (SELECT 1 FROM user WHERE id = auth.uid() AND is_admin = true));
```

**Índices críticos**:
```sql
-- Supabase
CREATE INDEX idx_repair_user_id ON repair(user_id);
CREATE INDEX idx_repair_state ON repair(state);
CREATE INDEX idx_repair_created_at ON repair(created_at);
CREATE INDEX idx_drone_owner_id ON drone(owner_id);
```

---

## 🔔 **Notificaciones**

### 19. **Push Notifications**
- ✅ Tienes plugins de notificaciones locales instalados
- ⚠️ Validar implementación de notificaciones push (Firebase Cloud Messaging)

**Acción requerida**:
```bash
# Instalar FCM
cordova plugin add cordova-plugin-firebase-messaging
```

```javascript
// src/utils/notifications.js
export const initPushNotifications = () => {
  if (window.FirebasePlugin) {
    window.FirebasePlugin.getToken(
      token => {
        console.log('FCM Token:', token);
        // Guardar token en backend
      },
      error => console.error('Error getting token:', error)
    );

    window.FirebasePlugin.onMessageReceived(
      message => {
        console.log('Message received:', message);
        // Mostrar notificación
      },
      error => console.error('Error receiving message:', error)
    );
  }
};
```

---

## 🛡️ **Cumplimiento Legal**

### 20. **GDPR/Privacidad**
- ❌ Política de privacidad
- ❌ Términos y condiciones
- ❌ Consentimiento de cookies
- ❌ Derecho al olvido implementado

**Acción requerida**:
1. **Crear política de privacidad** (consultar con abogado)
2. **Implementar banner de cookies**:
```bash
npm install react-cookie-consent
```

```javascript
// src/App.tsx
import CookieConsent from "react-cookie-consent";

<CookieConsent
  location="bottom"
  buttonText="Aceptar"
  declineButtonText="Rechazar"
  cookieName="mcDronConsent"
>
  Este sitio usa cookies para mejorar la experiencia del usuario.
</CookieConsent>
```

3. **Implementar función de eliminación de datos**:
```javascript
// src/usecases/gdpr.js
export const eliminarDatosUsuario = async (userId) => {
  // Eliminar datos del usuario
  await eliminarReparaciones(userId);
  await eliminarDrones(userId);
  await eliminarUsuario(userId);
  
  // Log de auditoría
  await registrarEliminacion(userId);
};
```

4. **Exportación de datos del usuario** (derecho de portabilidad):
```javascript
export const exportarDatosUsuario = async (userId) => {
  const datos = await obtenerTodosDatosUsuario(userId);
  return JSON.stringify(datos, null, 2);
};
```

---

## ✅ **Checklist de Pre-Producción**

### Fase 1: Seguridad (1-2 semanas)
- [ ] Auditoría de seguridad completa
- [ ] Remover `REACT_APP_SUPABASE_SERVICE_KEY` del cliente
- [ ] Cambiar todas las contraseñas por defecto
- [ ] Configurar RLS en Supabase / Reglas de Firestore
- [ ] Implementar CSP headers
- [ ] Mover tokens a httpOnly cookies
- [ ] Configurar CORS apropiadamente
- [ ] Validar permisos Android

### Fase 2: Calidad de Código (2-3 semanas)
- [ ] Eliminar todos los `console.log()`
- [ ] Implementar sistema de logging (loglevel o winston)
- [ ] Implementar error tracking (Sentry)
- [ ] Escribir tests unitarios (cobertura mínima 70%)
- [ ] Escribir tests de integración
- [ ] Configurar linting automático
- [ ] Code review completo

### Fase 3: DevOps (1-2 semanas)
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Automatizar builds
- [ ] Configurar entornos (dev, staging, prod)
- [ ] Configurar backups automáticos
- [ ] Implementar monitoreo de uptime
- [ ] Configurar alertas

### Fase 4: Performance (1 semana)
- [ ] Analizar bundle size
- [ ] Implementar code splitting
- [ ] Optimizar imágenes
- [ ] Configurar caché
- [ ] Lazy loading de componentes
- [ ] Auditoría Lighthouse (score > 90)

### Fase 5: Infraestructura (1 semana)
- [ ] Configurar hosting
- [ ] Configurar CDN
- [ ] SSL/TLS
- [ ] Configurar índices de BD
- [ ] Plan de escalabilidad
- [ ] Decidir Firebase vs Supabase definitivamente

### Fase 6: Observabilidad (1 semana)
- [ ] Implementar analytics
- [ ] Configurar dashboards de métricas
- [ ] Implementar health checks
- [ ] Configurar logging centralizado
- [ ] Crear runbook operacional

### Fase 7: Legal y Documentación (1-2 semanas)
- [ ] Política de privacidad
- [ ] Términos y condiciones
- [ ] Consentimiento de cookies
- [ ] Manual de usuario
- [ ] Documentación técnica
- [ ] API documentation

### Fase 8: Testing Final (1 semana)
- [ ] Tests en dispositivos reales (Android/iOS)
- [ ] Load testing
- [ ] Security testing (OWASP)
- [ ] User acceptance testing (UAT)
- [ ] Prueba de recuperación ante desastres

---

## 🎯 **Prioridades por Criticidad**

### 🔴 **CRÍTICO - Hacer AHORA** (antes de cualquier lanzamiento)
1. Remover `REACT_APP_SUPABASE_SERVICE_KEY` del cliente
2. Cambiar contraseñas por defecto (admin/invitado: 123456)
3. Configurar reglas de seguridad en BD (RLS/Firestore Rules)
4. Implementar HTTPS en producción
5. Validar que `.env` nunca se haya commiteado

### 🟠 **ALTO - Próximas 2 semanas**
1. Implementar error tracking (Sentry)
2. Eliminar console.logs de producción
3. Configurar CI/CD básico
4. Implementar backups automáticos
5. Crear documentación de despliegue
6. Configurar monitoreo básico

### 🟡 **MEDIO - Próximo mes**
1. Aumentar cobertura de tests (mínimo 70%)
2. Implementar analytics
3. Optimizar bundle size
4. Implementar code splitting
5. Crear política de privacidad y T&C
6. Documentación de usuario

### 🟢 **BAJO - Mejoras continuas**
1. Dashboards avanzados de métricas
2. Tests E2E completos
3. Optimizaciones de performance avanzadas
4. Features adicionales de monitoreo
5. Videos tutoriales

---

## 📋 **Comandos Útiles**

```bash
# Auditoría de seguridad
npm audit
npm audit fix

# Análisis de dependencias
npx depcheck
npm outdated

# Análisis de bundle
npm run build
npx source-map-explorer build/static/js/*.js

# Buscar console.logs
grep -r "console\.log" src/ --exclude-dir=node_modules

# Buscar TODOs
grep -r "TODO" src/ --exclude-dir=node_modules

# Análisis de código
npx eslint src/
npx prettier --check src/

# Tests con cobertura
npm test -- --coverage --watchAll=false

# Build de producción
NODE_ENV=production npm run build

# Validar build de Cordova
cordova requirements
cordova build android --release --verbose
```

---

## 📊 **Métricas de Éxito**

Antes de considerar que la aplicación está lista para producción, verifica:

### Seguridad
- [ ] Score A+ en [Mozilla Observatory](https://observatory.mozilla.org/)
- [ ] Score A en [Security Headers](https://securityheaders.com/)
- [ ] 0 vulnerabilidades críticas en `npm audit`

### Performance
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse Best Practices > 90
- [ ] Lighthouse SEO > 90
- [ ] Bundle size < 500KB (gzipped)
- [ ] Time to Interactive < 3s

### Calidad
- [ ] Cobertura de tests > 70%
- [ ] 0 errores de linting
- [ ] 0 warnings críticos en build
- [ ] Tasa de error < 1% en producción

### Operacional
- [ ] Uptime > 99.5%
- [ ] Tiempo de respuesta API < 200ms
- [ ] Backups funcionando (verificados)
- [ ] Alertas configuradas y probadas

---

## 📚 **Recursos Adicionales**

### Herramientas Recomendadas
- **Monitoreo**: Sentry, LogRocket, Datadog
- **Analytics**: Google Analytics 4, Mixpanel
- **Testing**: Jest, React Testing Library, Cypress, Playwright
- **CI/CD**: GitHub Actions, GitLab CI, CircleCI
- **Hosting**: Vercel, Netlify, AWS Amplify
- **CDN**: CloudFlare, AWS CloudFront
- **Monitoring**: UptimeRobot, Pingdom

### Documentación
- [React Best Practices](https://reactjs.org/docs/thinking-in-react.html)
- [Cordova Platform Guide](https://cordova.apache.org/docs/en/latest/guide/platforms/android/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 📞 **Soporte y Mantenimiento**

### Plan de Mantenimiento Post-Lanzamiento
1. **Semanal**: Revisión de logs y métricas
2. **Quincenal**: Actualización de dependencias
3. **Mensual**: Revisión de seguridad y backups
4. **Trimestral**: Auditoría completa de seguridad

### Equipo Requerido
- 1 DevOps Engineer (part-time)
- 1 Backend Developer
- 1 Frontend Developer
- 1 QA Engineer
- 1 Security Specialist (consultor)

---

**Última actualización**: 24 de enero de 2026

**Próxima revisión programada**: A definir tras implementación de fase crítica

---

## 💡 **Nota Final**

Este checklist es extenso porque la aplicación tiene una **base sólida** pero necesita **reforzar aspectos críticos de seguridad, observabilidad y automatización** antes de estar lista para producción.

**No te abrumes**: Prioriza las secciones marcadas como CRÍTICAS y ALTAS. Las mejoras MEDIAS y BAJAS pueden implementarse de forma iterativa después del lanzamiento inicial.

**Recomendación**: Lanza una **beta cerrada** primero con usuarios de confianza, implementa las mejoras CRÍTICAS y ALTAS, recibe feedback, y luego procede con el lanzamiento público.

¡Éxito con el lanzamiento! 🚀
