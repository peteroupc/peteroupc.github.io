# Pseudocode Conventions

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=Introduction></a>
## Introduction

This document explains the conventions and common functions used in some of my articles that use pseudocode.

<a id=Contents></a>
## Contents

- [**Introduction**](#Introduction)
- [**Contents**](#Contents)
- [**Symbols**](#Symbols)
- [**Loops**](#Loops)
- [**Lists and Files**](#Lists_and_Files)
- [**Functions**](#Functions)
- [**Pseudocode Notes**](#Pseudocode_Notes)
- [**License**](#License)

<a id=Symbols></a>
## Symbols

In addition to the familiar `+`, `-`, `*` (multiplication), and `/` (division) operators, other symbols are defined below.

* `pi` is the constant &pi;, the ratio of a circle's circumference to its diameter.
* `nothing` indicates the absence of a value.  It corresponds to `null` in Java, C#, and JavaScript, `nil` in Ruby, and `None` in Python.
* `true` and `false` are the two Boolean values.
* `==` means "is equal to".
* `!=` means "is not equal to".
* The `<<` operator in the pseudocode is a bitwise left shift, with both sides of the operator being integers.  If both sides are positive, it is the same as multiplying the left-hand side by 2<sup>_n_</sup>, where _n_ is the right-hand side.
* The `|` operator in the pseudocode is a bitwise OR operator between two integers.  It combines the bits of both integers so that each bit is set in the result if the corresponding bit is set on either or both sides of the operator.

<a id=Loops></a>
## Loops

Pseudocode may use `while` loops, which are self-explanatory.

Pseudocode may also use `for` loops, defined as follows:

- `for X in Y...Z; [[Statements]] ; end` is shorthand for `X = Y; while X < Z; [[Statements]]; X = X + 1; end`.
- `for X in Y...Z: [[Single-Statement]]` is shorthand for `X = Y; while X < Z; [[Single-Statement]]; X = X + 1; end`.

<a id=Lists_and_Files></a>
## Lists and Files

In the pseudocode, lists are indexed starting with 0.  That means the first item in the list is 0, the second item in the list is 1, and so on, up to the last item, whose index is the list's size minus 1.

In this context, a _list_ is to be understood as an resizable array of items, not as a linked list.

* `NewList()` creates a new empty list.
* `AddItem(list, item)` adds the item `item` to the list `list`.
* `size(list)` returns the size of the list `list`.
* `list[k]` refers to the item at index `k` of the list `list`.
* `GetNextLine(file)` is a method that gets the next line from a file, or returns `nothing` if the end of the file was reached.

<a id=Functions></a>
## Functions

* `sin(a)`, `cos(a)`, and `tan(a)` are the sine, cosine, and tangent of the angle `a`, respectively, where `a` is in radians.
* `atan2(y, x)` is&mdash;
    - the inverse tangent of `y/x` if `x > 0`,
    - &pi; plus the inverse tangent of `y/x` if `y >= 0 and x < 0`,
    - -&pi; plus the inverse tangent of `y/x` if `y < 0 and x < 0`,
    - `-pi / 2` if `y < 0 and x == 0`,
    - `pi / 2` if `y > 0 and x == 0`, and
    - 0 if `y == 0 and x == 0`.
* `pow(a, b)` is the number `a` raised to the power `b`.
* `abs(a)` is the absolute value of `a`.
* `sqrt(a)` is the square root of `a`, and is equivalent to `pow(a, 0.5)`.
* `floor(a)` is the highest integer that is less than or equal to `a`.
* `round(a)` is the closest integer to `a` or, if two integers are tied for closest, the integer among them that is farther from 0.
* `ln(a)` is the natural logarithm of `a`.  It corresponds to the `Math.log` method in Java and JavaScript.
* `exp(a)` is the number _e_ (base of natural logarithms) raised to the power `a`.
* `rem(a, b)` is the part of `b` that does not divide evenly into `a`, where the result has the sign of `b`.  This operation is equivalent to `a - floor(a / b) * b`.
* `min(a, b)` is the smaller of `a` and `b`.
* `max(a, b)` is the larger of `a` and `b`.

**Notes:**

- The inverse sine of `a` is equivalent to `atan2(a, sqrt(1.0 - a * a))`.
- The inverse cosine of `a` is equivalent to `atan2(sqrt(1.0 - a * a), a)`.

<a id=Pseudocode_Notes></a>
## Pseudocode Notes

In the pseudocode:

* Divisions do not round to an integer.  In programming languages in which division of two integers results in an integer, the right-hand side of the division must be converted to a non-integer number format first.
* The pseudocode shown is not guaranteed to cover all error handling that may be necessary in a particular implementation.   Such errors may include overflow, out-of-bounds memory access, division by zero, and unexpected infinity values.
* The pseudocode shown is not guaranteed to yield high performance in a particular implementation, either in time or memory.  Implementations are free to deviate from the pseudocode as long as they produce the same results as the pseudocode, except that&mdash;
    - `ln`, `exp`, `sin`, `cos`, `tan`, and `atan2` must be at least substantially close to accurate, and
    - arithmetic operations, `pow`, `abs`, `sqrt`, `floor`, `round`, and `rem`, if implemented in limited-precision number formats, must be accurate within rounding error.
* If the pseudocode works with non-integer numbers, an implementation can represent such numbers in any non-integer number format it wishes (including a floating-point, fixed-point, decimal, and/or binary number format), unless noted otherwise.

<a id=License></a>
## License
This page is licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
