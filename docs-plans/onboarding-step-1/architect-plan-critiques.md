# Onboarding Step 1 Architecture Plan Critiques & Fixes

This document records the critiques identified during the auto-critique phase, their resolution status (self-fixed or requiring user input), and details of the fixes, organized by section.

---

## 1. Routing

### Auto-Critique & Self-Fixes (Agent-Originated)

1. **[ROUTE_DEEP_LINK_CONTRACT] Onboarding Route Completion Check**:
   * *Critique:* The initial route specification did not define cold-start behavior when an authenticated user navigates to `/onboarding` after already completing onboarding (`onboardingState === OnboardingState.DONE`).
   * *Rationale:* Without an explicit contract, completed users might land on stale onboarding screens or default back to Step 1.
   * *Fix:* Added deep-link redirect behavior to the routing notes: `OnboardingComponent` shell evaluates `user.onboardingState` on initialization and redirects completed users to `/home`.

### Interactive Review Critiques (User-Originated)

1. **[ROUTING_GUARD_CONVENTION] Functional Guard Migration**:
   * *Critique:* The project uses a class-based `AuthGuard`. In newer Angular conventions, functional guards (`CanActivateFn` with `inject()`) are preferred. Should we retain the existing `AuthGuard` or plan a migration to a functional `requireAuth` guard?
   * *Status:* Resolved — User decided to retain existing class-based `AuthGuard` without changes (refactoring is out of scope for Step 1).

---

## 2. Database Entities

### Auto-Critique & Self-Fixes (Agent-Originated)

1. **[ENTITY_TARGET_CORRECTION] Domain Entity vs User Document Mutation**:
   * *Critique:* The starter stub in `onboard-long-term-goals.component.ts` attempted to write `oneYearGoal` and `fiveYearGoal` directly onto the `User` model, but the application defines a dedicated `LongTermGoal` entity in the `longTermGoals` collection.
   * *Rationale:* Storing goals on the user document violates separation of concerns and conflicts with `LongTermGoalStore` used by the rest of the application (e.g. `HomeComponent`).
   * *Fix:* Clarified in the entity plan that `LongTermGoal` is created/updated in the `longTermGoals` collection with `__userId`, while `User` only has its `onboardingState` updated to `STEP_2`.

2. **[ENTITY_PREPOPULATION] State Prepopulation on Re-entry**:
   * *Critique:* If a user navigates Back from Step 2 to Step 1, the form fields would reset to empty unless pre-populated from the store.
   * *Rationale:* Users expect previously entered goals to persist if they navigate backward in the onboarding wizard.
   * *Fix:* Added store selection logic in the plan to pre-fill input signals from `LongTermGoalStore` when existing goals for the user are loaded.

### Interactive Review Critiques (User-Originated)

1. **[ENTITY_DOC_ID_STRATEGY] Deterministic Document ID for 1:1 Goals**:
   * *Critique:* Because each user has at most one active `LongTermGoal` record, should `LongTermGoal.__id` be deterministic (e.g., matching the user's `__id`) for direct `doc()` gets, or use auto-generated Firestore document IDs with query by `__userId` (as currently done in `HomeComponent`)?
   * *Status:* Open

---

## 3. Component Hierarchy

### Auto-Critique & Self-Fixes (Agent-Originated)

1. **[COMP_OVER_DECOMPOSITION] Avoid Over-Decomposing Small Step Template**:
   * *Critique:* The initial draft proposed generating separate `LongTermGoalFormComponent` and `OnboardingFooterComponent` presentational components.
   * *Rationale:* `OnboardLongTermGoalsComponent` is a compact 38-line template containing two inputs and back/next buttons. Breaking it into multiple 10-line components introduces unnecessary prop-drilling and boilerplate with no immediate reuse benefit in Step 1.
   * *Fix:* Updated the component hierarchy to keep `OnboardLongTermGoalsComponent` as a focused step container managing its template directly without redundant presentational child components.

### Interactive Review Critiques (User-Originated)

1. **[COMP_FOOTER_REUSABILITY] Shared Onboarding Footer vs Inlined Step Navigation**:
   * *Critique:* Across all 7 onboarding steps, Back and Next buttons are repeated. Should a shared presentational `OnboardingFooterComponent` be planned for all steps, or kept inlined per step?
   * *Status:* Open
