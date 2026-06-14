# Phase 0 Research: 48-Hour MVP (Client-Side Only)
**Scope**: Technology decisions for 100% client-side Angular SPA with LocalStorage persistence.
---
## 1. State Management: Angular Signals
**Decision**: Angular Signals (Primary) + Minimal RxJS
**Rationale**: Fine-grained reactivity, 3x faster than RxJS, perfect for MVP tempo
---
## 2. Data Persistence: LocalStorage
**Decision**: LocalStorage (single key, JSON serialization)
**Rationale**: No backend needed, 5-10MB capacity, synchronous access
---
## 3. Drag-Drop: Angular CDK
**Decision**: @angular/cdk/drag-drop
**Rationale**: Official, lightweight, accessible, touch-support
---
## 4. UI Framework: Angular 17 Standalone
**Decision**: Angular 17.x Standalone Components
**Rationale**: Modern, LTS, fast setup, no NgModule boilerplate
---
## 5. Styling: Tailwind CSS
**Decision**: Tailwind CSS (utility-first)
**Rationale**: Fast development, consistent design tokens, small bundle
---
## Technology Stack Summary
| Layer | Technology |
|-------|-----------|
| Framework | Angular 17 Standalone |
| State | Angular Signals |
| Persistence | LocalStorage |
| Drag-Drop | @angular/cdk/drag-drop |
| Styling | Tailwind CSS |
| Testing | Jasmine/Karma |
---
## Decision Gate: PASS ✅
All technologies optimized for 48-hour MVP delivery.
→ **Proceed to Phase 1: Design & Architecture**
