---
timestamp: 'Sat Oct 18 2025 20:18:37 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_201837.a7928451.md]]'
content_id: c0867862d48f9093f5ec7645b6fb5df6a638284bd4de03e065e98cc2ddac07ee
---

# prompt: fix this error

TS2304 \[ERROR]: Cannot find name 'User'.
const testUser = freshID() as User;
\~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/CustomerFeedback/CustomerFeedbackConcept.test.ts:62:35

TS2304 \[ERROR]: Cannot find name 'Order'.
const testOrder = freshID() as Order;
\~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/CustomerFeedback/CustomerFeedbackConcept.test.ts:63:36

TS18046 \[ERROR]: 'e' is of type 'unknown'.
`CustomerFeedback.create: Error creating feedback: ${e.message}`
^
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/CustomerFeedback/CustomerFeedbackConcept.ts:73:62

TS18046 \[ERROR]: 'e' is of type 'unknown'.
return { error: `Failed to create feedback: ${e.message}` };
^
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/CustomerFeedback/CustomerFeedbackConcept.ts:75:53

TS18046 \[ERROR]: 'e' is of type 'unknown'.
`CustomerFeedback._forOrder: Error querying feedback for order ${order}: ${e.message}`
^
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/CustomerFeedback/CustomerFeedbackConcept.ts:110:84

TS18046 \[ERROR]: 'e' is of type 'unknown'.
error: `Failed to retrieve feedback for order ${order}: ${e.message}`,
^
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/CustomerFeedback/CustomerFeedbackConcept.ts:113:67

TS18046 \[ERROR]: 'e' is of type 'unknown'.
`CustomerFeedback._forUser: Error querying feedback for user ${user}: ${e.message}`
^
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/CustomerFeedback/CustomerFeedbackConcept.ts:149:81

TS18046 \[ERROR]: 'e' is of type 'unknown'.
error: `Failed to retrieve feedback for user ${user}: ${e.message}`,
^
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/CustomerFeedback/CustomerFeedbackConcept.ts:152:65

Found 8 errors.

error: Type checking failed
