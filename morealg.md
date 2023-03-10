# More Algorithms for Arbitrary-Precision Sampling

[**Peter Occil**](mailto:poccil14@gmail.com)

**Abstract:** This page contains additional algorithms for arbitrary-precision sampling of distributions, Bernoulli factory algorithms (biased-coin to biased-coin algorithms), and algorithms to produce heads with an irrational probability.  They supplement my pages on Bernoulli factory algorithms and partially-sampled random numbers.

**2020 Mathematics Subject Classification:** 68W20, 60-08, 60-04.

<a id=Introduction></a>
## Introduction

This page contains additional algorithms for arbitrary-precision sampling of distributions, Bernoulli factory algorithms (biased-coin to biased-coin algorithms), and algorithms to produce heads with an irrational probability.  These samplers are designed to not rely on floating-point arithmetic.

The samplers on this page may depend on algorithms given in the following pages:

* [**Partially-Sampled Random Numbers for Accurate Sampling of Continuous Distributions**](https://peteroupc.github.io/exporand.html)
* [**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)

Additional Bernoulli factory algorithms and irrational probability samplers are included here rather than in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)" because that article is quite long as it is.

<a id=About_This_Document></a>
### About This Document

**This is an open-source document; for an updated version, see the** [**source code**](https://github.com/peteroupc/peteroupc.github.io/raw/master/morealg.md) **or its** [**rendering on GitHub**](https://github.com/peteroupc/peteroupc.github.io/blob/master/morealg.md)**.  You can send comments on this document on the** [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues)**.**

My audience for this article is **computer programmers with mathematics knowledge, but little or no familiarity with calculus**.

I encourage readers to implement any of the algorithms given in this page, and report their implementation experiences.  In particular, [**I seek comments on the following aspects**](https://github.com/peteroupc/peteroupc.github.io/issues/18):

- Are the algorithms in this article easy to implement? Is each algorithm written so that someone could write code for that algorithm after reading the article?
- Does this article have errors that should be corrected?
- Are there ways to make this article more useful to the target audience?

Comments on other aspects of this document are welcome.

<a id=Contents></a>
## Contents

- [**Introduction**](#Introduction)
    - [**About This Document**](#About_This_Document)
- [**Contents**](#Contents)
- [**Bernoulli Factories**](#Bernoulli_Factories)
    - [**Certain Piecewise Linear Functions**](#Certain_Piecewise_Linear_Functions)
    - [**Pushdown Automata for Square-Root-Like Functions**](#Pushdown_Automata_for_Square_Root_Like_Functions)
- [**Irrational Probabilities**](#Irrational_Probabilities)
    - [**Ratio of Lower Gamma Functions (&gamma;(_m_, _x_)/&gamma;(_m_, 1)).**](#Ratio_of_Lower_Gamma_Functions_gamma__m___x__gamma__m__1)
    - [**4/(3\*_&pi;_)**](#4_3___pi)
    - [**(1 + exp(_k_)) / (1 + exp(_k_ + 1))**](#1_exp__k__1_exp__k__1)
- [**Sampling Distributions Using Incomplete Information**](#Sampling_Distributions_Using_Incomplete_Information)
- [**Sum of Uniform Random Variates**](#Sum_of_Uniform_Random_Variates)
    - [**About the Uniform Sum Distribution**](#About_the_Uniform_Sum_Distribution)
    - [**Finding Parameters**](#Finding_Parameters)
    - [**Sum of Two Uniform Random Variates**](#Sum_of_Two_Uniform_Random_Variates)
    - [**Sum of Three Uniform Random Variates**](#Sum_of_Three_Uniform_Random_Variates)
- [**Acknowledgments**](#Acknowledgments)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Probability Transformations**](#Probability_Transformations)
    - [**Algorithm for sin(_&lambda;_\*_&pi;_/2)**](#Algorithm_for_sin___lambda_____pi___2)
    - [**Pushdown Automata and Algebraic Functions**](#Pushdown_Automata_and_Algebraic_Functions)
    - [**Sampling Distributions Using Incomplete Information: Omitted Algorithms**](#Sampling_Distributions_Using_Incomplete_Information_Omitted_Algorithms)
- [**License**](#License)

<a id=Bernoulli_Factories></a>
## Bernoulli Factories
&nbsp;

As a reminder, the _Bernoulli factory problem_ is: We're given a coin that shows heads with an unknown probability, _&lambda;_, and the goal is to use that coin (and possibly also a fair coin) to build a "new" coin that shows heads with a probability that depends on _&lambda;_, call it _f_(_&lambda;_).  _f_ is a Bernoulli factory function (or factory function) if this problem can be solved for that function.

This section contains additional algorithms to solve the Bernoulli factory problem for certain kinds of functions.  Such algorithms could be placed in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", but, since that article is quite long as it is, they are included here instead.

In the methods below, _&lambda;_ is the unknown probability of heads of the coin involved in the Bernoulli factory problem.

<a id=Certain_Piecewise_Linear_Functions></a>
### Certain Piecewise Linear Functions

Let _f_(_&lambda;_) be a function of the form min(_&lambda;_\*_mult_, 1&minus;_&epsilon;_). This is a _piecewise linear function_, a function made up of two linear pieces (in this case, the pieces are a rising linear part and a constant part).

This section describes how to calculate the Bernstein coefficients for polynomials that converge from above and below to _f_, based on Thomas and Blanchet (2012\)[^1].  These polynomials can then be used to show heads with probability _f_(_&lambda;_) using the algorithms given in "[**General Factory Functions**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions)".

In this section, **fbelow(_n_, _k_)** and **fabove(_n_, _k_)** are the _k_<sup>th</sup> coefficients (with _k_ starting at 0) of the lower and upper polynomials, respectively, in Bernstein form of degree _n_.

The code at the end of this section uses the computer algebra library SymPy to calculate a list of parameters for a sequence of polynomials converging from above.  The method to do so is called `calc_linear_func(eps, mult, count)`, where `eps` is _&epsilon;_, `mult` = _mult_, and `count` is the number of polynomials to generate.  Each item returned by `calc_linear_func` is a list of two items: the degree of the polynomial, and a _Y parameter_.  The procedure to calculate the required polynomials is then logically as follows (as written, it runs very slowly, though):

1. Set _i_ to 1.
2. Run `calc_linear_func(eps, mult, i)` and get the degree and _Y parameter_ for the last listed item, call them _n_ and _y_, respectively.
3. Set _x_ to &minus;((_y_&minus;(1&minus;_&epsilon;_))/_&epsilon;_)<sup>5</sup>/_mult_ + _y_/_mult_.  (This exact formula doesn't appear in the Thomas and Blanchet paper; rather it comes from the [**supplemental source code**](https://github.com/acthomasca/rberfac/blob/main/rberfac-public-2.R) uploaded by A. C. Thomas at my request.)
4. For degree _n_, **fbelow(_n_, _k_)** is min((_k_/_n_)\*_mult_, 1&minus;_&epsilon;_), and **fabove(_n_, _k_)** is min((_k_/_n_)\*_y_/_x_,_y_).  (**fbelow** matches _f_ because _f_ is _concave_ on the interval [0, 1], which roughly means that its rate of growth there never goes up.)
5. Add 1 to _i_ and go to step 2.

It would be interesting to find general formulas to find the appropriate polynomials (degrees and _Y parameters_) given only the values for _mult_ and _&epsilon;_, rather than find them "the hard way" via `calc_linear_func`.  For this procedure, the degrees and _Y parameters_ can be upper bounds, as long as the sequence of degrees is strictly increasing and the sequence of Y parameters is nowhere increasing.

> **Note:** In Nacu and Peres (2005\)[^2], the following polynomial sequences were suggested to simulate $\min(2\lambda, 1-2\varepsilon)$, provided $\varepsilon \lt 1/8$, where _n_ is a power of 2.  However, with these sequences, an extraordinary number of input coin flips is required to simulate this function each time.
>
> - **fbelow(_n_, _k_)** = $\min(2(k/n), 1-2\varepsilon)$.
> - **fabove(_n_, _k_)** = $\min(2(k/n), 1-2\varepsilon)+$<br> $
 \frac{2\times\max(0, k/n+3\varepsilon - 1/2)}{\varepsilon(2-\sqrt{2})} \sqrt{2/n}+$<br> $\frac{72\times\max(0,k/n-1/9)}{1-\exp(-2\times\varepsilon^2)} \exp(-2n\times\varepsilon^2)$.

SymPy code for piecewise linear functions:

```
def bernstein_n(func, x, n, pt=None):
  # Bernstein operator.
  # Create a polynomial that approximates func, which in turn uses
  # the symbol x.  The polynomial's degree is n and is evaluated
  # at the point pt (or at x if not given).
  if pt==None: pt=x
  ret=0
  v=[binomial(n,j) for j in range(n//2+1)]
  for i in range(0, n+1):
    oldret=ret
    bino=v[i] if i<len(v) else v[n-i]
    ret+=func.subs(x,S(i)/n)*bino*pt**i*(1-pt)**(n-i)
    if pt!=x and ret==oldret and ret>0: break
  return ret

def inflec(y,eps=S(2)/10,mult=2):
  # Calculate the inflection point (x) given y, eps, and mult.
  # The formula is not found in the paper by Thomas and
  # Blanchet 2012, but in
  # the supplemental source code uploaded by
  # A.C. Thomas.
  po=5 # Degree of y-to-x polynomial curve
  eps=S(eps)
  mult=S(mult)
  x=-((y-(1-eps))/eps)**po/mult + y/mult
  return x

def xfunc(y,sym,eps=S(2)/10,mult=2):
  # Calculate Bernstein "control polygon" given y,
  # eps, and mult.
  return Min(sym*y/inflec(y,eps,mult),y)

def calc_linear_func(eps=S(5)/10, mult=1, count=10):
   # Calculates the degrees and Y parameters
   # of a sequence of polynomials that converge
   # from above to min(x*mult, 1-eps).
   # eps must be greater than 0 and less than 1.
   # Default is 10 polynomials.
   polys=[]
   eps=S(eps)
   mult=S(mult)
   count=S(count)
   bs=20
   ypt=1-(eps/4)
   x=symbols('x')
   tfunc=Min(x*mult,1-eps)
   tfn=tfunc.subs(x,(1-eps)/mult).n()
   xpt=xfunc(ypt,x,eps=eps,mult=mult)
   bits=5
   i=0
   lastbxn = 1
   diffs=[]
   while i<count:
     bx=bernstein_n(xpt,x,bits,(1-eps)/mult)
     bxn=bx.n()
     if bxn > tfn and bxn < lastbxn:
       # Dominates target function
       #if oldbx!=None:
       #   diffs.append(bx)
       #   diffs.append(oldbx-bx)
       #oldbx=bx
       oldxpt=xpt
       lastbxn = bxn
       polys.append([bits,ypt])
       print("    [%d,%s]," % (bits,ypt))
       # Find y2 such that y2 < ypt and
       # bernstein_n(oldxpt,x,bits,inflec(y2, ...)) >= y2,
       # so that next Bernstein expansion will go
       # underneath the previous one
       while True:
         ypt-=(ypt-(1-eps))/4
         xpt=inflec(ypt,eps=eps,mult=mult).n()
         bxs=bernstein_n(oldxpt,x,bits,xpt).n()
         if bxs>=ypt.n():
            break
       xpt=xfunc(ypt,x,eps=eps,mult=mult)
       bits+=20
       i+=1
     else:
       bits=int(bits*200/100)
   return polys

calc_linear_func(count=8)
```

<a id=Pushdown_Automata_for_Square_Root_Like_Functions></a>
### Pushdown Automata for Square-Root-Like Functions

In this section, ${n \choose m}$ = choose($n$, $m$) is a binomial coefficient.

The following algorithm extends the square-root construction of Flajolet et al. (2010\)[^3], takes an input coin with probability of heads _&lambda;_ (where 0 &le; _&lambda;_ &lt; 1), and returns 1 with probability&mdash;

$$f(\lambda)=\frac{1-\lambda}{\sqrt{1+4\lambda\mathtt{Coin}(\lambda)(\mathtt{Coin}(\lambda)-1)}} = (1-\lambda)\sum_{n\ge 0} \lambda^n (\mathtt{Coin}(\lambda))^n (1-\mathtt{Coin}(\lambda))^n {2n \choose n}$$  $$= (1-\lambda)\sum_{n\ge 0} (\lambda \mathtt{Coin}(\lambda) (1-\mathtt{Coin}(\lambda)))^n {2n \choose n}$$ $$= \sum_{n\ge 0} (1-\lambda) \lambda^n h_n(\lambda) = \sum_{n\ge 0} g(n, \lambda) h_n(\lambda),$$

and 0 otherwise, where:

- `Coin`(_&lambda;_) is a Bernoulli factory function. If `Coin` is a rational function (a ratio of two polynomials) whose coefficients are rational numbers, then _f_ is an _algebraic function_ (a function that can be a solution of a nonzero polynomial equation) and can be simulated by a _pushdown automaton_, or a state machine with a stack (see the algorithm below and the note that follows it). But this algorithm will still work even if `Coin` is not a rational function.  In the original square-root construction,  `Coin`(_&lambda;_) = 1/2.
- $g(n, \lambda) = (1-\lambda) \lambda^n$; this is the probability of running the `Coin` Bernoulli factory $2 \times n$ times.
- $h_n(\lambda) = (\mathtt{Coin}(\lambda))^n (1-\mathtt{Coin}(\lambda))^n {2n \choose n}$; this is the probability of getting as many ones as zeros from the `Coin` Bernoulli factory.

Equivalently&mdash; $$f(\lambda)=(1-\lambda) OGF(\lambda \mathtt{Coin}(\lambda) (1-\mathtt{Coin}(\lambda))),$$ where $OGF(x) = \sum_{n\ge 0} x^n {2n \choose n}$ is the algorithm's ordinary generating function (also known as counting generating function).

The algorithm follows.

1. Set _d_ to 0.
2. Do the following process repeatedly until this run of the algorithm returns a value:
    1. Flip the input coin.  If it returns 1, go to the next substep.  Otherwise, return either 1 if _d_ is 0, or 0 otherwise.
    2. Run a Bernoulli factory algorithm for `Coin`(_&lambda;_).  If the run returns 1, add 1 to _d_.  Otherwise, subtract 1 from _d_.
    3. Repeat the previous substep.

> **Note:** A _pushdown automaton_ is a state machine that keeps a stack of symbols.  In this document, the input for this automaton is a stream of flips of a coin that shows heads with probability _&lambda;_, and the output is 0 or 1 depending on which state the automaton ends up in when it empties the stack (Mossel and Peres 2005\)[^4].  That paper shows that a pushdown automaton, as defined here, can simulate only _algebraic functions_, that is, functions that can be a solution of a nonzero polynomial equation.  The [**appendix**](#Pushdown_Automata_and_Algebraic_Functions) defines these machines in more detail and has proofs on which algebraic functions are possible with pushdown automata.
>
> As a pushdown automaton, this algorithm (except the "Repeat the previous substep" part) can be expressed as follows. Let the stack have the single symbol EMPTY, and start at the state POS-S1.  Based on the current state, the last coin flip (HEADS or TAILS), and the symbol on the top of the stack, set the new state and replace the top stack symbol with zero, one, or two symbols.  These _transition rules_ can be written as follows:
> - (POS-S1, HEADS, _topsymbol_) &rarr; (POS-S2, {_topsymbol_}) (set state to POS-S2, keep _topsymbol_ on the stack).
> - (NEG-S1, HEADS, _topsymbol_) &rarr; (NEG-S2, {_topsymbol_}).
> - (POS-S1, TAILS, EMPTY) &rarr; (ONE, {}) (set state to ONE, pop the top symbol from the stack).
> - (NEG-S1, TAILS, EMPTY) &rarr; (ONE, {}).
> - (POS-S1, TAILS, X) &rarr; (ZERO, {}).
> - (NEG-S1, TAILS, X) &rarr; (ZERO, {}).
> - (ZERO, _flip_, _topsymbol_) &rarr; (ZERO, {}).
> - (POS-S2, _flip_, _topsymbol_) &rarr; Add enough transition rules to the automaton to simulate _g_(_&lambda;_) by a finite-state machine (only possible if _g_ is rational with rational coefficients (Mossel and Peres 2005\)[^4]).  Transition to POS-S2-ZERO if the machine outputs 0, or POS-S2-ONE if the machine outputs 1.
> - (NEG-S2, _flip_, _topsymbol_) &rarr; Same as before, but the transitioning states are NEG-S2-ZERO and NEG-S2-ONE, respectively.
> - (POS-S2-ONE, _flip_, _topsymbol_) &rarr; (POS-S1, {_topsymbol_, X}) (replace top stack symbol with _topsymbol_, then push X to the stack).
> - (POS-S2-ZERO, _flip_, EMPTY) &rarr; (NEG-S1, {EMPTY, X}).
> - (POS-S2-ZERO, _flip_, X) &rarr; (POS-S1, {}).
> - (NEG-S2-ZERO, _flip_, _topsymbol_) &rarr; (NEG-S1, {_topsymbol_, X}).
> - (NEG-S2-ONE, _flip_, EMPTY) &rarr; (POS-S1, {EMPTY, X}).
> - (NEG-S2-ONE, _flip_, X) &rarr; (NEG-S1, {}).
>
> The machine stops when it removes EMPTY from the stack, and the result is either ZERO (0) or ONE (1).

For the following algorithm, which extends the end of Note 1 of the Flajolet paper, the probability is&mdash; $$f(\lambda)=(1-\lambda) \sum_{n\ge 0} \lambda^{Hn} \mathtt{Coin}(\lambda)^n (1-\mathtt{Coin}(\lambda))^{Hn-n} {Hn \choose n},$$ where _H_ &ge; 2 is an integer; and `Coin` has the same meaning as earlier.

1. Set _d_ to 0.
2. Do the following process repeatedly until this run of the algorithm returns a value:
    1. Flip the input coin.  If it returns 1, go to the next substep.  Otherwise, return either 1 if _d_ is 0, or 0 otherwise.
    2. Run a Bernoulli factory algorithm for `Coin`(_&lambda;_).  If the run returns 1, add (_H_&minus;1) to _d_.  Otherwise, subtract 1 from _d_.

The following algorithm simulates the probability&mdash; $$
f(\lambda) = (1-\lambda) \sum_{n\ge 0} \lambda^n \left( \sum_{m\ge 0} W(n,m) \mathtt{Coin}(\lambda)^m (1-\mathtt{Coin}(\lambda))^{n-m} {n \choose m}\right)$$ $$= (1-\lambda) \sum_{n\ge 0} \lambda^n \left( \sum_{m\ge 0} V(n,m) \mathtt{Coin}(\lambda)^m (1-\mathtt{Coin}(\lambda))^{n-m}\right),$$ where `Coin` has the same meaning as earlier; _W_(_n_, _m_) is 1 if _m_\*_H_ equals (_n_&minus;_m_)\*_T_, or 0 otherwise; and _H_&ge;1 and _T_&ge;1 are integers. (In the first formula, the sum in parentheses is a polynomial in Bernstein form, in the variable `Coin`(_&lambda;_) and with only zeros and ones as coefficients.  Because of the _&lambda;_<sup>_n_</sup>, the polynomial gets smaller as _n_ gets larger.  _V_(_n_, _m_) is the number of _n_-letter words that have _m_ heads _and_ describe a walk that ends at the beginning.)

1. Set _d_ to 0.
2. Do the following process repeatedly until this run of the algorithm returns a value:
    1. Flip the input coin.  If it returns 1, go to the next substep.  Otherwise, return either 1 if _d_ is 0, or 0 otherwise.
    2. Run a Bernoulli factory algorithm for `Coin`(_&lambda;_).  If the run returns 1 ("heads"), add _H_ to _d_.  Otherwise ("tails"), subtract _T_ from _d_.

<a id=Irrational_Probabilities></a>
## Irrational Probabilities

<a id=Ratio_of_Lower_Gamma_Functions_gamma__m___x__gamma__m__1></a>
### Ratio of Lower Gamma Functions (&gamma;(_m_, _x_)/&gamma;(_m_, 1)).

1. Set _ret_ to the result of **kthsmallest** with the two parameters _m_ and _m_.  (Thus, _ret_ is distributed as _u_<sup>1/_m_</sup> where _u_ is a uniform random variate greater than 0 and less than 1; although **kthsmallest** accepts only integers, this formula works for every _m_ greater than 0.)
2. Set _k_ to 1, then set _u_ to point to the same value as _ret_.
3. Generate a uniform(0, 1) random variate _v_.
4. If _v_ is less than _u_: Set _u_ to _v_, then add 1 to _k_, then go to step 3.
5. If _k_ is odd[^5], return a number that is 1 if _ret_ is less than _x_ and 0 otherwise. (If _ret_ is implemented as a uniform partially-sampled random number (PSRN), this comparison should be done via **URandLessThanReal**.)  If _k_ is even[^6], go to step 1.

Derivation:  See Formula 1 in the section "[**Probabilities Arising from Certain Permutations**](https://peteroupc.github.io/bernoulli.html#Probabilities_Arising_from_Certain_Permutations)", where:

- `ECDF(x)`  is the probability that a uniform random variate greater than 0 and less than 1 is _x_ or less, namely _x_ if _x_ is in \[0, 1\], 0 if _x_ is less than 0, and 1 otherwise.
- `DPDF(x)` is the probability density function for the maximum of _m_ uniform random variates in [0, 1], namely _m_\*_x_<sup>_m_&minus;1</sup> if _x_ is in \[0, 1\], and 0 otherwise.

<a id=4_3___pi></a>
### 4/(3\*_&pi;_)

Given that the point (_x_, _y_) has positive coordinates and lies inside a disk of radius 1 centered at (0, 0), the mean value of _x_ is 4/(3\*_&pi;_). This leads to the following algorithm to sample that probability:

1. Generate two PSRNs in the form of a uniformly chosen point inside a 2-dimensional quarter hypersphere (that is, a quarter of a "filled circle"; see "[**Uniform Distribution Inside N-Dimensional Shapes**](https://peteroupc.github.io/morealg.html#Uniform_Distribution_Inside_N_Dimensional_Shapes)" in the article "More Algorithms for Arbitrary-Precision Sampling", as well as the examples there).
2. Let _x_ be one of those PSRNs.  Run **SampleGeometricBag** on that PSRN and return the result (which will be either 0 or 1).

> **Note:** The mean value 4/(3\*_&pi;_) can be derived as follows.  The relative probability that _x_ is "close" to _z_, where $0\le _z_ \le 1$, is _p_(_z_) = sqrt(1 &minus; _z_\*_z_).  Now find the integral ("area under the graph") of _z_\*_p_(_z_)/_c_ (where _c_=_&pi;_/4 is the integral of _p_(_z_) on the interval [0, 1]).  The result is the mean value 4/(3\*_&pi;_).  The following Python code prints this mean value using the SymPy computer algebra library: `p=sqrt(1-z*z); c=integrate(p,(z,0,1)); print(integrate(z*p/c,(z,0,1)));`.

<a id=1_exp__k__1_exp__k__1></a>
### (1 + exp(_k_)) / (1 + exp(_k_ + 1))

This algorithm simulates this probability by computing lower and upper bounds of exp(1), which improve as more and more digits are calculated.  These bounds are calculated through an algorithm by Citterio and Pavani (2016\)[^7].  Note the use of the methodology in Łatuszyński et al. (2009/2011, algorithm 2\)[^8] in this algorithm.  In this algorithm, _k_ must be an integer 0 or greater.

1. If _k_ is 0, run the **algorithm for 2 / (1 + exp(2))** and return the result.  If _k_ is 1, run the **algorithm for (1 + exp(1)) / (1 + exp(2))** and return the result.
2. Generate a uniform(0, 1) random variate, call it _ret_.
3. If _k_ is 3 or greater, return 0 if _ret_ is greater than 38/100, or 1 if _ret_ is less than 36/100.  (This is an early return step.  If _ret_ is implemented as a uniform PSRN, these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
4. Set _d_ to 2.
5. Calculate a lower and upper bound of exp(1) (_LB_ and _UB_, respectively) in the form of rational numbers whose numerator has at most _d_ digits, using the Citterio and Pavani algorithm.  For details, see later.
6. Set _rl_ to (1+_LB_<sup>_k_</sup>) / (1+_UB_<sup>_k_ + 1</sup>), and set _ru_ to (1+_UB_<sup>_k_</sup>) / (1+_LB_<sup>_k_ + 1</sup>); both these numbers should be calculated using rational arithmetic.
7. If _ret_ is greater than _ru_, return 0.  If _ret_ is less than _rl_, return 1.  (If _ret_ is implemented as a uniform PSRN, these comparisons should be done via **URandLessThanReal**.)
8. Add 1 to _d_ and go to step 5.

The following implements the parts of Citterio and Pavani's algorithm needed to calculate lower and upper bounds for exp(1) in the form of rational numbers.

Define the following operations:

- **Setup:** Set _p_ to the list `[0, 1]`, set _q_ to the list `[1, 0]`, set _a_ to the list `[0, 0, 2]` (two zeros, followed by the integer part for exp(1)), set _v_ to 0, and set _av_ to 0.
- **Ensure _n_:** While _v_ is less than or equal to _n_:
    1. (Ensure partial denominator _v_, starting from 0, is available.) If _v_ + 2 is greater than or equal to the size of _a_, append 1, _av_, and 1, in that order, to the list _a_, then add 2 to _av_.
    2. (Calculate convergent _v_, starting from 0.) Append _a_\[_n_+2\] \* _p_\[_n_+1\]+_p_\[_n_\] to the list _p_, and append _a_\[_n_+2\] \* _q_\[_n_+1\]+_q_\[_n_\] to the list _q_. (Positions in lists start at 0.  For example, _p_\[0\] means the first item in _p_; _p_\[1\] means the second; and so on.)
    3. Add 1 to _v_.
- **Get the numerator for convergent _n_:** Ensure _n_, then return _p_\[_n_+2\].
- **Get convergent _n_:** Ensure _n_, then return _p_\[_n_+2\]/_q_\[_n_+2\].
- **Get semiconvergent _n_ given _d_:**
    1. Ensure _n_, then set _m_ to floor(((10<sup>_d_</sup>)&minus;1&minus;_p_\[_n_+1\])/_p_[_n_+2]).
    2. Return (_p_\[_n_+2\] \* _m_ +_p_[_n_+1]) / (_q_\[_n_+2\] \* _m_ +_q_[_n_+1]).

Then the algorithm to calculate lower and upper bounds for exp(1), given _d_, is as follows:

1. Set _i_ to 0, then run the **setup**.
2. **Get the numerator for convergent _i_**, call it _c_. If _c_ is less than 10<sup>_d_</sup>, add 1 to _i_ and repeat this step.  Otherwise, go to the next step.
3. **Get convergent _i_ &minus; 1** and **get semiconvergent _i_ &minus; 1 given _d_**, call them _conv_ and _semi_, respectively.
4. If (_i_ &minus; 1) is odd[^5], return _semi_ as the lower bound and _conv_ as the upper bound.  Otherwise, return _conv_ as the lower bound and _semi_ as the upper bound.

<a id=Sampling_Distributions_Using_Incomplete_Information></a>
## Sampling Distributions Using Incomplete Information

The Bernoulli factory is a special case of the problem of **sampling a probability distribution with unknown parameters**.  This problem can be described as sampling from a new distribution using an _oracle_ (black box) that produces numbers of an incompletely known distribution. In the Bernoulli factory problem, this oracle is a _coin that shows heads or tails where the probability of heads is unknown_.  The rest of this section deals with oracles that go beyond coins.

**Algorithm 1.** Suppose there is an oracle that produces independent random variates on a closed interval \[_a_, _b_\], and these numbers have an unknown mean of _&mu;_. The goal is now to produce nonnegative random variates whose expected value ("long-run average") is _f_(_&mu;_).  Unless _f_ is constant, this is possible if and only if&mdash;

- _f_ is continuous on the closed interval, and
- _f_(_&mu;_) is greater than or equal to _&epsilon;_\*min((_&mu;_ &minus; _a_)<sup>_n_</sup>, (_b_ &minus; _&mu;_)<sup>_n_</sup>) for some integer _n_ and some _&epsilon;_ greater than 0 (loosely speaking, _f_ is nonnegative and neither touches 0 in the interior of the interval nor moves away from 0 more slowly than a polynomial)

(Jacob and Thiery 2015\)[^9]. (Here, _a_ and _b_ are both rational numbers and may be less than 0.)

In the algorithm below, let _K_ be a rational number greater than the maximum value of _f_ on the closed interval [_a_, _b_], and let _g_(_&lambda;_) = _f_(_a_ + (_b_&minus;_a_)\*_&lambda;_)/_K_.

1. Create a _&lambda;_ input coin that does the following: "Take a number from the oracle, call it _x_.  With probability (_x_&minus;_a_)/(_b_&minus;_a_) (see note below), return 1.  Otherwise, return 0."
2. Run a Bernoulli factory algorithm for _g_(_&lambda;_), using the _&lambda;_ input coin.  Then return _K_ times the result.

> **Note:** The check "With probability (_x_&minus;_a_)/(_b_&minus;_a_)" is exact if the oracle produces only rational numbers.  If the oracle can produce irrational numbers (such as numbers that follow a beta distribution or another non-discrete distribution), then the code for the oracle should use uniform [**partially-sampled random numbers (PSRNs)**](https://peteroupc.github.io/exporand.html).  In that case, the check can be implemented as follows.  Let _x_ be a uniform PSRN representing a number generated by the oracle.  Set _y_ to **RandUniformFromReal**(_b_&minus;_a_), then the check succeeds if **URandLess**(_y_, **UniformAddRational**(_x_, &minus;_a_)) returns 1, and fails otherwise.
>
> **Example:** Suppose an oracle produces random variates in the interval [3, 13] with unknown mean _&mu;_, and the goal is to use the oracle to produce nonnegative random variates with mean _f_(_&mu;_) = &minus;319/100 + _&mu;_\*103/50 &minus; _&mu;_<sup>2</sup>*11/100, which is a polynomial with Bernstein coefficients [2, 9, 5] in the given interval.  Then since 8 is greater than the maximum of _f_ in that interval, _g_(_&lambda;_) is a degree-2 polynomial in the interval [0, 1] that has Bernstein coefficients [2/8, 9/8, 5/8].  _g_ can't be simulated as is, though, but increasing _g_'s degree to 3 leads to the Bernstein coefficients [1/4, 5/6, 23/24, 5/8], which are all less than 1 so that the following algorithm can be used (see "[**Certain Polynomials**](https://peteroupc.github.io/bernoulli.html#Certain_Polynomials)"):
>
> 1. Set _heads_ to 0.
> 2. Generate three random variates from the oracle (which must produce random variates in the interval [3, 13]).  For each number _x_: With probability (_x_&minus;3)/(10&minus;3), add 1 to _heads_.
> 3. Depending on _heads_, return 8 (that is, 1 times the upper bound) with the given probability, or 0 otherwise: _heads_=0 &rarr; probability 1/4; 1 &rarr; 5/6; 2 &rarr; 23/24; 3 &rarr; 5/8.

**Algorithm 2.** This algorithm takes an oracle and produces nonnegative random variates whose expected value ("long-run average") is the mean of _f_(_X_), where _X_ is a number produced by the oracle.  The algorithm appears in the appendix, however, because it requires applying an arbitrary function (here, _f_) to a potentially irrational number.

**Algorithm 3.** For this algorithm, see the appendix.

**Algorithm 4.** Say there is an oracle in the form of a fair die.  The number of faces of the die, _n_, is at least 2 but otherwise unknown. Each face shows a different integer 0 or greater and less than _n_.  The question arises: Which probability distributions based on the number of faces can be sampled with this oracle?  This question was studied in the French-language dissertation of R. Duvignau (2015, section 5.2\)[^10], and the following are four of these distributions.

**_Bernoulli 1/n._** It's trivial to generate a Bernoulli variate that is 1 with probability 1/_n_ and 0 otherwise: just take a number from the oracle and return either 1 if that number is 0, or 0 otherwise.  Alternatively, take two numbers from the oracle and return either 1 if both are the same, or 0 otherwise (Duvignau 2015, p. 153\)[^10].

**_Random variate with mean n._** Likewise, it's trivial to generate variates with a mean of _n_: Do "Bernoulli 1/n" trials as described above until a trial returns 0, then return the number of trials done this way.  (This is related to the ambiguously defined "geometric" random variates.)

**_Binomial with parameters n and 1/n._** Using the oracle, the following algorithm generates a binomial variate of this kind (Duvignau 2015, Algorithm 20\)[^10]\:

1. Take items from the oracle until the same item is taken twice.
2. Create a list consisting of the items taken in step 1, except for the last item taken, then shuffle that list.
3. In the shuffled list, count the number of items that didn't change position after being shuffled, then return that number.

**_Binomial with parameters n and k/n._** Duvignau 2015 also includes an algorithm (Algorithm 25) to generate a binomial variate of this kind using the oracle (where _k_ is a known integer such that 0 < _k_ and _k_ &le; _n_):

1. Take items from the oracle until _k_ different items were taken this way.  Let _U_ be a list of these _k_ items, in the order in which they were first taken.
2. Create an empty list _L_.
3. For each integer _i_ in [0, _k_):
    1. Create an empty list _M_.
    2. Take an item from the oracle.  If the item is in _U_ at a position **less than _i_** (positions start at 0), repeat this substep.  Otherwise, if the item is not in _M_, add it to _M_ and repeat this substep.  Otherwise, go to the next substep.
    3. Shuffle the list _M_, then add to _L_ each item that didn't change position after being shuffled (if not already present in _L_).
4. For each integer _i_ in [0, _k_):
    1. Let _P_ be the item at position _i_ in _U_.
    2. Take an item from the oracle.  If the item is in _U_ at position **_i_ or less** (positions start at 0), repeat this substep.
    3. If the last item taken in the previous substep is in _U_ at a position **greater than _i_**, add _P_ to _L_ (if not already present).
5. Return the number of items in _L_.

> **Note:** Duvignau proved a result (Theorem 5.2) that answers the question: Which probability distributions based on the unknown _n_ can be sampled with the oracle?[^11] The result applies to a family of (discrete) distributions with the same unknown parameter _n_, starting with either 1 or a greater integer.  Let Supp(_m_) be the set of values taken on by the distribution with parameter equal to _m_.  Then that family can be sampled using the oracle if and only if:

> - There is a computable function _f_(_k_) that outputs a positive number.
> - For each _n_, Supp(_n_) is included in Supp(_n_+1).
> - For every _k_ and for every _n_ &ge; 2 starting with the first _n_ for which _k_ is in Supp(_n_), the probability of seeing _k_ given parameter _n_ is at least (1/_n_)<sup>_f_(_k_)</sup> (roughly speaking, the probability doesn't decay at a faster than polynomial rate as _n_ increases).

<a id=Sum_of_Uniform_Random_Variates></a>
## Sum of Uniform Random Variates

This page presents new algorithms to sample the sum of uniform(0, 1) random variates and the ratio of two uniform(0, 1) random variates, with the help of [**partially-sampled random numbers**](https://peteroupc.github.io/exporand.html) (PSRNs), with arbitrary precision and without relying on floating-point arithmetic.  See the page on PSRNs for more information on some of the algorithms made use of here, including **SampleGeometricBag** and **FillGeometricBag**.

The algorithms on this page work no matter what base the digits of the partially-sampled number are stored in (such as base 2 for decimal or base 10 for binary), unless noted otherwise.

<a id=About_the_Uniform_Sum_Distribution></a>
### About the Uniform Sum Distribution

The sum of _n_ uniform(0, 1) random variates has the following probability density function (PDF) (see [**MathWorld**](https://mathworld.wolfram.com/UniformSumDistribution.html)):

$$f(x)=\left(\sum_{k=0}^n (-1)^k {n\choose k} (x-k)^{n-1} \text{sign}(x-k)\right)/(2(n-1)!),$$

where ${n\choose k}$ is a _binomial coefficient_, or the number of ways to choose _k_ out of _n_ labeled items, and sign(_x_) is 1 if _x_ is greater than 0, or 0 if _x_ is 0, or &minus;1 is less than 0.[^12][^13][^13]

This is a polynomial of degree _n_ &minus; 1.  For _n_ uniform numbers, the distribution can take on values that are 0 or greater and _n_ or less.

The samplers given below for the uniform sum logically work as follows:

1. The distribution is divided into pieces that are each 1 unit long (thus, for example, if _n_ is 4, there will be four pieces).
2. An integer in \[0, _n_\) is chosen uniformly at random, call it _i_, then the piece identified by _i_ is chosen.  There are [**many algorithms to choose an integer**](https://peteroupc.github.io/randomfunc.html#RNDINT_Random_Integers_in_0_N) this way, but an algorithm that is "optimal" in terms of the number of bits it uses, as well as unbiased, should be chosen.
3. The PDF at \[_i_, _i_ + 1\] is simulated.  This is done by shifting the PDF so the desired piece of the PDF is at \[0, 1\] rather than its usual place.  More specifically, the PDF is now as follows: $$f(x)=\left(\sum_{k=0}^n (-1)^k {n\choose k} ((x+i)-k)^{n-1} \text{sign}((x+i)-k)\right)/(2(n-1)!),$$ where _x_ is a real number in \[0, 1\].  Since _f_&prime; is a polynomial, it can be rewritten in Bernstein form, so that it has _Bernstein coefficients_, which are equivalent to control points describing the shape of the curve drawn out by _f_&prime;. (The Bernstein coefficients are the backbone of the well-known Bézier curve.) A polynomial can be written in Bernstein form as&mdash; $$\sum_{k=0}^m {m\choose k} x^k (1-x)^{m-k} a[k],$$ where _a_\[_k_\] are the control points and _m_ is the polynomial's degree (here, _n_ &minus; 1). In this case, there will be _n_ control points, which together trace out a 1-dimensional Bézier curve.  For example, given control points 0.2, 0.3, and 0.6, the curve is at 0.2 when _x_ = 0, and 0.6 when _x_ = 1.  (Note that the curve is not at 0.3 when _x_ = 1/2; in general, Bézier curves do not cross their control points other than the first and the last.)

    Moreover, this polynomial can be simulated because its Bernstein coefficients all lie in \[0, 1\] (Goyal and Sigman 2012\)[^14].
4. The sampler creates a "coin" made up of a uniform partially-sampled random number (PSRN) whose contents are built up on demand using an algorithm called **SampleGeometricBag**.  It flips this "coin" _n_ &minus; 1 times and counts the number of times the coin returned 1 this way, call it _j_. (The "coin" will return 1 with probability equal to the to-be-determined uniform random variate.)
5. Based on _j_, the sampler accepts the PSRN with probability equal to the control point _a_\[_j_\]. (See (Goyal and Sigman 2012\)[^14].)
6. If the PSRN is accepted, the sampler optionally fills it up with uniform random digits, then sets the PSRN's integer part to _i_, then the sampler returns the finished PSRN.  If the PSRN is not accepted, the sampler starts over from step 2.

<a id=Finding_Parameters></a>
### Finding Parameters

Using the uniform sum sampler for an arbitrary _n_ requires finding the Bernstein control points for each of the _n_ pieces of the uniform sum PDF.  This can be found, for example, with the Python code below, which uses the SymPy computer algebra library.  In the code:

- `unifsum(x,n,v)` calculates the PDF of the sum of `n` uniform random variates when the variable `x` is shifted by `v` units.
- `find_control_points` returns the control points for each piece of the PDF for the sum of `n` uniform random variates, starting with piece 0.
- `find_areas` returns the relative areas for each piece of that PDF.  This can be useful to implement a variant of the sampler above, as detailed later in this section.

```
def unifsum(x,n,v):
    # Builds up the PDF at x (with offset v)
    # of the sum of n uniform random variates
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

The basis matrix is found, for example, as Equation 42 of (Ray and Nataraj 2012\)[^15].

For example, if _n_ = 4 (so a sum of four uniform random variates is desired), the following control points are used for each piece of the PDF:

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
    - Piece 0: 0, 0, ..., 0, 1/((_n_ &minus; 1)!), where (_n_ &minus; 1)! = 1\*2\*3\*...\*(_n_&minus;1).
    - Piece _n_ &minus; 1: 1/((_n_ &minus; 1)!), 0, 0, ..., 0.

If the areas of the PDF's pieces are known in advance (and SymPy makes them easy to find as the `find_areas` method shows), then the sampler could be modified as follows, since each piece is now chosen with probability proportional to the chance that a random variate there will be sampled:

- Step 2 is changed to read: "An integer in \[0, _n_\) is chosen with probability proportional to the corresponding piece's area, call the integer _i_, then the piece identified by _i_ is chosen.  There are many [**algorithms to choose an integer**](https://peteroupc.github.io/randomfunc.html#Weighted_Choice_With_Replacement) this way."
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

<a id=Sum_of_Two_Uniform_Random_Variates></a>
### Sum of Two Uniform Random Variates

The following algorithm samples the sum of two uniform random variates.

1. Create a positive-sign zero-integer-part uniform PSRN (partially-sampled random number), call it _ret_.
2. Generate an unbiased random bit (that is, either 0 or 1, chosen with equal probability).
3. Remove all digits from _ret_.  (This algorithm works for digits of any base, including base 10 for decimal, or base 2 for binary.)
4. Call the **SampleGeometricBag** algorithm on _ret_, then generate an unbiased random bit.
5. If the bit generated in step 2 is 1 and the result of **SampleGeometricBag** is 1, optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _ret_.
6. If the bit generated in step 2 is 0 and the result of **SampleGeometricBag** is 0, optionally fill _ret_ as in step 5, then set _ret_'s integer part to 1, then return _ret_.
7. Go to step 3.

For base 2, the following algorithm also works, using certain "tricks" described in the next section.

1. Generate an unbiased random bit (that is, either 0 or 1, chosen with equal probability), call it _d_.
2. Generate unbiased random bits until 0 is generated this way.  Set _g_ to the number of one-bits generated by this step.
3. Create a positive-sign zero-integer-part uniform PSRN (partially-sampled random number), call it _ret_.  Then, set the digit at position _g_ of the PSRN's fractional part to _d_ (positions start at 0 in the PSRN).
4. Optionally, fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**).  Then set _ret_'s integer part to (1 &minus; _d_), then return _ret_

And here is Python code that implements this algorithm. It uses floating-point arithmetic only at the end, to convert the result to a convenient form, and that it relies on methods from _randomgen.py_ and _bernoulli.py_.

```
def sum_of_uniform(bern, precision=53):
    """ Exact simulation of the sum of two uniform
          random variates. """
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

def sum_of_uniform_base2(bern, precision=53):
    """ Exact simulation of the sum of two uniform
          random variates (base 2). """
    if bern.randbit()==1:
      g=0
      while bern.randbit()==0:
          g+=1
      bag=[None for i in range(g+1)]
      bag[g]=1
      return bern.fill_geometric_bag(bag)
    else:
      g=0
      while bern.randbit()==0:
          g+=1
      bag=[None for i in range(g+1)]
      bag[g]=0
      return bern.fill_geometric_bag(bag) + 1.0
```

<a id=Sum_of_Three_Uniform_Random_Variates></a>
### Sum of Three Uniform Random Variates

The following algorithm samples the sum of three uniform random variates.

1. Create a positive-sign zero-integer-part uniform PSRN, call it _ret_.
2. Choose an integer in [0, 6), uniformly at random. (With this, the left piece is chosen at a 1/6 chance, the right piece at 1/6, and the middle piece at 2/3, corresponding to the relative areas occupied by the three pieces.)
3. Remove all digits from _ret_.
4. If 0 was chosen by step 2, we will sample from the left piece of the function for the sum of three uniform random variates.  This piece runs along the interval \[0, 1\) and is a polynomial with Bernstein coefficients of (0, 1, 1/2) (and is thus a Bézier curve with those control points).  Due to the particular form of the control points, the piece can be sampled in one of the following ways:

    - Call the **SampleGeometricBag** algorithm twice on _ret_.  If both of these calls return 1, then accept _ret_ with probability 1/2.  This is the most "naïve" approach.
    - Call the **SampleGeometricBag** algorithm twice on _ret_.  If both of these calls return 1, then accept _ret_.  This version of the step is still correct since it merely scales the polynomial so its upper bound is closer to 1, which is the top of the left piece, thus improving the acceptance rate of this step.
    - Base-2 only: Call a modified version of **SampleGeometricBag** twice on _ret_; in this modified algorithm, a 1 (rather than any other digit) is sampled from _ret_ when that algorithm reads or writes a digit in _ret_.  Then _ret_ is accepted.  This version will always accept _ret_ on the first try, without rejection, and is still correct because _ret_ would be accepted by this step only if **SampleGeometricBag** succeeds both times, which will happen only if that algorithm reads or writes out a 1 each time (because otherwise the control point is 0, meaning that _ret_ is accepted with probability 0).

    If _ret_ was accepted, optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _ret_.
5. If 2, 3, 4, or 5 was chosen by step 2, we will sample from the middle piece of the PDF, which runs along the interval [1, 2) and is a polynomial with Bernstein coefficients (control points) of (1/2, 1, 1/2).  Call the **SampleGeometricBag** algorithm twice on _ret_.  If neither or both of these calls return 1, then accept _ret_.  Otherwise, if one of these calls returns 1 and the other 0, then accept _ret_ with probability 1/2.  If _ret_ was accepted, optionally fill _ret_ as given in step 4, then set _ret_'s integer part to 1, then return _ret_.
6. If 1 was chosen by step 2, we will sample from the right piece of the PDF, which runs along the interval [2, 3) and is a polynomial with Bernstein coefficients (control points) of (1/2, 0, 0).  Due to the particular form of the control points, the piece can be sampled in one of the following ways:

    - Call the **SampleGeometricBag** algorithm twice on _ret_.  If both of these calls return 0, then accept _ret_ with probability 1/2.  This is the most "naïve" approach.
    - Call the **SampleGeometricBag** algorithm twice on _ret_.  If both of these calls return 0, then accept _ret_.  This version is correct for a similar reason as in step 4.
    - Base-2 only: Call a modified version of **SampleGeometricBag** twice on _ret_; in this modified algorithm, a 0 (rather than any other digit) is sampled from _ret_ when that algorithm reads or writes a digit in _ret_.  Then _ret_ is accepted.  This version is correct for a similar reason as in step 4.

    If _ret_ was accepted, optionally fill _ret_ as given in step 4, then set _ret_'s integer part to 2, then return _ret_.
7. Go to step 3.

And here is Python code that implements this algorithm.

```
def sum_of_uniform3(bern):
    """ Exact simulation of the sum of three uniform
          random variates. """
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

<a id=Acknowledgments></a>
## Acknowledgments

Michael Shoemate gave comments on this article.

<a id=Notes></a>
## Notes

[^1]: Thomas, A.C., Blanchet, J., "[**A Practical Implementation of the Bernoulli Factory**](https://arxiv.org/abs/1106.2508v3)", arXiv:1106.2508v3  [stat.AP], 2012.

[^2]: Nacu, Şerban, and Yuval Peres. "[**Fast simulation of new coins from old**](https://projecteuclid.org/euclid.aoap/1106922322)", The Annals of Applied Probability 15, no. 1A (2005): 93-115.

[^3]: Flajolet, P., Pelletier, M., Soria, M., "[**On Buffon machines and numbers**](https://arxiv.org/abs/0906.5560)", arXiv:0906.5560  [math.PR], 2010

[^4]: Mossel, Elchanan, and Yuval Peres. New coins from old: computing with unknown bias. Combinatorica, 25(6), pp.707-724, 2005.

[^5]: "_x_ is odd" means that _x_ is an integer and not divisible by 2.  This is true if _x_ &minus; 2\*floor(_x_/2) equals 1, or if _x_ is an integer and the least significant bit of abs(_x_) is 1.

[^6]: "_x_ is even" means that _x_ is an integer and divisible by 2.  This is true if _x_ &minus; 2\*floor(_x_/2) equals 0, or if _x_ is an integer and the least significant bit of abs(_x_) is 0.

[^7]: Citterio, M., Pavani, R., "A Fast Computation of the Best k-Digit Rational Approximation to a Real Number", Mediterranean Journal of Mathematics 13 (2016).

[^8]: Łatuszyński, K., Kosmidis, I., Papaspiliopoulos, O., Roberts, G.O., "[**Simulating events of unknown probabilities via reverse time martingales**](https://arxiv.org/abs/0907.4018v2)", arXiv:0907.4018v2 [stat.CO], 2009/2011.

[^9]: Jacob, P.E., Thiery, A.H., "On nonnegative unbiased estimators", Ann. Statist., Volume 43, Number 2 (2015), 769-784.

[^10]: Duvignau, R., 2015. Maintenance et simulation de graphes aléatoires dynamiques (Doctoral dissertation, Université de Bordeaux).

[^11]: There are many distributions that can be sampled using the oracle, by first generating unbiased random bits via randomness extraction methods, but then these distributions won't use the unknown number of faces in general.  Duvignau proved Theorem 5.2 for an oracle that outputs _arbitrary_ but still distinct items, as opposed to integers, but this case can be reduced to the integer case (see section 4.1.3).

[^12]: _Summation notation_, involving the Greek capital sigma (&Sigma;), is a way to write the sum of one or more terms of similar form. For example, $\sum_{k=0}^n g(k)$ means $g(0)+g(1)+...+g(n)$, and $\sum_{k\ge 0} g(k)$ means $g(0)+g(1)+...$.

[^13]: _n_! = 1\*2\*3\*...\*_n_ is also known as _n_ factorial; in this document, (0!) = 1.

[^14]: Goyal, V. and Sigman, K., 2012. On simulating a class of Bernstein polynomials. ACM Transactions on Modeling and Computer Simulation (TOMACS), 22(2), pp.1-5.

[^15]: S. Ray, P.S.V. Nataraj, "A Matrix Method for Efficient Computation of Bernstein Coefficients", _Reliable Computing_ 17(1), 2012.

[^16]: Brassard, G., Devroye, L., Gravel, C., "Remote Sampling with Applications to General Entanglement Simulation", _Entropy_ 2019(21)(92), [**https://doi.org/10.3390/e21010092**](https://doi.org/10.3390/e21010092)

[^17]: Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.

[^18]: Devroye, L., Gravel, C., "[**Random variate generation using only finitely many unbiased, independently and identically distributed random bits**](https://arxiv.org/abs/1502.02539v6)", arXiv:1502.02539v6 [cs.IT], 2020.

[^19]: Keane,  M.  S.,  and  O'Brien,  G.  L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.

[^20]: Łatuszyński, K., Kosmidis, I.,  Papaspiliopoulos, O., Roberts, G.O., "[**Simulating events of unknown probabilities via reverse time martingales**](https://arxiv.org/abs/0907.4018v2)", arXiv:0907.4018v2 [stat.CO], 2009/2011.

[^21]: Lee, A., Doucet, A. and Łatuszyński, K., 2014. "[**Perfect simulation using atomic regeneration with application to Sequential Monte Carlo**](https://arxiv.org/abs/1407.5770v1)", arXiv:1407.5770v1  [stat.CO].

<a id=Appendix></a>
## Appendix

&nbsp;

<a id=Probability_Transformations></a>
### Probability Transformations

The following algorithm takes a uniform partially-sampled random number (PSRN) as a "coin" and flips that "coin" using **SampleGeometricBag**.  Given that "coin" and a function _f_ as described below, the algorithm returns 1 with probability _f_(_U_), where _U_ is the number built up by the uniform PSRN (see also Brassard et al., (2019)[^16], (Devroye 1986, p. 769\)[^17], (Devroye and Gravel 2020\)[^18].  In the algorithm:

-  The uniform PSRN's sign must be positive and its integer part must be 0.
- For correctness, _f_(_U_) must meet the following conditions:
    - If the algorithm will be run multiple times with the same PSRN, _f_(_U_) must be the constant 0 or 1, or be continuous and polynomially bounded on the open interval (0, 1) (polynomially bounded means that both _f_(_U_) and 1&minus;_f_(_U_) are greater than or equal to min(_U_<sup>_n_</sup>, (1&minus;_U_)<sup>_n_</sup>) for some integer _n_ (Keane and O'Brien 1994\)[^19]).
    - Otherwise, _f_(_U_) must map the interval \[0, 1] to \[0, 1] and be continuous everywhere or "almost everywhere".

    The first set of conditions is the same as those for the Bernoulli factory problem (see "[**About Bernoulli Factories**](https://peteroupc.github.io/bernoulli.html#About_Bernoulli_Factories)) and ensure this algorithm is unbiased (see also Łatuszyński et al. (2009/2011)[^20]\).

The algorithm follows.

1. Set _v_ to 0 and _k_ to 1.
2. (_v_ acts as a uniform random variate greater than 0 and less than 1 to compare with _f_(_U_).) Set _v_ to _b_ * _v_ + _d_, where _b_ is the base (or radix) of the uniform PSRN's digits, and _d_ is a digit chosen uniformly at random.
3. Calculate an approximation of _f_(_U_) as follows:
    1. Set _n_ to the number of items (sampled and unsampled digits) in the uniform PSRN's fractional part.
    2. Of the first _n_ digits (sampled and unsampled) in the PSRN's fractional part, sample each of the unsampled digits uniformly at random.  Then let _uk_ be the PSRN's digit expansion up to the first _n_ digits after the point.
    3. Calculate the lowest and highest values of _f_ in the interval \[_uk_, _uk_ + _b_<sup>&minus;_n_</sup>\], call them _fmin_ and _fmax_. If abs(_fmin_ &minus; _fmax_) &le; 2 * _b_<sup>&minus;_k_</sup>, calculate (_fmax_ + _fmin_) / 2 as the approximation.  Otherwise, add 1 to _n_ and go to the previous substep.
4. Let _pk_ be the approximation's digit expansion up to the _k_ digits after the point.  For example, if _f_(_U_) is _&pi;_/5, _b_ is 10, and _k_ is 3, _pk_ is 628.
5. If _pk_ + 1 &le; _v_, return 0. If _pk_ &minus; 2 &ge; _v_, return 1.  If neither is the case, add 1 to _k_ and go to step 2.

> **Notes:**
>
> 1. This algorithm is related to the Bernoulli factory problem, where the input probability is unknown.  However, the algorithm doesn't exactly solve that problem because it has access to the input probability's value to some extent.
> 2. This section appears in the appendix because this article is focused on algorithms that don't rely on calculations of irrational numbers.

<a id=Algorithm_for_sin___lambda_____pi___2></a>
### Algorithm for sin(_&lambda;_\*_&pi;_/2)

The following algorithm returns 1 with probability sin(_&lambda;_\*_&pi;_/2) and 0 otherwise, given a coin that shows heads with probability _&lambda;_.  However, this algorithm appears in the appendix since it requires manipulating irrational numbers, particularly numbers involving _&pi;_.

1. Choose at random an integer _n_ (0 or greater) with probability (_&pi;_/2)<sup>4\*_n_+2</sup>/((4\*_n_+2)!) &minus; (_&pi;_/2)<sup>4\*_n_+4</sup>/((4\*_n_+4)!).
2. Let _v_ = 16\*(_n_+1)\*(4\*_n_+3).
3. Flip the input coin 4\*_n_+4 times.  Let _tails_ be the number of flips that returned 0 this way. (This would be the number of heads if the probability _&lambda;_ were 1 &minus; _&lambda;_.)
4. If _tails_ = 4\*_n_+4, return 0.
5. If _tails_ = 4\*_n_+3, return a number that is 0 with probability 8\*(4\*_n_+3)/(_v_&minus;_&pi;_<sup>2</sup>) and 1 otherwise.
6. If _tails_ = 4\*_n_+2, return a number that is 0 with probability 8/(_v_&minus;_&pi;_<sup>2</sup>) and 1 otherwise.
7. Return 1.

Derivation:  Write&mdash; $$f(\lambda) = \sin(\lambda \pi/2) = 1-g(1-\lambda),$$ where&mdash; $$g(\mu) = 1-\sin((1-\mu) \pi/2)$$ $$= \sum_{n\ge 0} \frac{(\mu\pi/2)^{4n+2}}{(4n+2)!} - \frac{(\mu\pi/2)^{4n+4}}{(4n+4)!}$$ $$= \sum_{n\ge 0} w_n(\mu) = \sum_{n\ge 0} w_n(1) \frac{w_n(\mu)}{w_n(1)}.$$

This is a [**convex combination**](https://peteroupc.github.io/bernoulli.html#Convex_Combinations) of $w_n(1)$ and $\frac{w_n(\mu)}{w_n(1)}$ &mdash; to simulate $g(\mu)$, first an integer _n_ is chosen with probability $w_n(1)$ and then a coin that shows heads with probability $\frac{w_n(\mu)}{w_n(1)}$ is flipped.  Finally, to simulate $f(\lambda)$, the input coin is "inverted" ($\mu = 1-\lambda$), $g(\mu)$ is simulated using the "inverted" coin, and 1 minus the simulation result is returned.

As given above, each term $w_n(\mu)$ is a polynomial in $\mu$, and is strictly increasing and equals 1 or less everywhere on the interval $[0, 1]$, and $w_n(1)$ is a constant so that $\frac{w_n(\mu)}{w_n(1)}$ remains a polynomial.  Each polynomial $\frac{w_n(\mu)}{w_n(1)}$ can be transformed into a polynomial in Bernstein form with the following coefficients: $$(0, 0, ..., 0, 8/(v-\pi^2), 8(4n+3)/(v-\pi^2), 1),$$ where the polynomial is of degree $4n+4$ and so has $4n+5$ coefficients, and $v = \frac{((4n+4)!)\times 2^{4n+4}}{((4n+2)!)\times 2^{4n+2}} = 16 (n+1) (4n+3)$.  These are the coefficients used in steps 4 through 7 of the algorithm above.

> **Note:** sin(_&lambda;_\*_&pi;_/2) = cos((1&minus;_&lambda;_)\*_&pi;_/2).

<a id=Pushdown_Automata_and_Algebraic_Functions></a>
### Pushdown Automata and Algebraic Functions

Moved to [**Supplemental Notes on Bernoulli Factories**](https://peteroupc.github.io/bernsupp.html).

<a id=Sampling_Distributions_Using_Incomplete_Information_Omitted_Algorithms></a>
### Sampling Distributions Using Incomplete Information: Omitted Algorithms

**Algorithm 2.** Suppose there is an _oracle_ that produces independent random real numbers whose expected value ("long-run average") is a known or unknown mean. The goal is now to produce nonnegative random variates whose expected value is the mean of _f_(_X_), where _X_ is a number produced by the oracle.  This is possible whenever&mdash;

- _f_ has a finite lower bound and a finite upper bound on its domain, and
- the mean of _f_(_X_) is not less than _&delta;_, where _&delta;_ is a known rational number greater than 0.

The algorithm to achieve this goal follows (see Lee et al. 2014\)[^21]\:

1. Let _m_ be a rational number equal to or greater than the maximum value of abs(_f_(_&mu;_)) anywhere.  Create a _&nu;_ input coin that does the following: "Take a number from the oracle, call it _x_.  With probability abs(_f_(_x_))/_m_, return a number that is 1 if _f_(_x_) < 0 and 0 otherwise.  Otherwise, repeat this process."
2. Use one of the [**linear Bernoulli factories**](https://peteroupc.github.io/bernoulli.html#lambda____x___y__linear_Bernoulli_factories) to simulate 2\*_&nu;_ (2 times the _&nu;_ coin's probability of heads), using the _&nu;_ input coin, with _&#x03F5;_ = _&delta;_/_m_.  If the factory returns 1, return 0.  Otherwise, take a number from the oracle, call it _&xi;_, and return abs(_f_(_&xi;_)).

> **Example:** An example from Lee et al. (2014\)[^21].  Say the oracle produces uniform random variates in [0, 3\*_&pi;_], and let _f_(_&nu;_) = sin(_&nu;_).  Then the mean of _f_(_X_) is 2/(3\*_&pi;_), which is greater than 0 and found in SymPy by `sympy.stats.E(sin(sympy.stats.Uniform('U',0,3*pi)))`, so the algorithm can produce nonnegative random variates whose expected value ("long-run average") is that mean.
>
> **Notes:**
>
> 1. Averaging to the mean of _f_(_X_) (that is, **E**\[_f_(_X_)] where **E**\[.] means expected or average value) is not the same as averaging to _f_(_&mu;_) where _&mu;_ is the mean of the oracle's numbers (that is, _f_(**E**\[_X_])).  For example, if _X_ is 0 or 1 with equal probability, and _f_(_&nu;_) = exp(&minus;_&nu;_), then **E**\[_f_(_X_)] = exp(0) + (exp(&minus;1) &minus; exp(0))\*(1/2), and _f_(**E**\[_X_]) = _f_(1/2) = exp(&minus;1/2).
> 2. (Lee et al. 2014, Corollary 4\)[^21]\: If _f_(_&mu;_) is known to return only values in the interval [_a_, _c_], the mean of _f_(_X_) is not less than _&delta;_, _&delta;_ > _b_, and _&delta;_ and _b_ are known numbers, then Algorithm 2 can be modified as follows:
>
>     - Use _f_(_&nu;_) = _f_(_&nu;_) &minus; _b_, and use _&delta;_ = _&delta;_ &minus; _b_.
>     - _m_ is taken as max(_b_&minus;_a_, _c_&minus;_b_).
>     - When Algorithm 2 finishes, add _b_ to its return value.
> 3. The check "With probability abs(_f_(_x_))/_m_" is exact if the oracle produces only rational numbers _and_ if _f_(_x_) outputs only rational numbers.  If the oracle or _f_ can produce irrational numbers (such as numbers that follow a beta distribution or another non-discrete distribution), then this check should be implemented using uniform [**partially-sampled random numbers (PSRNs)**](https://peteroupc.github.io/exporand.html).

**Algorithm 3.** Suppose there is an _oracle_ that produces independent random real numbers that are all greater than or equal to _a_ (which is a known rational number), whose mean (_&mu;_) is unknown.  The goal is to use the oracle to produce nonnegative random variates with mean _f_(_&mu;_).  This is possible only if _f_ is 0 or greater everywhere in the interval \[_a_, _&infin;_\) and is nowhere decreasing in that interval (Jacob and Thiery 2015\)[^9].  This can be done using the algorithm below.  In the algorithm:

- _f_(_&mu;_) must be a function that can be written as&mdash;<br>_c_[0]\*_z_<sup>0</sup> + _c_[1]\*_z_<sup>1</sup> + ...,<br>which is an infinite series where _z_ = _&mu;_&minus;_a_ and all _c_\[_i_\] are 0 or greater.
- _&psi;_ is a rational number close to 1, such as 95/100.  (The exact choice is arbitrary and can be less or greater for efficiency purposes, but must be greater than 0 and less than 1.)

The algorithm follows.

1. Set _ret_ to 0, _prod_ to 1, _k_ to 0, and _w_ to 1. (_w_ is the probability of generating _k_ or more random variates in a single run of the algorithm.)
2. If _k_ is greater than 0: Take a number from the oracle, call it _x_, and multiply _prod_ by _x_&minus;_a_.
3. Add _c_\[_k_\]\*_prod_/_w_ to _ret_.
4. Multiply _w_ by _&psi;_ and add 1 to _k_.
5. With probability _&psi;_, go to step 2.  Otherwise, return _ret_.

Now, assume the oracle's numbers are all less than or equal to _b_ (rather than greater than or equal to _a_), where _b_ is a known rational number.  Then _f_ must be 0 or greater everywhere in (&minus;_&infin;_, _b_\] and be nowhere increasing there (Jacob and Thiery 2015\)[^9], and the algorithm above can be used with the following modifications: (1) In the note on the infinite series, _z_ = _b_ &minus;_&mu;_; (2) in step 2, multiply _prod_ by _b_ &minus; _x_ rather than _x_ &minus; _a_.

> **Note:** This algorithm is exact if the oracle produces only rational numbers _and_ if all _c_\[_i_\] are rational numbers.  If the oracle can produce irrational numbers, then they should be implemented using uniform PSRNs.  See also note 3 on Algorithm 2.

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
