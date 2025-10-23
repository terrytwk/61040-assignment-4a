# Data Generation Instructions

This document provides step-by-step instructions for generating test data for the cafe ordering system concepts.

## Configuration

### User Configuration
```yaml
users:
  - username: "terrytwk"
    password: "password"
    profile:
      name: "Terry"
      classYear: "2026"
      major: "6-3"
      bio: "i love coffee"
      favoriteDrink: "cortado"
      favoriteCafe: "George Howell"
  - username: "alice_cs"
    password: "password123"
    profile:
      name: "Alice Chen"
      classYear: "2025"
      major: "6-3"
      bio: "Computer Science student passionate about algorithms"
      favoriteDrink: "oat milk latte"
      favoriteCafe: "Main Campus Cafe"
  - username: "bob_math"
    password: "password456"
    profile:
      name: "Bob Johnson"
      classYear: "2026"
      major: "18"
      bio: "Mathematics major who loves coffee breaks"
      favoriteDrink: "americano"
      favoriteCafe: "Student Center"
  - username: "charlie_eng"
    password: "password789"
    profile:
      name: "Charlie Brown"
      classYear: "2027"
      major: "6-2"
      bio: "Engineering student exploring different coffee roasts"
      favoriteDrink: "cappuccino"
      favoriteCafe: "Tech Square"
```

### Menu Configuration
```yaml
menu_items:
  - name: "Latte"
    description: "Espresso with steamed milk"
    has_milk: true
  - name: "Americano"
    description: "Espresso with hot water"
    has_milk: false
  - name: "Cappuccino"
    description: "Espresso with equal parts steamed milk and foam"
    has_milk: true
  - name: "Cortado"
    description: "Espresso with a small amount of warm milk"
    has_milk: true

options:
  temperature:
    name: "Temperature"
    required: true
    maxChoices: 1
    choices: ["hot", "iced"]
  
  milk:
    name: "Milk"
    required: false
    maxChoices: 1
    choices: ["whole", "oat"]
```

## Step-by-Step Data Generation

### Step 1: Create User Authentication and Profiles

1. **Register Users**
   - **Endpoint**: `POST /api/UserAuthentication/register`
   - **Payload for each user**:
     ```json
     {
       "username": "terrytwk",
       "password": "password"
     }
     ```
   - **Expected Response**: `{"user": "generated_user_id"}`
   - **Note**: Save the returned user ID for profile creation

2. **Create User Profiles**
   - **Endpoint**: `POST /api/UserProfile/setProfile`
   - **Payload for terrytwk**:
     ```json
     {
       "user": "terrytwk_user_id",
       "name": "Terry",
       "classYear": "2026",
       "major": "6-3",
       "bio": "i love coffee",
       "favoriteDrink": "cortado",
       "favoriteCafe": "George Howell"
     }
     ```
   - **Repeat for all users** with their respective profile data
   - **Expected Response**: `{}` (empty object for success)

### Step 2: Create Menu Options

3. **Create Temperature Option**
   - **Endpoint**: `POST /api/Menu/createOption`
   - **Payload**:
     ```json
     {
       "name": "Temperature",
       "required": true,
       "maxChoices": 1
     }
     ```
   - **Expected Response**: `{"option": "generated_option_id"}`
   - **Note**: Save the returned option ID

4. **Create Milk Option**
   - **Endpoint**: `POST /api/Menu/createOption`
   - **Payload**:
     ```json
     {
       "name": "Milk",
       "required": false,
       "maxChoices": 1
     }
     ```
   - **Expected Response**: `{"option": "generated_option_id"}`
   - **Note**: Save the returned option ID

### Step 3: Create Menu Choices

5. **Create Temperature Choices**
   - **Endpoint**: `POST /api/Menu/createChoice`
   - **Payload for "hot"**:
     ```json
     {
       "option": "temperature_option_id",
       "name": "hot"
     }
     ```
   - **Payload for "iced"**:
     ```json
     {
       "option": "temperature_option_id",
       "name": "iced"
     }
     ```
   - **Note**: Save the returned choice IDs

6. **Create Milk Choices**
   - **Endpoint**: `POST /api/Menu/createChoice`
   - **Payload for "whole"**:
     ```json
     {
       "option": "milk_option_id",
       "name": "whole"
     }
     ```
   - **Payload for "oat"**:
     ```json
     {
       "option": "milk_option_id",
       "name": "oat"
     }
     ```
   - **Note**: Save the returned choice IDs

### Step 4: Create Menu Items

7. **Create Latte**
   - **Endpoint**: `POST /api/Menu/createItem`
   - **Payload**:
     ```json
     {
       "name": "Latte",
       "description": "Espresso with steamed milk"
     }
     ```
   - **Expected Response**: `{"item": "generated_item_id"}`
   - **Note**: Save the returned item ID

8. **Create Americano**
   - **Endpoint**: `POST /api/Menu/createItem`
   - **Payload**:
     ```json
     {
       "name": "Americano",
       "description": "Espresso with hot water"
     }
     ```

9. **Create Cappuccino**
   - **Endpoint**: `POST /api/Menu/createItem`
   - **Payload**:
     ```json
     {
       "name": "Cappuccino",
       "description": "Espresso with equal parts steamed milk and foam"
     }
     ```

10. **Create Cortado**
   - **Endpoint**: `POST /api/Menu/createItem`
   - **Payload**:
     ```json
     {
       "name": "Cortado",
       "description": "Espresso with a small amount of warm milk"
     }
     ```

### Step 5: Attach Options to Items

11. **Attach Temperature to All Items**
    - **Endpoint**: `POST /api/Menu/attachOption`
    - **Payload for each item**:
      ```json
      {
        "item": "item_id",
        "option": "temperature_option_id"
      }
      ```
    - **Repeat for**: Latte, Americano, Cappuccino, Cortado

12. **Attach Milk to Milk-Based Drinks**
    - **Endpoint**: `POST /api/Menu/attachOption`
    - **Payload for milk-based drinks**:
      ```json
      {
        "item": "item_id",
        "option": "milk_option_id"
      }
      ```
    - **Apply to**: Latte, Cappuccino, Cortado
    - **Note**: Americano does NOT get milk option

## Verification Steps

### Verify Menu Structure

13. **Check Options for Each Item**
    - **Endpoint**: `POST /api/Menu/_optionsForItem`
    - **Payload**:
      ```json
      {
        "item": "item_id"
      }
      ```
    - **Expected for Latte/Cappuccino/Cortado**: Both temperature and milk options
    - **Expected for Americano**: Only temperature option

14. **Check Choices for Each Option**
    - **Endpoint**: `POST /api/Menu/_choicesFor`
    - **Payload**:
      ```json
      {
        "item": "item_id",
        "option": "option_id"
      }
      ```
    - **Expected for temperature**: ["hot", "iced"]
    - **Expected for milk**: ["whole", "oat"]

## Sample Data Summary

After completing all steps, you should have:

- **4 Users**: terrytwk, alice_cs, bob_math, charlie_eng (all with passwords and complete profiles)
- **4 User Profiles**: Complete profile information for all users including names, class years, majors, bios, favorite drinks, and favorite cafes
- **4 Menu Items**: Latte, Americano, Cappuccino, Cortado
- **2 Options**: Temperature (required), Milk (optional)
- **4 Choices**: hot, iced, whole, oat
- **Proper Attachments**: 
  - All drinks have temperature option
  - Milk-based drinks (Latte, Cappuccino, Cortado) have milk option
  - Americano only has temperature option

## Testing Order Creation

Once data is generated, you can test the order flow:

1. **Activate User Membership** (if Membership concept is implemented)
2. **Open Order**: `POST /api/Order/open` with user ID
3. **Add Items**: `POST /api/Order/addItem` with valid selections
4. **Submit Order**: `POST /api/Order/submit`
5. **Complete Order**: `POST /api/Order/complete`

## Customization Notes

- **Username/Password**: Modify the user configuration section to add more users
- **Menu Items**: Add new items to the menu_items configuration
- **Options/Choices**: Extend the options configuration for new customization types
- **Item-Option Relationships**: Update the attachment steps for new combinations

This structure allows for easy modification of test data while maintaining consistency across the system.
