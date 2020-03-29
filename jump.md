<a id=Notes_on_Calculating_Jump_Parameters_for_Some_PRNGs></a>
## Notes on Calculating Jump Parameters for Some PRNGs

For some pseudorandom number generators (PRNGs), each bit of the PRNG's state can be described as a linear recurrence on its entire state.  These PRNGs are called _F<sub>2</sub>-linear PRNGs_, and they include the following:

- Linear congruential generators with a power-of-two modulus.
- Xorshift PRNGs.
- PRNGs in the xoroshiro and xoshiro families.
- Linear or generalized feedback shift register generators, including Mersenne Twister.

For an F<sub>2</sub>-linear PRNG, there is an efficient way to discard a given (and arbitrary) number of its outputs (to "jump the PRNG ahead").  This jump-ahead strategy is further described in (Haramoto et al., 2008)<sup>[**(1)**](#Note1)</sup>.  To calculate the jump-ahead parameters needed to advance the PRNG N steps:

1. Build `M`, an S&times;S matrix of zeros and ones that describes the linear transformation of the PRNG's state, where S is the size of that state in bits.  For an example, see sections 3.1 and 3.2 of (Blackman and Vigna 2019)<sup>[**(2)**](#Note2)</sup>, where it should be noted that the additions inside the matrix are actually XORs.
2. Find the _characteristic polynomial_ of `M`.  This has to be done in the two-element field F<sub>2</sub>, so that each coefficient of the polynomial is either 0 or 1.

    For example, SymPy's `charpoly()` method alone is inadequate for this purpose, since it doesn't operate on the correct field.  However, it's easy to adapt this method's output for the field F<sub>2</sub>: even coefficients become zeros and odd coefficients become ones.
3. Convert the characteristic polynomial to an integer (`CP`), so that its least significant bit is the 0-order coefficient, its next bit is the 1st-order coefficient, and so on.
4. Calculate `powmodf2(2, N, CP)`, where `powmodf2` is a modular power function that calculates `2^N mod CP` in the field F<sub>2</sub>.  Regular modular power functions, such as BigInteger's `modPow` method, won't work here.
5. The result is a _jump polynomial_ for jumping the PRNG ahead N steps.

    An example of its use is found in the `jump` and `long_jump` functions in the [**`xoroshiro128plus` source code**](http://xoshiro.di.unimi.it/xoroshiro128plus.c), which are identical except for the jump polynomial.  In both functions, the 128-bit jump polynomial is divided into two 64-bit integers: the first is the polynomial's lower 64 bits, and the second is its upper 64 bits.

<a id=Notes></a>
## Notes

<small><sup id=Note1>(1)</sup> Haramoto, Matsumoto, Nishimura, Panneton, L'Ecuyer, "Efficient Jump Ahead for F<sub>2</sub>-Linear Random Number Generators", _INFORMS Journal on Computing_ 20(3), Summer 2008.</small>

<small><sup id=Note2>(2)</sup> Blackman, Vigna, "Scrambled Linear Pseudorandom Number Generators", 2019.</small>
