# OpenSpec Changes Registry

Este directorio contiene todas las propuestas de cambio estructuradas según el framework OpenSpec.

## 📋 Active Changes

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
