---
timestamp: 'Mon Oct 20 2025 15:31:18 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_153118.fb1bfc10.md]]'
content_id: 7e3428433f64d0f32d0a1cf43f0541d37a10a709b33ff8037cedcd388eff2dca
---

# API Specification: CustomerFeedback Concept

**Purpose:** Collect user comments about completed orders for quality tracking and improvement.

***

## API Endpoints

### POST /api/CustomerFeedback/create

**Description:** Creates new feedback for a completed order.

**Requirements:**

* true (completion enforced via sync)

**Effects:**

* creates feedback {user, order, comment, createdAt := now}

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

***

### POST /api/CustomerFeedback/\_forOrder

**Description:** Retrieves feedback entries for a specific order.

**Requirements:**

* true

**Effects:**

* returns feedback for order

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

***

### POST /api/CustomerFeedback/\_forUser

**Description:** Retrieves feedback entries left by a specific user.

**Requirements:**

* true

**Effects:**

* returns feedback left by user

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

***
