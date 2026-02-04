# Heady Directive Monorepo Guidance

- Strict data isolation between verticals is mandatory.
- No cross-vertical database sharing or data replication.
- Treat each vertical as its own compliance boundary.
- Shared services may only exchange non-sensitive metadata required for routing.
