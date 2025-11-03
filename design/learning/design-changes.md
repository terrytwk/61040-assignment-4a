[@concepts-v1](../brainstorming/concepts-v1.md)

[@concepts](../brainstorming/concepts.md)

# prompt: concepts-v1 is the initial design of the concepts and concepts is the latest version of the concept design. Explain the changes made. Keep it as concise and clear as possible.

# response:

The final version refines and expands the initial concept design, focusing on greater specificity, clearer separation of concerns, and robust interaction modeling through a new `Request` pseudo-concept and explicit `Synchronizations`.

Here's a concept-by-concept summary of changes:

1.  **UserAuth / UserAuthentication:**
    *   **State:** Added `passwordHash` for security; removed explicit `logout` (implies session management handled externally).
    *   **Actions:** Added `changePassword`.
    *   **Queries:** Added `_byUsername`.
2.  **Membership:**
    *   **State:** Simplified by removing `semester` and `price` (focusing purely on active status). Renamed `active` to `isActive`.
    *   **Actions:** Renamed `createMembership` to `activate`, `toggleActive` to `deactivate`.
    *   **Queries:** Added `_isActive` and `_joinedDate`.
3.  **Menu:**
    *   **Major Expansion:** This is the most significant change.
        *   `v1` had a simple `Item` with a `set of Options` and `available` boolean.
        *   `Final` introduces a detailed model with distinct entities: `Items`, `Options`, `Choices`, and `Applicabilities`. This allows for explicit definition of option requirements (`required`, `maxChoices`) and item-specific `disallowedChoices`.
    *   **Actions:** Expanded to manage `Items`, `Options`, `Choices`, `attachOption`, `detachOption`, `disallowChoice`, `allowChoice`.
    *   **Queries:** Added comprehensive queries like `_optionsForItem`, `_choicesFor`, and `_isSelectionSetValid` for robust selection validation.
4.  **Order:**
    *   **Expansion:** Now models detailed item customizations.
        *   `v1` had `items set of Item`.
        *   `Final` uses `OrderLines` and `SelectedChoices` to capture specific customizations (`Option`, `Choice`) for each item. Added `displayItemName`, `displayOptionName`, `displayChoiceName` to store names at the time of order.
    *   **Status Flow:** Refined status states (`pending`, `completed`, `canceled`).
    *   **Actions:** `createOrder` became `open`; `updateStatus` became more specific `submit`, `complete`, `cancel`. `addItem` now includes `selections`.
    *   **Queries:** Added `_lines` with detailed selections.
5.  **CustomerFeedback:**
    *   **State:** Simplified by removing `rating` and `public` fields.
    *   **Actions:** `submitFeedback` renamed to `create`.
    *   **Queries:** Added `_forUser`.
6.  **UserProfile:**
    *   **State:** Simplified by removing `favoriteDrink`, `classYear`, `major`, `type`, `score`. Added `avatar`.
    *   **Actions:** `updateProfile` renamed to `setProfile`.
    *   **Queries:** `_getProfile` renamed to `_profile`. Added `_allProfiles` to list all user profiles for community browsing (names, bio, optional class year/major, favorites, avatar).
7.  **Option (v1) / Integration:**
    *   The incomplete `Option` concept from `v1` was removed as a standalone concept and its functionality was thoroughly integrated and expanded within the new, detailed `Menu` concept in the final version.
8.  **New Concepts:**
    *   **Synchronizations:** Formalized the "when-where-then" logic to connect concepts and enforce business rules, replacing the ad-hoc "Sync Example" sections.