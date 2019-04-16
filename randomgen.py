"""
Sample code for the article "Random Number Generation and Sampling Methods"
https://www.codeproject.com/Articles/1190459/Random-Number-Generation-Methods

Written by Peter O.
Any copyright is released to the Public Domain.
https://creativecommons.org/publicdomain/zero/1.0/
"""

import math
import random

_SIGBITS = 53
_FLOAT_MAX = 1.7976931348623157e+308

def _mean(list):
    if len(list)<=1: return 0
    xm=list[0]
    i=1
    while i<len(list):
      c=list[i]
      i+=1
      cxm=(c-xm)
      xm+=cxm*1.0/i
    return xm

def _variance(list):
    if len(list)<=1: return 0
    xm=list[0]
    xs=0
    i=1
    while i<len(list):
      c=list[i]
      i+=1
      cxm=(c-xm)
      xm+=cxm*1.0/i
      xs+=cxm*(c-xm)
    return xs*1.0/(len(list)-1)

def _tableInterpSearch(table,x,censor=False):
   # Effective length is the length of table minus 1
   tablelen=len(table)-1
   left=0
   right=tablelen-1
   while left<=right:
      index=int((left+right)/2)
      c=table[index]
      n=table[index+1]
      if x>=c[0] and x<n[0]:
          interp=(x-c[0])*1.0/(n[0]-c[0])
          return c[1]+(n[1]-c[1])*interp
      if x>c[0]:
          left = index+1
          continue
      right=index-1
      continue
   if censor:
       if x<=table[0][0]: return table[0][1]
       if x>=table[tablelen][0]:
           return table[tablelen][1]
   return None

def numericalTable(func, x, y, n=100):
  ret=[x+(y-x)*(i*1.0/n) for i in range(n+1)]
  return [[func(b), b] for b in ret]

class RandomGen:
  """ A class that implements many methods for
      random number generation and sampling.  It takes
      an underlying RNG as specified in the constructor."""
  def __init__(self,rng=None):
    """ Initializes a new RandomGen instance.
     NOTES:

     1. Assumes that 'rng' implements
     a 'randint(a, b)' method that returns a random
     integer in the interval [a, b].  Currently, this
     class assumes 'a' is always 0.
     2. 'rndint' (and functions that ultimately call it) may be
     slower than desirable if many random numbers are
     needed at once.  Ways to improve the performance
     of generating many random numbers at once, such
     as parallel processing or vectorization, are currently outside
     the scope of this code. """
    if rng==None:
      self.rng=random.Random()
    else:
      self.rng=rng
    self.bitcount=24
    self.curbit=0

  def _rndbit(self):
    if self.bitcount>=24:
      self.bitcount=0
      self.curbit=self.rng.randint(0,(1<<24) - 1)
    ret=self.curbit&1
    self.curbit>>=1
    self.bitcount+=1
    return ret

  def rndint(self, maxInclusive):
    if maxInclusive < 0:
      raise ValueError("maxInclusive less than 0")
    if maxInclusive==0:
      return 0
    if maxInclusive==1:
      return self._rndbit()
    return self.rng.randint(0, maxInclusive)

  def rndintrange(self, minInclusive, maxInclusive):
    # NOTE: Since Python integers are arbitrary-precision,
    # the naive approach will work well here
    return minInclusive + self.rndint(maxInclusive - minInclusive)

  def rndintexcrange(self, minInclusive, maxExclusive):
    return minInclusive + self.rndint(maxExclusive - minInclusive - 1)

  def rndbits(self, n):
    """ Generates an n-bit random integer. """
    return self.rndint((1 << n) - 1)

  def rndu01(self):
    e=-_SIGBITS
    while True:
      if self.rndint(1)==0:
        e-=1
      else:
        break
    sig=self.rndint((1 << (_SIGBITS - 1)) - 1)
    if sig==0 and self.rndint(1)==0:
      e+=1
    sig=sig+(1<<(_SIGBITS - 1))
    # NOTE: Multiply by 1.0 to coerce to floating-point
    return sig * 1.0 * (2.0 ** e)

  def rndu01oneexc(self):
    while True:
      ret=self.rndu01()
      if ret != 1.0:
        return ret

  def rndu01zerooneexc(self):
    while True:
      ret=self.rndu01()
      if ret != 1.0 and ret != 0.0:
        return ret

  def rndu01zeroexc(self):
    while True:
      ret=self.rndu01()
      if ret != 0.0:
        return ret

  def rndrange(self, minInclusive, maxInclusive):
    if minInclusive > maxInclusive:
      raise ValueError
    if minInclusive >= 0 or minInclusive + _FLOAT_MAX >= maxInclusive:
       return minInclusive + (maxInclusive - minInclusive) * self.rndu01()
    while True:
       ret = self.rndu01() * _FLOAT_MAX
       negative = self.rndint(1) == 0
       if negative:
          ret = 0 - ret
       if negative and ret == 0:
          continue
       if ret>=minInclusive and ret<=maxInclusive:
          return ret

  def rndrangemaxexc(self, minInclusive, maxExclusive):
    if minInclusive >= maxExclusive:
      raise ValueError
    while True:
      ret=self.rndrange(minInclusive, maxExclusive)
      if ret < maxExclusive:
        return ret

  def rndrangeminexc(self, mn, mx):
    if mn >= mx:
      raise ValueError
    while True:
      ret=self.rndrange(mn, mx)
      if ret > mn:
        return ret

  def rndrangeminmaxexc(self, mn, mx):
    if mn >= mx:
      raise ValueError
    while True:
      ret=self.rndrange(mn, mx)
      if ret > mn and ret < mx:
        return ret

  def shuffle(self, list):
    if len(list) >= 2:
      i = len(list) - 1
      while i > 0:
        k=self.rndintexc(i+1)
        tmp=list[i]
        list[i]=list[k]
        list[k]=tmp
        i-=1
    return list

  def partialshuffle(self, list, k):
    """ Does a partial shuffle of
a list's items (stops when 'k' items
are shuffled); the shuffled items
will appear at the end of the list.
Returns 'list'. """
    ki = 0
    if len(list) >= 2:
      i = len(list) - 1
      while i > 0 and ki < k:
        k=self.rndintexc(i+1)
        tmp=list[i]
        list[i]=list[k]
        list[k]=tmp
        i-=1
        k+=1
    return list

  def sample(self, list, k):
    if k<0 or k>len(list): raise ValueError
    n=len(list)
    if n==k: return [x for x in list]
    if n<200:
      s=self.shuffle([x for x in list])
      return s[0:k] # Choose first k items
    if n/4>k and n<5000:
      s=self.partialshuffle([x for x in list], k)
      return s[n-k:n] # Choose last k items
    ki=0
    kh={}
    while ki < k:
       c=self.rndintexc(k)
       if c not in kh:
          kh[c]=True
          ki+=1
    return [list[i] for i in kh.keys()]

  def choice(self, list):
    return list[self.rndintexc(len(list))]

  def numbersWithSum(self, count, sum = 1.0):
    if count<=0 or sum<=0:
      raise ValueError
    while True:
      numsum=0
      nums=None
      if sum==1:
         nums=[self.exponential() for i in range(count)]
      else:
         nums=[self.gamma(sum) for i in range(count)]
      for num in nums:
        numsum+=num
      if numsum>0:
        return [(p/numsum)*sum for p in nums]

  def weighted_choice(self, weights):
    return self._weighted_choice_n(weights,1,0)[0]

  def weighted_choice_n(self, weights,n=1):
    return self._weighted_choice_n(weights,n,m)

  def _weighted_choice_n(self, weights, n, addvalue):
    if len(weights)==0:
      raise ValueError
    msum=0
    i=0
    while i < len(weights):
      msum+=weights[i]
      i+=1
    rv=[self.rndrangemaxexc(0, msum) \
       for k in range(n)]
    ret=[0 for k in range(n)]
    k=0
    while k<n:
      value=rv[k]
      i=0
      lastItem=len(weights)-1
      runningValue=0
      while i<len(weights):
        if weights[i]>0:
          newValue=runningValue+weights[i]
          lastItem=i
          if value < newValue:
            break
          runningValue=newValue
        i+=1
      ret[k]=lastItem+addvalue
      k+=1
    return ret

  def continuous_choice(self, values, weights):
    return self.continuous_choice_n(values,weights)[0]

  def continuous_choice_n(self, values, weights, n=1):
    if len(values)<=0 or len(weights)<len(values):
      raise ValueError
    if len(values)==1:
      return [values[0] for i in range(n)]
    total=0
    areas=[0 for i in range(len(values)-1)]
    i=0
    while i<len(values)-1:
      weightArea=(weights[i]+weights[i+1])*0.5* \
        (values[i+1]-values[i])
      if weightArea < 0:
        weightArea = -weightArea
      areas[i]=weightArea
      total+=weightArea
      i+=1
    valuelist=[self.rndrangemaxexc(0, total) \
      for _ in range(n)]
    wtlist=[self.rndu01oneexc() \
      for _ in range(n)]
    lastValue=values[len(values)-1]
    retValues=[lastValue for _ in range(n)]
    k=0
    while k<n:
      i=0
      runningValue=0
      while i < len(values)-1:
        area=areas[i]
        if area>0:
          newValue=runningValue+area
          if valuelist[k]<newValue:
            w1=weights[i]
            w2=weights[i+1]
            wt=wtlist[k]
            interp=wt
            diff=w2-w1
            if diff>0:
              cs=w2*w2*wt+w1*w1-w1*w1*wt
              s=math.sqrt(cs)
              interp=(s-w1)/diff
              if interp<0 or interp>1:
                interp=-(s+w1)/diff
            if diff<0:
              cs=w1*w1*wt+w2*w2-w2*w2*wt
              s=math.sqrt(cs)
              interp=-(s-w2)/diff
              if interp<0 or interp>1:
                interp=(s+w2)/diff
              interp=1-interp
            retValues[k]=values[i]+(values[i+1]-values[i])*interp
            break
          runningValue=newValue
        i+=1
      k+=1
    return retValues

  def normal(self, mu=0.0, sigma=1.0):
    """ Generates a normally-distributed random number. """
    bmp=0.8577638849607068 # sqrt(2/exp(1))
    while True:
      a=self.rndu01zeroexc()
      b=self.rndrange(-bmp,bmp)
      if b*b <= -4 * a * a * math.log(a):
        return (b * sigma / a) + mu

  def lognormal(self,mu=0.0,sigma=0.0):
    return math.exp(self.normal(mu,sigma))

  def weibull(self, a, b):
    """ Generates a Weibull-distributed random number. """
    return b*(-math.log(self.rndu01zerooneexc()))**(1.0/a)

  def triangular(self, startpt, midpt, endpt):
    return self.continuous_choice([startpt,midpt,endpt],\
      [0,1,0])

  def gumbel(self,a,b):
     return a + math.log(self.exponential()) * b

  def frechet(self,a,b,mu=0):
    return b*pow(self.exponential(),-1.0/a)+mu

  def beta(self, a, b, nc = 0):
    """ Generates a beta-distributed random number.
     `a` and `b` are the two parameters of the beta distribution,
     and `nc` is a parameter such that `nc` other than 0
     indicates a _noncentral_ distribution. """
    avar = a + self.poisson(nc)
    if b==1 and avar==1: return self.rndu01()
    if avar==1: return 1.0-pow(self.rndu01(),1.0/b)
    if b==1: return pow(self.rndu01(),1.0/avar)
    x=self.gamma(avar)
    return x/(x+self.gamma(b))

  def binomial(self, trials, p):
    if trials < 0:
      raise ValueError
    if trials==0:
      return 0
    if p>=1.0:
      return trials
    if p<=0.0:
      return 0
    i=0
    count=0
    tp=trials*p*1.0
    if tp>25 or (tp > 5 and p>0.1 and p<0.9):
      countval=-1
      while countval<0 or countval > trials:
        countval=self.normal(tp,math.sqrt(tp))
      return round(countval)
    while i < trials:
      if self.rndu01oneexc() < p:
        count+=1
      i+=1
    return count

  def hypergeometric(self,trials,ones,count):
    if ones<0 or count<0 or trials<0 or ones > count or trials>count:
      raise ValueError
    if ones==0:
      return 0
    successes=0
    i=0
    currentCount=count
    currentOnes=ones
    while i<trials and currentOnes>0:
      if self.rndintexc(currentCount)<currentOnes:
        currentOnes-=1
        successes+=1
      currentCount-=1
      i+=1
    return successes

  def poisson(self,mean):
    """ Generates a random number following a Poisson distribution.  """
    if mean<0:
      raise ValueError
    if mean==0:
      return 0
    if mean>9:
       p=-1.0
       while p<0:
         p=self.normal(mean,math.sqrt(mean))
       return round(p)
    p=1.0
    pn=math.exp(-mean)
    count=0
    while True:
      count+=1
      p*=self.rndu01oneexc()
      if p<=pn:
        return count-1

  def rayleigh(self,a):
    """ Generates a random number following a Rayleigh distribution.  """
    return a * math.sqrt(-2 * math.log(self.rndu01zerooneexc()))

  def gamma(self,mean,b=1.0,c=1.0,d=0.0):
    """ Generates a random number following a gamma distribution.  """
    if mean<=0:
      raise ValueError
    dd=mean
    v=0
    if mean==1:
      return -math.log(self.rndu01zerooneexc())
    if mean<1:
      dd+=1
    dd-=1.0/3
    cc=1.0/math.sqrt(9*dd)
    while True:
      x=0
      while True:
        x=self.normal(0,1)
        v=cc*x+1
        v=v*v*v
        if v>0:
          break
      u=self.rndu01zeroexc()
      x2=x*x
      if u<1-(0.0331*x2*x2):
        break
      if math.log(u)<(0.5*x2)+(dd*(1-v+math.log(v))):
        break
    ret=dd*v
    if mean<1:
      ret=ret*math.exp(math.log(1.0-self.rndu01oneexc()) / mean)
    return ret**(1.0/c)*b+d

  def stable(self, alpha, beta):
        """ Generates a random number following a stable distribution.  """
        if alpha <=0 or alpha > 2: raise ValueError
        if beta < -1 or beta > 1: raise ValueError
        halfpi = math.pi * 0.5
        unif=self.rndrangemaxexc(-halfpi, halfpi)
        while unif==-halfpi: unif=self.rndrangemaxexc(-halfpi, halfpi)
        # Cauchy special case
        if alpha == 1 and beta == 0: return tan(unif)
        expo=-math.log(self.rndu01zeroexc())
        c=math.cos(unif)
        if alpha == 1:
                s=math.sin(unif)
                return 2.0*((unif*beta+halfpi)*s/c -  \
                    beta * math.log(halfpi*expo*c/(unif*beta+halfpi)))/pi
        z=-math.tan(alpha*halfpi)*beta
        ug=unif+math.atan2(-z, 1)/alpha
        cpow=pow(c, -1.0 / alpha)
        return pow(1.0+z*z, 1.0 / (2*alpha))*  \
            (math.sin(alpha*ug)*cpow)*  \
            pow(math.cos(unif-alpha*ug)/expo, (1.0 - alpha) / alpha)

  def stable0(self, alpha, beta, mu, sigma):
       """ Generates a random number following a 'type 0' stable distribution.  """
       x=math.log(sigma)*2.0/pi if alpha==1 else math.tan(pi*0.5*alpha)
       return self.stable(alpha, beta) * sigma + (mu - sigma * beta * x)

  def moyal(self, mu=0, sigma=1):
    """ Sample from a Moyal distribution, using the
         method given in C. Walck, "Handbook on
         Statistical Distributions for Experimentalists",
         pp. 93-94."""
    while True:
      y=self.rndrangeminmaxexc(-math.pi/2,math.pi/2)
      tany=math.tan(y)
      hy=math.exp(-(tany+math.exp(-tany))*0.5)
      hy=hy/((math.cos(y)**2)*sqrt(2.0*math.pi))
      if self.rndrange(0,0.912)<=hy:
        return tany*sigma+mu

  def geometric(self, p):
     return self.negativebinomial(1, p)

  def negativebinomial(self,successes,p):
    if successes<0:
      raise ValueError
    if successes==0 or p>=1.0:
      return 0
    if p<=0.0:
      return 1.0/0.0
    if successes==1.0:
      return int(math.log(self.rndu01zerooneexc())/ \
         math.log(1.0-p))
    if int(successes)!=successes or successes>1000:
      return self.poisson(self.gamma(successes)*(1-p)/p)
    else:
      count=0
      total=0
      while True:
        if r.rndu01oneexc()<p:
          total+=1
          if total>=successes: return count
        count+=1

  def dirichlet(alphas):
     gammas=[self.gamma(x,1) for x in alphas]
     sumgammas=sum(gammas)
     return [gammas[i]/sumgammas for i in range(len(alphas)-1)]

  def multipoisson(self, firstmean, othermeans):
     """ Multivariate Poisson distribution (as found in Mathematica). """
     first=self.poisson(firstmean)
     return [first+self.poisson(m) for m in othermeans]

  def exponential(self,lamda = 1.0):
    return -math.log(self.rndu01zerooneexc())/lamda

  def pareto(self,minimum,alpha):
    return self.rndu01zerooneexc()**(-1.0/alpha)*minimum

  def vonmises(self,mean,kappa):
    if kappa<0:
      raise ValueError
    if kappa==0:
      return self.rndrangemaxexc(mean-pi,mean+pi)
    r=1+math.sqrt(4*kappa*kappa+1)
    rho=(r-math.sqrt(2*r))/(kappa*2)
    s=(1+rho*rho)/(2*rho)
    while True:
      u=self.rndrangemaxexc(-1,1)
      v=self.rndu01zerooneexc()
      z=math.cos(math.pi*u)
      w=(1+s*z)/(s+z)
      y=kappa*(s-w)
      if y*(2-y)-v>=0 or math.log(y/v)+1-y>=0:
        if w<-1:
          w=-1
        if w>1:
          w=1
        angle=math.acos(w)
        if u<0:
          angle=-angle
        return mean+angle

  def negativeMultinomial(self, succ, failures):
    """
Negative multinomial distribution.

Models the number of failures of one or more
kinds before a given number of successes happens.
succ: Number of successes.
failures: Contains probabilities for each kind of failure.
The sum of probabilities must be less than 1.
Returns: A list containing a random number
of failures of each kind of failure.
    """
    ret=[0 for _ in failures]
    i=0
    while i<succ:
        r=self.rndu01oneexc()
        p=0
        nosuccess=false
        for j in range(len(failures)):
              if r>=p and r<p+failures[j]:
                     ret[j]+=1
                     nosuccess=true
                     break
              p+=failures[j]
        if not nosuccess: i+=1
    return ret

  def nonzeroIntegersWithSum(self, n, total):
    if n <= 0 or total <=0:
        raise ValueError
    ls = []
    i = 0
    list.insert(ls,0,0)
    while len(ls) < n:
        c = self.rndintexcrange(1, total)
        found = False
        j = 1
        while j < len(ls):
            if ls[j] == c:
                found = True
                break
            j = j + 1
        if found == False:
            list.insert(ls,len(ls),c)
    ls.sort()
    list.insert(ls,len(ls),total)
    return [ls[i]-ls[i-1] for i in range(1,len(ls))]

  def integersWithSum(self, n, total):
    if n <= 0 or total <=0:
        raise ValueError
    return [s-1 for s in self.nonzeroIntegersWithSum(n, total + n)]

  def diceRoll(self, dice, sides = 6, bonus = 0):
    if dice < 0 or sides < 1: raise ValueError
    if dice == 0: return 0
    if sides == 1: return dice
    ret = 0
    if dice > 50:
        # If there are many dice to roll,
        # use a faster approach, noting that
        # the dice-roll distribution approaches
        # a "discrete" normal distribution as the
        # number of dice increases.
        mean = dice * (sides + 1) * 0.5
        sigma = math.sqrt(dice * (sides * sides - 1) / 12)
        ret = -1
        while ret < dice or ret > dice * sides:
            ret = round(self.normal(mean, sigma))
    else:
         i = 0
         while i < dice:
              ret = ret + self.rndintrange(1, sides)
              i = i + 1
    ret = ret + bonus
    if ret < 0: ret = 0
    return ret

  def _ierf(self, x):
    """ Inverse error function. """
    coeffs=[0.3333333333333333, 0.23333333333333333, 0.2015873015873016, 0.19263668430335099, 0.19532547699214364, 0.20593586454697566, 0.2232097574187521, 0.24697023314275485, 0.27765382560322394, 0.3161426235531171, 0.3637175870396921, 0.4220720808430425, 0.49336326556393456, 0.5802938460615139, 0.6862233969476911, 0.815312205552808, 0.9727032088645521, 1.1647499636184413, 1.3993010831666697, 1.6860544545395042]
    cx=x*0.886226925452758 # x/(2.0/sqrt(pi))
    ret=cx
    cxsq=cx*cx
    for c in coeffs:
      cx*=cxsq
      ret+=cx*c
    return ret

  def _icdfnormal(self, x):
    """ Inverse cumulative distribution function of the
       standard normal distribution.  """
    return self._ierf(2*x-1)*math.sqrt(2)

  def powerlognormal(self, p, sigma=1.0):
    """ Power lognormal distribution, as described in NIST/SEMATECH
     e-Handbook of Statistical Methods, http://www.itl.nist.gov/div898/handbook/,
     accessed Jun. 9, 2018, sec. 1.3.6.6.14. """
    return math.exp(self._icdfnormal(1-(1-self.rndu01())**(1.0/p))*sigma)

  def powernormal(self, p):
    """ Power normal distribution, as described in NIST/SEMATECH
     e-Handbook of Statistical Methods, http://www.itl.nist.gov/div898/handbook/,
     accessed Jun. 9, 2018, sec. 1.3.6.6.13. """
    return self._icdfnormal(1-(1-self.rndu01())**(1.0/p))

  def _mhc2(self, pdf,n,sigma=1.0):
   # Bivariate Metropolis-Hastings
   burnin=1000
   ru=[self.rndu01() for _ in range(n+burnin)]
   sqsigma=sigma*sigma
   cov=[[sqsigma,0],[0,sqsigma]]
   rn=self.multinormal_n(None,cov,n+burnin)
   ret=[0 for _ in range(n)]
   p=0
   while p==0:
    x=self.multinormal(None,cov)
    p=pdf(x)
   for i in range(n+burnin):
    newx=[x[j]+rn[i][j] for j in range(2)]
    p2=pdf(newx)
    accept=(p2>0 and p2/p>=ru[i])
    x=newx if accept else x
    p=p2 if accept else p
    if i>=burnin: ret[i-burnin]=x
   return ret

  def _mhc(self, pdf,n,sigma=1.0):
   # Univariate Metropolis-Hastings
   burnin=1000
   ru=[self.rndu01() for _ in range(n+burnin)]
   rn=[self.normal(0,sigma) for _ in range(n+burnin)]
   ret=[0 for _ in range(n)]
   p=0
   nsig=1.0/(2*sigma*sigma)
   while p==0:
    x=self.normal(0,sigma)
    p=math.exp(-0.5*(x*x)*nsig)*pdf(x)
   for i in range(n+burnin):
    newx=x+rn[i]
    p2=math.exp(-0.5*(newx*newx)*nsig)*pdf(newx)
    accept=(p2>0 and p2/p>=ru[i])
    x=newx if accept else x
    p=p2 if accept else p
    if i>=burnin: ret[i-burnin]=x
   return ret

  def slicesample(self,pdf,n,xstart=0.1):
     """
  Slice sampling of R. M. Neal.
  Generates 'n' random numbers that follow
  the probability density given in 'pdf' using
  slice sampling.  The resulting random numbers
  are not independent, but are often close to
    being independent.  'pdf' takes one number as
    a parameter and returns a number 0 or greater.
    The area under the curve (integral) of 'pdf'
    need not be equal to 1. 'xstart' should be
  chosen such that `pdf(xstart)>0`.
     """
     x=xstart
     w=0.2
     while pdf(x)<=0:
       xstart+=w
     ret=[]
     burnin=2000
     while len(ret)<n:
       y=self.rndrange(0,pdf(x))
       xleft=x
       xright=x
       while xleft==x or y<pdf(xleft):
          xleft-=w
       while xright==x or y<pdf(xright):
          xright+=w
       while True:
          x2=self.rndrange(xleft,xright)
          if y<pdf(x2):
            x=x2
            break
          if x2>x:
            xright=x2
          else:
            xleft=x2
       if burnin==0:
         ret.append(x)
       else:
         burnin-=1
     return ret

  def mcmc(self,pdf,n):
    """ Generates 'n' random numbers that follow
    the probability density given in 'pdf' using
    a Markov-chain Monte Carlo algorithm, currently
    Metropolis--Hastings.  The resulting random numbers
    are not independent, but are often close to
    being independent.  'pdf' takes one number as
    a parameter and returns a number 0 or greater.
    The area under the curve (integral) of 'pdf'
    need not be equal to 1. """
    # Compute optimal sigma.  See
    # Gelman et al., 1997.
    s=_variance(self._mhc(pdf,1000,3.0))*5.6644
    return self._mhc(pdf,n,s)

  def mcmc2(self,pdf,n):
    """ Generates 'n' pairs of random numbers that follow
    the probability density given in 'pdf' using
    a Markov-chain Monte Carlo algorithm, currently
    Metropolis--Hastings.  The resulting random pairs
    are not independent, but are often close to
    being independent.  'pdf' takes one parameter,
    namely, a list of two numbers giving a sampled
    point and returns a number 0 or greater.
    The volume under the surface (integral) of 'pdf'
    need not be equal to 1. """
    mhc=self._mhc2(pdf,1000,3.0)
    # Compute distances of random points
    # from the origin
    dists=[math.sqrt(x*x+y*y) for x, y in mhc]
    # Compute optimal sigma.  See
    # Gelman et al., 1997.
    s=_variance(dists)*5.6644
    return self._mhc2(pdf,n,s)

  def _decompose(self, matrix):
      numrows = len(matrix)
      if len(matrix[0])!=numrows: raise ValueError
      # Does a Cholesky decomposition of a matrix
      # assuming it's positive definite and invertible
      ret=[[0 for j in range(numrows)] for i in range(numrows)]
      s1 = math.sqrt(matrix[0][0])
      if s1==0: return ret # For robustness
      for i in range(0,numrows):
        ret[0][i]=matrix[0][i]*1.0/s1
      for i in range(0,numrows):
        sum=0.0
        for j in range(i): sum = sum + ret[j][i]*ret[j][i]
        sq=matrix[i][i]-sum
        if sq<0: sq=0 # For robustness
        ret[i][i]=math.sqrt(sq)
      for j in range(0,numrows):
        for i in range(j+1,numrows):
          # For robustness
          if ret[j][j]==0: ret[j][i]=0
          if ret[j][j]!=0:
            sum=0
            for k in range(j):sum = sum + ret[k][i]*ret[k][j]
            ret[j][i]=(matrix[j][i]-sum)*1.0/ret[j][j]
      return ret

  def monte_carlo_integrate(self, func, bounds, samples=1000):
    """
    Monte Carlo integral of a function.
    func - Function to integrate.  Takes the same number
       of parameters as the length of bounds.
    bounds - Bounds of integration at each dimension.
       An N-length array of arrays.  Each array in turn
       contains two items: the lower bound and upper bound
       for that dimension.
    samples - Number of times to sample the bounds of
       integration randomly.  The default is 1000 samples.
    Returns an array containing two items: the estimated
    integral and the standard error.
    """
    xm=func(*[self.rndrange(a[0],a[1]) \
      for a in bounds])
    xs=0
    i=1
    for j in range(samples):
       c=func(*[self.rndrange(a[0],a[1]) \
          for a in bounds])
       i+=1
       cxm=(c-xm)
       xm+=cxm*1.0/i
       xs+=cxm*(c-cxm)
    # Calculate the bounding volume
    volume=1
    for a in bounds:
       volume*=a[1]-a[0]
    # Return integral and standard error
    return [volume*xm,\
       volume*math.sqrt(xs*1.0/(i*i))]

  def kth_smallest_of_n_u01(self, k, n):
      """ Generates the kth smallest number among n random numbers
         from 0 to 1. """
      if k>n or n<1: raise ValueError
      if n<20:
           nums=[self.randu01() for i in n]
           nums.sort()
           return nums[k-1]
      return self.beta(k, n+1-k)

  def multinormal_n(self, mu, cov, n=1):
      mulen=len(cov)
      if mu != None:
        mulen = len(mu)
        if mulen!=len(cov): raise ValueError
        if mulen!=len(cov[0]): raise ValueError
      cho=self._decompose(cov)
      variables=[self.normal(0,1) for i in range(mulen*n)]
      ret=[[0 for i in range(mulen)] for i in range(n)]
      for k in range(n):
       js=mulen*k
       i=0
       while i<mulen:
        msum = 0
        if mu != None: msum=mu[i]
        for j in range(mulen): msum=msum+variables[js+j]*cho[j][i]
        ret[k][i]=msum
        i=i+1
      return ret

  def multinormal(self, mu, cov):
      return self.multinormal_n(mu, cov, 1)[0]

  def upper_bound_copula(self, n = 2):
      x=self.rndu01() # Generate number once
      return [x for i in range(n)]

  def product_copula(self, n = 2):
      return [self.rndu01() for i in range(n)]

  def lower_bound_copula(self):
      x=self.rndu01() # Generate number once
      return [x, 1.0 - x]

  def gaussian_copula(self, cov):
       mvn=self.multinormal(None, cov)
       for i in range(len(cov)):
          # Apply the normal distribution's CDF
          # to get uniform variables
          mvn[i] = (math.erf(mvn[i]/(math.sqrt(2)*math.sqrt(cov[i][i])))+1)*0.5
       return mvn

  def multivariate_t(self, mu, cov, df):
     """ Multivariate t-distribution, mu is the mean (can be None),
           cov is the covariance matrix, and df is the degrees of freedom. """
     mn=self.multinormal(None, cov)
     cd=self.gamma(df*0.5,2.0/df)
     return [(0 if mu==None else mu[i])+mn[i]/math.sqrt(cd) for i in range(len(mn))]

  def _pochhammer(self, a, b):
    return math.gamma(a+b)/math.gamma(a)

  def _beta(self, a, b):
    return math.gamma(a)*math.gamma(b)/math.gamma(a+b)

  def _betainc(self, x, a, b):
    # Incomplete beta function.  NOTES:
    # 1. The SciPy method
    # scipy.stats.betainc(a, b, x) is the same as _betainc(x, a, b).
    # 2. This is also the beta distribution's CDF.
    if x>0.5 and x < 1.0: return 1.0 - self._betainc(1.0 - x, b, a)
    if x==0 and a>0: return 0.0
    if b<50 and math.floor(b)==b:
        if b<0: return 0
        return (x**a)*sum([ \
            self._pochhammer(a,i)*pow(1-x,i)*1.0/math.gamma(i+1) \
            for i in range(int(b))])
    if a>0 and a<50 and math.floor(a)==a:
        return 1.0-((1.0-x)**b)*sum([ \
            self._pochhammer(b,i)*(x**i)*1.0/math.gamma(i+1) \
            for i in range(int(a))])
    ret=pow(10,-100)
    d=0
    c=ret
    i=0
    k=0
    while i < 100:
        # Get next convergent of continued fraction
        if i==0: num=1.0
        else:
          if (i&1)==1: num=-(a+k)*(a+b+k)*x*1.0/((a+i-1)*(a+i))
          else: num=(b-k)*k*x*1.0/((a+i-1)*(a+i))
        c=1+num/c # 1 is the convergent's denominator
        d=1+num*d # ditto
        if d==0: d=pow(10,-100)
        if c==0: c=pow(10,-100)
        d=1.0/d
        delta=d*c
        ret*=delta
        if abs(delta-1.0)<pow(10,-14): break
        i=i+1
        if (i&1)==0: k=k+1
    return ret*(x**a)*((1-x)**b)/(a*self._beta(a,b))

  def _student_t_cdf(self,nu, x):
    if x<=0:
       return self._betainc(nu/(x*x+nu),nu*0.5,0.5)*0.5
    else:
       return (self._betainc((x*x)/(x*x+nu),0.5,nu*0.5)+1)*0.5

  def t_copula(self, cov, df):
    """ Multivariate t-copula. 'cov' is the covariance matrix
       and 'df' is the degrees of freedom.  """
    mt=self.multivariate_t(None, cov, df)
    return [self._student_t_cdf(df, mt[i]) \
        for i in range(len(mt))]

  def simplex_point(self, points):
       """ Generates an independent and uniform random point on the surface of an N-dimensional
           simplex (line segment, triangle, tetrahedron, etc.)
           with the given coordinates. """
       ret=[]
       if len(points) > len(points[0])+1: raise ValueError
       if len(points)==1: # Return a copy of the point
         for i in range(0,len(points[0])): ret.append(points[0][i])
         return ret
       gammas=[]
       # Sample from a Dirichlet distribution
       simplexDims=len(points)-1
       for i in range(0,len(points)): gammas.append(self.exponential())
       tsum=0
       for i in range(0,len(gammas)): tsum = tsum + gammas[i]
       tot = 0
       for i in range(0,len(gammas) - 1):
           gammas[i] = gammas[i] / tsum
           tot = tot + gammas[i]
       tot = 1.0 - tot
       for i in range(0,len(points[0])): ret.append(points[0][i]*tot)
       for i in range(1,len(points)):
          for j in range(0,len(points[0])):
             ret[j]=ret[j]+points[i][j]*gammas[i-1]
       return ret

  def hypercube_point(self, dims, sizeFromCenter = 1):
      """ Generates an independent and uniform random point on the surface of a 'dims'-dimensional
           hypercube (square, cube, etc.)
           centered at the origin. """
      return [self.rndrange(-sizeFromCenter,sizeFromCenter) \
         for _ in range(dims)]

  def _norm(self, vec):
      return math.sqrt(sum([x*x for x in vec]))

  def _sumsq(self, vec):
      return sum([x*x for x in vec])

  def _numngrad(self, f, u, v):
    """ Numerical norm of gradient. """
    eu=f(u,v)
    du=None
    dv=None
    edu=f(u+0.00001,v)
    if edu[0]==0 and edu[1]==0 and edu[2]==0:
      edu=f(u-0.00001,v)
      du=[(eu[i]-edu[i])/0.00001 for i in range(3)]
    else:
      du=[(edu[i]-eu[i])/0.00001 for i in range(3)]
    edu=f(u,v+0.00001)
    if edu[0]==0 and edu[1]==0 and edu[2]==0:
      edu=f(u,v-0.00001)
      dv=[(eu[i]-edu[i])/0.00001 for i in range(3)]
    else:
      dv=[(edu[i]-eu[i])/0.00001 for i in range(3)]
    gx=du[1] * dv[2] - du[2] * dv[1]
    gy=du[2] * dv[0] - du[0] * dv[2]
    gz=du[0] * dv[1] - du[1] * dv[0]
    return math.sqrt(gx*gx+gy*gy+gz*gz)

  def surface_point(self, f, bounds, ngrad, gmax):
    """ Generates a uniform random point on
        a parametric surface, using a rejection
        approach developed by Williamson, J.F.,
        Physics in Medicine & Biology 32(10), 1987.
     - f: Takes two parameters (u and v) and returns
       a 3-element array expressing
       a 3-dimensional position at the given point.
     - bounds: Two 2-element arrays expressing bounds
       for u and v.  Of the form [[umin, umax], [vmin,
       vmax]].
     - ngrad: Takes two parameters (u and v) and returns
       the norm of the gradient (stretch factor)
       at the given point.  Can be None, in which
       the norm-of-gradient is calculated numerically.
     - gmax: Maximum norm-of-gradient
       for entire surface.
       """
    while True:
       u=self.rndrangemaxexc(bounds[0][0],bounds[0][1])
       v=self.rndrangemaxexc(bounds[1][0],bounds[1][1])
       pt=f(u,v)
       nog=self._numngrad(f,u,v) if ngrad==None else ngrad(u,v)
       if nog>=self.rndrange(gmax):
          return pt

  def geoellipsoid_point(self, a=6378.137, \
        invf=298.2572236):
     """ Generates an independent and uniform random
      point on the surface of a geoellipsoid.  The
      geoellipsoid uses the following parameters:
      a - semimajor axis (distance from the center of
         the geoellipsoid to the equator).  The default
         is the WGS 84 ellipsoid's semimajor axis
         in kilometers.
      invf - inverse flattening.  The default is the
         WGS 84 ellipsoid's inverse flattening. """
     # b is the semiminor axis, the distance from the
     # center of the geoellipsoid to the north pole
     b=a-(a*1.0/invf)
     semim=b/a
     semimp4=semim*semim*semim*semim
     semiminv=1.0/semim
     while True:
       # Generate an ellipsoidal point, then accept or
       # reject it depending on its stretch factor (norm-of-
       # gradient).  This rejection approach for sampling
       # curved surfaces was developed by Williamson, J.F.,
       # Physics in Medicine & Biology 32(10), 1987.
       # Generate a spherical point
       pt=self.hypersphere_point(3)
       # Make it ellipsoidal
       pz=pt[2]*semim
       # g is:
       # - the norm of the gradient for (pt[0],pt[1],pz),
       #   divided by
       # - the maximum possible value of that norm for
       #   the whole ellipsoid
       g=semiminv*math.sqrt(pz*pz+semimp4*(pt[0]*pt[0]+ \
           pt[1]*pt[1]))
       if self.rndu01()<=g:
           # Accept the equivalent point
           # on the geoellipsoid
           return [pt[0]*a,pt[1]*a,pt[2]*b]

  def hypersphere_point(self, dims, radius = 1):
      """ Generates an independent and uniform random point on the surface of a 'dims'-dimensional
           hypersphere (circle, sphere, etc.)
           centered at the origin. """
      if dims==2:
        # Use polar method mentioned in Devroye 1986, p. 235
        while True:
          a=self.rndrange(-1,1)
          b=self.rndrange(-1,1)
          c=a*a; d=b*b; e=c+d
          if e!=0 and e<=1:
            ie=radius/e
            return [(c-d)*ie,a*b*ie*2]
      x=0
      while x==0:
        ret=[self.normal() for _ in range(dims)]
        x=self._norm(ret)
      return [i*radius/x for i in ret]

  def ball_point(self, dims, radius = 1):
      """ Generates an independent and uniform random point inside a 'dims'-dimensional
           ball (disc, solid sphere, etc.) centered at the origin. """
      x=0
      while x==0:
        ret=[self.normal() for _ in range(dims)]
        x=math.sqrt(self._sumsq(ret)+self.exponential())
      return [i*radius/x for i in ret]

  def shell_point(self, dims, outerRadius = 1, innerRadius = 0.5):
      """ Generates an independent and uniform random point inside a 'dims'-dimensional
           spherical shell (donut, hollow sphere, etc.)
           centered at the origin. """
      r=self.rndrange(innerRadius**dims,\
           outerRadius**dims)**(1.0/dims)
      return self.hypersphere_point(dims, r)

  def latlon(self):
      """ Generates an independent and uniform random latitude and
          longitude, in radians.  West and south coordinates
          are negative. """
      lon=self.rndrangemaxexc(-math.pi,math.pi)
      latx=self.rndrange(-1,1)
      while latx==-1 or latx==1:
        latx=self.rndrange(-1,1)
      lat=math.atan2(math.sqrt(1-latx*latx),latx) -\
        math.pi * 0.5
      return [lat,lon]

  def integers_from_pdf(self,pdf,mn,mx,n = 1):
      """ Generates one or more random integers from a discrete probability
         distribution expressed as a probability density
         function (PDF), which is also called the probability mass
         function for discrete distributions.  The random integers
         will be in the interval [mn, mx].  `n` random integers will be
         generated. `pdf` is the PDF; it takes one parameter and returns,
         for that parameter, a weight indicating the relative likelihood
         that a random integer will equal that parameter.
         The area under the "curve" of the PDF need not be 1.
         By default, `n` is 1.  """
      wt=[pdf(x) for x in range(mn,mx)]
      return r._weighted_choice_n(wt,n,mn)

  def numbers_from_pdf(self, pdf, mn, mx, n = 1, steps = 100):
      """ Generates one or more random numbers from a continuous probability
         distribution expressed as a probability density
         function (PDF).  The random number
         will be in the interval [mn, mx].  `n` random numbers will be
         generated. `pdf` is the PDF; it takes one parameter and returns,
         for that parameter, a weight indicating the relative likelihood
          that a random number will be close to that parameter. `steps`
         is the number of subintervals between sample points of the PDF.
         The area under the curve of the PDF need not be 1.
         By default, `n` is 1 and `steps` is 100.  """
      values=[mn+(mx-mn)*i*1.0/steps for i in range(steps+1)]
      weights=[pdf(v) for v in values]
      return self.continuous_choice_n(values,weights,n)

  def numbers_from_cdf(self, cdf, mn, mx, n = 1, steps = 100):
      """ Generates one or more random numbers from a continuous probability
         distribution by numerically inverting its cumulative
         distribution function (CDF).  The random number
         will be in the interval [mn, mx].  `n` random numbers will be
         generated. `cdf` is the CDF; it takes one parameter and returns,
         for that parameter, the probability that a random number will
         be less than or equal to that parameter. `steps` is the number
         of subintervals between sample points of the CDF.
         By default, `n` is 1 and `steps` is 100.  """
      ntable=numericalTable(cdf, mn, mx, steps)
      return [self.from_interp(ntable) for i in range(n)]

  def from_interp(self, table):
     """ Generates a random number given a list of CDF--number
       pairs sorted by CDF.

       An example of this list is as follows.
       ` [[0.1, 0], [0.4, 1], [0.8, 2], [0.9, 3], [0.95, 4], [0.99, 5]]`

       In this example, the first item of each pair is the value of
       a cumulative distribution function (CDF) and is in the interval [0, 1],
       and the second item is the number associated with that CDF's
       value. The random number will fall within the range of numbers
       suggested in the table, which will be in the interval [0, 5] in the
       example above.

       The `numericalTable` method generates an appropriate table
       for this method's `table` parameter, given a CDF and a range
       of numbers.
       """
     while True:
        x=_tableInterpSearch(table, self.rndu01())
        if x!=None: return x

  def randomwalk_u01(self,n):
     """ Random walk of uniform 0-1 random numbers. """
     ret=[0 for i in range(n+1)]
     for i in range(n):
        ret[i]=self.rndu01()
     for i in range(n):
        ret[i+1]=ret[i+1]+ret[i]
     return ret

  def randomwalk_posneg1(self,n):
     """ Random walk of uniform positive and negative steps. """
     ret=[0 for i in range(n+1)]
     for i in range(n):
        ret[i]=self.rndint(1)*2-1
     for i in range(n):
        ret[i+1]=ret[i+1]+ret[i]
     return ret

  def wiener(self, st, en, step=1.0, mu = 0.0, sigma = 1.0):
      """ Generates random numbers following a Wiener
            process (Brownian motion). Each element of the return
            value contains a timestamp and a random number in that order. """
      if st==en: return [[st, self.normal(mu*st,sigma*math.sqrt(st))]]
      ret=[]
      i=st
      lastv=0
      lasttime=st
      while i < en:
         if i==st: lastv=self.normal(mu*st,sigma*math.sqrt(st))
         else: lastv=lastv+self.normal(mu*step,sigma*math.sqrt(step))
         lasttime=i
         ret.append([i, lastv])
         i+=step
      lastv=lastv+self.normal(mu*(en-lasttime),sigma*math.sqrt(en-lasttime))
      ret.append([i, lastv])
      return ret

class ConvexPolygonSampler:
  """ A class for uniform random sampling of
      points from a convex polygon.  This
      class only supports convex polygons because
      the random sampling process involves
      triangulating a polygon, which is trivial
      for convex polygons only. "randgen" is a RandomGen
      object, and "points" is a list of points
      (two-item lists) that make up the polygon.  """
  def __init__(self, randgen, points):
    if len(points)<3: raise ValueError
    self.randgen=randgen
    self.points=[[p[0],p[1]] for p in points]
    # Triangulate polygon
    self.triangles=[\
      [self.points[0],self.points[i],self.points[i+1]]\
      for i in range(1,len(self.points)-1)]
    # Calculate areas for each triangle
    self.areas=[self._area(t) for t in self.triangles]

  def _area(self,tri):
    return abs(\
            (tri[1][0]-tri[0][0])*\
            (tri[2][1]-tri[0][1])-\
            (tri[2][0]-tri[0][0])*\
            (tri[1][1]-tri[0][1]))*0.5

  def sample(self):
    """ Choose a random point in the convex polygon
        uniformly at random. """
    index=self.randgen.weighted_choice(self.areas)
    tri=self.triangles[index]
    return self.randgen.simplex_point(tri)

class AlmostRandom:
  def __init__(self, randgen, list):
    if len(list)==0:
      raise ValueError
    self.randgen=randgen
    self.list=self.randgen.shuffle([x for x in list])
    self.index=0

  def choose(self):
    if self.index>=len(self.list):
      self.index=0
      self.list=self.randgen.shuffle(self.list)
    item=self.list[self.index]
    self.index+=1
    return item

# Examples of use
if __name__ == "__main__":
    # Generate multiple dice rolls
    randgen=RandomGen()
    dierolls=[randgen.diceRoll(2,6) for i in range(10)]
    # Results
    print("Results: %s" % (dierolls))
    # Highest die roll
    print("Highest: %d" % (max(dierolls)))
    # Lowest die roll
    print("Lowest: %d" % (min(dierolls)))
    # Sum, dropping the lowest
    print("Sum: %d" % (sum(dierolls)))
    # Sum, dropping the lowest
    print("Drop-the-lowest: %d" % (sum(dierolls)-min(dierolls)))
    #
    #  Weighted choice
    #
    ranges=[[0, 5], [5, 10], [10, 11], [11, 13]]
    weights=[3,15,1,2]
    def rc():
        index=randgen.weighted_choice(weights)
        item=ranges[index] # Choose a random range
        return randgen.rndintexcrange(item[0],item[1])
    print("Weighted choice results")
    print([rc() for i in range(25)])
    #
    #  Model times to failure
    #
    rate = 1.0/1000 # Failure rate
    print("Times to failure (rate: %f)" % (rate))
    print([randgen.exponential(rate) for i in range(25)])
    #  Multinormal
    print("Multinormal sample")
    for i in range(10):
       print(randgen.multinormal(None, [[1, 0],[0, 1]]))
    # Random walks
    print("Random walks")
    print(randgen.randomwalk_u01(50))
    print(randgen.randomwalk_posneg1(50))
    # White noise
    print("White noise")
    print([randgen.normal() for i in range(20)])
    # Demonstrate numerical CDF inversion
    print("Gaussian values by CDF inversion")
    normal_cdf = lambda x: 0.5*(1+math.erf(x/math.sqrt(2)))
    print(randgen.numbers_from_cdf(normal_cdf, -6, 6, n=30))
    # Geoellipsoid points
    print("Geoellipsoid points")
    print([randgen.geoellipsoid_point() for i in range(20)])
    # Convex polygon sampler
    poly=[[0,0],[0,20],[20,20],[20,0]]
    cps=ConvexPolygonSampler(randgen, poly)
    print("Sampling a rectangle")
    for i in range(10):
       print(cps.sample())
    # Estimating raw moments of a normal distribution
    n=[randgen.normal() for i in range(10000)]
    print("Estimating expectation values of a normal distribution")
    print("Mean ~= %f" % (_mean([x for x in n])))
    print("2nd raw moment ~= %f" % (_mean([x**2 for x in n])))
    print("3rd raw moment ~= %f" % (_mean([x**3 for x in n])))
    print("4th raw moment ~= %f" % (_mean([x**4 for x in n])))
    print("5th raw moment ~= %f" % (_mean([x**5 for x in n])))
    print("Mean of sines (E<sin(x)>) ~= %f" % \
      (_mean([math.sin(x) for x in n])))

    # Estimates expectation given
    # an array of samples
    def expect(a,f):
      return _mean([f(x) for x in a])

    def trim(x,f):
      ret=[]
      for i in x:
        if f(i): ret.append(i)
      return ret

    # Two ways to get the estimated
    # conditional expectation given
    # an array of samples and a predicate
    def condexpect1(a,f,pred):
      e1=expect(nums,lambda x: (f(x) if pred(x) else 0))
      # e2 is probability given predicate
      e2=expect(nums,lambda x: (1 if pred(x) else 0))
      return e1/e2

    def condexpect2(a,f,pred):
      # Expectation of only the samples
      # that meet the predicate
      return expect(trim(a,pred),f)

    # Conditional expectation estimation
    nums=[abs(randgen.normal(0,1)) for _ in range(10000)]
    epred=lambda x: x<2
    efunc=lambda x: x*x
    print(expect(nums,efunc))
    print(condexpect1(nums,efunc,epred))
    print(condexpect2(nums,efunc,epred))
