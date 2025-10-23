---
timestamp: 'Thu Oct 23 2025 13:58:31 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251023_135831.5871c26a.md]]'
content_id: ceb7c3fde75cedeeb2bd38a5110fc0858e82b99aeeb25d1dabda1a0ef34b4949
---

# API Specification: UserAuthentication Concept

**Purpose:** Authenticate users by credential.

***

## API Endpoints

### POST /api/UserAuthentication/register

**Description:** Registers a new user with a username and password.

**Requirements:**

* username not already taken

**Effects:**

* creates user; stores password hash

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

***

### POST /api/UserAuthentication/login

**Description:** Logs in a user with the provided credentials.

**Requirements:**

* user exists and password matches

**Effects:**

* returns the corresponding user

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

***

### POST /api/UserAuthentication/changePassword

**Description:** Changes the password for an existing user.

**Requirements:**

* user exists and oldPassword matches

**Effects:**

* updates passwordHash

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

***

### POST /api/UserAuthentication/\_byUsername

**Description:** Retrieves a user by their username.

**Requirements:**

* true

**Effects:**

* returns user if present

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

***

### POST /api/UserAuthentication/\_searchByKerb

**Description:** Searches for users whose usernames contain the query string (case-insensitive).

**Requirements:**

* true

**Effects:**

* returns users whose usernames contain the query string (case-insensitive)

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

***
