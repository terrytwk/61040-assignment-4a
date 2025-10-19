---
timestamp: 'Thu Oct 16 2025 13:02:31 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_130231.2fa825f1.md]]'
content_id: 27a41a43892357b158ce54803ae93b6fcb6f15a2f643e837d15f29fd21d9e33f
---

# file: src/concepts/CustomerOrdering/CustomerOrderingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "CustomerOrdering" + ".";

// Generic types of this concept
type Customer = ID;
type Item = ID;
type Order = ID;

/**
 * a set of Orders with
 *   a customer: Customer
 *   a status: String (e.g., "pending", "placed", "cancelled", "fulfilled")
 */
interface OrderDoc {
  _id: Order;
  customer: Customer;
  status: "pending" | "placed" | "cancelled" | "fulfilled";
}

/**
 * a set of OrderItems with
 *   an order: Order
 *   an item: Item
 *   a quantity: Number
 */
interface OrderItemDoc {
  _id: ID; // Unique ID for each OrderItem entry
  order: Order;
  item: Item;
  quantity: number;
}

export default class CustomerOrderingConcept {
  orders: Collection<OrderDoc>;
  orderItems: Collection<OrderItemDoc>;

  constructor(private readonly db: Db) {
    this.orders = this.db.collection(PREFIX + "orders");
    this.orderItems = this.db.collection(PREFIX + "orderItems");
  }

  /**
   * createOrder (customer: Customer): (order: Order)
   *
   * **requires** `customer` exists.
   *
   * **effects** Creates a new `Order` `o` with `customer` as its customer and `status` "pending"; returns `o`.
   */
  async createOrder({ customer }: { customer: Customer }): Promise<{ order: Order }> {
    // In a real scenario, we might check if the customer ID is valid,
    // possibly by querying a User/Customer concept. For this exercise,
    // we assume external Customer IDs are valid.
    const newOrder: OrderDoc = {
      _id: freshID(),
      customer: customer,
      status: "pending",
    };
    await this.orders.insertOne(newOrder);
    return { order: newOrder._id };
  }

  /**
   * addItemToOrder (order: Order, item: Item, quantity: Number): Empty | (error: String)
   *
   * **requires** `order` exists and its `status` is "pending"; `quantity` is greater than 0.
   *
   * **effects** If an `OrderItem` already exists for `order` and `item`, updates its `quantity` by adding the new `quantity`;
   * otherwise, creates a new `OrderItem` `oi` for `order` and `item` with the given `quantity`.
   */
  async addItemToOrder({ order, item, quantity }: {
    order: Order;
    item: Item;
    quantity: number;
  }): Promise<Empty | { error: string }> {
    if (quantity <= 0) {
      return { error: "Quantity must be greater than 0." };
    }

    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order with ID ${order} not found.` };
    }
    if (existingOrder.status !== "pending") {
      return { error: `Cannot add items to an order with status "${existingOrder.status}". Only "pending" orders can be modified.` };
    }

    const existingOrderItem = await this.orderItems.findOne({ order, item });

    if (existingOrderItem) {
      await this.orderItems.updateOne(
        { _id: existingOrderItem._id },
        { $inc: { quantity: quantity } },
      );
    } else {
      const newOrderItem: OrderItemDoc = {
        _id: freshID(),
        order: order,
        item: item,
        quantity: quantity,
      };
      await this.orderItems.insertOne(newOrderItem);
    }
    return {};
  }

  /**
   * removeItemFromOrder (order: Order, item: Item): Empty | (error: String)
   *
   * **requires** `order` exists and its `status` is "pending"; an `OrderItem` exists for `order` and `item`.
   *
   * **effects** Deletes the `OrderItem` for `order` and `item`.
   */
  async removeItemFromOrder({ order, item }: {
    order: Order;
    item: Item;
  }): Promise<Empty | { error: string }> {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order with ID ${order} not found.` };
    }
    if (existingOrder.status !== "pending") {
      return { error: `Cannot remove items from an order with status "${existingOrder.status}". Only "pending" orders can be modified.` };
    }

    const deleteResult = await this.orderItems.deleteOne({ order, item });
    if (deleteResult.deletedCount === 0) {
      return { error: `Item ${item} not found in order ${order}.` };
    }
    return {};
  }

  /**
   * updateItemQuantity (order: Order, item: Item, newQuantity: Number): Empty | (error: String)
   *
   * **requires** `order` exists and its `status` is "pending"; an `OrderItem` exists for `order` and `item`; `newQuantity` is greater than or equal to 0.
   *
   * **effects** If `newQuantity` is 0, deletes the `OrderItem` for `order` and `item`; otherwise, updates the `quantity` of the `OrderItem` for `order` and `item` to `newQuantity`.
   */
  async updateItemQuantity({ order, item, newQuantity }: {
    order: Order;
    item: Item;
    newQuantity: number;
  }): Promise<Empty | { error: string }> {
    if (newQuantity < 0) {
      return { error: "New quantity cannot be negative." };
    }

    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order with ID ${order} not found.` };
    }
    if (existingOrder.status !== "pending") {
      return { error: `Cannot update items in an order with status "${existingOrder.status}". Only "pending" orders can be modified.` };
    }

    if (newQuantity === 0) {
      const deleteResult = await this.orderItems.deleteOne({ order, item });
      if (deleteResult.deletedCount === 0) {
        return { error: `Item ${item} not found in order ${order}.` };
      }
    } else {
      const updateResult = await this.orderItems.updateOne(
        { order, item },
        { $set: { quantity: newQuantity } },
      );
      if (updateResult.matchedCount === 0) {
        // If the item doesn't exist, this implies it should be added if newQuantity > 0.
        // The spec implies 'an OrderItem exists for order and item' in requires.
        // So, if it doesn't exist, it's an error.
        return { error: `Item ${item} not found in order ${order}. Use addItemToOrder to add new items.` };
      }
    }
    return {};
  }

  /**
   * placeOrder (order: Order): Empty | (error: String)
   *
   * **requires** `order` exists and its `status` is "pending"; `order` has at least one `OrderItem`.
   *
   * **effects** Sets the `status` of `order` to "placed".
   */
  async placeOrder({ order }: { order: Order }): Promise<Empty | { error: string }> {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order with ID ${order} not found.` };
    }
    if (existingOrder.status !== "pending") {
      return { error: `Cannot place an order with status "${existingOrder.status}". Only "pending" orders can be placed.` };
    }

    const orderItemsCount = await this.orderItems.countDocuments({ order: order });
    if (orderItemsCount === 0) {
      return { error: `Order ${order} must have at least one item to be placed.` };
    }

    await this.orders.updateOne(
      { _id: order },
      { $set: { status: "placed" } },
    );
    return {};
  }

  /**
   * cancelOrder (order: Order): Empty | (error: String)
   *
   * **requires** `order` exists and its `status` is "pending" or "placed".
   *
   * **effects** Sets the `status` of `order` to "cancelled".
   */
  async cancelOrder({ order }: { order: Order }): Promise<Empty | { error: string }> {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order with ID ${order} not found.` };
    }
    if (existingOrder.status !== "pending" && existingOrder.status !== "placed") {
      return { error: `Cannot cancel an order with status "${existingOrder.status}". Only "pending" or "placed" orders can be cancelled.` };
    }

    await this.orders.updateOne(
      { _id: order },
      { $set: { status: "cancelled" } },
    );
    return {};
  }

  /**
   * _getOrdersByCustomer (customer: Customer): (order: Order)[]
   *
   * **requires** `customer` exists.
   *
   * **effects** Returns a set of all `Order`s associated with the given `customer`.
   */
  async _getOrdersByCustomer({ customer }: { customer: Customer }): Promise<{ order: Order }[]> {
    const orders = await this.orders.find({ customer: customer }).project({ _id: 1 }).toArray();
    return orders.map((o) => ({ order: o._id }));
  }

  /**
   * _getOrderDetails (order: Order): (details: {customer: Customer, status: String, items: {item: Item, quantity: Number}[]})[] | (error: String)
   *
   * **requires** `order` exists.
   *
   * **effects** Returns the `customer` and `status` of the `order`, and a list of its `items` with their `quantity`.
   */
  async _getOrderDetails({ order }: { order: Order }): Promise<{ details: { customer: Customer; status: string; items: { item: Item; quantity: number }[] } }[] | { error: string }> {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order with ID ${order} not found.` };
    }

    const orderItems = await this.orderItems.find({ order: order }).toArray();
    const items = orderItems.map((oi) => ({ item: oi.item, quantity: oi.quantity }));

    return [{
      details: {
        customer: existingOrder.customer,
        status: existingOrder.status,
        items: items,
      },
    }];
  }
}
```
