---
timestamp: 'Mon Oct 20 2025 15:31:18 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_153118.fb1bfc10.md]]'
content_id: 2b48852eb35d8f9a7356fe068b3a39f191c8e91b75fa9ac94e76e44e88f8ab08
---

# API Specification: Membership Concept

**Purpose:** Represent eligibility for ordering at the student-run cafe.

***

## API Endpoints

### POST /api/Membership/activate

**Description:** Activates a user's membership.

**Requirements:**

* user exists

**Effects:**

* sets isActive := true; sets joinedDate if unset

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

***

### POST /api/Membership/deactivate

**Description:** Deactivates a user's membership.

**Requirements:**

* user exists

**Effects:**

* sets isActive := false

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

***

### POST /api/Membership/\_isActive

**Description:** Checks if a user's membership is active.

**Requirements:**

* user exists

**Effects:**

* returns membership flag

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

***

### POST /api/Membership/\_joinedDate

**Description:** Retrieves the joined date of a user's membership.

**Requirements:**

* user exists

**Effects:**

* returns joinedDate if any

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

***
