import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   CADEYA SMOOTHIES  ·  Version Pro 1.0  ·  Cahier des Charges v5.0
   © 2026 Cadeya Smoothies  ·  Développé par TransTech Solution
   Tech Lead : Roderic Sylvio N.D.

   ARCHITECTURE
   ├── /data        → 96 mélanges, 6 catégories (séparation données/UI)
   ├── /utils       → Fisher-Yates, arrondi intelligent, sanitisation
   ├── /security    → Anti-brute-force, rate-limiting, hash admin
   ├── /components  → Logo, Header, Toast, PDF
   └── /screens     → Splash, Home, Card, History, Admin, Payment

   SÉCURITÉ DÉMO : mot de passe admin visible pour démonstration client
   PRODUCTION     : remplacer par JWT + bcrypt + API côté serveur
════════════════════════════════════════════════════════════════════════════ */

// ══════════════════════════════════════════════════════════
//  1.  DESIGN TOKENS — palette stricte cahier des charges
// ══════════════════════════════════════════════════════════
const T = {
  orange:    '#C97B2E',
  orangeHov: '#B86D22',
  orangeDim: 'rgba(201,123,46,0.14)',
  orangeBdr: 'rgba(201,123,46,0.28)',
  brown:     '#2C1A0E',
  brownMid:  '#3D200A',
  brownLt:   '#5C3A1E',
  cream:     '#FDF8F3',
  textDark:  '#2C1A0E',
  textMid:   '#5C3A1E',
  textLight: '#A07850',
  success:   '#15803D',
  error:     '#DC2626',
  shadow:    '0 4px 24px rgba(44,26,14,0.18)',
  shadowLg:  '0 12px 48px rgba(44,26,14,0.28)',
  radius:    '12px',
};

// ══════════════════════════════════════════════════════════
//  2.  CATÉGORIES
// ══════════════════════════════════════════════════════════
const CATS = {
  all:      { label:'Tout voir',   emoji:'🎲', accent:'#C97B2E', bg:'rgba(201,123,46,0.08)' },
  energie:  { label:'Énergie',     emoji:'⚡', accent:'#F5A830', bg:'rgba(245,168,48,0.08)'  },
  detox:    { label:'Détox',       emoji:'🌿', accent:'#4CAF7A', bg:'rgba(76,175,122,0.08)'  },
  immunite: { label:'Immunité',    emoji:'🛡️', accent:'#E07B39', bg:'rgba(224,123,57,0.08)'  },
  digestion:{ label:'Digestion',   emoji:'🌱', accent:'#78C055', bg:'rgba(120,192,85,0.08)'  },
  beaute:   { label:'Beauté',      emoji:'✨', accent:'#E07A9A', bg:'rgba(224,122,154,0.08)' },
  stress:   { label:'Anti-stress', emoji:'😌', accent:'#9B7ED4', bg:'rgba(155,126,212,0.08)' },
};

// ══════════════════════════════════════════════════════════
//  3.  BASE DE DONNÉES — 96 MÉLANGES COMPLETS
//      Séparée des composants UI (principe SOLID)
// ══════════════════════════════════════════════════════════
const BLENDS = [
  // ──────────────── ⚡ ÉNERGIE (E01 – E16) ────────────────
  { id:'E01', cat:'energie', name:'Bouye + Gingembre',
    base:{n:'Eau',a:250,u:'ml'},
    ing:[{n:'Bouye',a:20,u:'g'},{n:'Gingembre frais',a:12,u:'g'}],
    note:'Le bouye apporte 280 mg de vitamine C pour 100 g — il contribue à réduire la fatigue et soutient les défenses naturelles. Le gingembre favorise la circulation sanguine. Un mélange simple et efficace pour bien commencer la journée.' },

  { id:'E02', cat:'energie', name:'Bouye + Carotte + Gingembre',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Bouye',a:20,u:'g'},{n:'Carotte',a:100,u:'g'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'Le bouye apporte la vitamine C, la carotte le bêta-carotène. Le gingembre active la circulation. Une combinaison qui contribue à stabiliser l\'énergie sur la durée.' },

  { id:'E03', cat:'energie', name:'Bouye + Orange Casamance + Cannelle',
    base:{n:'Eau',a:150,u:'ml'},
    ing:[{n:'Bouye',a:20,u:'g'},{n:'Orange Casamance',a:2,u:'unité(s)'},{n:'Cannelle',a:0.5,u:'c.à.c'}],
    note:'L\'orange de Casamance, plus douce et moins acide que l\'importée, s\'associe naturellement au bouye. La cannelle est traditionnellement connue pour aider à stabiliser la glycémie et réchauffer l\'organisme.' },

  { id:'E04', cat:'energie', name:'Ditax + Concombre + Citron vert',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Ditax',a:80,u:'g'},{n:'Concombre',a:100,u:'g'},{n:'Citron vert',a:1,u:'unité'}],
    note:'Le ditax est l\'un des fruits les plus riches en vitamine C — 1 200 mg pour 100 g selon les recherches du CIRAD. Le concombre hydrate en profondeur. Le citron vert potentialise l\'absorption. Contribue aux défenses naturelles.' },

  { id:'E05', cat:'energie', name:'Maad + Mangue + Citron',
    base:{n:'Eau',a:150,u:'ml'},
    ing:[{n:'Maad',a:90,u:'g'},{n:'Mangue',a:120,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'Le maad, fruit sauvage du Sahel riche en polyphénols, s\'associe à la mangue pour équilibrer l\'acidité. Le citron favorise l\'absorption des minéraux. Contribue à réduire la fatigue et apporte des minéraux essentiels.' },

  { id:'E06', cat:'energie', name:'Goyave + Orange Casamance + Gingembre',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Goyave',a:100,u:'g'},{n:'Orange Casamance',a:1,u:'unité'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'La goyave contient 228 mg de vitamine C pour 100 g — l\'une des sources les plus généreuses parmi les fruits tropicaux cultivés au Sénégal. L\'orange Casamance complète. Aide à maintenir les défenses naturelles.' },

  { id:'E07', cat:'energie', name:'Moringa + Carotte + Gingembre',
    base:{n:'Eau',a:220,u:'ml'},
    ing:[{n:'Moringa (Nebeday)',a:4,u:'g'},{n:'Carotte',a:100,u:'g'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'Le moringa (nebeday) est une source naturelle de fer, calcium et protéines végétales. La carotte apporte le bêta-carotène. Contribue à réduire la fatigue et soutenir l\'énergie. Dose recommandée : max 5 g par verre.' },

  { id:'E08', cat:'energie', name:'Pomme de cajou + Citron + Gingembre',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Pomme de cajou',a:100,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'Le fruit avant la noix de cajou — souvent ignoré mais excellent. Contient 147 mg de vitamine C pour 100 g. Le gingembre favorise la circulation. Ce mélange contribue à réduire la fatigue de façon naturelle.' },

  { id:'E09', cat:'energie', name:'Bouye + Bissap rouge',
    base:{n:'Eau',a:280,u:'ml'},
    ing:[{n:'Bouye',a:20,u:'g'},{n:'Bissap rouge (calices séchés)',a:12,u:'g'}],
    note:'Deux trésors de l\'Afrique de l\'Ouest réunis. Le bouye apporte la vitamine C, le bissap rouge les anthocyanes — antioxydants naturels reconnus. Un mélange rouge profond qui contribue à réduire la fatigue et soutient les défenses naturelles.' },

  { id:'E10', cat:'energie', name:'Jujube + Orange Casamance + Cannelle',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Jujube',a:90,u:'g'},{n:'Orange Casamance',a:1,u:'unité'},{n:'Cannelle',a:0.5,u:'c.à.c'}],
    note:'Le jujube (sidem), très présent dans la zone nord du Sénégal, est traditionnellement reconnu pour son effet tonique. La cannelle aide à stabiliser l\'énergie. L\'orange Casamance apporte la vitamine C locale.' },

  { id:'E11', cat:'energie', name:'Ditax + Citron vert + Menthe',
    base:{n:'Eau',a:250,u:'ml'},
    ing:[{n:'Ditax',a:80,u:'g'},{n:'Citron vert',a:1,u:'unité'},{n:'Menthe fraîche',a:8,u:'feuilles'}],
    note:'La vitamine C du ditax associée à la fraîcheur de la menthe et du citron vert. Un mélange vert vif qui contribue à hydrater l\'organisme et favorise la circulation. Idéal pour les journées chaudes.' },

  { id:'E12', cat:'energie', name:'Nguer + Mangue + Cardamome',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Nguer (marula)',a:80,u:'g'},{n:'Mangue',a:120,u:'g'},{n:'Cardamome',a:2,u:'gousses'}],
    note:'Le nguer est riche en vitamine C et acides gras essentiels. La mangue apporte le bêta-carotène. La cardamome — très présente dans le café Touba — est traditionnellement reconnue pour ses propriétés digestives.' },

  { id:'E13', cat:'energie', name:'Pamplemousse + Orange Casamance + Fleur d\'oranger',
    base:{n:'Eau',a:150,u:'ml'},
    ing:[{n:'Pamplemousse',a:1,u:'unité'},{n:'Orange Casamance',a:1,u:'unité'},{n:'Eau de fleur d\'oranger',a:20,u:'ml'}],
    note:'Trio d\'agrumes locaux. La fleur d\'oranger apporte une note florale apaisante très utilisée au Sénégal. Riche en vitamine C naturelle — contribue à maintenir les défenses et rafraîchit l\'organisme.' },

  { id:'E14', cat:'energie', name:'Pamplemousse + Citron + Gingembre',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Pamplemousse',a:1,u:'unité'},{n:'Citron',a:1,u:'unité'},{n:'Gingembre frais',a:12,u:'g'}],
    note:'Un mélange acide et tonique. Le gingembre est bien documenté pour favoriser la circulation sanguine. L\'association pamplemousse-citron apporte une charge importante en vitamine C. Contribue à réduire la fatigue.' },

  { id:'E15', cat:'energie', name:'Carotte + Orange Casamance + Gingembre',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Carotte',a:120,u:'g'},{n:'Orange Casamance',a:1,u:'unité'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'Un classique équilibré. La carotte apporte le bêta-carotène, l\'orange Casamance la vitamine C locale, le gingembre la circulation. Mélange orange harmonieux qui contribue à réduire la fatigue.' },

  { id:'E16', cat:'energie', name:'Carotte + Pamplemousse + Citron',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Carotte',a:120,u:'g'},{n:'Pamplemousse',a:0.5,u:'unité'},{n:'Citron',a:0.5,u:'unité'}],
    note:'Le bêta-carotène de la carotte s\'associe à la double vitamine C du pamplemousse et du citron. Source naturelle de bêta-carotène et contribue à stabiliser l\'énergie sur la journée.' },

  // ──────────────── 🌿 DÉTOX (D01 – D16) ────────────────
  { id:'D01', cat:'detox', name:'Concombre + Menthe + Citron + Gingembre',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Concombre',a:120,u:'g'},{n:'Menthe fraîche',a:8,u:'feuilles'},{n:'Citron',a:0.5,u:'unité'},{n:'Gingembre frais',a:8,u:'g'}],
    note:'Le concombre est composé à 96 % d\'eau — il hydrate en profondeur. La menthe est digestive et rafraîchissante. Le gingembre favorise la circulation et le drainage. Ce mélange vert contribue à hydrater et purifier l\'organisme.' },

  { id:'D02', cat:'detox', name:'Bissap rouge + Citron + Gingembre',
    base:{n:'Eau',a:250,u:'ml'},
    ing:[{n:'Bissap rouge (séchés)',a:12,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'Le bissap rouge est reconnu cliniquement pour ses propriétés diurétiques et antioxydantes — ses anthocyanes (120 mg/100 g) contribuent à la purification de l\'organisme. Le gingembre soutient la circulation. Reconnu pour ses propriétés purifiantes.' },

  { id:'D03', cat:'detox', name:'Moringa + Kinkeliba + Menthe',
    base:{n:'Eau',a:250,u:'ml'},
    ing:[{n:'Moringa',a:4,u:'g'},{n:'Kinkeliba (infusé 10 min)',a:5,u:'g'},{n:'Menthe fraîche',a:8,u:'feuilles'}],
    note:'Deux plantes emblématiques de l\'Afrique de l\'Ouest. Le kinkeliba est traditionnellement utilisé au Sénégal pour ses propriétés purifiantes et diurétiques. Le moringa apporte le fer et le calcium. La menthe facilite la digestion.' },

  { id:'D04', cat:'detox', name:'Concombre + Céleri + Citron',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Concombre',a:120,u:'g'},{n:'Céleri',a:80,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'Le céleri est reconnu pour ses propriétés diurétiques et anti-inflammatoires. Le concombre hydrate. Le citron alcalinise malgré son acidité. Un trio vert minimaliste qui favorise le drainage naturel.' },

  { id:'D05', cat:'detox', name:'Concombre + Persil plat + Citron',
    base:{n:'Eau',a:220,u:'ml'},
    ing:[{n:'Concombre',a:120,u:'g'},{n:'Persil plat',a:15,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'Le persil plat contient 133 mg de vitamine C pour 100 g — parmi les légumes, c\'est l\'un des plus riches. Traditionnellement reconnu pour ses propriétés diurétiques et son action sur les reins. Favorise le drainage naturel.' },

  { id:'D06', cat:'detox', name:'Betterave + Citron + Gingembre',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Betterave',a:80,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'La betterave est reconnue pour ses nitrates naturels qui favorisent la circulation et son action hépatoprotectrice. Le citron soutient le foie. Un mélange rouge profond qui contribue à purifier l\'organisme.' },

  { id:'D07', cat:'detox', name:'Tomate + Concombre + Céleri + Citron',
    base:{n:'Eau',a:150,u:'ml'},
    ing:[{n:'Tomate',a:100,u:'g'},{n:'Concombre',a:80,u:'g'},{n:'Céleri',a:40,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'La tomate apporte le lycopène, un antioxydant naturel puissant. Le céleri et le concombre drainent et hydratent. Un mélange légume pur, léger en calories, qui contribue au drainage naturel.' },

  { id:'D08', cat:'detox', name:'Bissap blanc + Citron + Menthe',
    base:{n:'Eau',a:250,u:'ml'},
    ing:[{n:'Bissap blanc (séchés)',a:10,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Menthe fraîche',a:8,u:'feuilles'}],
    note:'Le bissap blanc, plus doux que le rouge, est très utilisé en Casamance. Son profil floral et délicat en fait une base détox agréable. Traditionnellement diurétique. Doux, accessible et rafraîchissant.' },

  { id:'D09', cat:'detox', name:'Kinkeliba + Citron + Gingembre',
    base:{n:'Eau',a:250,u:'ml'},
    ing:[{n:'Kinkeliba (infusé 10 min)',a:6,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Gingembre frais',a:8,u:'g'}],
    note:'Le kinkeliba est l\'une des plantes les plus utilisées en médecine traditionnelle sénégalaise. Reconnu pour ses propriétés purifiantes, diurétiques et hépatoprotectrices. Dose recommandée : 250 ml/jour. Le gingembre complète l\'action drainante.' },

  { id:'D10', cat:'detox', name:'Concombre + Citronnelle + Citron vert',
    base:{n:'Eau',a:220,u:'ml'},
    ing:[{n:'Concombre',a:120,u:'g'},{n:'Citronnelle',a:1,u:'tige'},{n:'Citron vert',a:1,u:'unité'}],
    note:'La citronnelle, très présente en Afrique de l\'Ouest, est traditionnellement reconnue pour ses propriétés apaisantes et digestives. Le concombre hydrate. Un mélange vert frais qui contribue au drainage naturel.' },

  { id:'D11', cat:'detox', name:'Betterave + Carotte + Citron',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Betterave',a:70,u:'g'},{n:'Carotte',a:80,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'La betterave soutient la circulation et le foie, la carotte apporte le bêta-carotène. Le citron optimise l\'absorption. Source naturelle de bêta-carotène — contribue à purifier l\'organisme.' },

  { id:'D12', cat:'detox', name:'Persil plat + Céleri + Citron vert',
    base:{n:'Eau',a:220,u:'ml'},
    ing:[{n:'Persil plat',a:15,u:'g'},{n:'Céleri',a:80,u:'g'},{n:'Citron vert',a:1,u:'unité'}],
    note:'Un duo de légumes diurétiques puissants. Le persil plat et le céleri sont tous deux reconnus pour leurs propriétés drainantes. Le citron vert potentialise l\'action. Favorise le drainage naturel de l\'organisme.' },

  { id:'D13', cat:'detox', name:'Tamarin + Citron + Gingembre',
    base:{n:'Eau',a:220,u:'ml'},
    ing:[{n:'Tamarin (pâte)',a:30,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'Le tamarin (dakhar) est utilisé depuis des siècles en médecine traditionnelle sénégalaise pour ses propriétés digestives et purifiantes. Reconnu pour son action sur le foie. Dose max : 40 g — effet laxatif fort si excès.' },

  { id:'D14', cat:'detox', name:'Concombre + Menthe + Citron vert',
    base:{n:'Eau de coco',a:200,u:'ml'},
    ing:[{n:'Concombre',a:120,u:'g'},{n:'Menthe fraîche',a:8,u:'feuilles'},{n:'Citron vert',a:1,u:'unité'}],
    note:'L\'eau de coco apporte les électrolytes naturels — potassium, sodium, magnésium. Le concombre et la menthe hydratent et drainent. Contribue à hydrater l\'organisme en profondeur.' },

  { id:'D15', cat:'detox', name:'Bissap rouge + Citron',
    base:{n:'Eau de coco',a:250,u:'ml'},
    ing:[{n:'Bissap rouge (séchés)',a:12,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'Simple et efficace. Le bissap rouge apporte les anthocyanes antioxydants, l\'eau de coco les électrolytes naturels. Le citron potentialise l\'action purifiante. Reconnu pour ses propriétés purifiantes et diurétiques.' },

  { id:'D16', cat:'detox', name:'Persil plat + Citron + Gingembre',
    base:{n:'Eau de coco',a:220,u:'ml'},
    ing:[{n:'Persil plat',a:15,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'Le persil plat avec l\'eau de coco pour les électrolytes. Le gingembre favorise la circulation et le drainage. Un mélange vert concentré qui favorise le drainage naturel et hydrate l\'organisme.' },

  // ──────────────── 🛡️ IMMUNITÉ (I01 – I16) ────────────────
  { id:'I01', cat:'immunite', name:'Bouye + Gingembre + Citron',
    base:{n:'Eau',a:220,u:'ml'},
    ing:[{n:'Bouye',a:20,u:'g'},{n:'Gingembre frais',a:12,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'Le bouye contient 280 mg de vitamine C pour 100 g de pulpe fraîche — 7 fois plus que l\'orange selon le CIRAD. Le gingembre est documenté pour ses propriétés anti-inflammatoires. Le citron potentialise l\'absorption. Aide à maintenir les défenses naturelles.' },

  { id:'I02', cat:'immunite', name:'Ditax + Citron vert + Gingembre',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Ditax',a:80,u:'g'},{n:'Citron vert',a:1,u:'unité'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'Le ditax (detarium senegalense) affiche 1 200 mg de vitamine C pour 100 g selon les recherches CIRAD. Le citron vert et le gingembre renforcent l\'action. Un mélange vert puissant qui aide à maintenir les défenses naturelles. Max 100 g de ditax par verre.' },

  { id:'I03', cat:'immunite', name:'Goyave + Orange Casamance + Gingembre',
    base:{n:'Eau',a:180,u:'ml'},
    ing:[{n:'Goyave',a:100,u:'g'},{n:'Orange Casamance',a:1,u:'unité'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'La goyave sénégalaise (228 mg vit.C/100 g) et l\'orange de Casamance forment un duo vitaminé local fort. Le gingembre soutient la circulation. Une combinaison orange qui aide à maintenir les défenses naturelles.' },

  { id:'I04', cat:'immunite', name:'Bissap rouge + Gingembre + Citron',
    base:{n:'Eau',a:250,u:'ml'},
    ing:[{n:'Bissap rouge',a:12,u:'g'},{n:'Gingembre frais',a:12,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'Les anthocyanes du bissap rouge sont reconnus cliniquement pour leurs propriétés antioxydantes et anti-hypertensives. Le gingembre est anti-inflammatoire documenté. Le citron complète. Aide à maintenir les défenses naturelles.' },

  { id:'I05', cat:'immunite', name:'Goyave + Pamplemousse + Gingembre',
    base:{n:'Eau',a:180,u:'ml'},
    ing:[{n:'Goyave',a:100,u:'g'},{n:'Pamplemousse',a:0.5,u:'unité'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'Double vitamine C — goyave et pamplemousse dans le même registre orange-rose. Le gingembre favorise la circulation. Un mélange fruité qui contribue à maintenir les défenses naturelles de l\'organisme.' },

  { id:'I06', cat:'immunite', name:'Pomme de cajou + Orange Casamance + Gingembre',
    base:{n:'Eau',a:180,u:'ml'},
    ing:[{n:'Pomme de cajou',a:100,u:'g'},{n:'Orange Casamance',a:1,u:'unité'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'La pomme de cajou — fruit oublié du Sénégal — contient 147 mg de vitamine C. L\'orange de Casamance 53 mg. Ensemble, un mélange local riche en vitamine C naturelle qui soutient les défenses.' },

  { id:'I07', cat:'immunite', name:'Bouye + Bissap rouge + Citron',
    base:{n:'Eau',a:250,u:'ml'},
    ing:[{n:'Bouye',a:20,u:'g'},{n:'Bissap rouge',a:12,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'Le bouye et le bissap rouge sont deux superaliments de l\'Afrique de l\'Ouest reconnus pour leurs propriétés antioxydantes. Le citron facilite l\'absorption. Un mélange rouge-bordeaux qui aide à maintenir les défenses naturelles.' },

  { id:'I08', cat:'immunite', name:'Moringa + Citron + Gingembre',
    base:{n:'Eau',a:220,u:'ml'},
    ing:[{n:'Moringa',a:4,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Gingembre frais',a:12,u:'g'}],
    note:'Le moringa (nebeday) est une source naturelle de fer, calcium et protéines végétales — 4 fois plus de calcium que le lait. Le citron favorise l\'absorption du fer. Contribue à réduire la fatigue et maintenir les défenses naturelles.' },

  { id:'I09', cat:'immunite', name:'Bouye + Carotte + Curcuma + Poivre noir',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Bouye',a:20,u:'g'},{n:'Carotte',a:100,u:'g'},{n:'Curcuma',a:4,u:'g'},{n:'Poivre noir',a:1,u:'pincée'}],
    note:'Le curcuma est l\'anti-inflammatoire naturel le plus étudié — sa curcumine voit son absorption multipliée par 20 avec le poivre noir (pipérine). Le bouye et la carotte apportent les vitamines. Un mélange chaud et protecteur.' },

  { id:'I10', cat:'immunite', name:'Ditax + Concombre + Citron vert + Menthe',
    base:{n:'Eau',a:180,u:'ml'},
    ing:[{n:'Ditax',a:80,u:'g'},{n:'Concombre',a:80,u:'g'},{n:'Citron vert',a:1,u:'unité'},{n:'Menthe fraîche',a:6,u:'feuilles'}],
    note:'La vitamine C exceptionnelle du ditax associée à l\'hydratation du concombre et à la fraîcheur de la menthe. Le citron vert potentialise l\'absorption. Un mélange vert qui aide à maintenir les défenses et hydrate l\'organisme.' },

  { id:'I11', cat:'immunite', name:'Bissap rouge + Grenade + Citron',
    base:{n:'Eau',a:220,u:'ml'},
    ing:[{n:'Bissap rouge',a:12,u:'g'},{n:'Grenade',a:80,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'La grenade est l\'un des fruits les plus riches en polyphénols. Les anthocyanes du bissap rouge complètent. Le citron apporte la vitamine C. Un mélange rouge profond reconnu pour ses propriétés antioxydantes et pour maintenir les défenses.' },

  { id:'I12', cat:'immunite', name:'Pamplemousse + Citron + Gingembre + Miel de mangrove',
    base:{n:'Eau',a:180,u:'ml'},
    ing:[{n:'Pamplemousse',a:0.5,u:'unité'},{n:'Citron',a:0.5,u:'unité'},{n:'Gingembre frais',a:12,u:'g'},{n:'Miel de mangrove',a:15,u:'ml'}],
    note:'Le miel de mangrove, spécialité de Casamance, est reconnu pour ses propriétés antibactériennes. Le pamplemousse et le citron apportent la vitamine C. Le gingembre favorise la circulation. Aide à maintenir les défenses naturelles.' },

  { id:'I13', cat:'immunite', name:'Nguer + Orange Casamance + Gingembre',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Nguer (marula)',a:80,u:'g'},{n:'Orange Casamance',a:1,u:'unité'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'Le nguer est riche en vitamine C (180 mg/100 g) et acides gras essentiels. L\'orange de Casamance apporte une touche locale. Le gingembre soutient la circulation. Un mélange orange qui aide à maintenir les défenses naturelles.' },

  { id:'I14', cat:'immunite', name:'Bouye + Pamplemousse + Gingembre séché',
    base:{n:'Eau',a:220,u:'ml'},
    ing:[{n:'Bouye',a:20,u:'g'},{n:'Pamplemousse',a:1,u:'unité'},{n:'Gingembre séché',a:0.5,u:'c.à.c'}],
    note:'Le gingembre séché est plus concentré que le frais — ½ c.à.c équivaut à environ 5 g de frais. Le bouye et le pamplemousse apportent la vitamine C. Contribue à réduire la fatigue et maintenir les défenses naturelles.' },

  { id:'I15', cat:'immunite', name:'Bissap rouge + Bissap blanc + Citron',
    base:{n:'Eau',a:250,u:'ml'},
    ing:[{n:'Bissap rouge',a:8,u:'g'},{n:'Bissap blanc',a:6,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'La rencontre du bissap rouge acidulé et du bissap blanc floral — deux variétés de Hibiscus sabdariffa aux profils complémentaires. Le rouge apporte les anthocyanes, le blanc la douceur. Reconnu pour ses propriétés antioxydantes et diurétiques.' },

  { id:'I16', cat:'immunite', name:'Bouye + Curcuma + Poivre noir + Citron',
    base:{n:'Eau',a:250,u:'ml'},
    ing:[{n:'Bouye',a:20,u:'g'},{n:'Curcuma',a:4,u:'g'},{n:'Poivre noir',a:1,u:'pincée'},{n:'Citron',a:0.5,u:'unité'}],
    note:'La curcumine du curcuma est traditionnellement anti-inflammatoire — le poivre noir multiplie son absorption par 20 grâce à la pipérine. Le bouye apporte la vitamine C. Le citron potentialise l\'ensemble. Un mélange chaud et protecteur.' },

  // ──────────────── 🌱 DIGESTION (G01 – G16) ────────────────
  { id:'G01', cat:'digestion', name:'Papaye + Citron + Gingembre',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Papaye',a:150,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'La papaïne de la papaye est une enzyme digestive naturelle puissante. Le gingembre est reconnu pour réduire les nausées et faciliter la digestion. Le citron soutient l\'ensemble. Aide à la digestion et contribue à réduire les ballonnements.' },

  { id:'G02', cat:'digestion', name:'Papaye verte + Citron + Menthe',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Papaye verte',a:150,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Menthe fraîche',a:8,u:'feuilles'}],
    note:'La papaye verte contient plus de papaïne que la mûre — son action digestive est plus concentrée. La menthe est anti-spasmodique et apaisante pour les intestins. Le citron facilite la digestion. Source naturelle d\'enzymes digestives.' },

  { id:'G03', cat:'digestion', name:'Tamarin + Gingembre + Citron',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Tamarin (pâte)',a:30,u:'g'},{n:'Gingembre frais',a:10,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'Le tamarin (dakhar) est utilisé depuis des siècles en médecine traditionnelle sénégalaise pour ses propriétés digestives. Riche en magnésium (92 mg/100 g) et potassium. Favorise le transit naturel. Dose max : 40 g — effet laxatif fort si excès.' },

  { id:'G04', cat:'digestion', name:'Ananas + Citron vert + Gingembre',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Ananas',a:150,u:'g'},{n:'Citron vert',a:1,u:'unité'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'La bromélaïne de l\'ananas aide à la digestion des protéines — enzyme naturelle reconnue. Le gingembre réduit les ballonnements. Le citron vert apporte la fraîcheur. Aide à la digestion et contribue à réduire les ballonnements.' },

  { id:'G05', cat:'digestion', name:'Gombo + Citron + Gingembre',
    base:{n:'Eau',a:220,u:'ml'},
    ing:[{n:'Gombo',a:60,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'Le gombo est riche en mucilage — substance naturelle apaisante pour les parois de l\'intestin. Très présent dans la cuisine sénégalaise. Source naturelle de mucilage apaisant qui contribue au confort digestif.' },

  { id:'G06', cat:'digestion', name:'Ananas + Papaye + Citron vert',
    base:{n:'Eau',a:180,u:'ml'},
    ing:[{n:'Ananas',a:100,u:'g'},{n:'Papaye',a:100,u:'g'},{n:'Citron vert',a:1,u:'unité'}],
    note:'Double source d\'enzymes digestives — bromélaïne (ananas) et papaïne (papaye). Le citron vert équilibre l\'acidité. Un mélange orange tropical qui aide à la digestion et contribue à réduire les ballonnements de façon naturelle.' },

  { id:'G07', cat:'digestion', name:'Tamarin doux + Citron + Cannelle',
    base:{n:'Eau',a:220,u:'ml'},
    ing:[{n:'Tamarin doux',a:35,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Cannelle',a:0.5,u:'c.à.c'}],
    note:'Le tamarin doux est la variété moins acide du dakhar — plus agréable en smoothie. La cannelle est reconnue pour ses propriétés digestives et son action sur la glycémie. Favorise le transit naturel et aide au confort intestinal.' },

  { id:'G08', cat:'digestion', name:'Gombo + Céleri + Citron + Menthe',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Gombo',a:60,u:'g'},{n:'Céleri',a:40,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Menthe fraîche',a:6,u:'feuilles'}],
    note:'Le gombo apporte le mucilage, le céleri le drainage, la menthe l\'apaisement intestinal. Le citron facilite l\'ensemble. Contribue à hydrater l\'organisme et favorise le drainage naturel.' },

  { id:'G09', cat:'digestion', name:'Papaye + Gingembre + Cardamome',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Papaye',a:150,u:'g'},{n:'Gingembre frais',a:10,u:'g'},{n:'Cardamome',a:2,u:'gousses'}],
    note:'La papaïne de la papaye associée au gingembre anti-nausée. La cardamome — épice emblématique du café Touba — est traditionnellement reconnue pour ses propriétés digestives et carminatives. Aide à la digestion et réduit les ballonnements.' },

  { id:'G10', cat:'digestion', name:'Gombo + Concombre + Citron',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Gombo',a:60,u:'g'},{n:'Concombre',a:100,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'Le gombo avec son mucilage apaisant et le concombre ultra-hydratant. Le citron apporte la vitamine C et facilite la digestion. Simple et efficace pour le confort digestif.' },

  { id:'G11', cat:'digestion', name:'Ananas + Citron + Gingembre séché',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Ananas',a:150,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Gingembre séché',a:0.5,u:'c.à.c'}],
    note:'Le gingembre séché plus concentré que le frais — son action sur les ballonnements et la digestion est bien documentée. La bromélaïne de l\'ananas aide à la digestion des protéines. Contribue à réduire les ballonnements.' },

  { id:'G12', cat:'digestion', name:'Tamarin doux + Gingembre',
    base:{n:'Eau de coco',a:220,u:'ml'},
    ing:[{n:'Tamarin doux',a:35,u:'g'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'Le tamarin doux avec l\'eau de coco qui apporte les électrolytes naturels — potassium, magnésium. Le gingembre soutient la digestion. Favorise le transit naturel et source naturelle d\'électrolytes.' },

  { id:'G13', cat:'digestion', name:'Ananas + Cardamome',
    base:{n:'Eau de coco',a:220,u:'ml'},
    ing:[{n:'Ananas',a:150,u:'g'},{n:'Cardamome',a:2,u:'gousses'}],
    note:'La bromélaïne de l\'ananas aide à digérer. La cardamome apporte une note chaude et épicée reconnue pour ses vertus digestives. L\'eau de coco ajoute les électrolytes. Simple, tropical, efficace pour le confort digestif.' },

  { id:'G14', cat:'digestion', name:'Gombo + Moringa + Citron',
    base:{n:'Eau',a:220,u:'ml'},
    ing:[{n:'Gombo',a:60,u:'g'},{n:'Moringa',a:4,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'Le gombo apporte le mucilage apaisant, le moringa (nebeday) le fer et le calcium. Le citron favorise l\'absorption du fer non-héminique. Source naturelle de mucilage apaisant et de fer — aide à la digestion.' },

  { id:'G15', cat:'digestion', name:'Ananas + Gingembre + Vanille',
    base:{n:'Eau de coco',a:200,u:'ml'},
    ing:[{n:'Ananas',a:150,u:'g'},{n:'Gingembre frais',a:10,u:'g'},{n:'Vanille',a:0.5,u:'gousse'}],
    note:'La vanille apporte une douceur apaisante naturelle et est reconnue pour son léger effet anti-spasmodique. L\'ananas et le gingembre forment le duo digestif. Un mélange réconfortant qui contribue au bien-être digestif.' },

  { id:'G16', cat:'digestion', name:'Ananas + Gingembre',
    base:{n:'Lait de coco',a:200,u:'ml'},
    ing:[{n:'Ananas',a:150,u:'g'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'Le lait de coco apporte des graisses saines et une texture crémeuse. L\'ananas et le gingembre forment le cœur digestif. Source naturelle d\'enzymes digestives — contribue à réduire les ballonnements et favorise le confort digestif.' },

  // ──────────────── ✨ BEAUTÉ (B01 – B16) ────────────────
  { id:'B01', cat:'beaute', name:'Bouye + Bissap rouge + Citron',
    base:{n:'Eau',a:230,u:'ml'},
    ing:[{n:'Bouye',a:20,u:'g'},{n:'Bissap rouge',a:12,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'Le bouye apporte la vitamine C nécessaire à la synthèse naturelle du collagène. Le bissap rouge et ses anthocyanes sont reconnus pour leurs propriétés antioxydantes. Contribue à l\'éclat naturel de la peau.' },

  { id:'B02', cat:'beaute', name:'Carotte + Orange Casamance + Gingembre',
    base:{n:'Eau',a:180,u:'ml'},
    ing:[{n:'Carotte',a:120,u:'g'},{n:'Orange Casamance',a:1,u:'unité'},{n:'Gingembre frais',a:10,u:'g'}],
    note:'Le bêta-carotène de la carotte contribue à maintenir un teint lumineux — il est transformé en vitamine A par l\'organisme. L\'orange de Casamance apporte la vitamine C locale. Source naturelle de bêta-carotène qui contribue à l\'éclat du teint.' },

  { id:'B03', cat:'beaute', name:'Bissap rouge + Grenade + Citron',
    base:{n:'Eau',a:220,u:'ml'},
    ing:[{n:'Bissap rouge',a:12,u:'g'},{n:'Grenade',a:80,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'La grenade est l\'une des sources les plus concentrées en polyphénols. Les anthocyanes du bissap rouge complètent. Source naturelle de polyphénols et propriétés antioxydantes reconnues qui contribuent à l\'éclat naturel de la peau.' },

  { id:'B04', cat:'beaute', name:'Maad + Citron + Eau de rose',
    base:{n:'Eau',a:180,u:'ml'},
    ing:[{n:'Maad',a:80,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Eau de rose',a:30,u:'ml'}],
    note:'Le maad est riche en polyphénols rares pratiquement introuvables hors d\'Afrique de l\'Ouest. La vitamine C contribue à la synthèse du collagène. L\'eau de rose est traditionnellement utilisée pour la beauté et l\'hydratation de la peau.' },

  { id:'B05', cat:'beaute', name:'Carotte + Mangue + Cardamome',
    base:{n:'Eau',a:180,u:'ml'},
    ing:[{n:'Carotte',a:100,u:'g'},{n:'Mangue',a:120,u:'g'},{n:'Cardamome',a:2,u:'gousses'}],
    note:'Double bêta-carotène — carotte et mangue dans le même registre orange. La cardamome est traditionnellement reconnue pour ses propriétés tonifiantes. Source naturelle de bêta-carotène qui contribue à l\'éclat du teint.' },

  { id:'B06', cat:'beaute', name:'Bouye + Carotte + Curcuma + Poivre noir',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Bouye',a:20,u:'g'},{n:'Carotte',a:100,u:'g'},{n:'Curcuma',a:4,u:'g'},{n:'Poivre noir',a:1,u:'pincée'}],
    note:'La curcumine du curcuma est traditionnellement anti-inflammatoire — son absorption est multipliée par 20 avec le poivre noir. La vitamine C du bouye soutient la synthèse du collagène. Contribue à l\'éclat naturel de la peau.' },

  { id:'B07', cat:'beaute', name:'Bissap blanc + Fleur d\'oranger + Citron',
    base:{n:'Eau',a:230,u:'ml'},
    ing:[{n:'Bissap blanc',a:10,u:'g'},{n:'Eau de fleur d\'oranger',a:20,u:'ml'},{n:'Citron',a:0.5,u:'unité'}],
    note:'Le bissap blanc, doux et floral, associé à la fleur d\'oranger très utilisée au Sénégal. La fleur d\'oranger est traditionnellement reconnue pour ses propriétés hydratantes. Contribue à hydrater l\'organisme et est doux pour la peau.' },

  { id:'B08', cat:'beaute', name:'Maad + Bissap rouge + Citron',
    base:{n:'Eau',a:220,u:'ml'},
    ing:[{n:'Maad',a:80,u:'g'},{n:'Bissap rouge',a:12,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'Le maad sauvage du Sahel avec ses polyphénols rares, le bissap rouge avec ses anthocyanes. Le citron apporte la vitamine C. Un mélange rouge africain reconnu pour ses propriétés antioxydantes qui contribue à l\'éclat naturel.' },

  { id:'B09', cat:'beaute', name:'Carotte + Pamplemousse + Citron',
    base:{n:'Eau',a:180,u:'ml'},
    ing:[{n:'Carotte',a:120,u:'g'},{n:'Pamplemousse',a:0.5,u:'unité'},{n:'Citron',a:0.5,u:'unité'}],
    note:'Triple action bêta-carotène et vitamine C. La carotte apporte le bêta-carotène, le pamplemousse et le citron la vitamine C pour la synthèse du collagène. Source naturelle de bêta-carotène qui contribue à l\'éclat du teint.' },

  { id:'B10', cat:'beaute', name:'Bouye + Mangue + Cannelle',
    base:{n:'Eau',a:180,u:'ml'},
    ing:[{n:'Bouye',a:20,u:'g'},{n:'Mangue',a:130,u:'g'},{n:'Cannelle',a:0.5,u:'c.à.c'}],
    note:'Le bouye apporte la vitamine C, la mangue le bêta-carotène et les enzymes. La cannelle est traditionnellement reconnue pour ses propriétés tonifiantes. Contribue à l\'éclat naturel de la peau.' },

  { id:'B11', cat:'beaute', name:'Bissap rouge + Citron + Eau de rose',
    base:{n:'Eau',a:220,u:'ml'},
    ing:[{n:'Bissap rouge',a:12,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Eau de rose',a:30,u:'ml'}],
    note:'L\'eau de rose est traditionnellement utilisée pour ses propriétés apaisantes et hydratantes sur la peau. Le bissap rouge apporte ses anthocyanes antioxydants. Le citron apporte la vitamine C. Contribue à hydrater l\'organisme.' },

  { id:'B12', cat:'beaute', name:'Kaki + Orange Casamance + Cardamome',
    base:{n:'Eau',a:180,u:'ml'},
    ing:[{n:'Kaki',a:120,u:'g'},{n:'Orange Casamance',a:1,u:'unité'},{n:'Cardamome',a:2,u:'gousses'}],
    note:'Le kaki est riche en bêta-carotène et antioxydants. L\'orange de Casamance apporte la vitamine C locale. La cardamome complète avec sa note chaude. Source naturelle de bêta-carotène qui contribue à l\'éclat du teint.' },

  { id:'B13', cat:'beaute', name:'Carotte + Gingembre + Curcuma + Poivre noir',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Carotte',a:120,u:'g'},{n:'Gingembre frais',a:10,u:'g'},{n:'Curcuma',a:4,u:'g'},{n:'Poivre noir',a:1,u:'pincée'}],
    note:'La carotte et le curcuma partagent le même registre orange chaud. La curcumine est anti-inflammatoire avec le poivre noir qui multiplie son absorption. Source naturelle de bêta-carotène qui contribue à l\'éclat du teint.' },

  { id:'B14', cat:'beaute', name:'Bissap rouge + Grenade + Eau de rose',
    base:{n:'Eau',a:220,u:'ml'},
    ing:[{n:'Bissap rouge',a:12,u:'g'},{n:'Grenade',a:80,u:'g'},{n:'Eau de rose',a:30,u:'ml'}],
    note:'La grenade et le bissap rouge — deux des sources les plus concentrées en polyphénols. L\'eau de rose apporte l\'hydratation traditionnelle. Un mélange rouge profond reconnu pour ses propriétés antioxydantes — contribue à la beauté naturelle.' },

  { id:'B15', cat:'beaute', name:'Maad + Orange Casamance + Fleur d\'oranger',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Maad',a:80,u:'g'},{n:'Orange Casamance',a:1,u:'unité'},{n:'Eau de fleur d\'oranger',a:20,u:'ml'}],
    note:'Le maad africain, l\'orange locale et la fleur d\'oranger — trois ingrédients du terroir sénégalais. Le maad apporte la vitamine C, l\'orange complète, la fleur d\'oranger parfume et hydrate. Contribue à l\'éclat naturel de la peau.' },

  { id:'B16', cat:'beaute', name:'Bouye + Bissap blanc + Citron + Eau de rose',
    base:{n:'Eau',a:220,u:'ml'},
    ing:[{n:'Bouye',a:20,u:'g'},{n:'Bissap blanc',a:10,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Eau de rose',a:20,u:'ml'}],
    note:'Le bouye apporte la vitamine C, le bissap blanc la douceur florale, l\'eau de rose l\'hydratation traditionnelle. Un mélange délicat, doux et lumineux qui contribue à hydrater l\'organisme et à l\'éclat naturel.' },

  // ──────────────── 😌 ANTI-STRESS (S01 – S16) ────────────────
  { id:'S01', cat:'stress', name:'Corossol + Citron + Fleur d\'oranger',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Corossol',a:110,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Eau de fleur d\'oranger',a:20,u:'ml'}],
    note:'Le corossol, très présent en Casamance, est traditionnellement reconnu pour ses propriétés apaisantes. La fleur d\'oranger est bien connue au Sénégal pour son effet calmant naturel. Reconnu pour ses propriétés apaisantes — aide à la détente naturelle.' },

  { id:'S02', cat:'stress', name:'Jujube + Cannelle',
    base:{n:'Eau',a:280,u:'ml'},
    ing:[{n:'Jujube',a:90,u:'g'},{n:'Cannelle',a:0.5,u:'c.à.c'}],
    note:'Le jujube (sidem), très présent dans la zone nord du Sénégal, est traditionnellement reconnu pour favoriser le sommeil et calmer le système nerveux. La cannelle apporte une note chaude et réconfortante. Aide au confort nerveux.' },

  { id:'S03', cat:'stress', name:'Bissap blanc + Citron + Fleur d\'oranger',
    base:{n:'Eau',a:250,u:'ml'},
    ing:[{n:'Bissap blanc',a:10,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Eau de fleur d\'oranger',a:20,u:'ml'}],
    note:'Le bissap blanc, plus doux que le rouge, a un profil floral et délicat. La fleur d\'oranger est utilisée traditionnellement en Afrique de l\'Ouest pour ses propriétés apaisantes. Traditionnellement apaisant — aide à la détente naturelle.' },

  { id:'S04', cat:'stress', name:'Banane + Cardamome',
    base:{n:'Lait d\'amande',a:220,u:'ml'},
    ing:[{n:'Banane',a:1,u:'unité (120 g)'},{n:'Cardamome',a:2,u:'gousses'}],
    note:'La banane est une source naturelle de magnésium (27 mg/100 g) et de tryptophane — précurseur de la sérotonine. La cardamome est reconnue pour ses propriétés digestives et légèrement sédatives. Source naturelle de magnésium — contribue au bien-être.' },

  { id:'S05', cat:'stress', name:'Corossol + Bissap blanc + Citron',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Corossol',a:110,u:'g'},{n:'Bissap blanc',a:10,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'Le corossol et le bissap blanc partagent un profil doux et floral. Le corossol est traditionnellement reconnu pour ses propriétés apaisantes en Casamance. Le citron équilibre. Reconnu pour ses propriétés apaisantes et contribue au bien-être.' },

  { id:'S06', cat:'stress', name:'Jujube + Orange Casamance + Fleur d\'oranger',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Jujube',a:90,u:'g'},{n:'Orange Casamance',a:1,u:'unité'},{n:'Eau de fleur d\'oranger',a:20,u:'ml'}],
    note:'Le jujube traditionnellement reconnu pour favoriser le sommeil, associé à l\'orange locale douce et à la fleur d\'oranger apaisante. Un mélange orange réconfortant qui aide à la détente naturelle.' },

  { id:'S07', cat:'stress', name:'Banane + Dattes + Cannelle',
    base:{n:'Lait d\'amande',a:200,u:'ml'},
    ing:[{n:'Banane',a:1,u:'unité'},{n:'Dattes',a:3,u:'unités (40 g)'},{n:'Cannelle',a:0.5,u:'c.à.c'}],
    note:'La banane et les dattes apportent le magnésium naturel et l\'énergie douce. Les dattes, très présentes dans la zone nord du Sénégal, sont un sucrant naturel riche en minéraux. La cannelle réchauffe. Source naturelle de magnésium.' },

  { id:'S08', cat:'stress', name:'Bissap blanc + Bissap rouge + Citron + Eau de rose',
    base:{n:'Eau',a:230,u:'ml'},
    ing:[{n:'Bissap blanc',a:8,u:'g'},{n:'Bissap rouge',a:6,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Eau de rose',a:20,u:'ml'}],
    note:'La rencontre du bissap rouge (tonique) et du bissap blanc (apaisant) — deux profils complémentaires. L\'eau de rose apporte la détente traditionnelle. Traditionnellement apaisant — aide à la détente naturelle.' },

  { id:'S09', cat:'stress', name:'Corossol + Vanille',
    base:{n:'Lait d\'amande',a:220,u:'ml'},
    ing:[{n:'Corossol',a:110,u:'g'},{n:'Vanille',a:0.5,u:'gousse'}],
    note:'La vanille est reconnue pour ses propriétés légèrement sédatives et anti-stress naturelles. Le corossol apporte ses vertus apaisantes de Casamance. Le lait d\'amande complète avec le magnésium. Reconnu pour ses propriétés apaisantes.' },

  { id:'S10', cat:'stress', name:'Jujube + Dattes + Cardamome',
    base:{n:'Eau',a:250,u:'ml'},
    ing:[{n:'Jujube',a:90,u:'g'},{n:'Dattes',a:3,u:'unités'},{n:'Cardamome',a:2,u:'gousses'}],
    note:'Trio doux et réconfortant du nord Sénégal. Le jujube pour le sommeil, les dattes pour les minéraux, la cardamome pour sa note chaude digestive. Reconnu pour favoriser le sommeil et réconforter naturellement.' },

  { id:'S11', cat:'stress', name:'Banane + Corossol + Fleur d\'oranger',
    base:{n:'Eau',a:180,u:'ml'},
    ing:[{n:'Banane',a:1,u:'unité'},{n:'Corossol',a:100,u:'g'},{n:'Eau de fleur d\'oranger',a:20,u:'ml'}],
    note:'La banane apporte le magnésium et le tryptophane, le corossol ses propriétés apaisantes, la fleur d\'oranger sa note calmante traditionnelle. Source naturelle de magnésium — contribue au bien-être.' },

  { id:'S12', cat:'stress', name:'Bissap blanc + Citronnelle + Citron',
    base:{n:'Eau',a:250,u:'ml'},
    ing:[{n:'Bissap blanc',a:10,u:'g'},{n:'Citronnelle',a:1,u:'tige'},{n:'Citron',a:0.5,u:'unité'}],
    note:'La citronnelle est très présente en Afrique de l\'Ouest et reconnue traditionnellement pour ses propriétés apaisantes et digestives. Le bissap blanc apporte la douceur florale. Traditionnellement apaisant — aide à la détente naturelle.' },

  { id:'S13', cat:'stress', name:'Corossol + Citron + Cardamome',
    base:{n:'Eau',a:200,u:'ml'},
    ing:[{n:'Corossol',a:110,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Cardamome',a:2,u:'gousses'}],
    note:'Le corossol apaisant de Casamance, le citron pour l\'équilibre, la cardamome pour sa note chaude traditionnelle. Reconnu pour ses propriétés apaisantes et contribue au bien-être naturel.' },

  { id:'S14', cat:'stress', name:'Banane + Cannelle',
    base:{n:'Lait d\'amande',a:240,u:'ml'},
    ing:[{n:'Banane',a:1,u:'unité'},{n:'Cannelle',a:0.5,u:'c.à.c'}],
    note:'Le plus simple des mélanges anti-stress. La banane apporte le magnésium et le tryptophane. La cannelle réchauffe et est traditionnellement reconnue pour ses propriétés réconfortantes. Source naturelle de magnésium.' },

  { id:'S15', cat:'stress', name:'Jujube + Bissap blanc + Citron',
    base:{n:'Eau',a:230,u:'ml'},
    ing:[{n:'Jujube',a:90,u:'g'},{n:'Bissap blanc',a:10,u:'g'},{n:'Citron',a:0.5,u:'unité'}],
    note:'Le jujube traditionnellement reconnu pour favoriser le sommeil associé au bissap blanc floral. Le citron équilibre l\'acidité. Un mélange délicat rouge-blanc qui aide à la détente naturelle.' },

  { id:'S16', cat:'stress', name:'Corossol + Bissap rouge + Citron + Eau de rose',
    base:{n:'Eau',a:220,u:'ml'},
    ing:[{n:'Corossol',a:100,u:'g'},{n:'Bissap rouge',a:12,u:'g'},{n:'Citron',a:0.5,u:'unité'},{n:'Eau de rose',a:20,u:'ml'}],
    note:'Le corossol apaisant avec le bissap rouge antioxydant et l\'eau de rose traditionnellement hydratante. Le citron complète. Reconnu pour ses propriétés antioxydantes et apaisantes — contribue au bien-être.' },
];

// ══════════════════════════════════════════════════════════
//  4.  SÉCURITÉ — module isolé
//      Production: remplacer par JWT + bcrypt + serveur
// ══════════════════════════════════════════════════════════
const SECURITY = {
  // Hash simple pour démo — ne JAMAIS utiliser en prod
  ADMIN_HASH: btoa(encodeURIComponent('Cadeya@2026!')),
  MAX_ATTEMPTS: 3,
  LOCK_DURATION_MS: 30_000,

  verify(input) {
    // Sanitisation d'abord
    const clean = this.sanitize(input);
    return btoa(encodeURIComponent(clean)) === this.ADMIN_HASH;
  },

  sanitize(str) {
    if (typeof str !== 'string') return '';
    // Supprime les caractères dangereux, max 128 chars
    return str.replace(/[<>"'&;`\\]/g, '').substring(0, 128);
  },

  sanitizeDisplay(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .substring(0, 512);
  }
};

// ══════════════════════════════════════════════════════════
//  5.  UTILITAIRES MÉTIER
// ══════════════════════════════════════════════════════════

/** Fisher-Yates shuffle — complexité O(n) */
function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Arrondi intelligent conforme cahier des charges */
function fmtQty(amount, persons) {
  if (!amount || !persons) return '0';
  const total = amount * persons;
  // Arrondi au plus proche 0.5
  const rounded = Math.round(total * 2) / 2;
  const intPart = Math.floor(rounded);
  const fracPart = Math.round((rounded - intPart) * 10) / 10;

  if (Math.abs(fracPart) < 0.05) return String(intPart);
  if (Math.abs(fracPart - 0.5) < 0.05) {
    return intPart > 0 ? `${intPart}½` : '½';
  }
  // Fallback: 1 décimale
  return String(Math.round(total * 10) / 10);
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

// ══════════════════════════════════════════════════════════
//  6.  EXPORT PDF — fiche imprimable professionnelle
// ══════════════════════════════════════════════════════════
function exportPDF(blend, persons) {
  const catCfg = CATS[blend.cat];
  const date = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });

  const LOGO_SVG = `<svg width="110" height="46" viewBox="0 0 240 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="22,50 48,6 192,6 218,50 192,94 48,94" fill="#C97B2E"/>
    <polygon points="34,50 56,18 184,18 206,50 184,82 56,82" fill="#2C1A0E"/>
    <rect x="56" y="28" width="36" height="8" fill="#C97B2E" rx="2"/>
    <rect x="56" y="46" width="36" height="8" fill="#C97B2E" rx="2"/>
    <rect x="56" y="64" width="36" height="8" fill="#C97B2E" rx="2"/>
    <rect x="52" y="24" width="8" height="52" fill="#C97B2E" rx="2"/>
    <polygon points="120,32 138,50 120,68 102,50" fill="#C97B2E"/>
    <rect x="148" y="28" width="36" height="8" fill="#C97B2E" rx="2"/>
    <rect x="148" y="46" width="36" height="8" fill="#C97B2E" rx="2"/>
    <rect x="148" y="64" width="36" height="8" fill="#C97B2E" rx="2"/>
    <rect x="180" y="24" width="8" height="52" fill="#C97B2E" rx="2"/>
  </svg>`;

  const ingRows = [
    { n: `${blend.base.n} (base)`, a: blend.base.a, u: blend.base.u, isBase: true },
    ...blend.ing
  ].map(i => `
    <tr class="${i.isBase ? 'base-row' : ''}">
      <td>${i.n}</td>
      <td class="qty"><strong>${fmtQty(i.a, persons)}</strong> ${i.u}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Cadeya Smoothies · ${blend.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@300;400;600&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'DM Sans',Georgia,sans-serif;color:#2C1A0E;background:#FDF8F3;padding:32px;max-width:640px;margin:0 auto}
    .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid #C97B2E;margin-bottom:28px}
    .brand{text-align:right}
    .brand-name{font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:5px;color:#2C1A0E}
    .brand-sub{font-size:10px;color:#C97B2E;letter-spacing:4px;margin-top:2px}
    .badge{display:inline-block;background:#C97B2E;color:#FDF8F3;padding:4px 14px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px}
    h1{font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;font-weight:700;color:#2C1A0E;line-height:1.2;margin-bottom:6px}
    .subtitle{font-size:13px;color:#A07850;margin-bottom:28px}
    table{width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:8px;overflow:hidden}
    thead th{background:#2C1A0E;color:#FDF8F3;padding:11px 16px;text-align:left;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:600}
    tbody td{padding:11px 16px;border-bottom:1px solid rgba(201,123,46,0.15);font-size:14px}
    tbody tr:last-child td{border-bottom:none}
    tbody tr:nth-child(even) td{background:rgba(201,123,46,0.04)}
    .base-row td{color:#A07850;font-style:italic}
    .qty{text-align:right;color:#2C1A0E;font-weight:500}
    .benefits{background:rgba(201,123,46,0.07);border-left:4px solid #C97B2E;padding:18px 20px;border-radius:0 10px 10px 0;margin-bottom:28px}
    .benefits-label{font-size:10px;color:#C97B2E;letter-spacing:2.5px;text-transform:uppercase;font-weight:700;margin-bottom:10px}
    .benefits-text{font-size:14px;line-height:1.85;color:#3D200A}
    .footer{display:flex;align-items:center;justify-content:space-between;padding-top:20px;border-top:1px solid rgba(201,123,46,0.25);font-size:11px;color:#A07850}
    .ia-mention{color:#C97B2E;font-style:italic;font-weight:600}
    .warning{font-size:11px;color:#A07850;text-align:center;margin-top:16px;font-style:italic;padding:10px;border-top:1px dashed rgba(201,123,46,0.3)}
    @media print{
      body{padding:15px}
      .no-print{display:none}
      @page{margin:1.5cm;size:A4}
    }
  </style>
</head>
<body>
  <div class="header">
    ${LOGO_SVG}
    <div class="brand">
      <div class="brand-name">CADEYA</div>
      <div class="brand-sub">SMOOTHIES</div>
    </div>
  </div>

  <div class="badge">${catCfg.emoji} ${catCfg.label} &nbsp;·&nbsp; ${blend.id}</div>
  <h1>${blend.name}</h1>
  <p class="subtitle">Pour <strong>${persons} personne${persons > 1 ? 's' : ''}</strong> &nbsp;·&nbsp; Préparé le ${date}</p>

  <table>
    <thead><tr><th>Ingrédient</th><th style="text-align:right">Quantité</th></tr></thead>
    <tbody>${ingRows}</tbody>
  </table>

  <div class="benefits">
    <div class="benefits-label">✦ Bienfaits</div>
    <p class="benefits-text">${blend.note}</p>
  </div>

  <div class="footer">
    <span class="ia-mention">Généré par IA · Cadeya Smoothies</span>
    <span>© 2026 Cadeya Smoothies · TransTech Solution</span>
  </div>

  <p class="warning">Ces informations sont données à titre indicatif. Elles ne constituent pas un avis médical. Consultez un professionnel de santé en cas de doute.</p>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => window.print(), 600);
    });
  ${'<'}/script>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=700,height=900');
  if (!w) {
    alert('Veuillez autoriser les pop-ups pour générer le PDF.');
    return;
  }
  w.document.write(html);
  w.document.close();
}

// ══════════════════════════════════════════════════════════
//  7.  COMPOSANT LOGO CADEYA
// ══════════════════════════════════════════════════════════
function CadeyaLogo({ size = 44, variant = 'color' }) {
  // variant: 'color' | 'white' | 'mono'
  const oc = variant === 'white' ? '#FFFFFF' : T.orange;
  const dc = variant === 'white' ? 'rgba(255,255,255,0.18)' : T.brown;
  const w  = Math.round(size * 2.4);
  const h  = size;

  return (
    <svg width={w} height={h} viewBox="0 0 240 100" fill="none" aria-label="Logo Cadeya" role="img">
      {/* Chevron extérieur orange */}
      <polygon points="22,50 48,6 192,6 218,50 192,94 48,94" fill={oc}/>
      {/* Cadre intérieur brun */}
      <polygon points="34,50 56,18 184,18 206,50 184,82 56,82" fill={dc}/>
      {/* Bracket gauche */}
      <rect x="56" y="28" width="38" height="9" fill={oc} rx="2"/>
      <rect x="56" y="45" width="38" height="9" fill={oc} rx="2"/>
      <rect x="56" y="63" width="38" height="9" fill={oc} rx="2"/>
      <rect x="51" y="24" width="9" height="52" fill={oc} rx="2"/>
      {/* Diamant central */}
      <polygon points="120,32 140,50 120,68 100,50" fill={oc}/>
      {/* Bracket droit (miroir) */}
      <rect x="146" y="28" width="38" height="9" fill={oc} rx="2"/>
      <rect x="146" y="45" width="38" height="9" fill={oc} rx="2"/>
      <rect x="146" y="63" width="38" height="9" fill={oc} rx="2"/>
      <rect x="180" y="24" width="9" height="52" fill={oc} rx="2"/>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════
//  8.  COMPOSANTS PARTAGÉS
// ══════════════════════════════════════════════════════════

/** Header fixe — présent sur toutes les pages */
function AppHeader({ onHome, onHistory, onAdmin, historyCount }) {
  return (
    <header style={{
      position:'sticky', top:0, zIndex:100,
      background:T.brown, height:60,
      display:'flex', alignItems:'center',
      padding:'0 16px', justifyContent:'space-between',
      boxShadow:'0 2px 20px rgba(0,0,0,0.35)',
      borderBottom:`2px solid ${T.orange}`,
    }}>
      {/* Logo + nom */}
      <button onClick={onHome} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:10, padding:0 }} aria-label="Accueil">
        <CadeyaLogo size={32} variant="white"/>
        <div>
          <div style={{ fontFamily:'Cormorant Garamond, Georgia, serif', fontSize:17, fontWeight:700, color:T.cream, letterSpacing:'0.12em', lineHeight:1 }}>CADEYA</div>
          <div style={{ fontSize:9, color:T.orange, letterSpacing:'0.22em', lineHeight:1 }}>SMOOTHIES</div>
        </div>
      </button>

      {/* Actions header */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <HeaderBtn onClick={onHistory} label={`Historique${historyCount > 0 ? ` (${historyCount})` : ''}`} icon="📋"/>
        <HeaderBtn onClick={onAdmin}   label="Admin" icon="⚙️"/>
      </div>
    </header>
  );
}

function HeaderBtn({ onClick, label, icon }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      title={label}
      style={{ background: hov ? T.orangeDim : 'transparent', border:`1px solid ${hov ? T.orange : 'rgba(201,123,46,0.3)'}`, borderRadius:8, padding:'6px 10px', color: hov ? T.orange : 'rgba(253,248,243,0.7)', fontSize:13, cursor:'pointer', transition:'all .15s', display:'flex', alignItems:'center', gap:5 }}>
      <span>{icon}</span>
      <span style={{ display:'none', fontSize:11 }} className="hdr-lbl">{label}</span>
    </button>
  );
}

/** Toast notification */
function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position:'fixed', bottom:24, right:16, zIndex:9999, display:'flex', flexDirection:'column', gap:8, maxWidth:320 }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => onDismiss(t.id)}
          style={{ background: t.type === 'error' ? '#FEF2F2' : t.type === 'success' ? '#F0FDF4' : T.cream,
            border:`1px solid ${t.type === 'error' ? '#FECACA' : t.type === 'success' ? '#BBF7D0' : T.orangeBdr}`,
            borderLeft:`4px solid ${t.type === 'error' ? T.error : t.type === 'success' ? T.success : T.orange}`,
            borderRadius:10, padding:'12px 16px', cursor:'pointer', boxShadow:T.shadow,
            animation:'toastIn 0.3s cubic-bezier(.22,1,.36,1)', fontSize:13, color:T.textDark, lineHeight:1.5 }}>
          <strong style={{ display:'block', marginBottom:2 }}>{t.type === 'error' ? '⛔' : t.type === 'success' ? '✅' : 'ℹ️'} {t.title}</strong>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  9.  ÉCRAN SPLASH
// ══════════════════════════════════════════════════════════
function SplashScreen({ onDone }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setProgress(p => {
      if (p >= 100) { clearInterval(iv); return 100; }
      return p + 2;
    }), 50);
    const t = setTimeout(onDone, 2800);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, [onDone]);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:999, background:'linear-gradient(160deg,#1A0800 0%,#2C1A0E 60%,#3D200A 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
      {/* Cercles décoratifs */}
      {[320,480,640].map((r,i) => (
        <div key={i} style={{ position:'absolute', width:r, height:r, borderRadius:'50%', border:`1px solid rgba(201,123,46,${0.06-i*0.015})`, top:'50%', left:'50%', transform:'translate(-50%,-50%)' }}/>
      ))}

      {/* Logo hero */}
      <div style={{ animation:'splashLogo 0.9s cubic-bezier(.22,1,.36,1) forwards', opacity:0, transformOrigin:'center' }}>
        <CadeyaLogo size={80} variant="color"/>
      </div>

      <div style={{ marginTop:28, textAlign:'center', animation:'splashText 0.8s 0.35s cubic-bezier(.22,1,.36,1) both', opacity:0 }}>
        <div style={{ fontFamily:'Cormorant Garamond, Georgia, serif', fontSize:44, fontWeight:700, color:T.cream, letterSpacing:'0.15em' }}>CADEYA</div>
        <div style={{ fontSize:14, color:T.orange, letterSpacing:'0.38em', marginTop:4 }}>SMOOTHIES</div>
        <div style={{ marginTop:14, color:'rgba(253,248,243,0.4)', fontSize:12, letterSpacing:'0.06em' }}>96 mélanges · Afrique de l'Ouest</div>
      </div>

      {/* Barre de chargement */}
      <div style={{ position:'absolute', bottom:40, left:'50%', transform:'translateX(-50%)', width:160 }}>
        <div style={{ width:'100%', height:2, background:'rgba(201,123,46,0.2)', borderRadius:99 }}>
          <div style={{ width:`${progress}%`, height:'100%', background:T.orange, borderRadius:99, transition:'width 0.05s linear' }}/>
        </div>
        <div style={{ textAlign:'center', marginTop:8, fontSize:10, color:'rgba(201,123,46,0.5)', letterSpacing:'0.1em' }}>Chargement…</div>
      </div>

      <div style={{ position:'absolute', bottom:14, fontSize:10, color:'rgba(201,123,46,0.3)', letterSpacing:'0.05em' }}>© 2026 Cadeya Smoothies · TransTech Solution</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  10. ÉCRAN ACCUEIL
// ══════════════════════════════════════════════════════════
function HomeScreen({ onSelect, queues, onPayment }) {
  const cats6 = Object.entries(CATS).filter(([k]) => k !== 'all');

  return (
    <div style={{ minHeight:'100vh', background:T.cream, paddingBottom:60 }}>
      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,${T.brown} 0%,${T.brownMid} 100%)`, padding:'32px 20px 28px', textAlign:'center' }}>
        {/* Logo 80px sur l'écran d'accueil — conforme cahier des charges */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}>
          <CadeyaLogo size={80} variant="color"/>
        </div>
        <h1 style={{ fontFamily:'Cormorant Garamond, Georgia, serif', fontSize:28, fontWeight:700, color:T.cream, lineHeight:1.25, marginBottom:8 }}>
          Votre smoothie<br/><em style={{ color:T.orange }}>du moment</em>
        </h1>
        <p style={{ color:'rgba(253,248,243,0.55)', fontSize:13, lineHeight:1.6 }}>
          Ingrédients locaux · Recettes validées · Généré par IA
        </p>

        {/* Stats */}
        <div style={{ display:'flex', justifyContent:'center', gap:0, marginTop:20 }}>
          {[['96','Mélanges'],['6','Catégories'],['20','Personnes max']].map(([n,l],i) => (
            <div key={i} style={{ padding:'0 18px', borderRight: i < 2 ? '1px solid rgba(201,123,46,0.25)' : 'none', textAlign:'center' }}>
              <div style={{ fontFamily:'Cormorant Garamond, Georgia, serif', fontSize:22, fontWeight:700, color:T.orange }}>{n}</div>
              <div style={{ fontSize:10, color:'rgba(253,248,243,0.5)', letterSpacing:'0.06em' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:520, margin:'0 auto', padding:'24px 16px' }}>

        {/* Card "Tout voir" — pleine largeur */}
        <CatCard
          catKey="all" cfg={CATS.all}
          remaining={null}
          onClick={() => onSelect('all')}
          wide
        />

        {/* Grille 6 catégories */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12 }}>
          {cats6.map(([key, cfg]) => {
            const total = BLENDS.filter(b => b.cat === key).length;
            const q = queues[key] || [];
            const remaining = q.length;
            return (
              <CatCard key={key} catKey={key} cfg={cfg}
                remaining={remaining} total={total}
                onClick={() => onSelect(key)}/>
            );
          })}
        </div>

        {/* Lien paiement Phase 2 */}
        <div onClick={onPayment} style={{ marginTop:24, textAlign:'center', padding:'12px', background:'rgba(201,123,46,0.06)', border:`1px dashed ${T.orangeBdr}`, borderRadius:10, cursor:'pointer' }}>
          <span style={{ fontSize:12, color:T.textLight }}>🏦 Mode démo gratuit &nbsp;·&nbsp; </span>
          <span style={{ fontSize:12, color:T.orange, fontWeight:600 }}>Voir la tarification PayDunya →</span>
        </div>

        {/* Mention IA globale bas de page */}
        <div style={{ textAlign:'center', marginTop:28, fontSize:11, color:'rgba(44,26,14,0.3)', lineHeight:1.8 }}>
          Généré par IA · Cadeya Smoothies<br/>
          Tirage Fisher-Yates · Anti-doublon session<br/>
          © 2026 Cadeya Smoothies · TransTech Solution
        </div>
      </div>
    </div>
  );
}

function CatCard({ catKey, cfg, remaining, total, onClick, wide }) {
  const [hov, setHov] = useState(false);
  const pct = total ? Math.round(((total - (remaining ?? 0)) / total) * 100) : 0;

  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        gridColumn: wide ? '1/-1' : undefined,
        background: hov ? `rgba(${hexToRgb(cfg.accent)},0.12)` : T.cream,
        border:`1px solid ${hov ? cfg.accent : 'rgba(201,123,46,0.2)'}`,
        borderRadius:T.radius, padding: wide ? '18px 22px' : '16px', cursor:'pointer',
        transition:'all .18s', boxShadow: hov ? `0 4px 20px rgba(${hexToRgb(cfg.accent)},0.15)` : 'none',
        display:'flex', flexDirection: wide ? 'row' : 'column',
        alignItems: wide ? 'center' : 'flex-start', gap: wide ? 16 : 0,
      }}>
      <span style={{ fontSize: wide ? 34 : 28, marginBottom: wide ? 0 : 8 }}>{cfg.emoji}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:'Cormorant Garamond, Georgia, serif', fontSize: wide ? 20 : 16, fontWeight:700, color:T.textDark }}>
          {cfg.label}
        </div>
        {wide
          ? <div style={{ fontSize:12, color:T.textLight, marginTop:2 }}>Tirage aléatoire parmi les 96 mélanges · anti-doublon session</div>
          : <div style={{ fontSize:11, color:cfg.accent, marginTop:4, fontWeight:600 }}>
              {total} mélanges{remaining != null && remaining < total ? ` · ${total - remaining} vus` : ''}
            </div>
        }
      </div>
      {wide && <div style={{ color:T.orange, fontSize:22, fontWeight:700 }}>→</div>}
      {/* Mini progress bar pour catégories */}
      {!wide && total && remaining != null && (
        <div style={{ width:'100%', height:2, background:'rgba(201,123,46,0.15)', borderRadius:99, marginTop:10 }}>
          <div style={{ width:`${pct}%`, height:'100%', background:cfg.accent, borderRadius:99, transition:'width .3s' }}/>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  11. ÉCRAN CARTE MÉLANGE
// ══════════════════════════════════════════════════════════
function BlendCard({ blend, persons, onPersons, onNext, onBack, onPDF, onShare, addKey }) {
  const cat = CATS[blend.cat];

  return (
    <div style={{ minHeight:'100vh', background:T.cream, paddingBottom:100 }}>
      {/* Fil d'Ariane */}
      <div style={{ background:T.cream, borderBottom:'1px solid rgba(201,123,46,0.12)', padding:'10px 16px', display:'flex', alignItems:'center', gap:8, fontSize:12, color:T.textLight }}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:T.orange, cursor:'pointer', fontSize:12, fontFamily:'inherit', padding:0 }}>← Accueil</button>
        <span>/</span>
        <span>{cat.emoji} {cat.label}</span>
        <span>/</span>
        <span style={{ color:T.textDark, fontWeight:600 }}>{blend.id}</span>
      </div>

      <div style={{ maxWidth:520, margin:'0 auto', padding:'20px 16px' }}>

        {/* CARTE */}
        <div key={addKey} style={{ background:'#FFFFFF', border:`1px solid rgba(${hexToRgb(cat.accent)},0.3)`, borderRadius:16, overflow:'hidden', boxShadow:T.shadowLg, animation:'cardSlideIn 0.45s cubic-bezier(.22,1,.36,1)' }}>

          {/* Bandeau catégorie */}
          <div style={{ background:`linear-gradient(90deg,${T.brown},rgba(44,26,14,0.92))`, padding:'16px 20px 14px', borderBottom:`2px solid ${cat.accent}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <span style={{ background:`rgba(${hexToRgb(cat.accent)},0.25)`, color:cat.accent, borderRadius:5, padding:'3px 10px', fontSize:11, fontWeight:700, letterSpacing:'0.1em' }}>{blend.id}</span>
              <span style={{ color:'rgba(253,248,243,0.45)', fontSize:11 }}>·</span>
              <span style={{ color:cat.accent, fontSize:11 }}>{cat.emoji} {cat.label}</span>
            </div>
            <h2 style={{ fontFamily:'Cormorant Garamond, Georgia, serif', fontSize:22, fontWeight:700, color:T.cream, lineHeight:1.25 }}>{blend.name}</h2>
          </div>

          {/* Compteur personnes */}
          <div style={{ background:'rgba(253,248,243,0.6)', padding:'14px 20px', borderBottom:'1px solid rgba(201,123,46,0.1)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:13, color:T.textMid, fontWeight:500 }}>Nombre de personnes</span>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <CounterBtn icon="−" onClick={() => onPersons(p => Math.max(1, p-1))} disabled={persons <= 1}/>
              <span style={{ fontFamily:'Cormorant Garamond, Georgia, serif', fontSize:24, fontWeight:700, color:T.textDark, minWidth:32, textAlign:'center' }}>{persons}</span>
              <CounterBtn icon="+" onClick={() => onPersons(p => Math.min(20, p+1))} disabled={persons >= 20}/>
            </div>
          </div>

          {/* Ingrédients */}
          <div style={{ padding:'20px 20px 0' }}>
            <div style={{ fontSize:10, color:T.textLight, letterSpacing:'0.18em', textTransform:'uppercase', fontWeight:700, marginBottom:12 }}>
              Ingrédients · Pour {persons} personne{persons > 1 ? 's' : ''}
            </div>

            {/* Base liquide */}
            <IngRow label={`${blend.base.n}`} badge="BASE" qty={fmtQty(blend.base.a, persons)} unit={blend.base.u} accent={cat.accent} isBase/>

            {/* Ingrédients */}
            {blend.ing.map((item, i) => (
              <IngRow key={i} label={item.n} qty={fmtQty(item.a, persons)} unit={item.u} accent={cat.accent} last={i === blend.ing.length - 1}/>
            ))}
          </div>

          {/* Note bienfaits */}
          <div style={{ margin:'16px 20px', background:`rgba(${hexToRgb(cat.accent)},0.07)`, border:`1px solid rgba(${hexToRgb(cat.accent)},0.2)`, borderLeft:`3px solid ${cat.accent}`, borderRadius:'0 10px 10px 0', padding:'14px 16px' }}>
            <div style={{ fontSize:10, color:cat.accent, letterSpacing:'0.18em', textTransform:'uppercase', fontWeight:700, marginBottom:8 }}>✦ Bienfaits</div>
            <p style={{ fontSize:13, color:T.textMid, lineHeight:1.75 }}>{blend.note}</p>
          </div>

          {/* Footer carte — mention IA + mini logo (20px, conforme cahier des charges) */}
          <div style={{ padding:'10px 20px 14px', borderTop:'1px solid rgba(201,123,46,0.1)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:10, color:'rgba(44,26,14,0.4)', fontStyle:'italic' }}>Généré par IA · Cadeya Smoothies</div>
              <div style={{ fontSize:9, color:'rgba(44,26,14,0.25)' }}>Langage validé · sans promesse médicale</div>
            </div>
            {/* Mini logo 20px — exigence cahier des charges */}
            <div title="Cadeya Smoothies">
              <CadeyaLogo size={20} variant="color"/>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:16 }}>
          <ActionBtn primary onClick={onNext} label="Mélange suivant →"/>
          <ActionBtn onClick={onPDF}   label="📄 Exporter PDF"/>
          <ActionBtn onClick={onShare} label="⎁ Copier recette"/>
          <ActionBtn onClick={onBack}  label="⊞ Catégories"/>
        </div>

        <div style={{ textAlign:'center', marginTop:12, fontSize:11, color:'rgba(44,26,14,0.35)' }}>
          Anti-doublon session actif · Tirage Fisher-Yates
        </div>
      </div>
    </div>
  );
}

function IngRow({ label, badge, qty, unit, accent, isBase, last }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom: last ? 'none' : '1px solid rgba(201,123,46,0.08)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:7, height:7, borderRadius:'50%', background: isBase ? 'rgba(201,123,46,0.4)' : accent, flexShrink:0 }}/>
        <span style={{ fontSize:14, color: isBase ? T.textLight : T.textDark, fontStyle: isBase ? 'italic' : 'normal' }}>{label}</span>
        {badge && <span style={{ background:`rgba(${hexToRgb(accent)},0.12)`, color:accent, fontSize:9, padding:'1px 6px', borderRadius:3, fontWeight:700, letterSpacing:'0.1em' }}>{badge}</span>}
      </div>
      <span style={{ fontFamily:'Cormorant Garamond, Georgia, serif', fontSize:18, fontWeight:700, color:T.textDark }}>
        {qty} <span style={{ fontSize:12, fontWeight:500, color:T.textLight }}>{unit}</span>
      </span>
    </div>
  );
}

function CounterBtn({ icon, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width:34, height:34, borderRadius:'50%', border:`1px solid ${disabled ? 'rgba(201,123,46,0.15)' : T.orangeBdr}`, background: disabled ? 'transparent' : T.orangeDim, color: disabled ? 'rgba(201,123,46,0.3)' : T.orange, fontSize:20, cursor: disabled ? 'default' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1, transition:'all .15s' }}>
      {icon}
    </button>
  );
}

function ActionBtn({ onClick, label, primary }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: primary ? (hov ? T.orangeHov : T.orange) : (hov ? T.orangeDim : 'transparent'), border:`1px solid ${primary ? T.orange : T.orangeBdr}`, borderRadius:10, padding:'13px 12px', color: primary ? T.cream : T.orange, fontSize:13, fontWeight: primary ? 700 : 500, cursor:'pointer', transition:'all .15s', fontFamily:'inherit', letterSpacing: primary ? '0.05em' : 0 }}>
      {label}
    </button>
  );
}

// ══════════════════════════════════════════════════════════
//  12. PANNEAU HISTORIQUE SESSION
// ══════════════════════════════════════════════════════════
function HistoryPanel({ history, onView, onClear, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(44,26,14,0.65)', display:'flex', justifyContent:'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:'min(100%,380px)', background:T.cream, boxShadow:'-8px 0 40px rgba(0,0,0,0.3)', display:'flex', flexDirection:'column', height:'100%', animation:'slideRight 0.3s cubic-bezier(.22,1,.36,1)' }}>
        {/* Header panel */}
        <div style={{ background:T.brown, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:'Cormorant Garamond, Georgia, serif', fontSize:18, fontWeight:700, color:T.cream }}>Historique de session</div>
            <div style={{ fontSize:11, color:T.orange }}>{history.length} mélange{history.length > 1 ? 's' : ''} consulté{history.length > 1 ? 's' : ''}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(253,248,243,0.6)', fontSize:22, cursor:'pointer' }}>×</button>
        </div>

        {/* Liste */}
        <div style={{ flex:1, overflowY:'auto', padding:'12px' }}>
          {history.length === 0
            ? <div style={{ textAlign:'center', padding:'40px 20px', color:T.textLight, fontSize:14 }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🥤</div>
                Aucun mélange consulté cette session.
              </div>
            : [...history].reverse().map((b, i) => {
                const cat = CATS[b.cat];
                return (
                  <div key={`${b.id}-${i}`} onClick={() => onView(b)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'12px', marginBottom:6, background:'#FFFFFF', borderRadius:10, border:`1px solid rgba(201,123,46,0.15)`, cursor:'pointer', transition:'all .15s' }}>
                    <span style={{ fontSize:20 }}>{cat.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:T.textDark }}>{b.name}</div>
                      <div style={{ fontSize:11, color:T.textLight }}>{b.id} · {cat.label}</div>
                    </div>
                    <span style={{ color:T.orange, fontSize:14 }}>›</span>
                  </div>
                );
              })
          }
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(201,123,46,0.15)' }}>
            <button onClick={onClear} style={{ width:'100%', background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.2)', borderRadius:8, padding:'10px', color:T.error, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
              🗑️ Effacer l'historique de session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  13. ADMIN LOGIN — sécurité anti-brute-force
// ══════════════════════════════════════════════════════════
function AdminLogin({ onSuccess, onBack, attempts, locked, lockSeconds, onAttempt }) {
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = () => {
    if (locked) return;
    const clean = SECURITY.sanitize(pwd);
    if (!clean) return;
    onAttempt(clean);
    setPwd('');
  };

  useEffect(() => { if (!locked) inputRef.current?.focus(); }, [locked]);

  return (
    <div style={{ minHeight:'100vh', background:T.cream, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:380, background:'#FFFFFF', borderRadius:16, boxShadow:T.shadowLg, overflow:'hidden' }}>
        {/* Header */}
        <div style={{ background:T.brown, padding:'24px 28px', textAlign:'center' }}>
          <CadeyaLogo size={40} variant="white"/>
          <div style={{ fontFamily:'Cormorant Garamond, Georgia, serif', fontSize:20, fontWeight:700, color:T.cream, letterSpacing:'0.1em', marginTop:12 }}>ESPACE ADMIN</div>
          <div style={{ fontSize:11, color:'rgba(253,248,243,0.45)', marginTop:4 }}>Cadeya Smoothies · Accès restreint</div>
        </div>

        <div style={{ padding:'28px' }}>
          {/* Alerte verrouillage */}
          {locked && (
            <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'12px 16px', marginBottom:20, fontSize:13, color:T.error, textAlign:'center' }}>
              ⛔ <strong>Trop de tentatives.</strong><br/>
              Réessayez dans <strong>{lockSeconds}s</strong>
            </div>
          )}

          {/* Alerte tentatives */}
          {!locked && attempts > 0 && (
            <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:8, padding:'10px 14px', marginBottom:18, fontSize:12, color:'#92400E' }}>
              ⚠️ Tentative incorrecte {attempts}/{SECURITY.MAX_ATTEMPTS}
              {attempts >= 2 && ' — Dernière tentative avant verrouillage.'}
            </div>
          )}

          <label style={{ display:'block', fontSize:12, color:T.textLight, letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600, marginBottom:8 }}>
            Mot de passe
          </label>
          <div style={{ position:'relative', marginBottom:20 }}>
            <input
              ref={inputRef}
              type={show ? 'text' : 'password'}
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              disabled={locked}
              maxLength={64}
              placeholder="Mot de passe administrateur"
              style={{ width:'100%', padding:'12px 44px 12px 14px', border:`1px solid ${T.orangeBdr}`, borderRadius:9, fontSize:14, color:T.textDark, background: locked ? '#F9FAFB' : '#FFFFFF', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
            />
            <button onClick={() => setShow(s => !s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:T.textLight, cursor:'pointer', fontSize:16 }}>
              {show ? '🙈' : '👁️'}
            </button>
          </div>

          <button onClick={handleSubmit} disabled={locked || !pwd}
            style={{ width:'100%', background: (locked || !pwd) ? 'rgba(201,123,46,0.4)' : T.orange, border:'none', borderRadius:9, padding:'13px', color:T.cream, fontSize:14, fontWeight:700, cursor: (locked || !pwd) ? 'default' : 'pointer', letterSpacing:'0.08em', fontFamily:'inherit' }}>
            Connexion
          </button>

          <button onClick={onBack} style={{ width:'100%', marginTop:10, background:'none', border:'none', color:T.textLight, fontSize:13, cursor:'pointer', fontFamily:'inherit', padding:'8px' }}>
            ← Retour à l'accueil
          </button>

          {/* Info démo */}
          <div style={{ marginTop:20, background:'rgba(201,123,46,0.06)', border:`1px dashed ${T.orangeBdr}`, borderRadius:8, padding:'12px 14px', fontSize:12, color:T.textLight }}>
            <strong style={{ color:T.orange }}>Mode démo :</strong> Cadeya@2026!<br/>
            <span style={{ fontSize:11, opacity:0.7 }}>En production : authentification serveur JWT + bcrypt</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  14. TABLEAU DE BORD ADMIN
// ══════════════════════════════════════════════════════════
function AdminDashboard({ onLogout, sessionHistory, onResetQueues }) {
  const [searchQ, setSearchQ] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [sortBy, setSortBy] = useState('id');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = BLENDS.filter(b => {
    const matchCat = filterCat === 'all' || b.cat === filterCat;
    const q = SECURITY.sanitize(searchQ).toLowerCase();
    const matchQ = !q || b.name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || b.ing.some(i => i.n.toLowerCase().includes(q));
    return matchCat && matchQ;
  }).sort((a,b) => sortBy === 'id' ? a.id.localeCompare(b.id) : a.name.localeCompare(b.name));

  const stats = Object.entries(CATS).filter(([k]) => k !== 'all').map(([k,c]) => ({
    key: k, label: c.label, emoji: c.emoji, count: BLENDS.filter(b => b.cat === k).length
  }));

  const sessionSeen = sessionHistory.length;

  return (
    <div style={{ minHeight:'100vh', background:'#F8F5F0', paddingBottom:60 }}>
      {/* Admin Header */}
      <div style={{ background:T.brown, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`2px solid ${T.orange}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <CadeyaLogo size={32} variant="white"/>
          <div>
            <div style={{ fontFamily:'Cormorant Garamond, Georgia, serif', fontSize:16, fontWeight:700, color:T.cream, letterSpacing:'0.1em' }}>ADMIN · Cadeya Smoothies</div>
            <div style={{ fontSize:10, color:T.orange }}>Tableau de bord</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ background:'rgba(220,38,38,0.12)', border:'1px solid rgba(220,38,38,0.3)', borderRadius:8, padding:'7px 14px', color:'#FCA5A5', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
          ⎋ Déconnexion
        </button>
      </div>

      <div style={{ maxWidth:700, margin:'0 auto', padding:'20px 16px' }}>

        {/* Stats Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
          {[
            { v:'96', l:'Mélanges totaux', sub:'6 catégories', ic:'🥤' },
            { v:sessionSeen, l:'Vus cette session', sub:'Réinitialisables', ic:'👁️' },
            { v:'v5.0', l:'Cahier des charges', sub:'Conforme', ic:'✅' },
          ].map((s,i) => (
            <div key={i} style={{ background:'#FFFFFF', borderRadius:12, padding:'16px', border:`1px solid rgba(201,123,46,0.15)`, boxShadow:'0 2px 8px rgba(44,26,14,0.07)' }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{s.ic}</div>
              <div style={{ fontFamily:'Cormorant Garamond, Georgia, serif', fontSize:26, fontWeight:700, color:T.orange }}>{s.v}</div>
              <div style={{ fontSize:12, color:T.textDark, fontWeight:600 }}>{s.l}</div>
              <div style={{ fontSize:10, color:T.textLight }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Répartition catégories */}
        <div style={{ background:'#FFFFFF', borderRadius:12, padding:'20px', marginBottom:20, border:`1px solid rgba(201,123,46,0.15)` }}>
          <div style={{ fontSize:12, color:T.textLight, letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700, marginBottom:16 }}>Répartition par catégorie</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {stats.map(s => (
              <div key={s.key} style={{ background:`rgba(${hexToRgb(CATS[s.key].accent)},0.08)`, border:`1px solid rgba(${hexToRgb(CATS[s.key].accent)},0.2)`, borderRadius:8, padding:'10px 12px', textAlign:'center', cursor:'pointer' }}
                onClick={() => setFilterCat(s.key)}>
                <div style={{ fontSize:20, marginBottom:4 }}>{s.emoji}</div>
                <div style={{ fontSize:12, fontWeight:600, color:T.textDark }}>{s.label}</div>
                <div style={{ fontSize:18, fontWeight:700, color:CATS[s.key].accent, fontFamily:'Cormorant Garamond, Georgia, serif' }}>{s.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions admin */}
        <div style={{ display:'flex', gap:10, marginBottom:20 }}>
          <button onClick={onResetQueues} style={{ flex:1, background:T.orange, border:'none', borderRadius:9, padding:'11px', color:T.cream, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            🔄 Réinitialiser toutes les files session
          </button>
        </div>

        {/* Explorateur de mélanges */}
        <div style={{ background:'#FFFFFF', borderRadius:12, border:`1px solid rgba(201,123,46,0.15)`, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(201,123,46,0.1)', display:'flex', flexWrap:'wrap', gap:10, alignItems:'center' }}>
            <div style={{ flex:1, minWidth:200, position:'relative' }}>
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Rechercher un mélange, ingrédient…"
                maxLength={80}
                style={{ width:'100%', padding:'9px 14px', border:`1px solid ${T.orangeBdr}`, borderRadius:8, fontSize:13, color:T.textDark, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}/>
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              style={{ padding:'9px 12px', border:`1px solid ${T.orangeBdr}`, borderRadius:8, fontSize:13, color:T.textDark, background:'#FFFFFF', cursor:'pointer', fontFamily:'inherit' }}>
              <option value="all">Toutes catégories</option>
              {Object.entries(CATS).filter(([k]) => k !== 'all').map(([k,c]) => (
                <option key={k} value={k}>{c.emoji} {c.label}</option>
              ))}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ padding:'9px 12px', border:`1px solid ${T.orangeBdr}`, borderRadius:8, fontSize:13, color:T.textDark, background:'#FFFFFF', cursor:'pointer', fontFamily:'inherit' }}>
              <option value="id">Trier par ID</option>
              <option value="name">Trier par nom</option>
            </select>
          </div>

          <div style={{ fontSize:12, color:T.textLight, padding:'8px 20px', borderBottom:'1px solid rgba(201,123,46,0.08)', background:'rgba(253,248,243,0.5)' }}>
            {filtered.length} mélange{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
          </div>

          <div style={{ maxHeight:480, overflowY:'auto' }}>
            {filtered.map(b => {
              const cat = CATS[b.cat];
              const isOpen = expandedId === b.id;
              return (
                <div key={b.id} style={{ borderBottom:'1px solid rgba(201,123,46,0.07)' }}>
                  <div onClick={() => setExpandedId(isOpen ? null : b.id)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', cursor:'pointer', background: isOpen ? 'rgba(201,123,46,0.05)' : 'transparent', transition:'background .15s' }}>
                    <span style={{ background:`rgba(${hexToRgb(cat.accent)},0.15)`, color:cat.accent, borderRadius:5, padding:'2px 8px', fontSize:10, fontWeight:700, minWidth:38, textAlign:'center' }}>{b.id}</span>
                    <span style={{ fontSize:14, flex:1, color:T.textDark, fontWeight:500 }}>{b.name}</span>
                    <span style={{ fontSize:11, color:T.textLight }}>{cat.emoji}</span>
                    <span style={{ color:T.textLight, fontSize:14, transition:'transform .2s', transform: isOpen ? 'rotate(90deg)' : 'none' }}>›</span>
                  </div>
                  {isOpen && (
                    <div style={{ padding:'0 20px 14px 60px', background:'rgba(201,123,46,0.03)' }}>
                      <div style={{ fontSize:12, color:T.textLight, marginBottom:6 }}>
                        <strong>Base :</strong> {b.base.n} {b.base.a} {b.base.u}
                        &nbsp;·&nbsp;
                        {b.ing.map(i => `${i.n} ${i.a}${i.u}`).join(' · ')}
                      </div>
                      <p style={{ fontSize:12, color:T.textMid, lineHeight:1.7, fontStyle:'italic' }}>{b.note}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ textAlign:'center', marginTop:20, fontSize:11, color:'rgba(44,26,14,0.3)' }}>
          Cadeya Smoothies Admin · TransTech Solution · © 2026
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  15. ESPACE PAIEMENT — Phase 2 PayDunya
// ══════════════════════════════════════════════════════════
function PaymentScreen({ onBack }) {
  const plans = [
    { name:'Découverte', price:'Gratuit', fcfa:'0 FCFA', desc:'Mode démo · Accès complet · Filigrane Cadeya', current:true, color:T.textLight },
    { name:'Essentiel', price:'100 FCFA', fcfa:'par mélange', desc:'Fiche PDF sans filigrane · Priorité support · Export illimité', color:T.orange },
    { name:'Premium', price:'300 FCFA', fcfa:'forfait mensuel', desc:'Accès illimité · Toutes catégories · Personnalisation', color:T.brown },
  ];

  return (
    <div style={{ minHeight:'100vh', background:T.cream, paddingBottom:60 }}>
      <div style={{ background:T.brown, padding:'20px', display:'flex', alignItems:'center', gap:12, borderBottom:`2px solid ${T.orange}` }}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:'rgba(253,248,243,0.6)', cursor:'pointer', fontSize:20 }}>←</button>
        <div>
          <div style={{ fontFamily:'Cormorant Garamond, Georgia, serif', fontSize:18, fontWeight:700, color:T.cream }}>Tarification</div>
          <div style={{ fontSize:11, color:T.orange }}>PayDunya · Intégration Phase 2</div>
        </div>
      </div>

      <div style={{ maxWidth:520, margin:'0 auto', padding:'24px 16px' }}>

        {/* Badge statut actuel */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <span style={{ background:'rgba(21,128,61,0.1)', border:'1px solid rgba(21,128,61,0.3)', color:T.success, borderRadius:20, padding:'6px 16px', fontSize:12, fontWeight:700 }}>
            ✅ Mode Démo Actif — Accès 100% gratuit
          </span>
          <p style={{ marginTop:12, fontSize:13, color:T.textLight, lineHeight:1.6 }}>
            L'application est actuellement en phase de démonstration.<br/>
            La monétisation PayDunya sera activée en Phase 2.
          </p>
        </div>

        {/* Plans */}
        {plans.map((p, i) => (
          <div key={i} style={{ background: p.current ? 'rgba(201,123,46,0.06)' : '#FFFFFF', border:`1.5px solid ${p.current ? T.orange : 'rgba(201,123,46,0.18)'}`, borderRadius:12, padding:'20px', marginBottom:12, position:'relative', boxShadow: p.current ? `0 0 0 3px rgba(201,123,46,0.1)` : 'none' }}>
            {p.current && <div style={{ position:'absolute', top:-10, left:20, background:T.orange, color:T.cream, fontSize:10, fontWeight:700, padding:'2px 10px', borderRadius:20, letterSpacing:'0.1em' }}>ACTUEL</div>}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontFamily:'Cormorant Garamond, Georgia, serif', fontSize:20, fontWeight:700, color:T.textDark }}>{p.name}</div>
                <div style={{ fontSize:12, color:T.textLight, marginTop:4 }}>{p.desc}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:'Cormorant Garamond, Georgia, serif', fontSize:24, fontWeight:700, color:p.color }}>{p.price}</div>
                <div style={{ fontSize:10, color:T.textLight }}>{p.fcfa}</div>
              </div>
            </div>
          </div>
        ))}

        {/* PayDunya info */}
        <div style={{ background:'rgba(201,123,46,0.06)', border:`1px dashed ${T.orangeBdr}`, borderRadius:12, padding:'20px', marginTop:20 }}>
          <div style={{ fontFamily:'Cormorant Garamond, Georgia, serif', fontSize:17, fontWeight:700, color:T.textDark, marginBottom:8 }}>
            🏦 Intégration PayDunya prévue
          </div>
          <div style={{ fontSize:13, color:T.textMid, lineHeight:1.75 }}>
            <strong>Méthodes acceptées :</strong> Orange Money, Wave, Free Money, Carte bancaire<br/>
            <strong>Webhook HMAC</strong> · Idempotency key · Confirmation serveur<br/>
            <strong>Pays couverts :</strong> Sénégal, Gabon, Côte d'Ivoire, Mali, Burkina Faso…<br/>
            <strong>Déploiement estimé :</strong> Phase 2 · Q3 2026
          </div>
        </div>

        <p style={{ textAlign:'center', fontSize:11, color:'rgba(44,26,14,0.3)', marginTop:24 }}>
          Cadeya Smoothies · TransTech Solution · © 2026<br/>
          Tarifs indicatifs — sujets à modification avant lancement
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  16. APP PRINCIPALE — routeur + état global
// ══════════════════════════════════════════════════════════
export default function CadeyaSmoothiesPro() {
  // ── ÉTAT GLOBAL ────────────────────────────────────────
  const [screen, setScreen]         = useState('splash');      // splash|home|card|history|admin-login|admin|payment
  const [selCat, setSelCat]         = useState('all');
  const [blend, setBlend]           = useState(null);
  const [persons, setPersons]       = useState(1);
  const [queues, setQueues]         = useState({});           // {catKey: id[]} Fisher-Yates
  const [animKey, setAnimKey]       = useState(0);
  const [history, setHistory]       = useState([]);           // session history
  const [showHistory, setShowHistory] = useState(false);

  // Admin
  const [adminAuth, setAdminAuth]   = useState(false);
  const [attempts, setAttempts]     = useState(0);
  const [locked, setLocked]         = useState(false);
  const [lockExpiry, setLockExpiry] = useState(null);
  const [lockSecs, setLockSecs]     = useState(0);

  // Toasts
  const [toasts, setToasts]         = useState([]);
  const toastRef                    = useRef(0);

  // ── TIMER VERROU ADMIN ─────────────────────────────────
  useEffect(() => {
    if (!locked) return;
    const iv = setInterval(() => {
      const remaining = Math.ceil((lockExpiry - Date.now()) / 1000);
      if (remaining <= 0) {
        setLocked(false);
        setAttempts(0);
        setLockSecs(0);
        clearInterval(iv);
      } else {
        setLockSecs(remaining);
      }
    }, 500);
    return () => clearInterval(iv);
  }, [locked, lockExpiry]);

  // ── TOAST SYSTEM ───────────────────────────────────────
  const pushToast = useCallback((title, msg, type = 'info') => {
    const id = ++toastRef.current;
    setToasts(t => [...t, { id, title, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const dismissToast = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), []);

  // ── MOTEUR FISHER-YATES ────────────────────────────────
  const getQueue = useCallback((catKey) => {
    const pool = catKey === 'all' ? BLENDS : BLENDS.filter(b => b.cat === catKey);
    const existing = queues[catKey];
    if (existing && existing.length > 0) return existing;
    // File épuisée → regénère en excluant le dernier vu
    const lastId = history.length ? history[history.length-1].id : null;
    const shuffled = fisherYates(pool.map(b => b.id));
    // Si le premier est le dernier vu, on le pousse à la fin
    if (lastId && shuffled[shuffled.length-1] === lastId && shuffled.length > 1) {
      shuffled.unshift(shuffled.pop());
    }
    return shuffled;
  }, [queues, history]);

  const drawBlend = useCallback((catKey) => {
    const q = getQueue(catKey);
    const nextId = q[q.length - 1];
    const remaining = q.slice(0, q.length - 1);
    setQueues(prev => ({ ...prev, [catKey]: remaining }));
    return BLENDS.find(b => b.id === nextId);
  }, [getQueue]);

  // ── NAVIGATION ─────────────────────────────────────────
  const handleCatSelect = useCallback((catKey) => {
    const b = drawBlend(catKey);
    setSelCat(catKey);
    setBlend(b);
    setPersons(1);
    setAnimKey(k => k + 1);
    setHistory(h => [...h, b]);
    setScreen('card');
  }, [drawBlend]);

  const handleNext = useCallback(() => {
    const b = drawBlend(selCat);
    setBlend(b);
    setPersons(1);
    setAnimKey(k => k + 1);
    setHistory(h => [...h, b]);
  }, [drawBlend, selCat]);

  const handleViewFromHistory = useCallback((b) => {
    setBlend(b);
    setSelCat(b.cat);
    setPersons(1);
    setAnimKey(k => k + 1);
    setShowHistory(false);
    setScreen('card');
  }, []);

  const handlePDF = useCallback(() => {
    if (!blend) return;
    exportPDF(blend, persons);
    pushToast('Export PDF', 'La fiche s\'ouvre dans un nouvel onglet.', 'success');
  }, [blend, persons, pushToast]);

  const handleShare = useCallback(() => {
    if (!blend) return;
    const text = [
      `🥤 Cadeya Smoothies · ${blend.id}`,
      `${blend.name}`,
      ``,
      `Pour 1 personne :`,
      `• ${blend.base.n} : ${blend.base.a} ${blend.base.u}`,
      ...blend.ing.map(i => `• ${i.n} : ${i.a} ${i.u}`),
      ``,
      blend.note,
      ``,
      `Généré par IA · Cadeya Smoothies © 2026`
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => pushToast('Recette copiée', 'La recette est dans votre presse-papier.', 'success'))
        .catch(() => pushToast('Erreur', 'Impossible de copier.', 'error'));
    } else {
      pushToast('Info', 'Presse-papier non disponible dans ce contexte.', 'info');
    }
  }, [blend, pushToast]);

  // ── ADMIN LOGIC ────────────────────────────────────────
  const handleLoginAttempt = useCallback((pwd) => {
    if (SECURITY.verify(pwd)) {
      setAdminAuth(true);
      setAttempts(0);
      setScreen('admin');
      pushToast('Connexion réussie', 'Bienvenue dans l\'espace admin.', 'success');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= SECURITY.MAX_ATTEMPTS) {
        setLocked(true);
        setLockExpiry(Date.now() + SECURITY.LOCK_DURATION_MS);
        setLockSecs(Math.ceil(SECURITY.LOCK_DURATION_MS / 1000));
        pushToast('Compte verrouillé', `${SECURITY.MAX_ATTEMPTS} tentatives échouées. Réessayez dans 30s.`, 'error');
      } else {
        pushToast('Mot de passe incorrect', `${SECURITY.MAX_ATTEMPTS - newAttempts} tentative(s) restante(s).`, 'error');
      }
    }
  }, [attempts, pushToast]);

  const handleLogout = () => {
    setAdminAuth(false);
    setAttempts(0);
    setScreen('home');
    pushToast('Déconnexion', 'Vous avez été déconnecté.', 'info');
  };

  const handleResetQueues = () => {
    setQueues({});
    pushToast('Files réinitialisées', 'Toutes les files de tirage ont été remises à zéro.', 'success');
  };

  // ── CSS GLOBAL ─────────────────────────────────────────
  const globalCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #FDF8F3; font-family: 'DM Sans', system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
    button { font-family: 'DM Sans', system-ui, sans-serif; }
    input, select { font-family: 'DM Sans', system-ui, sans-serif; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: rgba(201,123,46,0.05); }
    ::-webkit-scrollbar-thumb { background: rgba(201,123,46,0.3); border-radius: 99px; }
    @keyframes splashLogo { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
    @keyframes splashText { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes cardSlideIn { from { opacity:0; transform:translateY(20px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes slideRight { from { transform:translateX(100%); } to { transform:translateX(0); } }
    @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
    @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    * { -webkit-tap-highlight-color: transparent; }
  `;

  // ── RENDU ──────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalCSS }}/>

      {/* Toasts globaux */}
      <Toast toasts={toasts} onDismiss={dismissToast}/>

      {/* Panneau historique (overlay) */}
      {showHistory && (
        <HistoryPanel
          history={history}
          onView={handleViewFromHistory}
          onClear={() => { setHistory([]); pushToast('Historique effacé', 'Session réinitialisée.', 'info'); }}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* SPLASH */}
      {screen === 'splash' && (
        <SplashScreen onDone={() => setScreen('home')}/>
      )}

      {/* HOME */}
      {screen === 'home' && (
        <>
          <AppHeader
            onHome={() => setScreen('home')}
            onHistory={() => setShowHistory(true)}
            onAdmin={() => adminAuth ? setScreen('admin') : setScreen('admin-login')}
            historyCount={history.length}
          />
          <HomeScreen
            onSelect={handleCatSelect}
            queues={queues}
            onPayment={() => setScreen('payment')}
          />
        </>
      )}

      {/* CARD */}
      {screen === 'card' && blend && (
        <>
          <AppHeader
            onHome={() => setScreen('home')}
            onHistory={() => setShowHistory(true)}
            onAdmin={() => adminAuth ? setScreen('admin') : setScreen('admin-login')}
            historyCount={history.length}
          />
          <BlendCard
            blend={blend}
            persons={persons}
            onPersons={setPersons}
            onNext={handleNext}
            onBack={() => setScreen('home')}
            onPDF={handlePDF}
            onShare={handleShare}
            addKey={animKey}
          />
        </>
      )}

      {/* ADMIN LOGIN */}
      {screen === 'admin-login' && (
        <AdminLogin
          onSuccess={() => setScreen('admin')}
          onBack={() => setScreen('home')}
          attempts={attempts}
          locked={locked}
          lockSeconds={lockSecs}
          onAttempt={handleLoginAttempt}
        />
      )}

      {/* ADMIN DASHBOARD */}
      {screen === 'admin' && adminAuth && (
        <AdminDashboard
          onLogout={handleLogout}
          sessionHistory={history}
          onResetQueues={handleResetQueues}
        />
      )}

      {/* PAYMENT */}
      {screen === 'payment' && (
        <>
          <AppHeader
            onHome={() => setScreen('home')}
            onHistory={() => setShowHistory(true)}
            onAdmin={() => adminAuth ? setScreen('admin') : setScreen('admin-login')}
            historyCount={history.length}
          />
          <PaymentScreen onBack={() => setScreen('home')}/>
        </>
      )}

      {/* Fallback sécurité: admin sans auth → redirect */}
      {screen === 'admin' && !adminAuth && (() => {
        setScreen('admin-login');
        return null;
      })()}
    </>
  );
}
