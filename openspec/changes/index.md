# OpenSpec Changes Registry

Este directorio contiene todas las propuestas de cambio estructuradas según el framework OpenSpec.

## 📋 Active Changes

### `allow-cancel-accepted-repair`
**Status:** Implemented  
**Priority:** Medium  
**Created:** 2026-08-12  

Permite cancelar una reparación ya aceptada (Aceptado → Cancelado) y elimina la transición incoherente Aceptado → Rechazado del mapa de dominio.

- [📝 Proposal](./allow-cancel-accepted-repair/proposal.md)
- [✅ Tasks](./allow-cancel-accepted-repair/tasks.md)
- [🔧 Spec](./allow-cancel-accepted-repair/specs/reparaciones-intervenciones/spec.md)

---

### `user-roles-system`
**Status:** Draft  
**Priority:** High  
**Created:** 2026-01-13  
**Estimated Effort:** 6-8 horas  

Migrar de sistema binario Admin (boolean) a sistema de roles (admin, cliente, partner). Unifica nomenclatura Usuario/Cliente.

- [📝 Proposal](./user-roles-system/proposal.md)
- [🗄️ Database Spec](./user-roles-system/specs/database/spec.md)
- [📊 SQL Migration](../../sql/migration_add_user_roles.sql)

**Quick Actions:**
- Revisar y aprobar propuesta
- Ejecutar migración SQL en Supabase
- Actualizar código TypeScript

---

### `add-repuestos-state`
**Status:** Draft  
**Priority:** Medium  
**Created:** 2025-11-16  
**Estimated Effort:** 9-13 horas  

Modernizar el estado "Repuestos" de legacy a principal en el flujo de reparaciones.

- [📄 README](./add-repuestos-state/README.md)
- [📝 Proposal](./add-repuestos-state/proposal.md)
- [✅ Tasks](./add-repuestos-state/tasks.md)
- [🔧 Specs](./add-repuestos-state/specs/)

**Quick Links:**
- [State Transitions Spec](./add-repuestos-state/specs/state-transitions/spec.md)
- [Data Model Spec](./add-repuestos-state/specs/data-model/spec.md)
- [UI Representation Spec](./add-repuestos-state/specs/ui-representation/spec.md)

---

### `add-cuit-pedido-cliente`
**Status:** Draft
**Priority:** Medium
**Created:** 2026-08-14

Permite registrar un CUIT opcional en la ficha del cliente y reutilizarlo en los pedidos de repuestos para compras internacionales, con autocompletado desde clientes que ya lo tienen cargado.

- [📝 Proposal](./add-cuit-pedido-cliente/proposal.md)
- [✅ Tasks](./add-cuit-pedido-cliente/tasks.md)
- [🔧 Specs](./add-cuit-pedido-cliente/specs/clientes-pedidos/spec.md)

---

## 📁 Change Structure

Cada cambio sigue esta estructura:

```
changes/<change-id>/
├── README.md           # Resumen ejecutivo y quick start
├── proposal.md         # Propuesta completa (contexto, problema, solución)
├── tasks.md            # Lista de tareas de implementación
└── specs/
    ├── <capability-1>/
    │   └── spec.md     # Especificación detallada
    ├── <capability-2>/
    │   └── spec.md
    └── ...
```

---

## 🔄 Change Status Workflow

1. **Draft** - Propuesta en borrador, abierta a comentarios
2. **Review** - En revisión por equipo
3. **Approved** - Aprobada, lista para implementación
4. **In Progress** - Implementación en curso
5. **Testing** - Implementado, en fase de testing
6. **Complete** - Implementado y validado
7. **Archived** - Archivado (cambio implementado o descartado)

---

## 🎯 Priority Levels

- **Critical** - Bloquea funcionalidad principal
- **High** - Importante pero no bloquea
- **Medium** - Mejora significativa
- **Low** - Mejora menor o nice-to-have

---

## 📝 Como Crear una Nueva Propuesta

1. Crear directorio con ID único:
   ```bash
   mkdir -p openspec/changes/<change-id>/specs
   ```

2. Copiar template de propuesta:
   ```bash
   cp .github/templates/openspec-proposal-template.md \
      openspec/changes/<change-id>/proposal.md
   ```

3. Llenar secciones:
   - Context
   - Problem Statement
   - Proposed Solution
   - Scope
   - Dependencies
   - Risks & Mitigations
   - Success Criteria
   - Alternatives Considered

4. Crear specs para cada capability:
   ```bash
   mkdir openspec/changes/<change-id>/specs/<capability-name>
   ```

5. Crear tasks.md con lista de implementación

6. Actualizar este archivo (index.md) con el nuevo cambio

---

## 📚 Related Documentation

- [Project Context](../project.md)
- [AGENTS Guide](../AGENTS.md)
- [OpenSpec Proposal Prompt](../../.github/prompts/openspec-proposal.prompt.md)

---

**Last Updated:** 2025-11-16
