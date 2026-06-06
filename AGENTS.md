<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## Reglas Locales de Capas

- Las reglas de negocio (validaciones, decisiones, transiciones de estado y efectos de dominio como impacto de stock) deben vivir en `redux-tool-kit/*.actions.ts`, `redux-tool-kit/*.selectors.ts` o `usecases/`.
- La capa `persistencia/` debe limitarse a acceso a datos (CRUD, mapeo DTO/entidad, queries, joins, suscripciones), sin orquestar reglas de negocio.
- Si un cambio de feature requiere lógica de dominio nueva, crear primero propuesta OpenSpec y luego implementar respetando esta separación.