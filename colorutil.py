"""
Sample code for the article "Color Topics for Programmers"
https://www.codeproject.com/Articles/1202772/Color-Topics-for-Programmers

Written by Peter O.
Any copyright to this work is released to the Public Domain.
In case this is not possible, this work is also
licensed under Creative Commons Zero (CC0):
https://creativecommons.org/publicdomain/zero/1.0/
"""

import math

#######################

"""
NOTE: These methods appear merely to ease
porting this code into other programming languages.
Where possible, these methods should be implemented
using methods natively supported or commonly used in
the programming language in question.
"""

def matNew(mat):
    """ Creates a matrix from a 2-dimensional array. """
    return matCopy(mat)

def matFromVec(vec):
    """ Creates a one-row matrix from a 1-dimensional vector. """
    return matCopy([vec])

def matDiag(vec):
    """ Creates a diagonal matrix from a 1-dimensional vector. """
    ret = matZeros((len(vec), len(vec)))
    for i in range(len(vec)):
        matSet(ret, i, i, vec[i])
    return ret

def matEye(n):
    """ Creates an NxN matrix with ones in its diagonal. """
    ret = matZeros((n, n))
    for i in range(n):
        matSet(ret, i, i, 1)
    return ret

def matT(mat):
    """ Creates a transposed version of a matrix. """
    shape = matShape(mat)
    return [[matGet(mat, y, x) for y in range(shape[0])] for x in range(shape[1])]

def matCopy(mat):
    """ Creates a copy of a matrix. """
    shape = matShape(mat)
    return [[matGet(mat, x, y) for y in range(shape[1])] for x in range(shape[0])]

def matScale(mat, scale):
    """Creates a copy of a matrix with each element multiplied
    by 'scale'."""
    shape = matShape(mat)
    return [
        [matGet(mat, x, y) * scale for y in range(shape[1])] for x in range(shape[0])
    ]

def matShape(mat):
    """ Gets the height and width, in that order, of the matrix. """
    return (len(mat), len(mat[0]))

def matZeros(shape):
    """Creates a 0-filled matrix of the given height and width,
    in that order."""
    return [[0 for y in range(shape[1])] for x in range(shape[0])]

def matOnes(shape):
    """Creates a 1-filled matrix of the given height and width,
    in that order."""
    return [[1 for y in range(shape[1])] for x in range(shape[0])]

def matAdd(a, b):
    """ Creates a matrix consisting of 'a' plus 'b'. """
    shape = matShape(a)
    return [
        [matGet(a, x, y) + matGet(b, x, y) for y in range(shape[1])]
        for x in range(shape[0])
    ]

def matSub(a, b):
    """ Creates a matrix consisting of 'a' minus 'b'. """
    shape = matShape(a)
    return [
        [matGet(a, x, y) - matGet(b, x, y) for y in range(shape[1])]
        for x in range(shape[0])
    ]

def matMul(a, b):
    """ Creates a matrix consisting of 'a' multiplied by 'b', in that order. """
    sa = matShape(a)
    sb = matShape(b)
    if sa[1] != sb[0]:
        raise ValueError
    ret = matZeros((sa[0], sb[1]))
    for i in range(sa[0]):
        for j in range(sb[1]):
            val = 0.0
            for k in range(sa[1]):
                val += matGet(a, i, k) * matGet(b, k, j)
            matSet(ret, i, j, val)
    return ret

def matI(a):
    """ Creates a matrix consisting of the inverse of 'a'. """
    shape = matShape(a)
    if shape[0] != shape[1]:
        raise ValueError
    n = shape[0]
    ret = matZeros((n, n * 2))
    for i in range(n):
        for j in range(n):
            matSet(ret, i, j, matGet(a, i, j))
    for i in range(n):
        matSet(ret, i, i + n, 1)
    for row in range(n):
        rm = row
        ap = abs(matGet(ret, rm, row))
        for rint in range(row + 1, n):
            p = abs(matGet(ret, rint, row))
            if ap < p:
                ap = p
                rm = rint
        if 0.000000001 > ap:
            return matCopy(a)  # Not invertible
        di = matGet(ret, rm, row)
        if rm != row:
            for i in range(n * 2):
                t = matGet(ret, rm, i)
                matSet(ret, rm, i, matGet(ret, row, i))
                matSet(ret, row, i, t)
        idi = 1.0 / di
        for rint in range(row + 1, n):
            f = idi * matGet(ret, rint, row)
            if f != 0:
                for co in range(row, n * 2):
                    matSet(
                        ret, rint, co, matGet(ret, rint, co) - f * matGet(ret, row, co)
                    )
    row = n - 1
    while row >= 0:
        ic = 1.0 / matGet(ret, row, row)
        for rint in range(row):
            icx = ic * matGet(ret, rint, row)
            if icx != 0:
                for co in range(row, n * 2):
                    matSet(
                        ret,
                        rint,
                        co,
                        matGet(ret, rint, co) - icx * matGet(ret, row, co),
                    )
        matSet(ret, row, row, ic * matGet(ret, row, row))
        for co in range(n, n * 2):
            matSet(ret, row, co, ic * matGet(ret, row, co))
        row -= 1
    return matPart(ret, 0, n, n, n * 2)

def matSet(mat, r, c, v):
    """ Sets the (v)alue of the given (r)ow and (c)olumn of the (mat)rix. """
    mat[r][c] = v

def matGet(mat, r, c):
    """ Gets the value of the given (r)ow and (c)olumn of the (mat)rix. """
    return mat[r][c]

def matPart(mat, rs, re, cs, ce):
    """Gets part of a matrix with rows indexed rs inclusive to re exclusive
    and columns indexed cs inclusive to ce exclusive."""
    return [[matGet(mat, x, y) for y in range(cs, ce)] for x in range(rs, re)]

def matBlock(a, b, c, d):
    """Concatenates the topleft, topright, bottomleft, and bottomright
    matrices into one."""
    arows = matShape(a)[0]
    acols = matShape(a)[1]
    shape1 = arows + matShape(c)[0]
    shape2 = acols + matShape(b)[1]
    ret = matZeros((shape1, shape2))
    for i in range(shape1):
        for j in range(shape2):
            val = 0
            if i < arows:
                val = matGet(
                    (a if j < acols else b), i, (j if j < acols else j - acols)
                )
            else:
                val = matGet(
                    (c if j < acols else d), i - arows, (j if j < acols else j - acols)
                )
            matSet(ret, i, j, val)
    return ret

def vecDot(a, b):
    """ Finds the dot product of two number lists of equal size. """
    ret = 0.0
    for i in range(len(a)):
        ret += a[i] * b[i]
    return ret

#######################

# The following tables were taken from
# "Selected Colorimetric Tables" on the CIE Web site:
# http://www.cie.co.at/technical-work/technical-resources

# CIE 1931 Observer

_CIE1931 = [
    0.001368,
    0.000039,
    0.006450,
    0.002236,
    0.000064,
    0.010550,
    0.004243,
    0.000120,
    0.020050,
    0.007650,
    0.000217,
    0.036210,
    0.014310,
    0.000396,
    0.067850,
    0.023190,
    0.000640,
    0.110200,
    0.043510,
    0.001210,
    0.207400,
    0.077630,
    0.002180,
    0.371300,
    0.134380,
    0.004000,
    0.645600,
    0.214770,
    0.007300,
    1.039050,
    0.283900,
    0.011600,
    1.385600,
    0.328500,
    0.016840,
    1.622960,
    0.348280,
    0.023000,
    1.747060,
    0.348060,
    0.029800,
    1.782600,
    0.336200,
    0.038000,
    1.772110,
    0.318700,
    0.048000,
    1.744100,
    0.290800,
    0.060000,
    1.669200,
    0.251100,
    0.073900,
    1.528100,
    0.195360,
    0.090980,
    1.287640,
    0.142100,
    0.112600,
    1.041900,
    0.095640,
    0.139020,
    0.812950,
    0.057950,
    0.169300,
    0.616200,
    0.032010,
    0.208020,
    0.465180,
    0.014700,
    0.258600,
    0.353300,
    0.004900,
    0.323000,
    0.272000,
    0.002400,
    0.407300,
    0.212300,
    0.009300,
    0.503000,
    0.158200,
    0.029100,
    0.608200,
    0.111700,
    0.063270,
    0.710000,
    0.078250,
    0.109600,
    0.793200,
    0.057250,
    0.165500,
    0.862000,
    0.042160,
    0.225750,
    0.914850,
    0.029840,
    0.290400,
    0.954000,
    0.020300,
    0.359700,
    0.980300,
    0.013400,
    0.433450,
    0.994950,
    0.008750,
    0.512050,
    1.000000,
    0.005750,
    0.594500,
    0.995000,
    0.003900,
    0.678400,
    0.978600,
    0.002750,
    0.762100,
    0.952000,
    0.002100,
    0.842500,
    0.915400,
    0.001800,
    0.916300,
    0.870000,
    0.001650,
    0.978600,
    0.816300,
    0.001400,
    1.026300,
    0.757000,
    0.001100,
    1.056700,
    0.694900,
    0.001000,
    1.062200,
    0.631000,
    0.000800,
    1.045600,
    0.566800,
    0.000600,
    1.002600,
    0.503000,
    0.000340,
    0.938400,
    0.441200,
    0.000240,
    0.854450,
    0.381000,
    0.000190,
    0.751400,
    0.321000,
    0.000100,
    0.642400,
    0.265000,
    0.000050,
    0.541900,
    0.217000,
    0.000030,
    0.447900,
    0.175000,
    0.000020,
    0.360800,
    0.138200,
    0.000010,
    0.283500,
    0.107000,
    0.000000,
    0.218700,
    0.081600,
    0.000000,
    0.164900,
    0.061000,
    0.000000,
    0.121200,
    0.044580,
    0.000000,
    0.087400,
    0.032000,
    0.000000,
    0.063600,
    0.023200,
    0.000000,
    0.046770,
    0.017000,
    0.000000,
    0.032900,
    0.011920,
    0.000000,
    0.022700,
    0.008210,
    0.000000,
    0.015840,
    0.005723,
    0.000000,
    0.011359,
    0.004102,
    0.000000,
    0.008111,
    0.002929,
    0.000000,
    0.005790,
    0.002091,
    0.000000,
    0.004109,
    0.001484,
    0.000000,
    0.002899,
    0.001047,
    0.000000,
    0.002049,
    0.000740,
    0.000000,
    0.001440,
    0.000520,
    0.000000,
    0.001000,
    0.000361,
    0.000000,
    0.000690,
    0.000249,
    0.000000,
    0.000476,
    0.000172,
    0.000000,
    0.000332,
    0.000120,
    0.000000,
    0.000235,
    0.000085,
    0.000000,
    0.000166,
    0.000060,
    0.000000,
    0.000117,
    0.000042,
    0.000000,
    0.000083,
    0.000030,
    0.000000,
    0.000059,
    0.000021,
    0.000000,
    0.000042,
    0.000015,
    0.000000,
]

# CIE 1964 Observer

_CIE1964 = [
    0.000160,
    0.000017,
    0.000705,
    0.000662,
    0.000072,
    0.002928,
    0.002362,
    0.000253,
    0.010482,
    0.007242,
    0.000769,
    0.032344,
    0.019110,
    0.002004,
    0.086011,
    0.043400,
    0.004509,
    0.197120,
    0.084736,
    0.008756,
    0.389366,
    0.140638,
    0.014456,
    0.656760,
    0.204492,
    0.021391,
    0.972542,
    0.264737,
    0.029497,
    1.282500,
    0.314679,
    0.038676,
    1.553480,
    0.357719,
    0.049602,
    1.798500,
    0.383734,
    0.062077,
    1.967280,
    0.386726,
    0.074704,
    2.027300,
    0.370702,
    0.089456,
    1.994800,
    0.342957,
    0.106256,
    1.900700,
    0.302273,
    0.128201,
    1.745370,
    0.254085,
    0.152761,
    1.554900,
    0.195618,
    0.185190,
    1.317560,
    0.132349,
    0.219940,
    1.030200,
    0.080507,
    0.253589,
    0.772125,
    0.041072,
    0.297665,
    0.570060,
    0.016172,
    0.339133,
    0.415254,
    0.005132,
    0.395379,
    0.302356,
    0.003816,
    0.460777,
    0.218502,
    0.015444,
    0.531360,
    0.159249,
    0.037465,
    0.606741,
    0.112044,
    0.071358,
    0.685660,
    0.082248,
    0.117749,
    0.761757,
    0.060709,
    0.172953,
    0.823330,
    0.043050,
    0.236491,
    0.875211,
    0.030451,
    0.304213,
    0.923810,
    0.020584,
    0.376772,
    0.961988,
    0.013676,
    0.451584,
    0.982200,
    0.007918,
    0.529826,
    0.991761,
    0.003988,
    0.616053,
    0.999110,
    0.001091,
    0.705224,
    0.997340,
    0,
    0.793832,
    0.982380,
    0,
    0.878655,
    0.955552,
    0,
    0.951162,
    0.915175,
    0,
    1.014160,
    0.868934,
    0,
    1.074300,
    0.825623,
    0,
    1.118520,
    0.777405,
    0,
    1.134300,
    0.720353,
    0,
    1.123990,
    0.658341,
    0,
    1.089100,
    0.593878,
    0,
    1.030480,
    0.527963,
    0,
    0.950740,
    0.461834,
    0,
    0.856297,
    0.398057,
    0,
    0.754930,
    0.339554,
    0,
    0.647467,
    0.283493,
    0,
    0.535110,
    0.228254,
    0,
    0.431567,
    0.179828,
    0,
    0.343690,
    0.140211,
    0,
    0.268329,
    0.107633,
    0,
    0.204300,
    0.081187,
    0,
    0.152568,
    0.060281,
    0,
    0.112210,
    0.044096,
    0,
    0.081261,
    0.031800,
    0,
    0.057930,
    0.022602,
    0,
    0.040851,
    0.015905,
    0,
    0.028623,
    0.011130,
    0,
    0.019941,
    0.007749,
    0,
    0.013842,
    0.005375,
    0,
    0.009577,
    0.003718,
    0,
    0.006605,
    0.002565,
    0,
    0.004553,
    0.001768,
    0,
    0.003145,
    0.001222,
    0,
    0.002175,
    0.000846,
    0,
    0.001506,
    0.000586,
    0,
    0.001045,
    0.000407,
    0,
    0.000727,
    0.000284,
    0,
    0.000508,
    0.000199,
    0,
    0.000356,
    0.000140,
    0,
    0.000251,
    0.000098,
    0,
    0.000178,
    0.000070,
    0,
    0.000126,
    0.000050,
    0,
    0.000090,
    0.000036,
    0,
    0.000065,
    0.000025,
    0,
    0.000046,
    0.000018,
    0,
    0.000033,
    0.000013,
    0,
]

# D Series coefficients

_DSERIES = [
    0.04,
    0.02,
    0.00,
    3.02,
    2.26,
    1.00,
    6.00,
    4.50,
    2.00,
    17.80,
    13.45,
    3.00,
    29.60,
    22.40,
    4.00,
    42.45,
    32.20,
    6.25,
    55.30,
    42.00,
    8.50,
    56.30,
    41.30,
    8.15,
    57.30,
    40.60,
    7.80,
    59.55,
    41.10,
    7.25,
    61.80,
    41.60,
    6.70,
    61.65,
    39.80,
    6.00,
    61.50,
    38.00,
    5.30,
    65.15,
    40.20,
    5.70,
    68.80,
    42.40,
    6.10,
    66.10,
    40.45,
    4.55,
    63.40,
    38.50,
    3.00,
    64.60,
    36.75,
    2.10,
    65.80,
    35.00,
    1.20,
    80.30,
    39.20,
    0.05,
    94.80,
    43.40,
    -1.10,
    99.80,
    44.85,
    -0.80,
    104.80,
    46.30,
    -0.50,
    105.35,
    45.10,
    -0.60,
    105.90,
    43.90,
    -0.70,
    101.35,
    40.50,
    -0.95,
    96.80,
    37.10,
    -1.20,
    105.35,
    36.90,
    -1.90,
    113.90,
    36.70,
    -2.60,
    119.75,
    36.30,
    -2.75,
    125.60,
    35.90,
    -2.90,
    125.55,
    34.25,
    -2.85,
    125.50,
    32.60,
    -2.80,
    123.40,
    30.25,
    -2.70,
    121.30,
    27.90,
    -2.60,
    121.30,
    26.10,
    -2.60,
    121.30,
    24.30,
    -2.60,
    117.40,
    22.20,
    -2.20,
    113.50,
    20.10,
    -1.80,
    113.30,
    18.15,
    -1.65,
    113.10,
    16.20,
    -1.50,
    111.95,
    14.70,
    -1.40,
    110.80,
    13.20,
    -1.30,
    108.65,
    10.90,
    -1.25,
    106.50,
    8.60,
    -1.20,
    107.65,
    7.35,
    -1.10,
    108.80,
    6.10,
    -1.00,
    107.05,
    5.15,
    -0.75,
    105.30,
    4.20,
    -0.50,
    104.85,
    3.05,
    -0.40,
    104.40,
    1.90,
    -0.30,
    102.20,
    0.95,
    -0.15,
    100.00,
    0.00,
    0.00,
    98.00,
    -0.80,
    0.10,
    96.00,
    -1.60,
    0.20,
    95.55,
    -2.55,
    0.35,
    95.10,
    -3.50,
    0.50,
    92.10,
    -3.50,
    1.30,
    89.10,
    -3.50,
    2.10,
    89.80,
    -4.65,
    2.65,
    90.50,
    -5.80,
    3.20,
    90.40,
    -6.50,
    3.65,
    90.30,
    -7.20,
    4.10,
    89.35,
    -7.90,
    4.40,
    88.40,
    -8.60,
    4.70,
    86.20,
    -9.05,
    4.90,
    84.00,
    -9.50,
    5.10,
    84.55,
    -10.20,
    5.90,
    85.10,
    -10.90,
    6.70,
    83.50,
    -10.80,
    7.00,
    81.90,
    -10.70,
    7.30,
    82.25,
    -11.35,
    7.95,
    82.60,
    -12.00,
    8.60,
    83.75,
    -13.00,
    9.20,
    84.90,
    -14.00,
    9.80,
    83.10,
    -13.80,
    10.00,
    81.30,
    -13.60,
    10.20,
    76.60,
    -12.80,
    9.25,
    71.90,
    -12.00,
    8.30,
    73.10,
    -12.65,
    8.95,
    74.30,
    -13.30,
    9.60,
    75.35,
    -13.10,
    9.05,
    76.40,
    -12.90,
    8.50,
    69.85,
    -11.75,
    7.75,
    63.30,
    -10.60,
    7.00,
    67.50,
    -11.10,
    7.30,
    71.70,
    -11.60,
    7.60,
    74.35,
    -11.90,
    7.80,
    77.00,
    -12.20,
    8.00,
    71.10,
    -11.20,
    7.35,
    65.20,
    -10.20,
    6.70,
    56.45,
    -9.00,
    5.95,
    47.70,
    -7.80,
    5.20,
    58.15,
    -9.50,
    6.30,
    68.60,
    -11.20,
    7.40,
    66.80,
    -10.80,
    7.10,
    65.00,
    -10.40,
    6.80,
    65.50,
    -10.50,
    6.90,
    66.00,
    -10.60,
    7.00,
    63.50,
    -10.15,
    6.70,
    61.00,
    -9.70,
    6.40,
    57.15,
    -9.00,
    5.95,
    53.30,
    -8.30,
    5.50,
    56.10,
    -8.80,
    5.80,
    58.90,
    -9.30,
    6.10,
    60.40,
    -9.55,
    6.30,
    61.90,
    -9.80,
    6.50,
]

_LSSDATA = None

def _generateLSSData():
    """ Generates data needed for sRGB-to-reflectance curve function. """
    d65data = matFromVec([d65Illum(x) for x in brange(10, 380, 730)])
    a = matNew([cie1931cmf(x) for x in brange(10, 380, 730)])
    aprime = matT(a)
    width = matShape(a)[0]
    wdiag = matDiag(d65data[0])
    mat = matNew(
        [
            [3.240970, -1.537383, -0.4986108],
            [-0.9692436, 1.875968, 0.04155506],
            [0.05563008, -0.2039770, 1.056972],
        ]
    )
    wnorm = vecDot(d65data[0], aprime[1])
    t = matScale(matMul(matMul(mat, aprime), wdiag), 1.0 / wnorm)
    # Compute Least Slope Squared matrix
    d = matScale(matEye(width), 4)
    dSize = matShape(d)[0]
    matSet(d, 0, 0, 2)
    matSet(d, dSize - 1, dSize - 1, 2)
    for i in range(1, dSize):
        matSet(d, i, i - 1, -2)
        matSet(d, i - 1, i, -2)
    dt = matT(d)
    vt = matT(t)
    tshape = matShape(t)
    bm = matBlock(d, vt, t, matZeros((tshape[0], tshape[0])))
    bm = matI(bm)
    b11 = matPart(bm, 0, width, 0, width)
    b12 = matPart(bm, 0, matShape(vt)[0], width, matShape(bm)[1])
    return [b11, b12]

class SPD:
    """Spectral power distribution class.

    values - List of spectral values.
    interval - Wavelength interval between spectral values, in nanometers.
    minWavelength - Wavelength of the first spectral value, in nanometers.
    maxWavelength - Maximum wavelength.  Optional; if omitted, this
       value is inferred from the other parameters."""

    def __init__(self, values, interval, minWavelength, maxWavelength=None):
        self.values = values
        self.minWavelength = minWavelength
        if maxWavelength == None:
            self.maxWavelength = minWavelength + interval * (len(values) - 1)
        else:
            self.maxWavelength = maxWavelength
        self.interval = interval

    def _calcd(self, wavelength):
        if wavelength < self.minWavelength or wavelength > self.maxWavelength:
            return 0
        index = int(round((wavelength - self.minWavelength) * 1.0 / self.interval))
        return self.values[index]

    def calc(self, wavelength):
        """Calculates the spectral value at the given wavelength.
        Values beyond the wavelength range are set to 0.
        Currently, this class linearly interpolates between
        spectral values. `wavelength` is in nanometers."""
        if wavelength < self.minWavelength or wavelength > self.maxWavelength:
            return 0
        mm = wavelength % self.interval
        s = self._calcd(wavelength - mm)
        if mm == 0:
            return s
        m = mm * 1.0 / self.interval
        e = self._calcd((wavelength - mm) + self.interval)
        return s + (e - s) * m

#
#  Illuminants and observers
#

def planckian(temp, wavelength):
    """Spectral distribution for blackbody (Planckian) radiation.
    `temp` is in kelvins, and `wavelength` is in nanometers."""
    if wavelength == 560:
        return 100.0
    if temp < 60:
        temp = 60  # For simplicity, in very low temperature
    num = wavelength ** (-5)
    try:
        v = num / (
            math.exp(0.0143877687750393 / (wavelength * (10 ** (-9)) * temp)) - 1
        )
    except:
        print(temp)
        print(wavelength)
        raise ValueError
    v2 = (560.0 ** (-5)) / (
        math.exp(0.0143877687750393 / (560.0 * (10 ** (-9)) * temp)) - 1
    )
    return v * 100.0 / v2

def cie1931cmf(wavelength):
    """CIE 1931 (2-degree) standard observer.
    `wavelength` is in nanometers."""
    if wavelength < 380 or wavelength > 780:
        return [0, 0, 0]
    index = int(round((wavelength - 380) / 5.0)) * 3
    return [_CIE1931[index + i] for i in range(3)]

def cie1964cmf(wavelength):
    """CIE 1964 (10-degree) standard observer.
    `wavelength` is in nanometers."""
    if wavelength < 380 or wavelength > 780:
        return [0, 0, 0]
    index = int(round((wavelength - 380) / 5.0)) * 3
    return [_CIE1964[index + i] for i in range(3)]

def _dseriesd(temp, wavelength):
    if wavelength < 300 or wavelength > 830:
        return 0
    index = int(round((wavelength - 300) / 5.0)) * 3
    # Calculate the D-series illuminant's chromaticity
    temp = temp * 1.0005563282336578
    ex = 0
    invt = 1.0 / temp
    h = 0.01
    if temp < 7000:
        ex = 0.244063 + (9911 * h + (2967800.0 - 4607000000.0 * invt) * invt) * invt
    else:
        ex = (
            2963 / 12500.0
            + (6187 / 25.0 + (1901800.0 - 2006400000.0 * invt) * invt) * invt
        )
    # 'd' holds the xy chromaticity of the D-series illuminant
    d = [ex, ex * (-3 * ex + 287 * h) - 11.0 / 40.0]
    t = 10000.0 / (2562 * d[0] - 7341 * d[1] + 241)
    t1 = (-1.7703 * d[0] + 5.9114 * d[1] - 1.3515) * t
    t1 = round(t1 * 1000) / 1000.0
    t1 = t1 * _DSERIES[index + 1]
    t2 = (-31.4424 * d[0] + 30.0717 * d[1] + 0.03) * t
    t2 = round(t2 * 1000) / 1000.0
    t2 = t2 * _DSERIES[index + 2]
    return t1 + t2 + _DSERIES[index]

def dseries(temp, wavelength):
    """
    Calculates a CIE D-series illuminant at the given
    wavelength and color temperature (the latter
    should not be less than 4000 K or greater
    than 25,000 K).
    `temp` is in kelvins, and `wavelength` is in nanometers.
    """
    if wavelength < 300 or wavelength > 830:
        return 0
    mm = wavelength % 10
    s = _dseriesd(temp, wavelength - mm)
    if mm == 0:
        return s
    m = mm * 0.1
    e = _dseriesd(temp, (wavelength - mm) + 10)
    return s + (e - s) * m

def referenceIllum(temp, wavelength):
    """
    Reference illuminant for a given color temperature.
    `temp` is in kelvins, and `wavelength` is in nanometers.
    """
    ct = temp
    if ct <= 0:
        return 0
    if ct < 4000:
        return planckian(ct, wavelength)
    if ct < 5000:
        p = planckian(ct, wavelength)
        d = dseries(ct, wavelength)
        return p + (d - p) * (ct - 4000) / 1500.0
    return dseries(ct, wavelength)

def perfectrefl(wavelength):
    """ Perfect reflecting diffuser. `wavelength` is in nanometers. """
    return 1.0

def brange(interval, mn, mx):
    ret = [0 for i in range(int((mx - mn) / interval))]
    r = mn
    i = 0
    while r <= mx:
        if i >= len(ret):
            ret += [r]
        else:
            ret[i] = r
        r += interval
        i += 1
    return ret

def aIllum(wavelength):
    """ Substantially equivalent to the CIE A Standard Illuminant. `wavelength` is in nanometers."""
    return planckian(2856, wavelength)

_d50Illum = SPD([dseries(5000, _) for _ in brange(5, 300, 830)], 5, 300)
_d65Illum = SPD([dseries(6500, _) for _ in brange(5, 300, 830)], 5, 300)

def d50Illum(wavelength):
    """ CIE D50 Illuminant. `wavelength` is in nanometers."""
    return _d50Illum.calc(wavelength)

def d65Illum(wavelength):
    """ CIE D65 Standard Illuminant. `wavelength` is in nanometers."""
    return _d65Illum.calc(wavelength)

def spectrumToTristim(refl, light=None, cmf=None):
    """Generates tristimulus values based on a spectrum determined
    by a reflectance curve function (refl),
    light spectrum function (light), and color matching functions method (cmf).
    Default `light` if unspecified is D65; default `cmf` if unspecified
    is CIE 1931 color matching functions."""
    # NOTE: Use None, rather than functions, as default parameters
    # of this method, to avoid nondeterministic renderings
    # of this method by pydoc3
    if light == None:
        light = d65Illum
    if cmf == None:
        cmf = cie1931cmf
    i = 360
    xyz = [0, 0, 0]
    weight = 0
    while i <= 780:
        cmfv = cmf(i)
        re = refl(i)
        spec = light(i)
        weight = weight + cmfv[1] * spec * 5
        xyz[0] = xyz[0] + re * spec * cmfv[0] * 5
        xyz[1] = xyz[1] + re * spec * cmfv[1] * 5
        xyz[2] = xyz[2] + re * spec * cmfv[2] * 5
        i = i + 5
    if weight == 0:
        return xyz
    xyz[0] = xyz[0] / weight
    xyz[1] = xyz[1] / weight
    xyz[2] = xyz[2] / weight
    return xyz

def bandpasscorrect(data):
    """
    Rectifies bandpass differences in a list
    of raw spectral data using the Stearns &
    Stearns algorithm.  The spectral data should
    indicate values at a constant wavelength interval
    (bandwidth).
    """
    ret = [x for x in data]
    n = len(ret)
    ret[0] = 1.083 * ret[0] - 0.083 * ret[1]
    ret[n - 1] = 1.083 * ret[n - 1] - 0.083 * ret[n - 2]
    for k in range(1, n - 1):
        ret[k] = 1.166 * ret[k] - 0.083 * ret[k - 1] - 0.083 * ret[k + 1]
    return ret

def sRGBToSPD(rgb):
    """Generates a representative reflectance curve from an encoded
    sRGB color.  Currently implements the iterative least slope squared
    method by S. A. Burns, and ensures the values in the reflectance
    curve are greater than 0, and 1 or less.  `rgb` is a 3-element
     list giving an encoded sRGB color to convert to a reflectance curve
    (in the SPD class)."""
    global _LSSDATA
    rdata = _LSSDATA
    if rdata == None:
        rdata = _generateLSSData()
        _LSSDATA = rdata
    b11 = rdata[0]
    b12 = rdata[1]
    lin = linearFromsRGB3(rgb)
    rm = 1e-5
    if lin[0] <= rm and lin[1] <= rm and lin[2] <= rm:
        return [rm for i in range(matShape(b12)[0])]
    # Implements Iterative Least Slope Squared algorithm
    linmat = matFromVec(lin)
    ret = matMul(b12, matT(linmat))
    shapelen = matShape(ret)[0]
    iters = 0
    while True:
        iters += 1
        k1 = []
        k0 = []
        for r in range(shapelen):
            refl = matGet(ret, r, 0)
            if refl > 1:
                k1 += [[(1 if r == i else 0) for i in range(shapelen)]]
            if refl <= 0:
                k0 += [[(1 if r == i else 0) for i in range(shapelen)]]
        k1len = len(k1)
        k0len = len(k0)
        if k1len + k0len == 0:
            spdarray = [matGet(ret, i, 0) for i in range(matShape(ret)[0])]
            break
        k1 += k0
        k = matNew(k1)
        cmat = [[1 if i < k1len else rm] for i in range(k0len + k1len)]
        cmat = matNew(cmat)
        tk = matT(k)
        ri = matI(matMul(matMul(k, b11), tk))
        rj = matSub(matMul(k, ret), cmat)
        rk = matMul(matMul(matMul(b11, tk), ri), rj)
        ret = matSub(ret, rk)
        for i in range(matShape(ret)[0]):
            s = matGet(ret, i, 0)
            if s > 1.0 and iters > 20:
                matSet(ret, i, 0, 1.0)  # Drastic measure to avoid overiteration
            if s < rm and iters > 20:
                matSet(ret, i, 0, rm)
    return SPD(spdarray, 10, 380, 730)

##################################################

def linearFromsRGB(c):
    """Convert a color component from encoded to linear RGB."""
    if c <= 0.04045:
        return c / 12.92
    return math.pow((0.055 + c) / 1.055, 2.4)

def _clamp(a, mn, mx):
    if a < mn:
        return mn
    return mx if a > mx else a

def clamp3(v, mn, mx):
    return [_clamp(v[i], mn[i], mx[i]) for i in range(3)]

def lerp3(c1, c2, factor):
    return [c1[i] + (c2[i] - c1[i]) * factor for i in range(3)]

def linearTosRGB(c):
    """
    Converts a color component from linear to encoded sRGB.
    """
    if c <= 0.0031308:
        return 12.92 * c
    return math.pow(c, 1.0 / 2.4) * 1.055 - 0.055

def linearFromsRGB3(c):
    """ Convert a color from encoded to linear RGB.  """
    return [linearFromsRGB(c[0]), linearFromsRGB(c[1]), linearFromsRGB(c[2])]

def linearTosRGB3(c):
    """ Convert a color from linear to encoded sRGB. """
    return [linearTosRGB(c[0]), linearTosRGB(c[1]), linearTosRGB(c[2])]

def rgbToHsv(rgb):
    mx = max(max(rgb[0], rgb[1]), rgb[2])
    mn = min(min(rgb[0], rgb[1]), rgb[2])
    if mx == mn:
        return [0, 0, mx]
    s = (mx - mn) * 1.0 / mx
    h = 0
    if rgb[0] == mx:
        h = (rgb[1] - rgb[2]) * 1.0 / (mx - mn)
    if rgb[1] == mx:
        h = 2 + (rgb[2] - rgb[0]) * 1.0 / (mx - mn)
    if rgb[2] == mx:
        h = 4 + (rgb[0] - rgb[1]) * 1.0 / (mx - mn)
    if h < 0:
        h = 6 - ((-h) % 6)
    if h >= 6:
        h = h % 6
    return [h * (math.pi / 3), s, mx]

def hsvToRgb(hsv):
    hue = hsv[0]
    sat = hsv[1]
    val = hsv[2]
    if hue < 0:
        hue = math.pi * 2 - (-hue) % (math.pi * 2)
    if hue >= math.pi * 2:
        hue = (hue) % (math.pi * 2)
    hue60 = hue * 3 / math.pi
    hi = int(hue60)
    f = hue60 - hi
    c = val * (1 - sat)
    a = val * (1 - sat * f)
    e = val * (1 - sat * (1 - f))
    if hi == 0:
        return [val, e, c]
    if hi == 1:
        return [a, val, c]
    if hi == 2:
        return [c, val, e]
    if hi == 3:
        return [c, a, val]
    if hi == 4:
        return [e, c, val]
    return [val, c, a]

def rgbToHsl(rgb):
    vmax = max(max(rgb[0], rgb[1]), rgb[2])
    vmin = min(min(rgb[0], rgb[1]), rgb[2])
    vadd = vmax + vmin
    # NOTE: "Lightness" is the midpoint between
    # the greatest and least RGB component
    lt = vadd / 2.0
    if vmax == vmin:
        return [0, 0, lt]
    vd = vmax - vmin
    divisor = vadd
    if lt > 0.5:
        divisor = 2.0 - vadd
    s = vd / divisor
    h = 0
    hvd = vd / 2.0
    deg60 = math.pi / 3
    if rgb[0] == vmax:
        h = ((vmax - rgb[2]) * deg60 + hvd) / vd
        h = h - ((vmax - rgb[1]) * deg60 + hvd) / vd
    if rgb[2] == vmax:
        h = math.pi * 4 / 3 + ((vmax - rgb[1]) * deg60 + hvd) / vd
        h = h - ((vmax - rgb[0]) * deg60 + hvd) / vd
    if rgb[1] == vmax:
        h = math.pi * 2 / 3 + ((vmax - rgb[0]) * deg60 + hvd) / vd
        h = h - ((vmax - rgb[2]) * deg60 + hvd) / vd
    if h < 0:
        h = math.pi * 2 - (-h) % (math.pi * 2)
    if h >= math.pi * 2:
        h = (h) % (math.pi * 2)
    return [h, s, lt]

def hslToRgb(hsl):
    if hsl[1] == 0:
        return [hsl[2], hsl[2], hsl[2]]
    lum = hsl[2]
    sat = hsl[1]
    if lum <= 0.5:
        bb = lum * (1.0 + sat)
    if lum > 0.5:
        bb = lum + sat - (lum * sat)
    a = lum * 2 - bb
    deg60 = math.pi / 3
    deg240 = math.pi * 4 / 3
    hueval = hsl[0]
    if hueval < 0:
        hueval = math.pi * 2 - (-hueval) % (math.pi * 2)
    if hueval >= math.pi * 2:
        hueval = (hueval) % (math.pi * 2)
    deg60 = math.pi / 3
    deg240 = math.pi * 4 / 3
    hue = hueval + math.pi * 2 / 3
    hue2 = hueval - math.pi * 2 / 3
    if hue >= math.pi * 2:
        hue = hue - math.pi * 2
    if hue2 < 0:
        hue2 = hue2 + math.pi * 2
    rgb = [a, a, a]
    hues = [hue, hueval, hue2]
    i = 0
    while i < 3:
        if hues[i] < deg60:
            rgb[i] = a + (bb - a) * hues[i] / deg60
        if hues[i] >= deg60 and hues[i] < math.pi:
            rgb[i] = bb
        if hues[i] >= math.pi and hues[i] < deg240:
            rgb[i] = a + (bb - a) * (deg240 - hues[i]) / deg60
        i = i + 1
    return rgb

def hsvHue(rgb):
    """  Deprecated. Use `rgbToHsv(rgb)[0]` instead.  """
    return rgbToHsv(rgb)[0]

def rgbToHwb(color):
    return [
        rgbToHsv(rgb)[0],
        min(min(color[0], color[1]), color[2]),
        1 - max(max(color[0], color[1]), color[2]),
    ]

def hwbToRgb(hwb):
    if hwb[2] >= 1:
        return [hwb[0], 0, 0]
    return hsvToRgb([hwb[0], 1 - hwb[1] / (1 - hwb[2]), 1 - hwb[2]])

# applies a 3x3 matrix transformation
def _apply3x3Matrix(xyz, xyzmatrix):
    r = xyz[0] * xyzmatrix[0] + xyz[1] * xyzmatrix[1] + xyz[2] * xyzmatrix[2]
    g = xyz[0] * xyzmatrix[3] + xyz[1] * xyzmatrix[4] + xyz[2] * xyzmatrix[5]
    b = xyz[0] * xyzmatrix[6] + xyz[1] * xyzmatrix[7] + xyz[2] * xyzmatrix[8]
    return [r, g, b]

def xyzFromsRGBD50(rgb):
    lin = linearFromsRGB3(rgb)
    return _apply3x3Matrix(
        lin,
        [
            0.436027535573195,
            0.385097932872408,
            0.143074531554397,
            0.222478677613186,
            0.716902127457834,
            0.0606191949289806,
            0.0139242392790820,
            0.0970836931437703,
            0.714092067577148,
        ],
    )

def xyzTosRGBD50(xyz):
    rgb = _apply3x3Matrix(
        xyz,
        [
            3.13424933163426,
            -1.61717292521282,
            -0.490692377104512,
            -0.978746070339639,
            1.91611436125945,
            0.0334415219513205,
            0.0719490494816283,
            -0.228969853236611,
            1.40540126012171,
        ],
    )
    return linearTosRGB3(rgb)

def xyzFromsRGB(rgb):
    lin = linearFromsRGB3(rgb)
    # NOTE: Official matrix is rounded to nearest 1/10000
    return _apply3x3Matrix(
        lin,
        [
            0.4123907992659591,
            0.35758433938387796,
            0.18048078840183424,
            0.21263900587151016,
            0.7151686787677559,
            0.0721923153607337,
            0.01933081871559181,
            0.11919477979462596,
            0.9505321522496605,
        ],
    )

def xyzTosRGB(xyz):
    rgb = _apply3x3Matrix(
        xyz,
        [
            3.2409699419045235,
            -1.5373831775700944,
            -0.49861076029300355,
            -0.9692436362808797,
            1.8759675015077204,
            0.0415550574071756,
            0.05563007969699365,
            -0.20397695888897652,
            1.0569715142428786,
        ],
    )
    return linearTosRGB3(rgb)

def wavelengthTosRGB(wavelength):
    srgb = xyzTosRGB(d65Illum(wavelength))
    # Clamp sRGB value
    return [(0 if x < 0 else (1 if x > 1 else x)) for x in srgb]

def xyzToLab(xyzval, wpoint):
    xyz = [xyzval[0] / wpoint[0], xyzval[1] / wpoint[1], xyzval[2] / wpoint[2]]
    i = 0
    while i < 3:
        if xyz[i] > 216.0 / 24389:  # See BruceLindbloom.com
            xyz[i] = math.pow(xyz[i], 1.0 / 3.0)
        else:
            kappa = 24389.0 / 27  # See BruceLindbloom.com
            xyz[i] = (16.0 + kappa * xyz[i]) / 116
        i = i + 1
    return [116.0 * xyz[1] - 16, 500 * (xyz[0] - xyz[1]), 200 * (xyz[1] - xyz[2])]

def labToXYZ(lab, wpoint):
    fy = (lab[0] + 16) / 116.0
    fx = fy + lab[1] / 500.0
    fz = fy - lab[2] / 200.0
    fxcb = fx * fx * fx
    fzcb = fz * fz * fz
    xyz = [fxcb, 0, fzcb]
    eps = 216.0 / 24389  # See BruceLindbloom.com
    if fxcb <= eps:
        xyz[0] = (108.0 * fx / 841) - 432.0 / 24389
    if fzcb <= eps:
        xyz[2] = (108.0 * fz / 841) - 432.0 / 24389
    if lab[0] > 8:  # See BruceLindbloom.com
        xyz[1] = math.pow(((lab[0] + 16) / 116.0), 3.0)
    else:
        xyz[1] = lab[0] * 27 / 24389.0  # See BruceLindbloom.com
    xyz[0] = xyz[0] * wpoint[0]
    xyz[1] = xyz[1] * wpoint[1]
    xyz[2] = xyz[2] * wpoint[2]
    return xyz

def labToChroma(lab):
    return math.sqrt(lab[1] * lab[1] + lab[2] * lab[2])

def labToHue(lab):
    h = math.atan2(lab[2], lab[1])
    if h < 0:
        h = h + math.pi * 2
    return h

def labHueDifference(lab1, lab2):
    cmul = labToChroma(lab1) * labToChroma(lab2)
    h2 = labToHue(lab2)
    h1 = labToHue(lab1)
    hdiff = h2 - h1
    if abs(hdiff) > math.pi:
        if h2 <= h1:
            hdiff = hdiff + math.pi * 2
        else:
            hdiff = hdiff - math.pi * 2
    return math.sqrt(cmul) * math.sin(hdiff * 0.5) * 2

def lchToLab(lch):
    # NOTE: Assumes hue is in radians, not degrees
    return [lch[0], lch[1] * math.cos(lch[2]), lch[1] * math.sin(lch[2])]

def lchDegreesToLab(lch):
    # NOTE: Assumes hue is in degrees, not radians
    h = lch[2] * math.pi / 180
    return [lch[0], lch[1] * math.cos(h), lch[1] * math.sin(h)]

def euclideanDist(color1, color2):
    d1 = color2[0] - color1[0]
    d2 = color2[1] - color1[1]
    d3 = color2[2] - color1[2]
    sqdist = d1 * d1 + d2 * d2 + d3 * d3
    return math.sqrt(sqdist)

def xyzToxyY(xyz):
    sum = xyz[0] + xyz[1] + xyz[2]
    if sum == 0:
        return [0, 0, 0]
    return [xyz[0] / sum, xyz[1] / sum, xyz[1]]

def xyzFromxyY(xyy):
    # NOTE: Results undefined if xyy[1]==0
    return [xyy[0] * xyy[2] / xyy[1], xyy[2], xyy[2] * (1 - xyy[0] - xyy[1]) / xyy[1]]

def xyzTouvY(xyz):
    su = xyz[0] + xyz[1] * 15.0 + xyz[2] * 3.0
    if su == 0:
        return [0, 0, 0]
    return [4.0 * xyz[0] / su, 9.0 * xyz[1] / su, xyz[1]]

def xyzFromuvY(uvy):
    # NOTE: Results undefined if uvy[1]==0
    su = uvy[2] / (uvy[1] / 9.0)
    x = uvy[0] * su / 4.0
    z = (su / 3.0) - (x / 3.0) - 5.0 * uvy[2]
    return [x, uvy[2], z]

def xyzToCCT(xyz):
    sum = xyz[0] + xyz[1] + xyz[2]
    # Adjust sum to avoid division by 0
    if sum == 0:
        sum = 0.00001
    x = xyz[0] / sum
    y = xyz[1] / sum
    c = (x - 0.332) / (0.1858 - y)
    return ((449 * c + 3525) * c + 6823.3) * c + 5520.33

def blackbodyUV(temp):
    """Calculates the uv coordinates of the Planckian
    locus at the given color temperature.
    `wavelength` is in nanometers."""
    lam = lambda wl: planckian(temp, wl)
    xyz = spectrumToTristim(perfectrefl, lam)
    uvy = xyzTouvY(xyz)
    return [uvy[0], uvy[1] * 2.0 / 3]

def xyzToDuv(xyz):
    uvy = xyzTouvY(xyz)
    uv = [uvy[0], uvy[1] * 2.0 / 3]
    cct = xyzToCCT(xyz)
    bb = blackbodyUV(cct)
    du = uv[0] - bb[0]
    dv = uv[1] - bb[1]
    dist = math.sqrt(du * du + dv * dv)
    # NOTE: CCT calculation not useful if dist > 0.05
    # NOTE: Duv sign determination is currently quite rough
    duv = dist
    if cct < 61:
        if dv < 0:
            duv = -duv
    else:
        if cct > 25000:
            if du > 0 or uv[0] > 0.185:
                duv = -duv
        else:
            bb2 = blackbodyUV(cct - 1)
            bbtan = [bb2[0] - bb[0], bb2[1] - bb[1]]
            cross = bbtan[0] * dv - du * bbtan[1]
            if cross < 0:
                duv = -duv
    return duv

def ciede2000(lab1, lab2):
    """ CIEDE2000 color difference formula. """
    dl = lab2[0] - lab1[0]
    hl = lab1[0] + dl * 0.5
    sqb1 = lab1[2] * lab1[2]
    sqb2 = lab2[2] * lab2[2]
    c1 = math.sqrt(lab1[1] * lab1[1] + sqb1)
    c2 = math.sqrt(lab2[1] * lab2[1] + sqb2)
    hc7 = math.pow((c1 + c2) * 0.5, 7)
    trc = math.sqrt(hc7 / (hc7 + 6103515625))
    t2 = 1.5 - trc * 0.5
    ap1 = lab1[1] * t2
    ap2 = lab2[1] * t2
    c1 = math.sqrt(ap1 * ap1 + sqb1)
    c2 = math.sqrt(ap2 * ap2 + sqb2)
    dc = c2 - c1
    hc = c1 + dc * 0.5
    hc7 = math.pow(hc, 7)
    trc = math.sqrt(hc7 / (hc7 + 6103515625))
    h1 = math.atan2(lab1[2], ap1)
    if h1 < 0:
        h1 = h1 + math.pi * 2
    h2 = math.atan2(lab2[2], ap2)
    if h2 < 0:
        h2 = h2 + math.pi * 2
    hdiff = h2 - h1
    hh = h1 + h2
    if abs(hdiff) > math.pi:
        hh = hh + math.pi * 2
        if h2 <= h1:
            hdiff = hdiff + math.pi * 2
        else:
            hdiff = hdiff - math.pi * 2
    hh = hh * 0.5
    t2 = 1 - 0.17 * math.cos(hh - math.pi / 6) + 0.24 * math.cos(hh * 2)
    t2 = t2 + 0.32 * math.cos(hh * 3 + math.pi / 30)
    t2 = t2 - 0.2 * math.cos(hh * 4 - math.pi * 63 / 180)
    dh = 2 * math.sqrt(c1 * c2) * math.sin(hdiff * 0.5)
    sqhl = (hl - 50) * (hl - 50)
    fl = dl / (1 + (0.015 * sqhl / math.sqrt(20 + sqhl)))
    fc = dc / (hc * 0.045 + 1)
    fh = dh / (t2 * hc * 0.015 + 1)
    dt = 30 * math.exp(-math.pow(36 * hh - 55 * math.pi, 2) / (25 * math.pi * math.pi))
    r = -2 * trc * math.sin(2 * dt * math.pi / 180)
    return math.sqrt(fl * fl + fc * fc + fh * fh + r * fc * fh)

def sRGBLuminance(x):
    """
    Finds the relative color of an encoded sRGB color, where
    white is the D65/2 white point.
    `x` -> 3-item list or tuple of an encoded sRGB color.
    """
    lin = linearFromsRGB3(x)
    return lin[0] * 0.2126 + lin[1] * 0.7152 + lin[2] * 0.0722

def sRGBGrayscale(x):
    """
    Finds the grayscale version of an encoded sRGB color, where
    white is the D65/2 white point.
    `x` -> 3-item list or tuple of an encoded sRGB color.
    """
    rellum = sRGBLuminance(x)
    return [rellum, rellum, rellum]

def sRGBContrastRatio(color1, color2):
    """
    Finds the contrast ratio for two encoded sRGB colors.
    NOTE: This calculation is not strict because the notes
    for relative luminance in WCAG 2.0 define sRGB relative
    luminance slightly differently.
    """
    l1 = srgbLuminance(color1)
    l2 = srgbLuminance(color2)
    return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)

def d50_2xyz():
    return [0.9642, 1, 0.8251]

def d65_2xyz():
    return [0.9504559270516716, 1, 1.0890577507598784]

def sRGBToLab(rgb):
    """Converts an encoded sRGB color to CIELAB,
    with white being the D65/2 white point."""
    return xyzToLab(xyzFromsRGB(rgb), d65_2xyz())

def sRGBFromLab(lab):
    """Converts a CIELAB color to encoded sRGB,
    with white being the D65/2 white point."""
    return xyzTosRGB(labToXYZ(lab, d65_2xyz()))

def sRGBToLabD50(rgb):
    """Converts an encoded sRGB color to CIELAB,
    with white being the D50/2 white point."""
    return xyzToLab(xyzFromsRGBD50(rgb), d50_2xyz())

def sRGBFromLabD50(lab):
    """Converts a CIELAB color to encoded sRGB,
    with white being the D50/2 white point."""
    return xyzTosRGBD50(labToXYZ(lab, d50_2xyz()))

###############

""" Kubelka-Munk color mixture functions. """

def kubelkaMunkReflectanceToKS(reflList):
    """  Calculates K/S ratios from a list of reflectances (0-1). """
    # NOTE: Here, divisions by 0 are avoided
    return [((1.0 - refl) ** 2) / (2.0 * max(0.00001, refl)) for refl in reflList]

def kubelkaMunkKSToReflectance(ksList):
    """  Calculates reflectances from a list of K/S ratios (0-1). """
    return [ks + 1.0 - math.sqrt(ks * (ks + 2.0)) for ks in ksList]

def kubelkaMunkMix(colorantsKS):
    """
  Generates a mixed K/S curve from the list of colorants (`colorantsKS`).
  Each colorant is a hash with the following keys:

  ks - list of K/S ratios
  strength - fraction from 0 to 1 in the total mixture, or
     1 for the "base" color.

  Example:

    >>> kubelkaMunkMix([ \
    ...    {"strength":0.5, "ks":[0.3, ...]}, \
    ...    {"strength":0.5, "ks":[0.2, ...]}, \
    ...    {"strength":1.0, "ks":[0.4, ...]}  \ # base
    ...  ])
  """
    size = len(colorantsKS[0]["ks"])
    return [
        sum([cks["strength"] * cks["ks"][i] for cks in colorantsKS])
        for i in range(size)
    ]
