# Exact Samplers for the Sum of Uniform Random Numbers

[**Peter Occil**](mailto:poccil14@gmail.com)

This page presents new algorithms to sample the sum of uniform(0, 1) random numbers, with the help of [**partially-sampled random numbers**](https://peteroupc.github.io/exporand.html), with arbitrary precision and without relying on floating-point arithmetic.  See that page for more information on some of the algorithms made use of here, including **SampleGeometricBag** and **FillGeometricBag**.

<a id=Sum_of_Two_Uniform_Random_Numbers></a>
## Sum of Two Uniform Random Numbers

The following algorithm samples the sum of two uniform random numbers.

1. Create an empty uniform PSRN (partially-sampled random number), call it _ret_.
2. Remove all digits from _ret_.  (This algorithm, and others on this page, works for digits of any base, including base 10 or decimal, or base 2 or binary.)
3. Call the **SampleGeometricBag** algorithm on _ret_, then generate an unbiased random bit.
4. If the bit is 1 and the result of **SampleGeometricBag** is 1, fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), and return _ret_.
5. If the bit is 0 and the result of **SampleGeometricBag** is 0, fill _ret_ as in step 4, and return 1 + _ret_.
6. Go to step 2.

And here is Python code that implements this algorithm. It uses floating-point arithmetic only at the end, to convert the result to a convenient form, and that it relies on methods from _randomgen.py_ and _bernoulli.py_.

```
def sum_of_uniform(bern, precision=53):
    """ Exact simulation of the sum of two uniform
          random numbers. """
    bag=[]
    while True:
       bag.clear()
       if bern.randbit()==1:
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
2. Remove all digits from _ret_.
3. Choose 0, 1 or 2, uniformly at random.
4. If 0 was chosen by step 3, we will sample from the left piece of the function for the sum of three uniform random numbers.  This piece runs along the interval \[0, 1\) and is a Bernstein polynomial with control points (0, 0, 1/2).  (Bernstein polynomials are the backbone of the well-known Bézier curve. In this case, the density's value at 0 is 0, or the first control point, and its value at 1 is 1/2, or the third control point.)  Thus, we can simulate this polynomial with the algorithm of Goyal and Sigman (2012)<sup>[**(1)**](#Note1)</sup>, using a partially-sampled uniform random number, as follows: Call the **SampleGeometricBag** algorithm twice on _ret_.  If both of these calls return 1, then accept _ret_ with probability 1/2. (1/2 is the third control point and corresponds to both calls returning 1.)  If _ret_ was accepted, fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), and return _ret_.
5. If 1 was chosen by step 3, we will sample from the middle piece of the density, which runs along the interval [1, 2) and is a Bernstein polynomial with control points (1/2, 1, 1/2).  Call the **SampleGeometricBag** algorithm twice on _ret_.  If neither or both of these calls return 1, then accept _ret_.  Otherwise, if one of these calls returns 1 and the other 0, then accept _ret_ with probability 1/2.  If _ret_ was accepted, fill _ret_ as given in step 4 and return 1 + _ret_.
6. If 2 was chosen by step 3, we will sample from the right piece of the density, which runs along the interval [2, 1) and is a Bernstein polynomial with control points (1/2, 0, 0).  Call the **SampleGeometricBag** algorithm twice on _ret_.  If both of these calls return 0, then accept _ret_ with probability 1/2. (1/2 is the first control point and corresponds to both calls returning 0.)  If _ret_ was accepted, fill _ret_ as given in step 4 and return 2 + _ret_.
7. Go to step 2.

The following changes to the algorithm result in an equivalent algorithm to the algorithm above.

- Replace step 3 with the following: "Choose 0, 1, 2, or 3, uniformly at random."
- In steps 4 and 6, replace "then accept _ret_ with probability 1/2" with "then accept _ret_", because the left and right pieces are each now half as likely to be chosen as the middle piece.
- In step 5, replace "If 1 was chosen by step 3" with "If 1 or 3 was chosen by step 3", for the same reason.

And here is Python code that implements this algorithm.

```
def sum_of_uniform3(bern):
    """ Exact simulation of the sum of three uniform
          random numbers. """
    while True:
       # Choose a piece of the PDF uniformly (but
       # not by area).
       r=4
       while r>=4:
          r=bern.randbit() + bern.randbit() * 2
       bag=[]
       if r==0:
          # Left piece
          if bern.randbit() == 0 and \
             bern.geometric_bag(bag) == 1 and \
             bern.geometric_bag(bag) == 1:
              # Accepted
             return bern.fill_geometric_bag(bag)
       elif r==1 or r==3:
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

<a id=Notes></a>
## Notes

<small><sup id=Note1>(1)</sup> Goyal, V. and Sigman, K., 2012. On simulating a class of Bernstein polynomials. ACM Transactions on Modeling and Computer Simulation (TOMACS), 22(2), pp.1-5.</small>

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
