<a id=Notes_on_Jumping_PRNGs_Ahead></a>
## Notes on Jumping PRNGs Ahead

Some pseudorandom number generators (PRNGs) have an efficient way to advance their state as though a huge number of PRNG outputs were discarded.  Notes on how they work are described in the following sections.

<a id=Linear_Congruential_Generators></a>
### Linear Congruential Generators

For linear congruential generators (LCGs), an efficient way to jump the PRNG ahead is described in (Brown 1994)<sup>[**(1)**](#Note1)</sup>.  This also applies to LCGs with a relatively complex output transform, such as M.O'Neill's PCG32 and PCG64.

<a id=F2_linear_PRNGs></a>
### F<sub>2</sub>-linear PRNGs

For some PRNGs, each bit of the PRNG's state can be described as a linear recurrence on its entire state.  These PRNGs are called _F<sub>2</sub>-linear PRNGs_, and they include the following:

- LCGs with a power-of-two modulus.
- Xorshift PRNGs.
- PRNGs in the xoroshiro and xoshiro families.
- Linear or generalized feedback shift register generators, including Mersenne Twister.

For an F<sub>2</sub>-linear PRNG, there is an efficient way to discard a given (and arbitrary) number of its outputs (to "jump the PRNG ahead").  This jump-ahead strategy is further described in (Haramoto et al., 2008)<sup>[**(2)**](#Note2)</sup>.  See also (Vigna 2017)<sup>[**(3)**](#Note3)</sup> To calculate the jump-ahead parameters needed to advance the PRNG N steps:

1. Build `M`, an S&times;S matrix of zeros and ones that describes the linear transformation of the PRNG's state, where S is the size of that state in bits.  For an example, see sections 3.1 and 3.2 of (Blackman and Vigna 2019)<sup>[**(4)**](#Note4)</sup>, where it should be noted that the additions inside the matrix are actually XORs.
2. Find the _characteristic polynomial_ of `M`.  This has to be done in the two-element field F<sub>2</sub>, so that each coefficient of the polynomial is either 0 or 1.

    For example, SymPy's `charpoly()` method alone is inadequate for this purpose, since it doesn't operate on the correct field.  However, it's easy to adapt that method's output for the field F<sub>2</sub>: even coefficients become zeros and odd coefficients become ones.
3. Convert the characteristic polynomial to an integer (`CP`), so that its least significant bit is the 0-order coefficient, its next bit is the 1st-order coefficient, and so on.
4. Calculate `powmodf2(2, N, CP)`, where `powmodf2` is a modular power function that calculates `2^N mod CP` in the field F<sub>2</sub>.  Regular modular power functions, such as BigInteger's `modPow` method, won't work here.
5. The result is a _jump polynomial_ for jumping the PRNG ahead N steps.

    An example of its use is found in the `jump` and `long_jump` functions in the [**`xoroshiro128plus` source code**](http://xoshiro.di.unimi.it/xoroshiro128plus.c), which are identical except for the jump polynomial.  In both functions, the 128-bit jump polynomial is divided into two 64-bit integers: the first is the polynomial's lower 64 bits, and the second is its upper 64 bits.

<a id=Counter_Based_PRNGs></a>
### Counter-Based PRNGs

Counter-based PRNGs, in which their state is updated simply by incrementing a counter, can be trivially jumped ahead just by changing the seed and/or the counter (Salmon et al. 2011)<sup>[**(5)**](#Note5)</sup>.

<a id=Jump_Parameters_for_Some_PRNGs></a>
### Jump Parameters for Some PRNGs

The following table shows the characteristic polynomial and jump polynomials for some PRNG families.  In the table, "'Period'/&phi;" means the PRNG's maximum cycle length divided by the golden ratio, and rounded to the closest odd integer; this jump parameter is chosen to avoid overlapping number sequences as much as possible (see also [**NumPy documentation**](https://docs.scipy.org/doc/numpy/reference/random/parallel.html)).

| PRNG |  Characteristic Polynomial  | Jump Polynomials |
| --- | --- | --- |
| xoroshiro64 | 0x1053be9da6e2286c1 | 2<sup>32</sup>: 0x4cbf99bd77fcd1a0<br/>2<sup>48</sup>: 0xb4e7e4633f1f8b95<br/>"Period"/&phi;: 0x751f355609af0e3b
| xoshiro128 | 0x100fc65a2006254b11b489db6de18fc01 | 2<sup>32</sup>: 0xf8aed94730b948df3be07b8f7afe108<br/>2<sup>48</sup>: 0xdeaa4ca2dec5bb9a87a4583dcb56667c<br/>2<sup>64</sup>: 0x77f2db5b6fa035c3f542d2d38764000b<br/>2<sup>96</sup>: 0x1c580662ccf5a0ef0b6f099fb523952e<br/>"Period"/&phi;: 0x338b58d0590169928fda8fd5d1cf96b6
| xoroshiro128 (except ++) | 0x10008828e513b43d5095b8f76579aa001 | 2<sup>32</sup>: 0xd4e95eef9edbdbc6fad843622b252c78<br/>2<sup>48</sup>: 0x9b19ba6b3752065ad769cfc9028deb78<br/>2<sup>64</sup>: 0x170865df4b3201fcdf900294d8f554a5<br/>2<sup>96</sup>: 0xdddf9b1090aa7ac1d2a98b26625eee7b<br/>"Period"/&phi;: 0xc1c620fd7bf598c34a2828365a7df3e0
| xoroshiro128++ | 0x10031bcf2f855d6e58dae70779760b081 | 2<sup>32</sup>: 0x2e1bcf52f1051044fcceec21d5c306d9<br/>2<sup>48</sup>: 0xc8462a08ab3d7f9b99030a888c867939<br/>2<sup>64</sup>: 0x992ccaf6a6fca052bd7a6a6e99c2ddc<br/>2<sup>96</sup>: 0x9c6e6877736c46e3360fd5f2cf8d5d99<br/>"Period"/&phi;: 0x1b4c7a8989405b16d3e4e127a6a11513
| xoshiro256 | 0x10003c03c3f3ecb1904b4edcf26259f850280002bcefd1a5e9d116f2bb0f0f001 | 2<sup>32</sup>: 0xe055d3520fdb9d7214fafc0fbdbc2087d8d0632bd08e6ac58120d583c112f69<br/>2<sup>48</sup>: 0x5f728be2c97e9066474579292f705634f825539dee5e4763f11fb4faea62c7f1<br/>2<sup>64</sup>: 0x12e4a2fbfc19bff934faff184785c20ab60d6c5b8c78f106b13c16e8096f0754<br/>2<sup>96</sup>: 0x31eebb6c82a9615fb27c05962ea56a13cdb45d7def42c317148c356c3114b7a9<br/>2<sup>128</sup>: 0x39abdc4529b1661ca9582618e03fc9aad5a61266f0c9392c180ec6d33cfd0aba<br/>2<sup>160</sup>: 0xf567382197055bf04823b45b89dc689c69e6e6e431a2d40bc04b4f9c5d26c200<br/>2<sup>192</sup>: 0x39109bb02acbe63577710069854ee241c5004e441c522fb376e15d3efefdcbbf<br/>2<sup>224</sup>: 0xa2b5d83a373c7ac2f31d2e03157bc387d317530723ab526a0c7840cbc3b121ad<br/>"Period"/&phi;: 0x294e2bac089b06c7d4ce5d1a031b6cf8787f49127b37f506ac1c9e5f5f53046c

<a id=Notes></a>
## Notes

<small><sup id=Note1>(1)</sup> Brown, F., "Random Number Generation with Arbitrary Strides", _Transactions of the American Nuclear Society_ Nov. 1994.</small>

<small><sup id=Note2>(2)</sup> Haramoto, Matsumoto, Nishimura, Panneton, L'Ecuyer, "Efficient Jump Ahead for F<sub>2</sub>-Linear Random Number Generators", _INFORMS Journal on Computing_ 20(3), Summer 2008.</small>

<small><sup id=Note3>(3)</sup> Vigna, S., "Further scramblings of Marsaglia's xorshift generators", _Journal of Computational and Applied Mathematics_ 315 (2017).</small>

<small><sup id=Note4>(4)</sup> Blackman, Vigna, "Scrambled Linear Pseudorandom Number Generators", 2019.</small>

<small><sup id=Note5>(5)</sup> Salmon, J.K.; Moraes, M.A.; et al., "Parallel Random Numbers: As Easy as 1, 2, 3", 2011.</small>
