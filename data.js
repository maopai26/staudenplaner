/* ============================================================
   Staudenbeet-Planer — Pflanzendatenbank
   Klimazone: Westdeutschland (gemäßigt-ozeanisch, ca. Zone 7b/8a)
   Nur im Fachhandel/Gartencenter übliche, käufliche Stauden.
   ============================================================ */

// ---- Nachschlage-Infos für Filter & Anzeige --------------------------

const SUN_INFO = {
  sonnig:       { label: "Sonnig",       hint: "mind. 6 Std. direkte Sonne" },
  halbschattig: { label: "Halbschattig", hint: "Sonne und Schatten im Wechsel" },
  schattig:     { label: "Schattig",     hint: "wenig bis keine direkte Sonne" },
};

const SOIL_INFO = {
  sandig:     { label: "Sandig, durchlässig",     hint: "eher trocken und mager" },
  lehmig:     { label: "Lehmig, nährstoffreich",  hint: "normaler Gartenboden" },
  feucht:     { label: "Feucht, humos",           hint: "frisch bis feucht" },
  kalkhaltig: { label: "Kalkhaltig, durchlässig", hint: "trocken bis mäßig frisch" },
};

const COLOR_INFO = {
  weiss:   { label: "Weiß",    hex: "#F7F4EA" },
  gelb:    { label: "Gelb",    hex: "#D9A62E" },
  orange:  { label: "Orange",  hex: "#C1652F" },
  rot:     { label: "Rot",     hex: "#9C3B34" },
  rosa:    { label: "Rosa",    hex: "#C97B93" },
  violett: { label: "Violett", hex: "#6B4C7A" },
  blau:    { label: "Blau",    hex: "#3E6C8C" },
};

const MONTH_NAMES = ["", "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"];
const MONTH_SHORT = ["", "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

// ---- Staudendatenbank --------------------------------------------------
// months: Blühmonate (1-12) | sun/soil/colors: Codes s.o.
// height: [minCm, maxCm] | planting: Pflanzzeitpunkt (Text)
// toxic: giftig (Zierpflanze, Hinweis für Familien mit Kindern/Haustieren)

const PLANTS = [
  { id: "helleborus-niger", nameDE: "Christrose", nameLA: "Helleborus niger",
    months: [12,1,2,3], sun: ["halbschattig","schattig"], soil: ["feucht","lehmig"],
    colors: ["weiss"], height: [20,30], planting: "Frühjahr oder Herbst", toxic: true },

  { id: "iris-unguicularis", nameDE: "Winter-Schwertlilie", nameLA: "Iris unguicularis",
    months: [11,12,1,2,3], sun: ["sonnig"], soil: ["kalkhaltig","sandig"],
    colors: ["violett"], height: [20,30], planting: "Frühjahr" },

  { id: "helleborus-orientalis", nameDE: "Lenzrose", nameLA: "Helleborus x hybridus",
    months: [2,3,4], sun: ["halbschattig","schattig"], soil: ["feucht","lehmig"],
    colors: ["weiss","rosa","violett"], height: [30,40], planting: "Frühjahr oder Herbst", toxic: true },

  { id: "bergenia", nameDE: "Bergenie", nameLA: "Bergenia crassifolia",
    months: [2,3,4], sun: ["sonnig","halbschattig"], soil: ["lehmig","feucht"],
    colors: ["rosa","weiss"], height: [30,40], planting: "Frühjahr oder Herbst" },

  { id: "primula-vulgaris", nameDE: "Kissenprimel", nameLA: "Primula vulgaris",
    months: [3,4,5], sun: ["halbschattig"], soil: ["feucht","lehmig"],
    colors: ["gelb","weiss","rot","violett"], height: [10,20], planting: "Frühjahr" },

  { id: "primula-elatior", nameDE: "Wald-Schlüsselblume", nameLA: "Primula elatior",
    months: [3,4,5], sun: ["halbschattig","schattig"], soil: ["feucht","lehmig"],
    colors: ["gelb"], height: [15,25], planting: "Frühjahr oder Herbst" },

  { id: "pulmonaria", nameDE: "Lungenkraut", nameLA: "Pulmonaria officinalis",
    months: [3,4,5], sun: ["halbschattig","schattig"], soil: ["feucht","lehmig"],
    colors: ["blau","rosa","violett"], height: [20,30], planting: "Frühjahr oder Herbst" },

  { id: "anemone-nemorosa", nameDE: "Busch-Windröschen", nameLA: "Anemone nemorosa",
    months: [3,4], sun: ["schattig","halbschattig"], soil: ["feucht","lehmig"],
    colors: ["weiss","violett"], height: [10,15], planting: "Herbst", toxic: true },

  { id: "euphorbia-polychroma", nameDE: "Frühlings-Wolfsmilch", nameLA: "Euphorbia polychroma",
    months: [4,5], sun: ["sonnig"], soil: ["sandig","lehmig"],
    colors: ["gelb"], height: [30,40], planting: "Frühjahr", toxic: true },

  { id: "doronicum", nameDE: "Kaukasus-Gämswurz", nameLA: "Doronicum orientale",
    months: [4,5], sun: ["sonnig","halbschattig"], soil: ["lehmig","feucht"],
    colors: ["gelb"], height: [30,50], planting: "Frühjahr oder Herbst" },

  { id: "brunnera", nameDE: "Kaukasusvergissmeinnicht", nameLA: "Brunnera macrophylla",
    months: [4,5], sun: ["halbschattig","schattig"], soil: ["feucht","lehmig"],
    colors: ["blau"], height: [30,40], planting: "Frühjahr oder Herbst" },

  { id: "epimedium", nameDE: "Elfenblume", nameLA: "Epimedium x versicolor",
    months: [4,5], sun: ["schattig","halbschattig"], soil: ["lehmig","feucht"],
    colors: ["gelb","rosa"], height: [20,30], planting: "Frühjahr oder Herbst" },

  { id: "tiarella", nameDE: "Schaumblüte", nameLA: "Tiarella cordifolia",
    months: [4,5], sun: ["schattig","halbschattig"], soil: ["feucht","lehmig"],
    colors: ["weiss","rosa"], height: [20,30], planting: "Frühjahr oder Herbst" },

  { id: "aubrieta", nameDE: "Blaukissen", nameLA: "Aubrieta x cultorum",
    months: [4,5], sun: ["sonnig"], soil: ["kalkhaltig","sandig"],
    colors: ["violett","blau","rosa"], height: [10,15], planting: "Frühjahr oder Herbst" },

  { id: "iberis", nameDE: "Garten-Schleifenblume", nameLA: "Iberis sempervirens",
    months: [4,5], sun: ["sonnig"], soil: ["kalkhaltig","sandig"],
    colors: ["weiss"], height: [20,30], planting: "Frühjahr oder Herbst" },

  { id: "phlox-subulata", nameDE: "Polster-Phlox", nameLA: "Phlox subulata",
    months: [4,5], sun: ["sonnig"], soil: ["sandig","kalkhaltig"],
    colors: ["rosa","violett","weiss","rot"], height: [10,15], planting: "Frühjahr oder Herbst" },

  { id: "convallaria", nameDE: "Maiglöckchen", nameLA: "Convallaria majalis",
    months: [5], sun: ["schattig","halbschattig"], soil: ["feucht","lehmig"],
    colors: ["weiss"], height: [15,20], planting: "Frühjahr oder Herbst", toxic: true },

  { id: "dicentra", nameDE: "Tränendes Herz", nameLA: "Lamprocapnos spectabilis",
    months: [5,6], sun: ["halbschattig"], soil: ["feucht","lehmig"],
    colors: ["rosa","weiss"], height: [60,80], planting: "Frühjahr oder Herbst", toxic: true },

  { id: "aquilegia", nameDE: "Akelei", nameLA: "Aquilegia vulgaris",
    months: [5,6], sun: ["sonnig","halbschattig"], soil: ["lehmig"],
    colors: ["blau","violett","rosa","weiss"], height: [50,80], planting: "Frühjahr oder Herbst", toxic: true },

  { id: "paeonia", nameDE: "Pfingstrose", nameLA: "Paeonia lactiflora",
    months: [5,6], sun: ["sonnig","halbschattig"], soil: ["lehmig"],
    colors: ["rosa","weiss","rot"], height: [60,100], planting: "Herbst" },

  { id: "iris-barbata", nameDE: "Bart-Iris", nameLA: "Iris barbata-Hybriden", wikiTitle: "Bart-Iris",
    months: [5,6], sun: ["sonnig"], soil: ["kalkhaltig","sandig"],
    colors: ["blau","violett","gelb","weiss","orange"], height: [60,100], planting: "Sommer (Juli–Aug.)" },

  { id: "dianthus", nameDE: "Garten-Federnelke", nameLA: "Dianthus plumarius-Hybriden", wikiTitle: "Federnelken",
    months: [5,6,7], sun: ["sonnig"], soil: ["kalkhaltig","sandig"],
    colors: ["rosa","rot","weiss"], height: [20,40], planting: "Frühjahr oder Herbst" },

  { id: "geranium-sanguineum", nameDE: "Blut-Storchschnabel", nameLA: "Geranium sanguineum",
    months: [5,6,7,8], sun: ["sonnig","halbschattig"], soil: ["sandig","kalkhaltig"],
    colors: ["rosa","violett"], height: [20,30], planting: "Frühjahr oder Herbst" },

  { id: "aruncus", nameDE: "Wald-Geißbart", nameLA: "Aruncus dioicus",
    months: [6,7], sun: ["halbschattig","schattig"], soil: ["feucht"],
    colors: ["weiss"], height: [100,150], planting: "Frühjahr oder Herbst" },

  { id: "digitalis", nameDE: "Roter Fingerhut", nameLA: "Digitalis purpurea",
    months: [6,7], sun: ["halbschattig"], soil: ["feucht","lehmig"],
    colors: ["rosa","weiss","violett"], height: [100,150], planting: "Frühjahr oder Herbst", toxic: true },

  { id: "lupinus", nameDE: "Garten-Lupine", nameLA: "Lupinus polyphyllus",
    months: [6,7], sun: ["sonnig"], soil: ["sandig","lehmig"],
    colors: ["blau","rosa","gelb","rot","weiss"], height: [80,120], planting: "Frühjahr oder Herbst", toxic: true },

  { id: "delphinium", nameDE: "Garten-Rittersporn", nameLA: "Delphinium-Hybriden", wikiTitle: "Garten-Rittersporn",
    months: [6,7], sun: ["sonnig"], soil: ["lehmig"],
    colors: ["blau","violett","weiss","rosa"], height: [100,150], planting: "Frühjahr", toxic: true },

  { id: "astilbe", nameDE: "Prachtspiere", nameLA: "Astilbe-Hybriden", wikiTitle: "Prachtspiere",
    months: [6,7,8], sun: ["halbschattig","schattig"], soil: ["feucht"],
    colors: ["rosa","rot","weiss","violett"], height: [40,100], planting: "Frühjahr oder Herbst" },

  { id: "alchemilla", nameDE: "Frauenmantel", nameLA: "Alchemilla mollis",
    months: [6,7,8], sun: ["sonnig","halbschattig"], soil: ["lehmig"],
    colors: ["gelb"], height: [30,40], planting: "Frühjahr oder Herbst" },

  { id: "nepeta", nameDE: "Katzenminze", nameLA: "Nepeta x faassenii",
    months: [5,6,7,8,9], sun: ["sonnig"], soil: ["sandig","kalkhaltig"],
    colors: ["blau","violett"], height: [30,50], planting: "Frühjahr oder Herbst" },

  { id: "salvia-nemorosa", nameDE: "Steppensalbei", nameLA: "Salvia nemorosa",
    months: [6,7,8], sun: ["sonnig"], soil: ["sandig","lehmig"],
    colors: ["violett","blau","rosa"], height: [40,60], planting: "Frühjahr oder Herbst" },

  { id: "lavandula", nameDE: "Echter Lavendel", nameLA: "Lavandula angustifolia",
    months: [6,7,8], sun: ["sonnig"], soil: ["sandig","kalkhaltig"],
    colors: ["violett","blau"], height: [30,60], planting: "Frühjahr" },

  { id: "veronica", nameDE: "Ähriger Ehrenpreis", nameLA: "Veronica spicata",
    months: [6,7,8], sun: ["sonnig"], soil: ["lehmig","sandig"],
    colors: ["blau","violett","rosa"], height: [30,50], planting: "Frühjahr oder Herbst" },

  { id: "astrantia", nameDE: "Große Sterndolde", nameLA: "Astrantia major",
    months: [6,7,8], sun: ["halbschattig"], soil: ["feucht","lehmig"],
    colors: ["weiss","rosa","rot"], height: [50,70], planting: "Frühjahr oder Herbst" },

  { id: "campanula-persicifolia", nameDE: "Pfirsichblättrige Glockenblume", nameLA: "Campanula persicifolia",
    months: [6,7,8], sun: ["sonnig","halbschattig"], soil: ["lehmig"],
    colors: ["blau","weiss"], height: [40,60], planting: "Frühjahr oder Herbst" },

  { id: "achillea", nameDE: "Garten-Schafgarbe", nameLA: "Achillea filipendulina", wikiTitle: "Goldgarbe",
    months: [6,7,8], sun: ["sonnig"], soil: ["sandig","lehmig"],
    colors: ["gelb","rot","rosa","weiss"], height: [50,80], planting: "Frühjahr oder Herbst" },

  { id: "leucanthemum", nameDE: "Garten-Margerite", nameLA: "Leucanthemum x superbum",
    months: [6,7,8], sun: ["sonnig"], soil: ["lehmig"],
    colors: ["weiss"], height: [40,80], planting: "Frühjahr oder Herbst" },

  { id: "coreopsis", nameDE: "Quirlblättriges Mädchenauge", nameLA: "Coreopsis verticillata",
    months: [6,7,8,9], sun: ["sonnig"], soil: ["sandig","lehmig"],
    colors: ["gelb"], height: [40,60], planting: "Frühjahr" },

  { id: "hemerocallis", nameDE: "Taglilie", nameLA: "Hemerocallis-Hybriden", wikiTitle: "Taglilien",
    months: [6,7,8], sun: ["sonnig","halbschattig"], soil: ["lehmig","feucht"],
    colors: ["gelb","orange","rot","rosa"], height: [60,90], planting: "Frühjahr oder Herbst" },

  { id: "hosta", nameDE: "Funkie", nameLA: "Hosta-Hybriden", wikiTitle: "Funkien",
    months: [7,8], sun: ["schattig","halbschattig"], soil: ["feucht","lehmig"],
    colors: ["violett","weiss"], height: [30,60], planting: "Frühjahr oder Herbst" },

  { id: "ligularia", nameDE: "Goldkolben", nameLA: "Ligularia dentata",
    months: [7,8], sun: ["halbschattig"], soil: ["feucht"],
    colors: ["gelb","orange"], height: [100,150], planting: "Frühjahr" },

  { id: "gypsophila", nameDE: "Schleierkraut", nameLA: "Gypsophila paniculata",
    months: [6,7,8], sun: ["sonnig"], soil: ["kalkhaltig","sandig"],
    colors: ["weiss","rosa"], height: [60,90], planting: "Frühjahr" },

  { id: "echinacea", nameDE: "Purpur-Sonnenhut", nameLA: "Echinacea purpurea",
    months: [7,8,9], sun: ["sonnig"], soil: ["lehmig"],
    colors: ["rosa","rot","weiss","orange"], height: [60,100], planting: "Frühjahr" },

  { id: "rudbeckia", nameDE: "Gelber Sonnenhut", nameLA: "Rudbeckia fulgida",
    months: [7,8,9,10], sun: ["sonnig"], soil: ["lehmig","feucht"],
    colors: ["gelb","orange"], height: [60,80], planting: "Frühjahr" },

  { id: "phlox-paniculata", nameDE: "Hoher Phlox", nameLA: "Phlox paniculata",
    months: [7,8,9], sun: ["sonnig","halbschattig"], soil: ["feucht","lehmig"],
    colors: ["rosa","rot","weiss","violett"], height: [80,120], planting: "Frühjahr oder Herbst" },

  { id: "monarda", nameDE: "Indianernessel", nameLA: "Monarda didyma",
    months: [7,8,9], sun: ["sonnig","halbschattig"], soil: ["feucht","lehmig"],
    colors: ["rot","rosa","violett"], height: [70,100], planting: "Frühjahr oder Herbst" },

  { id: "gaura", nameDE: "Prachtkerze", nameLA: "Gaura lindheimeri",
    months: [6,7,8,9,10], sun: ["sonnig"], soil: ["sandig"],
    colors: ["weiss","rosa"], height: [60,90], planting: "Frühjahr" },

  { id: "crocosmia", nameDE: "Montbretie", nameLA: "Crocosmia x crocosmiiflora",
    months: [7,8,9], sun: ["sonnig"], soil: ["lehmig","feucht"],
    colors: ["orange","rot","gelb"], height: [60,80], planting: "Frühjahr" },

  { id: "helenium", nameDE: "Sonnenbraut", nameLA: "Helenium-Hybriden", wikiTitle: "Sonnenbraut (Pflanze)",
    months: [7,8,9], sun: ["sonnig"], soil: ["feucht","lehmig"],
    colors: ["gelb","orange","rot"], height: [80,120], planting: "Frühjahr oder Herbst" },

  { id: "eryngium", nameDE: "Flach-Edeldistel", nameLA: "Eryngium planum",
    months: [7,8,9], sun: ["sonnig"], soil: ["sandig","kalkhaltig"],
    colors: ["blau"], height: [60,80], planting: "Frühjahr" },

  { id: "verbena-bonariensis", nameDE: "Argentinisches Eisenkraut", nameLA: "Verbena bonariensis",
    months: [7,8,9,10], sun: ["sonnig"], soil: ["sandig","lehmig"],
    colors: ["violett"], height: [100,150], planting: "Frühjahr" },

  { id: "aconitum", nameDE: "Blauer Eisenhut", nameLA: "Aconitum napellus",
    months: [8,9], sun: ["halbschattig"], soil: ["feucht","lehmig"],
    colors: ["blau","violett"], height: [100,150], planting: "Frühjahr oder Herbst", toxic: true },

  { id: "physostegia", nameDE: "Gelenkblume", nameLA: "Physostegia virginiana",
    months: [8,9], sun: ["sonnig","halbschattig"], soil: ["feucht","lehmig"],
    colors: ["rosa","weiss"], height: [60,90], planting: "Frühjahr oder Herbst" },

  { id: "sedum", nameDE: "Hohe Fetthenne", nameLA: "Hylotelephium spectabile",
    months: [8,9,10], sun: ["sonnig"], soil: ["sandig","lehmig"],
    colors: ["rosa","rot","weiss"], height: [40,60], planting: "Frühjahr oder Herbst" },

  { id: "aster-dumosus", nameDE: "Kissenaster", nameLA: "Symphyotrichum dumosum",
    months: [8,9,10], sun: ["sonnig","halbschattig"], soil: ["lehmig"],
    colors: ["violett","blau","rosa"], height: [30,50], planting: "Frühjahr oder Herbst" },

  { id: "anemone-japonica", nameDE: "Herbst-Anemone", nameLA: "Anemone hupehensis",
    months: [8,9,10], sun: ["halbschattig"], soil: ["feucht","lehmig"],
    colors: ["rosa","weiss"], height: [60,100], planting: "Frühjahr" },

  { id: "cyclamen-hederifolium", nameDE: "Efeublättriges Alpenveilchen", nameLA: "Cyclamen hederifolium",
    months: [8,9,10,11], sun: ["halbschattig","schattig"], soil: ["feucht","lehmig"],
    colors: ["rosa","weiss"], height: [10,15], planting: "Sommer (August)", toxic: true },

  { id: "liriope", nameDE: "Lilientraube", nameLA: "Liriope muscari",
    months: [9,10,11], sun: ["halbschattig","schattig"], soil: ["lehmig","feucht"],
    colors: ["violett"], height: [20,30], planting: "Frühjahr" },

  { id: "solidago", nameDE: "Garten-Goldrute", nameLA: "Solidago x hybrida",
    months: [8,9,10], sun: ["sonnig"], soil: ["sandig","lehmig"],
    colors: ["gelb"], height: [60,120], planting: "Frühjahr oder Herbst" },

  { id: "aster-novae-angliae", nameDE: "Raublatt-Aster", nameLA: "Symphyotrichum novae-angliae",
    months: [9,10], sun: ["sonnig"], soil: ["feucht","lehmig"],
    colors: ["violett","rosa","blau","rot"], height: [80,120], planting: "Frühjahr oder Herbst" },

  { id: "chrysanthemum", nameDE: "Garten-Chrysantheme", nameLA: "Chrysanthemum indicum-Hybriden", wikiTitle: "Chrysanthemen",
    months: [9,10,11], sun: ["sonnig"], soil: ["lehmig"],
    colors: ["gelb","rot","rosa","orange","weiss"], height: [40,60], planting: "Frühjahr" },

  { id: "colchicum", nameDE: "Herbstzeitlose", nameLA: "Colchicum autumnale",
    months: [9,10], sun: ["sonnig","halbschattig"], soil: ["feucht","lehmig"],
    colors: ["rosa","violett"], height: [10,15], planting: "Sommer (Juli–Aug.)", toxic: true },

  { id: "geranium-macrorrhizum", nameDE: "Balkan-Storchschnabel", nameLA: "Geranium macrorrhizum",
    months: [5,6], sun: ["halbschattig","schattig"], soil: ["sandig","kalkhaltig","lehmig"],
    colors: ["rosa","violett"], height: [25,35], planting: "Frühjahr oder Herbst",
    note: "Bodendecker, verträgt auch trockenen Schatten unter Bäumen." },

  { id: "vinca-minor", nameDE: "Kleines Immergrün", nameLA: "Vinca minor",
    months: [4,5], sun: ["halbschattig","schattig"], soil: ["sandig","kalkhaltig","lehmig"],
    colors: ["blau","violett"], height: [10,15], planting: "Frühjahr oder Herbst", toxic: true,
    note: "Immergrüner Bodendecker, verträgt auch trockenen Schatten." },

  // ---- Ergänzungen v0.2 ------------------------------------------------

  { id: "helianthus-multiflorus", nameDE: "Stauden-Sonnenblume", nameLA: "Helianthus x multiflorus",
    months: [8,9], sun: ["sonnig"], soil: ["lehmig","feucht"],
    colors: ["gelb"], height: [120,180], planting: "Frühjahr oder Herbst" },

  { id: "kniphofia", nameDE: "Fackellilie", nameLA: "Kniphofia-Hybriden", wikiTitle: "Fackellilien",
    months: [7,8,9], sun: ["sonnig"], soil: ["sandig","lehmig"],
    colors: ["orange","rot","gelb"], height: [60,100], planting: "Frühjahr" },

  { id: "erigeron-karvinskianus", nameDE: "Spanisches Gänseblümchen", nameLA: "Erigeron karvinskianus",
    months: [6,7,8,9,10], sun: ["sonnig"], soil: ["sandig","kalkhaltig"],
    colors: ["weiss","rosa"], height: [15,25], planting: "Frühjahr" },

  { id: "persicaria-amplexicaulis", nameDE: "Kerzenknöterich", nameLA: "Persicaria amplexicaulis",
    months: [7,8,9,10], sun: ["sonnig","halbschattig"], soil: ["feucht","lehmig"],
    colors: ["rosa","rot"], height: [80,100], planting: "Frühjahr oder Herbst" },

  { id: "filipendula-ulmaria", nameDE: "Echtes Mädesüß", nameLA: "Filipendula ulmaria",
    months: [6,7,8], sun: ["halbschattig","sonnig"], soil: ["feucht"],
    colors: ["weiss"], height: [100,150], planting: "Frühjahr oder Herbst" },

  { id: "trollius-europaeus", nameDE: "Trollblume", nameLA: "Trollius europaeus",
    months: [5,6], sun: ["halbschattig","sonnig"], soil: ["feucht"],
    colors: ["gelb"], height: [40,60], planting: "Frühjahr oder Herbst" },

  { id: "iris-sibirica", nameDE: "Sibirische Schwertlilie", nameLA: "Iris sibirica",
    months: [5,6], sun: ["sonnig","halbschattig"], soil: ["feucht","lehmig"],
    colors: ["blau","violett","weiss"], height: [60,90], planting: "Frühjahr oder Herbst" },

  { id: "papaver-orientale", nameDE: "Türkischer Mohn", nameLA: "Papaver orientale",
    months: [5,6], sun: ["sonnig"], soil: ["lehmig"],
    colors: ["rot","orange","rosa","weiss"], height: [60,90], planting: "Herbst", toxic: true },

  { id: "centaurea-montana", nameDE: "Berg-Flockenblume", nameLA: "Centaurea montana",
    months: [5,6], sun: ["sonnig","halbschattig"], soil: ["lehmig"],
    colors: ["blau","violett"], height: [40,50], planting: "Frühjahr oder Herbst" },

  { id: "scabiosa-caucasica", nameDE: "Kaukasus-Skabiose", nameLA: "Scabiosa caucasica",
    months: [6,7,8,9], sun: ["sonnig"], soil: ["kalkhaltig","sandig"],
    colors: ["blau","violett","weiss"], height: [40,60], planting: "Frühjahr oder Herbst" },

  { id: "knautia-macedonica", nameDE: "Mazedonische Witwenblume", nameLA: "Knautia macedonica",
    months: [6,7,8,9], sun: ["sonnig"], soil: ["sandig","lehmig"],
    colors: ["rot","violett"], height: [60,80], planting: "Frühjahr" },

  { id: "anthemis-tinctoria", nameDE: "Färberkamille", nameLA: "Anthemis tinctoria",
    months: [6,7,8], sun: ["sonnig"], soil: ["sandig","lehmig"],
    colors: ["gelb"], height: [50,70], planting: "Frühjahr oder Herbst" },

  { id: "penstemon", nameDE: "Bartfaden", nameLA: "Penstemon-Hybriden", wikiTitle: "Bartfaden",
    months: [7,8,9], sun: ["sonnig"], soil: ["sandig","lehmig"],
    colors: ["rot","rosa","violett","weiss"], height: [50,70], planting: "Frühjahr" },

  { id: "waldsteinia", nameDE: "Ysskraut", nameLA: "Waldsteinia ternata",
    months: [4,5], sun: ["halbschattig","schattig"], soil: ["sandig","lehmig"],
    colors: ["gelb"], height: [10,15], planting: "Frühjahr oder Herbst",
    note: "Bodendecker, verträgt auch trockenen Schatten." },

  { id: "heuchera", nameDE: "Purpurglöckchen", nameLA: "Heuchera-Hybriden", wikiTitle: "Purpurglöckchen",
    months: [6,7], sun: ["halbschattig","schattig"], soil: ["lehmig","feucht"],
    colors: ["rosa","rot","weiss"], height: [30,50], planting: "Frühjahr oder Herbst" },

  { id: "lysimachia-punctata", nameDE: "Gilbweiderich", nameLA: "Lysimachia punctata",
    months: [6,7], sun: ["sonnig","halbschattig"], soil: ["feucht","lehmig"],
    colors: ["gelb"], height: [60,80], planting: "Frühjahr oder Herbst" },

  { id: "lythrum-salicaria", nameDE: "Blutweiderich", nameLA: "Lythrum salicaria",
    months: [7,8], sun: ["sonnig","halbschattig"], soil: ["feucht"],
    colors: ["rosa","violett"], height: [80,120], planting: "Frühjahr oder Herbst" },

  { id: "eutrochium", nameDE: "Gewöhnlicher Wasserdost", nameLA: "Eutrochium maculatum", wikiTitle: "Eupatorium maculatum",
    months: [8,9], sun: ["sonnig","halbschattig"], soil: ["feucht"],
    colors: ["rosa","violett"], height: [120,180], planting: "Frühjahr" },

  { id: "armeria-maritima", nameDE: "Grasnelke", nameLA: "Armeria maritima",
    months: [5,6,7], sun: ["sonnig"], soil: ["sandig","kalkhaltig"],
    colors: ["rosa","weiss"], height: [15,25], planting: "Frühjahr oder Herbst" },
];
