## ADDED Requirements

### Requirement: Optional Advance Payment Wait State
The system SHALL provide the principal state `Esperando adelanto` for repairs
whose budget has been accepted but whose administrator chooses to wait for an
advance payment. This state SHALL be entered only from `Aceptado` and SHALL
preserve the approved budget, interventions and existing financial data.

#### Scenario: Pause an accepted repair
- **WHEN** an administrator changes a repair from `Aceptado` to `Esperando adelanto`
- **THEN** the repair SHALL remain approved and become paused waiting for payment
- **AND** the system SHALL NOT record a payment or send a new email automatically

#### Scenario: Reject entry from any other state
- **WHEN** a transition to `Esperando adelanto` is requested from a state other than `Aceptado`
- **THEN** the system SHALL reject that transition without persisting it

### Requirement: Manual Resumption and Existing Closing Rules
The system SHALL allow a manual return from `Esperando adelanto` to `Aceptado`
without requiring a payment field or automatic payment verification. The pause
and return cycle SHALL be repeatable. The only other permitted destinations
SHALL be `Cancelado` and `Abandonado`, subject to existing closing conditions.

#### Scenario: Resume after payment or a decision to waive the wait
- **WHEN** the administrator returns a repair from `Esperando adelanto` to `Aceptado`
- **THEN** the repair SHALL rejoin accepted active work
- **AND** its budget and existing payment data SHALL remain unchanged

#### Scenario: No direct jump to parts or completion
- **WHEN** a transition from `Esperando adelanto` directly to `Repuestos` or `Reparado` is requested
- **THEN** the system SHALL reject the transition
- **AND** the administrator SHALL first return the repair to `Aceptado`

#### Scenario: Close a paused repair
- **WHEN** the administrator requests `Cancelado` or `Abandonado` from `Esperando adelanto`
- **THEN** the system SHALL apply the same closing conditions used for those destinations from `Repuestos`

### Requirement: Advance Wait Is Not Mandatory
The system SHALL preserve the existing transitions from `Aceptado` to `Repuestos`
and `Reparado`, without requiring passage through `Esperando adelanto`.

#### Scenario: Advance without collecting the payment first
- **WHEN** the administrator chooses to advance an accepted repair without waiting for an advance
- **THEN** the existing transitions to `Repuestos` or `Reparado` SHALL remain available

### Requirement: Separate Operational Visibility
The system SHALL display `Esperando adelanto` as a distinct state in the repair
detail, progress, state filters and existing state counters. Its repairs SHALL
NOT appear in lists filtered exclusively to `Aceptado` or `Repuestos`.

#### Scenario: Filter active accepted repairs
- **WHEN** the administrator filters exclusively by `Aceptado`
- **THEN** repairs in `Esperando adelanto` SHALL be excluded

#### Scenario: Locate and resume paused repairs
- **WHEN** the administrator filters by `Esperando adelanto` and opens a repair
- **THEN** the repair SHALL show its paused state, budget and a permitted return control to `Aceptado`