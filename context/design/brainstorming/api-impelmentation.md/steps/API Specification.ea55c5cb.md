---
timestamp: 'Mon Oct 20 2025 15:31:18 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_153118.fb1bfc10.md]]'
content_id: ea55c5cb8ef3a3953956e48e7e302a4fd30ae33b2dc22958dd0b436d02976e21
---

# API Specification: UserProfile Concept

**Purpose:** Store display information about a user.

***

## API Endpoints

### POST /api/UserProfile/setProfile

**Description:** Updates the display profile information for a user.

**Requirements:**

* user exists

**Effects:**

* updates only provided fields; others unchanged

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

***

### POST /api/UserProfile/\_profile

**Description:** Retrieves the display profile fields for a user.

**Requirements:**

* user exists

**Effects:**

* returns current profile fields

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

***
