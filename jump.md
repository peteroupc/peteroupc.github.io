<a id=Notes_on_Jumping_PRNGs_Ahead></a>
## Notes on Jumping PRNGs Ahead

[**Peter Occil**](mailto:poccil14@gmail.com)

Some pseudorandom number generators (PRNGs) have an efficient way to advance their state as though a huge number of PRNG outputs were discarded.  Notes on how they work are described in the following sections.

<a id=F2_linear_PRNGs></a>
### F<sub>2</sub>-linear PRNGs

For some PRNGs, each bit of the PRNG's state can be described as a linear recurrence on its entire state.  These PRNGs are called _F<sub>2</sub>-linear PRNGs_, and they include the following:

- Linear congruential generators (LCGs) with a power-of-two modulus.
- Xorshift PRNGs.
- PRNGs in the xoroshiro and xoshiro families.
- Linear or generalized feedback shift register generators, including Mersenne Twister.

For an F<sub>2</sub>-linear PRNG, there is an efficient way to discard a given (and arbitrary) number of its outputs (to "jump the PRNG ahead").  This jump-ahead strategy is further described in (Haramoto et al., 2008\)[^1].  See also (Vigna 2017\)[^2]. To calculate the jump-ahead parameters needed to advance the PRNG N steps:

1. Build `M`, an S&times;S matrix of zeros and ones that describes the linear transformation of the PRNG's state, where S is the size of that state in bits.  For an example, see sections 3.1 and 3.2 of (Blackman and Vigna 2019\)[^3], where it should be noted that the additions inside the matrix are actually XORs.
2. Find the _characteristic polynomial_ of `M`.  This has to be done in the two-element field F<sub>2</sub>, so that each coefficient of the polynomial is either 0 or 1.

    For example, SymPy's `charpoly()` method alone is inadequate for this purpose, since it doesn't operate on the correct field.  However, it's easy to adapt that method's output for the field F<sub>2</sub>: even coefficients become zeros and odd coefficients become ones.

    Note that for a linear feedback shift register (LFSR) generator, the characteristic polynomial's coefficients are 1 for each of its "taps" (and "tap" 0), and 0 elsewhere.  For example, an LFSR generator with taps 6 and 8 has the characteristic polynomial x<sup>8</sup> + x<sup>6</sup> + 1.

    The section "Jump Parameters for Some PRNGs" shows characteristic polynomials for some PRNGs and one way their coefficients can be represented.
3. Calculate `powmodf2(2, N, CP)`, where `powmodf2` is a modular power function that calculates `2^N mod CP` in the field F<sub>2</sub>, and `CP` is the characteristic polynomial.  Regular modular power functions, such as BigInteger's `modPow` method, won't work here, even if the polynomial is represented in the manner described in "Jump Parameters for Some PRNGs".
4. The result is a _jump polynomial_ for jumping the PRNG ahead N steps.

    An example of its use is found in the `jump` and `long_jump` functions in the [**`xoroshiro128plus` source code**](http://xoshiro.di.unimi.it/xoroshiro128plus.c), which are identical except for the jump polynomial.  In both functions, the jump polynomial's coefficients are packed into a 128-bit integer (as described in "Jump Parameters for Some PRNGs"), which is then split into the lower 64 bits and the upper 64 bits, in that order.

<a id=Counter_Based_PRNGs></a>
### Counter-Based PRNGs

Counter-based PRNGs, in which their state is updated simply by incrementing a counter, can be trivially jumped ahead just by changing the seed, the counter, or both (Salmon et al. 2011\)[^4].

<a id=Multiple_Recursive_Generators></a>
### Multiple Recursive Generators

A _multiple recursive generator_ (MRG) generates numbers by transforming its state using the following formula: `x(k) = (x(k-1)*A(1) + x(k-2)*A(2) + ... + x(k-n)*A(n)) mod modulus`, where `A(i)` are the _multipliers_ and `modulus` is the _modulus_.

For an MRG, the following matrix (`M`) describes the state transition `[x(k-n), ..., x(k-1)]` to `[x(k-n+1), ..., x(k)]` (mod `modulus`):

     | 0   1   0  ...  0  |
     | 0   0   1  ...  0  |
     | .   .   .  ... ... |
     | 0   0   0  ...  1  |
     |A(n)A(n A(n ... A(1)|
     |     -1) -2)        |

To calculate the parameter needed to jump the MRG ahead N steps, calculate `M`<sup>N</sup> mod `modulus`; the result is a _jump matrix_ `J`.

Then, to jump the MRG ahead N steps, calculate `J * S` mod `modulus`, where `J` is the jump matrix and `S` is the state in the form of a column vector; the result is a new state for the MRG.

This technique was mentioned (but for binary matrices) in Haramoto, in sections 1 and 3.1.  They point out, though, that it isn't efficient if the transition matrix is large.  See also (L'Ecuyer et al., 2002\)[^5].

<a id=Example></a>
#### Example

A multiple recursive generator with a modulus of 1449 has the following transition matrix:

    |  0   1   0  |
    |  0   0   1  |
    | 444 342 499 |

To calculate the 3&times;3 jump matrix to jump 100 steps from this MRG, raise this matrix to the power of 100 then reduce the result's elements mod 1449.  One way to do this is the "square-and-multiply" method, described by D. Knuth in _The Art of Computer Programming_: Set J to the identity matrix, N to 100, and M to a copy of the transition matrix, then while N is greater than 0:

1. If N is odd[^6], multiply J by M then reduce J's elements mod 1449.
2. Divide N by 2 and round down, then multiply M by M then reduce M's elements mod 1449.

The resulting J is a _jump matrix_ as follows:

    | 156   93  1240 |
    | 1389 1128  130 |
    | 1209  930  793 |

Transforming the MRG's state with J (and reducing mod 1449) will transform the state as though 100 outputs were discarded from the MRG.

<a id=Linear_Congruential_Generators></a>
### Linear Congruential Generators

A _linear congruential generator_ (LCG) generates numbers by transforming its state using the following formula: `x(k) = (x(k-1)*a + c) mod modulus`, where `a` is the _multiplier_, `c` is the additive constant, and `modulus` is the _modulus_.

An efficient way to jump an LCG ahead is described in (Brown 1994\)[^7]. This also applies to LCGs that transform each `x(k)` before outputting it, such as M.O'Neill's PCG32 and PCG64.

An MRG with only one multiplier expresses the special case of an LCG with `c = 0` (also known as a _multiplicative_ LCG).  For `c` other than 0, the following matrix describes the state transition `[x(k-1), 1]` to `[x(k), 1]` (mod `modulus`):

     | a   c |
     | 0   1 |

Jumping the LCG ahead can then be done using this matrix as described in the previous section.

<a id=Multiply_with_Carry_Add_with_Carry_Subtract_with_Borrow></a>
### Multiply-with-Carry, Add-with-Carry, Subtract-with-Borrow

There are implementations for jumping a multiply-with-carry (MWC) PRNG ahead, but only in source code form ([**ref. 1**](https://github.com/rsaucier/Random/blob/3a7981bd6a8ac6d4507e9630393303b18e8967ca/kiss.h)).  I am not aware of an article or paper that describes how jumping an MWC PRNG ahead works.

I am not aware of any efficient ways to jump an add-with-carry or subtract-with-borrow PRNG ahead an arbitrary number of steps.

<a id=Combined_PRNGs></a>
### Combined PRNGs

A combined PRNG can be jumped ahead N steps by jumping each of its components ahead N steps.

<a id=Jump_Parameters_for_Some_PRNGs></a>
### Jump Parameters for Some PRNGs

The following table shows the characteristic polynomial and jump polynomials for some PRNG families.  In the table:

- Each polynomial's coefficients are zeros and ones, so the table shows them as a base-16 integer that stores the coefficients as individual bits: the least significant bit is the degree-0 coefficient, the next bit is the degree-1 coefficient, and so on.  For example, the integer 0x23 stores the coefficients of the polynomial x<sup>5</sup> + x + 1.
- "'Period'/&phi;" means the PRNG's maximum cycle length divided by the golden ratio, and rounded to the closest odd integer; this jump parameter is chosen to avoid overlapping number sequences as much as possible (see also [**NumPy documentation**](https://docs.scipy.org/doc/numpy/reference/random/parallel.html)).

&nbsp;

| PRNG |  Characteristic Polynomial  | Jump Polynomials |
| --- | --- | --- |
| xoroshiro64 | 0x1053be9da6e2286c1 | 2<sup>32</sup>: 0x4cbf99bd77fcd1a0<br/>2<sup>48</sup>: 0xb4e7e4633f1f8b95<br/>"Period"/&phi;: 0x751f355609af0e3b
| xoshiro128 | 0x100fc65a2006254b11b489db6de18fc01 | 2<sup>32</sup>: 0xf8aed94730b948df3be07b8f7afe108<br/>2<sup>48</sup>: 0xdeaa4ca2dec5bb9a87a4583dcb56667c<br/>2<sup>64</sup>: 0x77f2db5b6fa035c3f542d2d38764000b<br/>2<sup>96</sup>: 0x1c580662ccf5a0ef0b6f099fb523952e<br/>"Period"/&phi;: 0x338b58d0590169928fda8fd5d1cf96b6
| xoroshiro128 (except ++) | 0x10008828e513b43d5095b8f76579aa001 | 2<sup>32</sup>: 0xd4e95eef9edbdbc6fad843622b252c78<br/>2<sup>48</sup>: 0x9b19ba6b3752065ad769cfc9028deb78<br/>2<sup>64</sup>: 0x170865df4b3201fcdf900294d8f554a5<br/>2<sup>96</sup>: 0xdddf9b1090aa7ac1d2a98b26625eee7b<br/>"Period"/&phi;: 0xc1c620fd7bf598c34a2828365a7df3e0
| xoroshiro128++ | 0x10031bcf2f855d6e58dae70779760b081 | 2<sup>32</sup>: 0x2e1bcf52f1051044fcceec21d5c306d9<br/>2<sup>48</sup>: 0xc8462a08ab3d7f9b99030a888c867939<br/>2<sup>64</sup>: 0x992ccaf6a6fca052bd7a6a6e99c2ddc<br/>2<sup>96</sup>: 0x9c6e6877736c46e3360fd5f2cf8d5d99<br/>"Period"/&phi;: 0x1b4c7a8989405b16d3e4e127a6a11513
| xoshiro256 |     0x10003c03c3f3ecb1904b4edcf26259f85&shy;0280002bcefd1a5e9d116f2bb0f0f001 | 2<sup>32</sup>: 0xe055d3520fdb9d7214fafc0fbdbc2087d8d0632bd08e6ac58120d583c112f69<br/>2<sup>48</sup>: 0x5f728be2c97e9066474579292f705634f825539dee5e4763f11fb4faea62c7f1<br/>2<sup>64</sup>: 0x12e4a2fbfc19bff934faff184785c20ab60d6c5b8c78f106b13c16e8096f0754<br/>2<sup>96</sup>: 0x31eebb6c82a9615fb27c05962ea56a13cdb45d7def42c317148c356c3114b7a9<br/>2<sup>128</sup>: 0x39abdc4529b1661ca9582618e03fc9aad5a61266f0c9392c180ec6d33cfd0aba<br/>2<sup>160</sup>: 0xf567382197055bf04823b45b89dc689c69e6e6e431a2d40bc04b4f9c5d26c200<br/>2<sup>192</sup>: 0x39109bb02acbe63577710069854ee241c5004e441c522fb376e15d3efefdcbbf<br/>2<sup>224</sup>: 0xa2b5d83a373c7ac2f31d2e03157bc387d317530723ab526a0c7840cbc3b121ad<br/>"Period"/&phi;: 0x294e2bac089b06c7d4ce5d1a031b6cf8787f49127b37f506ac1c9e5f5f53046c

<a id=Acknowledgments></a>
### Acknowledgments

Sebastiano Vigna reviewed this page and gave comments.

<a id=Notes></a>
## Notes

[^1]: Haramoto, Matsumoto, Nishimura, Panneton, L'Ecuyer, "Efficient Jump Ahead for F<sub>2</sub>-Linear Random Number Generators", _INFORMS Journal on Computing_ 20(3), Summer 2008.

[^2]: Vigna, S., "Further scramblings of Marsaglia's xorshift generators", _Journal of Computational and Applied Mathematics_ 315 (2017).

[^3]: Blackman, Vigna, "Scrambled Linear Pseudorandom Number Generators", 2019.

[^4]: Salmon, John K., Mark A. Moraes, Ron O. Dror, and David E. Shaw. "Parallel random numbers: as easy as 1, 2, 3." In _Proceedings of 2011 International Conference for High Performance Computing, Networking, Storage and Analysis_, pp. 1-12. 2011.

[^5]: L'Ecuyer, Simard, Chen, Kelton, "An Object-Oriented Random-Number Package with Many Long Streams and Substreams", _Operations Research_ 50(6), 2002.

[^6]: "_x_ is odd" means that _x_ is an integer and not divisible by 2.  This is true if _x_ &minus; 2\*floor(_x_/2) equals 1, or if _x_ is an integer and the least significant bit of abs(_x_) is 1.

[^7]: Brown, F., "Random Number Generation with Arbitrary Strides", _Transactions of the American Nuclear Society_ Nov. 1994.
