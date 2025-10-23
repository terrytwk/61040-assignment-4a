[@api-extraction-from-code](../tools/api-extraction-from-code.md)

[@concepts](concepts.md)

# generate: API Spec
# response:

Here is the API specification for the provided concepts.

# API Specification: UserAuthentication Concept

**Purpose:** Authenticate users by credential.

---

## API Endpoints

### POST /api/UserAuthentication/register

**Description:** Registers a new user with a username and password.

**Requirements:**
- username not already taken

**Effects:**
- creates user; stores password hash

**Request Body:**
```json
{
  "username": "String",
  "password": "String"
}
```

**Success Response Body (Action):**
```json
{
  "user": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/login

**Description:** Logs in a user with the provided credentials.

**Requirements:**
- user exists and password matches

**Effects:**
- returns the corresponding user

**Request Body:**
```json
{
  "username": "String",
  "password": "String"
}
```

**Success Response Body (Action):**
```json
{
  "user": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/changePassword

**Description:** Changes the password for an existing user.

**Requirements:**
- user exists and oldPassword matches

**Effects:**
- updates passwordHash

**Request Body:**
```json
{
  "user": "ID",
  "oldPassword": "String",
  "newPassword": "String"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/_byUsername

**Description:** Retrieves a user by their username.

**Requirements:**
- true

**Effects:**
- returns user if present

**Request Body:**
```json
{
  "username": "String"
}
```

**Success Response Body (Query):**
```json
[
  {
    "user": "ID"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: UserProfile Concept

**Purpose:** Store display information about a user.

---

## API Endpoints

### POST /api/UserProfile/setProfile

**Description:** Updates the display profile information for a user.

**Requirements:**
- user exists

**Effects:**
- updates only provided fields; others unchanged

**Request Body:**
```json
{
  "user": "ID",
  "name?": "String",
  "bio?": "String",
  "avatar?": "String"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserProfile/_profile

**Description:** Retrieves the display profile fields for a user.

**Requirements:**
- user exists

**Effects:**
- returns current profile fields

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "name": "String",
    "bio": "String",
    "avatar?": "String"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: Membership Concept

**Purpose:** Represent eligibility for ordering at the student-run cafe.

---

## API Endpoints

### POST /api/Membership/activate

**Description:** Activates a user's membership.

**Requirements:**
- user exists

**Effects:**
- sets isActive := true; sets joinedDate if unset

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Membership/deactivate

**Description:** Deactivates a user's membership.

**Requirements:**
- user exists

**Effects:**
- sets isActive := false

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Membership/_isActive

**Description:** Checks if a user's membership is active.

**Requirements:**
- user exists

**Effects:**
- returns membership flag

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "isActive": "Boolean"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Membership/_joinedDate

**Description:** Retrieves the joined date of a user's membership.

**Requirements:**
- user exists

**Effects:**
- returns joinedDate if any

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "joinedDate?": "String"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: Menu Concept

**Purpose:** Define items and their configurable options/choices (no pricing).

---

## API Endpoints

### POST /api/Menu/createItem

**Description:** Creates a new menu item.

**Requirements:**
- true

**Effects:**
- creates active item

**Request Body:**
```json
{
  "name": "String",
  "description": "String"
}
```

**Success Response Body (Action):**
```json
{
  "item": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Menu/setItemActive

**Description:** Sets the active status of a menu item.

**Requirements:**
- item exists

**Effects:**
- sets isActive

**Request Body:**
```json
{
  "item": "ID",
  "isActive": "Boolean"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Menu/createOption

**Description:** Creates a new menu option.

**Requirements:**
- maxChoices ≥ 1

**Effects:**
- creates option

**Request Body:**
```json
{
  "name": "String",
  "required": "Boolean",
  "maxChoices": "Number"
}
```

**Success Response Body (Action):**
```json
{
  "option": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Menu/createChoice

**Description:** Creates a new choice under a given option.

**Requirements:**
- option exists

**Effects:**
- creates active choice under option

**Request Body:**
```json
{
  "option": "ID",
  "name": "String"
}
```

**Success Response Body (Action):**
```json
{
  "choice": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Menu/attachOption

**Description:** Attaches an option to a menu item.

**Requirements:**
- not already attached

**Effects:**
- adds Applicability(item, option) with empty disallowedChoices

**Request Body:**
```json
{
  "item": "ID",
  "option": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Menu/detachOption

**Description:** Detaches an option from a menu item.

**Requirements:**
- Applicability exists

**Effects:**
- removes it

**Request Body:**
```json
{
  "item": "ID",
  "option": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Menu/disallowChoice

**Description:** Disallows a specific choice for an item's option.

**Requirements:**
- Applicability(item, option) and choice belongs to option

**Effects:**
- adds choice to disallowedChoices

**Request Body:**
```json
{
  "item": "ID",
  "option": "ID",
  "choice": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Menu/allowChoice

**Description:** Allows a previously disallowed choice for an item's option.

**Requirements:**
- choice currently disallowed

**Effects:**
- removes from disallowedChoices

**Request Body:**
```json
{
  "item": "ID",
  "option": "ID",
  "choice": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Menu/_optionsForItem

**Description:** Retrieves the options attached to a menu item.

**Requirements:**
- item exists

**Effects:**
- returns attached options

**Request Body:**
```json
{
  "item": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "option": {
      "id": "ID",
      "required": "Boolean",
      "maxChoices": "Number"
    }
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Menu/_choicesFor

**Description:** Retrieves the available choices for an item's option.

**Requirements:**
- Applicability(item, option)

**Effects:**
- returns active choices excluding disallowedChoices

**Request Body:**
```json
{
  "item": "ID",
  "option": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "choice": {
      "id": "ID",
      "name": "String"
    }
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Menu/_isSelectionSetValid

**Description:** Validates a set of option choices for a menu item.

**Requirements:**
- item exists

**Effects:**
- true iff each selected option is attached to item; each choice belongs to its option and is not disallowed; all attached required options are present; per-option maxChoices respected

**Request Body:**
```json
{
  "item": "ID",
  "selections": [
    {
      "option": "ID",
      "choice": "ID"
    }
  ]
}
```

**Success Response Body (Query):**
```json
[
  {
    "ok": "Boolean",
    "reason": "String"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: Order Concept

**Purpose:** Capture a member’s order lifecycle and chosen customizations (no pricing).

---

## API Endpoints

### POST /api/Order/open

**Description:** Opens a new order for a user.

**Requirements:**
- true (membership gating via sync)

**Effects:**
- creates order with status := pending

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Action):**
```json
{
  "order": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Order/addItem

**Description:** Adds an item with customizations to an existing order.

**Requirements:**
- order exists and status = pending (validity checked via sync)

**Effects:**
- creates line; copies displayItemName; stores SelectedChoices with copied display names

**Request Body:**
```json
{
  "order": "ID",
  "item": "ID",
  "qty": "Number",
  "selections": [
    {
      "option": "ID",
      "choice": "ID"
    }
  ]
}
```

**Success Response Body (Action):**
```json
{
  "line": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Order/submit

**Description:** Submits a pending order.

**Requirements:**
- order exists and status = pending and order has ≥ 1 line

**Effects:**
- lifecycle only

**Request Body:**
```json
{
  "order": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Order/complete

**Description:** Marks a pending order as completed.

**Requirements:**
- order exists and status = pending

**Effects:**
- sets status := completed

**Request Body:**
```json
{
  "order": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Order/cancel

**Description:** Cancels a pending order.

**Requirements:**
- order exists and status = pending

**Effects:**
- sets status := canceled

**Request Body:**
```json
{
  "order": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Order/_lines

**Description:** Retrieves the order lines and selections for an order.

**Requirements:**
- order exists

**Effects:**
- returns structured lines + selections

**Request Body:**
```json
{
  "order": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "line": {
      "id": "ID",
      "item": "ID",
      "qty": "Number",
      "selections": [
        {
          "option": "ID",
          "choice": "ID"
        }
      ]
    }
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Order/_status

**Description:** Retrieves the current status of an order.

**Requirements:**
- order exists

**Effects:**
- returns current status

**Request Body:**
```json
{
  "order": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "status": "String"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: CustomerFeedback Concept

**Purpose:** Collect user comments about completed orders for quality tracking and improvement.

---

## API Endpoints

### POST /api/CustomerFeedback/create

**Description:** Creates new feedback for a completed order.

**Requirements:**
- true (completion enforced via sync)

**Effects:**
- creates feedback {user, order, comment, createdAt := now}

**Request Body:**
```json
{
  "user": "ID",
  "order": "ID",
  "comment": "String"
}
```

**Success Response Body (Action):**
```json
{
  "feedbackId": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/CustomerFeedback/_forOrder

**Description:** Retrieves feedback entries for a specific order.

**Requirements:**
- true

**Effects:**
- returns feedback for order

**Request Body:**
```json
{
  "order": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "feedback": {
      "user": "ID",
      "comment": "String",
      "createdAt": "String"
    }
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/CustomerFeedback/_forUser

**Description:** Retrieves feedback entries left by a specific user.

**Requirements:**
- true

**Effects:**
- returns feedback left by user

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "feedback": {
      "order": "ID",
      "comment": "String",
      "createdAt": "String"
    }
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---
# response:

# API Specification: UserAuthentication Concept

**Purpose:** Authenticate users by credential.

---

## API Endpoints

### POST /api/UserAuthentication/register

**Description:** Registers a new user with a username and password.

**Requirements:**
- username not already taken

**Effects:**
- creates user; stores password hash

**Request Body:**
```json
{
  "username": "String",
  "password": "String"
}
```

**Success Response Body (Action):**
```json
{
  "user": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/UserAuthentication/login

**Description:** Logs in a user with the provided credentials.

**Requirements:**
- user exists and password matches

**Effects:**
- returns the corresponding user

**Request Body:**
```json
{
  "username": "String",
  "password": "String"
}
```

**Success Response Body (Action):**
```json
{
  "user": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/UserAuthentication/changePassword

**Description:** Changes the password for an existing user.

**Requirements:**
- user exists and oldPassword matches

**Effects:**
- updates passwordHash

**Request Body:**
```json
{
  "user": "ID",
  "oldPassword": "String",
  "newPassword": "String"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/UserAuthentication/_byUsername

**Description:** Retrieves a user by their username.

**Requirements:**
- true

**Effects:**
- returns user if present

**Request Body:**
```json
{
  "username": "String"
}
```

**Success Response Body (Query):**
```json
[
  {
    "user": "ID"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/UserAuthentication/_searchByKerb

**Description:** Searches for users whose usernames contain the query string (case-insensitive).

**Requirements:**
- true

**Effects:**
- returns users whose usernames contain the query string (case-insensitive)

**Request Body:**
```json
{
  "kerbQuery": "String"
}
```

**Success Response Body (Query):**
```json
[
  {
    "user": "ID",
    "username": "String"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

# API Specification: UserProfile Concept

**Purpose:** Store display information about a user.

---

## API Endpoints

### POST /api/UserProfile/setProfile

**Description:** Updates the display profile information for a user.

**Requirements:**
- user exists

**Effects:**
- updates only provided fields; others unchanged

**Request Body:**
```json
{
  "user": "ID",
  "name?": "String",
  "classYear?": "String",
  "major?": "String",
  "bio?": "String",
  "favoriteDrink?": "String",
  "favoriteCafe?": "String",
  "avatar?": "String"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/UserProfile/_profile

**Description:** Retrieves the display profile fields for a user.

**Requirements:**
- user exists

**Effects:**
- returns current profile fields

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "name": "String",
    "classYear?": "String",
    "major?": "String",
    "bio": "String",
    "favoriteDrink?": "String",
    "favoriteCafe?": "String",
    "avatar?": "String"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

# API Specification: Membership Concept

**Purpose:** Represent eligibility for ordering at the student-run cafe.

---

## API Endpoints

### POST /api/Membership/activate

**Description:** Activates a user's membership.

**Requirements:**
- user exists

**Effects:**
- sets isActive := true; sets joinedDate if unset

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Membership/deactivate

**Description:** Deactivates a user's membership.

**Requirements:**
- user exists

**Effects:**
- sets isActive := false

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Membership/_isActive

**Description:** Checks if a user's membership is active.

**Requirements:**
- user exists

**Effects:**
- returns membership flag

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "isActive": "Boolean"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Membership/_joinedDate

**Description:** Retrieves the joined date of a user's membership.

**Requirements:**
- user exists

**Effects:**
- returns joinedDate if any

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "joinedDate?": "String"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

# API Specification: Menu Concept

**Purpose:** Define items and their configurable options/choices (no pricing).

---

## API Endpoints

### POST /api/Menu/createItem

**Description:** Creates a new menu item.

**Requirements:**
- true

**Effects:**
- creates active item

**Request Body:**
```json
{
  "name": "String",
  "description": "String"
}
```

**Success Response Body (Action):**
```json
{
  "item": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Menu/setItemActive

**Description:** Sets the active status of a menu item.

**Requirements:**
- item exists

**Effects:**
- sets isActive

**Request Body:**
```json
{
  "item": "ID",
  "isActive": "Boolean"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Menu/createOption

**Description:** Creates a new menu option.

**Requirements:**
- maxChoices ≥ 1

**Effects:**
- creates option

**Request Body:**
```json
{
  "name": "String",
  "required": "Boolean",
  "maxChoices": "Number"
}
```

**Success Response Body (Action):**
```json
{
  "option": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Menu/createChoice

**Description:** Creates a new choice under a given option.

**Requirements:**
- option exists

**Effects:**
- creates active choice under option

**Request Body:**
```json
{
  "option": "ID",
  "name": "String"
}
```

**Success Response Body (Action):**
```json
{
  "choice": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Menu/attachOption

**Description:** Attaches an option to a menu item.

**Requirements:**
- not already attached

**Effects:**
- adds Applicability(item, option) with empty disallowedChoices

**Request Body:**
```json
{
  "item": "ID",
  "option": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Menu/detachOption

**Description:** Detaches an option from a menu item.

**Requirements:**
- Applicability exists

**Effects:**
- removes it

**Request Body:**
```json
{
  "item": "ID",
  "option": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Menu/disallowChoice

**Description:** Disallows a specific choice for an item's option.

**Requirements:**
- Applicability(item, option) and choice belongs to option

**Effects:**
- adds choice to disallowedChoices

**Request Body:**
```json
{
  "item": "ID",
  "option": "ID",
  "choice": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Menu/allowChoice

**Description:** Allows a previously disallowed choice for an item's option.

**Requirements:**
- choice currently disallowed

**Effects:**
- removes from disallowedChoices

**Request Body:**
```json
{
  "item": "ID",
  "option": "ID",
  "choice": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Menu/_optionsForItem

**Description:** Retrieves the options attached to a menu item.

**Requirements:**
- item exists

**Effects:**
- returns attached options

**Request Body:**
```json
{
  "item": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "option": {
      "id": "ID",
      "required": "Boolean",
      "maxChoices": "Number"
    }
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Menu/_choicesFor

**Description:** Retrieves the available choices for an item's option.

**Requirements:**
- Applicability(item, option)

**Effects:**
- returns active choices excluding disallowedChoices

**Request Body:**
```json
{
  "item": "ID",
  "option": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "choice": {
      "id": "ID",
      "name": "String"
    }
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Menu/_isSelectionSetValid

**Description:** Validates a set of option choices for a menu item.

**Requirements:**
- item exists

**Effects:**
- true iff each selected option is attached to item; each choice belongs to its option and is not disallowed; all attached required options are present; per-option maxChoices respected

**Request Body:**
```json
{
  "item": "ID",
  "selections": [
    {
      "option": "ID",
      "choice": "ID"
    }
  ]
}
```

**Success Response Body (Query):**
```json
[
  {
    "ok": "Boolean",
    "reason": "String"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

# API Specification: Order Concept

**Purpose:** Capture a member’s order lifecycle and chosen customizations (no pricing).

---

## API Endpoints

### POST /api/Order/open

**Description:** Opens a new order for a user.

**Requirements:**
- true (membership gating via sync)

**Effects:**
- creates order with status := pending

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Action):**
```json
{
  "order": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Order/addItem

**Description:** Adds an item with customizations to an existing order.

**Requirements:**
- order exists and status = pending (validity checked via sync)

**Effects:**
- creates line; copies displayItemName; stores SelectedChoices with copied display names

**Request Body:**
```json
{
  "order": "ID",
  "item": "ID",
  "qty": "Number",
  "selections": [
    {
      "option": "ID",
      "choice": "ID"
    }
  ]
}
```

**Success Response Body (Action):**
```json
{
  "line": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Order/submit

**Description:** Submits a pending order.

**Requirements:**
- order exists and status = pending and order has ≥ 1 line

**Effects:**
- lifecycle only

**Request Body:**
```json
{
  "order": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Order/complete

**Description:** Marks a pending order as completed.

**Requirements:**
- order exists and status = pending

**Effects:**
- sets status := completed

**Request Body:**
```json
{
  "order": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Order/cancel

**Description:** Cancels a pending order.

**Requirements:**
- order exists and status = pending

**Effects:**
- sets status := canceled

**Request Body:**
```json
{
  "order": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Order/_lines

**Description:** Retrieves the order lines and selections for an order.

**Requirements:**
- order exists

**Effects:**
- returns structured lines + selections

**Request Body:**
```json
{
  "order": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "line": {
      "id": "ID",
      "item": "ID",
      "qty": "Number",
      "selections": [
        {
          "option": "ID",
          "choice": "ID"
        }
      ]
    }
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Order/_status

**Description:** Retrieves the current status of an order.

**Requirements:**
- order exists

**Effects:**
- returns current status

**Request Body:**
```json
{
  "order": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "status": "String"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Order/_byStatus

**Description:** Retrieves all orders with a specified status, ordered by creation time (newest first), including order lines and selections.

**Requirements:**
- true

**Effects:**
- returns all orders with the specified status, ordered by creation time (newest first), including order lines and selections

**Request Body:**
```json
{
  "status": "String"
}
```

**Success Response Body (Query):**
```json
[
  {
    "order": "ID",
    "user": "ID",
    "createdAt": "String",
    "lines": [
      {
        "id": "ID",
        "item": "ID",
        "qty": "Number",
        "selections": [
          {
            "option": "ID",
            "choice": "ID"
          }
        ]
      }
    ]
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

# API Specification: CustomerFeedback Concept

**Purpose:** Collect user comments about completed orders for quality tracking and improvement.

---

## API Endpoints

### POST /api/CustomerFeedback/create

**Description:** Creates new feedback for a completed order.

**Requirements:**
- true (completion enforced via sync)

**Effects:**
- creates feedback {user, order, comment, createdAt := now}

**Request Body:**
```json
{
  "user": "ID",
  "order": "ID",
  "comment": "String"
}
```

**Success Response Body (Action):**
```json
{
  "feedbackId": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/CustomerFeedback/_forOrder

**Description:** Retrieves feedback entries for a specific order.

**Requirements:**
- true

**Effects:**
- returns feedback for order

**Request Body:**
```json
{
  "order": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "feedback": {
      "user": "ID",
      "comment": "String",
      "createdAt": "String"
    }
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/CustomerFeedback/_forUser

**Description:** Retrieves feedback entries left by a specific user.

**Requirements:**
- true

**Effects:**
- returns feedback left by user

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "feedback": {
      "order": "ID",
      "comment": "String",
      "createdAt": "String"
    }
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---