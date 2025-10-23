---
timestamp: 'Thu Oct 23 2025 13:58:31 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251023_135831.5871c26a.md]]'
content_id: 75a91f05c577570ad8a0dfe4b89668a581cce4c1bbba09ac7c38ae39a0231607
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

***
