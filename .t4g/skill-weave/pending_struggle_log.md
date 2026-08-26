# 🧗‍♂️ Roadblock Resolution Review Card

**ID**: `6c0ce32e-603e-4352-b549-083199429171`  
**Topic**: State-Driven Onboarding Navigation & Mock State Testing  
**Status**: Resolved  

---

## 📌 Summary
Understanding state-driven onboarding routing vs. URL query parameters in an Angular + Firestore architecture, and learning how to test specific onboarding step components during development using mock store states.

---

## 🚧 Roadblock
Attempting to preview and route directly to a specific step component (`OnboardQuarterlyGoalsComponent` / Step 3) using URL query parameters (`/onboarding?step=3`). In Compass Starter, onboarding is state-driven rather than URL-query driven: the top-level route is always `/onboarding`, and the parent `OnboardingComponent` conditionally displays the active step based on `currentUser().onboardingState`. Navigating with query parameters caused the dev server URL to hang/load indefinitely during browser subagent testing, creating repetitive browser attempts rather than immediately identifying that the mock state needed to be modified.

---

## 💡 Resolution
1. **Architecture Clarification**: Recognized that `OnboardingComponent` uses `@if (currentUser()?.onboardingState === OnboardingState.STEP_3)` to conditionally render the step 3 component, while `AuthGuard` ensures any user with an in-progress onboarding state remains on `/onboarding`.
2. **Local Testing Workflow**: Configured the mock database in `user.mock.ts` by setting `USER_DB[0].onboardingState: OnboardingState.STEP_3`. Upon logging in during local development, the `currentUser` signal immediately resolves to Step 3, mounting `OnboardQuarterlyGoalsComponent` directly.
3. **Reactive Persistence**: Confirmed that in production with Firebase Firestore, the user's `onboardingState` is saved directly to their user document in Firestore on each step transition (`userStore.update(...)`), ensuring the user always resumes at their last completed step across sessions.
4. **Agent Steering Reflection**: When a local dev server page hangs for over 60 seconds, the agent should immediately stop repetitive navigation attempts and inspect the state-management / mock configuration rather than looping on the same failing URL.

---

## 🎙️ Verbatim Dialogue History

**User**:
> "/stuck agent keeps trying to build the page /onboarding?step=3 when it doesnt work. 
> 
> i see that in auth.guard.ts there exists: \" const onboardingStates = [OnboardingState.WELCOME, OnboardingState.STEP_1, OnboardingState.STEP_2, OnboardingState.STEP_3, OnboardingState.STEP_4, OnboardingState.STEP_5, OnboardingState.STEP_6, OnboardingState.STEP_7];\", i think we want to use this to route to the correct step page we want to go to. can you use this for the routing?"

**Agent**:
> "Roadblock tagged. I'm tracking this struggle. Type `/resolved` when you've solved it.
> 
> ---
> 
> ### How Routing Works via `onboardingStates`
> 
> In Compass Starter, step navigation for onboarding is state-driven rather than URL-query driven:
> 
> 1. **Top-Level Route Guard (`auth.guard.ts`)**:
> ```typescript
> const onboardingStates = [
>   OnboardingState.WELCOME,
>   OnboardingState.STEP_1,
>   OnboardingState.STEP_2,
>   OnboardingState.STEP_3,
>   OnboardingState.STEP_4,
>   OnboardingState.STEP_5,
>   OnboardingState.STEP_6,
>   OnboardingState.STEP_7,
> ];
> 
> if (onboardingStates.includes(dbUser.onboardingState) && state.url !== '/onboarding') {
>   this.router.navigate(['/onboarding'], { queryParams: next.queryParams });
>   return of(false);
> }
> ```
> If the user's `onboardingState` is in `onboardingStates`, the guard routes them to the single `/onboarding` route.
> 
> 2. **Child Component Display (`onboarding.component.html`)**:
> Inside `onboarding.component.html`, the view conditionally renders the step component matching `currentUser()?.onboardingState`:
> ```html
> <div class=\"onboarding-container\">
>   @if (currentUser()?.onboardingState === OnboardingState.STEP_3) {
>     <app-onboard-quarterly-goals></app-onboard-quarterly-goals>
>   }
> </div>
> ```
> 
> 3. **Step Transitions**:
> - When the user clicks **Next** in `onboard-quarterly-goals.component.ts`, it updates the user's document in Firestore:
> ```typescript
> await this.userStore.update(userId, { onboardingState: OnboardingState.STEP_4 }, { batchConfig });
> ```
> - When the user clicks **Back**, it updates the state to `OnboardingState.STEP_2`.
> - The `currentUser` signal updates automatically in the parent `OnboardingComponent`, which swaps to the corresponding child step.
> 
> ---
> 
> ### 💡 Socratic Pivot Questions
> 
> 1. *How would you like to handle local testing when you want to jump straight to Step 3? Would you prefer changing the mock user's default `onboardingState` in `user.mock.ts` to `OnboardingState.STEP_3`, or setting up a dev state switcher?*
> 2. *As the other onboarding steps (Step 1, Step 2, Step 4, etc.) are implemented, how should `onboarding.component.html` transition between them (e.g. an `@if` / `@switch` block with animation triggers)?*"

**User**:
> "you should not change the auth.guard.ts file. only change things within @[OnboardQuarterlyGoalsComponent] and @[OnboardingComponent] .
> also yes i think using some sort of @if/@switch statement will work for the html."

**Agent**:
> "All changes are scoped strictly to `OnboardQuarterlyGoalsComponent` and `OnboardingComponent`, leaving `auth.guard.ts` untouched:
> 
> ### Summary of Changes
> 
> 1. **`OnboardQuarterlyGoalsComponent`**:
> - Replaced `this.cdr.detectChanges()` and RxJS subscriptions with an `effect()` in the constructor that watches `currentUser()` and populates the form whenever the user signal resolves.
> - Removed the unused `backClicked = output<void>()` output and removed the `ChangeDetectorRef` dependency.
> 
> 2. **`OnboardingComponent` & `onboarding.component.html`**:
> - Exposed `OnboardingState` enum in `OnboardingComponent`.
> - Used `@if (currentUser()?.onboardingState === OnboardingState.STEP_3)` in `onboarding.component.html` so that when the user advances to Step 3, the `<app-onboard-quarterly-goals>` component is displayed.
> 
> The project compiles with `0` errors and passes all budget constraints. When you're ready, feel free to type `/resolved`."

**User**:
> "how can i view my step 3 page then (i.e. how do i get to OnboardingState.STEP_3), and how do i know/make sure that my routing works?"

**Agent**:
> "To view and verify your Step 3 page in your development environment, here is how the state-driven onboarding works and how you can test it:
> 
> ---
> 
> ### 1. How the App Determines Which Step You Are On
> 
> In Compass Starter, when you click **\"Sign in with Google\"**, the app loads the mock user profile from `src/app/core/store/user/user.mock.ts`:
> 
> ```typescript
> export const USER_DB: User[] = [
>   {
>     __id: '1',
>     email: 'a@sample.com',
>     name: 'User A',
>     photoURL: '/images/tech4good-logo.png',
>     onboardingState: OnboardingState.WELCOME, // <-- Currently starts here
>     ...
>   }
> ];
> ```
> 
> Because `USER_DB[0]` has `onboardingState: OnboardingState.WELCOME`, the logged-in user starts on the welcome step. Since only `STEP_3` is in `onboarding.component.html`, nothing renders until the state reaches `STEP_3`.
> 
> ---
> 
> ### 2. How to View Step 3 Right Now
> 
> To immediately jump to Step 3 and see your component in action:
> 
> 1. Open `src/app/core/store/user/user.mock.ts`.
> 2. Change line 17 from `OnboardingState.WELCOME` to `OnboardingState.STEP_3`:
> ```typescript
> onboardingState: OnboardingState.STEP_3,
> ```
> 3. Save the file and log in at your dev server URL.
> 4. You will be routed to `/onboarding` and your **`OnboardQuarterlyGoalsComponent`** (`Set some goals for this quarter.`) will render immediately!
> 
> ---
> 
> ### 3. How to Know Your Routing Works in the Real Flow
> 
> The onboarding progression is fully reactive through the `UserStore`:
> - When the user transitions to Step 3 from Step 2, `userStore.update(userId, { onboardingState: OnboardingState.STEP_3 })` is called.
> - The `currentUser` signal in `OnboardingComponent` automatically updates.
> - `onboarding.component.html`'s `@if (currentUser()?.onboardingState === OnboardingState.STEP_3)` evaluates to `true` and mounts your component.
> - Clicking **Next** in your component saves the quarterly goals and advances the state to `STEP_4`.
> - Clicking **Back** updates the state to `STEP_2`."

**User**:
> "yes, changing 'onboardingState' to 'OnboardingState.STEP_3' works! /resolved.
> im imagining when this is connected to a firebase db (and the sign in to google uses oauth), that the onboardingState will actually match the current user's last updated state, right?"
