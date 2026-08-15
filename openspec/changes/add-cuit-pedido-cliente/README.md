# Adding CUIT to Customer and Purchase Orders

## Summary
This change adds an optional CUIT to both the customer profile and purchase-order records so international purchases can be tracked without making the field mandatory.

## Key flow
- Customer profile stores the CUIT once.
- Purchase orders can be auto-filled from a customer with a known CUIT.
- Manual entry remains possible as an exception.
