## 1. Canonicalizacion
- [x] 1.1 Redirigir por HTTP 301 todas las variantes al dominio HTTPS `.com.ar` sin `www`.
- [x] 1.2 Agregar `rel="canonical"` a la pagina principal.
- [x] 1.3 Publicar `robots.txt` con acceso permitido y referencia al sitemap canonico.

## 2. Verificacion
- [x] 2.1 Validar sintaxis, sitemap, canonical y ausencia de secretos.
- [ ] 2.2 Desplegar mediante el flujo con backup e integridad SHA-256.
- [ ] 2.3 Comprobar las ocho variantes de dominio y los archivos SEO en produccion.