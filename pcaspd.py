from colorutil import *

_kdtree = [
    0.31336027593098953,
    1,
    4,
    8,
    0.20681542645928097,
    1,
    12,
    16,
    0.27621037382458996,
    0,
    20,
    24,
    0.21140873265616597,
    0,
    0,
    1,
    0.3000693612796026,
    0,
    2,
    3,
    0.23331728624128514,
    1,
    4,
    5,
    0.38888444995949917,
    1,
    6,
    7,
]
_leaves = [0, 0, 0, 0, 0, 0, 0, 0]
_leaves[0] = [
    [
        [0.05693415243058058, 0.074397676388263209, -0.032993291630724127],
        [0.093826280589194511, 0.087178678790684555, -0.0028339791411702096],
        [0.14921681980397072, 0.086117953594273974, 0.050594604897095774],
        [0.21445982416506021, 0.078151888194029906, 0.11222392989112737],
        [0.26320300449843814, 0.077003720259586142, 0.16284905175224484],
        [0.29341292463856894, 0.061540949306018472, 0.20924745633935965],
        [0.31685772062729611, 0.020807524786315618, 0.24821533628485776],
        [0.32731360226098161, -0.022330044422027781, 0.24643750110902529],
        [0.32376496112615694, -0.05730666142689024, 0.19434973869450597],
        [0.31221128983359314, -0.093504311503667573, 0.11140625679087406],
        [0.29180749274311002, -0.13550868515784165, -0.0014116051717935293],
        [0.26226308815130484, -0.18506834185371804, -0.13565629661018724],
        [0.22781198365358377, -0.21829297148730625, -0.24942389164284196],
        [0.1904741068112909, -0.21679733636955029, -0.31878042249330529],
        [0.15001472561306262, -0.18763675071717112, -0.3399776754471866],
        [0.11775943798112933, -0.14017348685711281, -0.31738523569129723],
        [0.09636378508891183, -0.081873553332807658, -0.27787906261471201],
        [0.07530759651716025, -0.024704560123282024, -0.22883793109911443],
        [0.053181896605629705, 0.010567043694664387, -0.17342056177695914],
        [0.03968929393525901, 0.028137990461913773, -0.13333245390518839],
        [0.036160332398960666, 0.045089726913969529, -0.11577278227811499],
        [0.037482552107916588, 0.06762766655622772, -0.10926630988017688],
        [0.037678371281381802, 0.085301739848507946, -0.10167872547463992],
        [0.0356952923059757, 0.08598953020708211, -0.096166204955917434],
        [0.034006881090717291, 0.076870881549836401, -0.096247092345209312],
        [0.035408226780313405, 0.078336837836506093, -0.10007941355094085],
        [0.042255579551283104, 0.10356965602950362, -0.10782662199614694],
        [0.054531648219783277, 0.15316455538159321, -0.11550275820152688],
        [0.068350459741534503, 0.21466952093071451, -0.11553652740471032],
        [0.076518665578805684, 0.26342270286177255, -0.10780294002973702],
        [0.077272277425599847, 0.28821767335957793, -0.099746301481179342],
        [0.073654024368278614, 0.29387522535240024, -0.094038401218350165],
        [0.067616910707345629, 0.28628822724865366, -0.090672093029084008],
        [0.064550056230396863, 0.28309294502199212, -0.089226438803705219],
        [0.071923419984823933, 0.30890244154914537, -0.090687803194698657],
        [0.090784517453023794, 0.3610919939579374, -0.08707545337100471],
    ],
    [
        [2.8651887943217642, 0.66436160071825356, 2.0714360486634478],
        [16.246569815438658, -7.9221656417611719, -2.2900788070270148],
        [-1.4245994133966084, -3.649746949258831, 1.4435236950867152],
    ],
    [
        [0.06315917647058822],
        [0.10632494117647065],
        [0.16937411764705884],
        [0.24211305882352932],
        [0.2976172941176471],
        [0.3350036470588236],
        [0.36502929411764695],
        [0.3784758823529412],
        [0.37374717647058836],
        [0.3574298823529411],
        [0.3278729411764705],
        [0.28508952941176474],
        [0.23700341176470582],
        [0.18812941176470593],
        [0.13928905882352938],
        [0.10395376470588234],
        [0.08280682352941174],
        [0.06305682352941176],
        [0.04342635294117649],
        [0.032786],
        [0.031239999999999993],
        [0.03416835294117646],
        [0.035812588235294124],
        [0.03420505882352941],
        [0.032072117647058807],
        [0.03353070588235295],
        [0.041954705882352936],
        [0.058363176470588245],
        [0.07882529411764706],
        [0.09273117647058823],
        [0.09583682352941175],
        [0.09207529411764706],
        [0.08464929411764704],
        [0.08170588235294118],
        [0.09448764705882355],
        [0.12633941176470592],
    ],
    [[0.09658144927792502], [0.08904861621107446], [0.37193798994880645]],
]
_leaves[1] = [
    [
        [0.075688333949252562, 0.025988574820148918, -0.028405805049440454],
        [0.1000854107969853, 0.044762908806275981, -0.0051924578323665283],
        [0.13513030668517517, 0.073256181409932022, 0.011987277778760309],
        [0.17652120814527725, 0.11135586718381864, 0.029945425132998235],
        [0.20706727663111177, 0.14761914344150742, 0.055769944460049806],
        [0.21868281981384274, 0.18097208287896738, 0.084071392922374436],
        [0.21776871090002167, 0.21717544790049317, 0.10467472542383925],
        [0.20765624416047654, 0.25123957777292177, 0.10617758979516789],
        [0.19197447301041851, 0.27650215052396043, 0.086089070865856265],
        [0.17122338690315356, 0.2950753914796983, 0.052356349127026462],
        [0.14442487541823573, 0.30059632832028232, 0.0058226663605331934],
        [0.1161768671727626, 0.27437314259337353, -0.05471079977823233],
        [0.089621168382333499, 0.23287334025546222, -0.099401497462449778],
        [0.06320238420796552, 0.19594706693259778, -0.10774091357848598],
        [0.041319347995610337, 0.15319215083482463, -0.096706939812434445],
        [0.032576306985617628, 0.12063408718110384, -0.089411763126025515],
        [0.032827003457244472, 0.1104754296158245, -0.089493532849732618],
        [0.031629999901588955, 0.10728761333565635, -0.081605248191552224],
        [0.030260923452585364, 0.092421391013365869, -0.076104200404100486],
        [0.039824557828770514, 0.070223200875286634, -0.10276835632978162],
        [0.064744775435205917, 0.033598480346908655, -0.17635780277498456],
        [0.098178679060446139, -0.018202206815597623, -0.25297255940724006],
        [0.12472648422867415, -0.064745586702645547, -0.28784483048442416],
        [0.13230820397404208, -0.088603483293547836, -0.31063556219479238],
        [0.12567002835860139, -0.091439006026927311, -0.34075583018067523],
        [0.12577392302245782, -0.092865410739274401, -0.35217226872429253],
        [0.14396210754300262, -0.10286074887400173, -0.32748333341540059],
        [0.17421121516952282, -0.11747463684893991, -0.25266061961577979],
        [0.20568216935297032, -0.13223969645428202, -0.13665035634823566],
        [0.23019983153903198, -0.14835744545027049, -0.018915236625761882],
        [0.24637159420737242, -0.16639141139199801, 0.071513068001034533],
        [0.25621093321371635, -0.18471194845956845, 0.13116334363550258],
        [0.26191200897385719, -0.20308576095893194, 0.16419737212874297],
        [0.26475554809221746, -0.21361481586840919, 0.18383002316467204],
        [0.2668584509442648, -0.20563196891820623, 0.20486097614951537],
        [0.26937357733698492, -0.17999916761066254, 0.23008681662230887],
    ],
    [
        [13.227271804948773, -13.520050427187075, 2.4600366466104995],
        [-10.355571182263281, 12.19989738208907, 1.4016225311062083],
        [0.84810779967840433, -7.1567239477148537, 2.0142456515758549],
    ],
    [
        [0.1044540926744186],
        [0.1408876319767442],
        [0.19051322453488376],
        [0.2469572008139535],
        [0.2904155925581395],
        [0.31016663581395354],
        [0.31359294813953476],
        [0.3032116206976744],
        [0.28308378546511626],
        [0.25429523627906975],
        [0.21526133593023247],
        [0.1713542373255814],
        [0.12976256418604654],
        [0.09156466220930232],
        [0.06096399511627906],
        [0.04721548627906976],
        [0.04583755069767441],
        [0.04437609058139534],
        [0.041430099534883726],
        [0.04929408220930233],
        [0.07616562104651163],
        [0.11776415906976744],
        [0.15264898500000004],
        [0.16186647790697678],
        [0.15279711267441856],
        [0.15455638767441862],
        [0.18478819511627906],
        [0.2374666412790698],
        [0.2958635254651163],
        [0.3407113389534884],
        [0.3670389251162791],
        [0.37951562453488363],
        [0.38396916104651174],
        [0.38896940360465104],
        [0.40595304093023254],
        [0.4357708632558139],
    ],
    [[0.14445240436180432], [0.09233364317753702], [0.29298427450350595]],
]
_leaves[2] = [
    [
        [0.077649072744678652, -0.026482381413763422, 0.031909758091622081],
        [0.097188048767247959, -0.0044940504442422743, 0.067721284127658279],
        [0.12867290428291453, 0.024283415661959042, 0.11422765944933237],
        [0.16747930977536044, 0.054752533517737401, 0.16591036205099138],
        [0.19615854112952164, 0.076937451788540542, 0.20581622362836424],
        [0.20842692772601223, 0.099007894043273884, 0.22961439148216228],
        [0.21303393275395241, 0.12749081361673203, 0.24148978482742206],
        [0.21340618380325807, 0.15278845499820695, 0.2349543863948112],
        [0.21153113163926687, 0.17126415099868184, 0.21033255786829044],
        [0.20822233295870818, 0.18966348362093993, 0.16963698571638292],
        [0.20361758805980534, 0.21038252542416488, 0.10550614848315006],
        [0.19926279895525995, 0.23207540169345309, 0.01337440303219941],
        [0.19466265723783022, 0.24577995391849577, -0.088281780265924134],
        [0.18790820856125082, 0.24188312856262714, -0.1818841089458457],
        [0.17985262587220308, 0.21889733415479365, -0.26447952285112269],
        [0.17389203039422124, 0.17413440466347216, -0.30518761026283048],
        [0.16908119162648749, 0.11344180059169415, -0.30077446247454215],
        [0.16044474770070877, 0.047673942023304633, -0.28473685462547094],
        [0.1498921406417483, -0.014773883641566229, -0.27110699640506147],
        [0.14436924749165794, -0.068174188501767277, -0.2434465218708915],
        [0.1425698385144899, -0.10833836470431984, -0.19463970192250174],
        [0.14246500341884849, -0.13783773713333644, -0.14040409640278717],
        [0.14138599129092363, -0.15893969365859381, -0.10046113123679155],
        [0.13986541125835233, -0.16804551560150233, -0.090677016653818721],
        [0.13938928538181794, -0.16730711574711338, -0.10189195902821446],
        [0.14060170433088373, -0.16790314844846427, -0.10156555995749431],
        [0.14444320721393458, -0.17520229351391187, -0.072454576257648784],
        [0.15062623855468901, -0.18424985489860671, -0.024157999211847275],
        [0.15680908886304581, -0.19123144374942599, 0.025069714328286752],
        [0.16001763463238114, -0.19764964821740588, 0.059237869126397391],
        [0.16010093703683051, -0.20512690525153277, 0.076037742385087731],
        [0.15828965991909591, -0.2124021708162237, 0.081439836261382612],
        [0.15582898251131494, -0.22033669056789365, 0.079977162561312487],
        [0.1546635698934016, -0.2254237959105308, 0.080123264797800769],
        [0.1579410664246321, -0.22226284410943059, 0.090546006478470123],
        [0.16558848039383217, -0.20767621666743491, 0.11229687234271631],
    ],
    [
        [4.7550671280578527, -0.43787099062518814, 1.585770703684505],
        [-9.4130109842133365, 5.9850889547238619, 2.0011930961132722],
        [2.7830243347600141, -4.7901311238718653, 1.5675121719313312],
    ],
    [
        [0.11415287762937058],
        [0.1505421543589743],
        [0.20498814363403248],
        [0.2700931085734264],
        [0.31969304890676015],
        [0.3467887566293702],
        [0.3645926714289042],
        [0.3750658581608391],
        [0.37993379767366003],
        [0.38140711437296027],
        [0.3789777778531467],
        [0.3733499094638693],
        [0.3628111733100237],
        [0.3437009294731937],
        [0.3170912321561771],
        [0.2923627081212122],
        [0.27105008249184137],
        [0.2433957298857809],
        [0.21222835804895104],
        [0.1930146503426573],
        [0.18620743083216798],
        [0.18588997835198137],
        [0.1841206357296038],
        [0.18055036729836837],
        [0.179166129020979],
        [0.1824655838951048],
        [0.1932458542214451],
        [0.21089383210955714],
        [0.22963445420979015],
        [0.24032893560839158],
        [0.24156395786713297],
        [0.2373660638624709],
        [0.23087583160139857],
        [0.22909487580419588],
        [0.24206057561771566],
        [0.2702714655850815],
    ],
    [[0.21913401937009813], [0.24703681915557615], [0.39675868630964567]],
]
_leaves[3] = [
    [
        [0.077754794221494297, -0.012189573225488175, 0.075392843907481563],
        [0.09129816869991636, -0.019646345632905494, 0.11587914499195617],
        [0.11537534796426359, -0.035796402533404069, 0.17465840330473364],
        [0.1460251260995748, -0.059846535558586489, 0.24341124529644434],
        [0.16829232705478098, -0.083407409618333817, 0.29661465924659919],
        [0.17621981378091492, -0.10084773156528046, 0.31293075732141329],
        [0.17745872961107489, -0.1158328184124411, 0.30067405361146204],
        [0.17587256322198938, -0.13200989698581644, 0.27114228185351841],
        [0.17350578280440063, -0.14770188194939907, 0.23024273111803248],
        [0.1703217636231579, -0.1639755921734852, 0.17405232329045042],
        [0.1662792009049695, -0.18361460224691001, 0.10549422395725036],
        [0.16398868662848995, -0.19947478092763149, 0.040636482782927932],
        [0.16206029779065337, -0.20946179930219194, -0.029450025955309888],
        [0.15545055544774491, -0.22218716841815123, -0.12048145718586925],
        [0.14715606561760494, -0.23333031067766535, -0.1928876327392344],
        [0.14517031988888515, -0.23372142184494438, -0.21000387704268791],
        [0.14659310881436774, -0.22637090071355498, -0.208853454522267],
        [0.14358521515131173, -0.2181113901768503, -0.23874769667682311],
        [0.14347830004311138, -0.20124164286458579, -0.26418135319141395],
        [0.15501783113249126, -0.15217374791305591, -0.24513820095967692],
        [0.16857929847461078, -0.055049979587614699, -0.18892381433799676],
        [0.1769133092456209, 0.04874603399007861, -0.13489151365032126],
        [0.18066426045272407, 0.11771654765066333, -0.10569518507345339],
        [0.18251045473915706, 0.15284055965531951, -0.10314184085704738],
        [0.18360856261342587, 0.16911763150965045, -0.11522378962743729],
        [0.18427593318797025, 0.17702665742642099, -0.11684022002761521],
        [0.18470974268447776, 0.18126638766336278, -0.094765473266040706],
        [0.18493391687339508, 0.18351172119508008, -0.05893965830803622],
        [0.18516057107050848, 0.1851451997136388, -0.024055140066081764],
        [0.18524686203033622, 0.18679339834423164, -0.00080360670601089049],
        [0.1854170520139436, 0.18893855236473164, 0.010957440281982533],
        [0.18538273522965654, 0.19102904506951496, 0.015417935333796859],
        [0.18570952788761413, 0.1936667498924865, 0.014949404851753216],
        [0.18548467109384456, 0.19493042555000928, 0.01486144591484077],
        [0.18442527750603657, 0.19331150436169917, 0.021213475205452574],
        [0.18369242760892571, 0.19055149611042532, 0.033337902001252438],
    ],
    [
        [6.7274513462551582, -1.6716994836001497, 0.92579796019609162],
        [8.8043699499823056, -6.7454821076254374, -1.9176060076559627],
        [0.38850756091513727, -3.0512554666450127, 2.2651822783553732],
    ],
    [
        [0.14889827400000005],
        [0.17520304474418613],
        [0.21868415425581395],
        [0.2722480386976742],
        [0.3110968715581395],
        [0.32547798327906974],
        [0.3279218090697676],
        [0.3240609245116278],
        [0.31789892097674427],
        [0.3087750220232558],
        [0.29547795774418606],
        [0.2850604877209302],
        [0.27547352458139546],
        [0.2548455518139535],
        [0.23127132304651174],
        [0.22575636813953495],
        [0.23102751937209287],
        [0.225652907488372],
        [0.22719188704651175],
        [0.263695425023256],
        [0.32064559127906966],
        [0.36988705651162795],
        [0.39831300993023283],
        [0.4113550804186046],
        [0.4181860837674419],
        [0.42457342372093015],
        [0.43394186223255826],
        [0.4455223786279071],
        [0.4567059808139532],
        [0.46377996441860425],
        [0.46684583267441837],
        [0.4673169875116278],
        [0.46836722725581403],
        [0.47109253334883733],
        [0.4784419476976747],
        [0.4909920868837208],
    ],
    [[0.3273594968888579], [0.2887160301110782], [0.33938713819023836]],
]
_leaves[4] = [
    [
        [0.05175735963919479, -0.071520785374941831, -0.044038160656984994],
        [0.065885680935584667, -0.081535103787772789, -0.074894043535235766],
        [0.088166449746628267, -0.097543574948475431, -0.1181081621871725],
        [0.11634650928829715, -0.11367762509358947, -0.16034931984449846],
        [0.1408275116958248, -0.11548780107076606, -0.18330152100999295],
        [0.15702804385215585, -0.099767343990621135, -0.19154675408524388],
        [0.17106769202361988, -0.068871306720666561, -0.19692698669534375],
        [0.1848727553962764, -0.025667008838144274, -0.19572820772501637],
        [0.19939744792365882, 0.030534884159671552, -0.18761520264616918],
        [0.21576661828237406, 0.10311238788518821, -0.17811636705215073],
        [0.23412126961610596, 0.1810471186766742, -0.16496277225604214],
        [0.25437439563369924, 0.243540075700411, -0.14315254152093546],
        [0.27238119535487298, 0.27705363403632088, -0.10293015602216077],
        [0.27974802132494492, 0.26652761484042314, -0.039594304208439499],
        [0.2765674561827261, 0.2207459643004655, 0.041704632657056193],
        [0.26640018623663941, 0.15852132981474684, 0.13004165932396652],
        [0.25149270471728774, 0.087136932568753933, 0.21946482778314991],
        [0.2303178022560578, 0.0086739760728883897, 0.30034479498247102],
        [0.20365345937480164, -0.061161291135589255, 0.34881396653929292],
        [0.17910497067729977, -0.10797025347228281, 0.3525572842146627],
        [0.15852496842010294, -0.13487730316974733, 0.31571240544105661],
        [0.14029003617407457, -0.15340576599607658, 0.24881829303936245],
        [0.12016641532318899, -0.16752456079887612, 0.15873070821246946],
        [0.10164624822148335, -0.17577762395386218, 0.067468504042690197],
        [0.089410770358060859, -0.18045793058552392, -0.0016854256189599761],
        [0.08269718324477647, -0.18413821976709119, -0.046011561597395972],
        [0.078970435952381415, -0.18942539482636803, -0.081310852023504604],
        [0.077236190698826479, -0.19810651758700099, -0.11722195496183985],
        [0.078128214047245154, -0.20781361957367364, -0.14262692290819509],
        [0.081330922754802665, -0.21311647768648992, -0.1429071087037288],
        [0.085934222255144008, -0.21240012121157889, -0.11813863606312774],
        [0.091213426586917917, -0.2076206140544905, -0.076709200601140753],
        [0.095874295058489989, -0.20121939183675031, -0.028556797697128808],
        [0.099534029393298876, -0.19825702909836634, 0.0042295797556599346],
        [0.10473943283766482, -0.2049841860970304, 0.0028641234027122677],
        [0.11417684054175532, -0.2186453078159562, -0.019396343917196059],
    ],
    [
        [0.60865347734153741, 2.2646725849330811, 2.1755099004642635],
        [-9.8383660557126422, 6.2683894228140771, 0.68699163526592699],
        [-0.60969874484391351, 3.3138138494733411, -2.7342910710940136],
    ],
    [
        [0.049383764705882384],
        [0.06474164705882354],
        [0.08724188235294118],
        [0.11563282352941175],
        [0.1417871764705882],
        [0.16211623529411762],
        [0.1830925882352941],
        [0.2058101176470588],
        [0.23096976470588235],
        [0.260266705882353],
        [0.2930696470588236],
        [0.32645152941176464],
        [0.35244670588235305],
        [0.3594874117647059],
        [0.34934082352941187],
        [0.32825705882352935],
        [0.29917282352941177],
        [0.2601567058823529],
        [0.21550011764705884],
        [0.17788152941176472],
        [0.15000129411764704],
        [0.1280862352941176],
        [0.10592399999999995],
        [0.08698305882352939],
        [0.07562905882352944],
        [0.07006647058823529],
        [0.06757694117647059],
        [0.06739905882352942],
        [0.06981635294117652],
        [0.07386341176470589],
        [0.07836988235294118],
        [0.08304258823529415],
        [0.08689329411764704],
        [0.09078635294117647],
        [0.09925670588235296],
        [0.11556564705882352],
    ],
    [[0.14470422044349615], [0.22555260785156037], [0.243266341117927]],
]
_leaves[5] = [
    [
        [0.019868050996831144, -0.027749753424616941, -0.03942012358555199],
        [0.024661572246250985, -0.028873581932186795, -0.055469342807215383],
        [0.032616944544318002, -0.031242567376940839, -0.079565135943359955],
        [0.044365985311729375, -0.033348266548423829, -0.11196318362607999],
        [0.057703623507972361, -0.033252572723346363, -0.14784710983992891],
        [0.07056027120767093, -0.026554041031897162, -0.18098632544861057],
        [0.086329744190157626, -0.010704558899077512, -0.21775522548293674],
        [0.10648189632412142, 0.014573119186707641, -0.25953970937059467],
        [0.13209848796483009, 0.052674812032197885, -0.30769815175822529],
        [0.16615678772297093, 0.1123188241112225, -0.35833882593517141],
        [0.21173956025096441, 0.19340511314347389, -0.37742566370930414],
        [0.26727077621889295, 0.27882500227823415, -0.27819740349363192],
        [0.31921029530363099, 0.32457538699261174, -0.01471193978492296],
        [0.34466999571044221, 0.27869165712678912, 0.22316915281243502],
        [0.34535068027528865, 0.16930337553635533, 0.29212500823231841],
        [0.33287831457402517, 0.041332511764823346, 0.27184280158576368],
        [0.31307588025177452, -0.091903547163810079, 0.21977757686745664],
        [0.28413887998978959, -0.22161353767055048, 0.14490641964425233],
        [0.24648370588186747, -0.31376269133187207, 0.066072431015470917],
        [0.20850737234427041, -0.34859849636659085, 0.003993780887006311],
        [0.17144037684390451, -0.33340655790822438, -0.040205344201102541],
        [0.13328524391941549, -0.28651880274844538, -0.071774137060022905],
        [0.092556596346072939, -0.21843516561800685, -0.088075623917287627],
        [0.058792914591667578, -0.15139096019648235, -0.085254706281982562],
        [0.038578360826600377, -0.1060647318166491, -0.073717570765124349],
        [0.02844398703145145, -0.081703181872064545, -0.063542131842678096],
        [0.022460714275519118, -0.066483684356851369, -0.05566218053184871],
        [0.018331717920465972, -0.0554827847990189, -0.04920700490325073],
        [0.016831247003164976, -0.051431451091520017, -0.047039679742036433],
        [0.018647799295482576, -0.056114541886977502, -0.050838375580851858],
        [0.023415605035789856, -0.068077017354800706, -0.059007645563215839],
        [0.030864703756871253, -0.086645522298701705, -0.069366220465767681],
        [0.039703064424892187, -0.10854798154486134, -0.079187331299548913],
        [0.046732634703127704, -0.12600200359642338, -0.085978853142503892],
        [0.050587264918960761, -0.13423024159390393, -0.090791336453803995],
        [0.054971621469177279, -0.14068274633603203, -0.097267369677297183],
    ],
    [
        [-2.8731422712109387, 4.9177684828131047, 1.6869627098096134],
        [-7.7423665572947931, 2.7154691147291157, 2.3269730119732226],
        [-3.4913582437744815, 3.3799910207916737, -2.2366205128983903],
    ],
    [
        [0.01634162790697675],
        [0.01925651162790698],
        [0.024038837209302312],
        [0.0308424418604651],
        [0.038929418604651184],
        [0.04738895348837209],
        [0.05867534883720931],
        [0.07398430232558138],
        [0.09400197674418607],
        [0.12231],
        [0.16537895348837206],
        [0.23068197674418586],
        [0.3067259302325581],
        [0.34872639534883737],
        [0.3470554651162791],
        [0.32382220930232564],
        [0.28952720930232567],
        [0.24343023255813948],
        [0.19279197674418613],
        [0.15039651162790701],
        [0.11651232558139542],
        [0.08650697674418603],
        [0.05728174418604655],
        [0.0349689534883721],
        [0.022708953488372086],
        [0.01696034883720931],
        [0.013768139534883725],
        [0.011693720930232559],
        [0.011114418604651158],
        [0.012297674418604652],
        [0.015126279069767452],
        [0.019525813953488385],
        [0.024814534883720932],
        [0.029417558139534884],
        [0.03319186046511628],
        [0.03892767441860465],
    ],
    [[0.09158629107524266], [0.19391012739717364], [0.11267655100104398]],
]
_leaves[6] = [
    [
        [0.062980853706992537, -0.034486960453099139, -0.10145784251045439],
        [0.071948098995730042, -0.050710235216232059, -0.12989553216061756],
        [0.088549538876956782, -0.076402696135401987, -0.17519629072666582],
        [0.109466620161349, -0.10875790383467709, -0.22994927826899775],
        [0.12452523676824873, -0.1364275500897941, -0.26669337313537977],
        [0.13026284275544509, -0.15210192062892675, -0.2770610186313312],
        [0.13228621677535937, -0.16174761000739599, -0.27249268792872461],
        [0.13296853857824181, -0.17033843843120122, -0.25885613419808184],
        [0.13336713094333924, -0.17757234476219116, -0.24177020459144563],
        [0.13429574179601039, -0.18438718535254889, -0.21686582510324184],
        [0.13764281871178241, -0.19702671838051874, -0.16612855211900307],
        [0.14797449689451656, -0.21673042112140212, -0.066581149053126093],
        [0.16311417139037776, -0.23299312638492906, 0.069469086448745929],
        [0.17228744095327111, -0.23969529729808875, 0.17533258749811004],
        [0.17303515029559227, -0.24500994452453509, 0.2231215488836448],
        [0.17162218867768728, -0.24392948405484896, 0.22955366982088612],
        [0.17195569071692735, -0.22491464955447549, 0.22853191167133124],
        [0.17324484641715351, -0.18104598462274477, 0.24633799590011121],
        [0.17627102954109464, -0.11305620553819337, 0.26328131293225654],
        [0.18256702208924991, -0.033515272188536289, 0.24247434526095241],
        [0.1872042372284273, 0.038482938624922226, 0.18904937797359714],
        [0.18961484499294079, 0.089892246956660996, 0.13249597233193372],
        [0.19015699189753696, 0.12475777342332896, 0.078589109713893324],
        [0.18987864337029176, 0.14786119538459588, 0.03088284692529816],
        [0.18957227187577719, 0.16163835332721616, -0.0048423509110828277],
        [0.18951543731973072, 0.1696459499724226, -0.02860093269952119],
        [0.19002285864467597, 0.17483394679946637, -0.046871881501276906],
        [0.1907384497280879, 0.17792596605748753, -0.063612243823522277],
        [0.19160044932841816, 0.1787739133945988, -0.073332647127686501],
        [0.19233105000846359, 0.17774989945474748, -0.070744658943501015],
        [0.19305390680563583, 0.17606174746090308, -0.058206263074606322],
        [0.19353139047739251, 0.17367588537138468, -0.039660642490815398],
        [0.19431482287624482, 0.17240629015263084, -0.020931792550780679],
        [0.19455384574599618, 0.1709133383412664, -0.0088550731028964203],
        [0.19417988026511265, 0.16745942552395518, -0.0078593462355519006],
        [0.19428450015363311, 0.16115713955341424, -0.010174993200758395],
    ],
    [
        [6.1118011666394256, -0.63513140886360919, 0.63054608821267599],
        [7.8648744182941233, -5.5208914966788978, -2.2957204428954197],
        [-2.5397998553619652, 4.0628349508276136, -2.0087487542389759],
    ],
    [
        [0.11082141345549734],
        [0.12562708378708543],
        [0.15212626528795778],
        [0.18540398099476424],
        [0.2098338767888304],
        [0.22079372745200673],
        [0.22691598424083773],
        [0.2311631453926702],
        [0.2352588439790574],
        [0.24043656616055853],
        [0.24891334450261773],
        [0.26726260120418793],
        [0.29224077132635284],
        [0.3074780573647469],
        [0.30858135841186723],
        [0.3067961094589878],
        [0.31012411553228625],
        [0.3168629786038397],
        [0.32831944371727767],
        [0.3483967460383944],
        [0.36592079757417095],
        [0.3760485357940662],
        [0.37860336251308885],
        [0.37808678766143133],
        [0.37878412415357776],
        [0.3811600057940662],
        [0.38553162228621274],
        [0.39138952926701537],
        [0.39781552719022656],
        [0.402476787399651],
        [0.40518048036649174],
        [0.40653693080279224],
        [0.4087237988830717],
        [0.4121506712390922],
        [0.41938092799301924],
        [0.4313784830366494],
    ],
    [[0.3215866890260972], [0.3323672084395472], [0.25661207873030195]],
]
_leaves[7] = [
    [
        [0.024217262034941733, 0.022424861331203534, -0.11597058097773272],
        [0.02403058283764492, 0.02700631137955925, -0.13175683714198783],
        [0.02584962642236182, 0.034615278150084458, -0.15944902312481202],
        [0.028674603674140216, 0.044708520266870173, -0.19462684758196688],
        [0.030408322949325203, 0.054460328838252053, -0.223425513225671],
        [0.030701464943135595, 0.061529213221052433, -0.23947306168317456],
        [0.030611077024091791, 0.068872355178956873, -0.25345041094389725],
        [0.030518230361942823, 0.078077043478990332, -0.26920244397727916],
        [0.030282687118815661, 0.088416047698223782, -0.28571154968187407],
        [0.03057774793951526, 0.10226074646443103, -0.30602487104479831],
        [0.034587095439337967, 0.12952927843366227, -0.33784127990101204],
        [0.052474170328712086, 0.18657255180245194, -0.3579843027772272],
        [0.091994681632082326, 0.26723127863424379, -0.25260655476779792],
        [0.13347630715940684, 0.32357735477165012, -0.024470808178957033],
        [0.15384354493952704, 0.34280108647564422, 0.13491404393915082],
        [0.15900754962693847, 0.34060377670596781, 0.18976830571459768],
        [0.16295494978675681, 0.31827934508653816, 0.19481332722140171],
        [0.16993034494742509, 0.27133130808805872, 0.17309877660617878],
        [0.17982653203172053, 0.20822558345622799, 0.14126513276024505],
        [0.19131355230874525, 0.14846557501489832, 0.11491468091864401],
        [0.19975857763403643, 0.095982292607171948, 0.090415253870062329],
        [0.20658822707890948, 0.043584734418370824, 0.06306456774219997],
        [0.21219023156027272, -0.014325522279879377, 0.030987183264965378],
        [0.21654068164149626, -0.068548998689542617, 0.0034062806458089456],
        [0.21945661241383063, -0.10772666533018446, -0.015504590152432225],
        [0.22140635817441434, -0.1321230871736031, -0.026747567698879308],
        [0.22344545686381859, -0.1503206330128766, -0.034895919869831968],
        [0.22550029718410494, -0.1657296472155779, -0.041947308394073415],
        [0.2274376974365879, -0.17433811572116925, -0.046427118880207993],
        [0.22851439734535678, -0.1725841734120255, -0.045204150498454145],
        [0.22895267436941055, -0.16216171901870582, -0.039243233978318227],
        [0.22846257745077686, -0.14569345720152038, -0.029881950824883111],
        [0.22806412172519758, -0.1280730249188762, -0.01977199855440618],
        [0.22740282307110887, -0.11594858475136806, -0.012684279825095651],
        [0.22715823121869261, -0.11326876494437256, -0.012809633265729078],
        [0.22773779852081508, -0.11241775681706437, -0.015429967328365948],
    ],
    [
        [8.0574963533776209, -1.6699022953651796, -0.52760512650374558],
        [-7.36844195862398, 6.6097600002381069, 1.6399525716553454],
        [-1.6228426801747824, 2.223392822149362, -2.9179776383911893],
    ],
    [
        [0.044053163763066186],
        [0.04492414703832752],
        [0.049124770069686456],
        [0.055159989094076614],
        [0.06001947818815331],
        [0.06289338153310105],
        [0.06597726846689901],
        [0.0700687277700348],
        [0.07499693501742155],
        [0.08300358592334493],
        [0.1029995324738676],
        [0.15644048585365855],
        [0.2525250358885018],
        [0.3415762524738676],
        [0.38276632756097567],
        [0.3934586344250871],
        [0.3971811634494772],
        [0.39914832595818833],
        [0.39865097146341455],
        [0.3972447237979091],
        [0.3884461682229966],
        [0.37315658254355394],
        [0.35097260491289156],
        [0.3285678778048779],
        [0.3134223668641114],
        [0.3056770914285714],
        [0.3020083383623695],
        [0.3002939057839717],
        [0.30195210783972143],
        [0.3070093854703835],
        [0.31476829968641135],
        [0.3241799281184667],
        [0.33510864853658495],
        [0.3443250147038329],
        [0.35157725606271795],
        [0.36112905449477356],
    ],
    [[0.287956117643289], [0.3558381900199877], [0.09809903558056805]],
]


def sRGBToSPDOtsu(srgb):
    """ Implements Otsu and others, "Reproducing Spectral Reflectances
      from Tristimulus Colors", 2018. """
    global _kdtree, _leaves
    xyz = xyzFromsRGB(srgb)
    xyy = xyzToxyY(xyz)
    node = 0
    node = _kdtree[node + 2] if xyy[_kdtree[node + 1]] < _kdtree[node] else _kdtree[node + 3]
    node = _kdtree[node + 2] if xyy[_kdtree[node + 1]] < _kdtree[node] else _kdtree[node + 3]
    node = _kdtree[node + 2] if xyy[_kdtree[node + 1]] < _kdtree[node] else _kdtree[node + 3]
    leaf = _leaves[node]
    cdiff = matSub(matT(matFromVec(xyz)), leaf[3])
    weights = matMul(leaf[1], cdiff)
    r = matAdd(matMul(leaf[0], weights), leaf[2])
    refl = matT(r)[0]
    # Clamp spectra to interval [0.0001, 1]
    for i in range(len(refl)):
        if refl[i] < 0.0001:
            refl[i] = 0.0001
        if refl[i] > 1:
            refl[i] = 1
    spd = SPD(refl, 10, 380)
    return spd


def _fileread(x):
    f = file(x, "r")
    ret = f.read()
    f.close()
    return ret


def _cmfd65(x):
    c = cie1931cmf(x)
    d = d65Illum(x) / 100.0
    return [cv * d for cv in c]


def _meanarr(arrs):
    arrlen = len(arrs[0])
    numarrs = len(arrs)
    ret = [0 for x in arrs[0]]
    for i in range(numarrs):
        for j in range(arrlen):
            ret[j] += arrs[i][j]
    return [v * 1.0 / numarrs for v in ret]


def _pca(spdxyy, st, en):
    global cmf
    arr = [spdxyy[i][0] for i in range(st, en)]
    pca = PCA(n_components=3)
    pca.fit(np.asarray(arr))
    com = pca.components_
    mat = matT(matNew([com[0], com[1], com[2]]))
    m = matMul(cmf, mat)
    minv = matI(m)
    mean = matT(matFromVec(_meanarr(arr)))
    cmean = matMul(cmf, mean)
    return [mat, minv, mean, cmean]


def _deltae(spdxyy, st, en):
    pcas = None
    try:
        pcas = _pca(spdxyy, st, en)
    except:
        return 99999  # Unexpected error
    ret = 0.0
    for i in range(st, en):
        s = matT(matFromVec(spdxyy[i][0]))
        cdiff = matSub(matT(matFromVec(spdxyy[i][2])), pcas[3])
        weights = matMul(pcas[1], cdiff)
        r = matAdd(matMul(pcas[0], weights), pcas[2])
        sdiff = matT(matSub(s, r))[0]
        normsq = vecDot(sdiff, sdiff)
        ret += normsq
    return ret


def _splitAxis(spdxyy):
    spx = [x for x in spdxyy]
    spy = [x for x in spdxyy]
    spx.sort(lambda a, b: cmp(a[1][0], b[1][0]))
    spy.sort(lambda a, b: cmp(a[1][1], b[1][1]))
    de = -1
    best = 0
    axis = 0
    parts = 25  # Use only several split possibilities to save time
    for i in range(1, min(parts - 1, len(spx) - 1)):
        point = len(spx) * i / parts
        if point < 3 or point == len(spx) - 3:
            continue
        cde = _deltae(spx, 0, point) + _deltae(spx, point, len(spx))
        if de < 0 or cde < de:
            de = cde
            best = point
            axis = 0
        cde = _deltae(spy, 0, point) + _deltae(spy, point, len(spy))
        if de < 0 or cde < de:
            de = cde
            best = point
            axis = 1
    if axis == 0:
        return [spx[:best], spx[best:], spx[best][1][0], axis]
    return [spy[:best], spy[best:], spx[best][1][0], axis]


# Generates algorithm data from JSON array of reflectance curves
# (stored in a file named "specs.json").
# Each curve is an array of 36 reflectance factors (from 0 through 1)
# starting at 380 nm and continuing to 730 nm, with a wavelength
# interval of 10 nm.
if __name__ == "__main__":
    # Uses PCA from scikit-learn package
    from sklearn.decomposition import PCA
    import numpy as np
    import json

    specs = json.loads(_fileread("specs.json"))
    for sp in specs:
        if len(sp) != 36:
            raise ValueError
    xyz = [spectrumToTristim(SPD(specs[i], 10, 380).calc) for i in range(len(specs))]
    spdxyy = [[specs[i], xyzToxyY(xyz[i]), xyz[i]] for i in range(len(specs))]
    cmf = matNew([_cmfd65(x) for x in brange(10, 380, 730)])
    cmf = matT(cmf)
    weight = sum(cmf[1]) * 1.0
    cmf = matScale(cmf, 1.0 / weight)

    sp1 = _splitAxis(spdxyy)
    sp2 = _splitAxis(sp1[0])
    sp3 = _splitAxis(sp1[1])
    sp4 = _splitAxis(sp2[0])
    sp5 = _splitAxis(sp2[1])
    sp6 = _splitAxis(sp3[0])
    sp7 = _splitAxis(sp3[1])
    splits = []
    kd = [4, 8, 12, 16, 20, 24, 0, 1, 2, 3, 4, 5, 6, 7]
    kdi = 0
    for sp in [sp1, sp2, sp3, sp4, sp5, sp6, sp7]:
        splits += [sp[2], sp[3]]
        splits += kd[kdi : kdi + 2]
        kdi += 2
    print("_kdtree=%s" % (splits))
    print("_leaves=[0,0,0,0,0,0,0,0]")
    leavei = 0
    for sp in [sp4, sp5, sp6, sp7]:
        pca1 = _pca(sp[0], 0, len(sp[0]))
        print("_leaves[%d]=[%s," % (leavei, pca1[0]))
        print("  %s," % (pca1[1]))
        print("  %s," % (pca1[2]))
        print("  %s]" % (pca1[3]))
        leavei += 1
        pca2 = _pca(sp[1], 0, len(sp[1]))
        print("_leaves[%d]=[%s," % (leavei, pca2[0]))
        print("  %s," % (pca2[1]))
        print("  %s," % (pca2[2]))
        print("  %s]" % (pca2[3]))
        leavei += 1
