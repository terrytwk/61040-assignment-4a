---
timestamp: 'Thu Oct 23 2025 13:58:31 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251023_135831.5871c26a.md]]'
content_id: 425c5fc1b08125c7d73179dd81cafb0d0e53815a2ca8632a75879f36f3b5b3e5
---

# API Specification: Order Concept

**Purpose:** Capture a member’s order lifecycle and chosen customizations (no pricing).

***

## API Endpoints

### POST /api/Order/open

**Description:** Opens a new order for a user.

**Requirements:**

* true (membership gating via sync)

**Effects:**

* creates order with status := pending

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

***

### POST /api/Order/addItem

**Description:** Adds an item with customizations to an existing order.

**Requirements:**

* order exists and status = pending (validity checked via sync)

**Effects:**

* creates line; copies displayItemName; stores SelectedChoices with copied display names

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

***

### POST /api/Order/submit

**Description:** Submits a pending order.

**Requirements:**

* order exists and status = pending and order has ≥ 1 line

**Effects:**

* lifecycle only

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

***

### POST /api/Order/complete

**Description:** Marks a pending order as completed.

**Requirements:**

* order exists and status = pending

**Effects:**

* sets status := completed

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

***

### POST /api/Order/cancel

**Description:** Cancels a pending order.

**Requirements:**

* order exists and status = pending

**Effects:**

* sets status := canceled

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

***

### POST /api/Order/\_lines

**Description:** Retrieves the order lines and selections for an order.

**Requirements:**

* order exists

**Effects:**

* returns structured lines + selections

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

***

### POST /api/Order/\_status

**Description:** Retrieves the current status of an order.

**Requirements:**

* order exists

**Effects:**

* returns current status

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

***

### POST /api/Order/\_byStatus

**Description:** Retrieves all orders with a specified status, ordered by creation time (newest first), including order lines and selections.

**Requirements:**

* true

**Effects:**

* returns all orders with the specified status, ordered by creation time (newest first), including order lines and selections

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

***
