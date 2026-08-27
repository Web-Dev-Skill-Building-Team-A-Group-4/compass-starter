# Document Evolution Log — Onboarding Step 1 (Long Term Goals) Architecture

<!-- A structured record of how the Architecture section of the planning documents evolved through the planning session.
     Each cycle captures the interaction between human and AI that produced a change
     in the document. User input is always quoted verbatim.

     This file is built in two phases:
     - Phase 1 (during session): Cycle records are appended after each critique-respond-update turn.
     - Phase 2 (end of session): Summary Statistics and Evolution by Section are generated. -->

---

## Cycle 1: Initial Draft

### User Input
> This feature is Onboarding Step 1 for compass-starter.
>
> We already have an existing design, so do not run feature-design-plan.
>
> Please inspect the existing compass-starter codebase and use the existing onboarding structure and conventions.
>
> For the technical architecture:
> - Reuse the existing onboarding route/flow if one already exists.
> - Do not create unnecessary new routes.
> - Reuse existing shared components and Angular Material patterns where appropriate.
> - Keep the implementation scoped to Onboarding Step 1.
> - Identify the container component and any presentational child components needed.
> - Do not implement yet; only create the feature architecture plan.
>
> If there is an existing Step 0 or other onboarding step in compass-starter, use that as a reference for structure and naming.

### AI Draft Summary
The AI drafted the technical architecture for Onboarding Step 1 based on `compass-starter`'s existing onboarding flow:
- **Routing**: Reused `/onboarding` route (lazy-loaded with `loadComponent`, guarded by `AuthGuard`). State navigation between steps handled via `User.onboardingState` rather than sub-routes.
- **Database Entities**: Verified `LongTermGoal` model in `longTermGoals` collection with foreign key `__userId` linked to `User`. Captured atomic persistence with `User.onboardingState` transition.
- **Component Hierarchy**: Decomposed into `OnboardingComponent` (wizard shell container) -> `OnboardLongTermGoalsComponent` (Step 1 container) -> `LongTermGoalFormComponent` (presentational input form) and `OnboardingFooterComponent` (presentational navigation actions).

### What the AI added beyond what the user said
- Reused existing `LongTermGoalStore` and `BatchWriteService` abstractions for atomic writes.
- Formalized `LongTermGoal` interface and relationship table with `__userId` foreign key.
- Proposed decomposing `OnboardLongTermGoalsComponent` into dumb components (`LongTermGoalFormComponent` and `OnboardingFooterComponent`).

---

## Cycle 1.5: Auto-Critique & Self-Fix

### AI Self-Critique
1. ⚠️ **[ROUTE_DEEP_LINK_CONTRACT]**: Clarified deep linking behavior where completed onboarding users (`onboardingState === DONE`) navigating to `/onboarding` are redirected to `/home`.
2. 🚨 **[ENTITY_TARGET_CORRECTION]**: Fixed starter stub inconsistency to ensure goals are persisted to `LongTermGoal` in `longTermGoals` collection rather than mutating `User` document fields directly.
3. ⚠️ **[ENTITY_PREPOPULATION]**: Added explicit requirement for pre-populating goal inputs when navigating back to Step 1.
4. ⚠️ **[COMP_OVER_DECOMPOSITION]**: Removed unnecessary schematics for 10-line form/footer child components to prevent over-decomposition of a 38-line step template.

### Document Delta
| Field | Before | After |
|---|---|---|
| Routing Notes | Brief notes on AuthGuard | Explicit cold start / completed onboarding redirect handling |
| Entities Notes | Generic store write description | Clear distinction between `LongTermGoal` collection writes and `User.onboardingState` update |
| Component Hierarchy | Decomposed with `LongTermGoalFormComponent` & `OnboardingFooterComponent` | Unified `OnboardLongTermGoalsComponent` step container |

### What shifted
- AI self-corrected over-decomposition and aligned entity write paths with existing store infrastructure.

---

## Cycle 2: Routing Review & Scope Clarification

### AI Critique
1. ⚠️ **Class-Based Guard vs Functional Guard Convention (`ROUTE_UNCOMMENTED_GUARD`)**: Proposed migrating `AuthGuard` to a functional guard.
2. ⚠️ **Browser Back Button & URL State Handling**: Raised concern about browser back button exiting `/onboarding` without history manipulation.
3. ⚠️ **State Recovery on Incomplete Data**: Raised cold start / resume flow for authenticated users.

### User Response
> For routing, please update the plan with these decisions:
>
> 1. Keep the existing class-based AuthGuard unchanged.
>    Refactoring the global AuthGuard to a functional guard is outside the scope
>    of Onboarding Step 1.
>
> 2. Keep onboarding navigation state-driven through user.onboardingState.
>    Do not add step-specific routes, query parameters, or history.pushState.
>    The in-app Back button should handle STEP_1 -> WELCOME.
>    Browser Back leaving /onboarding is acceptable under the existing architecture.
>
> 3. If an authenticated user has onboardingState === STEP_1, they should resume
>    at Step 1 after signing back in.
>    Reuse the existing app behavior for missing/corrupt user profiles rather than
>    adding feature-specific routing logic.
>
> 4. Keep the existing behavior where onboardingState === DONE redirects
>    /onboarding to /home.
>
> Please incorporate these decisions into the routing section and continue to the
> next architecture section.

### Document Delta
| Field | Before | After |
|---|---|---|
| Routing Notes | General routing notes | Explicit state-driven step navigation notes; preserved class-based `AuthGuard` |
| Appendix: Routing | Empty | Logged 🔵 Strong Stances: Retaining class-based AuthGuard & pure state-driven navigation |

### What shifted
- User defended existing application conventions (retaining class-based `AuthGuard` and pure state-driven wizard flow) against AI proposals to refactor guards or manipulate browser history.

---

## Summary Statistics
<!-- Generated at the end of the session after all sections are confirmed. -->

| Metric | Count |
|---|---|
| Total interaction cycles | |
| Times user narrowed scope | |
| Times user corrected AI framing | |
| Times user defended a choice against AI | |
| Times user referenced specific document lines | |
| Times AI forced a question that unlocked new thinking | |
| Times AI filled gaps from user's existing knowledge | |
| Times AI proposed text improvements user accepted | |
| Largest single document delta | |

---

## Evolution by Section
<!-- Generated at the end of the session. For each architecture section, write a narrative covering how it evolved from initial state to final form. -->

How each section of the document evolved from initial state through critiques to its final form.

---

### Routing

**Initial state (from Cycle 1):**
Reused `/onboarding` route guarded by `AuthGuard` without introducing child routes, keeping step transitions state-driven.

**Evolution:**
- Cycle 1.5: Added deep linking / completion redirect contract.
- Cycle 2: Confirmed retaining class-based `AuthGuard` and pure state-driven navigation.

**AI critiques that drove change:**
- Critique on functional guard migration and browser history manipulation.

**User's voice through the evolution:**
- "Keep the existing class-based AuthGuard unchanged. Refactoring the global AuthGuard to a functional guard is outside the scope of Onboarding Step 1."
- "Keep onboarding navigation state-driven through user.onboardingState. Do not add step-specific routes, query parameters, or history.pushState."

**Final state:**

**How AI's role changed:**

---

### Database Entities

**Initial state (from Cycle 1):**
Defined `LongTermGoal` entity in `longTermGoals` with `__userId` foreign key and standard metadata fields.

**Evolution:**
- Cycle 1.5: Aligned write path to update `LongTermGoal` collection and `User.onboardingState`.

**AI critiques that drove change:**

**User's voice through the evolution:**

**Final state:**

**How AI's role changed:**

---

### Component Hierarchy

**Initial state (from Cycle 1):**
`OnboardingComponent` shell containing `OnboardLongTermGoalsComponent` container, with child presentational form and footer components.

**Evolution:**
- Cycle 1.5: Simplified hierarchy to avoid over-decomposing compact step template.

**AI critiques that drove change:**

**User's voice through the evolution:**

**Final state:**

**How AI's role changed:**
