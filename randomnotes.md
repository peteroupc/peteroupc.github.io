# More Random Sampling Methods

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=Contents></a>
## Contents

- [**Contents**](#Contents)
    - [**Specific Distributions**](#Specific_Distributions)
        - [**Normal (Gaussian) Distribution**](#Normal_Gaussian_Distribution)
        - [**Gamma Distribution**](#Gamma_Distribution)
        - [**Beta Distribution**](#Beta_Distribution)
        - [**von Mises Distribution**](#von_Mises_Distribution)
        - [**Stable Distribution**](#Stable_Distribution)
        - [**Multivariate Normal (Multinormal) Distribution**](#Multivariate_Normal_Multinormal_Distribution)
        - [**Gaussian and Other Copulas**](#Gaussian_and_Other_Copulas)
        - [**Exponential Distribution: Another Error-Bounded Algorithm**](#Exponential_Distribution_Another_Error_Bounded_Algorithm)
    - [**Weighted Choice with Biased Coins**](#Weighted_Choice_with_Biased_Coins)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Implementation of `erf`**](#Implementation_of_erf)
    - [**A Note on Integer Generation Algorithms**](#A_Note_on_Integer_Generation_Algorithms)
    - [**A Note on Weighted Choice Algorithms**](#A_Note_on_Weighted_Choice_Algorithms)
    - [**Exact, Error-Bounded, and Approximate Algorithms**](#Exact_Error_Bounded_and_Approximate_Algorithms)
- [**License**](#License)

<a id=Specific_Distributions></a>
### Specific Distributions

**Requires random real numbers.**  This section shows algorithms to sample several popular non-uniform distributions.  The algorithms are exact unless otherwise noted, and applications should choose algorithms with either no error (including rounding error) or a user-settable error bound.  See the [**appendix**](#Exact_Error_Bounded_and_Approximate_Algorithms) for more information.

<a id=Normal_Gaussian_Distribution></a>
#### Normal (Gaussian) Distribution

The [**_normal distribution_**](https://en.wikipedia.org/wiki/Normal_distribution) (also called the Gaussian distribution) takes the following two parameters:
- `mu` (&mu;) is the mean (average), or where the peak of the distribution's "bell curve" is.
- `sigma` (&sigma;), the standard deviation, affects how wide the "bell curve" appears. The
probability that a normally-distributed random number will be within one standard deviation from the mean is about 68.3%; within two standard deviations (2 times `sigma`), about 95.4%; and within three standard deviations, about 99.7%.  (Some publications give &sigma;<sup>2</sup>, or variance, rather than standard deviation, as the second parameter.  In this case, the standard deviation is the variance's square root.)

There are a number of methods for sampling the normal distribution. An application can combine some or all of these.

1. The ratio-of-uniforms method (given as `NormalRatioOfUniforms` below).
2. In the _Box&ndash;Müller transformation_, `mu + radius * cos(angle)` and `mu + radius * sin(angle)`, where `angle = RNDRANGEMaxExc(0, 2 * pi)` and `radius = sqrt(Expo(0.5)) * sigma`, are two independent normally-distributed random numbers.  The polar method (given as `NormalPolar` below) likewise produces two independent normal random numbers at a time.
3. Karney's algorithm to sample from the normal distribution, in a manner that minimizes approximation error and without using floating-point numbers (Karney 2014)<sup>[**(1)**](#Note1)</sup>.
4. The following are approximations to the normal distribution:
    - The sum of twelve `RNDRANGEMaxExc(0, sigma)` numbers (see Note 13), subtracted by 6 * `sigma`. See `NormalCLT` below, which also includes an optional step to "warp" the random number for better accuracy (Kabal 2000/2019)<sup>[**(2)**](#Note2)</sup> See also [**"Irwin&ndash;Hall distribution" on Wikipedia**](https://en.wikipedia.org/wiki/Irwin%E2%80%93Hall_distribution).  D. Thomas (2014)<sup>[**(3)**](#Note3)</sup>, describes a more general approximation called CLT<sub>k</sub>, which combines `k` uniform random numbers as follows: `RNDU01() - RNDU01() + RNDU01() - ...`.
    - [**Inversions**](#Inverse_Transform_Sampling) of the normal distribution's cumulative distribution function (CDF), including those by Wichura, by Acklam, and by Luu (Luu 2016)<sup>[**(4)**](#Note4)</sup>.  See also [**"A literate program to compute the inverse of the normal CDF"**](https://www.johndcook.com/blog/normal_cdf_inverse/).  Notice that the normal distribution's inverse CDF has no closed form.

For surveys of Gaussian samplers, see (Thomas et al. 2007)<sup>[**(5)**](#Note5)</sup>, and (Malik and Hemani 2016)<sup>[**(6)**](#Note6)</sup>.

    METHOD NormalRatioOfUniforms(mu, sigma)
        while true
            a=RNDU01ZeroExc()
            b=RNDRANGE(0,sqrt(2.0/exp(1.0)))
            if b*b <= -a * a * 4 * ln(a)
              return (RNDINT(1) * 2 - 1) *
                (b * sigma / a) + mu
            end
        end
    END METHOD

    METHOD NormalPolar(mu, sigma)
      while true
        a = RNDU01ZeroExc()
        b = RNDU01ZeroExc()
        if RNDINT(1) == 0: a = 0 - a
        if RNDINT(1) == 0: b = 0 - b
        c = a * a + b * b
        if c != 0 and c <= 1
           c = sqrt(-ln(c) * 2 / c)
           return [a * sigma * c + mu, b * sigma * c + mu]
        end
      end
    END METHOD

    METHOD NormalCLT(mu, sigma)
      sum = 0
      for i in 0...12: sum=sum+RNDRANGEMaxExc(0, sigma)
      sum = sum - 6*sigma
      // Optional: "Warp" the sum for better accuracy
      ssq = sum * sum
      sum = ((((0.0000001141*ssq - 0.0000005102) *
                ssq + 0.00007474) *
                ssq + 0.0039439) *
                ssq + 0.98746) * sum
      return sum + mu
     end
    END METHOD

> **Notes:**
>
> 1. The _standard normal distribution_ is implemented as `Normal(0, 1)`.
> 2. Methods implementing a variant of the normal distribution, the _discrete Gaussian distribution_, generate _integers_ that closely follow the normal distribution.  Examples include the one in (Karney 2014)<sup>[**(1)**](#Note1)</sup>, an improved version in (Du et al. 2020)<sup>[**(7)**](#Note7)</sup>, as well as so-called "constant-time" methods such as (Micciancio and Walter 2017)<sup>[**(8)**](#Note8)</sup> that are used above all in _lattice-based cryptography_.

<a id=Gamma_Distribution></a>
#### Gamma Distribution

The following method generates a random number that follows a _gamma distribution_ and is based on Marsaglia and Tsang's method from 2000<sup>[**(9)**](#Note9)</sup> (which is an approximate but simple algorithm) and (Liu et al. 2015)<sup>[**(10)**](#Note10)</sup>.  Usually, the number expresses either&mdash;

- the lifetime (in days, hours, or other fixed units) of a random component with an average lifetime of `meanLifetime`, or
- a random amount of time (in days, hours, or other fixed units) that passes until as many events as `meanLifetime` happen.

Here, `meanLifetime` must be an integer or noninteger greater than 0, and `scale` is a scaling parameter that is greater than 0, but usually 1 (the random gamma number is multiplied by `scale`).

    METHOD GammaDist(meanLifetime, scale)
        // Needs to be greater than 0
        if meanLifetime <= 0 or scale <= 0: return error
        // Exponential distribution special case if
        // `meanLifetime` is 1 (see also (Devroye 1986), p. 405)
        if meanLifetime == 1: return Expo(1.0 / scale)
        if meanLifetime < 0.3 // Liu, Martin, Syring 2015
           lamda = (1.0/meanLifetime) - 1
           w = meanLifetime / (1-meanLifetime) * exp(1)
           r = 1.0/(1+w)
           while true
                z = 0
                x = RNDU01()
                if x <= r: z = -ln(x/r)
                else: z = -Expo(lamda)
                ret = exp(-z/meanLifetime)
                eta = 0
                if z>=0: eta=exp(-z)
                else: eta=w*lamda*exp(lamda*z)
                if RNDRANGE(0, eta) < exp(-ret-z): return ret * scale
           end
        end
        d = meanLifetime
        v = 0
        if meanLifetime < 1: d = d + 1
        d = d - (1.0 / 3) // NOTE: 1.0 / 3 must be a fractional number
        c = 1.0 / sqrt(9 * d)
        while true
            x = 0
            while true
               x = Normal(0, 1)
               v = c * x + 1;
               v = v * v * v
               if v > 0: break
            end
            u = RNDU01ZeroExc()
            x2 = x * x
            if u < 1 - (0.0331 * x2 * x2): break
            if ln(u) < (0.5 * x2) + (d * (1 - v + ln(v))): break
        end
        ret = d * v
        if meanLifetime < 1
           ret = ret * pow(RNDU01(), 1.0 / meanLifetime)
        end
        return ret * scale
    END METHOD

> **Note:** The following is a useful identity for the gamma distribution: `GammaDist(a) = BetaDist(a, b - a) * GammaDist(b)` (Chen et al. 2020)<sup>[**(11)**](#Note11)</sup>.

<a id=Beta_Distribution></a>
#### Beta Distribution

The beta distribution is a bounded-domain probability distribution; its two parameters, `a` and `b`, are both greater than 0 and describe the distribution's shape.  Depending on `a` and `b`, the shape can be a smooth peak or a smooth valley.

The following method generates a random number that follows a _beta distribution_, in the interval [0, 1).

    METHOD BetaDist(a, b)
      if b==1 and a==1: return RNDU01()
      // Min-of-uniform
      if a==1: return 1.0-pow(RNDU01(),1.0/b)
      // Max-of-uniform.  Use only if a is small to
      // avoid accuracy problems, as pointed out
      // by Devroye 1986, p. 675.
      if b==1 and a < 10: return pow(RNDU01(),1.0/a)
      x=GammaDist(a,1)
      return x/(x+GammaDist(b,1))
    END METHOD

I give an [**error-bounded sampler**](https://peteroupc.github.io/exporand.html) for the beta distribution (when `a` and `b` are both 1 or greater) in a separate page.

<a id=von_Mises_Distribution></a>
#### von Mises Distribution

The _von Mises distribution_ describes a distribution of circular angles and uses two parameters: `mean` is the mean angle and `kappa` is a shape parameter.  The distribution is uniform at `kappa = 0` and approaches a normal distribution with increasing `kappa`.

The algorithm below generates a random number from the von Mises distribution, and is based on the Best&ndash;Fisher algorithm from 1979 (as described in (Devroye 1986)<sup>[**(12)**](#Note12)</sup> with errata incorporated).

    METHOD VonMises(mean, kappa)
        if kappa < 0: return error
        if kappa == 0
            return RNDRANGEMinMaxExc(mean-pi, mean+pi)
        end
        r = 1.0 + sqrt(4 * kappa * kappa + 1)
        rho = (r - sqrt(2 * r)) / (kappa * 2)
        s = (1 + rho * rho) / (2 * rho)
        while true
            u = RNDRANGEMaxExc(-pi, pi)
            v = RNDU01ZeroOneExc()
            z = cos(u)
            w = (1 + s*z) / (s + z)
            y = kappa * (s - w)
            if y*(2 - y) - v >=0 or ln(y / v) + 1 - y >= 0
               if angle<-1: angle=-1
               if angle>1: angle=1
               // NOTE: Inverse cosine replaced here
               // with `atan2` equivalent
               angle = atan2(sqrt(1-w*w),w)
               if u < 0: angle = -angle
               return mean + angle
            end
        end
    END METHOD

<a id=Stable_Distribution></a>
#### Stable Distribution

As more and more independent random numbers, generated the same way, are added together, their distribution tends to a [**_stable distribution_**](https://en.wikipedia.org/wiki/Stable_distribution), which resembles a curve with a single peak, but with generally "fatter" tails than the normal distribution.  (Here, the stable distribution means the "alpha-stable distribution".) The pseudocode below uses the Chambers&ndash;Mallows&ndash;Stuck algorithm.  The `Stable` method, implemented below, takes two parameters:

- `alpha` is a stability index in the interval (0, 2].
- `beta` is an asymmetry parameter in the interval [-1, 1]; if `beta` is 0, the curve is symmetric.

&nbsp;

    METHOD Stable(alpha, beta)
        if alpha <=0 or alpha > 2: return error
        if beta < -1 or beta > 1: return error
        halfpi = pi * 0.5
        unif=RNDRANGEMinMaxExc(-halfpi, halfpi)
        c=cos(unif)
        if alpha == 1
           s=sin(unif)
           if beta == 0: return s/c
           expo=Expo(1)
           return 2.0*((unif*beta+halfpi)*s/c -
             beta * ln(halfpi*expo*c/(unif*beta+halfpi)))/pi
        else
           z=-tan(alpha*halfpi)*beta
           ug=unif+atan2(-z, 1)/alpha
           cpow=pow(c, -1.0 / alpha)
           return pow(1.0+z*z, 1.0 / (2*alpha))*
              (sin(alpha*ug)*cpow)*
              pow(cos(unif-alpha*ug)/expo, (1.0 - alpha) / alpha)
        end
    END METHOD

Methods implementing the strictly geometric stable and general geometric stable distributions are shown below (Kozubowski 2000)<sup>[**(13)**](#Note13)</sup>.  Here, `alpha` is in (0, 2], `lamda` is greater than 0, and `tau`'s absolute value is min(1, 2/`alpha` - 1).  The result of `GeometricStable` is a symmetric Linnik distribution if `tau = 0`, or a Mittag&ndash;Leffler distribution if `tau = 1` and `alpha < 1`.

    METHOD GeometricStable(alpha, lamda, tau)
       rho = alpha*(1-tau)/2
       sign = -1
       if RNDINT(1)==0 or RNDU01() < tau
           rho = alpha*(1+tau)/2
           sign = 1
       end
       w = 1
       if rho != 1
          rho = rho * pi
          cotparam = RNDRANGE(0, rho)
          w = sin(rho)*cos(cotparam)/sin(cotparam)-cos(rho)
       end
       return Expo(1) * sign * pow(lamda*w, 1.0/alpha)
    END METHOD

    METHOD GeneralGeoStable(alpha, beta, mu, sigma)
       z = Expo(1)
       if alpha == 1: return mu*z+Stable(alpha, beta)*sigma*z+
              sigma*z*beta*2*pi*ln(sigma*z)
       else: return mu*z+
              Stable(alpha, beta)*sigma*pow(z, 1.0/alpha)
    END METHOD

<a id=Multivariate_Normal_Multinormal_Distribution></a>
#### Multivariate Normal (Multinormal) Distribution

The following pseudocode calculates a random vector (list of numbers) that follows a [**_multivariate normal (multinormal) distribution_**](https://en.wikipedia.org/wiki/Multivariate_normal_distribution).  The method `MultivariateNormal` takes the following parameters:

- A list, `mu` (&mu;), which indicates the means to add to the random vector's components. `mu` can be `nothing`, in which case each component will have a mean of zero.
- A list of lists `cov`, that specifies a _covariance matrix_ (&Sigma;, a symmetric positive definite N&times;N matrix, where N is the number of components of the random vector).

&nbsp;

    METHOD Decompose(matrix)
      numrows = size(matrix)
      if size(matrix[0])!=numrows: return error
      // Does a Cholesky decomposition of a matrix
      // assuming it's positive definite and invertible
      ret=NewList()
      for i in 0...numrows
        submat = NewList()
        for j in 0...numrows: AddItem(submat, 0)
        AddItem(ret, submat)
      end
      s1 = sqrt(matrix[0][0])
      if s1==0: return ret // For robustness
      for i in 0...numrows
        ret[0][i]=matrix[0][i]*1.0/s1
      end
      for i in 0...numrows
        msum=0.0
        for j in 0...i: msum = msum + ret[j][i]*ret[j][i]
        sq=matrix[i][i]-msum
        if sq<0: sq=0 // For robustness
        ret[i][i]=math.sqrt(sq)
      end
      for j in 0...numrows
        for i in (j + 1)...numrows
          // For robustness
          if ret[j][j]==0: ret[j][i]=0
          if ret[j][j]!=0
            msum=0
            for k in 0...j: msum = msum + ret[k][i]*ret[k][j]
            ret[j][i]=(matrix[j][i]-msum)*1.0/ret[j][j]
          end
        end
      end
      return ret
    END METHOD

    METHOD MultivariateNormal(mu, cov)
      mulen=size(cov)
      if mu != nothing
        mulen = size(mu)
        if mulen!=size(cov): return error
        if mulen!=size(cov[0]): return error
      end
      // NOTE: If multiple random points will
      // be generated using the same covariance
      // matrix, an implementation can consider
      // precalculating the decomposed matrix
      // in advance rather than calculating it here.
      cho=Decompose(cov)
      i=0
      ret=NewList()
      vars=NewList()
      for j in 0...mulen: AddItem(vars, Normal(0, 1))
      while i<mulen
        nv=Normal(0,1)
        msum = 0
        if mu == nothing: msum=mu[i]
        for j in 0...mulen: msum=msum+vars[j]*cho[j][i]
        AddItem(ret, msum)
        i=i+1
      end
      return ret
    end

> **Note:** The [**Python sample code**](https://peteroupc.github.io/randomgen.zip) contains a variant of this
> method for generating multiple random vectors in one call.
>
> **Examples:**
>
> 1. A **binormal distribution** (two-variable multinormal distribution) can be sampled using the following idiom: `MultivariateNormal([mu1, mu2], [[s1*s1, s1*s2*rho], [rho*s1*s2, s2*s2]])`, where `mu1` and `mu2` are the means of the two normal random numbers, `s1` and `s2` are their standard deviations, and `rho` is a _correlation coefficient_ greater than -1 and less than 1 (0 means no correlation).
> 2. **Log-multinormal distribution**: Generate a multinormal random vector, then apply `exp(n)` to each component `n`.
> 3. A **Beckmann distribution**: Generate a random binormal vector `vec`, then apply `Norm(vec)` to that vector.
> 4. A **Rice (Rician) distribution** is a Beckmann distribution in which the binormal random pair is generated with `m1 = m2 = a / sqrt(2)`, `rho = 0`, and `s1 = s2 = b`, where `a` and `b` are the parameters to the Rice distribution.
> 5. **Rice&ndash;Norton distribution**: Generate `vec = MultivariateNormal([v,v,v],[[w,0,0],[0,w,0],[0,0,w]])` (where `v = a/sqrt(m*2)`, `w = b*b/m`, and `a`, `b`, and `m` are the parameters to the Rice&ndash;Norton distribution), then apply `Norm(vec)` to that vector.
> 6. A **standard** [**complex normal distribution**](https://en.wikipedia.org/wiki/Complex_normal_distribution) is a binormal distribution in which the binormal random pair is generated with `s1 = s2 = sqrt(0.5)` and `mu1 = mu2 = 0` and treated as the real and imaginary parts of a complex number.
> 7. **Multivariate Linnik distribution**: Generate a multinormal random vector, then multiply each component by `GeometricStable(alpha/2.0, 1, 1)`, where `alpha` is a parameter in (0, 2] (Kozubowski 2000)<sup>[**(13)**](#Note13)</sup>.

<a id=Gaussian_and_Other_Copulas></a>
#### Gaussian and Other Copulas

A _copula_ is a way to describe the dependence between random numbers.

One example is a _Gaussian copula_; this copula is sampled by sampling from a [**multinormal distribution**](#Multivariate_Normal_Multinormal_Distribution), then converting the resulting numbers to _dependent_ uniform random numbers. In the following pseudocode, which implements a Gaussian copula:

- The parameter `covar` is the covariance matrix for the multinormal distribution.
- `erf(v)` is the [**error function**](https://en.wikipedia.org/wiki/Error_function) of the number `v` (see the appendix).

&nbsp;

    METHOD GaussianCopula(covar)
       mvn=MultivariateNormal(nothing, covar)
       for i in 0...size(covar)
          // Apply the normal distribution's CDF
          // to get uniform random numbers
          mvn[i] = (erf(mvn[i]/(sqrt(2)*sqrt(covar[i][i])))+1)*0.5
       end
       return mvn
    END METHOD

Each of the resulting uniform random numbers will be in the interval [0, 1], and each one can be further transformed to any other probability distribution (which is called a _marginal distribution_ here) by taking the quantile of that uniform number for that distribution (see "[**Inverse Transform Sampling**](https://peteroupc.github.io/randomfunc.html#Inverse_Transform_Sampling)", and see also (Cario and Nelson 1997)<sup>[**(14)**](#Note14)</sup>.)

> **Examples:**
>
> 1. To generate two correlated uniform random numbers with a Gaussian copula, generate `GaussianCopula([[1, rho], [rho, 1]])`, where `rho` is the Pearson correlation coefficient, in the interval [-1, 1]. (Other correlation coefficients besides `rho` exist. For example, for a two-variable Gaussian copula, the [**Spearman correlation coefficient**](https://en.wikipedia.org/wiki/Rank_correlation) `srho` can be converted to `rho` by `rho = sin(srho * pi / 6) * 2`.  Other correlation coefficients, and other measures of dependence between random numbers, are not further discussed in this document.)
> 2. The following example generates two random numbers that follow a Gaussian copula with exponential marginals (`rho` is the Pearson correlation coefficient, and `rate1` and `rate2` are the rates of the two exponential marginals).
>
>         METHOD CorrelatedExpo(rho, rate1, rate2)
>            copula = GaussianCopula([[1, rho], [rho, 1]])
>            // Transform to exponentials using that
>            // distribution's quantile function
>            return [-log1p(-copula[0]) / rate1,
>              -log1p(-copula[1]) / rate2]
>         END METHOD
>
> **Note:** The Gaussian copula is also known as the _normal-to-anything_ method.

Other kinds of copulas describe different kinds of dependence between random numbers.  Examples of other copulas are&mdash;

- the **Fr&eacute;chet&ndash;Hoeffding upper bound copula** _\[x, x, ..., x\]_ (e.g., `[x, x]`), where `x = RNDU01()`,
- the **Fr&eacute;chet&ndash;Hoeffding lower bound copula** `[x, 1.0 - x]` where `x = RNDU01()`,
- the **product copula**, where each number is a separately generated `RNDU01()` (indicating no dependence between the numbers), and
- the **Archimedean copulas**, described by M. Hofert and M. M&auml;chler (2011)<sup>[**(15)**](#Note15)</sup>.

<a id=Exponential_Distribution_Another_Error_Bounded_Algorithm></a>
#### Exponential Distribution: Another Error-Bounded Algorithm

The following method samples from an exponential distribution with a &lambda; parameter greater than 0, expressed as `lnum`/`lden` (where the sampling occurs within an error tolerance of 2<sup>`-precision`</sup>).  For more information, see "[**Partially-Sampled Random Numbers**](https://peteroupc.github.io/exporand.html)".

    METHOD ZeroOrOneExpMinus(x, y)
      // Generates 1 with probability exp(-x/y) (Canonne et al. 2020)
      if y <= 0 or x<0: return error
      if x==0: return 1 // exp(0) = 1
      if x > y
        xf = floor(x/y)
        x = mod(x, y)
        if x>0 and ZeroOrOneExpMinus(x, y) == 0: return 0
        for i in 0...xf
          if ZeroOrOneExpMinus(1,1) == 0: return 0
        end
        return 1
      end
      r = 1
      oy = y
      while true
        if ZeroOrOne(x, y) == 0: return r
        r=1-r
        y = y + oy
      end
    END METHOD

    METHOD LogisticExp(lnum, lden, prec)
        // Generates 1 with probability 1/(exp(2^-prec)+1).
        // References: Alg. 6 of Morina et al. 2019; Carinne et al. 2020.
        denom=pow(2,prec)*lden
        while true
           if RNDINT(1)==0: return 0
           if ZeroOrOneExpMinus(lnum, denom) == 1: return 1
        end
    END METHOD

    METHOD ExpoExact(lnum, lden, precision)
       ret=0
       for i in 1..precision
        if LogisticExp(lnum, lden, i)==1: ret=ret+pow(2,-i)
       end
       while ZeroOrOneExpMinus(lnum,lden)==1: ret=ret+1
       return ret
    END METHOD

> **Note:** After `ExpoExact` is used to generate a random number, an application can append additional binary digits (such as `RNDINT(1)`) to the end of that number while remaining accurate to the given precision (Karney 2014)<sup>[**(1)**](#Note1)</sup>.

<a id=Weighted_Choice_with_Biased_Coins></a>
### Weighted Choice with Biased Coins

**Coins of Known Bias:** If we only have a list of probabilities (`probs`) that sum to 1, as well as `UnfairCoin(p)`, which returns 1 with a given probability `p` and zero otherwise (such as `ZeroOrOne` or `RNDU01() < p`), one of the following two algorithms chooses an integer at random according to its probability (see the [**_Stack Overflow_ question**](https://stackoverflow.com/questions/62806441/can-i-achieve-weighted-randomness-with-a-function-that-returns-weighted-booleans) by Daniel Kaplan).  However, since we can treat `UnfairCoin(q)` (for any fixed value of `q` in (0, 1)) as a coin with _unknown_ bias in this case, these algorithms are only given for completeness. The algorithms are error-bounded when all the probabilities in `probs` are rational numbers. The **first algorithm** uses iteration and is as follows: `cumu = 1.0; for i in 0...size(probs): if UnfairCoin(probs[i]/cumu)==1: return i; else: cumu = cumu - probs[i]`.  For a proof of its correctness, see "[**Darts, Dice, and Coins**](https://www.keithschwarz.com/darts-dice-coins/)" by Keith Schwarz.  The **second algorithm** is the _Bernoulli race_: `while true; y=RNDINT(size(probs)-1); if UnfairCoin(probs[y])==1: return y; else continue; end`, where `UnfairCoin(0.5)` serves as the source of random numbers for `RNDINT`.

<a id=Notes></a>
## Notes

- <small><sup id=Note1>(1)</sup> Karney, C.F.F., "[**Sampling exactly from the normal distribution**](https://arxiv.org/abs/1303.6257v2)", arXiv:1303.6257v2  [physics.comp-ph], 2014.</small>
- <small><sup id=Note2>(2)</sup> Kabal, P., "Generating Gaussian Pseudo-Random Variates", McGill University, 2000/2019.</small>
- <small><sup id=Note3>(3)</sup> Thomas, D.B., 2014, May. FPGA Gaussian random number generators with guaranteed statistical accuracy. In _2014 IEEE 22nd Annual International Symposium on Field-Programmable Custom Computing Machines_ (pp. 149-156).</small>
- <small><sup id=Note4>(4)</sup> Luu, T., "Fast and Accurate Parallel Computation of Quantile Functions for Random Number Generation", Dissertation, University College London, 2016.</small>
- <small><sup id=Note5>(5)</sup> Thomas, D., et al., "Gaussian Random Number Generators", _ACM Computing Surveys_ 39(4), 2007.</small>
- <small><sup id=Note6>(6)</sup> Malik, J.S., Hemani, A., "Gaussian random number generation: A survey on hardware architectures", _ACM Computing Surveys_ 49(3), 2016.</small>
- <small><sup id=Note7>(7)</sup> Yusong Du, Baoying Fan, and Baodian Wei, "[**An Improved Exact Sampling Algorithm for the Standard Normal Distribution**](https://arxiv.org/abs/2008.03855)", arXiv:2008.03855 [cs.DS], 2020.</small>
- <small><sup id=Note8>(8)</sup> Micciancio, D. and Walter, M., "Gaussian sampling over the integers: Efficient, generic, constant-time", in Annual International Cryptology Conference, August 2017 (pp. 455-485).</small>
- <small><sup id=Note9>(9)</sup> "A simple method for generating gamma variables", _ACM Transactions on Mathematical Software_ 26(3), 2000.</small>
- <small><sup id=Note10>(10)</sup> Liu, C., Martin, R., Syring, N., "[**Simulating from a gamma distribution with small shape parameter**](https://arxiv.org/abs/1302.1884v3)", arXiv:1302.1884v3  [stat.CO], 2015.</small>
- <small><sup id=Note11>(11)</sup> Chen, S., Luo, F. and Hu, C., 2020. [**A Novel Gamma Distributed Random Variable (RV) Generation Method for Clutter Simulation with Non-Integral Shape Parameters**](https://res.mdpi.com/d_attachment/sensors/sensors-20-00955/article_deploy/sensors-20-00955-v2.pdf). _Sensors_, 20(4), p.955.</small>
- <small><sup id=Note12>(12)</sup> Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.</small>
- <small><sup id=Note13>(13)</sup> Tomasz J. Kozubowski, "Computer simulation of geometric stable distributions", _Journal of Computational and Applied Mathematics_ 116(2), 2000.</small>
- <small><sup id=Note14>(14)</sup> Cario, M. C., B. L. Nelson, "Modeling and generating random vectors with arbitrary marginal distributions and correlation matrix", 1997.</small>
- <small><sup id=Note15>(15)</sup> Hofert, M., and Maechler, M.  "Nested Archimedean Copulas Meet R: The nacopula Package".  _Journal of Statistical Software_ 39(9), 2011, pp. 1-20.</small>
- <small><sup id=Note16>(16)</sup> Knuth, Donald E. and Andrew Chi-Chih Yao. "The complexity of nonuniform random number generation", in _Algorithms and Complexity: New Directions and Recent Results_, 1976.</small>
- <small><sup id=Note17>(17)</sup> This is because the binary entropy of `p = 1/n` is `p * log2(1/p) = log2(n) / n`, and the sum of `n` binary entropies (for `n` outcomes with probability `1/n` each) is `log2(n)`.  Any optimal integer generation algorithm will come within 2 bits of this lower bound on average.</small>
- <small><sup id=Note18>(18)</sup> D. Lemire, "A fast alternative to the modulo reduction", Daniel Lemire's blog, 2016.</small>
- <small><sup id=Note19>(19)</sup> Lemire, D., "[**Fast Random Integer Generation in an Interval**](https://arxiv.org/abs/1805.10941v4)", arXiv:1805.10941v4  [cs.DS], 2018.</small>
- <small><sup id=Note20>(20)</sup> Lumbroso, J., "[**Optimal Discrete Uniform Generation from Coin Flips, and Applications**](https://arxiv.org/abs/1304.1916)", arXiv:1304.1916 [cs.DS]</small>
- <small><sup id=Note21>(21)</sup> "[**Probability and Random Numbers**](http://mathforum.org/library/drmath/view/65653.html)", Feb. 29, 2004.</small>
- <small><sup id=Note22>(22)</sup> Mennucci, A.C.G. "[**Bit Recycling for Scaling Random Number Generators**](https://arxiv.org/abs/1012.4290)", arXiv:1012.4290 [cs.IT], 2018.</small>
- <small><sup id=Note23>(23)</sup> Devroye, L., Gravel, C., "[**Sampling with arbitrary precision**](https://arxiv.org/abs/1502.02539v5)", arXiv:1502.02539v5 [cs.IT], 2015.</small>
- <small><sup id=Note24>(24)</sup> Saad, F.A., Freer C.E., et al., "[**The Fast Loaded Dice Roller: A Near-Optimal Exact Sampler for Discrete Probability Distributions**](https://arxiv.org/abs/2003.03830v2)", arXiv:2003.03830v2  [stat.CO], also in _AISTATS 2020: Proceedings of the 23rd International Conference on Artificial Intelligence and Statistics, Proceedings of Machine Learning Research_ 108, Palermo, Sicily, Italy, 2020.</small>
- <small><sup id=Note25>(25)</sup> Feras A. Saad, Cameron E. Freer, Martin C. Rinard, and Vikash K. Mansinghka, "[**Optimal Approximate Sampling From Discrete Probability Distributions**](https://arxiv.org/abs/2001.04555v1)", arXiv:2001.04555v1 [cs.DS], also in Proc. ACM Program. Lang. 4, POPL, Article 36 (January 2020), 33 pages.</small>
- <small><sup id=Note26>(26)</sup> Shaddin Dughmi, Jason D. Hartline, Robert Kleinberg, and Rad Niazadeh. 2017. Bernoulli Factories and Black-Box Reductions in Mechanism Design. In _Proceedings of 49th Annual ACM SIGACT Symposium on the Theory of Computing_, Montreal, Canada, June 2017 (STOC’17).</small>
- <small><sup id=Note27>(27)</sup> Morina, G., Łatuszyński, K., et al., "[**From the Bernoulli Factory to a Dice Enterprise via Perfect Sampling of Markov Chains**](https://arxiv.org/abs/1912.09229v1)", arXiv:1912.09229v1 [math.PR], 2019.</small>
- <small><sup id=Note28>(28)</sup> K. Bringmann and K. Panagiotou, "Efficient Sampling Methods for Discrete Distributions." In: Proc. 39th International Colloquium on Automata, Languages, and Programming (ICALP'12), 2012.</small>
- <small><sup id=Note29>(29)</sup> A.J. Walker, "An efficient method for generating discrete random variables with general distributions", _ACM Transactions on Mathematical Software_ 3, 1977.</small>
- <small><sup id=Note30>(30)</sup> Vose, Michael D. "A linear algorithm for generating random numbers with a given distribution." IEEE Transactions on software engineering 17, no. 9 (1991): 972-975.</small>
- <small><sup id=Note31>(31)</sup> K. Bringmann and K. G. Larsen, "Succinct Sampling from Discrete Distributions", In: Proc. 45th Annual ACM Symposium on Theory of Computing (STOC'13), 2013.</small>
- <small><sup id=Note32>(32)</sup> L. Hübschle-Schneider and P. Sanders, "[**Parallel Weighted Random Sampling**](https://arxiv.org/abs/1903.00227v2)", arXiv:1903.00227v2  [cs.DS], 2019.</small>
- <small><sup id=Note33>(33)</sup> Y. Tang, "An Empirical Study of Random Sampling Methods for Changing Discrete Distributions", Master's thesis, University of Alberta, 2019.</small>
- <small><sup id=Note34>(34)</sup> Roy, Sujoy Sinha, Frederik Vercauteren and Ingrid Verbauwhede. "[**High Precision Discrete Gaussian Sampling on FPGAs**](https://www.esat.kuleuven.be/cosic/publications/article-2372.pdf)." _Selected Areas in Cryptography_ (2013).</small>
- <small><sup id=Note35>(35)</sup> T. S. Han and M. Hoshi, "Interval algorithm for random number generation", _IEEE Transactions on Information Theory_ 43(2), March 1997.</small>
- <small><sup id=Note36>(36)</sup> Oberhoff, Sebastian, "[**Exact Sampling and Prefix Distributions**](https://dc.uwm.edu/etd/1888)", _Theses and Dissertations_, University of Wisconsin Milwaukee, 2018.</small>

<a id=Appendix></a>
## Appendix

<a id=Implementation_of_erf></a>
### Implementation of `erf`

The pseudocode below shows an approximate implementation of the [**error function**](https://en.wikipedia.org/wiki/Error_function) `erf`, in case the programming language used doesn't include a built-in version of `erf` (such as JavaScript at the time of this writing).   In the pseudocode, `EPSILON` is a very small number to end the iterative calculation.

    METHOD erf(v)
        if v==0: return 0
        if v<0: return -erf(-v)
        if v==infinity: return 1
        // NOTE: For Java `double`, the following
        // line can be added:
        // if v>=6: return 1
        i=1
        ret=0
        zp=-(v*v)
        zval=1.0
        den=1.0
        while i < 100
            r=v*zval/den
            den=den+2
            ret=ret+r
            // NOTE: EPSILON can be pow(10,14),
            // for example.
            if abs(r)<EPSILON: break
            if i==1: zval=zp
            else: zval = zval*zp/i
            i = i + 1
        end
        return ret*2/sqrt(pi)
    END METHOD

<a id=A_Note_on_Integer_Generation_Algorithms></a>
### A Note on Integer Generation Algorithms

There are many algorithms for the `RNDINT(maxInclusive)` method, which generates uniform random integers in [0, maxInclusive].  This section deals with "optimal" `RNDINT` algorithms in terms of the number of random bits they use on average (assuming we have a source of "truly" random bits).

Knuth and Yao (1976)<sup>[**(16)**](#Note16)</sup> showed that any algorithm that uses only random bits to generate random integers with separate probabilities can be described as a _binary tree_ (also known as a _DDG tree_ or _discrete distribution generating tree_).  Random bits trace a path in this tree, and each leaf (terminal node) in the tree represents an outcome.  They also gave lower bounds on the number of random bits an algorithm needs on average for this purpose.  In the case of `RNDINT`, there are `n = maxInclusive + 1` outcomes that each occur with probability `1/n`, so any _optimal_ algorithm for `RNDINT` needs at least `log2(n)` and at most `log2(n) + 2` bits on average (where `log2(x) = ln(x)/ln(2)`).<sup>[**(17)**](#Note17)</sup>

As also shown by Knuth and Yao, however, any integer generating algorithm that is both optimal _and unbiased (exact)_ will also run forever in the worst case, even if it uses few random bits on average.  This is because in most cases, `n` will not be a power of 2, so that `n` will have an infinite binary expansion, so that the resulting DDG tree will have to either be infinitely deep, or include "rejection leaves" at the end of the tree. (If `n` is a power of 2, the binary expansion will be finite, so that the DDG tree will have a finite depth and no rejection leaves.)

Because of this, there is no general way to "fix" the worst case of running forever, while still having an unbiased (exact) algorithm.  For instance, modulo reductions can be represented by a DDG tree in which rejection leaves are replaced with labeled outcomes, but the bias occurs because only some outcomes can replace rejection leaves this way.  Even with rejection sampling, stopping the rejection after a fixed number of iterations will likewise lead to bias, for the same reasons.  However, which outcomes are biased this way depends on the algorithm.

The following are some ways to implement `RNDINT`.  (The column "Unbiased?" means whether the algorithm generates random integers without bias, even if `n` is not a power of 2.)

| Algorithm | Optimal? | Unbiased? | Time Complexity |
  --- | --- | --- | --- |
| _Rejection sampling_: Sample in a bigger range until a sampled number fits the smaller range. | Not always | Yes | Runs forever in worst case |
| _Multiply-and-shift reduction_: Generate `bignumber`, a `k`-bit random integer with many more bits than `n` has, then find `(bignumber * n) >> k` (see (Lemire 2016)<sup>[**(18)**](#Note18)</sup>, (Lemire 2018)<sup>[**(19)**](#Note19)</sup>, and the "Integer Multiplication" algorithm surveyed by M. O'Neill). | No | No | Constant |
| _Modulo reduction_: Generate `bignumber` as above, then find `rem(bignumber, n)`  | No | No | Constant |
| _Fast Dice Roller_ (Lumbroso 2013)<sup>[**(20)**](#Note20)</sup> | Yes | Yes | Runs forever in worst case |
| Math Forum (2004)<sup>[**(21)**](#Note21)</sup> or (Mennucci 2018)<sup>[**(22)**](#Note22)</sup> (batching/recycling random bits) | Yes | Yes | Runs forever in worst case |
| "FP Multiply" surveyed by [**M. O'Neill**](http://www.pcg-random.org/posts/bounded-rands.html) | No | No | Constant |
| Algorithm in "Conclusion" section by O'Neill | No | Yes | Runs forever in worst case |
| "Debiased" and "Bitmask with Rejection" surveyed by M. O'Neill | No | Yes | Runs forever in worst case |

There are various techniques that can reduce the number of bits "wasted" by an integer-generating algorithm, and bring that algorithm closer to the theoretical lower bound of Knuth and Yao, even if the algorithm isn't "optimal".  These techniques, which include batching, bit recycling, and randomness extraction, are discussed, for example, in the Math Forum page and the Lumbroso and Mennucci papers referenced above, and in (Devroye and Gravel 2015)<sup>[**(23)**](#Note23)</sup>.

> **Note:** A similar question is how to generate a random integer given rolls of a fair die; more specifically, how to roll a _k_-sided die given a _p_-sided die.  This can't be done without "wasting" randomness, unless "every prime number dividing _k_ also divides _p_" (see "[**Simulating a dice with a dice**](https://perso.math.u-pem.fr/kloeckner.benoit/papiers/DiceSimulation.pdf)" by B. Kloeckner, 2008).  However, since randomness extraction can turn die rolls into unbiased bits, so that the discussion above applies, this question is interesting only when someone wants to build instructions to choose a number at random by rolling real dice or flipping real coins.

<a id=A_Note_on_Weighted_Choice_Algorithms></a>
### A Note on Weighted Choice Algorithms

Just like integer generation algorithms (see the previous section), weighted choice algorithms (implementations of `WeightedChoice` that sample with replacement) involve generating random integers with separate probabilities.  And all of them can be described as a binary DDG tree just like integer generating algorithms.

In this case, though, the number of random bits an algorithm uses on average is bounded from below by the sum of binary entropies of all the probabilities involved.  For example, say we give the four integers 1, 2, 3, 4 the following weights: 3, 15, 1, 2.  The binary entropies of these weights are 0.4010... + 0.3467... + 0.2091... + 0.3230... = 1.2800... (because the sum of the weights is 21 and the binary entropy of 3/21 is `(3/21) * log2(21/3) = 0.4010...`, and so on for the other weights), so an optimal algorithm will use anywhere from 1.2800... to 3.2800... bits on average to generate a random number with these weights.<sup>[**(17)**](#Note17)</sup>  Another difference from integer generation algorithms is that usually a special data structure has to be built for the sampling to work, and often there is a need to make updates to the structure as items are sampled.

The following are some ways to implement `WeightedChoice`. The algorithms are generally not optimal in terms of the number of bits used, unless noted. For these samplers to be _error-bounded_:

- Weights passed to these algorithms should first be converted to integers (see `IntegerWeightsListFP` or `NormalizeRatios` in "[**Sampling for Discrete Distributions**](https://peteroupc.github.io/randomfunc.html#Sampling_for_Discrete_Distributions)" for conversion methods), or rational numbers when indicated.
- Floating-point arithmetic and floating-point random number generation (such as `RNDRANGE()`) should be avoided.

| Algorithm | Notes |
  --- | --- |
| _Fast Loaded Dice Roller_ (Saad et al., 2020)<sup>[**(24)**](#Note24)</sup>. | Uses integer weights only, and samples using random bits ("fair coins"). This sampler comes within 6 bits, on average, of the optimal number of bits. |
| Samplers described in (Saad et al., 2020)<sup>[**(25)**](#Note25)</sup> | Uses integer weights only, and samples using random bits. The samplers are optimal in the sense given here as long as the sum of the weights is of the form 2<sup>k</sup> or 2<sup>k</sup> &minus; 2<sup>m</sup>. |
| Rejection sampling | Given a list (`weights`) of `n` weights: (1) find the highest weight and call it _max_; (2) set _i_ to `RNDINT(n - 1)`; (3) With probability `weights[i]/max` (e.g., if `ZeroOrOne(weights[i], max)==1` for integer weights), return _i_, and go to step 2 otherwise.  (See, e.g., sec. 4 of the Fast Loaded Dice Roller paper, or the Tang or Klundert papers.)  If the weights are instead "coins", each with a separate but unknown bias, the algorithm is also called _Bernoulli race_ (Dughmi et al. 2017)<sup>[**(26)**](#Note26)</sup>; see also (Morina et al., 2019)<sup>[**(27)**](#Note27)</sup>: (1) set _i_ to `RNDINT(n - 1)`; (2) flip coin _i_ (the first coin is 0, the second is 1, etc.), then return _i_ if it returns 1 or heads, or go to step 1 otherwise. |
| (Bringmann and Panagiotou 2012)<sup>[**(28)**](#Note28)</sup>. | Shows a sampler designed to work on a sorted list of weights. |
| Alias method (Walker 1977)<sup>[**(29)**](#Note29)</sup> | Michael Vose's version of the alias method (Vose 1991)<sup>[**(30)**](#Note30)</sup> is described in "[**Darts, Dice, and Coins: Sampling from a Discrete Distribution**](https://www.keithschwarz.com/darts-dice-coins/)". Weights should be rational numbers. |
| (Klundert 2019)<sup>[**(29)**](#Note29) | Various data structures, with emphasis on how they can support changes in weights. |
| The Bringmann&ndash;Larsen succinct data structure (Bringmann and Larsen 2013)<sup>[**(31)**](#Note31)</sup> | Uses rejection sampling if the sum of weights is large, and a compressed structure otherwise. |
| (Hübschle-Schneider and Sanders 2019)<sup>[**(32)**](#Note32)</sup>. | Parallel weighted random samplers. |
| Two- and multi-level search; flat method (Tang 2019)<sup>[**(33)**](#Note33)</sup>. | |
| "Weighted Choice with Biased Coins" in this appendix. | Takes "coins" with unknown bias as input. |
| Knuth and Yao (1976)<sup>[**(16)**](#Note16)</sup> | Generates a DDG tree from the binary expansions of the probabilities. Is optimal, or at least nearly so.  This is suggested in exercise 3.4.2 of chapter 15 of (Devroye 1986, p. 1-2)<sup>[**(12)**](#Note12)</sup>, implemented in _randomgen.py_ as the `discretegen` method, and also described in (Roy et al. 2013)<sup>[**(34)**](#Note34)</sup>.  `discretegen` can work with probabilities that are irrational numbers (which have infinite binary expansions) as long as there is a way to calculate the binary expansion "on the fly". |
| (Han and Hoshi 1997)<sup>[**(35)**](#Note35)</sup> | Uses cumulative probabilities as input.  An error-bounded version is described in (Devroye and Gravel 2015)<sup>[**(23)**](#Note23)</sup> and comes within 3 bits, on average, of the optimal number of bits. |

> **Note:** If the source of randomness is a "biased coin" which returns heads with _unknown_ probability of heads and false otherwise, it can be turned into a "fair" coin (and so output unbiased bits) via _randomness extraction_ (see my [**Note on Randomness Extraction**](https://peteroupc.github.io/randextract.html)), so that the algorithms above can be used.

<a id=Exact_Error_Bounded_and_Approximate_Algorithms></a>
### Exact, Error-Bounded, and Approximate Algorithms

There are three kinds of randomization algorithms:

1. An _exact algorithm_ is an algorithm that samples from the exact distribution requested, assuming that computers&mdash;

    - can store and operate on real numbers of any precision, and
    - can generate independent uniform random real numbers of any precision

    (Devroye 1986, p. 1-2)<sup>[**(12)**](#Note12)</sup>.  However, an exact algorithm implemented on real-life computers can incur rounding and other errors, especially errors involving floating-point arithmetic or irrational numbers. An exact algorithm can achieve a guaranteed bound on accuracy (and thus be an _error-bounded algorithm_) using either arbitrary-precision or interval arithmetic (see also Devroye 1986, p. 2)<sup>[**(12)**](#Note12)</sup>. All methods given on this page are exact unless otherwise noted.  Note that `RNDU01` or `RNDRANGE` are exact in theory, but have no required implementation.
2. An _error-bounded algorithm_ is an exact algorithm with further requirements described below:

    - If the ideal distribution is discrete (takes on a countable number of values), the algorithm samples exactly from that distribution.
    - If the ideal distribution is continuous, the algorithm samples from a distribution that is close to the ideal within a user-specified error tolerance (see below for details).  The algorithm can instead sample a random number only partially, as long as the fully sampled number can be made close to the ideal within any error tolerance desired.
    - The algorithm incurs no approximation error not already present in the inputs (except errors needed to round the final result to the user-specified error tolerance).

    Many error-bounded algorithms use random bits as their only source of random numbers. An application should use error-bounded algorithms whenever possible.
3. An _inexact_, _approximate_, or _biased algorithm_ is neither exact nor error-bounded; it uses "a mathematical approximation of sorts" to generate a random number that is close to the desired distribution (Devroye 1986, p. 2)<sup>[**(12)**](#Note12)</sup>.  An application should use this kind of algorithm only if it's willing to trade accuracy for speed.

Most algorithms on this page, though, are not _error-bounded_, but even so, they may still be useful to an application willing to trade accuracy for speed.

There are many ways to describe closeness between two distributions.  As one suggestion found in (Devroye and Gravel 2015)<sup>[**(23)**](#Note23)</sup>, an algorithm has accuracy &epsilon; (the user-specified error tolerance) if it samples random numbers whose distribution is close to the ideal distribution by a Wasserstein L<sub>&infin;</sub> distance ("earth-mover distance") of not more than &epsilon;.

>
> **Examples:**
>
> 1. Generating an exponential random number via `-ln(RNDU01())` is an _exact algorithm_ (in theory), but not an _error-bounded_ one for common floating-point number formats.  The same is true of the Box&ndash;Müller transformation.
> 2. Generating an exponential random number in the manner described in [**another section of this page**](#Exponential_Distribution_Another_Error_Bounded_Algorithm) is an _error-bounded algorithm_.  Karney's algorithm for the normal distribution (Karney 2014)<sup>[**(1)**](#Note1)</sup> is also error-bounded because it returns a result that can be made to come close to the normal distribution within any error tolerance desired simply by appending more random digits to the end (an example when the return value has 53 bits after the point is as follows: `for i in 54..100: ret = ret + RNDINT(1) * pow(2,-i)`).  See also (Oberhoff 2018)<sup>[**(36)**](#Note36)</sup>.
> 3. Examples of _approximate algorithms_ include generating a Gaussian random number via a sum of `RNDU01()`, or most cases of generating a random integer via modulo reduction (see "[**A Note on Integer Generation Algorithms**](#A_Note_on_Integer_Generation_Algorithms)").

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
