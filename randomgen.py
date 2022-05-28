"""
Sample code for the article "Randomization and Sampling Methods"
https://www.codeproject.com/Articles/1190459/Random-Number-Generation-Methods

Written by Peter O.
Any copyright to this work is released to the Public Domain.
In case this is not possible, this work is also
licensed under Creative Commons Zero (CC0):
https://creativecommons.org/publicdomain/zero/1.0/
"""

# TODO: Use betadist's PSRN methods here somehow

import math
import random
from fractions import Fraction
from betadist import *

_SIGBITS = 53
_FLOAT_MAX = 1.7976931348623157e308

def _mean(list):
    if len(list) <= 1:
        return 0
    xm = list[0]
    i = 1
    while i < len(list):
        c = list[i]
        i += 1
        cxm = c - xm
        xm += cxm * 1.0 / i
    return xm

def _variance(list):
    if len(list) <= 1:
        return 0
    xm = list[0]
    xs = 0
    i = 1
    while i < len(list):
        c = list[i]
        i += 1
        cxm = c - xm
        xm += cxm * 1.0 / i
        xs += cxm * (c - xm)
    return xs * 1.0 / (len(list) - 1)

def _tableInterpSearch(table, x, censor=False):
    # Effective length is the length of table minus 1
    tablelen = len(table) - 1
    left = 0
    right = tablelen - 1
    while left <= right:
        index = int((left + right) / 2)
        c = table[index]
        n = table[index + 1]
        if x >= c[0] and x < n[0]:
            interp = (x - c[0]) * 1.0 / (n[0] - c[0])
            return c[1] + (n[1] - c[1]) * interp
        if x > c[0]:
            left = index + 1
            continue
        right = index - 1
        continue
    if censor:
        if x <= table[0][0]:
            return table[0][1]
        if x >= table[tablelen][0]:
            return table[tablelen][1]
    return None

def numericalTable(func, x, y, n=100):
    ret = [x + (y - x) * (i * 1.0 / n) for i in range(n + 1)]
    return [[func(b), b] for b in ret]

class VoseAlias:
    """
    Implements Vose's version of the alias sampler, which chooses a random number in [0, n)
    where the probability that each number is chosen is weighted.  The 'weights' is the
    list of weights each 0 or greater; the higher the weight, the greater
    the probability.  This sampler supports integer or non-integer weights.

    Reference:
    Vose, Michael D. "A linear algorithm for generating random numbers with a given
    distribution." IEEE Transactions on software engineering 17, no. 9 (1991): 972-975.
    """

    def __init__(self, weights):
        # Vose's alias method for large n and nonnegative
        # weights.  This method has a non-trivial setup,
        # but a linear-time sampling step in n.
        prob = [0 for _ in weights]
        alias = [0 for _ in weights]
        tmp = [p * len(weights) for p in weights]
        mn = min(weights)
        mx = max(weights)
        ms = sum(weights)
        small = [i for i in range(len(tmp)) if tmp[i] < ms]
        large = [i for i in range(len(tmp)) if tmp[i] >= ms]
        sc = len(small)
        lc = len(large)
        while sc > 0 and lc > 0:
            lv = small[sc - 1]
            g = large[lc - 1]
            prob[lv] = tmp[lv]
            alias[lv] = g
            overhead = (tmp[g] + tmp[lv]) - ms
            if overhead < ms:
                small[sc - 1] = g
                lc -= 1
            else:
                sc -= 1
            tmp[g] = overhead
        for i in range(sc):
            prob[small[i]] = ms
        for i in range(lc):
            prob[large[i]] = ms
        if len(prob) != len(weights):
            raise ValueError("Internal error")
        if len(alias) != len(weights):
            raise ValueError("Internal error")
        self.total = ms
        self.prob = prob
        self.alias = alias

    def next(self, randgen):
        d = randgen.rndintexc(len(self.prob))
        da = self.alias[d]
        if d == da:
            return d
        tsample = (
            randgen.rndintexc(self.total)
            if int(self.total) == self.total
            else randgen.rndrangemaxexc(0, self.total)
        )
        return d if tsample < self.prob[d] else da

class BringmannLarsen:
    """
    Implements Bringmann and Larsen's sampler, which chooses a random number in [0, n)
    where the probability that each number is chosen is weighted.  The 'weights' is the
    list of weights each 0 or greater; the higher the weight, the greater
    the probability.  This sampler supports only integer weights.
    This is a succinct (space-saving) data structure for this purpose.

    Reference:
    K. Bringmann and K. G. Larsen, "Succinct Sampling from Discrete
    Distributions", In: Proc. 45th Annual ACM Symposium on Theory
    of Computing (STOC'13), 2013.
    """

    def __init__(self, weights):
        w = 32
        wc = w - 12
        totalWeights = sum(weights)
        n = len(weights)
        if totalWeights < 0:
            raise ValueError("Sum of weights is negative")
        self.large = totalWeights >= (1 << (wc - 1)) * n
        # NOTE: Storing the max is not strictly necessary,
        # but helps avoid high rejection rates
        self.maxWeight = max(weights)
        if not self.large:
            bitlength = 0
            self.bits = 0
            self.shorts = 0
            self.n = n
            bs = 0
            for i in range(n):
                if weights[i] < (1 << wc):
                    self.bits |= weights[i] << bs
                    bs += wc
                else:
                    if weights[i] >= (1 << w):
                        raise ValueError
                    self.bits |= weights[i] << bs
                    self.shorts |= 1 << i
                    bs += w
        else:
            self.weights = [x for x in weights]

    def _ranki(self, i):
        ret = 0
        for j in range(i):
            ret += (self.shorts >> j) & 1
        return ret

    def next(self, randgen):
        w = 32
        wc = w - 12
        if self.large:
            while True:
                v = randgen.rndintexc(len(self.weights))
                # NOTE: Using stored max weight instead of a constant 2^w
                # (which the paper uses for space saving), to avoid
                # high rejection rates.  However, the algorithm is
                # still correct in either case (except in the latter case
                # when self.maxWeight >= 2^w).
                if randgen.zero_or_one(self.weights[v], self.maxWeight) == 1:
                    return v
        else:
            while True:
                v = randgen.rndintexc(self.n)
                k = self._ranki(v)
                bp = k * w + (v - k) * wc
                bl = w if self._ranki(v + 1) > k else wc
                weight = (self.bits >> bp) & ((1 << bl) - 1)
                # NOTE: See note above
                if randgen.zero_or_one(weight, self.maxWeight) == 1:
                    return v

class FastLoadedDiceRoller:
    """
    Implements the Fast Loaded Dice Roller, which chooses a random number in [0, n)
    where the probability that each number is chosen is weighted.  The 'weights' is the
    list of weights each 0 or greater; the higher the weight, the greater
    the probability.  This sampler supports only integer weights.

    Reference: Saad, F.A., Freer C.E., et al. "The Fast Loaded Dice Roller: A
    Near-Optimal Exact Sampler for Discrete Probability Distributions", in
    _AISTATS 2020: Proceedings of the 23rd International Conference on Artificial
    Intelligence and Statistics, Proceedings of Machine Learning Research_ 108,
    Palermo, Sicily, Italy, 2020.
    """

    def __init__(self, weights):
        self.n = len(weights)
        if self.n == 1:
            return
        weightBits = 0
        totalWeights = sum(weights)
        if totalWeights < 0:
            raise ValueError("Sum of weights is negative")
        if totalWeights == 0:
            raise ValueError("Sum of weights is zero")
        tmp = totalWeights - 1
        while tmp > 0:
            tmp >>= 1
            weightBits += 1
        lasta = (1 << weightBits) - totalWeights
        self.leavesAndLabels = [
            [0 for i in range(weightBits)] for j in range(self.n + 2)
        ]
        shift = weightBits - 1
        for j in range(weightBits):
            level = 1
            for i in range(self.n + 1):
                ai = lasta if i == self.n else weights[i]
                if ai < 0:
                    raise ValueError
                leaf = (ai >> shift) & 1
                if leaf > 0:
                    # NOTE: Labels start at 1
                    self.leavesAndLabels[0][j] += leaf
                    self.leavesAndLabels[level][j] = i + 1
                    level += 1
            shift -= 1

    def codegen(self, name="sample_discrete"):
        """Generates standalone Python code that samples
                from the distribution modeled by this class.
                Idea from Leydold, et al.,
                "An Automatic Code Generator for
                Nonuniform Random Variate Generation", 2001.
        - name: Method name. Default: 'sample_discrete'."""
        ret = "import random\n\n"
        ret += "TABLE_" + name + " = ["
        for i in range(len(self.leavesAndLabels)):
            if i > 0:
                ret += ", "
            ret += "%s" % (str(self.leavesAndLabels[i]),)
        ret += "]\n\n"
        ret += "def " + name + "():\n"
        if self.n <= 1:
            ret += "return 0\n\n"
        else:
            ret += "  x = 0\n"
            ret += "  y = 0\n"
            ret += "  while True:\n"
            ret += "    x = random.randint(0, 1) | (x << 1)\n"
            ret += "    leaves = TABLE_" + name + "[0][y]\n"
            ret += "    if x < leaves:\n"
            ret += "        label = TABLE_" + name + "[x + 1][y]\n"
            ret += "        if label <= %d:\n" % (self.n)
            ret += "            return label - 1\n"
            ret += "        x = 0\n"
            ret += "        y = 0\n"
            ret += "    else:\n"
            ret += "        x -= leaves\n"
            ret += "        y += 1\n"
            return ret

    def next(self, randgen):
        if self.n == 1:
            return 0
        x = 0
        y = 0
        while True:
            x = randgen.randbit() | (x << 1)
            leaves = self.leavesAndLabels[0][y]
            if x < leaves:
                label = self.leavesAndLabels[x + 1][y]
                if label <= self.n:
                    # NOTE: The number of bits consumed
                    # by this call (A), as well as
                    # (label - 1) (B), are two separate
                    # random variables that could be
                    # recycled via a randomness extraction
                    # method to generate additional uniform
                    # random bits, as explained by L.
                    # Devroye and C. Gravel, arXiv:1502.02539 [cs. IT]
                    # More specifically, the expected number of bits
                    # that can be extracted this way is the amount
                    # of randomness in A given that this call returns a
                    # specific label.
                    return label - 1
                x = 0
                y = 0
            else:
                x -= leaves
                y += 1

class SortedAliasMethod:
    """Implements a weighted sampling table
    where each weight must be in sorted
    order (ascending or descending).
    When many entries are in the table,
    the initialization is faster than with
    FastLoadedDiceRoller or VoseAlias.  Reference:
    K. Bringmann and K. Panagiotou, "Efficient Sampling
    Methods for Discrete Distributions." In: Proc. 39th
    International Colloquium on Automata, Languages,
    and Programming (ICALP'12), 2012.
    -  p: List of weights, in sorted order (ascending or
        descending).
    """

    def __init__(self, p):
        ps = sum(p)
        asc = True
        if p[0] > p[1] or p[0] > p[len(p) - 1]:
            asc = False
            for i in range(len(p) - 1):
                if p[i] < p[i + 1]:
                    raise ValueError("Not in sorted order")
        else:
            for i in range(len(p) - 1):
                if p[i] > p[i + 1]:
                    raise ValueError("Not in sorted order")
        q = []
        k = 0
        self.asc = asc
        self.n = len(p)
        while ((1 << k) - 1) < len(p):
            qk = min(2 << k, len(p) + 1) - (1 << k)
            pIndex = (1 << k) - 1
            if asc:
                pIndex = self.n - 1 - pIndex
            qk *= Fraction(p[pIndex], ps)
            q.append(int(qk * ps))
            k += 1
        self.alias = randomgen.FastLoadedDiceRoller(q)
        self.p = [x for x in p]

    def next(self, rg):
        while True:
            k = self.alias.next(rg)
            rmn = 1 << k
            rmx = min((2 << k) - 1, self.n)
            ret = rg.rndintrange(rmn, rmx) - 1
            pIndex = (1 << k) - 1
            if self.asc:
                ret = self.n - 1 - ret
                pIndex = self.n - 1 - pIndex
            if rg.zero_or_one(self.p[ret], self.p[pIndex]) == 1:
                return ret

class OptimalSampler:
    """
    Implements a sampler which chooses a random number in [0, n)
    where the probability that each number is chosen is weighted.  The 'weights' is the
    list of weights each 0 or greater; the higher the weight, the greater
    the probability.  This sampler supports only integer weights, but the sampler is
    entropy-optimal as long as the sum of those weights is of the form 2^k or 2^k-2^m.

    Reference: Feras A. Saad, Cameron E. Freer, Martin C. Rinard, and Vikash K. Mansinghka.
    Optimal Approximate Sampling From Discrete Probability Distributions. Proc.
    ACM Program. Lang. 4, POPL, Article 36 (January 2020), 33 pages.
    """

    def __init__(self, m):
        s = sum(m)
        if s <= 0:
            raise ValueError
        if len(m) == 1:
            # degenerate
            self.k = self.l = 0
            self.rej = -1
            self.lin = [-1]
        else:
            pm, self.l, self.rej = self._preparematrix(m)
            self.k = s.bit_length()
            leaves = {}
            i = 2
            for x in range(self.k):
                for y in range(len(pm)):
                    if ((pm[y] >> (self.k - 1 - x)) & 1) != 0:
                        leaves[i] = y + 1
                        i -= 1
                i = 2 + (i << 1)
            root = self._tree(0, [], leaves)
            self.lin = []
            self._pack(self.lin, root, 0)

    def next(self, rg):
        if len(self.lin) == 1:
            return 0
        x = 0
        while True:
            x = self.lin[x + rg.randbit()]
            if self.lin[x] < 0:
                # Subtract by 1 because we're returning
                # values in [0, n)
                ret = (-self.lin[x]) - 1
                if ret == self.rej:
                    continue
                return ret

    def nextFromMatrix(self, pm, rg):
        # Alternate sampler that samples directly
        # from the probability matrix,
        # rather than the encoded DDG tree.  It is
        # entropy-optimal as long as there is no
        # rejection event.
        if len(pm) == 1:
            return 0
        x = 0
        y = 0
        while True:
            x = (x << 1) | rg.randbit()
            for z in range(len(pm)):
                x -= (pm[z] >> (self.k - 1 - y)) & 1
                # Handle rejection event
                if x == -1 and z == self.rej:
                    x = 0
                    y = -1
                    break
                # Use z, not z+1, because we're returning
                # values in [0, n)
                if x == -1:
                    return z
            y = self.l if (y == self.k - 1) else (y + 1)

    def codegen(self, name="sample_discrete"):
        """Generates standalone Python code that samples
                from the distribution modeled by this class.
                Idea from Leydold, et al.,
                "An Automatic Code Generator for
                Nonuniform Random Variate Generation", 2001.
        - name: Method name. Default: 'sample_discrete'."""
        ret = "import random\n\n"
        ret += "TABLE_" + name + " = ["
        for i in range(len(self.lin)):
            if i > 0:
                ret += ", "
            ret += "%s" % (self.lin[i],)
        ret += "]\n\n"
        ret += "def " + name + "():\n"
        if self.lin == 1:
            ret += "  return 0\n\n"
        else:
            ret += "  x = 0\n"
            ret += "  while True:\n"
            ret += "    x = TABLE_" + name + "[x + random.randint(0, 1)]\n"
            ret += "    if TABLE_" + name + "[x] < 0:\n"
            if self.rej >= 0:
                ret += "      ret = (-TABLE_" + name + "[x]) - 1\n"
                ret += "      if ret == self.rej: continue\n"
                ret += "      return ret\n\n"
            else:
                ret += "      return (-TABLE_" + name + "[x]) - 1\n\n"
        return ret

    def _pack(self, lin, node, o):
        node[3] = o
        wt = 0
        if node[0] != None:
            while o >= len(lin):
                lin.append(0)
            lin[o] = -node[0]
            return o + 1
        if (not node[1]) or (not node[2]):
            raise ValueError
        if node[1][3] != None:
            while o >= len(lin):
                lin.append(0)
            lin[o] = node[1][3]
            wt = o + 2
        else:
            while o >= len(lin):
                lin.append(0)
            lin[o] = o + 2
            wt = self._pack(lin, node[1], o + 2)
        if node[2][3] != None:
            while o + 1 >= len(lin):
                lin.append(0)
            lin[o + 1] = node[2][3]
        else:
            while o + 1 >= len(lin):
                lin.append(0)
            lin[o + 1] = wt
            wt = self._pack(lin, node[2], wt)
        return wt

    def _makeleaftable(self, p, k):
        leaves = {}
        i = 2
        for x in range(k):
            for y in range(len(p)):
                if ((p[y] >> (k - 1 - x)) & 1) != 0:
                    leaves[i] = y + 1
                    i -= 1
            i = 2 + (i << 1)
        return leaves

    def _tree(self, i, ancestors, leaves):
        # sanity check
        if i > (1 << (self.k + 3)):
            raise ValueError
        if i in leaves:
            return [leaves[i], None, None, None]  # Leaf node
        else:
            node = [None, None, None, None]  # label, left, right, loc
            level = (i + 1).bit_length() - 1
            if level == self.l:
                ancestors.append(node)
            if level == self.k - 1 and not (2 * i + 2 in leaves):
                node[2] = ancestors.pop()
            else:
                node[2] = self._tree(2 * i + 2, ancestors, leaves)
            if level == self.k - 1 and not (2 * i + 1 in leaves):
                node[1] = ancestors.pop()
            else:
                node[1] = self._tree(2 * i + 1, ancestors, leaves)
            return node

    def _preparematrix(self, m):
        s = sum(m)
        if s <= 0 or len(m) < 2:
            raise ValueError
        k = s.bit_length()
        l = 0
        rejectionEvent = -1
        if s != (1 << k):
            accept = False
            acceptable = 1 << k
            acceptableL = k
            l = 1
            while l < k:
                if s == (1 << k) - (1 << l):
                    accept = True
                    break
                elif s > (1 << k) - (1 << l):
                    break
                else:
                    acceptableL = l
                    acceptable = (1 << k) - (1 << l)
                l += 1
            if not accept:
                # Add a "rejection" event (suggested
                # for the Fast Loaded Dice Roller but not
                # in optimal approximate sampling paper,
                # which supports only certain sums of
                # weights)
                l = acceptableL
                rejectionEvent = acceptable - s
        b = []
        mv = len(m) + 1 if rejectionEvent >= 0 else len(m)
        for i in range(mv):
            mi = rejectionEvent if i >= len(m) else m[i]
            x = 0
            y = 0
            if l == k:
                x = mi
            elif l == 0:
                y = mi
            else:
                msk = (1 << (k - l)) - 1
                x = mi // msk
                y = mi - msk * x
            xy = (x << (k - l)) | y
            if xy >= (1 << k):
                raise ValueError
            b.append(xy)
        return [b, l, len(m) if rejectionEvent >= 0 else -1]

class _BinomialAliasTable:
    def __init__(self, aliases, entries, n):
        self.aliases = aliases
        if len(entries) != len(aliases):
            raise ValueError
        if aliases[len(aliases) - 1] != -1:
            raise ValueError
        self.failureEntry = entries[len(entries) - 1]
        self.failureCumul = []
        self.failureRaw = []
        self.failureAlias = None
        self.failureCc = 1
        self.n = n
        self.entrymap = None
        # self.entrymap={}
        # for i in range(len(aliases)): self.entrymap[aliases[i]]=entries[i]
        self.entries = FastLoadedDiceRoller(entries)

    def _bitcount(self, x):
        r = 0
        while x > 0:
            r += 1
            x >>= 1
        return r

    def _verify(self, k, c, sh):
        if self.entrymap != None:
            em = 0
            if k in self.entrymap:
                em = self.entrymap[k]
            if (c >> sh) != em:
                raise ValueError

    def _buildFailureAliasesIfNeeded(self):
        if self.failureAlias == None and len(self.failureRaw) > self.n // 2 + 1:
            olen = len(self.failureRaw)
            clen = olen
            for i in range(olen, self.n + 1):
                self.failureRaw.append(self.failureRaw[self.n - i])
                clen += 1
            self.failureAlias = FastLoadedDiceRoller(self.failureRaw)
            self.failureRaw = None
            self.failureCumul = None

    def next(self, rg):
        v = self.aliases[self.entries.next(rg)]
        if v >= 0:
            return v
        if self.failureAlias != None:
            return self.failureAlias.next(rg)
        return self._sampleFromFailure(rg)

    def _sampleFromFailure(self, rg):
        # Sample from the failure distribution
        # print("sampling from failure")
        s = max(16, self._bitcount(self.n))
        failurevalues = self.failureEntry << (self.n - s)
        cf = (1 << (self.n - s)) - 1
        failureCumulLen = len(self.failureCumul)
        if failureCumulLen <= 0:
            self.failureCumul.append(1)
            self.failureRaw.append(1)
            self.failureCc = 1
            failureCumulLen = 1
        failureRate = rg.rndint(failurevalues - 1)
        totalcv = 1
        if failureRate < totalcv:
            return 0
        # Build the row
        for i in range(1, self.n + 1):
            if failureCumulLen == i:
                self.failureCc = self.failureCc * (self.n - (i - 1)) // i
                # self._verify(i, self.failureCc, self.n - s)
                ccf = self.failureCc & cf
                totalcv = self.failureCumul[i - 1] + ccf
                # print("i=%d fcc=%x/%x tcv=%x" % (i, self.failureCc, ccf, totalcv))
                self.failureCumul.append(totalcv)
                self.failureRaw.append(ccf)
                failureCumulLen += 1
            elif failureCumulLen < i:
                raise ValueError("should not happen")
            else:
                totalcv = self.failureCumul[i]
            if failureRate < totalcv:
                # self._buildFailureAliasesIfNeeded()
                # print("sampled %d" % (i))
                return i
            elif totalcv > failurevalues:
                raise ValueError("totalcv=%x expected=%x" % (totalcv, failurevalues))
        if totalcv != failurevalues:
            raise ValueError("totalcv=%x expected=%x" % (totalcv, failurevalues))
        raise ValueError("should not happen")

class PascalTriangle:
    """Generates the rows of Pascal's triangle, or the
    weight table for a binomial(n,1/2) distribution."""

    def __init__(self):
        self.table = []
        self.rownumber = 0

    def row(self):
        """Gets the row number of the row that will be generated
        the next time _next_ is called."""
        return self.rownumber

    def _bitcount(self, x):
        r = 0
        while x > 0:
            r += 1
            x >>= 1
        return r

    def _verifyAliasTable(self, table, row):
        # Verify whether an alias table with less
        # than full precision is correct. 'row' is the
        # corresponding Pascal triangle row.
        n = len(table) - 1
        s = max(16, self._bitcount(n))
        tablesum = sum(table)
        if tablesum > (1 << s):
            raise ValueError
        if len(table) != len(row):
            raise ValueError
        for i in range(0, len(row)):
            coarse = table[i]
            fine = row[i]
            cr = Fraction(coarse, 1 << s)
            fr = Fraction(fine, 1 << n)
            ls = fr - cr
            if ls < 0 or ls > Fraction(1, 1 << s):
                raise ValueError

    def _nthOfDoubleRowFromRow(self, row):
        # Calculates nth entry (starting from 0)
        # of the Pascal triangle
        # row for 2*n given a Pascal triangle row for n
        # (where n is calculated as len(row)-1).
        r = 0
        n = len(row) - 1
        for i in range(0, n + 1):
            r += row[i] * row[n - i]
        return r

    def _buildAliasTable(self, prob, n, fullPrecision=False):
        # prob is (n/2)th entry (starting at 0) of
        # the Pascal triangle row for n.  The entry 'prob'
        # is full precision regardless of the setting
        # for 'fullPrecision'.
        half = n >> 1
        s = max(16, self._bitcount(n))
        odd = n % 2 == 1
        oddadd = 1 if odd else 0
        sguard = s * 2  # should be at least s+ceil(log(n))
        if fullPrecision:
            s = n
            sguard = n  # full precision
        phalf = prob >> (n - sguard)
        h_s = Fraction(phalf, 1 << sguard)
        aliastable = [0 for i in range(n + 1)]
        aliastable[half] = int(h_s * (1 << s))
        if odd:
            aliastable[half + 1] = aliastable[half]
        for i in range(1, half + 1):
            delta_t_num = half + 1 - i
            delta_t_den = half + i
            hsa = h_s * delta_t_num / delta_t_den
            hsafloor = int(hsa * (1 << s))
            if hsafloor == 0:
                break
            aliastable[half - i] = hsafloor
            aliastable[half + i + oddadd] = hsafloor
            h_s = hsa
        return aliastable

    def getrow(self, desiredRow):
        """ Calculates an arbitrary row of Pascal's triangle. """
        r = [1 for i in range(desiredRow + 1)]
        r[0] = 1
        c = 1
        # Build half of the row
        for i in range(1, desiredRow // 2 + 1):
            c = c * (desiredRow - (i - 1)) // i
            r[i] = c
        # Reflect onto the other half
        lenr = len(r)
        for i in range(desiredRow // 2 + 1):
            r[lenr - 1 - i] = r[i]
        return r

    def _buildAliasTable2(self, prob, n):
        # prob is (n/2)th entry (starting at 0) of
        # the Pascal triangle row for n.  The entry 'prob'
        # is full precision.
        half = n >> 1
        s = max(16, self._bitcount(n))
        odd = n % 2 == 1
        oddadd = 1 if odd else 0
        sguard = s * 2  # should be at least s+ceil(log(n))
        if n < sguard:
            raise ValueError
        phalf = prob >> (n - sguard)
        h_s = Fraction(phalf, 1 << sguard)
        aliases = []
        aliasentries = []
        aliases.append(half)
        halfentry = int(h_s * (1 << s))
        aliasentries.append(halfentry)
        totalentries = halfentry
        if odd:
            aliases.append(half + 1)
            aliasentries.append(halfentry)
            totalentries += halfentry
        for i in range(1, half + 1):
            delta_t_num = half + 1 - i
            delta_t_den = half + i
            hsa = h_s * delta_t_num / delta_t_den
            # print([math.log(hsa.denominator),math.log(h_s.denominator)])
            hsafloor = int(hsa * (1 << s))
            if hsafloor < 0:
                raise ValueError
            if hsafloor == 0:
                break
            aliases.append(half - i)
            aliases.append(half + i + oddadd)
            aliasentries.append(hsafloor)
            aliasentries.append(hsafloor)
            totalentries += hsafloor * 2
            # h_s = hsa # -- known to be correct
            h_s = Fraction(int(hsa * (1 << sguard)), 1 << sguard)
        aliases.append(-1)
        failureentry = (1 << s) - totalentries
        # print(aliasentries)
        # print(aliases)
        # print([totalentries, failureentry])
        if failureentry < 0:
            raise ValueError
        aliasentries.append(failureentry)
        return _BinomialAliasTable(aliases, aliasentries, n)

    def aliasinfo(self, desiredRow):
        r = self.getrow(desiredRow)
        if desiredRow <= 16:
            # Use simple alias table to avoid overhead
            return FastLoadedDiceRoller(r)
        return self._buildAliasTable2(r[desiredRow // 2], desiredRow)

    def nextto(self, desiredRow):
        """Generates the row of Pascal's triangle with the given row number,
        skipping all rows in between.  The return value is a list of
        row-number-choose-k values."""
        if self.rownumber - 1 == desiredRow:
            # Already at desired row
            return [x for x in self.table]
        if self.rownumber > desiredRow:
            raise ValueError
        self.table = self.getrow(desiredRow)
        self.rownumber = desiredRow + 1
        return [x for x in self.table]

    def next(self):
        """Generates the next row of Pascal's triangle, starting with
        row 0. The return value is a list of row-number-choose-k
        values."""
        x = self.table
        xr = [
            1 if i == 0 or i == len(x) else x[i] + x[i - 1] for i in range(len(x) + 1)
        ]
        self.table = xr
        self.rownumber += 1
        return [x for x in self.table]

class _FractionBinaryExpansion:
    def __init__(self, frac):
        self.frac = frac
        self.fracnum = frac.numerator
        self.fracden = frac.denominator
        self.pt = 1

    def reset(self):
        """ Resets this object to the first bit in the binary expansion. """
        self.fracnum = frac.numerator
        self.fracden = frac.denominator
        self.pt = 1

    def eof(self):
        """ Returns True if the end of the binary expansion was reached; False otherwise. """
        return self.fracnum == 0

    def nextbit(self):
        """ Reads the next bit in the binary expansion. """
        if self.fracnum == 0:
            return 0
        # Determine whether frac >= 2**-pt
        cmpare = (self.fracnum << self.pt) >= self.fracden
        if self.tmpfrac >= self.px:
            # Subtract 2**-pt from frac
            self.fracnum = (self.fracnum << self.pt) - self.fracden
            self.fracden <<= self.pt
            self.pt += 1
            return 1
        else:
            self.pt += 1
            return 0

class _FloatBinaryExpansion:
    def __init__(self, frac):
        self.frac = frac
        self.tmpfrac = frac
        self.px = 0.5

    def reset(self):
        """ Resets this object to the first bit in the binary expansion. """
        self.tmpfrac = frac
        self.px = 0.5

    def eof(self):
        """ Returns True if the end of the binary expansion was reached; False otherwise. """
        return self.tmpfrac == 0

    def nextbit(self):
        """ Reads the next bit in the binary expansion. """
        if self.tmpfrac == 0:
            return 0
        if self.tmpfrac >= self.px:
            self.tmpfrac -= self.px
            self.px /= 2
            return 1
        else:
            self.px /= 2
            return 0

class BinaryExpansion:
    def __init__(self, arr, zerosAtEnd=False):
        """
        Binary expansion of a real number in [0, 1], initialized
        from an array of zeros and ones expressing the binary
        expansion.
        The first binary digit is the half digit, the second
        is the quarter digit, the third is the one-eighth digit,
        and so on.  Note that the number 1 can be
        expressed by passing an empty array and specifying
        zerosAtEnd = False, and the number 0 can be
        expressed by passing an empty array and specifying
        zerosAtEnd = True.
        arr - Array indicating the initial digits of the binary
        expansion.
        zerosAtEnd - Indicates whether the binary expansion
        is expressed as 0.xxx0000... or 0.yyy1111... (e.g., 0.1010000...
        vs. 0.1001111....  Default is the latter case (False).
        """
        self.arr = [x for x in arr]
        self.zerosAtEnd = zerosAtEnd
        if sum(self.arr) > 0 and not zerosAtEnd:
            # "Subtract" 1 from the binary expansion
            i = len(self.arr) - 1
            while i >= 0:
                self.arr[i] ^= 1
                if self.arr[i] == 0:
                    break
                i -= 1
        self.index = 0

    def eof(self):
        """ Returns True if the end of the binary expansion was reached; False otherwise. """
        return self.zerosAtEnd and self.index >= len(self.arr)

    def entropy(self):
        # Binary entropy
        v = self.value()
        return v * math.log2(1.0 / v)

    def get(f):
        """Creates a binary expansion object from a fraction, 'int', or
        'float' in the interval [0, 1]; returns 'f' unchanged, otherwise."""
        if f == 0:
            return BinaryExpansion([], True)
        if f == 1:
            return BinaryExpansion([], False)
        if isinstance(f, Fraction):
            return BinaryExpansion.fromFraction(f)
        elif isinstance(f, float):
            return BinaryExpansion.fromFloat(f)
        else:
            return f

    def getOrReset(f):
        """Creates a binary expansion object from a fraction, 'int', or
        'float' in the interval [0, 1]; resets 'f' (calls its reset method) otherwise."""
        if f == 0:
            return BinaryExpansion([], True)
        if f == 1:
            return BinaryExpansion([], False)
        if isinstance(f, Fraction):
            return BinaryExpansion.fromFraction(f)
        elif isinstance(f, float):
            return BinaryExpansion.fromFloat(f)
        else:
            f.reset()
            return f

    def fromFraction(f):
        """Creates a binary expansion object from a fraction in the
        interval [0, 1]."""
        if f == 0:
            return BinaryExpansion([], True)
        if f == 1:
            return BinaryExpansion([], False)
        if f < 0 or f > 1:
            raise ValueError
        return _FractionBinaryExpansion(f)

    def fromFloat(f):
        """Creates a binary expansion object from a 64-bit floating-point number in the
        interval [0, 1]."""
        if f == 0:
            return BinaryExpansion([], True)
        if f == 1:
            return BinaryExpansion([], False)
        if f < 0 or f > 1:
            raise ValueError
        return _FloatBinaryExpansion(f)

    def value(self):
        px = 0.5
        ret = 0
        for b in range(max(128, len(self.arr) + 2)):
            ret += px * self._nextbitat(b)
            px /= 2
        return ret

    def _nextbitat(self, index):
        if index >= len(self.arr):
            # If zerosAtEnd is False:
            # Append an infinite sequence of 1s so that, for example,
            # if the expansion passed to this class is 0.1101010
            # the expansion becomes  0.110100111111..., which expresses
            # the same number.
            return 0 if self.zerosAtEnd else 1
        return self.arr[index]

    def nextbit(self):
        """ Reads the next bit in the binary expansion. """
        ret = self._nextbitat(self.index)
        self.index += 1
        return ret

    def reset(self):
        """ Resets this object to the first bit in the binary expansion. """
        self.index = 0

class RandomGen:
    """A class that implements many methods for
    random number generation and sampling.  It takes
    an underlying RNG as specified in the constructor."""

    def __init__(self, rng=None):
        """Initializes a new RandomGen instance.
        NOTES:

        1. Assumes that 'rng' implements
        a 'randint(a, b)' method that returns a random
        integer in the interval [a, b].  Currently, this
        class assumes 'a' is always 0.
        2. 'rndint' (and functions that ultimately call it) may be
        slower than desirable if many random numbers are
        needed at once.  Ways to improve the performance
        of generating many random numbers at once include
        vectorization (which is often PRNG specific) and multithreading
        (which is too complicated to show here)."""
        if rng == None:
            self.rng = random.Random()
        else:
            self.rng = rng
        self.bitcount = 63
        self.curbit = 0

    def randbits(self, count):
        return self.rndintexc(1 << count)

    def randbit(self):
        if self.bitcount >= 63:
            self.bitcount = 0
            self.curbit = self.rng.randint(0, (1 << 63) - 1)
        ret = self.curbit & 1
        self.curbit >>= 1
        self.bitcount += 1
        return ret

    def rndint_fastdiceroller(self, maxInclusive):
        if maxInclusive < 0:
            raise ValueError("maxInclusive less than 0")
        if maxInclusive == 0:
            return 0
        if maxInclusive == 1:
            return self.randbit()
        # Lumbroso's fast dice roller method
        x = 1
        y = 0
        while True:
            x = x * 2
            y = y * 2 + self.randbit()
            if x > maxInclusive:
                if y <= maxInclusive:
                    return y
                x = x - maxInclusive - 1
                y = y - maxInclusive - 1

    def rndint(self, maxInclusive):
        if maxInclusive < 0:
            raise ValueError("maxInclusive less than 0")
        if maxInclusive == 0:
            return 0
        if maxInclusive == 1:
            return self.randbit()
        return self.rndint_fastdiceroller(maxInclusive)

    def rndintexc(self, maxExclusive):
        if maxExclusive <= 0:
            raise ValueError("maxExclusive 0 or less")
        return self.rndint(maxExclusive - 1)

    def rndintrange(self, minInclusive, maxInclusive):
        # NOTE: Since Python integers are arbitrary-precision,
        # the naive approach will work well here
        return minInclusive + self.rndint(maxInclusive - minInclusive)

    def rndintexcrange(self, minInclusive, maxExclusive):
        return minInclusive + self.rndint(maxExclusive - minInclusive - 1)

    def randbits(self, n):
        """ Generates an n-bit random integer. """
        return self.rndint((1 << n) - 1)

    def rndu01(self):
        e = -_SIGBITS
        while True:
            if self.rndint(1) == 0:
                e -= 1
            else:
                break
        sig = self.rndint((1 << (_SIGBITS - 1)) - 1)
        if sig == 0 and self.rndint(1) == 0:
            e += 1
        sig = sig + (1 << (_SIGBITS - 1))
        # NOTE: Multiply by 1.0 to coerce to floating-point
        return sig * 1.0 * (2.0 ** e)

    def rndu01oneexc(self):
        while True:
            ret = self.rndu01()
            if ret != 1.0:
                return ret

    def rndu01zerooneexc(self):
        while True:
            ret = self.rndu01()
            if ret != 1.0 and ret != 0.0:
                return ret

    def rndu01zeroexc(self):
        while True:
            ret = self.rndu01()
            if ret != 0.0:
                return ret

    def _rndrangehelper(self, lo, hi):
        losgn = -1 if lo < 0 else 0
        hisgn = -1 if hi < 0 else 0
        loexp = self._fpExponent(lo)
        hiexp = self._fpExponent(hi)
        losig = self._fpSignificand(lo)
        hisig = self._fpSignificand(hi)
        if lo > hi:
            raise ValueError
        if losgn == 1 and hisgn == -1:
            raise ValueError
        if losgn == -1 and hisgn == 1:
            mabs = max(abs(lo), abs(hi))
            while True:
                ret = self.rndrangehelper(0, mabs)
                neg = self.rndint(1)
                if neg == 0:
                    ret = -ret
                if ret >= lo and ret <= hi:
                    return ret
        if lo == hi:
            return lo
        if losgn == -1:
            return -rndrangehelper(abs(lo), abs(hi))
        expdiff = hiexp - loexp
        if loexp == hiexp:
            s = RNDINTRANGE(losig, hisig)
            return s * 1.0 * pow(2, loexp)
        while True:
            ex = hiexp
            while ex > MINEXP:
                v = self.rndint(2 - 1)
                if v == 0:
                    ex = ex - 1
                else:
                    break
            s = 0
            if ex == MINEXP:
                s = self.rndint(2 ** FPPRECISION - 1)
            else:
                sm = 2 ** (FPPRECISION - 1)
                s = self.rndint(sm - 1) + sm
            ret = s * 1.0 * FPRADIX ** (ex)
            if ret >= lo and ret <= hi:
                return ret

    def rndrange(self, minInclusive, maxInclusive):
        if minInclusive > maxInclusive:
            raise ValueError
        return self._rndrangehelper(minInclusive, maxInclusive)

    def rndrangemaxexc(self, minInclusive, maxExclusive):
        if minInclusive >= maxExclusive:
            raise ValueError
        while True:
            ret = self.rndrange(minInclusive, maxExclusive)
            if ret < maxExclusive:
                return ret

    def rndrangeminexc(self, mn, mx):
        if mn >= mx:
            raise ValueError
        while True:
            ret = self.rndrange(mn, mx)
            if ret > mn:
                return ret

    def rndrangeminmaxexc(self, mn, mx):
        if mn >= mx:
            raise ValueError
        while True:
            ret = self.rndrange(mn, mx)
            if ret > mn and ret < mx:
                return ret

    def shuffle(self, list):
        """Puts the elements of 'list' in random order (does an
        in-place shuffle).  Returns 'list'."""
        if len(list) >= 2:
            i = len(list) - 1
            while i > 0:
                k = self.rndintexc(i + 1)
                tmp = list[i]
                list[i] = list[k]
                list[k] = tmp
                i -= 1
        return list

    def sattolo(self, list):
        """Puts the elements of 'list' in random order, choosing
        from among all cyclic permutations (Sattolo's algorithm).
        Returns 'list'."""
        if len(list) >= 2:
            i = len(list) - 1
            while i > 0:
                # i, not i + 1: difference from shuffle
                k = self.rndintexc(i)
                tmp = list[i]
                list[i] = list[k]
                list[k] = tmp
                i -= 1
        return list

    def derangement_algorithm_s(self, list):
        """Returns a copy of 'list' with each of its elements
        moved to a different position (a derangement),
        but with the expected number of cycle lengths
        in probability, even though the list
        need not be a uniformly randomly
        chosen derangement.  Uses importance sampling.
        Reference:
        J.R.G. Mendonça, "Efficient generation of
        random derangements with the expected
        distribution of cycle lengths", arXiv:1809.04571v4
        [stat.CO], 2020.
        """
        n = len(list)
        x = [0 for i in range(n)]
        while True:
            j = [i for i in range(n)]
            success = True
            for i in range(n):
                inj = i in j
                if len(j) == (1 if inj else 0):
                    success = False
                    break
                elif inj:
                    j.remove(i)
                jindex = self.rndintexc(len(j))
                x[i] = list[j[jindex]]
                j[jindex] = i
            if success:
                return x

    def derangement_algorithm_t(self, list):
        """Returns a copy of 'list' with each of its elements
        moved to a different position (a derangement),
        but with the expected number of cycle lengths
        in probability, even though the list
        need not be a uniformly randomly
        chosen derangement.  Reference:
        J.R.G. Mendonça, "Efficient generation of
        random derangements with the expected
        distribution of cycle lengths", arXiv:1809.04571v4
        [stat.CO], 2020.
        """
        n = len(list)
        if n < 4:
            return self.derangement(list)
        der = self.sattolo([i for i in range(n)])
        x = 0
        y = 0
        for i in range(n * 2):
            if n < 65536:
                xb = self.rndintexc(n * n)
                x = xb // n
                y = xb % n
            else:
                x = self.rndintexc(n)
                y = self.rndintexc(n)
            if der[x] != y and der[y] != x:
                tmp = der[x]
                der[x] = der[y]
                der[y] = tmp
        return [list[i] for i in der]

    def derangement(self, list):
        """Returns a copy of list with each of its elements
        moved to a different position."""
        while True:
            ls = self._shufflemod([i for i in range(len(list))])
            if ls != None:
                return [list[i] for i in ls]

    def _shufflemod(self, list):
        if len(list) >= 2:
            i = len(list) - 1
            while i >= 0:
                k = self.rndintexc(i + 1)
                if i == list[k]:
                    return None
                tmp = list[i]
                list[i] = list[k]
                list[k] = tmp
                i -= 1
        return list

    def partialshuffle(self, list, k):
        """Does a partial shuffle of
        a list's items (stops when 'k' items
        are shuffled); the shuffled items
        will appear at the end of the list.
        Returns 'list'."""
        ki = 0
        if len(list) >= 2:
            i = len(list) - 1
            while i > 0 and ki < k:
                k = self.rndintexc(i + 1)
                tmp = list[i]
                list[i] = list[k]
                list[k] = tmp
                i -= 1
                k += 1
        return list

    def sample(self, list, k):
        if k < 0 or k > len(list):
            raise ValueError
        n = len(list)
        if n == k:
            return [x for x in list]
        if n < 200:
            s = self.shuffle([x for x in list])
            return s[0:k]  # Choose first k items
        if n / 4 > k and n < 5000:
            s = self.partialshuffle([x for x in list], k)
            return s[n - k : n]  # Choose last k items
        ki = 0
        kh = {}
        while ki < k:
            c = self.rndintexc(k)
            if c not in kh:
                kh[c] = True
                ki += 1
        return [list[i] for i in kh.keys()]

    def choice(self, list):
        return list[self.rndintexc(len(list))]

    def numbersWithSum(self, count, sum=1.0):
        if count <= 0 or sum <= 0:
            raise ValueError
        while True:
            numsum = 0
            nums = None
            if sum == 1:
                nums = [self.exponential() for i in range(count)]
            else:
                nums = [self.gamma(sum) for i in range(count)]
            for num in nums:
                numsum += num
            if numsum > 0:
                return [(p / numsum) * sum for p in nums]

    def zero_or_one(self, px, py):
        """ Returns 1 at probability px/py, 0 otherwise. """
        if py <= 0:
            raise ValueError
        if px == py:
            return 1
        z = px
        while True:
            z = z * 2
            if z >= py:
                if self.randbit() == 0:
                    return 1
                z = z - py
            elif z == 0 or self.randbit() == 0:
                return 0

    def bernoulli(self, p):
        """ Returns 1 at probability p, 0 otherwise. """
        bexp = BinaryExpansion.fromFloat(p)
        while True:
            bp = bexp.nextbit()
            br = self.rndint(1)
            if br < bp:
                return 1
            if br > bp:
                return 0
        return 0

    def weighted_choice(self, weights):
        return self._weighted_choice_n(weights, 1, 0)[0]

    def weighted_choice_n(self, weights, n=1):
        return self._weighted_choice_n(weights, n, 0)

    def _weighted_choice_n(self, weights, n, addvalue):
        if len(weights) == 0:
            raise ValueError
        msum = 0
        i = 0
        negweights = False
        nonintweights = False
        while i < len(weights):
            negweights = negweights or weights[i] < 0
            if int(weights[i]) != weights[i]:
                nonintweights = True
            msum += weights[i]
            i += 1
        if n > 100 and not negweights and not nonintweights:
            aliasinfo = FastLoadedDiceRoller(weights)
            return [aliasinfo.next(self) for k in range(n)]
        ret = [0 for k in range(n)]
        rv = [
            randgen.rndintexc(msum)
            if not nonintweights
            else randgen.rndrangemaxexc(0, msum)
            for k in range(n)
        ]
        k = 0
        while k < n:
            value = rv[k]
            i = 0
            lastItem = len(weights) - 1
            runningValue = 0
            while i < len(weights):
                if weights[i] > 0:
                    newValue = runningValue + weights[i]
                    lastItem = i
                    if value < newValue:
                        break
                    runningValue = newValue
                i += 1
            ret[k] = lastItem + addvalue
            k += 1
        return ret

    def weighted_choice_inclusion(self, weights, n):
        """
        Chooses a random sample of `n` indices from a list of items (whose weights are given as `weights`), such that the chance that index `k` is in the sample is given as `weights[k]*n/Sum(weights)`.  It implements the splitting method referenced below.

        Deville, J.-C. and Tillé, Y.  Unequal probability sampling without replacement through a splitting method. Biometrika 85 (1998).
        """
        if n > weights.length:
            raise ValueError
        if n == 0:
            return []
        # Inclusion probabilities
        ws = sum(weights)
        wts = [[Fraction(weights[i]) * n / ws, i] for i in range(len(weights))]
        wts = wts.sort()
        if wts[wts.length - 1][0] > 1:
            raise ValueError
        if n == weights.length:
            # All the items are chosen
            return [i for i in range(n)]
        ntotal = len(weights)
        items = []
        while True:
            lamda = min(Fraction(1) - wts[ntotal - n - 1][0], wts[ntotal - n][0])
            if lamda == 0:
                raise ValueError
            newwts2 = []
            if self.zero_or_one(lamda.numerator, lamda.denominator):
                for k in range(len(wts)):
                    if k + 1 > ntotal - n:
                        items.append(wts[k][1])
                return items
            for k in range(len(wts)):
                newwt = (
                    wts[k][0] / (1 - lamda)
                    if (k + 1 <= ntotal - n)
                    else (wts[k][0] - lamda) / (1 - lamda)
                )
                newwts.append([newwt, wts[k][1]])
            wts = newwts
            wts = wts.sort()

    def piecewise_linear(self, values, weights):
        return self.piecewise_linear_n(values, weights)[0]

    def piecewise_linear_n(self, values, weights, n=1):
        if len(values) <= 0 or len(weights) < len(values):
            raise ValueError
        if len(values) == 1:
            return [values[0] for i in range(n)]
        total = 0
        areas = [0 for i in range(len(values) - 1)]
        i = 0
        while i < len(values) - 1:
            weightArea = (
                (weights[i] + weights[i + 1]) * 0.5 * (values[i + 1] - values[i])
            )
            if weightArea < 0:
                weightArea = -weightArea
            areas[i] = weightArea
            total += weightArea
            i += 1
        valuelist = [self.rndrangemaxexc(0, total) for _ in range(n)]
        wtlist = [self.rndu01oneexc() for _ in range(n)]
        lastValue = values[len(values) - 1]
        retValues = [lastValue for _ in range(n)]
        k = 0
        while k < n:
            i = 0
            runningValue = 0
            while i < len(values) - 1:
                area = areas[i]
                if area > 0:
                    newValue = runningValue + area
                    if valuelist[k] < newValue:
                        w1 = weights[i]
                        w2 = weights[i + 1]
                        wt = wtlist[k]
                        interp = wt
                        diff = w2 - w1
                        if diff > 0:
                            cs = w2 * w2 * wt + w1 * w1 - w1 * w1 * wt
                            s = math.sqrt(cs)
                            interp = (s - w1) / diff
                            if interp < 0 or interp > 1:
                                interp = -(s + w1) / diff
                        if diff < 0:
                            cs = w1 * w1 * wt + w2 * w2 - w2 * w2 * wt
                            s = math.sqrt(cs)
                            interp = -(s - w2) / diff
                            if interp < 0 or interp > 1:
                                interp = (s + w2) / diff
                            interp = 1 - interp
                        retValues[k] = values[i] + (values[i + 1] - values[i]) * interp
                        break
                    runningValue = newValue
                i += 1
            k += 1
        return retValues

    def normal(self, mu=0.0, sigma=1.0):
        """ Generates a normally-distributed random number. """
        bmp = 0.8577638849607068  # sqrt(2/exp(1))
        if False and self.rndint(1) == 0:
            while True:
                a = self.rndu01zeroexc()
                b = self.rndu01zeroexc()
                if self.rndint(1) == 0:
                    a = 0 - a
                if self.rndint(1) == 0:
                    b = 0 - b
                c = a * a + b * b
                if c != 0 and c <= 1:
                    c = math.sqrt(-math.log(c) * 2 / c)
                    if self.rndint(1) == 0:
                        return a * sigma * c + mu
                    else:
                        return b * sigma * c + mu
        else:
            while True:
                a = self.rndu01zeroexc()
                b = self.rndrange(-bmp, bmp)
                if b * b <= -4 * a * a * math.log(a):
                    return (b * sigma / a) + mu

    def lognormal(self, mu=0.0, sigma=0.0):
        return math.exp(self.normal(mu, sigma))

    def weibull(self, a, b):
        """ Generates a Weibull-distributed random number. """
        return b * (self.exponential()) ** (1.0 / a)

    def triangular(self, startpt, midpt, endpt):
        return self.piecewise_linear([startpt, midpt, endpt], [0, 1, 0])

    def gumbel(self, a, b):
        return a + math.log(self.exponential()) * b

    def frechet(self, a, b, mu=0):
        return b * pow(self.exponential(), -1.0 / a) + mu

    def beta(self, a, b, nc=0):
        """Generates a beta-distributed random number.
        `a` and `b` are the two parameters of the beta distribution,
        and `nc` is a parameter such that `nc` other than 0
        indicates a _noncentral_ distribution."""
        avar = a + self.poisson(nc)
        if b == 1 and avar == 1:
            return self.rndu01()
        if avar == 1:
            return 1.0 - pow(self.rndu01(), 1.0 / b)
        if b == 1:
            return pow(self.rndu01(), 1.0 / avar)
        x = self.gamma(avar)
        return x / (x + self.gamma(b))

    _aliastables = {}
    _pascal = PascalTriangle()

    def _getaliastable(self, n):
        if n in self._aliastables:
            return self._aliastables[n]
        p = self._pascal.aliasinfo(n)
        self._aliastables[n] = p
        return self._aliastables[n]

    def _ispoweroftwo(self, n):
        while n != 0 and (n & 1) == 0:
            n >>= 1
        return n == 1

    def binomial_int(self, trials, px, py):
        if trials < 0:
            raise ValueError
        if trials == 0:
            return 0
        # Always succeeds
        if px == py:
            return trials
        # Always fails
        if px == 0:
            return 0
        if px * 2 == py:
            return binomial(self, trials, 0.5)
        count = 0
        # Based on proof of Theorem 2 in Farach-Colton and Tsai.
        # Decompose prob into its binary expansion (assuming
        # division by 2 is exact except on underflow)
        pw = Fraction(px, py)
        pt = Fraction(1, 2)
        while trials > 0:
            c = self.binomial(trials, 0.5)
            if pw >= pt:
                count = count + c
                trials = trials - c
                pw = pw - pt
            else:
                trials = c
            pt /= 2
        return count

    def binomial(self, trials, p, n=None):
        if n == None:
            return self._binomial(trials, p, 1)[0]
        return self._binomial(trials, p, n)

    def _binomial(self, trials, p, n):
        if trials < 0:
            raise ValueError
        if trials == 0:
            return [0 for i in range(n)]
        # Always succeeds
        if p >= 1.0:
            return [trials for i in range(n)]
        # Always fails
        if p <= 0.0:
            return [0 for i in range(n)]
        retarr = [0 for i in range(n)]
        k = 0
        tbl = None
        if n > 10 and trials > 32 and trials < 150:
            tbl = self._getaliastable(trials)
        while k < n:
            count = 0
            if p == 0.5:
                if trials < 8:
                    r = self.rndintexc(1 << trials)
                    while r > 0:
                        if (r & 1) != 0:
                            count += 1
                        r >>= 1
                elif tbl != None:
                    count = tbl.next(self)
                elif not self._ispoweroftwo(trials):
                    # Decompose _trials_ into powers of two (taking idea
                    # from "simple reduction" in Farach-Colton and Tsai),
                    # except a simple table-free algorithm is used for
                    # the lowest bits of _trials_.
                    tr = trials
                    count = self.binomial(tr & 7, 0.5)
                    tr -= tr & 7
                    shift = 3
                    while tr > 0:
                        subtrials = tr & (1 << shift)
                        if subtrials != 0:
                            count += self._getaliastable(subtrials).next(self)
                        tr -= subtrials
                        shift += 1
                else:
                    count = self._getaliastable(trials).next(self)
                retarr[k] = count
                k += 1
            else:
                # Based on proof of Theorem 2 in Farach-Colton and Tsai.
                # Decompose prob into its binary expansion (assuming
                # division by 2 is exact except on underflow)
                pw = p
                pt = 0.5
                tr = trials
                while tr > 0 and pw > 0:
                    c = self.binomial(tr, 0.5)
                    if pw >= pt:
                        count = count + c
                        tr = tr - c
                        pw = pw - pt
                    else:
                        tr = c
                    pt = pt / 2.0  # NOTE: Not rounded
                retarr[k] = count
                k += 1
        return retarr

    def hypergeometric(self, trials, ones, count):
        if ones < 0 or count < 0 or trials < 0 or ones > count or trials > count:
            raise ValueError
        if ones == 0:
            return 0
        successes = 0
        i = 0
        currentCount = count
        currentOnes = ones
        while i < trials and currentOnes > 0:
            if self.rndintexc(currentCount) < currentOnes:
                currentOnes -= 1
                successes += 1
            currentCount -= 1
            i += 1
        return successes

    def poissonint(self, mx, my):
        """ Generates a random number following a Poisson distribution with mean mx/my.  """
        if my == 0:
            raise ValueError
        if mx == 0:
            return 0
        if (mx < 0 and my < 0) or (mx > 0 and my < 0):
            return 0
        if mx == my:
            return self.poissonint(1, 2) + self.poissonint(1, 2)
        if mx > my:
            # Mean is 1 or greater
            mm = mx % my
            if mm == 0:
                mf = int(mx / my)
                ret = 0
                if mf % 2 == 1:
                    ret += self.poissonint(1, 1)
                    mf -= 1
                ret += self.poissonint(mf / 2, 1) + self.poissonint(mf / 2, 1)
                return ret
            else:
                return self.poissonint(mm, my) + self.poissonint(mx - mm, my)
        if mx > my * 9 // 10:
            hmx = mx // 2
            return self.poissonint(hmx, my) + self.poissonint(mx - hmx, my)
        while True:
            # Generate n, a geometric random number
            # (NOTE: Flajolet et al. define a geometric
            # distribution as number of SUCCESSES BEFORE
            # FAILURE, not counting the failure, so we
            # have to complement the probability here)
            n = self.negativebinomialint(1, my - mx, my)
            # If n uniform random numbers turn out
            # to be sorted, accept n
            if n <= 1:
                return n
            u = psrn_new_01()
            success = True
            i = 1
            while i < n and success:
                u2 = psrn_new_01()
                if psrn_less(self, u, u2) == 1:
                    u = u2
                else:
                    success = False  # Not sorted
                i = i + 1
            if success:
                return n
        return count

    def poisson(self, mean):
        """ Generates a random number following a Poisson distribution.  """
        if mean < 0:
            raise ValueError
        if mean == 0:
            return 0
        count = 0
        while mean > 20:
            n = math.ceil(mean - pow(mean, 0.7))
            g = self.gamma(n, 1)
            if g >= mean:
                return count + (n - 1 - self.binomial(n - 1, (g - mean) / g))
            mean = mean - g
            count = count + n
        p = 1.0
        pn = math.exp(-mean)
        while True:
            count += 1
            p *= self.rndu01oneexc()
            if p <= pn:
                return count - 1

    def rayleigh(self, a):
        """ Generates a random number following a Rayleigh distribution.  """
        return a * math.sqrt(2 * self.exponential())

    def truncnormal(randgen, a, b):
        """
        Samples from a truncated normal distribution in [a, b]; this method is
        designed to sample from either tail of that distribution.

        Reference:
        Botev, Z. and L'Ecuyer, P., 2019. Simulation from the Tail of the
        Univariate and Multivariate Normal Distribution. In _Systems
        Modeling: Methodologies and Tools_ (pp. 115-132). Springer, Cham.
        """
        c = a * a * 0.5
        if b == math.inf:
            while True:
                v = self.rndu01zerooneexc()
                x = c + self.exponential()
                if x * v * v <= a:
                    return math.sqrt(2 * x)
        else:
            q = 1.0 - math.exp(c - b * b * 0.5)
            while True:
                v = self.rndu01zerooneexc()
                x = c - math.log1p(-q * self.rndu01zerooneexc())
                if x * v * v <= a:
                    return math.sqrt(2 * x)

    def gamma(self, mean, b=1.0, c=1.0, d=0.0):
        """ Generates a random number following a gamma distribution.  """
        if mean <= 0:
            raise ValueError
        dd = mean
        v = 0
        if mean == 1:
            return self.exponential()
        if mean < 1:
            dd += 1
        dd -= 1.0 / 3
        cc = 1.0 / math.sqrt(9 * dd)
        while True:
            x = 0
            while True:
                x = self.normal(0, 1)
                v = cc * x + 1
                v = v * v * v
                if v > 0:
                    break
            u = self.rndu01zeroexc()
            x2 = x * x
            if u < 1 - (0.0331 * x2 * x2):
                break
            if math.log(u) < (0.5 * x2) + (dd * (1 - v + math.log(v))):
                break
        ret = dd * v
        if mean < 1:
            ret = ret * math.pow(self.rndu01(), 1.0 / mean)
        return ret ** (1.0 / c) * b + d

    def cauchy(self):
        return stable(1, 0)

    def stable(self, alpha, beta):
        """ Generates a random number following a stable distribution.  """
        if alpha <= 0 or alpha > 2:
            raise ValueError
        if beta < -1 or beta > 1:
            raise ValueError
        halfpi = math.pi * 0.5
        unif = self.rndrangemaxexc(-halfpi, halfpi)
        while unif == -halfpi:
            unif = self.rndrangemaxexc(-halfpi, halfpi)
        # Cauchy special case
        if alpha == 1 and beta == 0:
            return -math.cos(unif) / math.sin(unif)
        expo = self.exponential()
        c = math.cos(unif)
        if alpha == 1:
            s = math.sin(unif)
            return (
                2.0
                * (
                    (unif * beta + halfpi) * s / c
                    - beta * math.log(halfpi * expo * c / (unif * beta + halfpi))
                )
                / pi
            )
        z = -math.tan(alpha * halfpi) * beta
        ug = unif + math.atan2(-z, 1) / alpha
        cpow = pow(c, -1.0 / alpha)
        return (
            pow(1.0 + z * z, 1.0 / (2 * alpha))
            * (math.sin(alpha * ug) * cpow)
            * pow(math.cos(unif - alpha * ug) / expo, (1.0 - alpha) / alpha)
        )

    def stable0(self, alpha, beta, mu=0, sigma=1):
        """ Generates a random number following a 'type 0' stable distribution.  """
        x = (
            math.log(sigma) * 2.0 / pi
            if alpha == 1
            else math.tan(math.pi * 0.5 * alpha)
        )
        return self.stable(alpha, beta) * sigma + (mu - sigma * beta * x)

    def moyal(self, mu=0, sigma=1):
        """Sample from a Moyal distribution, using the
        method given in C. Walck, "Handbook on
        Statistical Distributions for Experimentalists",
        pp. 93-94."""
        while True:
            tany = self.cauchy()
            hy = math.exp(-(tany + math.exp(-tany)) * 0.5)
            hy = hy / ((math.cos(y) ** 2) * sqrt(2.0 * math.pi))
            if self.rndrange(0, 0.912) <= hy:
                return tany * sigma + mu

    def geometric(self, p):
        return self.negativebinomial(1, p)

    def zero_or_one_exp_minus(self, x, y):
        """Generates 1 with probability exp(-px/py); 0 otherwise.
        Reference:
        Canonne, C., Kamath, G., Steinke, T., "The Discrete Gaussian
        for Differential Privacy", arXiv:2004.00010 [cs.DS], 2020."""
        if y <= 0 or x < 0:
            raise ValueError
        if x == 0:
            return 1
        if x > y:
            xf = int(x / y)  # Get integer part
            x = x % y  # Reduce to fraction
            if x > 0 and self.zero_or_one_exp_minus(x, y) == 0:
                return 0
            for i in range(xf):
                if self.zero_or_one_exp_minus(1, 1) == 0:
                    return 0
            return 1
        r = 1
        oy = y
        while True:
            if self.zero_or_one(x, y) == 0:
                return r
            r = 1 - r
            y = y + oy

    def _zero_or_one_power_frac(self, px, py, nx, ny):
        # Generates a random number, namely 1 with
        # probability (px/py)^(nx/ay) (where nx/ny is in (0, 1)),
        # and 1 otherwise.  Returns 1 if nx/ny is 0.  Reference:
        # Mendo, Luis. "An asymptotically optimal Bernoulli
        # factory for certain functions that can be expressed
        # as power series." Stochastic Processes and their
        # Applications 129, no. 11 (2019): 4366-4384.
        i = 1
        while True:
            x = self.zero_or_one(px, py)
            if x == 1:
                return 1
            if self.zero_or_one(ax, ay * i) == 1:
                return 0
            i = i + 1

    def zero_or_one_power_ratio(self, px, py, nx, ny):
        """ Generates 1 with probability (px/py)^(nx/ny) (where nx/ny can be positive, negative, or zero); 0 otherwise. """
        if py <= 0 or px < 0:
            raise ValueError
        n = Fraction(nx, ny)
        p = Fraction(px, py)
        nx = n.numerator
        ny = n.denominator
        px = p.numerator
        py = p.denominator
        if n < 0:  # (px/py)^(nx/ny) -> (py/px)^-(nx/ny)
            n = -n
            return self.zero_or_one_power_ratio(py, px, n.numerator, n.denominator)
        if n == 0 or px >= py:
            return 1
        if nx == ny:
            return self.zero_or_one(px, py)
        if nx > ny:
            # (px/py)^(nx/ny) -> (px/py)^int(nx/ny) * (px/py)^frac(nx/ny)
            xf = int(nx / ny)  # Get integer part
            nx = nx % ny  # Reduce to fraction
            if nx > 0:
                # Split 1 plus the fractional part in two pieces, so that the fractional
                # parts involved in power_frac are closer to 1, and so are processed
                # much faster by power_frac.  Compensate by reducing the
                # integer part by 1.
                xf -= 1
                nx += ny
                nxpart = int(nx / 2)
                if (
                    self._zero_or_one_power_frac(nxpart, ny) == 0
                    or self._zero_or_one_power_frac(nx - nxpart, ny) == 0
                ):
                    return 0
            if xf >= 1:
                n1 = 1
                npx = px
                npy = py
                while n1 < xf and px < (1 << 32) and py < (1 << 32):
                    npx *= px
                    npy *= py
                    n1 += 1
                if n1 > 1:
                    quo = int(xf / n1)
                    if self.zero_or_one_power(npx, npy, quo) == 0:
                        return 0
                    xf -= quo * n1
                for i in range(xf):
                    if self.zero_or_one(px, py) == 0:
                        return 0
            return 1
        return self._zero_or_one_power_frac(px, py, nx, ny)

    def zero_or_one_power(self, px, py, n):
        """ Generates 1 with probability (px/py)^n (where n can be positive, negative, or zero); 0 otherwise. """
        return self.zero_or_one_power_ratio(px, py, n, 1)

    def polya_int(self, sx, sy, px, py):
        """Generates a negative binomial (Polya) random number, defined
        here as the number of failures before 'successes' many
        successful trials (sx/sy), where the probability of success in
        each trial is px/py."""
        isinteger = sx % sy == 0
        sxceil = (sx // sy) if isinteger else (sx // sy) + 1
        while True:
            w = self.negativebinomialint(sxceil, px, py)
            if isinteger or w == 0:
                return w
            tmp = Fraction(sx, sy)
            anum = tmp
            for i in range(1, w):
                anum *= tmp + i
            tmp = sxceil
            aden = tmp
            for i in range(1, w):
                aden *= tmp + i
            a = Fraction(anum, aden)
            if self.zero_or_one(a.numerator, a.denominator) == 1:
                return w

    # Yannis Manolopoulos. 2002. "Binomial coefficient computation:
    # recursion or iteration?", SIGCSE Bull. 34, 4 (December 2002),
    # 65–67. DOI: https://doi.org/10.1145/820127.820168
    def _binco(n, k):
        vnum = 1
        vden = 1
        for i in range(n - k + 1, n + 1):
            vnum *= i
            vden *= n - i + 1
        return vnum // vden

    def _sampleOnePToNEx(self, px, py, n, r, i):
        # Returns 1 with probability (1-px/py)^n, where
        # n*p <= 1, using given random bits r of length log2(i)-1.
        pnum = 1
        pden = 1
        qnum = px
        qden = py
        j = 1
        while True:
            if j <= n:
                bco = RandomGen._binco(n, j)
                # Add a summand, namely bco*(-px/py)**j
                if j % 2 == 0:  # Even
                    pnum = pnum * qden + pden * bco * qnum
                else:  # Odd
                    pnum = pnum * qden - pden * bco * qnum
                pden *= qden
                qnum *= px
                qden *= py
                j += 1
            if j > 2 or j > n:
                r = (r << 1) + self.randbit()
                bk = (pnum * i) // pden
                if r <= bk - 2:
                    return 1
                if r >= bk + 1:
                    return 0
                i <<= 1

    def _sampleOnePToN(self, px, py, n):
        # Returns 1 with probability (1-px/py)^n, where
        # n*p <= 1.
        return self._sampleOnePToNEx(px, py, n, 0, 2)

    def _sampleOnePToM(self, px, py, k, returnBitCount=False):
        # With probability (1-px/py)^m, returns m, where
        # m is uniform in [0, 2^k) and (2^k)*p <= 1.
        # Otherwise, returns -1.
        r = 0
        m = 0
        for b in range(1, k):
            m |= self.randbit() << (k - b)
            # Sum b+2 summands of the binomial equivalent
            # of the probability, using high bits of m
            pnum = 1
            pden = 1
            qnum = px
            qden = py
            j = 1
            while j <= m and j <= b + 2:  # for j in range(1, min(m+1,b+2+1)):
                bco = RandomGen._binco(m, j)
                # Add a summand, namely bco*(-px/py)**j
                if j % 2 == 0:  # Even
                    pnum = pnum * qden + pden * bco * qnum
                else:  # Odd
                    pnum = pnum * qden - pden * bco * qnum
                pden *= qden
                qnum *= px
                qden *= py
                j += 1
            r = (r << 1) + self.randbit()
            bk = int(pnum * 2 ** b) // pden
            if r <= bk - 2:
                if returnBitCount:
                    return m, k - b - 1
                m |= self.rndintexc(1 << (k - b))
                return m
            if r >= bk + 1:
                if returnBitCount:
                    return -1, 0
                return -1
        m |= self.randbit()
        # All of m was sampled, so calculate whole
        # probability
        if self._sampleOnePToNEx(px, py, m, r, 1 << k) == 1:
            if returnBitCount:
                return m, -1
            return m
        else:
            if returnBitCount:
                return -1, 0
            return -1

    def boundedGeometric(self, px, py, n):
        """Generates a bounded geometric random number, defined
        here as the number of failures before the first success (but no more than n),
        where the probability of success in
        each trial is px/py.

        Reference:
        Bringmann, K. and Friedrich, T., 2013, July. Exact and efficient generation
        of geometric random variates and random graphs, in
        _International Colloquium on Automata, Languages, and
        Programming_ (pp. 267-278).
        """
        if py == 0:
            raise ValueError
        if px >= py:
            return 0
        # Use the trivial algorithm if success
        # probability is high enough
        p = Fraction(px, py)
        if p > Fraction(1, 10):
            return min(n, self.negativebinomialint(1, px, py))
        # Calculate k for px/py
        k = 0
        m2 = 1 << n.bit_length()
        pn = px
        while pn * 2 <= py:
            k += 1
            pn *= 2
        # Start bounded geometric sampler
        # print(["k",k,pn,py])
        d = 0
        while self._sampleOnePToN(px, py, 1 << k) == 1:
            d += 1
            if (d << k) >= m2:
                return n
        while True:
            m, mbit = self._sampleOnePToM(px, py, k, True)
            if m >= 0:
                while mbit >= 0:
                    b = self.randbit()
                    m |= b << mbit
                    mbit -= 1
                    if b == 1:
                        break
                if (d << k) + m >= m2:
                    return n
                m += self.rndintexc(1 << (mbit + 1))
                return min(n, (d << k) + m)

    def negativebinomialint(self, successes, px, py):
        """Generates a negative binomial random number, defined
        here as the number of failures before 'successes' many
        successful trials, where the probability of success in
        each trial is px/py."""
        if successes < 0 or py == 0:
            raise ValueError
        if successes == 0 or px >= py:
            return 0
        if px < 0.0:
            return 1.0 / 0.0
        if successes > 1:
            r = 0
            for i in range(successes):
                r += self.negativebinomialint(1, px, py)
            return r
        # Geometric distribution for successes=1
        p = Fraction(px, py)
        if p > Fraction(1, 10):
            # Use the trivial algorithm if success
            # probability is high enough
            count = 0
            while True:
                if self.zero_or_one(px, py) == 0:
                    return count
                count += 1
            return count
        # Implements the algorithm given in Bringmann, K.
        # and Friedrich, T., 2013, July. Exact and efficient generation
        # of geometric random variates and random graphs, in
        # _International Colloquium on Automata, Languages, and
        # Programming_ (pp. 267-278).
        # Calculate k for px/py
        k = 0
        pn = px
        while pn * 2 <= py:
            k += 1
            pn *= 2
        # Start geometric sampler
        d = 0
        while self._sampleOnePToN(px, py, 1 << k) == 1:
            d += 1
        while True:
            m = self._sampleOnePToM(px, py, k)
            if m >= 0:
                return (d << k) + m

    def negativebinomial(self, successes, p):
        if successes < 0:
            raise ValueError
        if successes == 0 or p >= 1.0:
            return 0
        if p <= 0.0:
            return 1.0 / 0.0
        if successes == 1.0:
            return int(-self.exponential(math.log(1.0 - p)))
        if True or int(successes) != successes or successes > 1000:
            return self.poisson(self.gamma(successes) * (1 - p) / p)
        else:
            if p > 0.3:
                count = 0
                while True:
                    if self.bernoulli(p) == 1:
                        successes -= 1
                        if successes <= 0:
                            return count
                    else:
                        count += 1
            else:
                pf = Fraction(p)
                return negativebinomialint(successes, pf.numerator, pf.denominator)

    def dirichlet(alphas):
        gammas = [self.gamma(x, 1) for x in alphas]
        sumgammas = sum(gammas)
        return [gammas[i] / sumgammas for i in range(len(alphas) - 1)]

    def multipoisson(self, firstmean, othermeans):
        """ Multivariate Poisson distribution (as found in Mathematica). """
        first = self.poisson(firstmean)
        return [first + self.poisson(m) for m in othermeans]

    # The von Neumann exponential generator,
    # but using uniform partially-sampled random numbers.
    def _expovnbits(self, bits=53):
        count = 0
        while True:
            y1 = psrn_new_01()
            y = y1
            accept = True
            while True:
                z = psrn_new_01()
                if psrn_less(self, y, z) == 0:
                    accept = not accept
                    y = z
                    continue
                break
            if accept:
                y1[1] = count
                return psrn_fill(self, y1, precision=bits)
            count += 1

    def exponential(self, lamda=1.0):
        if self.rndint(1) == 0:
            return self._expovnbits(53)
        # Flip-flopping idea taken from (Pederson 2018)
        if self.rndint(1) == 0:
            x = self.rndrangeminexc(0, 0.5)
            # avoid bias
            while x == 0.5 and self.rndint(1) == 0:
                x = self.rndrangeminexc(0, 0.5)
            return -math.log(x) / lamda
        else:
            return -math.log1p(self.rndrangeminmaxexc(-0.5, 0)) / lamda

    def _logisticexp(self, ln, ld, prec):
        denom = ld * 2 ** prec
        while True:
            if self.randbit() == 0:
                return 0
            if self.zero_or_one_exp_minus(ln, denom) == 1:
                return 1

    def exprandnew(self, lamdanum=1, lamdaden=1):
        """Returns an object to serve as a partially-sampled
        exponential random number with the given
        rate 'lamdanum'/'lamdaden'.  The object is a list of five numbers:
        the first is a multiple of 1/(2^X), the second is X, the third is the integer
        part (initially -1 to indicate the integer part wasn't sampled yet),
        and the fourth and fifth are the lamda parameter's
        numerator and denominator, respectively.  Default for 'lamdanum'
        and 'lamdaden' is 1.
        The number created by this method will be "empty"
        (no bits sampled yet).
        """
        return [0, 0, -1, lamdanum, lamdaden]

    def exprandfill(self, a, bits):
        """Fills the unsampled bits of the given exponential random number
        'a' as necessary to make a number whose fractional part
        has 'bits' many bits.  If the number's fractional part already has
        that many bits or more, the number is rounded using the round-to-nearest,
        ties to even rounding rule.  Returns the resulting number as a
        multiple of 2^'bits'."""
        # Fill the integer if necessary.
        if a[2] == -1:
            a[2] = 0
            while self.zero_or_one_exp_minus(a[3], a[4]) == 1:
                a[2] += 1
        if a[1] > bits:
            # Shifting bits beyond the first excess bit.
            aa = a[0] >> (a[1] - bits - 1)
            # Check the excess bit; if odd, round up.
            ret = aa >> 1 if (aa & 1) == 0 else (aa >> 1) + 1
            return ret | (a[2] << bits)
        # Fill the fractional part if necessary.
        while a[1] < bits:
            index = a[1]
            a[1] += 1
            a[0] = (a[0] << 1) | self._logisticexp(a[3], a[4], index + 1)
        return a[0] | (a[2] << bits)

    def exprandless(self, a, b):
        """Determines whether one partially-sampled exponential number
        is less than another; returns
        True if so and False otherwise.  During
        the comparison, additional bits will be sampled in both numbers
        if necessary for the comparison."""
        # Check integer part of exponentials
        if a[2] == -1:
            a[2] = 0
            while self.zero_or_one_exp_minus(a[3], a[4]) == 1:
                a[2] += 1
        if b[2] == -1:
            b[2] = 0
            while self.zero_or_one_exp_minus(b[3], b[4]) == 1:
                b[2] += 1
        if a[2] < b[2]:
            return True
        if a[2] > b[2]:
            return False
        index = 0
        while True:
            # Fill with next bit in a's exponential number
            if a[1] < index:
                raise ValueError
            if b[1] < index:
                raise ValueError
            if a[1] <= index:
                a[1] += 1
                a[0] = self._logisticexp(a[3], a[4], index + 1) | (a[0] << 1)
            # Fill with next bit in b's exponential number
            if b[1] <= index:
                b[1] += 1
                b[0] = self._logisticexp(b[3], b[4], index + 1) | (b[0] << 1)
            aa = (a[0] >> (a[1] - 1 - index)) & 1
            bb = (b[0] >> (b[1] - 1 - index)) & 1
            if aa < bb:
                return True
            if aa > bb:
                return False
            index += 1

    def expoRatio(self, base, rx=1, ry=1):
        """Generates an exponential random number
        (in the form of a ratio, or two-element list) given
        the rate `rx`/`ry` and the base `base`.
        The number will have the denominator `base*rx`."""
        return [self.expoNumerator(base * ry), base * rx]

    def expoNumerator(self, denom):
        """Generates the numerator of an exponential random
        number with a given denominator,
        using von Neumann's
        algorithm ("Various techniques used in connection with
        random digits", 1951)."""
        count = 0
        while True:
            y1 = self.rndintexc(denom)
            y = y1
            accept = True
            while True:
                z = self.rndintexc(denom)
                if y <= z:
                    break
                accept = not accept
                y = z
            if accept:
                count += y1
                return count
            else:
                count += denom

    def pareto(self, minimum, alpha):
        return self.rndu01zerooneexc() ** (-1.0 / alpha) * minimum

    def vonmises(self, mean, kappa):
        if kappa < 0:
            raise ValueError
        if kappa == 0:
            return self.rndrangemaxexc(mean - pi, mean + pi)
        r = 1 + math.sqrt(4 * kappa * kappa + 1)
        rho = (r - math.sqrt(2 * r)) / (kappa * 2)
        s = (1 + rho * rho) / (2 * rho)
        while True:
            u = self.rndrangemaxexc(-1, 1)
            v = self.rndu01zerooneexc()
            z = math.cos(math.pi * u)
            w = (1 + s * z) / (s + z)
            y = kappa * (s - w)
            if y * (2 - y) - v >= 0 or math.log(y / v) + 1 - y >= 0:
                if w < -1:
                    w = -1
                if w > 1:
                    w = 1
                angle = math.acos(w)
                if u < 0:
                    angle = -angle
                return mean + angle

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
        ret = [0 for _ in failures]
        i = 0
        while i < succ:
            r = self.rndu01oneexc()
            p = 0
            nosuccess = False
            for j in range(len(failures)):
                if r >= p and r < p + failures[j]:
                    ret[j] += 1
                    nosuccess = True
                    break
                p += failures[j]
            if not nosuccess:
                i += 1
        return ret

    def multinomial(self, trials, weights):
        if trials * 2 < len(weights):
            ls = [0 for i in range(len(weights))]
            for i in range(trials):
                wc = self.weighted_choice(weights)
                ls[wc] += 1
            return ls
        else:
            # Corollary 45's proof in Durfee, et al., l1 Regression
            # using Lewis Weights Preconditioning and Stochastic
            # Gradient Descent, Proc. of Machine Learning Research
            # 75(1), 2018.  Assumes weights are integers.
            ls = [0 for i in range(len(weights))]
            s = sum(weights)
            # Note: Corollary assumes each item in this list
            # is a rational number
            ratios = [Fraction(w, s) for w in weights]
            t = trials
            for i in range(len(weights)):
                r = ratios[i]
                b = self.binomial_int(t, r.numerator, r.denominator)
                ls[i] = b
                t -= b
                for j in range(i + 1, len(weights)):
                    ratios[j] /= 1 - r
            return ls

    def nonzeroIntegersWithSum(self, n, total):
        """
        Returns a list of 'n' integers greater than 0 that sum to 'total'.
        The combination is chosen uniformly at random among all
        possible combinations.
        """
        if n <= 0 or total <= 0:
            raise ValueError
        ls = []
        i = 0
        list.insert(ls, 0, 0)
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
                list.insert(ls, len(ls), c)
        ls.sort()
        list.insert(ls, len(ls), total)
        return [ls[i] - ls[i - 1] for i in range(1, len(ls))]

    def integersWithSum(self, n, total):
        """
        Returns a list of 'n' integers 0 or greater that sum to 'total'.
        The combination is chosen uniformly at random among all
        possible combinations.
        """
        if n <= 0 or total <= 0:
            raise ValueError
        return [s - 1 for s in self.nonzeroIntegersWithSum(n, total + n)]

    def diceRoll(self, dice, sides=6, bonus=0):
        if dice < 0 or sides < 1:
            raise ValueError
        if dice == 0:
            return 0
        if sides == 1:
            return dice
        ret = 0
        i = 0
        while i < dice:
            ret = ret + self.rndintrange(1, sides)
            i = i + 1
        ret = ret + bonus
        if ret < 0:
            ret = 0
        return ret

    def _ierf(self, x):
        """ Approximation of the inverse error function. """
        coeffs = [
            0.3333333333333333,
            0.23333333333333333,
            0.2015873015873016,
            0.19263668430335099,
            0.19532547699214364,
            0.20593586454697566,
            0.2232097574187521,
            0.24697023314275485,
            0.27765382560322394,
            0.3161426235531171,
            0.3637175870396921,
            0.4220720808430425,
            0.49336326556393456,
            0.5802938460615139,
            0.6862233969476911,
            0.815312205552808,
            0.9727032088645521,
            1.1647499636184413,
            1.3993010831666697,
            1.6860544545395042,
        ]
        cx = x * 0.886226925452758  # x/(2.0/sqrt(pi))
        ret = cx
        cxsq = cx * cx
        for c in coeffs:
            cx *= cxsq
            ret += cx * c
        return ret

    def _icdfnormal(self, x):
        """Inverse cumulative distribution function of the
        standard normal distribution."""
        return self._ierf(2 * x - 1) * math.sqrt(2)

    def powerlognormal(self, p, sigma=1.0):
        """Power lognormal distribution, as described in NIST/SEMATECH
        e-Handbook of Statistical Methods, http://www.itl.nist.gov/div898/handbook/,
        accessed Jun. 9, 2018, sec. 1.3.6.6.14."""
        return math.exp(self._icdfnormal(1 - (1 - self.rndu01()) ** (1.0 / p)) * sigma)

    def powernormal(self, p):
        """Power normal distribution, as described in NIST/SEMATECH
        e-Handbook of Statistical Methods, http://www.itl.nist.gov/div898/handbook/,
        accessed Jun. 9, 2018, sec. 1.3.6.6.13."""
        return self._icdfnormal(1 - (1 - self.rndu01()) ** (1.0 / p))

    def _mhc2(self, pdf, n, sigma=1.0):
        # Bivariate Metropolis-Hastings
        burnin = 1000
        ru = [self.rndu01() for _ in range(n + burnin)]
        sqsigma = sigma * sigma
        cov = [[sqsigma, 0], [0, sqsigma]]
        rn = self.multinormal_n(None, cov, n + burnin)
        ret = [0 for _ in range(n)]
        p = 0
        while p == 0:
            x = self.multinormal(None, cov)
            p = pdf(x)
        for i in range(n + burnin):
            newx = [x[j] + rn[i][j] for j in range(2)]
            p2 = pdf(newx)
            accept = p2 > 0 and p2 / p >= ru[i]
            x = newx if accept else x
            p = p2 if accept else p
            if i >= burnin:
                ret[i - burnin] = x
        return ret

    def _mhc(self, pdf, n, sigma=1.0):
        # Univariate Metropolis-Hastings
        burnin = 1000
        ru = [self.rndu01() for _ in range(n + burnin)]
        rn = [self.normal(0, sigma) for _ in range(n + burnin)]
        ret = [0 for _ in range(n)]
        p = 0
        nsig = 1.0 / (2 * sigma * sigma)
        while p == 0:
            x = self.normal(0, sigma)
            p = math.exp(-0.5 * (x * x) * nsig) * pdf(x)
        for i in range(n + burnin):
            newx = x + rn[i]
            p2 = math.exp(-0.5 * (newx * newx) * nsig) * pdf(newx)
            accept = p2 > 0 and p2 / p >= ru[i]
            x = newx if accept else x
            p = p2 if accept else p
            if i >= burnin:
                ret[i - burnin] = x
        return ret

    def slicesample(self, pdf, n, xstart=0.1):
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
        x = xstart
        w = 0.2
        while pdf(x) <= 0:
            xstart += w
        ret = []
        burnin = 2000
        while len(ret) < n:
            y = self.rndrange(0, pdf(x))
            xleft = x
            xright = x
            while xleft == x or y < pdf(xleft):
                xleft -= w
            while xright == x or y < pdf(xright):
                xright += w
            while True:
                x2 = self.rndrange(xleft, xright)
                if y < pdf(x2):
                    x = x2
                    break
                if x2 > x:
                    xright = x2
                else:
                    xleft = x2
            if burnin == 0:
                ret.append(x)
            else:
                burnin -= 1
        return ret

    def mcmc(self, pdf, n):
        """Generates 'n' random numbers that follow
        the probability density given in 'pdf' using
        a Markov-chain Monte Carlo algorithm, currently
        Metropolis--Hastings.  The resulting random numbers
        are not independent, but are often close to
        being independent.  'pdf' takes one number as
        a parameter and returns a number 0 or greater.
        The area under the curve (integral) of 'pdf'
        need not be equal to 1."""
        # Compute optimal sigma.  See
        # Gelman et al., 1997.
        s = _variance(self._mhc(pdf, 1000, 3.0)) * 5.6644
        return self._mhc(pdf, n, s)

    def mcmc2(self, pdf, n):
        """Generates 'n' pairs of random numbers that follow
        the probability density given in 'pdf' using
        a Markov-chain Monte Carlo algorithm, currently
        Metropolis--Hastings.  The resulting random pairs
        are not independent, but are often close to
        being independent.  'pdf' takes one parameter,
        namely, a list of two numbers giving a sampled
        point and returns a number 0 or greater.
        The volume under the surface (integral) of 'pdf'
        need not be equal to 1."""
        mhc = self._mhc2(pdf, 1000, 3.0)
        # Compute distances of random points
        # from the origin
        dists = [math.sqrt(x * x + y * y) for x, y in mhc]
        # Compute optimal sigma.  See
        # Gelman et al., 1997.
        s = _variance(dists) * 5.6644
        return self._mhc2(pdf, n, s)

    def _decompose(self, matrix):
        numrows = len(matrix)
        if len(matrix[0]) != numrows:
            raise ValueError
        # Does a Cholesky decomposition of a matrix
        # assuming it's positive definite and invertible
        ret = [[0 for j in range(numrows)] for i in range(numrows)]
        s1 = math.sqrt(matrix[0][0])
        if s1 == 0:
            return ret  # For robustness
        for i in range(0, numrows):
            ret[0][i] = matrix[0][i] * 1.0 / s1
        for i in range(0, numrows):
            msum = 0.0
            for j in range(i):
                msum = msum + ret[j][i] * ret[j][i]
            sq = matrix[i][i] - msum
            if sq < 0:
                sq = 0  # For robustness
            ret[i][i] = math.sqrt(sq)
        for j in range(0, numrows):
            for i in range(j + 1, numrows):
                # For robustness
                if ret[j][j] == 0:
                    ret[j][i] = 0
                if ret[j][j] != 0:
                    msum = 0
                    for k in range(j):
                        msum = msum + ret[k][i] * ret[k][j]
                    ret[j][i] = (matrix[j][i] - msum) * 1.0 / ret[j][j]
        return ret

    def spsa_minimize(
        self, func, guess, iterations=200, constrain=None, a=None, c=None, acap=None
    ):
        """Tries to find a choice of parameters that minimizes the value
        of a scoring function, also called the objective function or loss
        function, starting from an initial guess.  This method uses an
        algorithm called "simultaneous perturbation
        stochastic approximation", which is a randomized
        search for the minimum value of the objective function.
        func - Objective function, a function that calculates a score for the
         given array of parameters and returns that score.  The score is a
         single number; the lower the score, the better.
         The score can be negative.  (Note that the problem of maximizing
         the score is the same as minimizing it except
         that the score's sign is reversed at the end.)
        guess - Initial guess for the best choice of parameters.  This is an
         array of parameters, each of which is a number. This array has
         as many items as the array passed to 'func'.
        iterations - Maximum number of iterations in which to run the
         optimization process.  Default is 200.
        constrain - Optional. A function that takes the given array of
         parameters and constrains them to fit the bounds of a valid
         array of parameters. This function modifies the array in place.
        a - Optional.  A setting used in the optimization process; greater than 0.
        c - Optional.  A setting used in the optimization process; greater than 0. As a guideline,
          'c' is about equal to the "standard deviation of the measurement noise"
          for several measurements at the initial guess, and is a "small positive
          number" if measurements are noise-free (Spall 1998).  Default
          is 0.001.
        acap - Optional.  A setting used in the optimization process; an
          integer greater than 0."""
        # c>0; a>0; acap is an integer > 0
        if c == None:
            c = 0.001  # Guideline (Spall 1998)
        if acap == None:
            acap = max([1, int(iterations / 10)])  # Guideline (Spall 1998)
        if a == None:
            # Guideline (Spall 1998).  Assume the desired
            # movement in early iterations is 1/10 of magnitude
            # (norm) of ghat(guess,func,c,acap):
            # > ghats=[_norm(ghat(guess,func,c,acap)) for i in range(5)]
            # > meanghat=sum(ghats)/len(ghats)
            # > movementRatio=desiredMovement/meanghat
            movementRatio = 0.1
            a = ((acap + 1) ** 1.0) * movementRatio
        if a <= 0 or c <= 0 or acap <= 0:
            raise ValueError
        g = 1.0 / 6
        low = [x for x in guess]
        high = [x for x in guess]
        curguess = [x for x in guess]
        newguess = [x for x in guess]
        oldvalue = func(guess)
        bestguess = [x for x in guess]
        bestvalue = oldvalue
        nochangecount = 0
        for i in range(iterations):
            ci = c * 1.0 / (1 + i) ** g
            d = [ci * (self.rndint(1) * 2 - 1) for x in curguess]
            for j in range(len(curguess)):
                high[j] = curguess[j] + d[j]
                low[j] = curguess[j] - d[j]
            gr = func(high) - func(low)
            ai = a * 1.0 / (1 + i + acap)
            for j in range(len(curguess)):
                newguess[j] = curguess[j] - ai * gr / (d[j] * 2.0)
            # constraint
            if constrain != None:
                constrain(newguess)
            newvalue = func(newguess)
            if newvalue > oldvalue + 10:
                continue
            # update current guess
            for j in range(len(curguess)):
                curguess[j] = newguess[j]
            if newvalue < bestvalue:
                bestvalue = newvalue
                for j in range(len(curguess)):
                    bestguess[j] = newguess[j]
            # NOTE: Here, 1e-5 is a tolerance
            # between successive iterations
            # of the algorithm; values within
            # tolerance are treated as changing
            # little
            if abs(newvalue - oldvalue) < 1e-5:
                nochangecount += 1
                if nochangecount > 10:
                    break
            else:
                nochangecount = 0
            oldvalue = newvalue
        return bestguess

    def monte_carlo_integrate(self, func, bounds, samples=1000):
        """
        Estimates the integral (volume) of a function within the
        given bounds using Monte Carlo integration, which generates
        an estimate using the help of randomization.
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
        xm = func(*[self.rndrange(a[0], a[1]) for a in bounds])
        xs = 0
        i = 1
        for j in range(samples):
            c = func(*[self.rndrange(a[0], a[1]) for a in bounds])
            i += 1
            cxm = c - xm
            xm += cxm * 1.0 / i
            xs += cxm * (c - cxm)
        # Calculate the bounding volume
        volume = 1
        for a in bounds:
            volume *= a[1] - a[0]
        # Return integral and standard error
        return [volume * xm, volume * math.sqrt(xs * 1.0 / (i * i))]

    def kth_smallest_of_n_u01(self, k, n):
        """Generates the kth smallest number among n random numbers
        in the interval [0, 1]."""
        if k > n or n < 1:
            raise ValueError
        if n < 20:
            nums = [self.randu01() for i in n]
            nums.sort()
            return nums[k - 1]
        return self.beta(k, n + 1 - k)

    def multinormal_n(self, mu, cov, n=1):
        mulen = len(cov)
        if mu != None:
            mulen = len(mu)
            if mulen != len(cov):
                raise ValueError
            if mulen != len(cov[0]):
                raise ValueError
        cho = self._decompose(cov)
        vts = [self.normal(0, 1) for i in range(mulen * n)]
        ret = [[0 for i in range(mulen)] for i in range(n)]
        for k in range(n):
            js = mulen * k
            i = 0
            while i < mulen:
                msum = 0
                if mu != None:
                    msum = mu[i]
                for j in range(mulen):
                    msum = msum + vts[js + j] * cho[j][i]
                ret[k][i] = msum
                i = i + 1
        return ret

    def multinormal(self, mu, cov):
        return self.multinormal_n(mu, cov, 1)[0]

    def upper_bound_copula(self, n=2):
        x = self.rndu01()  # Generate number once
        return [x for i in range(n)]

    def product_copula(self, n=2):
        return [self.rndu01() for i in range(n)]

    def lower_bound_copula(self):
        x = self.rndu01()  # Generate number once
        return [x, 1.0 - x]

    def gaussian_copula(self, cov):
        mvn = self.multinormal(None, cov)
        for i in range(len(cov)):
            # Apply the normal distribution's CDF
            # to get uniform random number
            mvn[i] = (
                math.erf(mvn[i] / (math.sqrt(2) * math.sqrt(cov[i][i]))) + 1
            ) * 0.5
        return mvn

    def multivariate_t(self, mu, cov, df):
        """Multivariate t-distribution, mu is the mean (can be None),
        cov is the covariance matrix, and df is the degrees of freedom."""
        mn = self.multinormal(None, cov)
        cd = self.gamma(df * 0.5, 2.0 / df)
        return [
            (0 if mu == None else mu[i]) + mn[i] / math.sqrt(cd) for i in range(len(mn))
        ]

    def _pochhammer(self, a, b):
        return math.gamma(a + b) / math.gamma(a)

    def _beta(self, a, b):
        return math.gamma(a) * math.gamma(b) / math.gamma(a + b)

    def _betainc(self, x, a, b):
        # Incomplete beta function.  NOTES:
        # 1. The SciPy method
        # scipy.stats.betainc(a, b, x) is the same as _betainc(x, a, b).
        # 2. This is also the beta distribution's CDF.
        if x > 0.5 and x < 1.0:
            return 1.0 - self._betainc(1.0 - x, b, a)
        if x == 0 and a > 0:
            return 0.0
        if b < 50 and math.floor(b) == b:
            if b < 0:
                return 0
            return (x ** a) * sum(
                [
                    self._pochhammer(a, i) * pow(1 - x, i) * 1.0 / math.gamma(i + 1)
                    for i in range(int(b))
                ]
            )
        if a > 0 and a < 50 and math.floor(a) == a:
            return 1.0 - ((1.0 - x) ** b) * sum(
                [
                    self._pochhammer(b, i) * (x ** i) * 1.0 / math.gamma(i + 1)
                    for i in range(int(a))
                ]
            )
        ret = pow(10, -100)
        d = 0
        c = ret
        i = 0
        k = 0
        while i < 100:
            # Get next convergent of continued fraction
            if i == 0:
                num = 1.0
            else:
                if (i & 1) == 1:
                    num = -(a + k) * (a + b + k) * x * 1.0 / ((a + i - 1) * (a + i))
                else:
                    num = (b - k) * k * x * 1.0 / ((a + i - 1) * (a + i))
            c = 1 + num / c  # 1 is the convergent's denominator
            d = 1 + num * d  # ditto
            if d == 0:
                d = pow(10, -100)
            if c == 0:
                c = pow(10, -100)
            d = 1.0 / d
            delta = d * c
            ret *= delta
            if abs(delta - 1.0) < pow(10, -14):
                break
            i = i + 1
            if (i & 1) == 0:
                k = k + 1
        return ret * (x ** a) * ((1 - x) ** b) / (a * self._beta(a, b))

    def _student_t_cdf(self, nu, x):
        if x <= 0:
            return self._betainc(nu / (x * x + nu), nu * 0.5, 0.5) * 0.5
        else:
            return (self._betainc((x * x) / (x * x + nu), 0.5, nu * 0.5) + 1) * 0.5

    def t_copula(self, cov, df):
        """Multivariate t-copula. 'cov' is the covariance matrix
        and 'df' is the degrees of freedom."""
        mt = self.multivariate_t(None, cov, df)
        return [self._student_t_cdf(df, mt[i]) for i in range(len(mt))]

    def simplex_point(self, points):
        """Generates an independent and uniform random point on the surface of an N-dimensional
        simplex (line segment, triangle, tetrahedron, etc.)
        with the given coordinates."""
        ret = []
        if len(points) > len(points[0]) + 1:
            raise ValueError
        if len(points) == 1:  # Return a copy of the point
            for i in range(0, len(points[0])):
                ret.append(points[0][i])
            return ret
        gammas = []
        # Sample from a Dirichlet distribution
        simplexDims = len(points) - 1
        for i in range(0, len(points)):
            gammas.append(self.exponential())
        tsum = 0
        for i in range(0, len(gammas)):
            tsum = tsum + gammas[i]
        tot = 0
        for i in range(0, len(gammas) - 1):
            gammas[i] = gammas[i] / tsum
            tot = tot + gammas[i]
        tot = 1.0 - tot
        for i in range(0, len(points[0])):
            ret.append(points[0][i] * tot)
        for i in range(1, len(points)):
            for j in range(0, len(points[0])):
                ret[j] = ret[j] + points[i][j] * gammas[i - 1]
        return ret

    def hypercube_point(self, dims, sizeFromCenter=1):
        """Generates an independent and uniform random point on the surface of a 'dims'-dimensional
        hypercube (square, cube, etc.)
        centered at the origin."""
        return [self.rndrange(-sizeFromCenter, sizeFromCenter) for _ in range(dims)]

    def _norm(self, vec):
        return math.sqrt(sum([x * x for x in vec]))

    def _sumsq(self, vec):
        return sum([x * x for x in vec])

    def _numngrad(self, f, u, v):
        """ Numerical norm of gradient. """
        eu = f(u, v)
        du = None
        dv = None
        edu = f(u + 0.00001, v)
        if edu[0] == 0 and edu[1] == 0 and edu[2] == 0:
            edu = f(u - 0.00001, v)
            du = [(eu[i] - edu[i]) / 0.00001 for i in range(3)]
        else:
            du = [(edu[i] - eu[i]) / 0.00001 for i in range(3)]
        edu = f(u, v + 0.00001)
        if edu[0] == 0 and edu[1] == 0 and edu[2] == 0:
            edu = f(u, v - 0.00001)
            dv = [(eu[i] - edu[i]) / 0.00001 for i in range(3)]
        else:
            dv = [(edu[i] - eu[i]) / 0.00001 for i in range(3)]
        gx = du[1] * dv[2] - du[2] * dv[1]
        gy = du[2] * dv[0] - du[0] * dv[2]
        gz = du[0] * dv[1] - du[1] * dv[0]
        return math.sqrt(gx * gx + gy * gy + gz * gz)

    def surface_point(self, f, bounds, ngrad, gmax):
        """Generates a uniform random point on
           a parametric surface, using a rejection
           approach developed by Williamson, J.F.,
           "Random selection of points distributed on
            curved surfaces", Physics in Medicine & Biology 32(10), 1987.
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
            u = self.rndrangemaxexc(bounds[0][0], bounds[0][1])
            v = self.rndrangemaxexc(bounds[1][0], bounds[1][1])
            pt = f(u, v)
            nog = self._numngrad(f, u, v) if ngrad == None else ngrad(u, v)
            if nog >= self.rndrange(gmax):
                return pt

    def geoellipsoid_point(self, a=6378.137, invf=298.2572236):
        """Generates an independent and uniform random
        point on the surface of a geoellipsoid.  The
        geoellipsoid uses the following parameters:
        a - semimajor axis (distance from the center of
           the geoellipsoid to the equator).  The default
           is the WGS 84 ellipsoid's semimajor axis
           in kilometers.
        invf - inverse flattening.  The default is the
           WGS 84 ellipsoid's inverse flattening."""
        # b is the semiminor axis, the distance from the
        # center of the geoellipsoid to the north pole
        b = a - (a * 1.0 / invf)
        semim = b / a
        semimp4 = semim * semim * semim * semim
        semiminv = 1.0 / semim
        while True:
            # Generate an ellipsoidal point, then accept or
            # reject it depending on its stretch factor (norm-of-
            # gradient).  This rejection approach for sampling
            # curved surfaces was developed by Williamson, J.F.,
            # "Random selection of points distributed on
            # curved surfaces", Physics in Medicine & Biology 32(10), 1987.
            # Generate a spherical point
            pt = self.hypersphere_point(3)
            # Make it ellipsoidal
            pz = pt[2] * semim
            # g is:
            # - the norm of the gradient for (pt[0],pt[1],pz),
            #   divided by
            # - the maximum possible value of that norm for
            #   the whole ellipsoid
            g = semiminv * math.sqrt(
                pz * pz + semimp4 * (pt[0] * pt[0] + pt[1] * pt[1])
            )
            if self.rndu01() <= g:
                # Accept the equivalent point
                # on the geoellipsoid
                return [pt[0] * a, pt[1] * a, pt[2] * b]

    def hypersphere_point(self, dims, radius=1):
        """Generates an independent and uniform random point on the surface of a 'dims'-dimensional
        hypersphere (circle, sphere, etc.)
        centered at the origin."""
        if dims == 2:
            # Use polar method mentioned in Devroye 1986, p. 235
            while True:
                a = self.rndrange(-1, 1)
                b = self.rndrange(-1, 1)
                c = a * a
                d = b * b
                e = c + d
                if e != 0 and e <= 1:
                    ie = radius / e
                    return [(c - d) * ie, a * b * ie * 2]
        x = 0
        while x == 0:
            ret = [self.normal() for _ in range(dims)]
            x = self._norm(ret)
        return [i * radius / x for i in ret]

    def ball_point(self, dims, radius=1):
        """Generates an independent and uniform random point inside a 'dims'-dimensional
        ball (disc, solid sphere, etc.) centered at the origin."""
        x = 0
        while x == 0:
            ret = [self.normal() for _ in range(dims)]
            x = math.sqrt(self._sumsq(ret) + self.exponential())
        return [i * radius / x for i in ret]

    def shell_point(self, dims, outerRadius=1, innerRadius=0.5):
        """Generates an independent and uniform random point inside a 'dims'-dimensional
        spherical shell (donut, hollow sphere, etc.)
        centered at the origin."""
        r = self.rndrange(innerRadius ** dims, outerRadius ** dims) ** (1.0 / dims)
        return self.hypersphere_point(dims, r)

    def latlon(self):
        """Generates an independent and uniform random latitude and
        longitude, in radians.  West and south coordinates
        are negative."""
        lon = self.rndrangemaxexc(-math.pi, math.pi)
        latx = self.rndrange(-1, 1)
        while latx == -1 or latx == 1:
            latx = self.rndrange(-1, 1)
        lat = math.atan2(math.sqrt(1 - latx * latx), latx) - math.pi * 0.5
        return [lat, lon]

    def gbas(self, coin, k=385):
        """Estimates the probability of heads of a coin.  GBAS = Gamma Bernoulli approximation scheme.
        The algorithm is simple to describe: "Flip a coin until it shows heads
           _k_ times.  The estimated probability of heads is then `(k-1)/GammaDist(r, 1)`,
           where _r_ is the total number of coin flips."
        The estimate is unbiased (multiple estimates average to the true probability
        of heads) but has nonzero probability of being
        greater than 1 (that is, the estimate does not lie in [0, 1] almost surely).
        Assumes the probability of heads is in the interval (0, 1].
        [[[NOTE: As can be seen in Feng et al., the following are equivalent to the previous
        algorithm:
          Geometric: "Let G be 0. Do this _k_ times: 'Flip a coin until it shows heads, let _r_ be the number of flips (including the last), and add GammaDist(r, 1) to G.' The estimated probability
           of heads is then `(k-1)/G`."
          Bernoulli: "Let G be 0. Do this until heads is shown _k_ times: 'Flip a coin and add Expo(1) to G.' The estimated probability of heads is then `(k-1)/G`."
          Both algorithms use the fact that (k-1)/(X1+...+Xk) is an unbiased estimator
          of p, namely 1 divided by the mean of an Expo(p) random variable (X1, X2, ... Xk
          are i.i.d. Expo(p) random variates), with p>0.  In the same way, any algorithm to turn
          an endless sequence of random numbers with mean M into k many i.i.d. Expo(M)
          random variates will work, as with the Poisson distribution, for example.
          Note that GammaDist(r,1) is distributed as the sum of _r_ many i.i.d. Expo(1) variates.]]]
        References: Huber, M., 2017. A Bernoulli mean estimate with
           known relative error distribution. Random Structures & Algorithms, 50(2),
           pp.173-182. (preprint in arXiv:1309.5413v2  [math.ST], 2015).
           Feng, J. et al. “Monte Carlo with User-Specified Relative Error.” (2016).
        coin: A function that returns 1 (or heads) with unknown probability and 0 otherwise.
        k: Number of times the coin must return 1 (heads) before the estimation
            stops.
            To ensure an estimate whose relative error's absolute value exceeds
            epsilon with probability at most delta, calculate the smallest
            integer k such that:
               gammainc(k,(k-1)/(1+epsilon)) +
                   (1 - gammainc(k,(k-1)/(1-epsilon))) <= delta
            (where gammainc is the regularized lower incomplete gamma function,
            implemented, e.g., as scipy.special.gammainc), and set this parameter
            to the calculated k value or higher.
              The default is 385, which allows the relative error to exceed 0.1 (epsilon) with
              probability at most 0.05 (delta).
              A simpler suggestion is k>=ceiling(-6*ln(2/delta)/((epsilon**2)*(4*epsilon-3))).
              For both suggestions, epsilon is in the interval (0, 3/4) and delta is in (0, 1).
              Note: "14/3" in the paper should probably read "4/3".
        """
        r = 0
        h = 0
        while h < k:
            h += coin()
            r += 1
        return (k - 1) / self.gamma(r, 1)

    def gbas01(self, coin, k=385):
        """Estimates the mean of a random variable lying in [0, 1].
        This is done using gbas and a "coin" that returns 1 if a random uniform [0, 1]
        number is less the result of the given function or 0 otherwise.
        The estimate is unbiased but has nonzero probability of being
        greater than 1 (that is, the estimate does not lie in [0, 1] almost surely).
        coin: A function that returns a number in [0, 1].
        k: See gbas."""
        return gbas(lambda: (1 if self.rndu01() < coin() else 0), k)

    def _getSolTable(self, n, mn, mx, sum):
        t = [[0 for i in range(sum + 1)] for j in range(n + 1)]
        t[0][0] = 1
        for i in range(1, n + 1):
            for j in range(0, sum + 1):
                jm = max(j - (mx - mn), 0)
                v = 0
                for k in range(jm, j + 1):
                    v += t[i - 1][k]
                t[i][j] = v
        return t

    def _getSolTableForRanges(self, ranges, adjsum):
        n = len(ranges)
        t = [[0 for i in range(adjsum + 1)] for j in range(n + 1)]
        t[0][0] = 1
        for i in range(1, n + 1):
            for j in range(0, adjsum + 1):
                krange = ranges[i - 1][1] - ranges[i - 1][0]
                jm = max(j - krange, 0)
                v = 0
                for k in range(jm, j + 1):
                    v += t[i - 1][k]
                t[i][j] = v
        return t

    def intsInRangesWithSum(self, numSamples, ranges, total):
        """Generates one or more combinations of
         'len(ranges)' numbers each, where each
         combination's numbers sum to 'total', and each number
         has its own valid range.  'ranges' is a list of valid ranges
         for each number; the first item in each range is the minimum
         value and the second is the maximum value.  For example,
         'ranges' can be [[1,4],[3,5],[2,6]], which says that the first
         number must be in the interval [1, 4], the second in [3, 5],
         and the third in [2, 6].
          The combinations are chosen uniformly at random.
             Neither the integers in the 'ranges' list nor
         'total' may be negative.  Returns an empty
         list if 'numSamples' is zero.
          This is a modification I made to an algorithm that
            was contributed in a _Stack Overflow_
        answer (`questions/61393463`) by John McClane.
        Raises an error if there is no solution for the given
        parameters."""
        mintotal = sum([x[0] for x in ranges])
        maxtotal = sum([x[1] for x in ranges])
        adjsum = total - mintotal
        # Min, max, sum negative
        if total < 0:
            raise ValueError
        for r in ranges:
            if r[0] < 0 or r[1] < 0:
                raise ValueError
        # No solution
        if mintotal > total or maxtotal < total:
            raise ValueError
        if numSamples == 0:
            return []
        # One solution
        if maxtotal == total:
            return [[x[1] for x in ranges] for i in range(numSamples)]
        if mintotal == total:
            return [[x[0] for x in ranges] for i in range(numSamples)]
        samples = [None for i in range(numSamples)]
        numPerSample = len(ranges)
        table = self._getSolTableForRanges(ranges, adjsum)
        for sample in range(numSamples):
            s = adjsum
            ret = [0 for i in range(numPerSample)]
            for ib in range(numPerSample):
                i = numPerSample - 1 - ib
                v = self.rndintexc(table[i + 1][s])
                r = ranges[i][0]
                v -= table[i][s]
                while v >= 0:
                    s -= 1
                    r += 1
                    v -= table[i][s]
                ret[i] = r
            samples[sample] = ret
        return samples

    def intsInRangeWithSum(self, numSamples, numPerSample, mn, mx, sum):
        """Generates one or more combinations of
         'numPerSample' numbers each, where each
         combination's numbers sum to 'sum' and are listed
         in any order, and each
         number is in the interval '[mn, mx]'.
          The combinations are chosen uniformly at random.
             'mn', 'mx', and
         'sum' may not be negative.  Returns an empty
         list if 'numSamples' is zero.
          The algorithm is thanks to a _Stack Overflow_
        answer (`questions/61393463`) by John McClane.
        Raises an error if there is no solution for the given
        parameters."""
        adjsum = sum - numPerSample * mn
        # Min, max, sum negative
        if mn < 0 or mx < 0 or sum < 0:
            raise ValueError
        # No solution
        if numPerSample * mx < sum:
            raise ValueError
        if numPerSample * mn > sum:
            raise ValueError
        if numSamples == 0:
            return []
        # One solution
        if numPerSample * mx == sum:
            return [[mx for i in range(numPerSample)] for i in range(numSamples)]
        if numPerSample * mn == sum:
            return [[mn for i in range(numPerSample)] for i in range(numSamples)]
        samples = [None for i in range(numSamples)]
        table = self._getSolTable(numPerSample, mn, mx, adjsum)
        for sample in range(numSamples):
            s = adjsum
            ret = [0 for i in range(numPerSample)]
            for ib in range(numPerSample):
                i = numPerSample - 1 - ib
                v = self.rndintexc(table[i + 1][s])
                r = mn
                v -= table[i][s]
                while v >= 0:
                    s -= 1
                    r += 1
                    v -= table[i][s]
                ret[i] = r
            samples[sample] = ret
        return samples

    def _getSolTableSorted(self, n, mn, mx, sum):
        mrange = mx - mn
        t = [
            [[0 for _ in range(sum + 1)] for _ in range(mrange + 1)]
            for _ in range(n + 1)
        ]
        for i in range(0, mrange + 1):
            t[0][i][0] = 1
        for i in range(1, n + 1):
            for k in range(0, sum + 1):
                t[i][0][k] = t[i - 1][0][k]
            for j in range(1, mrange + 1):
                for k in range(0, sum + 1):
                    kj = k - j
                    v = t[i][j - 1][k]
                    if kj >= 0:
                        v += t[i - 1][j][k - j]
                    t[i][j][k] = v
        return t

    def intsInRangeSortedWithSum(self, numSamples, numPerSample, mn, mx, sum):
        """Generates one or more combinations of
         'numPerSample' numbers each, where each
         combination's numbers sum to 'sum' and are listed
         in sorted order, and each
         number is in the interval '[mn, mx]'.
          The combinations are chosen uniformly at random.
             'mn', 'mx', and
         'sum' may not be negative.  Returns an empty
         list if 'numSamples' is zero.
          The algorithm is thanks to a _Stack Overflow_
        answer (`questions/61393463`) by John McClane.
        Raises an error if there is no solution for the given
        parameters."""
        adjsum = sum - numPerSample * mn
        # Min, max, sum negative
        if mn < 0 or mx < 0 or sum < 0:
            raise ValueError
        # No solution
        if numPerSample * mx < sum:
            raise ValueError
        if numPerSample * mn > sum:
            raise ValueError
        if numSamples == 0:
            return []
        # One solution
        if numPerSample * mx == sum:
            return [[mx for i in range(numPerSample)] for i in range(numSamples)]
        if numPerSample * mn == sum:
            return [[mn for i in range(numPerSample)] for i in range(numSamples)]
        samples = [None for i in range(numSamples)]
        table = self._getSolTableSorted(numPerSample, mn, mx, adjsum)
        for sample in range(numSamples):
            s = adjsum
            mrange = mx - mn
            ret = [0 for i in range(numPerSample)]
            for ib in range(numPerSample):
                i = numPerSample - 1 - ib
                ts = table[i + 1][mrange][s]
                v = self.rndintexc(ts)
                mrange = min(mrange, s)
                s -= mrange
                r = mn + mrange
                v -= table[i][mrange][s]
                while v >= 0:
                    s += 1
                    mrange -= 1
                    r -= 1
                    v -= table[i][mrange][s]
                ret[i] = r
            samples[sample] = ret
        if s != 0:
            raise ValueError
        return samples

    MINEXPONENT = -1074
    FPPRECISION = 53
    FPRADIX = 2

    def _fpExponent(self, x):  # The 'e' in s*2**e
        if x == 0:
            return MINEXPONENT
        return max(MINEXPONENT, math.frexp(x)[1] - FPPRECISION)

    def _fpSignificand(self, x):  # The 's' in s*2**e
        if x == 0:
            return 0
        fre = math.frexp(x)
        fexp = fre[1] - FPPRECISION
        c = int((fre[0] - 0.5) * (1 << FPPRECISION)) | (1 << (FPPRECISION - 1))
        if fexp < MINEXPONENT:
            diff = -(fexp - MINEXPONENT)
            if (c & ((1 << diff) - 1)) != 0:
                raise ValueError
            c >>= diff
        return c

    def _fpRatio(self, fp):
        expo = self._fpExponent(fp)
        sig = self._fpSignificand(fp)
        if expo >= 0:
            return [sig * (1 << expo), 1]
        return [sig, 1 << abs(expo)]

    def _toWeights(self, ratios):
        ret = [self._fpRatio(r) for r in ratios]
        ret = [Fraction(f[0], f[1]) for r in ratios]
        prod = 1
        for v in ret:
            prod *= v.denominator
        ret = [int(v * prod) for v in ret]
        gc = 0
        for v in ret:
            gc = math.gcd(gc, v)
        return [v // gc for v in ret]

    def integers_from_pdf(self, pdf, mn, mx, n=1):
        """Generates one or more random integers from a discrete probability
        distribution expressed as a probability density
        function (PDF), which is also called the probability mass
        function for discrete distributions.  The random integers
        will be in the interval [mn, mx].  `n` random integers will be
        generated. `pdf` is the PDF; it takes one parameter and returns,
        for that parameter, a weight indicating the relative probability
        that a random integer will equal that parameter.
        The area under the "curve" of the PDF need not be 1.
        By default, `n` is 1."""
        wt = self._toWeights([pdf(x) for x in range(mn, mx)])
        return r._weighted_choice_n(wt, n, mn)

    def _ensuredenom(self, frac, denom):
        if frac.denominator > denom:
            newnum = int(abs(frac) * denom)
            if frac < 0:
                newnum = -newnum
            return Fraction(newnum, denom)
        return frac

    def _bisectionuniform(self, a, b, bitplaces):
        """  Devroye/Gravel bisection algorithm. """
        if a > b:
            raise ValueError
        if a == b:
            return mn
        epsdenom = 1 << bitplaces
        eps = Fraction(1, epsdenom)
        aax = a / eps
        bbx = b / eps
        if aax.denominator == 1 and bbx.denominator == 1:
            # Fast track
            diff = bbx.numerator - aax.numerator
            return self._ensuredenom(
                a + Fraction(self.rndint(diff), epsdenom), epsdenom
            )
        twoEps = eps * 2
        mn = Fraction(a)
        mx = Fraction(b)
        mxmn = mx - mn
        cdfa = Fraction(0)
        cdfb = Fraction(1)
        while True:
            bit = self.rndint(2)
            cdf = (cdfa + cdfb) / 2
            z = mn + (mx - mn) * cdf
            cdfz = (z - mn) / mxmn
            if bit == 0:
                b = z
                cdfb = cdfz
            else:
                a = z
                cdfa = cdfz
            if b - a <= twoEps:
                return self._ensuredenom((a + b) / 2, epsdenom)

    def numbers_from_dist_inversion(self, icdf, n=1, digitplaces=53, base=2):
        """
        Generates 'n' random numbers that follow a discrete or non-discrete
        probability distribution, using the inversion method.
        Implements section 5 of Devroye and Gravel,
        "Sampling with arbitrary precision", arXiv:1502.02539v5 [cs.IT], 2015.
        - 'n' is the number of random numbers to generate.  Default is 1.
        - 'icdf' is a procedure that takes three arguments: u, ubits, digitplaces,
           and returns a number within base^-digitplaces of the True inverse
           CDF (inverse cumulative distribution function, or quantile function)
           of u/base^ubits, and is nondecreasing for a given value of `digitplaces`.
        - 'digitplaces' is an accuracy expressed as a number of digits after the
           point. Each random number will be a multiple of base^-digitplaces,
           or have a smaller granularity. Default is 53.
        - base is the digit base in which the accuracy is expressed. Default is 2
           (binary). (Note that 10 means decimal.)
        """
        u = 0
        ubits = 0
        threshold = Fraction(1, base ** digitplaces) * 2
        ret = [None for i in range(n)]
        k = 0
        while k < n:
            incr = precision if (ubits == 0) else 8
            u = (u * (base ** incr)) + self.rndintexc(base ** incr)
            ubits += incr
            lower = icdf(u, ubits, precision)
            upper = icdf(u + 1, ubits, precision)
            # ICDF can never go down
            if lower > upper:
                raise ValueError
            diff = upper - lower
            if diff <= threshold:
                ret[k] = upper + (upper - lower) / 2
                k += 1
                u = 0
                ubits = 0
        return ret

    def numbers_from_dist(self, pdf, mn=0, mx=1, n=1, bitplaces=53):
        """
        Generates 'n' random numbers that follow a continuous
        distribution in an interval [mn, mx].  The distribution must have a
        PDF (probability density function) and the PDF must be bounded from above
        (have a finite value) and be continuous almost everywhere
        in the interval.  Implements section 4 of Devroye and Gravel,
        "The expected bit complexity of the von Neumann rejection
        algorithm", arXiv:1511.02273v2  [cs.IT], 2016.
        - 'n' is the number of random numbers to generate.  Default is 1.
        - 'pdf' is a procedure that takes three arguments: xmin, xmax, bitplaces,
           and returns an array of two items: the greatest lower bound of f(x) anywhere
           in the interval [xmin, xmax] (where f(x) is the PDF), and the least upper
           bound of f(x) anywhere there.  Both bounds are multiples of 2^-bitplaces.
        - 'bitplaces' is an accuracy expressed as a number of bits after the
           binary point. The random number will be a multiple of 2^-bitplaces,
           or have a smaller granularity. Default is 53.
        - 'mn' and 'mx' express the interval.  Both are optional and
           are set to 0 and 1, respectively, by default.
        """
        if n < 0 or bitplaces < 0:
            raise ValueError
        r = [Fraction(mn), 0, Fraction(mx), 0]
        infsup = pdf(r[0], r[2], bitplaces)
        firstinfsup = infsup
        r[3] = infsup[1]
        firstrect = [Fraction(r[0]), Fraction(r[1]), Fraction(r[2]), Fraction(r[3])]
        ret = [None for i in range(n)]
        if r[1] > r[3]:
            raise ValueError("pdf() returned negative lower bound")
        k = 0
        hsh = {}
        while k < n:
            r = firstrect
            first = True
            decision = 0
            while decision == 0:
                if first:
                    infsup = firstinfsup
                else:
                    # NOTE: Fractions not stored directly in the
                    # tuple, since otherwise lookup time
                    # would take much longer
                    tup = (
                        r[0].numerator,
                        r[0].denominator,
                        r[2].numerator,
                        r[2].denominator,
                    )
                    if not (tup in hsh):
                        infsup = pdf(r[0], r[2], bitplaces)
                        hsh[tup] = [Fraction(infsup[0]), Fraction(infsup[1])]
                    else:
                        infsup = hsh[tup]
                first = False
                if r[3] <= infsup[0]:  # Below the infimum, accept
                    decision = 1
                elif r[1] > infsup[1]:  # Above the supremum, reject
                    decision = 2
                else:
                    rcx = (r[0] + r[2]) / 2
                    rcy = (r[1] + r[3]) / 2
                    rx = self.rndint(3)
                    rn = [r[0], r[1], r[2], r[3]]
                    if (rx >> 1) == 0:
                        rn[2] = rcx
                    else:
                        rn[0] = rcx
                    if (rx & 1) == 0:
                        rn[1] = rcy
                    else:
                        rn[3] = rcy
                    r = rn
            if decision == 1:
                ret[k] = self._bisectionuniform(r[0], r[2], bitplaces)
                ret[k] = float(ret[k])
                k += 1
        return ret

    def discretegen(self, probs):
        """
        Generates a random integer in [0, n), where the probability
        of drawing each integer is specified as a list
        of probabilities that sum to 1, where n is the
        number of probabilities.  This method is optimal,
        or at least nearly so, in terms of the number of random
        bits required to generate the number
        on average. This method implements
        a solution to exercise 3.4.2 of chapter 15 of Luc Devroye's
        _Non-Uniform Random Variate Generation_, 1986.

        - probs.  List of probability objects, where for each item
           in the probability list, the integer 'i' is chosen
           with probability 'probs[i]'.
           Each probability object provides access to a binary
           expansion of the probability, which must be a real number in
           the interval [0, 1]. The binary expansion is a sequence of zeros and ones
           expressed as follows: The first binary digit is the half digit, the second
           is the quarter digit, the third is the one-eighth digit,
           and so on. Note that any probability with a terminating binary
           expansion (except 0) can be implemented by "subtracting" 1
           from the expansion and then appending an infinite sequence
           of ones at the end. The probability object must implement the following
           three methods:
           - reset(): Resets the probability object to the first digit in
              the binary expansion.
           - nextbit(): Gets the next digit in the binary expansion.
           - eof(): Gets whether the end of the binary expansion was reached
              (True or False), meaning the rest of the digits in the expansion are
              all zeros.
           The probability object will have to be mutable for this method
           to work.
           The BinaryExpansion class is a convenient way to express numbers
           as probability objects that meet these criteria.  Each probability object
           can also be a float, int, or Fraction in the interval [0, 1].
        """
        # Degenerate case
        if len(probs) == 1:
            return 0
        # Reset probabilities' binary expansions to beginning
        probs = [BinaryExpansion.getOrReset(x) for x in probs]
        # Determined by num. of probs.
        maxNodes = 1 << (len(probs).bit_length())
        bitmask = maxNodes - 1
        nodesInLevel = 2
        path = 0
        while True:
            path = (path << 1) + self.randbit()
            path &= bitmask
            # Get next bit in binary expansion
            currbits = [pr.nextbit() for pr in probs]
            eofs = sum(1 if pr.eof() else 0 for pr in probs)
            nodesum = sum(currbits)
            innerNodes = nodesInLevel - nodesum
            # Inner nodes are not needed if the end of all the
            # binary expansions was already reached
            innerNodesNeeded = 0 if (eofs == len(currbits)) else 1
            if nodesum > 0 and innerNodes < innerNodesNeeded:
                # Fill path as necessary so that the number of nodes
                # exceeds the node sum
                while nodesum > 0 and innerNodes < innerNodesNeeded:
                    path = (path << 1) + self.randbit()
                    nodesInLevel += 1
                    path &= bitmask
                    innerNodes = nodesInLevel - nodesum
            if innerNodes >= innerNodesNeeded and path >= nodesInLevel - nodesum:
                # Check for leaves
                pnode = 0
                curnode = nodesInLevel - nodesum
                for i in range(len(currbits)):
                    if currbits[i] == 1:
                        if path == curnode:
                            return i  # Reached end
                        else:
                            curnode += 1
                nodesInLevel -= nodesum
            elif nodesInLevel > nodesum:
                nodesInLevel -= nodesum
            nodesInLevel += innerNodes
            nodesInLevel = min(maxNodes, nodesInLevel)

    def numbers_from_pdf(self, pdf, mn, mx, n=1, steps=100):
        """Generates one or more random numbers from a continuous probability
        distribution expressed as a probability density
        function (PDF).  The random number
        will be in the interval [mn, mx].  `n` random numbers will be
        generated. `pdf` is the PDF; it takes one parameter and returns,
        for that parameter, a weight indicating the relative probability
         that a random number will be close to that parameter. `steps`
        is the number of subintervals between sample points of the PDF.
        The area under the curve of the PDF need not be 1.
        By default, `n` is 1 and `steps` is 100."""
        values = [mn + (mx - mn) * i * 1.0 / steps for i in range(steps + 1)]
        weights = [pdf(v) for v in values]
        return self.piecewise_linear_n(values, weights, n)

    def numbers_from_cdf(self, cdf, mn, mx, n=1):
        """Generates one or more random numbers from a non-discrete probability
        distribution by numerically inverting its cumulative
        distribution function (CDF).

        - cdf: The CDF; it takes one parameter and returns,
        for that parameter, the probability that a random number will
        be less than or equal to that parameter.
        - mn, mx: Sampling domain.  The random number
        will be in the interval [mn, mx].
        - n: How many random numbers to generate. Default is 1."""
        return self.numbers_from_u01(
            [self.rndu01() for i in range(n)], None, cdf, mn, mx
        )

    def numbers_from_u01(self, u01, pdf, cdf, mn, mx, ures=None):
        """Transforms one or more random numbers into numbers
        (called quantiles) that follow a non-discrete probability distribution, based on its PDF
        (probability density function) and/or its CDF (cumulative distribution
        function).

        - u01: List of uniform random numbers in [0, 1] that will be
        transformed into numbers that follow the distribution.
        - pdf: The PDF; it takes one parameter and returns,
        for that parameter, the relative probability that a
        random number close to that number is chosen.  The area under
        the PDF need not be 1 (this method works even if the PDF
        is only known up to a normalizing constant). Optional if a CDF is given.
        - cdf: The CDF; it takes one parameter and returns,
        for that parameter, the probability that a random number will
        be less than or equal to that parameter. Optional if a PDF is given.
        For best results, the CDF should be
        strictly increasing everywhere in the
        interval [xmin, xmax] and must output values in [0, 1];
        for best results, the CDF should
        be increasing everywhere in [xmin, xmax].
        - mn, mx: Sampling domain.  The random number
        will be in the interval [mn, mx].  For best results,
        the range given by mn and mx should cover all or
        almost all of the distribution.
        - ures - Maximum approximation error tolerable, or
        "u-resolution".  Default is 10^-8. The underlying sampler's approximation
        error will generally be less than this tolerance, but this is not guaranteed.
        Currently used only if a
        PDF is given.
        """
        if pdf != None and (cdf == None or ures != None):
            sampler = DensityInversionSampler(
                pdf, mn, mx, ures=(1e-8 if ures == None else ures)
            )
            return sampler.quantile(u01)
        elif cdf != None:
            sampler = KVectorSampler(cdf, mn, mx, pdf)
            return sampler.quantile(u01)
        else:
            raise ValueError

    def integers_from_u01(self, u01, pmf):
        """Transforms one or more random numbers into numbers
        (called quantiles) that
        follow a discrete distribution, assuming the distribution
              produces only integers 0 or greater.
              - `u01` is a list of uniform random numbers, in [0, 1].
              - `pmf` is the probability mass function (PMF)
              of the discrete distribution; it takes one parameter and returns,
              for that parameter, the probability that a random number is
              equal to that parameter (each probability is in the interval [0, 1]).
              The area under the PMF must be 1; it
              is not enough for the PMF to be correct up to a constant.
        """
        ret = [0 for i in range(len(u01))]
        pdftable = [pmf(i) for i in range(10)]
        for i in range(len(u01)):
            j = 0
            p = pdftable[0]
            u = u01[i]
            while u > p:
                u = u - p
                j = j + 1
                p = pdftable[j] if j < len(pdftable) else pmf(j)
            ret[i] = j
        return ret

    def randomwalk_u01(self, n):
        """ Random walk of uniform 0-1 random numbers. """
        ret = [0 for i in range(n + 1)]
        for i in range(n):
            ret[i] = self.rndu01()
        for i in range(n):
            ret[i + 1] = ret[i + 1] + ret[i]
        return ret

    def randomwalk_posneg1(self, n):
        """ Random walk of uniform positive and negative steps. """
        ret = [0 for i in range(n + 1)]
        for i in range(n):
            ret[i] = self.rndint(1) * 2 - 1
        for i in range(n):
            ret[i + 1] = ret[i + 1] + ret[i]
        return ret

    def wiener(self, st, en, step=1.0, mu=0.0, sigma=1.0):
        """Generates random numbers following a Wiener
        process (Brownian motion). Each element of the return
        value contains a timestamp and a random number in that order."""
        if st == en:
            return [[st, self.normal(mu * st, sigma * math.sqrt(st))]]
        ret = []
        i = st
        lastv = 0
        lasttime = st
        while i < en:
            if i == st:
                lastv = self.normal(mu * st, sigma * math.sqrt(st))
            else:
                lastv = lastv + self.normal(mu * step, sigma * math.sqrt(step))
            lasttime = i
            ret.append([i, lastv])
            i += step
        lastv = lastv + self.normal(
            mu * (en - lasttime), sigma * math.sqrt(en - lasttime)
        )
        ret.append([i, lastv])
        return ret

    def _kthsmallest_internal(self, ret, index, n, k, compl=0):
        # Generate a sorted list of uniform PSRNs in the portion
        # of ret at the position range [index, n + index].
        # compl=0 -> kth smallest; compl=1 -> kth largest
        # Early exit if we go beyond the kth smallest index
        if index >= k:
            return
        # Each uniform (0, 1) random number is equally likely to
        # be less than half or greater than half; thus, the number
        # of uniform numbers that are less than half vs. greater
        # than half follows a binomial(n, 1/2) distribution.
        # The same applies to other digits in the number's
        # binary expansion, such as 1/4, 1/8, 1/16, etc.
        leftcount = self.binomial(n, 0.5)
        rightcount = n - leftcount
        clearbit = compl
        setbit = 1 - compl
        # Add clear bit to left-hand side
        for i in range(index, index + leftcount):
            ret[i][2].append(clearbit)
        # Recurse for left-hand side
        if leftcount > 1:
            self._kthsmallest_internal(ret, index, leftcount, k, compl)
        # Add set bit to right-hand side
        if index + leftcount < k:
            for i in range(index + leftcount, index + n):
                ret[i][2].append(setbit)
            # Recurse for right-hand side
            if rightcount > 1:
                self._kthsmallest_internal(ret, index + leftcount, rightcount, k, compl)

    def kthsmallest_psrn(self, n, k):
        """Generates the 'k'th smallest 'b'-bit uniform random
        number out of 'n' of them; returns the result in
        the form of a uniform partially-sampled random number."""
        if k <= 0 or k > n:
            raise ValueError
        ret = [psrn_new_01() for i in range(n)]
        if k < n / 2:
            # kth smallest
            self._kthsmallest_internal(ret, 0, n, k, 0)
            return ret[k - 1]
        else:
            # (n-k+1)th largest
            self._kthsmallest_internal(ret, 0, n, n - k + 1, 1)
            return ret[n - k]

    def kthsmallest(self, n, k, b):
        """Generates the 'k'th smallest 'b'-bit uniform random
        number out of 'n' of them."""
        if k <= 0 or k > n:
            raise ValueError
        return psrn_fill(self, self.kthsmallest_psrn(n, k), precision=b)

    def fromDyadicDecompCode(self, code, precision=53):
        """Generates a uniform random number contained in a box described
            by the given universal dyadic decomposition code.
            - code: A list returned by the getDyadicDecompCode
              or getDyadicDecompCodePdf method.
            - precision: Desired minimum precision in number of binary digits
              after the point.  Default is 53.

        Reference: C.T. Li, A. El Gamal, "A Universal Coding Scheme for
        Remote Generation of Continuous Random Variables",
        arXiv:1603.05238v1  [cs.IT], 2016.
        """
        k = code[0]
        bitgen = max(0, precision - k)
        mult = 2.0 ** -(k + bitgen)  # To convert to a float
        return [
            (x * (1 << bitgen) + self.rndintexc(1 << bitgen)) * mult for x in code[1]
        ]

    def _floorint(self, x):
        r = int(x)
        if r == x:
            return r
        return r - 1 if x < 0 else r

    def _ceilint(self, x):
        r = int(x)
        if r == x:
            return r
        return r if x < 0 else r + 1

    def _setinc(self, f, box, z):
        bounds = f(box)
        if z < bounds[0]:
            return 2
        if z > bounds[1]:
            return 0
        return 1

    def getDyadicDecompCodePdf(self, point, pdf=None, pdfbounds=None, precision=53):
        """
        Finds a code describing the position and size of a box that covers the given
        point in the universal dyadic decomposition for random number generation,
        based on a non-uniform probability density function.  It generates a
        random number for this purpose, so the return value may differ from call to
        call.
        - point: A list of coordinates of a point in space.  This method assumes
          the point was random generated and within the support of a continuous
          distribution with a PDF.  Let N be the number of coordinates of this parameter
          (the number of dimensions).
        - pdf: The probability density function (PDF) of the continuous distribution.
          This method takes as input a list
          containing N coordinates describing a point in space, and returns the probability
          density of that point as a single number.  If this parameter is given, however:
          - This method assumes the PDF is unimodal and strictly decreasing in every direction away from the PDF's mode, and may return incorrect results if that is not the case.
          - If the given PDF outputs floating-point numbers, the resulting
            dyadic decomposition code may be inaccurate due to rounding errors.
        - pdfbounds: A function that returns the lower and upper bounds of the PDF's value
          at a box. This method takes as input a list containing N items, where each item
          is a list containing the lowest and highest value of the box for the
          corresponding dimension.  Returns a list
          containing two items: the lower bound and the upper bound, respectively, of the
          PDF anywhere in the given box.  If this parameter is
          given, this method assumes the PDF is continuous almost everywhere and bounded
          from above; the dyadic decomposition will generally work only if that is the case.
        - precision: Precision of random numbers generated by this method, in binary digits
          after the point.  Default is 53.
        Returns a list containing two items. The first describes the size of the box
        (as a negative power of 2). The second is a list of coordinates describing the
        position.  Let v be 2**-ret[0].  The box is then calculated as (ret[1][0]*v,
        ret[1]*v+v), ..., (ret[1][n-1]*v, ret[1][n-1]*v+v).
        Raises an error if the point is determined to be outside the support of the PDF.
        Either pdf or pdfbounds must be passed to this method, but not both.

        Reference: C.T. Li, A. El Gamal, "A Universal Coding Scheme for
        Remote Generation of Continuous Random Variables",
        arXiv:1603.05238v1  [cs.IT], 2016.
        """
        if (pdf != None and pdfbounds != None) or (pdf == None and pdfbounds == None):
            raise ValueError("either pdf or pdfbounds must be given, but not both")
        if pdf != None:
            pp = Fraction(pdf(point))
            pp2 = self.rndintexc(self._floorint(pp * (1 << precision)))
            z = Fraction(pp2, 1 << precision)
            f2 = lambda pt: pdf(pt) >= z
            return self.getDyadicDecompCode(point, f=f2)
        else:
            while True:
                pb = pdfbounds([[v, v] for v in point])
                pp2 = self.rndintexc(self._ceilint(Fraction(pb[1]) * (1 << precision)))
                z = Fraction(pp2, 1 << precision)
                f2 = lambda pt: self._setinc(pdfbounds, pt, z)
                if z <= pb[0]:
                    return self.getDyadicDecompCode(point, fbox=f2)
                else:
                    # Unusual case that z is greater than lower bound,
                    # so getDyadicDecompCode might fail
                    try:
                        c = self.getDyadicDecompCode(point, fbox=f2)
                        return c
                    except:
                        pass

    def getDyadicDecompCode(self, point, f=None, fbox=None):
        """
        Finds a code describing the position and size of a box that covers the given
        point in the universal dyadic decomposition for random number generation.
        - point: A list of coordinates of a point in space.  This method assumes
          the point was a randomly generated member of a geometric set (such as a
          sphere, ellipse, polygon, or any other volume).  Let N be the number
          of coordinates of this parameter (the number of dimensions).
        - f: A function that determines whether a point belongs in the geometric set.
          Returns True if so, and False otherwise.  This method takes as input a list
          containing N coordinates describing a point in space.  If this parameter is
          given, this method assumes the geometric set is convex (and this method
          may return incorrect results for concave sets), because the method checks
          only the corners of each box to determine whether the box is entirely included
          in the geometric set.
        - fbox: A function that determines whether a box is included
          in the geometric set. This method takes
          as input a list containing N items, where each item is a list containing the
          lowest and highest value of the box for the corresponding dimension.  Returns 0 if the
          box is entirely outside the set, 1 if the box is partially inside the set (or if the
          method is not certain whether the box is inside or outside the set), and 2
          if the box is entirely inside the set.
        Returns a list containing two items. The first describes the size of the box
        (as a negative power of 2). The second is a list of coordinates describing the
        position.  Let v be 2**-ret[0].  The box is then calculated as (ret[1][0]*v,
        ret[1]*v+v), ..., (ret[1][n-1]*v, ret[1][n-1]*v+v).
        Raises an error if the point was determined not to belong in the geometric set.
        Either f or fset must be passed to this method, but not both.

        Reference: C.T. Li, A. El Gamal, "A Universal Coding Scheme for
        Remote Generation of Continuous Random Variables",
        arXiv:1603.05238v1  [cs.IT], 2016.
        """
        if (f != None and fbox != None) or (f == None and fbox == None):
            raise ValueError("either f or fbox must be given, but not both")
        pt = [self._floorint(v) for v in point]
        k = 0
        while True:
            boxsize = Fraction(1, 1 << k)
            box = [[x * boxsize, x * boxsize + boxsize] for x in pt]
            if fbox != None:
                r = fbox(box)
                if r == 2:
                    return [k, pt]
                if r == 0:
                    raise ValueError("outside of set")
            elif f != None:
                success = True
                isoutside = True
                for corner in range(1 << len(box)):
                    pttmp = [
                        box[i][1 if (corner & (1 << i)) != 0 else 0]
                        for i in range(len(box))
                    ]
                    if not f(pttmp):
                        success = False
                        if not isoutside:
                            break
                    else:
                        isoutside = False
                if isoutside:
                    raise ValueError("outside of set")
                if success:
                    return [k, pt]
            point = [Fraction(v) * 2 for v in point]
            pt = [self._floorint(v) for v in point]
            k += 1

class ConvexPolygonSampler:
    """A class for uniform random sampling of
    points from a convex polygon.  This
    class only supports convex polygons because
    the random sampling process involves
    triangulating a polygon, which is trivial
    for convex polygons only. "randgen" is a RandomGen
    object, and "points" is a list of points
    (two-item lists) that make up the polygon."""

    def __init__(self, randgen, points):
        if len(points) < 3:
            raise ValueError
        self.randgen = randgen
        self.points = [[p[0], p[1]] for p in points]
        # Triangulate polygon
        self.triangles = [
            [self.points[0], self.points[i], self.points[i + 1]]
            for i in range(1, len(self.points) - 1)
        ]
        # Calculate areas for each triangle
        self.areas = [self._area(t) for t in self.triangles]

    def _area(self, tri):
        return (
            abs(
                (tri[1][0] - tri[0][0]) * (tri[2][1] - tri[0][1])
                - (tri[2][0] - tri[0][0]) * (tri[1][1] - tri[0][1])
            )
            * 0.5
        )

    def sample(self):
        """Choose a random point in the convex polygon
        uniformly at random."""
        index = self.randgen.weighted_choice(self.areas)
        tri = self.triangles[index]
        return self.randgen.simplex_point(tri)

class _KVectorRootSolver:
    def _derivcdf(self, cdf, x):
        eps = 0.0001
        return (cdf(x + eps) - cdf(x - eps)) / (2 * eps)

    def _linspace(self, a, b, size):
        return [a + (b - a) * (x * 1.0 / size) for x in range(size + 1)]

    def _findroot(self, f, df, y, x, x2):
        if df != None:
            # Use Newton method if df is given
            for i in range(5):
                fv = f(x) - y
                dfv = df(x)
                if dfv == 0:
                    return x
                fv /= dfv
                if abs(fv) < 2.22e-16:
                    return x
                x -= fv
            return x
        else:
            # Use regula falsi (secant) method if df is not given
            nx = x
            if x == x2:
                return x
            for i in range(10):
                fa = f(x)
                fb = f(x2)
                if fb == fa:
                    return nx
                nx = x + (x2 - x) * (y - fa) / (fb - fa)
                fnx = f(nx)
                if fnx <= y:
                    x = nx
                else:
                    x2 = nx
                if abs(x2 - x) < 2.22e-16:
                    return nx
            return nx

    def __init__(self, cdf, xmin, xmax, pdf=None):
        self.pdf = pdf
        self.cdf = cdf
        self.numElements = 1
        if self.pdf == None:
            self.numElements = 2
            # self.pdf = lambda x: self._derivcdf(self.cdf, x)
        eps = 2.22e-16
        x = self._linspace(xmin, xmax, 2000)
        n = len(x)
        xy = [[cdf(v), v] for v in x]
        ys = [v[0] for v in xy]
        deltas = [abs(ys[i + 1] - ys[i]) for i in range(n - 1)]
        self.delta = max(deltas) * 4 * eps
        xy.sort()
        xs = [v[1] for v in xy]  # x's corresponding to sorted y's
        ys.sort()  # sorted y's
        self.delta_x = (xmax - xmin) * 1.0 / (n - 1)
        ymax = ys[n - 1]
        ymin = ys[0]
        xi = eps * max(abs(ymin), abs(ymax))
        self.m = ((ymax - ymin) + 2.0 * xi) / (n - 1)
        self.q = ymin - self.m - xi
        self.xs = xs
        self.ys = ys
        self.k = [0 for i in range(n + 1)]  # One-based
        self.k[1] = 0
        self.k[n] = n
        for i in range(1, n + 1):
            self.k[i] = n
            for j in range(1, n + 1):
                if self.ys[j - 1] > self.m * i + self.q:
                    self.k[i] = j - 1
                    break

    def solve(self, ylist):
        return [self._solveone(v) for v in ylist]

    def _solveone(self, yr):
        halfdelta = self.delta * 0.5
        ya = yr - halfdelta * self.numElements
        yb = yr + halfdelta * self.numElements
        n = len(self.ys)
        ja = int(math.floor((ya - self.q) / self.m))
        jb = int(math.ceil((yb - self.q) / self.m))
        ja = max(1, min(n, ja))
        jb = max(1, min(n, jb))
        ja = self.k[ja] + 1  # One-based
        jb = self.k[jb]  # One-based
        ka = min(ja, jb)
        kb = max(ja, jb)
        xy = [[self.xs[i - 1], self.ys[i - 1]] for i in range(ka, kb + 1)]
        if len(xy) == 1:
            return self._findroot(self.cdf, self.pdf, yr, xy[0][0], xy[0][0])
        elif len(xy) == 2 and self.numElements == 2:
            return self._findroot(self.cdf, self.pdf, yr, xy[0][0], xy[1][0])
        xy.sort()
        roots = []
        delta_x_and_half = self.delta_x * 1.5
        for i in range(len(xy) - 1):
            xdiff = xy[i + 1][0] - xy[i][0]
            if xdiff >= delta_x_and_half:
                # New potential root found
                roots.append(self._findroot(self.cdf, self.pdf, yr, xy[i][0], xy[i][0]))
            if xdiff < delta_x_and_half and i == 0:
                # New potential root found
                roots.append(
                    self._findroot(self.cdf, self.pdf, yr, xy[i][0], xy[i + 1][0])
                )
        return roots[0]  # Return the first root found

class _GaussLobatto:
    NODES = [0, 0.17267316464601146, 0.5, 0.8273268353539885, 1]
    WEIGHTS = [0.05, 49.0 / 180, 64.0 / 180, 49.0 / 180, 0.05]

    def __init__(self, pdf):
        self.pdf = pdf
        self.tol = 0
        self.table = {}

    def setTol(self, tol):
        self.tol = tol

    def gl(self, a, b):
        r = 0
        while a in self.table:
            v = self.table[a]
            if v[0] == b:
                return r + v[1]
            if v[0] < b:
                r += v[1]
                a = v[0]
            else:
                break
        r += self._gl_inner(a, b)
        return r

    def _gl_inner(self, a, b):
        r = 0
        h = b - a
        for i in range(5):
            fx = h * _GaussLobatto.NODES[i] + a
            r += _GaussLobatto.WEIGHTS[i] * h * self.pdf(fx)
        return r

    def agl(self, a, h):
        if a > h:
            return -self.agl(h, a)
        mid = a + (h - a) * 0.5
        i0 = self._gl_inner(a, h)
        i1a = self._gl_inner(a, mid)
        i1b = self._gl_inner(mid, h)
        i1 = i1a + i1b
        if abs(i1 - i0) < self.tol:
            self.table[a] = [mid, i1a]
            self.table[mid] = [h, i1b]
            return i1
        ret = self.agl(a, mid) + self.agl(mid, h)
        return ret

_GaussKronrodArray = [
    0.99693392252959545,
    0.00825771143316837,
    0.00000000000000000,
    0.98156063424671924,
    0.02303608403898155,
    0.04717533638651112,
    0.95053779594312127,
    0.03891523046929952,
    0.00000000000000000,
    0.90411725637047491,
    0.05369701760775668,
    0.10693932599531891,
    0.84355812416115328,
    0.06725090705083998,
    0.00000000000000000,
    0.76990267419430469,
    0.07992027533360173,
    0.16007832854334625,
    0.68405989547005586,
    0.09154946829504924,
    0.00000000000000000,
    0.58731795428661748,
    0.10164973227906016,
    0.20316742672306579,
    0.48133945047815713,
    0.11002260497764407,
    0.00000000000000000,
    0.36783149899818018,
    0.11671205350175679,
    0.23349253653835478,
    0.24850574832046932,
    0.12162630352394839,
    0.00000000000000000,
    0.12523340851146891,
    0.12458416453615606,
    0.24914704581340283,
    0.00000000000000000,
    0.12555689390547423,
    0.00000000000000000,
]

def _gaussKronrod(func, mn, mx, direction=1, depth=0):
    bm = (mx - mn) * 0.5
    bp = mn + bm
    gauss = 0
    kronrod = 0
    i = 0
    while i < len(_GaussKronrodArray):
        gaussWeight = _GaussKronrodArray[i + 2]
        kronrodWeight = _GaussKronrodArray[i + 1]
        abscissa = _GaussKronrodArray[i]
        x = func(bm * abscissa + bp)
        # print([bm * abscissa + bp, x])
        gauss += gaussWeight * x
        kronrod += kronrodWeight * x
        if abscissa > 0:
            x = func(-bm * abscissa + bp)
            gauss += gaussWeight * x
            kronrod += kronrodWeight * x
        i += 3
    gauss = gauss * bm * direction
    kronrod = kronrod * bm * direction
    if abs(gauss - kronrod) < 1e-6:
        return kronrod + (kronrod - gauss) / 8191.0
    elif depth >= 10:
        return kronrod + (kronrod - gauss) / 8191.0
    else:
        return _gaussKronrod(func, mn, bp, direction, depth + 1) + _gaussKronrod(
            func, bp, mx, direction, depth + 1
        )

class RatioOfUniformsTiling:
    """Produces a tiling for the purposes
         of fast sampling from a probability distribution via the
         ratio of uniforms method.

    - pdf: The probability density function (PDF); it takes one parameter and returns,
       for that parameter, the relative probability that a
       random number close to that number is chosen.  The area under
       the PDF need not be 1; this method works even if the PDF
       is only known up to a normalizing constant, and even if
       the distribution has infinitely extending tails to the left and/or right.
       However, for the ratio of uniforms method to work, both pdf(x) and
       x*x*pdf(x) must be bounded from above (thus, if the distribution has
       tails, they must drop off at a faster than quadratic rate).
    - mode: X-coordinate of the PDF's highest peak or one of them,
       or a location close to it.  Optional; default is 0.
    - y0, y1: Bounding coordinates for the ratio-of-uniforms tiling.
       For this class to work, y0 <= min( x*sqrt(pdf(x)) ) and
       y1 >= max( x*sqrt(pdf(x)) ) for every x.  Optional; the default is y0=-10, y1=10.
    - cycles - Number of recursion cycles in which to split tiles
       for the ratio-of-uniforms tiling.  Default is 8.

     Additional improvements not yet implemented:
     Generalized ratio-of-uniforms in Hörmann et al., "Automatic
     Nonuniform Random Variate Generation", 2004.

     References:
     Section IV.7 of Devroye, L., "Non-Uniform Random Variate Generation", 1986.
     Section 4.5 of Fulger, D., "From phenomenological modelling of anomalous
     diffusion through continuous-time random walks and fractional
     calculus to correlation analysis of complex systems", dissertation,
     Philipps-Universität Marburg, 2009.
    """

    def __init__(self, pdf, mode=0, y0=-10, y1=10, cycles=8):
        self.pdf = pdf
        x0 = math.sqrt(self.pdf(mode))
        # NOTE: Adjust x0 in case the mode was given approximately
        self.tiles = [[0, max(1, x0) * 2, False, y0, y1]]
        self._appendTiles(cycles)
        if len(self.tiles) == 0:
            self.tiles = self._estimateExtents(0, max(1, x0) * 2, y0, y1)
            self._appendTiles(cycles)
            if len(self.tiles) == 0:
                raise ValueError("Tiling failed")

    def _appendTiles(self, cycles):
        for i in range(cycles):
            newtiles = []
            for t in self.tiles:
                cx = (t[0] + t[1]) / 2.0
                cy = (t[3] + t[4]) / 2.0
                if t[2]:
                    # entirely within PDF, so just split
                    newtiles.append([t[0], cx, True, cy, t[4]])
                    newtiles.append([t[0], cx, True, t[3], cy])
                    newtiles.append([cx, t[1], True, cy, t[4]])
                    newtiles.append([cx, t[1], True, t[3], cy])
                else:
                    self.maybeAppend(newtiles, t[0], cx, t[3], cy)
                    self.maybeAppend(newtiles, t[0], cx, cy, t[4])
                    self.maybeAppend(newtiles, cx, t[1], t[3], cy)
                    self.maybeAppend(newtiles, cx, t[1], cy, t[4])
            self.tiles = newtiles

    def _estimateExtents(self, xmn, xmx, ymn, ymx):
        m = []
        discarded = False
        xpoints = 10
        ypoints = max(int((ymx - ymn) / 0.2), 10)
        miny = math.inf
        maxy = -math.inf
        maxx = 0
        for xi in range(xpoints + 1):
            x = xmn + (xmx - xmn) * xi * 1.0 / xpoints
            if x <= 0:
                continue
            for yi in range(ypoints + 1):
                y = ymn + (ymx - ymn) * yi * 1.0 / ypoints
                try:
                    yx = y / x
                    ppdf = self.pdf(yx)
                    val = math.sqrt(ppdf)
                    if ppdf >= 0 and (not math.isnan(val)):
                        miny = min(miny, yx * val)
                        maxy = max(maxy, yx * val)
                        maxx = max(maxx, val)
                except:
                    pass
        if miny == math.inf:
            raise ValueError("Tiling failed")
        return [[0, maxx * 1.5, False, miny * 1.2, maxy * 1.2]]

    def maybeAppend(self, newtiles, xmn, xmx, ymn, ymx, depth=0):
        m = []
        discarded = False
        xpoints = 10
        ypoints = max(int((ymx - ymn) / 0.2), 10)
        for xi in range(xpoints + 1):
            x = xmn + (xmx - xmn) * xi * 1.0 / xpoints
            if x <= 0:
                continue
            for yi in range(ypoints + 1):
                y = ymn + (ymx - ymn) * yi * 1.0 / ypoints
                try:
                    yx = y / x
                    ppdf = self.pdf(yx)
                    val = math.sqrt(ppdf)
                    if ppdf >= 0 and (not math.isnan(val)) and x <= val:
                        m.append(y / x)
                    else:
                        discarded = True
                        if len(m) > 0:
                            break
                except:
                    # print([y,x])
                    discarded = True
                    if len(m) > 0:
                        break
                    pass
        if len(m) == 0:
            return
        # print(m)
        if not discarded:
            # Accept
            newtiles.append([xmn, xmx, True, ymn, ymx])
        else:
            # Maybe accept
            newtiles.append([xmn, xmx, False, ymn, ymx])

    def svg(self):
        ret = (
            "<svg width='640px' height='640px' viewBox='0 -1 1 2'"
            + " xmlns='http://www.w3.org/2000/svg'>\n"
        )
        for tile in self.tiles:
            ret += (
                "<path style='fill:none;stroke:black;stroke-width:0.001px' "
                + "d='M%f %fL%f %fL%f %fL%f %fZ'/>\n"
            ) % (tile[0], tile[3], tile[0], tile[4], tile[1], tile[4], tile[1], tile[3])
        ret += "</svg>\n"
        return ret

    def sample(self, rg, n=1):
        """Generates random numbers that (approximately) follow the
              distribution modeled by this class.
        - n: The number of random numbers to generate.
        Returns a list of 'n' random numbers."""
        # self.iters=0
        ret = [self._sampleOne(rg) for i in range(n)]
        # print(n*1.0/self.iters)
        return ret

    def codegen(self, name, pdfcall=None):
        """Generates Python code that samples
                (approximately) from the distribution estimated
                in this class.  Idea from Leydold, et al.,
                "An Automatic Code Generator for
                Nonuniform Random Variate Generation", 2001.
        - name: Distribution name.  Generates a Python method called
           sample_X where X is the name given here (samples one
           random number).
        - pdfcall: Name of the method representing pdf (for more information,
           see the __init__ method of this class).  Optional; if not given
           the name is pdf_X where X is the name given in the name parameter."""
        if pdfcall == None:
            pdfcall = "pdf_" + name
        ret = "import random\n\n"
        ret += "TABLE_" + name + " = ["
        for i in range(len(self.tiles)):
            if i > 0:
                ret += ",\n"
            ret += "%s" % (str(self.tiles[i]))
        ret += "]\n\n"
        ret += "def sample_" + name + "():\n"
        ret += "     while True:\n"
        ret += (
            "        tile = TABLE_"
            + name
            + "[random.randint(0, %d)]\n" % (len(self.tiles) - 1)
        )
        ret += "        x = random.random() * (tile[1] - tile[0]) + tile[0]\n"
        ret += "        y = random.random() * (tile[3] - tile[4]) + tile[3]\n"
        ret += "        if x == 0: continue\n"
        ret += "        ret = y / x\n"
        ret += "        if tile[2] or x <= math.sqrt(%s(ret)): return ret\n\n" % (
            pdfcall
        )
        return ret

    def _sampleOne(self, rg):
        while True:
            # self.iters+=1
            tile = self.tiles[rg.rndintexc(len(self.tiles))]
            x = rg.rndrangemaxexc(tile[0], tile[1])
            y = rg.rndrangemaxexc(tile[3], tile[4])
            if x == 0:
                continue
            ret = y / x
            if tile[2] or x <= math.sqrt(self.pdf(ret)):
                return ret

class DensityTiling:
    """Produces a tiling of a probability density function (PDF)
         for the purposes of random number generation.  The PDF is
         decomposed into tiles; these tiles will either cross the PDF
         or go below the PDF.  In each recursion cycle, each tile is
         split into four tiles, and tiles that end up above the PDF are
         discarded.

    - pdf: A function that specifies the PDF. It takes a single
      number and outputs a single number. The area under
      the PDF need not equal 1 (this class tolerates the PDF even if
      it is only known up to a normalizing constant).  For best results,
      the PDF should be bounded from above (that is, it should be free of _poles_, or points
      that approach infinity).  If the PDF does contain a pole, this class
      may accommodate the pole by sampling from a modified version of the PDF,
      so that points extremely close to the pole may be sampled
      at a higher or lower probability than otherwise (but not in a way
      that significantly affects the chance of sampling points
      outside the pole region).
    - bl, br - Specifies the sampling domain of the PDF.  Both
       bl and br are numbers giving the domain,
       which in this case is [bl, br].
    - cycles - Number of recursion cycles in which to split tiles
       that follow the PDF.  Default is 8.

     Additional improvements not yet implemented: Hörmann et al.,
     "Inverse Transformed Density Rejection for Unbounded Monotone Densities", 2007.

     Reference:
     Fulger, Daniel and Guido Germano. "Automatic generation of
     non-uniform random variates for arbitrary pointwise computable
     probability densities by tiling",
     arXiv:0902.3088v1  [cs.MS], 2009.
    """

    def __init__(self, pdf, bl, br, cycles=8):
        self.pdf = pdf
        self.poles = []
        pdfevals = {}
        mnmx = self._minmax(pdfevals, bl, br)
        # MinX, MaxX, EntirelyWithinPDF, MinY, MaxY
        self.tiles = [[bl, br, False, 0, mnmx[1] * 1.5]]
        for i in range(cycles):
            newtiles = []
            for t in self.tiles:
                cx = (t[0] + t[1]) / 2.0
                if t[2]:
                    # entirely within PDF, so just split
                    newtiles.append([t[0], cx, True])
                    newtiles.append([t[0], cx, True])
                    newtiles.append([cx, t[1], True])
                    newtiles.append([cx, t[1], True])
                else:
                    cy = (t[3] + t[4]) / 2.0
                    self.maybeAppend(pdfevals, newtiles, t[0], cx, t[3], cy)
                    self.maybeAppend(pdfevals, newtiles, t[0], cx, cy, t[4])
                    self.maybeAppend(pdfevals, newtiles, cx, t[1], t[3], cy)
                    self.maybeAppend(pdfevals, newtiles, cx, t[1], cy, t[4])
            self.tiles = newtiles
        if len(self.tiles) == 0:
            raise ValueError("Tiling failed")

    def _evalpdf(self, x):
        for pole in self.poles:
            if x >= pole[0] and x < pole[1]:
                return pole[2]
        try:
            return self.pdf(x)
        except:
            return 0  # Assume pdf is 0 on failure

    def maybeAppend(self, pdfevals, newtiles, xmn, xmx, ymn, ymx):
        fminmax = self._minmax(pdfevals, xmn, xmx)
        if fminmax[1] == 0:
            # Zero at all sampled points, so discard
            return
        tol = (ymx - ymn) * 0.1
        if max(0, fminmax[0] - tol) > ymx:
            # Entirely below PDF
            newtiles.append([xmn, xmx, True])
        elif fminmax[1] + tol > ymn:
            # Not entirely above PDF
            newtiles.append([xmn, xmx, False, ymn, ymx])

    def _cachedevalpdf(self, pdfevals, x):
        for pole in self.poles:
            if x >= pole[0] and x < pole[1]:
                return pole[2]
        try:
            if x in pdfevals:
                return pdfevals[x]
            ret = self.pdf(x)
            pdfevals[x] = ret
            return ret
        except:
            # Assume there is a pole at infinity at the given point
            pdfevals[x] = math.inf
            return math.inf

    def _minmax(self, pdfevals, mn, mx):
        ct = 50
        m = [
            self._cachedevalpdf(pdfevals, mn + (mx - mn) * x * 1.0 / ct)
            for x in range(ct + 1)
        ]
        retmax = max(m)
        if retmax == math.inf:
            # There are poles somewhere in the PDF
            newpoles = []
            for i in range(len(m)):
                if m[i] == math.inf:
                    x = mn + (mx - mn) * i * 1.0 / ct
                    epsilon = 0.0001
                    xlow = x - epsilon
                    xhigh = x + epsilon
                    maxpt = _gaussKronrod(lambda x: self._evalpdf(x), xlow, xhigh) / (
                        epsilon * 2
                    )
                    m[i] = maxpt
                    newpoles.append([xlow, xhigh, maxpt])
            retmax = max(m)
            for pole in newpoles:
                self.poles.append(pole)
        return [min(m), retmax]

    def codegen(self, name, pdfcall=None):
        """Generates Python code that samples
                (approximately) from the distribution estimated
                in this class.  Idea from Leydold, et al.,
                "An Automatic Code Generator for
                Nonuniform Random Variate Generation", 2001.
        - name: Distribution name.  Generates a Python method called
           sample_X where X is the name given here (samples one
           random number).
        - pdfcall: Name of the method representing pdf (for more information,
           see the __init__ method of this class).  Optional; if not given
           the name is pdf_X where X is the name given in the name parameter."""
        if pdfcall == None:
            pdfcall = "pdf_" + name
        ret = "import random\n\n"
        ret += "TABLE_" + name + " = ["
        for i in range(len(self.tiles)):
            if i > 0:
                ret += ",\n"
            ret += "%s" % (str(self.tiles[i]))
        ret += "]\n\n"
        if len(self.poles) > 0:
            ret += "POLES_" + name + " = ["
            for i in range(len(self.poles)):
                if i > 0:
                    ret += ",\n"
                ret += "%s" % (str(self.poles[i]))
            ret += "]\n\n"
        ret += "def sample_" + name + "():\n"
        ret += "     while True:\n"
        ret += (
            "        tile = TABLE_"
            + name
            + "[random.randint(0, %d)]\n" % (len(self.tiles) - 1)
        )
        ret += "        x = random.random() * (tile[1] - tile[0]) + tile[0]\n"
        ret += "        if tile[2]: return x\n"
        ret += "        y = random.random() * (tile[3] - tile[4]) + tile[3]\n"
        ret += "        try:\n"
        if len(self.poles) > 0:
            ret += "          px = None:\n"
            ret += "          for pole in POLES_" + name + ":\n"
            ret += "            if x >= pole[0] and x < pole[1]:\n"
            ret += "               px = pole[2]\n"
            ret += "               break\n"
            ret += "          if px == None: px = %s(ret)\n" % (pdfcall)
            ret += "          if y < px: return x\n"
        else:
            ret += "          if y < %s(ret): return x\n" % (pdfcall)
        ret += "        except:\n"
        ret += "          pass\n\n"
        return ret

    def sample(self, rg, n=1):
        """Generates random numbers that (approximately) follow the
              distribution modeled by this class.
        - n: The number of random numbers to generate.
        Returns a list of 'n' random numbers."""
        return [self._sampleOne(rg) for i in range(n)]

    def _sampleOne(self, rg):
        while True:
            tile = self.tiles[rg.rndintexc(len(self.tiles))]
            x = rg.rndrangemaxexc(tile[0], tile[1])
            if tile[2]:
                return x
            y = rg.rndrangemaxexc(tile[3], tile[4])
            if y < self._evalpdf(x):
                return x

class DensityInversionSampler:
    """A sampler that generates random samples from
      a continuous distribution for which
      only the probability density function (PDF) is known,
      using the inversion method.  This sampler
      allows quantiles for the distribution to be calculated
      from pregenerated uniform random numbers in [0, 1].

    - pdf: A function that specifies the PDF. It takes a single
      number and outputs a single number. The area under
      the PDF need not equal 1 (this sampler works even if the
      PDF is only known up to a normalizing constant).
    - bl, br - Specifies the sampling domain of the PDF.  Both
       bl and br are numbers giving the domain,
       which in this case is [bl, br].  For best results, the
       probabilities outside the sampling domain should be
       negligible (the reference cited below uses cutoff points
       such that the probabilities for each tail integrate to
       about ures*0.05 or less).
    - ures - Maximum approximation error tolerable, or
      "u-resolution".  Default is 10^-8.  This error tolerance
      "does not work for continuous distributions [whose PDFs
      have] high and narrow peaks or poles".  This sampler's
      approximation error will generally be less than this tolerance,
      but this is not guaranteed, especially for PDFs of the kind
      just mentioned.

      Reference:
      Gerhard Derflinger, Wolfgang Hörmann, and Josef Leydold,
      "Random variate generation by numerical inversion when
      only the density is known", ACM Transactions on Modeling
      and Computer Simulation 20(4) article 18, October 2010.
    """

    def __init__(self, pdf, bl, br, ures=1e-8):
        if bl > br:
            raise ValueError
        n = 5  # Polynomial order of interpolating polynomials
        ures *= 0.9
        glob = _GaussLobatto(pdf)
        i0 = glob.gl(bl, br)
        glob.setTol(0.05 * i0 * ures)
        ii = glob.agl(bl, br)
        self.integral = ii
        a = bl
        h = (br - bl) / 128.0
        f = 0
        table = []
        c = None
        u = None
        chn = self._chebyshevNodes(n)
        while a < br:
            epsi = []
            x = None
            while True:
                x = [0 if i == 0 else h * chn[i] for i in range(len(chn))]
                u = [0 for i in range(0, n + 1)]
                for i in range(1, n + 1):
                    u[i] = u[i - 1] + glob.gl(a + x[i - 1], a + x[i])
                testPoints = self._newtonTestPoints(u)
                c = self._newtonCoeffs(u, x)
                success = True
                xi = [0 for ti in testPoints]
                for i in range(len(xi)):
                    xi[i] = self._newtonEvaluate(c, u, testPoints[i])
                    if i > 0:
                        success |= x[i] <= xi[i] and xi[i] <= x[i + 1]
                    if not success:
                        break
                if not success:
                    h *= 0.8
                    continue
                epsi = [
                    abs(glob.gl(a, a + xi[i]) - testPoints[i])
                    for i in range(len(testPoints))
                ]
                epsimax = max(epsi)
                if math.isnan(epsimax):
                    raise ValueError
                if epsimax <= ures:
                    success = True
                    for i in range(len(xi)):
                        if not (x[i] <= xi[i] and xi[i] <= x[i + 1]):
                            success = False
                            break
                    if success:
                        # NOTE: Commented out because it apparently
                        # doesn't work.
                        # if epsimax<=ures/3.0:
                        #   h*=1.3
                        break
                h *= 0.8
            table.append([c, u, a, f])
            h = min(h, br - (a - h))
            a += h
            f += u[n]
        self.table = table

    def _newtonTestPoints(self, u):
        t = [0.5 * (u[i - 1] + u[i]) for i in range(1, len(u))]
        for i in range(1, len(u)):
            for b in range(2):
                s = 0
                sq = 0
                for k in range(len(u)):
                    d = t[i - 1] - u[k]
                    s += 1.0 / d
                    sq += 1.0 / (d * d)
                t[i - 1] += s / sq
        return t

    def _chebyshevNodes(self, n):
        # Returns n+1 Chebyshev nodes
        phi = math.pi / (2 * (n + 1))
        cphi = math.cos(phi)
        ch = [math.sin(k * phi) * math.sin((k + 1) * phi) / cphi for k in range(n + 1)]
        return ch

    def _newtonCoeffs(self, x, g):  # NOTE: x[0..n], g(x[0..n])
        c = [gx for gx in g]
        for w in range(1, len(x)):
            i = len(x) - 1
            while i >= w:
                c[i] = (c[i] - c[i - 1]) / (x[i] - x[i - w])
                i -= 1
        return c

    def _newtonEvaluate(self, c, xn, x):
        if len(c) != len(xn):
            raise ValueError
        n = len(xn) - 1
        p = c[n]
        k = n - 1
        while k >= 0:
            p = c[k] + p * (x - xn[k])
            k -= 1
        return p

    def quantile(self, v):
        """Calculates quantiles from uniform random numbers
              in the interval [0, 1].
        - v: A list of uniform random numbers.
        Returns a list of the quantiles corresponding to the
        uniform random numbers.  The returned list will have
        the same number of entries as 'v'."""
        return [self._onequantile(x * self.integral) for x in v]

    def codegen(self, name="dist"):
        """Generates standalone Python code that samples
                (approximately) from the distribution estimated
                in this class.  Idea from Leydold, et al.,
                "An Automatic Code Generator for
                Nonuniform Random Variate Generation", 2001.
        - name: Distribution name.  Generates Python methods called
           sample_X (samples one random number), and quantile_X
           (finds the quantile
           for a uniform random number in [0, 1]),
           where X is the name given here."""
        ret = "import random\n\n"
        ret += "TABLE_" + name + " = ["
        for i in range(len(self.table)):
            if i > 0:
                ret += ",\n"
            ret += "[%s, %s, %f, %f]" % (
                str(self.table[i][0]),
                str(self.table[i][1]),
                self.table[i][2],
                self.table[i][3],
            )
        ret += "]\n\n"
        ret += "def sample_" + name + "(unif):\n"
        ret += "  return quantile_" + name + "(random.random())\n\n"
        ret += "def quantile_" + name + "(unif):\n"
        ret += "  r = unif * " + str(self.integral) + "\n"
        ret += "  for j in range(0, len(TABLE_" + name + ") - 1):\n"
        ret += (
            "    if TABLE_"
            + name
            + "[j][3] <= r and r < TABLE_"
            + name
            + "[j + 1][3]:\n"
        )
        ret += "        c = TABLE_" + name + "[j][0]\n"
        ret += "        u = TABLE_" + name + "[j][1]\n"
        ret += "        a = TABLE_" + name + "[j][2]\n"
        ret += "        x = r - TABLE_" + name + "[j][3]\n"
        n = len(self.table[i][1]) - 1
        ret += "        p = c[%d]\n" % (n)
        ret += "        k = %d\n" % (n - 1)
        ret += "        while k >= 0:\n"
        ret += "            p = c[k] + p * (x - u[k])\n"
        ret += "            k -= 1\n"
        ret += "        return a + p\n"
        ret += "  return 0\n\n"
        return ret

    def sample(self, rg, n=1):
        """Generates random numbers that (approximately) follow the
              distribution modeled by this class.
        - n: The number of random numbers to generate.
        Returns a list of 'n' random numbers."""
        return [self._onequantile(rg.rndu01() * self.integral) for i in range(n)]

    def _onequantile(self, r):
        for j in range(0, len(self.table) - 1):
            if self.table[j][3] <= r and r < self.table[j + 1][3]:
                c = self.table[j][0]
                u = self.table[j][1]
                a = self.table[j][2]
                return a + self._newtonEvaluate(c, u, r - self.table[j][3])
        return 0

class PrefixDistributionSampler:
    """An arbitrary-precision sampler for probability distributions
    supported on [0, 1] and bounded from above.
    Note that this sampler currently relies on floating-point operations
    and thus the evaluations of the PDF (the distribution's probability
    density function) could incur rounding errors.
    - pdf: PDF, which takes a value in [0, 1] and returns a probability
      density at that value (which is 0 or greater).  Currently,
      the PDF must be strictly increasing or strictly decreasing.
    Reference: Oberhoff, Sebastian, "Exact Sampling and Prefix
    Distributions", Theses and Dissertations, University of
    Wisconsin Milwaukee, 2018.
    """

    def __init__(self, pdf):
        # NOTE: To ensure accuracy, pdfmax should be an upper bound
        self.pdfmax = max(pdf(0), pdf(1))
        self.pdf = pdf
        self.prefixes = []

    def fill(self, rg, prefixLength, prefix, precision=53):
        if prefixLength < precision:
            prefix <<= precision - prefixLength
            prefix |= rg.rndint((1 << (precision - prefixLength)) - 1)
            prefixLength = precision
        return prefix / (1 << prefixLength)

    def next(self, rg, precision=53):
        while True:
            prefixLength = 0
            prefix = 0
            y = rg.rndrange(0, self.pdfmax)
            while True:
                # NOTE: Should be a rational number,
                # 1/(1<<prefixLength), but Python's Fraction
                # has a very slow implementation
                pw = 2.0 ** (-prefixLength)
                p = prefix * pw
                # NOTE: To ensure accuracy, p1 and p2 should
                # produce lower and upper bounds
                p1 = self.pdf(p)
                p2 = self.pdf(p + pw)
                # NOTE: To ensure accuracy, min should
                # produce a lower bound and max should
                # produce an upper bound
                if y < min(p1, p2):
                    # accepted
                    return self.fill(rg, prefixLength, prefix)
                elif y > max(p1, p2):
                    # rejected
                    break
                else:
                    prefix <<= 1
                    prefix |= rg.rndint(1)
                    prefixLength += 1

class KVectorSampler:
    """A K-Vector-like sampler of a non-discrete distribution
    with a known cumulative distribution function (CDF).
    Uses algorithms
    described in Arnas, D., Leake, C., Mortari, D., "Random
    Sampling using k-vector", Computing in Science &
    Engineering 21(1) pp. 94-107, 2019, and Mortari, D.,
    Neta, B., "k-Vector Range Searching Techniques"."""

    def _linspace(self, a, b, size):
        return [a + (b - a) * (x * 1.0 / size) for x in range(size + 1)]

    def __init__(self, cdf, xmin, xmax, pdf=None, nd=200):
        """Initializes the K-Vector-like sampler.
        Parameters:
        - cdf: Cumulative distribution function (CDF) of the
           distribution.  The CDF must be
           strictly increasing everywhere in the
           interval [xmin, xmax] and must output values in [0, 1];
           for best results, the CDF should
           be increasing everywhere in [xmin, xmax].
        - xmin: Maximum x-value to generate.
        - xmax: Maximum x-value to generate.  For best results,
           the range given by xmin and xmax should cover all or
           almost all of the distribution.
        - pdf: Optional. Distribution's probability density
           function (PDF), to improve accuracy in the root-finding
           process.
        - nd: Optional. Size of tables used in the sampler.
           Default is 200.
        """
        eps = 2.22e-16
        ymin = cdf(xmin)
        ymax = cdf(xmax)
        xi = max(abs(ymin), abs(ymax)) * eps
        self.ys = self._linspace(ymin, ymax, nd - 1)
        # NOTE: Using the K-vector function inversion approach
        # in Arnas et al., but any other root-finding method
        # will work well here, especially since we're only doing
        # root-finding in the setup phase, not the sampling phase.
        # This is perhaps the only non-trivial part of the algorithm.
        roots = _KVectorRootSolver(cdf, xmin, xmax, pdf).solve(self.ys)
        roots = [[self.ys[i], roots[i]] for i in range(len(roots))]
        # Clamp roots for robustness, then
        # recalculate CDFs for the roots,
        # in case some parts of the
        # CDF have zero derivative
        for i in range(len(roots)):
            r = min(xmax, max(xmin, roots[i][1]))
            roots[i][1] = r
            roots[i][0] = cdf(r)
        roots.sort()
        self.xs = [v[1] for v in roots]
        self.ys = [v[0] for v in roots]
        self.ymin = self.ys[0]
        self.ymax = self.ys[len(self.ys) - 1]
        self.ys = [cdf(x) for x in self.xs]
        self.m = (nd - 1) * 1.0 / (self.ymax - self.ymin + 2 * xi)
        self.q = 1 - self.m * (self.ymin - xi)

    def _sampleone(self, rg):
        while True:
            a = rg.rndrange(self.ymin, self.ymax)
            # Do a "search" for 'a'
            b = int(math.floor(self.m * a + self.q))
            x0 = self.xs[b - 1]
            x1 = self.xs[b]
            y0 = self.ys[b - 1]
            y1 = self.ys[b]
            # print([a,x0, x1, y0, y1])
            # Reject "empty" regions
            if y1 == y0 or x1 == x0:
                continue
            return x0 + (a - y0) * (x1 - x0) / (y1 - y0)

    def _invertone(self, a):
        a = self.ymin + (self.ymax - self.ymin) * a
        # Do a "search" for 'a'
        b = int(math.floor(self.m * a + self.q))
        x0 = self.xs[b - 1]
        x1 = self.xs[b]
        y0 = self.ys[b - 1]
        y1 = self.ys[b]
        # print([a,x0, x1, y0, y1])
        # Handle "empty" regions
        if y1 == y0 or x1 == x0:
            return self.xs[0]
        return x0 + (a - y0) * (x1 - x0) / (y1 - y0)

    def quantile(self, uniforms):
        """Returns a list of 'n' numbers that correspond
        to the given uniform random numbers and follow
        the distribution represented by this sampler.  'uniforms'
        is a list of uniform random values in the interval
        [0, 1].  For best results, this sampler's range
        (xmin and xmax in the constructor)
        should cover all or almost all of the desired distribution and
        the distribution's CDF should be strictly
        increasing everywhere (every number that can be taken on
        by the distribution has nonzero probability of occurring), since
        among other things,
        this method maps each uniform value to the
        range of CDFs covered by this distribution (that is,
        [0, 1] is mapped to [minCDF, maxCDF]), and
        uniform values in "empty" regions (regions with
        constant CDF) are handled by replacing those
        values with the minimum CDF value covered."""
        return [self._invertone(u) for u in uniforms]

    def sample(self, rg, n):
        """Returns a list of 'n' random numbers of
        the distribution represented by this sampler.
        - rg: A random generator (RandGen) object."""
        return [self._sampleone(rg) for i in range(n)]

class AlmostRandom:
    def __init__(self, randgen, list):
        if len(list) == 0:
            raise ValueError
        self.randgen = randgen
        self.list = self.randgen.shuffle([x for x in list])
        self.index = 0

    def choose(self):
        if self.index >= len(self.list):
            self.index = 0
            self.list = self.randgen.shuffle(self.list)
        item = self.list[self.index]
        self.index += 1
        return item

# Examples of use
if __name__ == "__main__":
    # Initialize random generator
    randgen = RandomGen()
    import time

    def linspace(a, b, size):
        if (a - b) % size == 0:
            # for robustness when all points are integers
            return [a + ((b - a) * x) // size for x in range(size + 1)]
        return [a + (b - a) * (x * 1.0 / size) for x in range(size + 1)]

    def normalcdf(x, mu=0, sigma=1):
        cdf = (1 + math.erf((x - mu) / (math.sqrt(2) * sigma))) / 2.0
        return cdf

    def normalpdf(x, mu=0, sigma=1):
        x -= mu
        return math.exp(-(x * x) / (2 * sigma * sigma)) / (
            math.sqrt(2 * math.pi) * sigma
        )

    def normaloracle(mn, mx, bitplaces):
        points = []
        if mn < 0 and mx > 0:
            points.append(Fraction(1))
        points.append(Fraction(math.exp(-(mn * mn) / 2)))
        points.append(Fraction(math.exp(-(mx * mx) / 2)))
        eps = Fraction(1, 1 << (bitplaces + 1))
        pmn = max(min(points), 0)
        pmx = max(points)
        return [pmn, pmx]

    def showbuckets(ls, buckets):
        mx = max(0.00000001, max(buckets))
        if mx == 0:
            return
        labels = [
            ("%0.3f %d" % (ls[i], buckets[i]))
            if int(buckets[i]) == buckets[i]
            else ("%0.3f %f" % (ls[i], buckets[i]))
            for i in range(len(buckets))
        ]
        maxlen = max([len(x) for x in labels])
        i = 0
        while i < (len(buckets)):
            print(
                labels[i]
                + " " * (1 + (maxlen - len(labels[i])))
                + ("*" * int(buckets[i] * 40 / mx))
            )
            if (
                buckets[i] == 0
                and i + 2 < len(buckets)
                and buckets[i + 1] == 0
                and buckets[i + 2] == 0
            ):
                print(" ... ")
                while (
                    buckets[i] == 0
                    and i + 2 < len(buckets)
                    and buckets[i + 1] == 0
                    and buckets[i + 2] == 0
                ):
                    i += 1
            i += 1

    def bucket(v, ls, buckets):
        for i in range(len(buckets) - 1):
            if v >= ls[i] and v < ls[i + 1]:
                buckets[i] += 1
                break

    def showfunc(f, mn, mx):
        ls = linspace(mn, mx, 30)
        showbuckets(ls, [f(x) for x in ls])

    # Generate normal random numbers
    def uu():
        print("Generating normal random numbers with numbers_from_dist")
        ls = linspace(-3.3, 3.3, 30)
        buckets = [0 for x in ls]
        t = time.time()
        ksample = randgen.numbers_from_dist(normaloracle, -4, 4, 4000)
        print("Took %f seconds" % (time.time() - t))
        for ks in ksample:
            bucket(ks, ls, buckets)
        showbuckets(ls, buckets)

    print("# Generating binomial random numbers")
    import cProfile
    import numpy

    t = time.time()
    ksample = randgen.binomial(20, 0.5, n=10000)
    print("Took %f seconds" % (time.time() - t))
    ls = linspace(0, 20, 20)
    buckets = [0 for x in ls]
    for ks in ksample:
        bucket(ks, ls, buckets)
    showbuckets(ls, buckets)
    # exit()
    def verify_derangement(x):
        for i in range(len(x)):
            if i == x[i]:
                raise ValueError("%s" % x)

    t = time.time()
    for i in range(100):
        verify_derangement(randgen.derangement([i for i in range(1000)]))

    weights = [2, 45, 3, 1, 44, 23, 9, 22, 33, 11, 88]
    t = time.time()
    ksample = randgen.multinomial(1000, weights)
    print(ksample)
    print("multinomial: Took %f seconds" % (time.time() - t))
    uu()

    print("Generating normal random numbers with numbers_from_pdf")
    ls = linspace(-3.3, 3.3, 30)
    buckets = [0 for x in ls]
    t = time.time()
    ksample = randgen.numbers_from_pdf(normalpdf, -4, 4, 5000, steps=40)
    print("Took %f seconds" % (time.time() - t))
    for ks in ksample:
        bucket(ks, ls, buckets)
    showbuckets(ls, buckets)

    print("Generating normal random numbers with KVectorSampler")
    kvs = KVectorSampler(normalcdf, -4, 4, nd=1000)  # , pdf=normalpdf)
    t = time.time()
    ksample = kvs.sample(randgen, 1000)
    print("Took %f seconds" % (time.time() - t))
    ls = linspace(-3.3, 3.3, 30)
    buckets = [0 for x in ls]
    for ks in ksample:
        bucket(ks, ls, buckets)
    showbuckets(ls, buckets)

    print(randgen.intsInRangesWithSum(10, [[1, 4], [3, 5], [2, 6]], 12))
    print(randgen.intsInRangeWithSum(10, 3, 1, 6, 12))
    print(randgen.intsInRangeSortedWithSum(10, 3, 1, 6, 12))

    # Generate multiple dice rolls
    dierolls = [randgen.diceRoll(2, 6) for i in range(10)]
    # Results
    print("Results: %s" % (dierolls))
    # Highest die roll
    print("Highest: %d" % (max(dierolls)))
    # Lowest die roll
    print("Lowest: %d" % (min(dierolls)))
    # Sum, dropping the lowest
    print("Sum: %d" % (sum(dierolls)))
    # Sum, dropping the lowest
    print("Drop-the-lowest: %d" % (sum(dierolls) - min(dierolls)))
    #
    #  Weighted choice
    #
    ranges = [[0, 5], [5, 10], [10, 11], [11, 13]]
    weights = [3, 15, 1, 2]

    def rc():
        index = randgen.weighted_choice(weights)
        item = ranges[index]  # Choose a random range
        return randgen.rndintexcrange(item[0], item[1])

    print("Weighted choice results")
    print([rc() for i in range(25)])
    print(randgen.weighted_choice_n(weights, 150))
    #
    #  Model times to failure
    #
    rate = 1.0 / 1000  # Failure rate
    print("Times to failure (rate: %f)" % (rate))
    print([randgen.exponential(rate) for i in range(25)])
    print("Times to failure (rate: %f; rationals)" % (rate))
    print([randgen.expoRatio(3000, 1, 1000) for i in range(25)])
    #  Multinormal
    print("Multinormal sample")
    for i in range(10):
        print(randgen.multinormal(None, [[1, 0], [0, 1]]))
    #  Multinormal
    print("Geometric sample")
    print([randgen.negativebinomialint(1, 1, 20) for i in range(25)])
    print([randgen.negativebinomialint(1, 18, 20) for i in range(25)])
    # Random walks
    print("Random walks")
    print(randgen.randomwalk_u01(50))
    print(randgen.randomwalk_posneg1(50))
    # White noise
    print("White noise")
    print([randgen.normal() for i in range(20)])
    # White noise
    print("Binomial values")
    print([randgen.binomial(98, 0.8) for i in range(20)])
    # Demonstrate numerical CDF inversion
    print("Gaussian values by CDF inversion")
    normal_cdf = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))
    print(randgen.numbers_from_cdf(normal_cdf, -6, 6, n=30))
    # Geoellipsoid points
    print("Geoellipsoid points")
    print([randgen.geoellipsoid_point() for i in range(20)])
    # Convex polygon sampler
    poly = [[0, 0], [0, 20], [20, 20], [20, 0]]
    cps = ConvexPolygonSampler(randgen, poly)
    print("Sampling a rectangle")
    for i in range(10):
        print(cps.sample())
    # Estimating raw moments of a normal distribution
    n = [randgen.normal() for i in range(10000)]
    print("Estimating expectation values of a normal distribution")
    print("Mean ~= %f" % (_mean([x for x in n])))
    print("2nd raw moment ~= %f" % (_mean([x ** 2 for x in n])))
    print("3rd raw moment ~= %f" % (_mean([x ** 3 for x in n])))
    print("4th raw moment ~= %f" % (_mean([x ** 4 for x in n])))
    print("5th raw moment ~= %f" % (_mean([x ** 5 for x in n])))
    print("Mean of sines (E<sin(x)>) ~= %f" % (_mean([math.sin(x) for x in n])))

    # Estimates expectation given
    # an array of samples
    def expect(a, f):
        return _mean([f(x) for x in a])

    def trim(x, f):
        ret = []
        for i in x:
            if f(i):
                ret.append(i)
        return ret

    # Two ways to get the estimated
    # conditional expectation given
    # an array of samples and a predicate
    def condexpect1(a, f, pred):
        e1 = expect(nums, lambda x: (f(x) if pred(x) else 0))
        # e2 is probability given predicate
        e2 = expect(nums, lambda x: (1 if pred(x) else 0))
        return e1 / e2

    def condexpect2(a, f, pred):
        # Expectation of only the samples
        # that meet the predicate
        return expect(trim(a, pred), f)

    # Conditional expectation estimation
    nums = [abs(randgen.normal(0, 1)) for _ in range(10000)]
    epred = lambda x: x < 2
    efunc = lambda x: x * x
    print(expect(nums, efunc))
    print(condexpect1(nums, efunc, epred))
    print(condexpect2(nums, efunc, epred))
