# Debug API JSDoc Guidelines

## Overview

This document describes the rules for writing JSDoc for public debug APIs, feature flags, and testing tools.
The documentation is automatically generated from the source TypeScript code and used by testers to understand the available commands.

Main principles:
- JSDoc describes the purpose of the function.
- `exposePublic` makes the function available during execution.
- The documentation generator collects JSDoc and creates Markdown.

Example:

```ts
/**
 * Enables or disables the new header design.
 *
 * @featureFlag
 *
 * @param enabled Enable or disable the feature.
 */
export function toggleNewHeader(enabled: boolean) {
  // ...code
}

exposePublic(toggleNewHeader, "app.flags.newHeader")
