---
description: Protocol for creating and classifying new System Nodes
---

# Node Creation Protocol (NCP)

## Classification

### Local Node (The "Organ")
- **Use for**: Business Logic, UI, Orchestration
- **Location**: `packages/core` or `packages/ui`
- **Coupling**: Strictly coupled to Core

### Distributed Node (The "Limb")
- **Use for**: High latency, heavy compute, or edge requirements
- **Location**: `apps/services/[name]`
- **Coupling**: Loosely coupled via HTTP/MCP/Queue
- **Requirement**: Must define an Interface in Core

## Creation Steps

### 1. Define Domain Entity
```typescript
// packages/core/src/domain/[Feature]/[Feature].ts
export class Feature implements Entity<FeatureId> {
  // Business logic
}
```

### 2. Define Use Case
```typescript
// packages/core/src/application/[Feature]/DoThing.ts
export interface DoThingUseCase {
  execute(input: Input): Result<Output, Error>;
}
```

### 3. Create UI Component (if needed)
```typescript
// packages/ui/src/components/FeatureWidget.tsx
export const FeatureWidget: React.FC<Props> = (props) => {
  return <div>{/* implementation */}</div>;
};
```

### 4. Wire in Composition Root
```typescript
// apps/web/app/feature/page.tsx
import { DoThingUseCase } from '@core/application/Feature';
import { FeatureWidget } from '@ui/components';

export default function FeaturePage() {
  const useCase = container.get<DoThingUseCase>();
  return <FeatureWidget useCase={useCase} />;
}
```

## Rules
- Core never imports UI or Web
- UI never imports Web
- Web imports Core and UI
- All logic returns `Result<T, E>`
