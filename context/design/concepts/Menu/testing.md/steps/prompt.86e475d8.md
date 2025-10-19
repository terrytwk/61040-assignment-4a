---
timestamp: 'Sat Oct 18 2025 19:56:50 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_195650.18b83db0.md]]'
content_id: 86e475d8d933d702dd96ce0d3552cf9c3a1138e1c35c3d99b1f661df1a4220e6
---

# prompt: I get this error. fix it.

TS2305 \[ERROR]: Module '"https://jsr.io/@std/assert/1.0.7/mod.ts"' has no exported member 'assertTrue'.
import { assertEquals, assertExists, assertFalse, assertTrue } from "jsr:@std/assert";
\~~~~~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Menu/MenuConcept.test.ts:1:51

TS2339 \[ERROR]: Property 'option' does not exist on type '{ option: ID; } | { error: string; }'.
Property 'option' does not exist on type '{ error: string; }'.
assertExists(tempResult.option, "Option ID should be returned");
\~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Menu/MenuConcept.test.ts:73:29

TS2339 \[ERROR]: Property 'option' does not exist on type '{ option: ID; } | { error: string; }'.
Property 'option' does not exist on type '{ error: string; }'.
temperatureOption = tempResult.option;
\~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Menu/MenuConcept.test.ts:74:36

TS2339 \[ERROR]: Property 'option' does not exist on type '{ option: ID; } | { error: string; }'.
Property 'option' does not exist on type '{ error: string; }'.
assertExists(milkResult.option, "Option ID should be returned");
\~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Menu/MenuConcept.test.ts:78:29

TS2339 \[ERROR]: Property 'option' does not exist on type '{ option: ID; } | { error: string; }'.
Property 'option' does not exist on type '{ error: string; }'.
milkOption = milkResult.option;
\~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Menu/MenuConcept.test.ts:79:29

TS2339 \[ERROR]: Property 'option' does not exist on type '{ option: ID; } | { error: string; }'.
Property 'option' does not exist on type '{ error: string; }'.
assertExists(sweetenerResult.option, "Option ID should be returned");
\~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Menu/MenuConcept.test.ts:83:34

TS2339 \[ERROR]: Property 'option' does not exist on type '{ option: ID; } | { error: string; }'.
Property 'option' does not exist on type '{ error: string; }'.
sweetenerOption = sweetenerResult.option;
\~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Menu/MenuConcept.test.ts:84:39

TS2339 \[ERROR]: Property 'choice' does not exist on type '{ choice: ID; } | { error: string; }'.
Property 'choice' does not exist on type '{ error: string; }'.
assertExists(hotResult.choice, "Choice ID for Hot should be returned");
\~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Menu/MenuConcept.test.ts:103:28

TS2339 \[ERROR]: Property 'choice' does not exist on type '{ choice: ID; } | { error: string; }'.
Property 'choice' does not exist on type '{ error: string; }'.
hotChoice = hotResult.choice;
\~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Menu/MenuConcept.test.ts:104:27

TS2339 \[ERROR]: Property 'choice' does not exist on type '{ choice: ID; } | { error: string; }'.
Property 'choice' does not exist on type '{ error: string; }'.
assertExists(coldResult.choice, "Choice ID for Cold should be returned");
\~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Menu/MenuConcept.test.ts:108:29

TS2339 \[ERROR]: Property 'choice' does not exist on type '{ choice: ID; } | { error: string; }'.
Property 'choice' does not exist on type '{ error: string; }'.
coldChoice = coldResult.choice;
\~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Menu/MenuConcept.test.ts:109:29

TS2339 \[ERROR]: Property 'choice' does not exist on type '{ choice: ID; } | { error: string; }'.
Property 'choice' does not exist on type '{ error: string; }'.
assertExists(wholeMilkResult.choice, "Choice ID for Whole Milk should be returned");
\~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Menu/MenuConcept.test.ts:113:34

TS2339 \[ERROR]: Property 'choice' does not exist on type '{ choice: ID; } | { error: string; }'.
Property 'choice' does not exist on type '{ error: string; }'.
wholeMilkChoice = wholeMilkResult.choice;
\~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Menu/MenuConcept.test.ts:114:39

TS2339 \[ERROR]: Property 'choice' does not exist on type '{ choice: ID; } | { error: string; }'.
Property 'choice' does not exist on type '{ error: string; }'.
assertExists(oatMilkResult.choice, "Choice ID for Oat Milk should be returned");
\~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Menu/MenuConcept.test.ts:118:32

TS2339 \[ERROR]: Property 'choice' does not exist on type '{ choice: ID; } | { error: string; }'.
Property 'choice' does not exist on type '{ error: string; }'.
oatMilkChoice = oatMilkResult.choice;
\~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Menu/MenuConcept.test.ts:119:35

TS2339 \[ERROR]: Property 'choice' does not exist on type '{ choice: ID; } | { error: string; }'.
Property 'choice' does not exist on type '{ error: string; }'.
assertExists(sugarResult.choice, "Choice ID for Sugar should be returned");
\~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Menu/MenuConcept.test.ts:123:30

TS2339 \[ERROR]: Property 'choice' does not exist on type '{ choice: ID; } | { error: string; }'.
Property 'choice' does not exist on type '{ error: string; }'.
sugarChoice = sugarResult.choice;
\~~~~~~
at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Menu/MenuConcept.test.ts:124:31

Found 17 errors.
