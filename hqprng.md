<a id=Examples_of_High_Quality_PRNGs></a>
## Examples of High-Quality PRNGs

Besides cryptographic random number generators (RNGs), the following are examples of [**high-quality pseudorandom number generators (PRNGs)**](https://peteroupc.github.io/random.html#High_Quality_RNGs_Requirements).  The "Fails PractRand Starting At" column in this and other tables in this page means the number of bytes (rounded up to the nearest power of two) at which PractRand detects a failure in the PRNG.

| PRNG | Seeds Allowed | Cycle Length | Fails PractRand Starting At | Notes |
 ----------| --- | --- | --- | --- |
| xoshiro256\*\* | 2^256 - 1 | 2^256 - 1 | ??? TiB | |
| xoshiro256+ | 2^256 - 1 | 2^256 - 1   | ??? TiB | Lowest bits have low linear complexity (see (Blackman and Vigna 2019)<sup>[**(1)**](#Note1)</sup> and see also "[**Testing low bits in isolation**](http://xoshiro.di.unimi.it/lowcomp.php)"); if the application or library cares, it can discard those bits before using this PRNG's output. |
| xoshiro256++ | 2^256 - 1 | 2^256 - 1  | ??? TiB  |  |
| xoshiro512\*\* | 2^512 - 1 | 2^512 - 1  | ??? TiB  |  |
| xoshiro512+ | 2^512 - 1 | 2^512 - 1   | ??? TiB | Lowest bits have low linear complexity |
| xoshiro512++ | 2^512 - 1 | 2^512 - 1   | ??? TiB |  |
| xoroshiro128++ | 2^128 - 1 | 2^128 - 1   | ??? TiB |  |
| xoroshiro128\*\* | 2^128 - 1 | 2^128 - 1  | ??? TiB  |  |
| SFC64 (C. Doty-Humphrey) | 2^192 | At least 2^64 per seed  | ??? TiB | 256-bit state |
| Philox | 2^128 | At least 2^256 per seed  | ??? TiB | 384-bit state |
| Velox3b | 2^64 | At least 2^128 per seed  | ??? TiB | 256-bit state |
| `gjrand` named after Geronimo Jones | 2^128 | At least 2^64 per seed  | ??? TiB | 256-bit state |
| MRG32k3a (L'Ecuyer 1999)<sup>[**(2)**](#Note2)</sup>| Near 2^192 | 2 cycles with length near 2^191  | ??? TiB | 192-bit state |
| MRG31k3p (L'Ecuyer and Touzin 2000)<sup>[**(3)**](#Note3)</sup> | Near 2^186 | 2 cycles with length near 2^185  | ??? TiB | 192-bit state |
| JLKISS (Jones 2007/2010)<sup>[**(4)**](#Note4)</sup> | 2^64 * (2^64 - 1)^2 | At least (2^128 - 2^64)  | ??? TiB | 192-bit state |
| JLKISS64 (Jones 2007/2010)<sup>[**(4)**](#Note4)</sup> | 2^64 * (2^64 - 1)^3 | At least (2^128 - 2^64)  | ??? TiB | 256-bit state |
| A multiplicative [**linear congruential generator**](https://en.wikipedia.org/wiki/Linear_congruential_generator) (LCG) with prime modulus greater than 2<sup>63</sup> described in Table 2 of (L'Ecuyer 1999)<sup>[**(5)**](#Note5)</sup> | Modulus - 1 | Modulus - 1  | ??? TiB | Memory used depends on modulus size |
| XorShift\* 128/64 | 2^128 - 1 | 2^128 - 1  | ??? TiB | 128-bit state.  Described by M. O'Neill in "You don't have to use PCG!", 2017.<sup>[**(6)**](#Note6)</sup> |
| XorShift\* 64/32 | 2^64 - 1 | 2^64 - 1  | ??? TiB | 64-bit state. Described by M. O'Neill in "You don't have to use PCG!", 2017. |

<a id=PRNGs_with_Stream_Support></a>
### PRNGs with Stream Support

Some PRNGs support multiple "streams" that behave like independent random number sequences.  The test for independence involves interleaving two "streams"' outputs and sending the interleaved outputs to the PractRand tests.

The following lists high-quality PRNGs that support streams and their PractRand results for different strategies of forming random number "streams".

| PRNG | Fails PractRand Starting At | Notes |
 ----------| --- | --- |
| xoshiro256** | Jump-ahead by 2^64: ??? TiB<br>Jump-ahead by 2^128: ??? TiB<br>Jump-ahead by 2^256/&phi;: ???  TiB<br>Consecutive seeds: ??? TiB |  |
| xoshiro256++ | Jump-ahead by 2^64: ??? TiB<br>Jump-ahead by 2^128: ??? TiB<br>Jump-ahead by 2^256/&phi;: ???  TiB<br>Consecutive seeds: ??? TiB |  |
| xoroshiro128**  | Jump-ahead by 2^64: ??? TiB<br>Jump-ahead by 2^128/&phi;: ??? TiB<br>Consecutive seeds: ??? TiB |  |
| xoroshiro128++  | Jump-ahead by 2^64: ??? TiB<br>Jump-ahead by 2^128/&phi;: ??? TiB<br>Consecutive seeds: ??? TiB |  |
| SFC64 | Consecutive seeds: ??? TiB<br>Seed increment by 2^64: ??? TiB<br> |  |
| Philox | Consecutive seeds: ??? TiB<br>Seed increment by 2^64: ??? TiB<br> |  |
| PCG64  | Jump-ahead by period/&phi;: ??? TiB | What PCG calls "streams" does not produce independent sequences. |
| ???  | Jump-ahead by period/&phi;: ??? TiB | |

<a id=Counter_Based_PRNGs></a>
### Counter-Based PRNGs

Constructions for counter-based PRNGs (Salmon et al. 2011)<sup>[**(7)**](#Note7)</sup> include:

1. A PRNG that outputs hash codes of a counter and the seed.
2. A PRNG that uses a block cipher with the seed as a key to output encrypted counters.

More specifically, let C and S each be 64 or greater and divisible by 8.  Then:

1. A C-bit counter is set to 0 and an S-bit seed is chosen.  In each iteration, the PRNG outputs `H(seed || 0x5F || counter)` (where `H` is a hash function, `||` means concatenation, `0x5F` is the 8-bit block 0x5F, and `seed` and `counter` are little-endian encodings of the seed or counter, respectively), and adds 1 to the counter by wraparound addition.  Or...
2. A C-bit counter is set to 0 and an S-bit seed is chosen.  In each iteration, the PRNG outputs `E(counter, seed)` (where `E` is a C-bit block cipher and `seed` and `counter` are little-endian encodings of the seed (key) or counter (cleartext), respectively), and adds 1 to the counter by wraparound addition.

The following lists hash functions and block ciphers that form high-quality counter-based PRNGs.  It's possible that reduced-round versions of these and other functions will also produce high-quality counter-based PRNGs.

| Function | Fails PractRand Starting At | Notes |
 ----------| --- | --- |
| ??? | ??? TiB (Interleaved streams from consecutive seeds: ??? TiB) | |
| ??? | ??? TiB (Consecutive seeds: ??? TiB) | |
| ??? | ??? TiB (Consecutive seeds: ??? TiB) | |
| ??? | ??? TiB (Consecutive seeds: ??? TiB) | |

<a id=Combined_PRNGs></a>
### Combined PRNGs

The following lists high-quality combined PRNGs.  See "[**Testing PRNGs for High-Quality Randomness**](https://github.com/peteroupc/peteroupc.github.io/blob/master/randomtest.md)" for more information on combining PRNGs.

| Function | Fails PractRand Starting At | Notes |
 ----------| --- | --- |
| ??? combined with Weyl sequence | ??? TiB | |
| ??? combined with 128-bit LCG | ??? TiB | |
| JSF64 combined with ??? | ??? TiB | |
| JSF64 combined with ??? | ??? TiB | |
| Tyche combined with ??? | ??? TiB | |
| Tyche-i combined with ??? | ??? TiB | |
| ??? combined with ??? | ??? TiB | |

<a id=Splittable_PRNGs></a>
### Splittable PRNGs

The following lists high-quality splittable PRNGs.  See "[**Testing PRNGs for High-Quality Randomness**](https://github.com/peteroupc/peteroupc.github.io/blob/master/randomtest.md)" for more information on testing splittable PRNGs.

| Function | Fails PractRand Starting At | Notes |
 ----------| --- |  --- |
| ??? | ??? TiB | |
| ??? | ??? TiB | |
| ??? | ??? TiB | |

<a id=PRNGs_Not_Preferred></a>
### PRNGs Not Preferred

Although the following are technically high-quality PRNGs, they are not preferred:

| PRNG | Notes |
 ----------| --- |
| C++'s [**`std::ranlux48` engine**](http://www.cplusplus.com/reference/random/ranlux48/) | Usually takes about 192 8-bit bytes of memory. Admits up to 2^577 - 2 seeds; seed's bits cannot be all zeros or all ones (L&uuml;scher 1994)<sup>[**(8)**](#Note8)</sup>.  The maximum cycle length for `ranlux48`'s underlying generator is very close to 2^576.  |
| A high-quality PRNG that is an LCG with non-prime modulus (or a PRNG based on one, such as PCG) | If the modulus is a power of 2, this PRNG can produce highly correlated "random" number sequences from seeds that differ only in their high bits (see S. Vigna, "[**The wrap-up on PCG generators**](http://pcg.di.unimi.it/pcg.php)") and lowest bits have short cycles. What PCG calls "streams" does not produce independent sequences. |

<a id=Not_High_Quality_PRNGs></a>
### Not High-Quality PRNGs

The following are not considered high-quality PRNGs:

|  Algorithm  |  Notes  |
  ---------- |  ---- |
| Sequential counter | Doesn't behave like independent random sequence |
| A linear congruential generator with modulus less than 2<sup>63</sup> (such as `java.util.Random` and C++'s `std::minstd_rand` and `std::minstd_rand0` engines) | Admits fewer than 2<sup>63</sup> seeds |
| Mersenne Twister (MT19937) | Shows a [**systematic failure**](http://xoroshiro.di.unimi.it/#quality) in BigCrush's LinearComp test (part of L'Ecuyer and Simard's "TestU01"). (See also (Vigna 2019)<sup>[**(9)**](#Note9)</sup>.) Moreover, it usually takes about 2500 8-bit bytes of memory. |
| Marsaglia's `xorshift` family ("Xorshift RNGs", 2003) | Shows systematic failures in SmallCrush's MatrixRank test (Vigna 2016)<sup>[**(10)**](#Note10)</sup>|
| `System.Random`, as implemented in the .NET Framework 4.7 | Admits fewer than 2<sup>63</sup> seeds |
| Ran2 (_Numerical Recipes_) | Minimum cycle length less than 2<sup>63</sup> |
| `msws` (Widynski 2017)<sup>[**(11)**](#Note11)</sup> | Admits fewer than 2<sup>63</sup> seeds (about 2<sup>54.1</sup> valid seeds) |
| JSF32 (B. Jenkins's "A small noncryptographic PRNG") | Admits fewer than 2<sup>63</sup> seeds; proven minimum cycle length is only 2<sup>20</sup> or more |
| JSF64 (B. Jenkins's "A small noncryptographic PRNG") | No proven minimum cycle of at least 2<sup>63</sup> values |
| Middle square | No proven minimum cycle of at least 2<sup>63</sup> values |
| Cellular-automaton PRNGs, including Rule 30 | No proven minimum cycle of at least 2<sup>63</sup> values |
| Tyche/Tyche-i (Neves and Araujo 2011)<sup>[**(12)**](#Note12)</sup> | No proven minimum cycle of at least 2<sup>63</sup> values |

<a id=Notes></a>
## Notes

<small><sup id=Note1>(1)</sup> Blackman, D., Vigna, S. "Scrambled Linear Pseudorandom Number Generators", 2019 (xoroshiro and xoshiro families); S. Vigna, "[**An experimental exploration of Marsaglia's `xorshift` generators, scrambled**](http://vigna.di.unimi.it/ftp/papers/xorshift.pdf)", 2016 (scrambled xorshift family).</small>

<small><sup id=Note2>(2)</sup> L'Ecuyer, P., "Good Parameters and Implementations for Combined Multiple Recursive Random Number Generators", _Operations Research_ 47(1), 1999.</small>

<small><sup id=Note3>(3)</sup> L'Ecuyer, P., Touzin, R., "Fast Combined Multiple Recursive Generators with Multipliers of the Form a = &pm;2<sup>q</sup> &pm; 2<sup>r</sup>", _Proceedings of the 2000 Winter Simulation Conference_, 2000.</small>

<small><sup id=Note4>(4)</sup> Jones, D., "Good Practice in (Pseudo) Random Number Generation for Bioinformatics Applications", 2007/2010.</small>

<small><sup id=Note5>(5)</sup> P. L'Ecuyer, "Tables of Linear Congruential Generators of Different Sizes and Good Lattice Structure", _Mathematics of Computation_ 68(225), January 1999.</small>

<small><sup id=Note6>(6)</sup> This XorShift\* generator is not to be confused with S. Vigna's \*-scrambled PRNGs, which multiply the PRNG state differently than this one does.</small>

<small><sup id=Note7>(7)</sup> Salmon, J.K.; Moraes, M.A.; et al., "Parallel Random Numbers: As Easy as 1, 2, 3", 2011.</small>

<small><sup id=Note8>(8)</sup> L&uuml;scher, M., "A Portable High-Quality Random Number Generator for Lattice Field Theory Simulations", arXiv:hep-lat/9309020 (1994).  See also Conrads, C., "[**Faster RANLUX Pseudo-Random Number Generators**](https://christoph-conrads.name/faster-ranlux-pseudo-random-number-generators/)".</small>

<small><sup id=Note9>(9)</sup> S. Vigna, "It Is High Time We Let Go of the Mersenne Twister", arXiv:1910.06437 [cs.DS], 2019.</small>

<small><sup id=Note10>(10)</sup> S. Vigna, "[**An experimental exploration of Marsaglia's `xorshift` generators, scrambled**](http://vigna.di.unimi.it/ftp/papers/xorshift.pdf)", 2016.</small>

<small><sup id=Note11>(11)</sup> Widynski, B., "Middle Square Weyl Sequence RNG", arXiv:1704.00358 [cs.CR], 2017.</small>

<small><sup id=Note12>(12)</sup> Neves, S., and Araujo, F., "Fast and Small Nonlinear Pseudorandom Number Generators for Computer Simulation", 2011.</small>