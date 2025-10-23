---
timestamp: 'Mon Oct 20 2025 15:31:18 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_153118.fb1bfc10.md]]'
content_id: b8f5bf5fa60c556f485a20f4a5d1560e047317582cef71176c3f6d16ea67a6d8
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
