---
timestamp: 'Mon Oct 20 2025 15:31:18 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_153118.fb1bfc10.md]]'
content_id: a0f2de3ab5037939f2a63d3a58249c26cfd77599deb8e0066663d0b2d7909c07
---

# API Specification: Menu Concept

**Purpose:** Define items and their configurable options/choices (no pricing).

***

## API Endpoints

### POST /api/Menu/createItem

**Description:** Creates a new menu item.

**Requirements:**

* true

**Effects:**

* creates active item

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

***

### POST /api/Menu/setItemActive

**Description:** Sets the active status of a menu item.

**Requirements:**

* item exists

**Effects:**

* sets isActive

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

***

### POST /api/Menu/createOption

**Description:** Creates a new menu option.

**Requirements:**

* maxChoices ≥ 1

**Effects:**

* creates option

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

***

### POST /api/Menu/createChoice

**Description:** Creates a new choice under a given option.

**Requirements:**

* option exists

**Effects:**

* creates active choice under option

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

***

### POST /api/Menu/attachOption

**Description:** Attaches an option to a menu item.

**Requirements:**

* not already attached

**Effects:**

* adds Applicability(item, option) with empty disallowedChoices

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

***

### POST /api/Menu/detachOption

**Description:** Detaches an option from a menu item.

**Requirements:**

* Applicability exists

**Effects:**

* removes it

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

***

### POST /api/Menu/disallowChoice

**Description:** Disallows a specific choice for an item's option.

**Requirements:**

* Applicability(item, option) and choice belongs to option

**Effects:**

* adds choice to disallowedChoices

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

***

### POST /api/Menu/allowChoice

**Description:** Allows a previously disallowed choice for an item's option.

**Requirements:**

* choice currently disallowed

**Effects:**

* removes from disallowedChoices

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

***

### POST /api/Menu/\_optionsForItem

**Description:** Retrieves the options attached to a menu item.

**Requirements:**

* item exists

**Effects:**

* returns attached options

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

***

### POST /api/Menu/\_choicesFor

**Description:** Retrieves the available choices for an item's option.

**Requirements:**

* Applicability(item, option)

**Effects:**

* returns active choices excluding disallowedChoices

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

***

### POST /api/Menu/\_isSelectionSetValid

**Description:** Validates a set of option choices for a menu item.

**Requirements:**

* item exists

**Effects:**

* true iff each selected option is attached to item; each choice belongs to its option and is not disallowed; all attached required options are present; per-option maxChoices respected

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

***
