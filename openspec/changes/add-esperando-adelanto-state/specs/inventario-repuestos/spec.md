## ADDED Requirements

### Requirement: Advance Wait Does Not Commit Parts
Repairs in `Esperando adelanto` SHALL NOT contribute demand or commitment of
inventory parts. Entering or leaving this wait SHALL NOT consume physical stock.
The existing demand and commitment rules SHALL apply again when returning to
`Aceptado`. Rules SHALL remain in usecases, actions or selectors, not persistence.

#### Scenario: Pause before committing parts
- **WHEN** an accepted repair changes to `Esperando adelanto`
- **THEN** its parts SHALL cease to contribute to operational demand and commitment
- **AND** physical inventory stock SHALL remain unchanged

#### Scenario: Recalculate upon resumption
- **WHEN** a repair returns from `Esperando adelanto` to `Aceptado`
- **THEN** the system SHALL recalculate its demand and commitment using existing rules
- **AND** physical stock SHALL NOT be consumed by this transition

### Requirement: No Parts Shortage Action While Waiting for Payment
The system SHALL retain visibility of budgeted parts but SHALL NOT present a
repair in `Esperando adelanto` as needing immediate purchasing or parts shortage
action. It SHALL distinguish payment wait from stock availability.

#### Scenario: View parts of a paused repair
- **WHEN** the administrator views the parts of a repair in `Esperando adelanto`
- **THEN** its budgeted parts SHALL remain visible
- **AND** it SHALL NOT be labeled as requiring immediate purchasing or as having sufficient stock merely because demand is paused