## 1. Lógica de dominio

- [x] 1.1 Definir los tipos del ranking y de la propuesta de cajas.
- [x] 1.2 Implementar el puntaje temporal por modelo usando `FeFinRep` y la relación reparación-drone-modelo.
- [x] 1.3 Implementar la inferencia de familia y la asignación determinista de cajas exclusivas y compartidas.
- [x] 1.4 Exponer el resultado mediante un selector memoizado o un caso de uso consumido desde Redux.

## 2. Interfaz administrativa

- [x] 2.1 Crear la página de estadísticas de modelos con resumen, ranking y metodología visible.
- [x] 2.2 Agregar el input numérico de cantidad de cajas y representar la propuesta completa de asignación.
- [x] 2.3 Agregar la ruta protegida y el acceso en el menú administrativo de estadísticas.
- [x] 2.4 Mostrar estados vacíos y advertencias por reparaciones sin modelo resoluble.

## 3. Validación

- [x] 3.1 Agregar pruebas unitarias del decaimiento, orden y resolución de modelos.
- [x] 3.2 Agregar pruebas unitarias para una, menos, igual y más cajas que modelos.
- [x] 3.3 Ejecutar las pruebas enfocadas y la compilación de producción.
- [ ] 3.4 Verificar la página autenticada en viewport mobile y desktop sin overflow ni solapamientos. El navegador automatizado redirige al login porque no comparte una sesión administrativa.
