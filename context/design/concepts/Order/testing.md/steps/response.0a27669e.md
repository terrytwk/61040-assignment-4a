---
timestamp: 'Sat Oct 18 2025 20:03:41 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_200341.30c0d14a.md]]'
content_id: 0a27669e0df9525d410653ec15c1924fbc588e292e8d8bc31a9e5e4e40d81573
---

# response:

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

/**
 * Concept: Order
 *
 * purpose: Capture a member’s order lifecycle and chosen customizations (no pricing).
 */
export default class OrderConcept {
  // Declare collection prefix, use concept name
  static readonly PREFIX = "Order" + ".";

  // Generic types of this concept (external IDs)
  type User = ID;
  type Item = ID;
  type Option = ID;
  type Choice = ID;

  // Internal concept entities (IDs managed by this concept)
  type Order = ID;
  type OrderLine = ID;
  type SelectedChoice = ID;

  /**
   * a set of Orders with
   *   – user User
   *   – status {pending, completed, canceled}
   *   – createdAt Time
   */
  interface OrderDoc {
    _id: this.Order;
    user: this.User;
    status: "pending" | "completed" | "canceled";
    createdAt: Date;
  }

  /**
   * a set of OrderLines with
   *   – order Order
   *   – item Item
   *   – qty Number
   *   – displayItemName String
   *
   * NOTE ON `displayItemName`:
   * The concept specification states `effects: copies displayItemName`.
   * However, the `addItem` action signature does not include `displayItemName`
   * as an input, and the `Order` concept cannot query other concepts (like `Menu`)
   * to obtain it due to strict independence rules.
   * Therefore, this implementation _cannot_ populate `displayItemName` and
   * it is omitted from the stored state to maintain strict adherence to the API
   * signature and concept independence.
   * If `displayItemName` is essential, the `addItem` action's signature or the
   * `Order` concept's state would need to be updated to explicitly include it.
   */
  interface OrderLineDoc {
    _id: this.OrderLine;
    order: this.Order;
    item: this.Item;
    qty: number;
  }

  /**
   * a set of SelectedChoices with
   *   – line OrderLine
   *   – option Option
   *   – choice Choice
   *   – displayOptionName String
   *   – displayChoiceName String
   *
   * NOTE ON `displayOptionName` and `displayChoiceName`:
   * Similar to `displayItemName`, the concept specification states `effects: stores SelectedChoices with copied display names`.
   * However, the `addItem` action signature's `selections: {option: Option, choice: Choice}[]` does not include these display names.
   * Due to strict concept independence, this implementation _cannot_ populate these display names
   * and they are omitted from the stored state.
   * If these display names are essential, the `addItem` action's `selections` structure or the
   * `Order` concept's state would need to be updated to explicitly include them.
   */
  interface SelectedChoiceDoc {
    _id: this.SelectedChoice;
    line: this.OrderLine;
    option: this.Option;
    choice: this.Choice;
  }

  orders: Collection<OrderDoc>;
  orderLines: Collection<OrderLineDoc>;
  selectedChoices: Collection<SelectedChoiceDoc>;

  constructor(private readonly db: Db) {
    this.orders = this.db.collection(OrderConcept.PREFIX + "orders");
    this.orderLines = this.db.collection(OrderConcept.PREFIX + "orderLines");
    this.selectedChoices = this.db.collection(OrderConcept.PREFIX + "selectedChoices");
  }

  /**
   * open (user: User) : (order: Order)
   *
   * **requires** true *(membership gating via sync)*
   *
   * **effects** creates order with status := pending
   */
  async open({ user }: { user: this.User }): Promise<{ order: this.Order }> {
    const newOrder: this.OrderDoc = {
      _id: freshID() as this.Order,
      user,
      status: "pending",
      createdAt: new Date(),
    };
    await this.orders.insertOne(newOrder);
    return { order: newOrder._id };
  }

  /**
   * addItem (order: Order, item: Item, qty: Number, selections: {option: Option, choice: Choice}[]) : (line: OrderLine)
   *
   * **requires** order exists and status = pending *(validity checked via sync)*
   *
   * **effects** creates line; copies displayItemName; stores SelectedChoices with copied display names
   *
   * NOTE ON `effects` AND `concept independence`:
   * As detailed in the `OrderLineDoc` and `SelectedChoiceDoc` interfaces above,
   * the specified `effects` of copying/storing display names (`displayItemName`, `displayOptionName`, `displayChoiceName`)
   * cannot be fulfilled by this `addItem` action given its strict input signature and the principle of
   * concept independence (no external concept queries, no un-declared input arguments).
   * This implementation strictly adheres to the input signature and will NOT store these display names.
   * This highlights a potential inconsistency between the concept's stated effects and its API contract/modularity principles.
   */
  async addItem(
    { order, item, qty, selections }: {
      order: this.Order;
      item: this.Item;
      qty: number;
      selections: { option: this.Option; choice: this.Choice }[];
    },
  ): Promise<{ line: this.OrderLine } | { error: string }> {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order ${order} not found.` };
    }
    if (existingOrder.status !== "pending") {
      return { error: `Order ${order} is not pending.` };
    }

    // Create OrderLine
    const newLineId = freshID() as this.OrderLine;
    const newOrderLine: this.OrderLineDoc = {
      _id: newLineId,
      order,
      item,
      qty,
    };
    await this.orderLines.insertOne(newOrderLine);

    // Create SelectedChoices
    const selectedChoiceDocs: this.SelectedChoiceDoc[] = selections.map((s) => ({
      _id: freshID() as this.SelectedChoice,
      line: newLineId,
      option: s.option,
      choice: s.choice,
    }));
    if (selectedChoiceDocs.length > 0) {
      await this.selectedChoices.insertMany(selectedChoiceDocs);
    }

    return { line: newLineId };
  }

  /**
   * submit (order: Order) : ( )
   *
   * **requires** order exists and status = pending and order has ≥ 1 line
   *
   * **effects** lifecycle only
   *
   * NOTE: The `effects` "lifecycle only" implies that this action primarily
   * acts as a signal for external synchronizations or processes, and does
   * not directly alter the `Order` concept's internal status from 'pending'.
   * The `requires` for "order has ≥ 1 line" is expected to be enforced by an
   * external synchronization (`GuardSubmit`).
   */
  async submit({ order }: { order: this.Order }): Promise<Empty | { error: string }> {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order ${order} not found.` };
    }
    if (existingOrder.status !== "pending") {
      return { error: `Order ${order} is not pending.` };
    }
    // No state change on status based on "lifecycle only" effect for this action.
    return {};
  }

  /**
   * complete (order: Order) : ( )
   *
   * **requires** order exists and status = pending
   *
   * **effects** sets status := completed
   */
  async complete({ order }: { order: this.Order }): Promise<Empty | { error: string }> {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order ${order} not found.` };
    }
    if (existingOrder.status !== "pending") {
      return { error: `Order ${order} is not pending.` };
    }

    await this.orders.updateOne(
      { _id: order },
      { $set: { status: "completed" } },
    );
    return {};
  }

  /**
   * cancel (order: Order) : ( )
   *
   * **requires** order exists and status = pending
   *
   * **effects** sets status := canceled
   */
  async cancel({ order }: { order: this.Order }): Promise<Empty | { error: string }> {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order ${order} not found.` };
    }
    if (existingOrder.status !== "pending") {
      return { error: `Order ${order} is not pending.` };
    }

    await this.orders.updateOne(
      { _id: order },
      { $set: { status: "canceled" } },
    );
    return {};
  }

  /**
   * _lines (order: Order) : (line: {id: OrderLine, item: Item, qty: Number, selections: {option: Option, choice: Choice}[]})
   *
   * **requires** order exists
   *
   * **effects** returns structured lines + selections
   *
   * NOTE: Adheres strictly to the explicit return signature. Display names (if they were stored)
   * are not returned as they are not part of the specified query output structure.
   */
  async _lines(
    { order }: { order: this.Order },
  ): Promise<
    {
      line: {
        id: this.OrderLine;
        item: this.Item;
        qty: number;
        selections: { option: this.Option; choice: this.Choice }[];
      };
    }[] | { error: string }
  > {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order ${order} not found.` };
    }

    const lines = await this.orderLines.find({ order }).toArray();

    const resultLines: {
      line: {
        id: this.OrderLine;
        item: this.Item;
        qty: number;
        selections: { option: this.Option; choice: this.Choice }[];
      };
    }[] = [];

    for (const line of lines) {
      const selections = await this.selectedChoices.find({ line: line._id }).toArray();
      resultLines.push({
        line: {
          id: line._id,
          item: line.item,
          qty: line.qty,
          selections: selections.map(s => ({
            option: s.option,
            choice: s.choice,
          })),
        },
      });
    }

    return resultLines;
  }

  /**
   * _status (order: Order) : (status: String)
   *
   * **requires** order exists
   *
   * **effects** returns current status
   */
  async _status({ order }: { order: this.Order }): Promise<{ status: string }[] | { error: string }> {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order ${order} not found.` };
    }
    return [{ status: existingOrder.status }];
  }
}
```
