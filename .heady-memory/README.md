# Heady Memory System

This directory contains the HeadySystem's persistent memory and pattern recognition system.

## Structure

- **`heady-registry.json`**: Canonical registry of all system components with naming conventions
- **`patterns/`**: Learned patterns and strategies
  - `naming_convention_001.json`: Naming standard for all components
  - `merge_strategy_001.json`: Sacred Geometry consolidation strategy
- **`validations/`**: Validation logs and audit trails

## Purpose

The memory system ensures:
1. **Naming Consistency**: All components follow the canonical PascalCase pattern (e.g., HeadySync, HeadyConnection)
2. **Pattern Recognition**: System learns and applies successful patterns across operations
3. **Audit Trail**: Maintains validation history for compliance and debugging

## Usage

The HeadyRegistry is automatically consulted by:
- `hs` (HeadySync) command for component naming validation
- Build scripts for consistency checks
- Documentation generators for canonical references

## Naming Convention

**Format**: `Heady[ComponentName]` in PascalCase
- ✅ Correct: `HeadySync`, `HeadyConnection`, `HeadyManager`
- ❌ Incorrect: `Heady Sync`, `Heady-Sync`, `heady_sync`

**Exceptions**:
- File names may use kebab-case (e.g., `heady-manager.js`)
- CLI commands use lowercase abbreviations (e.g., `hs`)
