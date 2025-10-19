---
timestamp: 'Thu Oct 16 2025 13:02:31 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_130231.2fa825f1.md]]'
content_id: 7a94913fa1348fc6c867bcfa41cf8764b32e2212e375fdd2dd5f0405cdef910f
---

# concept: CustomerOrdering

**purpose** To enable customers to select items and create an order for purchase.

**principle** If a customer creates a new order, adds several items to it, and then places the order, the system remembers the items and their quantities associated with that specific order, ready for fulfillment.

**state**
A set of Customers (generic type `Customer`)
A set of Items (generic type `Item`)
A set of Orders with
a customer: Customer
a status: String (e.g., "pending", "placed", "cancelled", "fulfilled")
A set of OrderItems with
an order: Order
an item: Item
a quantity: Number

**actions**

1. **createOrder (customer: Customer): (order: Order)**
   * **requires** `customer` exists.
   * **effects** Creates a new `Order` `o` with `customer` as its customer and `status` "pending"; returns `o`.

2. **addItemToOrder (order: Order, item: Item, quantity: Number): Empty | (error: String)**
   * **requires** `order` exists and its `status` is "pending"; `quantity` is greater than 0.
   * **effects** If an `OrderItem` already exists for `order` and `item`, updates its `quantity` by adding the new `quantity`; otherwise, creates a new `OrderItem` `oi` for `order` and `item` with the given `quantity`.

3. **removeItemFromOrder (order: Order, item: Item): Empty | (error: String)**
   * **requires** `order` exists and its `status` is "pending"; an `OrderItem` exists for `order` and `item`.
   * **effects** Deletes the `OrderItem` for `order` and `item`.

4. **updateItemQuantity (order: Order, item: Item, newQuantity: Number): Empty | (error: String)**
   * **requires** `order` exists and its `status` is "pending"; an `OrderItem` exists for `order` and `item`; `newQuantity` is greater than or equal to 0.
   * **effects** If `newQuantity` is 0, deletes the `OrderItem` for `order` and `item`; otherwise, updates the `quantity` of the `OrderItem` for `order` and `item` to `newQuantity`.

5. **placeOrder (order: Order): Empty | (error: String)**
   * **requires** `order` exists and its `status` is "pending"; `order` has at least one `OrderItem`.
   * **effects** Sets the `status` of `order` to "placed".

6. **cancelOrder (order: Order): Empty | (error: String)**
   * **requires** `order` exists and its `status` is "pending" or "placed".
   * **effects** Sets the `status` of `order` to "cancelled".

**queries**

1. **\_getOrdersByCustomer (customer: Customer): (order: Order)\[]**
   * **requires** `customer` exists.
   * **effects** Returns a set of all `Order`s associated with the given `customer`.

2. **\_getOrderDetails (order: Order): (details: {customer: Customer, status: String, items: {item: Item, quantity: Number}\[]})\[] | (error: String)**
   * **requires** `order` exists.
   * **effects** Returns the `customer` and `status` of the `order`, and a list of its `items` with their `quantity`.

***
