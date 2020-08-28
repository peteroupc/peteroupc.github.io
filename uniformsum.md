# Arbitrary-Precision Samplers for the Sum or Ratio of Uniform Random Numbers

[**Peter Occil**](mailto:poccil14@gmail.com)

This page presents new algorithms to sample the sum of uniform(0, 1) random numbers and the ratio of two uniform(0, 1) random numbers, with the help of [**partially-sampled random numbers**](https://peteroupc.github.io/exporand.html), with arbitrary precision and without relying on floating-point arithmetic.  See that page for more information on some of the algorithms made use of here, including **SampleGeometricBag** and **FillGeometricBag**.

<a id=About_the_Uniform_Sum_Distribution></a>
## About the Uniform Sum Distribution

The sum of _n_ uniform(0, 1) random numbers has the following probability density function (PDF) (see [**MathWorld**](https://mathworld.wolfram.com/UniformSumDistribution.html)):

&nbsp;&nbsp;&nbsp;&nbsp;_f_(_x_) = (&Sigma;<sub>_k_ = 0, ..., _n_</sub> (&minus;1)<sup>_k_</sup> * choose(_n_, _k_) * (_x_ &minus; _k_)<sup>_n_ &minus; 1</sup> * sign(_x_ &minus; _k_)) / (2*(n&minus;1)!).

For _n_ uniform numbers, the distribution can take on values in the interval [0, _n_].  Note also that the PDF expresses a polynomial of degree _n_ &minus; 1.

The samplers given below for the uniform sum logically work as follows:

1. The distribution is divided into pieces that are each 1 unit long (thus, for example, if _n_ is 4, there will be four pieces).
2. An integer in \[0, _n_\) is chosen uniformly at random, call it _i_, then the piece identified by _i_ is chosen.  There are [**many algorithms to choose an integer**](https://peteroupc.github.io/randomnotes.html#A_Note_on_Integer_Generation_Algorithms) this way, but an algorithm that is "optimal" in terms of the number of bits it uses, as well as unbiased, should be chosen.
3. The PDF at \[_i_, _i_ + 1\] is simulated.  This is done by shifting the PDF so the desired piece of the PDF is at \[0, 1\] rather than its usual place.  More specifically, the PDF is now as follows:

    - _f_&prime;(_x_) = (&Sigma;<sub>_k_ = 0, ..., _n_</sub> (&minus;1)<sup>_k_</sup> * choose(_n_, _k_) * ((_x_ + _i_) &minus; _k_)<sup>_n_ &minus; 1</sup> * sign((_x_ + _i_) &minus; _k_)) / (2*(n&minus;1)!),

    where _x_ is a real number in \[0, 1\].  Since _f_&prime; is a polynomial, it can be converted to a Bernstein polynomial whose control points describe the shape of the curve drawn out by _f_&prime;. (Bernstein polynomials are the backbone of the well-known Bézier curve.) A Bernstein polynomial has the form&mdash;

    - &Sigma;<sub>_k_ = 0, ..., _m_</sub> choose(_m_, _k_) * _x_<sup>_k_</sup> * (1 &minus; _x_)<sup>_m_ &minus; _k_</sup> * _a_\[_k_\],

    where _a_\[_k_\] are the control points and _m_ is the polynomial's degree (here, _n_ &minus; 1). In this case, there will be _n_ control points, which together trace out a 1-dimensional Bézier curve.  For example, given control points 0.2, 0.3, and 0.6, the curve is at 0.2 when _x_ = 0, and 0.6 when _x_ = 1.  (Note that the curve is not at 0.3 when _x_ = 1/2; in general, Bézier curves do not cross their control points other than the first and the last.)

    Moreover, this polynomial can be simulated because it is continuous, returns only numbers in \[0, 1\], and doesn't touch 0 or 1 anywhere inside the domain (except possibly at 0 and/or 1) (Keane and O'Brien 1994)<sup>[**(1)**](#Note1)</sup>.
4. The sampler creates a "coin" made up of a uniform partially-sampled random number (PSRN) whose contents are built up on demand using an algorithm called **SampleGeometricBag**.  It flips this "coin" _n_ &minus; 1 times and counts the number of times the coin returned 1 this way, call it _j_. (The "coin" will return 1 with probability equal to the to-be-determined uniform random number.  See (Goyal and Sigman 2012)<sup>[**(2)**](#Note2)</sup>.)
5. Based on _j_, the sampler accepts the PSRN with probability equal to the control point _a_\[_j_\].
6. If the PSRN is accepted, it fills it up with uniform random digits, and returns _i_ plus the finished PSRN.  If the PSRN is not accepted, the sampler starts over from step 2.

<a id=Finding_Parameters></a>
## Finding Parameters

Using the uniform sum sampler for an arbitrary _n_ requires finding the Bernstein control points for each of the _n_ pieces of the uniform sum PDF.  This can be found, for example, with the Python code below, which uses the SymPy computer algebra library.  In the code:

- `unifsum(x,n,v)` calculates the PDF of the sum of `n` uniform random numbers when the variable `x` is shifted by `v` units.
- `find_control_points` returns the control points for each piece of the PDF for the sum of `n` uniform random numbers, starting with piece 0.
- `find_areas` returns the relative areas for each piece of that PDF.  This can be useful to implement a variant of the sampler above, as detailed later in this section.

```
def unifsum(x,n,v):
    # Builds up the PDF at x (with offset v)
    # of the sum of n uniform random numbers
    ret=0
    x=x+v # v is an offset
    for k in range(n+1):
           s=(-1)**k*binomial(n,k)*(x-k)**(n-1)
           # Equivalent to k>x+v since x is limited
           # to [0, 1]
           if k>v: ret-=s
           else: ret+=s
    return ret/(2*factorial(n-1))

def find_areas(n):
   x=symbols('x', real=True)
   areas=[integrate(unifsum(x,n,i),(x,0,1)) for i in range(n)]
   g=prod([v.q for v in areas])
   areas=[int(v*g) for v in areas]
   g=gcd(areas)
   areas=[v/int(g) for v in areas]
   return areas

def find_control_points(n, scale_pieces=False):
 x=symbols('x', real=True)
 controls=[]
 for i in range(n):
  # Find the "usual" coefficients of the uniform
  # sum polynomial at offset i.
  poly=Poly(unifsum(x, n, i))
  coeffs=[poly.coeff_monomial(x**i) for i in range(n)]
  # Build coefficient vector
  coeffs=Matrix(coeffs)
  # Build power-to-Bernstein basis matrix
  mat=[[0 for _ in range(n)] for _ in range(n)]
  for j in range(n):
    for k in range(n):
       if k==0 or j==n-1:
         mat[j][k]=1
       elif k<=j:
         mat[j][k]=binomial(j, j-k) / binomial(n-1, k)
       else:
         mat[j][k]=0
  mat=Matrix(mat)
  # Get the Bernstein control points
  mv = mat*coeffs
  mvc = [Rational(mv[i]) for i in range(n)]
  maxcoeff = max(mvc)
  # If requested, scale up control points to raise acceptance rate
  if scale_pieces:
     mvc = [v/maxcoeff for v in mvc]
  mv = [[v.p, v.q] for v in mvc]
  controls.append(mv)
 return controls
```

The basis matrix is found, for example, as Equation 42 of (Ray and Nataraj 2012)<sup>[**(3)**](#Note3)</sup>.

For example, if _n_ = 4 (so a sum of four uniform random numbers is desired), the following control points are used for each piece of the PDF:

| Piece | Control Points |
 --- | --- |
| 0 | 0, 0, 0, 1/6 |
| 1 | 1/6, 1/3, 2/3, 2/3 |
| 2 | 2/3, 2/3, 1/3, 1/6 |
| 3 | 1/6, 0, 0, 0 |

For more efficient results, all these control points could be scaled so that the highest control point is equal to 1.  This doesn't affect the algorithm's correctness because scaling a Bézier curve's control points scales the curve accordingly, as is well known. In the example above, after multiplying by 3/2 (the reciprocal of the highest control point, which is 2/3), the table would now look like this:

| Piece | Control Points |
 --- | --- |
| 0 | 0, 0, 0, 1/4 |
| 1 | 1/4, 1/2, 1, 1 |
| 2 | 1, 1, 1/2, 1/4 |
| 3 | 1/4, 0, 0, 0 |

Notice the following:

- All these control points are rational numbers, and the sampler may have to determine whether an event is true with probability equal to a control point.  For rational numbers like these, it is possible to determine this exactly (using only random bits), using the **ZeroOrOne** method given in my [**article on randomization and sampling methods**](https://peteroupc.github.io/randomfunc.html#Boolean_True_False_Conditions).
- The first and last piece of the PDF have a predictable set of control points.  Namely the control points are as follows:
    - Piece 0: 0, 0, ..., 0, 1/((_n_ &minus; 1)!).
    - Piece _n_ &minus; 1: 1/((_n_ &minus; 1)!), 0, 0, ..., 0.

If the areas of the PDF's pieces are known in advance (and SymPy makes them easy to find as the `find_areas` method shows), then the sampler could be modified as follows, since each piece is now chosen with probability proportional to the chance that a random number there will be sampled:

- Step 2 is changed to read: "An integer in \[0, _n_\) is chosen with probability proportional to the corresponding piece's area, call the integer _i_, then the piece identified by _i_ is chosen.  There are many [**algorithms to choose an integer**](https://peteroupc.github.io/randomnotes.html#A_Note_on_Weighted_Choice_Algorithms) this way, but it's recommended to use one that takes integers rather than floating-point numbers as weights, and perhaps one that is economical in terms of the number of random bits it uses.  In this sense, the Fast Loaded Dice Roller (Saad et al. 2020)<sup>[**(4)**](#Note4)</sup> comes within 6 bits of the optimal number of random bits used on average."
- The last sentence in step 6 is changed to read: "If the PSRN is not accepted, the sampler starts over from step 3."  With this, the same piece is sampled again.
- The following are additional modifications that should be done to the sampler.  However, not applying them does not affect the sampler's correctness.

    - The control points should be scaled so that the highest control point of _each_ piece is equal to 1.  See the table below for an example.
    - If piece 0 is being sampled and the PSRN's digits are binary (base 2), the "coin" described in step 4 uses a modified version of **SampleGeometricBag** in which a 1 (rather than any other digit) is sampled from the PSRN when it reads from or writes to that PSRN.  Moreover, the PSRN is always accepted regardless of the result of the "coin" flip.
    - If piece _n_ &minus; 1 is being sampled and the PSRN's digits are binary (base 2), the "coin" uses a modified version of **SampleGeometricBag** in which a 0 (rather than any other digit) is sampled, and the PSRN is always accepted.

| Piece | Control Points |
 --- | --- |
| 0 | 0, 0, 0, 1 |
| 1 | 1/4, 1/2, 1, 1 |
| 2 | 1, 1, 1/2, 1/4 |
| 3 | 1, 0, 0, 0 |

<a id=Sum_of_Two_Uniform_Random_Numbers></a>
## Sum of Two Uniform Random Numbers

The following algorithm samples the sum of two uniform random numbers.

1. Create an empty uniform PSRN (partially-sampled random number), call it _ret_.
2. Generate an unbiased random bit.
2. Remove all digits from _ret_.  (This algorithm, and others on this page, works for digits of any base, including base 10 for decimal, or base 2 for binary.)
3. Call the **SampleGeometricBag** algorithm on _ret_, then generate an unbiased random bit.
4. If the bit generated in step 2 is 1 and the result of **SampleGeometricBag** is 1, fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), and return _ret_.
5. If the bit generated in step 2 is 0 and the result of **SampleGeometricBag** is 0, fill _ret_ as in step 4, and return 1 + _ret_.
6. Go to step 3.

And here is Python code that implements this algorithm. It uses floating-point arithmetic only at the end, to convert the result to a convenient form, and that it relies on methods from _randomgen.py_ and _bernoulli.py_.

```
def sum_of_uniform(bern, precision=53):
    """ Exact simulation of the sum of two uniform
          random numbers. """
    bag=[]
    rb=bern.randbit()
    while True:
       bag.clear()
       if rb==1:
          # 0 to 1
          if bern.geometric_bag(bag)==1:
             return bern.fill_geometric_bag(bag, precision)
       else:
          # 1 to 2
          if bern.geometric_bag(bag)==0:
             return 1.0 + bern.fill_geometric_bag(bag, precision)
```

<a id=Sum_of_Three_Uniform_Random_Numbers></a>
## Sum of Three Uniform Random Numbers

The following algorithm samples the sum of three uniform random numbers.

1. Create an empty uniform PSRN, call it _ret_.
2. Choose an integer in [0, 6), uniformly at random. (With this, the left piece is chosen at a 1/6 chance, the right piece at 1/6, and the middle piece at 2/3, corresponding to the relative areas occupied by the three pieces.)
3. Remove all digits from _ret_.
4. If 0 was chosen by step 2, we will sample from the left piece of the function for the sum of three uniform random numbers.  This piece runs along the interval \[0, 1\) and is a Bernstein polynomial (and Bézier curve) with control points (0, 0, 1/2).  Due to the particular form of the control points, the piece can be sampled in one of the following ways:

    - Call the **SampleGeometricBag** algorithm twice on _ret_.  If both of these calls return 1, then accept _ret_ with probability 1/2.  This is the most "naïve" approach.
    - Call the **SampleGeometricBag** algorithm twice on _ret_.  If both of these calls return 1, then accept _ret_.  This version of the step is still correct since it merely scales the polynomial so its upper bound is closer to 1, which is the top of the left piece, thus improving the acceptance rate of this step.
    - Base-2 only: Call a modified version of **SampleGeometricBag** twice on _ret_; in this modified algorithm, a 1 (rather than any other digit) is sampled from _ret_ when that algorithm reads or writes a digit in _ret_.  Then _ret_ is accepted.  This version will always accept _ret_ on the first try, without rejection, and is still correct because _ret_ would be accepted by this step only if **SampleGeometricBag** succeeds both times, which will happen only if that algorithm reads or writes out a 1 each time (because otherwise the control point is 0, meaning that _ret_ is accepted with probability 0).

    If _ret_ was accepted, fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), and return _ret_.
5. If 2, 3, 4, or 5 was chosen by step 2, we will sample from the middle piece of the PDF, which runs along the interval [1, 2) and is a Bernstein polynomial with control points (1/2, 1, 1/2).  Call the **SampleGeometricBag** algorithm twice on _ret_.  If neither or both of these calls return 1, then accept _ret_.  Otherwise, if one of these calls returns 1 and the other 0, then accept _ret_ with probability 1/2.  If _ret_ was accepted, fill _ret_ as given in step 4 and return 1 + _ret_.
6. If 1 was chosen by step 2, we will sample from the right piece of the PDF, which runs along the interval [2, 3) and is a Bernstein polynomial with control points (1/2, 0, 0).  Due to the particular form of the control points, the piece can be sampled in one of the following ways:

    - Call the **SampleGeometricBag** algorithm twice on _ret_.  If both of these calls return 0, then accept _ret_ with probability 1/2.  This is the most "naïve" approach.
    - Call the **SampleGeometricBag** algorithm twice on _ret_.  If both of these calls return 0, then accept _ret_.  This version is correct for a similar reason as in step 4.
    - Base-2 only: Call a modified version of **SampleGeometricBag** twice on _ret_; in this modified algorithm, a 0 (rather than any other digit) is sampled from _ret_ when that algorithm reads or writes a digit in _ret_.  Then _ret_ is accepted.  This version is correct for a similar reason as in step 4.

    If _ret_ was accepted, fill _ret_ as given in step 4 and return 2 + _ret_.
7. Go to step 3.

And here is Python code that implements this algorithm.

```
def sum_of_uniform3(bern):
    """ Exact simulation of the sum of three uniform
          random numbers. """
    r=6
    while r>=6:
       r=bern.randbit() + bern.randbit() * 2 + bern.randbit() * 4
    while True:
       # Choose a piece of the PDF uniformly (but
       # not by area).
       bag=[]
       if r==0:
          # Left piece
          if bern.geometric_bag(bag) == 1 and \
             bern.geometric_bag(bag) == 1:
              # Accepted
             return bern.fill_geometric_bag(bag)
       elif r<=4:
          # Middle piece
          ones=bern.geometric_bag(bag) + bern.geometric_bag(bag)
          if (ones == 0 or ones == 2) and bern.randbit() == 0:
              # Accepted
             return 1.0 + bern.fill_geometric_bag(bag)
          if ones == 1:
              # Accepted
             return 1.0 + bern.fill_geometric_bag(bag)
       else:
          # Right piece
          if bern.randbit() == 0 and \
             bern.geometric_bag(bag) == 0 and \
             bern.geometric_bag(bag) == 0:
              # Accepted
             return 2.0 + bern.fill_geometric_bag(bag)
```

<a id=Ratio_of_Two_Uniform_Random_Numbers></a>
## Ratio of Two Uniform Random Numbers

The ratio of two uniform(0,1) random numbers has the following PDF (see [**MathWorld**](https://mathworld.wolfram.com/UniformRatioDistribution.html)):

- 1/2 if _x_ >= 0 and _x_ <= 1,
- ( 1/ _x_<sup>2</sup>) / 2 if _x_ > 1, and
- 0 otherwise.

The following algorithm simulates this PDF.

1. With probability 1/2, we have a uniform(0, 1) random number.  Create an empty uniform PSRN, then either return that PSRN as is or fill it with uniform random digits as necessary to give the number's fractional part the desired number of digits (similarly to **FillGeometricBag**) and return the resulting number.
return either an empty uniform PSRN or a uniform random number in [0, 1) whose fractional part contains the desired number of digits.
2. At this point, the result will be 1 or greater.  Set _intval_ to 1 and set _size_ to 1.
3. With probability 1/2, add _size_ to _intval_, then multiply _size_ by 2, then repeat this step.  (This step chooses an interval beyond 1, taking advantage of the fact that the area under the PDF between 1 and 2 is 1/4, between 2 and 4 is 1/8, between 4 and 8 is 1/16, and so on, so that an appropriate interval is chosen with the correct probability.)
4. Generate an integer in the interval [_intval_, _intval_ + _size_) uniformly at random, call it _i_.
5. Create an empty uniform PSRN, _ret_.
6. Call the **sub-algorithm** below with _d_ = _intval_ and _c_ = _i_.  If the call returns 0, go to step 4.  (Here we simulate _intval_/(_i_+&lambda;) rather than 1/(_i_+&lambda;) in order to increase acceptance rates in this step.  This is possible without affecting the algorithm's correctness.)
7. Call the **sub-algorithm** below with _d_ = 1 and _c_ = _i_.  If the call returns 0, go to step 4.
8. The PSRN _ret_ was accepted, so fill it with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), and return _i_ + _ret_.

The algorithm above uses a sub-algorithm that simulates the probability _d_ / (_c_ + &lambda;), where &lambda; is the probability built up by the uniform PSRN, as follows:

1. With probability _c_ / (1 + _c_), return a number that is 1 with probability _d_/_c_ and 0 otherwise.
2. Call **SampleGeometricBag** on _ret_ (the uniform PSRN).  If the call returns 1, return 0.  Otherwise, go to step 1.

And the following Python code implements this algorithm.

```
def numerator_div(bern, numerator, intpart, bag):
   # Simulates numerator/(intpart+bag)
   while True:
      if bern.zero_or_one(intpart,1+intpart)==1:
         return bern.zero_or_one(numerator,intpart)
      if bern.geometric_bag(bag)==1: return 0

def ratio_of_uniform(bern):
    """ Exact simulation of the ratio of uniform random numbers."""
    # First, simulate the integer part
    if bern.randbit():
       # This is 0 to 1, which follows a uniform distribution
       bag=[]
       return bern.fill_geometric_bag(bag)
    else:
       # This is 1 or greater
       intval=1
       size=1
       count=0
       # Determine which range of integer parts to draw
       while True:
           if bern.randbit()==1:
                break
           intval+=size
           size*=2
           count+=1
       while True:
         # Draw the integer part
         intpart=bern.rndintexc(size) + intval
         bag=[]
         # Note: Density at [intval,intval+size) is multiplied
         # by intval, to increase acceptance rates
         if numerator_div(bern,intval,intpart,bag)==1 and \
            numerator_div(bern,1,intpart,bag)==1:
             return intpart + bern.fill_geometric_bag(bag)
```

<a id=Notes></a>
## Notes

- <small><sup id=Note1>(1)</sup> Keane,  M.  S.,  and  O'Brien,  G.  L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994</small>
- <small><sup id=Note2>(2)</sup> Goyal, V. and Sigman, K., 2012. On simulating a class of Bernstein polynomials. ACM Transactions on Modeling and Computer Simulation (TOMACS), 22(2), pp.1-5.</small>
- <small><sup id=Note3>(3)</sup> S. Ray, P.S.V. Nataraj, "A Matrix Method for Efficient Computation of Bernstein Coefficients", _Reliable Computing_ 17(1), 2012.</small>
- <small><sup id=Note4>(4)</sup> Saad, F.A., Freer C.E., et al., "[**The Fast Loaded Dice Roller: A Near-Optimal Exact Sampler for Discrete Probability Distributions**](https://arxiv.org/abs/2003.03830v2)", arXiv:2003.03830v2 [stat.CO], also in AISTATS 2020: Proceedings of the 23rd International Conference on Artificial Intelligence and Statistics, Proceedings of Machine Learning Research 108, Palermo, Sicily, Italy, 2020.</small>

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
