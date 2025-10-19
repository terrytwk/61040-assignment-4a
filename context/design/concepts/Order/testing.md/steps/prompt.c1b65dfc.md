---
timestamp: 'Sat Oct 18 2025 20:10:03 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_201003.71afde3c.md]]'
content_id: c1b65dfc1ffcf04a5506186c682bd5d26b081339f737782271c464adf40b19f5
---

# prompt: I get this error. fix it.

TS7053 \[ERROR]: Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ status: OrderStatus; }\[] | { error: string; }'.
Property '0' does not exist on type '{ status: OrderStatus; }\[] | { error: string; }'.
assertObjectMatch(statusResult\[0], { status: "pending" }, "New order should have 'pending' status");
\~~~~~~~~~~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:29:23

TS2339 \[ERROR]: Property 'length' does not exist on type '{ line: OrderLineOutput; }\[] | { error: string; }'.
Property 'length' does not exist on type '{ error: string; }'.
assertNotEquals(linesResult.length, 0, "Should have at least one line");
\~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:56:33

TS2345 \[ERROR]: Argument of type 'unknown' is not assignable to parameter of type 'Record\<PropertyKey, any>'.
assertObjectMatch(line.selections\[0], {
\~~~~~~~~~~~~~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:65:23

TS7053 \[ERROR]: Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ status: OrderStatus; }\[] | { error: string; }'.
Property '0' does not exist on type '{ status: OrderStatus; }\[] | { error: string; }'.
assertObjectMatch(statusResult\[0], { status: "pending" }, "Order status should still be 'pending' after submit");
\~~~~~~~~~~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:118:23

TS7053 \[ERROR]: Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ status: OrderStatus; }\[] | { error: string; }'.
Property '0' does not exist on type '{ status: OrderStatus; }\[] | { error: string; }'.
assertObjectMatch(statusResult\[0], { status: "completed" }, "Order status should be 'completed'");
\~~~~~~~~~~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:142:23

TS7053 \[ERROR]: Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ status: OrderStatus; }\[] | { error: string; }'.
Property '0' does not exist on type '{ status: OrderStatus; }\[] | { error: string; }'.
assertObjectMatch(statusResult\[0], { status: "canceled" }, "Order status should be 'canceled'");
\~~~~~~~~~~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:196:23

TS7053 \[ERROR]: Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ status: OrderStatus; }\[] | { error: string; }'.
Property '0' does not exist on type '{ status: OrderStatus; }\[] | { error: string; }'.
assertObjectMatch(status\[0], { status: "pending" });
\~~~~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:226:23

TS2339 \[ERROR]: Property 'length' does not exist on type '{ line: OrderLineOutput; }\[] | { error: string; }'.
Property 'length' does not exist on type '{ error: string; }'.
assertEquals(linesAfterAdd.length, 1);
\~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:247:32

TS2304 \[ERROR]: Cannot find name 'OrderLineOutput'.
assertEquals((linesAfterAdd as { line: OrderLineOutput }\[])\[0].line.selections.length, 2);
\~~~~~~~~~~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:248:44

TS7053 \[ERROR]: Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ status: OrderStatus; }\[] | { error: string; }'.
Property '0' does not exist on type '{ status: OrderStatus; }\[] | { error: string; }'.
assertObjectMatch(status\[0], { status: "pending" }); // Status remains pending internally
\~~~~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:257:23

TS7053 \[ERROR]: Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ status: OrderStatus; }\[] | { error: string; }'.
Property '0' does not exist on type '{ status: OrderStatus; }\[] | { error: string; }'.
assertObjectMatch(status\[0], { status: "completed" });
\~~~~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:266:23

Found 11 errors.

error: Type checking failed.
