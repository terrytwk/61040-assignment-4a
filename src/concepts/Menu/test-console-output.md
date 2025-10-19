# Test Console Output

```
running 1 test from ./src/concepts/Menu/MenuConcept.test.ts
Menu Concept Principle and Actions ...
  Principle: Setup items and options ...
------- output -------
Created Items: Latte (0199f9e5-ebd7-733b-a979-abb94a0727fa), Americano (0199f9e5-ec04-7963-bdf0-7b6f14240a96)
Created Options: Temperature (0199f9e5-ec17-7aa5-b2a5-67b3cad89927), Milk (0199f9e5-ec38-7069-87ee-186bf5f3afea), Sweetener (0199f9e5-ec4a-7128-a4dc-8cba1f4f3036)
Created Choices: Hot (0199f9e5-ec6e-74ce-b021-28e35dc9e494), Cold (0199f9e5-ec9f-77ab-a352-5efb3a5996b3), Whole Milk (0199f9e5-ecc2-72be-9cf5-034e5668b19a), Oat Milk (0199f9e5-ece8-79b8-8cd6-2db6ebca483e), Sugar (0199f9e5-ed12-7db3-8c04-bbb48dedf69a)
Attached options to items.
Verified that Americano does not have milk options (error: Applicability for item 0199f9e5-ec04-7963-bdf0-7b6f14240a96 and option 0199f9e5-ec38-7069-87ee-186bf5f3afea not found.)
Verified valid Latte selection.
Verified invalid Latte selection (missing required).
Verified invalid Latte selection (too many choices).
Verified invalid Americano selection (unattached option).
----- output end -----
  Principle: Setup items and options ... ok (1s)
  Action: createItem ...
------- output -------
Created Coffee item (0199f9e5-f074-7258-b3aa-bd3a9f84a2e7) and verified no initial options.
----- output end -----
  Action: createItem ... ok (71ms)
  Action: setItemActive ...
------- output -------
Verified setItemActive functionality including error case.
----- output end -----
  Action: setItemActive ... ok (58ms)
  Action: createOption ...
------- output -------
Verified createOption functionality including error case for maxChoices.
----- output end -----
  Action: createOption ... ok (20ms)
  Action: createChoice ...
------- output -------
Verified createChoice functionality including error case.
----- output end -----
  Action: createChoice ... ok (72ms)
  Action: attachOption ...
------- output -------
Verified attachOption functionality.
----- output end -----
  Action: attachOption ... ok (279ms)
  Action: detachOption ...
------- output -------
Verified detachOption functionality.
----- output end -----
  Action: detachOption ... ok (198ms)
  Action: disallowChoice and allowChoice ...
------- output -------
Verified disallowChoice and validation with disallowed choices.
Verified error when disallowing choice from wrong option.
Verified disallowChoice and allowChoice functionality.
----- output end -----
  Action: disallowChoice and allowChoice ... ok (598ms)
  Query: _optionsForItem ...
------- output -------
Verified _optionsForItem functionality.
----- output end -----
  Query: _optionsForItem ... ok (279ms)
  Query: _choicesFor ...
------- output -------
Verified _choicesFor returns error for unattached options.
----- output end -----
  Query: _choicesFor ... ok (93ms)
  Query: _isSelectionSetValid - comprehensive checks ...
------- output -------
Verified _isSelectionSetValid with comprehensive checks.
----- output end -----
  Query: _isSelectionSetValid - comprehensive checks ... ok (502ms)
Menu Concept Principle and Actions ... ok (3s)

ok | 1 passed (11 steps) | 0 failed (3s)
```