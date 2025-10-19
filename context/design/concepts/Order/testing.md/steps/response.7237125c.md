---
timestamp: 'Sat Oct 18 2025 20:08:47 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_200847.901e2491.md]]'
content_id: 7237125c134ea9a3d6bd417a83dcc09ff37e3ef97e6b76a0ae1b6b0204b05b16
---

# response:

```typescript
// file: src/concepts/Order/OrderConcept.ts

import { Collection, Db, ObjectId } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

/**
 * **concept** Order [User, Item, Option, Choice]
 *
 * **purpose**
 * Capture a member’s order lifecycle and chosen customizations (no pricing).
 *
 * **principle**
 * Scanning a valid member starts a **pending** order; barista adds a **Latte** with
 * **hot** and **oat** (valid); submitting, then completing, marks the order **completed**;
 * canceled orders stop accepting changes.
 */

// Declare collection prefix, use concept name
const PREFIX = "Order" + ".";

// Generic types of this concept
type User = ID;
type Item = ID;
type Option = ID;
type Choice = ID;

// Internal IDs for Order concept
type Order = ID;
type OrderLine = ID;
type SelectedChoice = ID;

type OrderStatus = "pending" | "completed" | "canceled";

/**
 * a set of Orders with
 *  – user User
 *  – status {pending, completed, canceled}
 *  – createdAt Time
 */
interface OrderDocument {
  _id: Order;
  user: User;
  status: OrderStatus;
  createdAt: Date;
}

/**
 * a set of OrderLines with
 *  – order Order
 *  – item Item
 *  – qty Number
 *  – displayItemName String
 */
interface OrderLineDocument {
  _id: OrderLine;
  order: Order;
  item: Item;
  qty: number;
  displayItemName: string;
}

/**
 * a set of SelectedChoices with
 *  – line OrderLine
 *  – option Option
 *  – choice Choice
 *  – displayOptionName String
 *  – displayChoiceName String
 */
interface SelectedChoiceDocument {
  _id: SelectedChoice;
  line: OrderLine;
  option: Option;
  choice: Choice;
  displayOptionName: string;
  displayChoiceName: string;
}

/**
 * Input for selections in addItem, including display names for completeness
 * and independence of the Order concept.
 */
interface SelectionInput {
  option: Option;
  choice: Choice;
  displayOptionName: string;
  displayChoiceName: string;
}

// Output structure for _lines query
interface OrderLineOutput {
  id: OrderLine;
  item: Item;
  qty: number;
  displayItemName: string; // Add displayItemName to output for completeness
  selections: { option: Option; choice: Choice; displayOptionName: string; displayChoiceName: string }[];
}

export default class OrderConcept {
  orders: Collection<OrderDocument>;
  orderLines: Collection<OrderLineDocument>;
  selectedChoices: Collection<SelectedChoiceDocument>;

  constructor(private readonly db: Db) {
    this.orders = this.db.collection(PREFIX + "orders");
    this.orderLines = this.db.collection(PREFIX + "orderLines");
    this.selectedChoices = this.db.collection(PREFIX + "selectedChoices");
  }

  /**
   * open (user: User) : (order: Order | error: String)
   *
   * **requires** true (membership gating via sync)
   *
   * **effects** creates order with status := pending, createdAt := now; returns the new order's ID
   */
  async open({ user }: { user: User }): Promise<{ order: Order } | { error: string }> {
    const newOrderId = freshID();
    const newOrder: OrderDocument = {
      _id: newOrderId,
      user: user,
      status: "pending",
      createdAt: new Date(),
    };

    try {
      await this.orders.insertOne(newOrder);
      return { order: newOrderId };
    } catch (e) {
      console.error("Error creating new order:", e);
      return { error: "Failed to open new order." };
    }
  }

  /**
   * addItem (order: Order, item: Item, qty: Number, displayItemName: String, selections: {option: Option, choice: Choice, displayOptionName: String, displayChoiceName: String}[]) : (line: OrderLine | error: String)
   *
   * **requires** order exists and status = pending (validity checked via sync)
   *
   * **effects** creates line; copies displayItemName; stores SelectedChoices with copied display names; returns the new order line's ID
   *
   * NOTE: For concept independence and completeness, display names for item, options, and choices are expected as input arguments.
   * A sync would be responsible for fetching these from the Menu concept and passing them to this action.
   */
  async addItem(
    {
      order,
      item,
      qty,
      displayItemName,
      selections,
    }: { order: Order; item: Item; qty: number; displayItemName: string; selections: SelectionInput[] },
  ): Promise<{ line: OrderLine } | { error: string }> {
    if (qty <= 0) {
      return { error: "Quantity must be a positive number." };
    }

    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order with ID ${order} not found.` };
    }
    if (existingOrder.status !== "pending") {
      return { error: `Cannot add items to an order with status '${existingOrder.status}'. Only 'pending' orders can be modified.` };
    }

    const newLineId = freshID();
    const newOrderLine: OrderLineDocument = {
      _id: newLineId,
      order: order,
      item: item,
      qty: qty,
      displayItemName: displayItemName,
    };

    const newSelectedChoices: SelectedChoiceDocument[] = selections.map((s) => ({
      _id: freshID(),
      line: newLineId,
      option: s.option,
      choice: s.choice,
      displayOptionName: s.displayOptionName,
      displayChoiceName: s.displayChoiceName,
    }));

    try {
      await this.orderLines.insertOne(newOrderLine);
      if (newSelectedChoices.length > 0) {
        await this.selectedChoices.insertMany(newSelectedChoices);
      }
      return { line: newLineId };
    } catch (e) {
      console.error("Error adding item to order:", e);
      // Attempt to clean up partially inserted data if any
      await this.orderLines.deleteOne({ _id: newLineId });
      await this.selectedChoices.deleteMany({ line: newLineId });
      return { error: "Failed to add item to order." };
    }
  }

  /**
   * submit (order: Order) : (Empty | error: String)
   *
   * **requires** order exists and status = pending and order has ≥ 1 line (the line count is enforced via sync)
   *
   * **effects** lifecycle only (does not change status within this concept, acts as a prerequisite for completion)
   *
   * NOTE: The status "submitted" is not part of the defined OrderStatus enum.
   * This action is intended as a signal that the order is ready for the next stage (completion),
   * but does not modify the status field itself as per the given state definition.
   */
  async submit({ order }: { order: Order }): Promise<Empty | { error: string }> {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order with ID ${order} not found.` };
    }
    if (existingOrder.status !== "pending") {
      return { error: `Order with ID ${order} is already '${existingOrder.status}' and cannot be submitted.` };
    }
    // As per the OrderStatus enum and principle, submit doesn't change the status.
    // It's a conceptual "gate" that syncs can use.
    return {};
  }

  /**
   * complete (order: Order) : (Empty | error: String)
   *
   * **requires** order exists and status = pending
   *
   * **effects** sets status := completed
   */
  async complete({ order }: { order: Order }): Promise<Empty | { error: string }> {
    const result = await this.orders.updateOne(
      { _id: order, status: "pending" },
      { $set: { status: "completed" } },
    );

    if (result.matchedCount === 0) {
      const existingOrder = await this.orders.findOne({ _id: order });
      if (!existingOrder) {
        return { error: `Order with ID ${order} not found.` };
      }
      return { error: `Order with ID ${order} is already '${existingOrder.status}' and cannot be completed.` };
    }

    return {};
  }

  /**
   * cancel (order: Order) : (Empty | error: String)
   *
   * **requires** order exists and status = pending
   *
   * **effects** sets status := canceled
   */
  async cancel({ order }: { order: Order }): Promise<Empty | { error: string }> {
    const result = await this.orders.updateOne(
      { _id: order, status: "pending" },
      { $set: { status: "canceled" } },
    );

    if (result.matchedCount === 0) {
      const existingOrder = await this.orders.findOne({ _id: order });
      if (!existingOrder) {
        return { error: `Order with ID ${order} not found.` };
      }
      return { error: `Order with ID ${order} is already '${existingOrder.status}' and cannot be canceled.` };
    }

    return {};
  }

  /**
   * _lines (order: Order) : (line: {id: OrderLine, item: Item, qty: Number, displayItemName: String, selections: {option: Option, choice: Choice, displayOptionName: String, displayChoiceName: String}[]})
   *
   * **requires** order exists
   *
   * **effects** returns structured lines + selections for the order
   */
  async _lines({ order }: { order: Order }): Promise<{ line: OrderLineOutput }[] | { error: string }> {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order with ID ${order} not found.` };
    }

    const lines = await this.orderLines.find({ order: order }).toArray();
    const results: { line: OrderLineOutput }[] = [];

    for (const line of lines) {
      const selections = await this.selectedChoices.find({ line: line._id }).toArray();
      results.push({
        line: {
          id: line._id,
          item: line.item,
          qty: line.qty,
          displayItemName: line.displayItemName,
          selections: selections.map((s) => ({
            option: s.option,
            choice: s.choice,
            displayOptionName: s.displayOptionName,
            displayChoiceName: s.displayChoiceName,
          })),
        },
      });
    }

    return results;
  }

  /**
   * _status (order: Order) : (status: String | error: String)
   *
   * **requires** order exists
   *
   * **effects** returns current status of the order
   */
  async _status({ order }: { order: Order }): Promise<{ status: OrderStatus }[] | { error: string }> {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order with ID ${order} not found.` };
    }
    // Queries return an array of dictionaries
    return [{ status: existingOrder.status }];
  }
}
```
