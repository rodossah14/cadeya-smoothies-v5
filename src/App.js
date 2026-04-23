// App.js - CADEYA SMOOTHIES v5.0 Pro
import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import './App.css';
import logo from './logo-cadeya.jpg';

// ===== BASE DE DONNÉES COMPLÈTE - 96 mélanges =====
const MIXTURES_DB = {
  energie: [
    { id: 'E01', name: 'Bouye + Gingembre', base: { type: 'Eau', quantity: 250 }, ingredients: [{ name: 'Bouye', quantity: 20, unit: 'g' }, { name: 'Gingembre frais', quantity: 12, unit: 'g' }], benefits: 'Le bouye apporte 280mg de vitamine C pour 100g — il contribue à réduire la fatigue et soutient les défenses naturelles. Le gingembre favorise la circulation sanguine. Ensemble, un mélange simple et efficace pour bien commencer la journée.' },
    { id: 'E02', name: 'Bouye + Carotte + Gingembre', base: { type: 'Eau', quantity: 200 }, ingredients: [{ name: 'Bouye', quantity: 20, unit: 'g' }, { name: 'Carotte', quantity: 100, unit: 'g' }, { name: 'Gingembre frais', quantity: 10, unit: 'g' }], benefits: 'Le bouye apporte la vitamine C, la carotte le bêta-carotène. Le gingembre active la circulation. Une combinaison qui contribue à stabiliser l\'énergie sur la durée.' },
    { id: 'E03', name: 'Bouye + Orange Casamance + Cannelle', base: { type: 'Eau', quantity: 150 }, ingredients: [{ name: 'Bouye', quantity: 20, unit: 'g' }, { name: 'Orange Casamance', quantity: 2, unit: 'unités' }, { name: 'Cannelle', quantity: 0.5, unit: 'c.à.c' }], benefits: 'L\'orange de Casamance, plus douce et moins acide que l\'importée, s\'associe naturellement au bouye. La cannelle est traditionnellement connue pour aider à stabiliser la glycémie et réchauffer l\'organisme.' },
    { id: 'E04', name: 'Bissap + Gingembre + Citron', base: { type: 'Eau', quantity: 300 }, ingredients: [{ name: 'Fleurs de bissap séchées', quantity: 15, unit: 'g' }, { name: 'Gingembre frais', quantity: 10, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }], benefits: 'Le bissap (hibiscus) est riche en anthocyanes et en vitamine C. Il contribue à réduire la fatigue et à soutenir la circulation. Le gingembre et le citron complètent ce trio stimulant idéal pour une journée active.' },
    { id: 'E05', name: 'Mangue + Citron + Gingembre', base: { type: 'Eau', quantity: 100 }, ingredients: [{ name: 'Mangue', quantity: 150, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Gingembre frais', quantity: 8, unit: 'g' }], benefits: 'La mangue est riche en vitamines A et C et apporte une énergie naturelle rapide. Le citron alcalinise et détoxifie. Le gingembre stimule la digestion et la circulation pour un boost complet.' },
    { id: 'E06', name: 'Banane + Datte + Lait de coco', base: { type: 'Lait de coco', quantity: 200 }, ingredients: [{ name: 'Banane', quantity: 1, unit: 'unité' }, { name: 'Dattes Medjool', quantity: 3, unit: 'unités' }, { name: 'Cannelle', quantity: 0.5, unit: 'c.à.c' }], benefits: 'La banane fournit du potassium et des glucides à libération progressive. Les dattes sont une source naturelle de sucres rapides et de magnésium. Le lait de coco apporte des graisses saines pour une énergie durable.' },
    { id: 'E07', name: 'Ananas + Citron + Menthe', base: { type: 'Eau', quantity: 100 }, ingredients: [{ name: 'Ananas', quantity: 150, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Menthe fraîche', quantity: 6, unit: 'feuilles' }], benefits: 'L\'ananas contient de la bromélaïne, une enzyme qui aide à la digestion et réduit l\'inflammation. Le citron booste la vitamine C. La menthe rafraîchit et aide à la concentration.' },
    { id: 'E08', name: 'Tamarin + Gingembre + Miel', base: { type: 'Eau', quantity: 250 }, ingredients: [{ name: 'Tamarin', quantity: 30, unit: 'g' }, { name: 'Gingembre frais', quantity: 10, unit: 'g' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'Le tamarin est riche en vitamines B et en tartrate qui favorise la digestion et l\'énergie. Le gingembre stimule la circulation. Le miel apporte des sucres naturels rapidement disponibles.' },
    { id: 'E09', name: 'Pastèque + Citron + Basilic', base: { type: 'Eau', quantity: 50 }, ingredients: [{ name: 'Pastèque', quantity: 200, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Basilic frais', quantity: 5, unit: 'feuilles' }], benefits: 'La pastèque est composée à 92% d\'eau et riche en lycopène, un puissant antioxydant. Elle hydrate et fournit de l\'énergie légère. Le citron et le basilic ajoutent fraîcheur et propriétés digestives.' },
    { id: 'E10', name: 'Bouye + Lait de coco + Vanille', base: { type: 'Lait de coco', quantity: 200 }, ingredients: [{ name: 'Bouye', quantity: 25, unit: 'g' }, { name: 'Vanille', quantity: 0.5, unit: 'c.à.c' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'Le bouye associé au lait de coco crée une boisson onctueuse riche en vitamine C et en graisses saines MCT. La vanille est apaisante. Un mélange doux pour une énergie posée et durable.' },
    { id: 'E11', name: 'Papaye + Citron + Gingembre', base: { type: 'Eau', quantity: 100 }, ingredients: [{ name: 'Papaye', quantity: 150, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Gingembre frais', quantity: 8, unit: 'g' }], benefits: 'La papaye est riche en papaïne, une enzyme digestive naturelle. Elle apporte les vitamines A, C et E. Le gingembre et le citron amplifient l\'effet energisant de ce trio tropical.' },
    { id: 'E12', name: 'Carotte + Gingembre + Orange', base: { type: 'Eau', quantity: 100 }, ingredients: [{ name: 'Carotte', quantity: 120, unit: 'g' }, { name: 'Gingembre frais', quantity: 10, unit: 'g' }, { name: 'Orange', quantity: 1, unit: 'unité' }], benefits: 'Un classique du boost matinal. Le bêta-carotène de la carotte, la vitamine C de l\'orange et les propriétés stimulantes du gingembre forment une combinaison reconnue pour l\'énergie et la vitalité.' },
    { id: 'E13', name: 'Datte + Amande + Cannelle', base: { type: 'Lait d\'amande', quantity: 250 }, ingredients: [{ name: 'Dattes Medjool', quantity: 4, unit: 'unités' }, { name: 'Amandes', quantity: 20, unit: 'g' }, { name: 'Cannelle', quantity: 0.5, unit: 'c.à.c' }], benefits: 'Les dattes fournissent du fer, du magnésium et du potassium. Les amandes apportent des protéines végétales et des graisses saines. La cannelle stabilise la glycémie pour une énergie régulière.' },
    { id: 'E14', name: 'Bissap + Orange + Citron', base: { type: 'Eau', quantity: 250 }, ingredients: [{ name: 'Fleurs de bissap séchées', quantity: 15, unit: 'g' }, { name: 'Orange', quantity: 1, unit: 'unité' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }], benefits: 'Triple source de vitamine C : bissap, orange et citron. Ce mélange est une véritable bombe antioxydante qui booste l\'énergie, combat les radicaux libres et soutient le système immunitaire.' },
    { id: 'E15', name: 'Mangue + Ananas + Citron vert', base: { type: 'Eau', quantity: 100 }, ingredients: [{ name: 'Mangue', quantity: 100, unit: 'g' }, { name: 'Ananas', quantity: 100, unit: 'g' }, { name: 'Citron vert', quantity: 0.5, unit: 'unité' }], benefits: 'Ce duo tropical mangue-ananas offre un cocktail naturel de vitamines A, B et C. La bromélaïne de l\'ananas et les enzymes de la mangue stimulent le métabolisme pour un réveil en énergie.' },
    { id: 'E16', name: 'Carotte + Pamplemousse + Citron', base: { type: 'Eau', quantity: 200 }, ingredients: [{ name: 'Carotte', quantity: 120, unit: 'g' }, { name: 'Pamplemousse', quantity: 0.5, unit: 'unité' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }], benefits: 'Le bêta-carotène de la carotte s\'associe à la double vitamine C du pamplemousse et du citron. Source naturelle de bêta-carotène et contribue à stabiliser l\'énergie sur la journée.' }
  ],

  detox: [
    { id: 'D01', name: 'Concombre + Menthe + Citron + Gingembre', base: { type: 'Eau', quantity: 200 }, ingredients: [{ name: 'Concombre', quantity: 120, unit: 'g' }, { name: 'Menthe fraîche', quantity: 8, unit: 'feuilles' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Gingembre frais', quantity: 8, unit: 'g' }], benefits: 'Le concombre est composé à 96% d\'eau — il hydrate en profondeur. La menthe est digestive et rafraîchissante. Le gingembre favorise la circulation et le drainage. Un détox classique et efficace.' },
    { id: 'D02', name: 'Bissap + Citron + Gingembre', base: { type: 'Eau', quantity: 300 }, ingredients: [{ name: 'Fleurs de bissap séchées', quantity: 15, unit: 'g' }, { name: 'Citron', quantity: 1, unit: 'unité' }, { name: 'Gingembre frais', quantity: 10, unit: 'g' }], benefits: 'Le bissap est diurétique naturel et riche en anthocyanes qui favorisent l\'élimination des toxines. Le citron alcalinise le sang. Le gingembre stimule le foie pour une détoxification profonde.' },
    { id: 'D03', name: 'Pastèque + Citron vert + Menthe', base: { type: 'Eau', quantity: 50 }, ingredients: [{ name: 'Pastèque', quantity: 200, unit: 'g' }, { name: 'Citron vert', quantity: 0.5, unit: 'unité' }, { name: 'Menthe fraîche', quantity: 8, unit: 'feuilles' }], benefits: 'La pastèque est l\'un des aliments les plus hydratants. Son lycopène combat les radicaux libres. Le citron vert et la menthe amplifient l\'effet détoxifiant et rafraîchissant de ce mélange léger.' },
    { id: 'D04', name: 'Ananas + Gingembre + Curcuma', base: { type: 'Eau', quantity: 150 }, ingredients: [{ name: 'Ananas', quantity: 150, unit: 'g' }, { name: 'Gingembre frais', quantity: 10, unit: 'g' }, { name: 'Curcuma', quantity: 0.5, unit: 'c.à.c' }], benefits: 'L\'ananas contient de la bromélaïne anti-inflammatoire. Le curcuma est l\'un des anti-inflammatoires naturels les plus puissants. Le gingembre amplifie leurs effets pour un détox en profondeur.' },
    { id: 'D05', name: 'Épinards + Pomme + Citron + Concombre', base: { type: 'Eau', quantity: 150 }, ingredients: [{ name: 'Épinards', quantity: 50, unit: 'g' }, { name: 'Pomme verte', quantity: 1, unit: 'unité' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Concombre', quantity: 80, unit: 'g' }], benefits: 'Le green detox par excellence. Les épinards apportent du fer et de la chlorophylle purifiante. La pomme verte est diurétique. Le citron et le concombre finalisent ce nettoyage cellulaire complet.' },
    { id: 'D06', name: 'Tamarin + Citron + Miel', base: { type: 'Eau', quantity: 250 }, ingredients: [{ name: 'Tamarin', quantity: 25, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'Le tamarin est un laxatif naturel doux qui favorise l\'élimination intestinale. Il est riche en polyphénols détoxifiants. Le citron et le miel adoucissent et alcalinisent ce mélange purificateur.' },
    { id: 'D07', name: 'Carotte + Betterave + Gingembre', base: { type: 'Eau', quantity: 100 }, ingredients: [{ name: 'Carotte', quantity: 100, unit: 'g' }, { name: 'Betterave', quantity: 80, unit: 'g' }, { name: 'Gingembre frais', quantity: 8, unit: 'g' }], benefits: 'La betterave est exceptionnelle pour la détox hépatique grâce à la bétaïne. La carotte apporte le bêta-carotène. Ce trio rouge-orange est un nettoyant du foie et du sang reconnu.' },
    { id: 'D08', name: 'Papaye + Citron + Graines de chia', base: { type: 'Eau', quantity: 150 }, ingredients: [{ name: 'Papaye', quantity: 150, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Graines de chia', quantity: 10, unit: 'g' }], benefits: 'La papaïne de la papaye nettoie le tube digestif. Les graines de chia absorbent les toxines dans l\'intestin et régulent le transit. Le citron complète ce détox digestif en profondeur.' },
    { id: 'D09', name: 'Concombre + Aloe vera + Citron', base: { type: 'Eau', quantity: 200 }, ingredients: [{ name: 'Concombre', quantity: 120, unit: 'g' }, { name: 'Gel d\'aloe vera', quantity: 30, unit: 'ml' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }], benefits: 'L\'aloe vera est l\'un des purifiants intestinaux les plus puissants de la nature. Il apaise les muqueuses et élimine les toxines. Le concombre hydrate et le citron alcalinise pour un détox total.' },
    { id: 'D10', name: 'Bissap + Hibiscus + Citron + Menthe', base: { type: 'Eau froide', quantity: 300 }, ingredients: [{ name: 'Fleurs de bissap séchées', quantity: 20, unit: 'g' }, { name: 'Citron', quantity: 1, unit: 'unité' }, { name: 'Menthe fraîche', quantity: 10, unit: 'feuilles' }], benefits: 'Version infusée à froid du bissap, cette préparation préserve mieux les polyphénols. Diurétique et riche en vitamine C, elle favorise l\'élimination rénale et purifie le sang en douceur.' },
    { id: 'D11', name: 'Ananas + Concombre + Basilic', base: { type: 'Eau', quantity: 100 }, ingredients: [{ name: 'Ananas', quantity: 120, unit: 'g' }, { name: 'Concombre', quantity: 100, unit: 'g' }, { name: 'Basilic frais', quantity: 6, unit: 'feuilles' }], benefits: 'Ce mélange combine la bromélaïne anti-inflammatoire de l\'ananas avec les propriétés drainantes du concombre. Le basilic est antioxydant et favorise la digestion pour un effet détox doux.' },
    { id: 'D12', name: 'Citron + Cayenne + Eau chaude + Miel', base: { type: 'Eau chaude', quantity: 250 }, ingredients: [{ name: 'Citron', quantity: 1, unit: 'unité' }, { name: 'Piment de Cayenne', quantity: 0.25, unit: 'c.à.c' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'La célèbre "master cleanse". Le citron alcalinise, le cayenne active le métabolisme et brûle les toxines stockées. Le miel adoucit et apporte des enzymes. Idéal à jeun le matin.' },
    { id: 'D13', name: 'Pastèque + Gingembre + Basilic', base: { type: 'Eau', quantity: 50 }, ingredients: [{ name: 'Pastèque', quantity: 200, unit: 'g' }, { name: 'Gingembre frais', quantity: 8, unit: 'g' }, { name: 'Basilic frais', quantity: 5, unit: 'feuilles' }], benefits: 'La pastèque détoxifie les reins grâce à sa haute teneur en eau et en citrulline. Le gingembre stimule la digestion et le foie. Le basilic ajoute des propriétés antibactériennes naturelles.' },
    { id: 'D14', name: 'Épinards + Concombre + Citron + Gingembre', base: { type: 'Eau de coco', quantity: 200 }, ingredients: [{ name: 'Épinards', quantity: 60, unit: 'g' }, { name: 'Concombre', quantity: 100, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Gingembre frais', quantity: 8, unit: 'g' }], benefits: 'Ce green detox est enrichi à l\'eau de coco, source naturelle d\'électrolytes. La chlorophylle des épinards nettoie le sang. Un détox vert complet qui hydrate et purifie simultanément.' },
    { id: 'D15', name: 'Carotte + Pomme + Curcuma + Citron', base: { type: 'Eau', quantity: 100 }, ingredients: [{ name: 'Carotte', quantity: 100, unit: 'g' }, { name: 'Pomme verte', quantity: 1, unit: 'unité' }, { name: 'Curcuma', quantity: 0.5, unit: 'c.à.c' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }], benefits: 'Le curcuma est un puissant anti-inflammatoire et protecteur du foie. La carotte et la pomme apportent antioxydants et fibres. Le citron active l\'absorption de la curcumine. Détox hépato-digestif optimal.' },
    { id: 'D16', name: 'Bouye + Citron + Eau de coco', base: { type: 'Eau de coco', quantity: 250 }, ingredients: [{ name: 'Bouye', quantity: 20, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }], benefits: 'Le bouye associé à l\'eau de coco crée un détox sénégalais traditionnel modernisé. Riche en vitamine C, potassium et électrolytes naturels, ce mélange purifie et rééquilibre l\'organisme.' }
  ],

  immunite: [
    { id: 'I01', name: 'Bouye + Gingembre + Citron', base: { type: 'Eau', quantity: 220 }, ingredients: [{ name: 'Bouye', quantity: 20, unit: 'g' }, { name: 'Gingembre frais', quantity: 12, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }], benefits: 'Le bouye contient 280mg de vitamine C pour 100g — 7 fois plus que l\'orange selon le CIRAD. Le gingembre est antivirall et antibactérien naturel. Le citron renforce ce bouclier immunitaire.' },
    { id: 'I02', name: 'Bissap + Gingembre + Citron + Miel', base: { type: 'Eau', quantity: 280 }, ingredients: [{ name: 'Fleurs de bissap séchées', quantity: 15, unit: 'g' }, { name: 'Gingembre frais', quantity: 12, unit: 'g' }, { name: 'Citron', quantity: 1, unit: 'unité' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'Le miel cru contient des propriétés antimicrobiennes naturelles. Le bissap apporte des anthocyanes immunostimulants. Le trio gingembre-citron-miel est un remède traditionnel mondial contre les infections.' },
    { id: 'I03', name: 'Orange + Citron + Curcuma + Poivre noir', base: { type: 'Eau', quantity: 150 }, ingredients: [{ name: 'Orange', quantity: 2, unit: 'unités' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Curcuma', quantity: 1, unit: 'c.à.c' }, { name: 'Poivre noir', quantity: 0.25, unit: 'c.à.c' }], benefits: 'Le poivre noir contient de la pipérine qui augmente l\'absorption du curcuma de 2000%. La double dose de vitamine C active les lymphocytes. Un shot immunitaire de haute efficacité.' },
    { id: 'I04', name: 'Ail + Gingembre + Citron + Miel', base: { type: 'Eau', quantity: 200 }, ingredients: [{ name: 'Ail', quantity: 1, unit: 'gousse' }, { name: 'Gingembre frais', quantity: 15, unit: 'g' }, { name: 'Citron', quantity: 1, unit: 'unité' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'L\'allicine de l\'ail est l\'un des antibiotiques naturels les plus puissants connus. Combinée au gingembre anti-inflammatoire et à la vitamine C du citron, c\'est un bouclier immunitaire maximal.' },
    { id: 'I05', name: 'Bouye + Moringa + Citron', base: { type: 'Eau', quantity: 220 }, ingredients: [{ name: 'Bouye', quantity: 20, unit: 'g' }, { name: 'Poudre de moringa', quantity: 5, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }], benefits: 'Le moringa est surnommé "l\'arbre miracle" : il contient 7 fois plus de vitamine C que l\'orange, 4 fois plus de calcium que le lait et 2 fois plus de protéines que le yaourt. Associé au bouye, une puissance immunitaire rare.' },
    { id: 'I06', name: 'Ananas + Curcuma + Gingembre + Poivre', base: { type: 'Eau de coco', quantity: 150 }, ingredients: [{ name: 'Ananas', quantity: 150, unit: 'g' }, { name: 'Curcuma', quantity: 1, unit: 'c.à.c' }, { name: 'Gingembre frais', quantity: 10, unit: 'g' }, { name: 'Poivre noir', quantity: 0.25, unit: 'c.à.c' }], benefits: 'Ce golden smoothie tropical combine la bromélaïne de l\'ananas avec le curcuma anti-inflammatoire. La pipérine du poivre optimise l\'absorption. L\'eau de coco hydrate et apporte des électrolytes.' },
    { id: 'I07', name: 'Papaye + Citron + Gingembre + Miel', base: { type: 'Eau', quantity: 100 }, ingredients: [{ name: 'Papaye', quantity: 150, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Gingembre frais', quantity: 10, unit: 'g' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'La papaye est riche en vitamines A, C et E, trois vitamines clés du système immunitaire. Le bêta-carotène est un précurseur de la vitamine A essentielle pour les muqueuses protectrices.' },
    { id: 'I08', name: 'Bissap + Moringa + Citron', base: { type: 'Eau', quantity: 280 }, ingredients: [{ name: 'Fleurs de bissap séchées', quantity: 15, unit: 'g' }, { name: 'Poudre de moringa', quantity: 5, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }], benefits: 'La combinaison bissap-moringa est 100% africaine et d\'une richesse nutritionnelle exceptionnelle. Les deux plantes sont riches en vitamine C, fer et antioxydants pour un système immunitaire robuste.' },
    { id: 'I09', name: 'Citron + Cayenne + Gingembre + Miel', base: { type: 'Eau chaude', quantity: 250 }, ingredients: [{ name: 'Citron', quantity: 1, unit: 'unité' }, { name: 'Piment de Cayenne', quantity: 0.25, unit: 'c.à.c' }, { name: 'Gingembre frais', quantity: 12, unit: 'g' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'Ce shot chaud est un remède traditionnel pour stimuler rapidement les défenses. La capsaïcine du cayenne active la production de globules blancs. Gingembre et citron complètent ce bouclier thermique.' },
    { id: 'I10', name: 'Carotte + Orange + Curcuma', base: { type: 'Eau', quantity: 100 }, ingredients: [{ name: 'Carotte', quantity: 120, unit: 'g' }, { name: 'Orange', quantity: 1, unit: 'unité' }, { name: 'Curcuma', quantity: 0.5, unit: 'c.à.c' }], benefits: 'Le bêta-carotène de la carotte se convertit en vitamine A, essentielle aux barrières muqueuses. L\'orange apporte la vitamine C. Le curcuma réduit l\'inflammation chronique qui affaiblit l\'immunité.' },
    { id: 'I11', name: 'Mangue + Gingembre + Citron + Curcuma', base: { type: 'Eau', quantity: 100 }, ingredients: [{ name: 'Mangue', quantity: 150, unit: 'g' }, { name: 'Gingembre frais', quantity: 10, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Curcuma', quantity: 0.5, unit: 'c.à.c' }], benefits: 'La mangue est riche en vitamines A, B6 et C, toutes impliquées dans la réponse immunitaire. Le curcuma et le gingembre réduisent l\'inflammation. Un golden tropical complet.' },
    { id: 'I12', name: 'Bouye + Bissap + Gingembre', base: { type: 'Eau', quantity: 250 }, ingredients: [{ name: 'Bouye', quantity: 15, unit: 'g' }, { name: 'Fleurs de bissap séchées', quantity: 10, unit: 'g' }, { name: 'Gingembre frais', quantity: 10, unit: 'g' }], benefits: 'Ce duo sénégalais bouye-bissap est une combinaison traditionnelle de haute puissance. Deux sources exceptionnelles de vitamine C associées au gingembre antivirale forment un trio immunitaire africain.' },
    { id: 'I13', name: 'Tamarin + Gingembre + Citron + Miel', base: { type: 'Eau', quantity: 250 }, ingredients: [{ name: 'Tamarin', quantity: 25, unit: 'g' }, { name: 'Gingembre frais', quantity: 12, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'Le tamarin contient des acides organiques et des polyphénols aux propriétés antimicrobiennes. Le gingembre et le citron renforcent cet effet. Le miel cru scelle cette formule immunitaire traditionnelle.' },
    { id: 'I14', name: 'Pastèque + Gingembre + Citron + Menthe', base: { type: 'Eau', quantity: 50 }, ingredients: [{ name: 'Pastèque', quantity: 180, unit: 'g' }, { name: 'Gingembre frais', quantity: 8, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Menthe fraîche', quantity: 6, unit: 'feuilles' }], benefits: 'La pastèque est riche en lycopène et en vitamine C. Sa haute teneur en eau favorise l\'élimination des agents pathogènes. Ce mélange rafraîchissant soutient l\'immunité par l\'hydratation profonde.' },
    { id: 'I15', name: 'Orange + Bouye + Moringa', base: { type: 'Eau', quantity: 150 }, ingredients: [{ name: 'Orange', quantity: 2, unit: 'unités' }, { name: 'Bouye', quantity: 15, unit: 'g' }, { name: 'Poudre de moringa', quantity: 5, unit: 'g' }], benefits: 'Ce triumvirat africain est d\'une richesse en vitamine C incomparable. Orange, bouye et moringa se complètent pour un apport en antioxydants, fer et vitamines qui fortifie durablement les défenses.' },
    { id: 'I16', name: 'Ananas + Citron + Gingembre + Miel', base: { type: 'Eau de coco', quantity: 150 }, ingredients: [{ name: 'Ananas', quantity: 150, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Gingembre frais', quantity: 10, unit: 'g' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'La bromélaïne de l\'ananas a des propriétés immunomodulatrices documentées. L\'eau de coco hydrate et apporte des laurates antimicrobiens. Ce mélange tropical soutient l\'immunité de façon globale.' }
  ],

  digestion: [
    { id: 'DG01', name: 'Papaye + Citron + Gingembre', base: { type: 'Eau', quantity: 150 }, ingredients: [{ name: 'Papaye', quantity: 150, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Gingembre frais', quantity: 8, unit: 'g' }], benefits: 'La papaïne de la papaye est une enzyme protéolytique naturelle qui facilite la digestion des protéines. Le citron stimule la production de bile. Le gingembre réduit les nausées et les ballonnements.' },
    { id: 'DG02', name: 'Ananas + Menthe + Citron', base: { type: 'Eau', quantity: 150 }, ingredients: [{ name: 'Ananas', quantity: 150, unit: 'g' }, { name: 'Menthe fraîche', quantity: 8, unit: 'feuilles' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }], benefits: 'La bromélaïne de l\'ananas décompose les protéines alimentaires. La menthe est l\'une des plantes digestives les plus efficaces, reconnue pour soulager les spasmes intestinaux et les ballonnements.' },
    { id: 'DG03', name: 'Concombre + Menthe + Citron', base: { type: 'Eau', quantity: 200 }, ingredients: [{ name: 'Concombre', quantity: 120, unit: 'g' }, { name: 'Menthe fraîche', quantity: 10, unit: 'feuilles' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }], benefits: 'Le concombre alcalinise le système digestif et réduit les inflammations gastriques. La menthe détend le sphincter œsophagien. Le citron stimule l\'acide chlorhydrique pour une meilleure digestion.' },
    { id: 'DG04', name: 'Tamarin + Gingembre + Miel', base: { type: 'Eau tiède', quantity: 250 }, ingredients: [{ name: 'Tamarin', quantity: 30, unit: 'g' }, { name: 'Gingembre frais', quantity: 10, unit: 'g' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'Le tamarin est un laxatif naturel doux utilisé depuis des siècles en médecine ayurvédique. Ses acides tartrique et malique stimulent la motilité intestinale. Le gingembre réduit les spasmes.' },
    { id: 'DG05', name: 'Banane + Gingembre + Lait de coco', base: { type: 'Lait de coco', quantity: 200 }, ingredients: [{ name: 'Banane mûre', quantity: 1, unit: 'unité' }, { name: 'Gingembre frais', quantity: 8, unit: 'g' }], benefits: 'La banane mûre est riche en pectine, une fibre prébiotique qui nourrit les bonnes bactéries intestinales. Le gingembre et le lait de coco créent un environnement digestif apaisant.' },
    { id: 'DG06', name: 'Bissap + Gingembre + Menthe', base: { type: 'Eau tiède', quantity: 280 }, ingredients: [{ name: 'Fleurs de bissap séchées', quantity: 12, unit: 'g' }, { name: 'Gingembre frais', quantity: 8, unit: 'g' }, { name: 'Menthe fraîche', quantity: 6, unit: 'feuilles' }], benefits: 'Le bissap est traditionnellement utilisé en Afrique de l\'Ouest pour soulager les maux d\'estomac. La menthe détend les muscles digestifs. Le gingembre réduit l\'inflammation gastro-intestinale.' },
    { id: 'DG07', name: 'Carotte + Gingembre + Citron + Cumin', base: { type: 'Eau', quantity: 150 }, ingredients: [{ name: 'Carotte', quantity: 120, unit: 'g' }, { name: 'Gingembre frais', quantity: 8, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Cumin moulu', quantity: 0.5, unit: 'c.à.c' }], benefits: 'Le cumin est une épice carminative qui réduit les gaz et les ballonnements. La carotte apporte des fibres solubles douces. Le gingembre et le citron stimulent la production d\'enzymes digestives.' },
    { id: 'DG08', name: 'Papaye + Ananas + Menthe', base: { type: 'Eau de coco', quantity: 100 }, ingredients: [{ name: 'Papaye', quantity: 100, unit: 'g' }, { name: 'Ananas', quantity: 100, unit: 'g' }, { name: 'Menthe fraîche', quantity: 6, unit: 'feuilles' }], benefits: 'Double dose d\'enzymes digestives : papaïne (papaye) et bromélaïne (ananas). Ces deux enzymes décomposent les protéines et les graisses alimentaires avec une efficacité remarquable. La menthe calme.' },
    { id: 'DG09', name: 'Mangue + Gingembre + Cannelle', base: { type: 'Eau', quantity: 100 }, ingredients: [{ name: 'Mangue', quantity: 150, unit: 'g' }, { name: 'Gingembre frais', quantity: 8, unit: 'g' }, { name: 'Cannelle', quantity: 0.5, unit: 'c.à.c' }], benefits: 'La mangue est riche en fibres digestives et en amylase naturelle. La cannelle régule la glycémie après les repas et réduit les fermentations. Le gingembre soulage les crampes digestives.' },
    { id: 'DG10', name: 'Bouye + Eau de coco + Gingembre', base: { type: 'Eau de coco', quantity: 250 }, ingredients: [{ name: 'Bouye', quantity: 20, unit: 'g' }, { name: 'Gingembre frais', quantity: 8, unit: 'g' }], benefits: 'Le bouye est traditionnellement utilisé comme digestif en Afrique de l\'Ouest. Ses fibres solubles nourrissent le microbiome intestinal. L\'eau de coco fournit des électrolytes pour rééquilibrer le système digestif.' },
    { id: 'DG11', name: 'Pastèque + Citron + Gingembre', base: { type: 'Eau', quantity: 50 }, ingredients: [{ name: 'Pastèque', quantity: 200, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Gingembre frais', quantity: 6, unit: 'g' }], benefits: 'La pastèque hydrate le côlon et facilite le transit. Son eau riche en lycopène réduit les inflammations intestinales. Le gingembre et le citron stimulent la production des sucs gastriques.' },
    { id: 'DG12', name: 'Citron + Cayenne + Eau chaude', base: { type: 'Eau chaude', quantity: 250 }, ingredients: [{ name: 'Citron', quantity: 1, unit: 'unité' }, { name: 'Piment de Cayenne', quantity: 0.25, unit: 'c.à.c' }], benefits: 'Pris à jeun, ce mélange chaud stimule l\'ensemble du système digestif. Le citron active la bile et les enzymes hépatiques. Le cayenne stimule la motilité intestinale et brûle les graisses accumulées.' },
    { id: 'DG13', name: 'Ananas + Gingembre + Fenouil', base: { type: 'Eau', quantity: 150 }, ingredients: [{ name: 'Ananas', quantity: 150, unit: 'g' }, { name: 'Gingembre frais', quantity: 8, unit: 'g' }, { name: 'Graines de fenouil', quantity: 1, unit: 'c.à.c' }], benefits: 'Le fenouil est l\'une des plantes carminatives les plus efficaces pour éliminer les gaz et les ballonnements. Associé à la bromélaïne de l\'ananas et au gingembre, ce trio soulage rapidement après les repas.' },
    { id: 'DG14', name: 'Concombre + Aloe vera + Menthe', base: { type: 'Eau', quantity: 200 }, ingredients: [{ name: 'Concombre', quantity: 120, unit: 'g' }, { name: 'Gel d\'aloe vera', quantity: 30, unit: 'ml' }, { name: 'Menthe fraîche', quantity: 8, unit: 'feuilles' }], benefits: 'L\'aloe vera est réputé pour cicatriser les muqueuses intestinales irritées. Le concombre hydrate et alcalinise. La menthe calme les spasmes. Un trio doux pour les intestins sensibles.' },
    { id: 'DG15', name: 'Bouye + Bissap + Citron', base: { type: 'Eau tiède', quantity: 250 }, ingredients: [{ name: 'Bouye', quantity: 15, unit: 'g' }, { name: 'Fleurs de bissap séchées', quantity: 10, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }], benefits: 'Mélange traditionnel sénégalais pris après les repas. Le bouye régule la glycémie post-prandiale. Le bissap stimule la digestion. Le citron active les enzymes hépatiques. Un digestif africain complet.' },
    { id: 'DG16', name: 'Gingembre + Citron + Curcuma + Miel', base: { type: 'Eau tiède', quantity: 250 }, ingredients: [{ name: 'Gingembre frais', quantity: 15, unit: 'g' }, { name: 'Citron', quantity: 1, unit: 'unité' }, { name: 'Curcuma', quantity: 0.5, unit: 'c.à.c' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'Le "golden milk" liquide. Le curcuma protège et répare la muqueuse gastrique. Le gingembre réduit l\'inflammation digestive. Le miel apaise et le citron équilibre le pH digestif.' }
  ],

  beaute: [
    { id: 'B01', name: 'Carotte + Orange + Citron', base: { type: 'Eau', quantity: 100 }, ingredients: [{ name: 'Carotte', quantity: 120, unit: 'g' }, { name: 'Orange', quantity: 1, unit: 'unité' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }], benefits: 'Le bêta-carotène de la carotte donne un éclat naturel à la peau et prépare au bronzage. La vitamine C stimule la production de collagène. Un "boisson bonne mine" efficace et naturel.' },
    { id: 'B02', name: 'Pastèque + Citron + Concombre', base: { type: 'Eau', quantity: 50 }, ingredients: [{ name: 'Pastèque', quantity: 180, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Concombre', quantity: 80, unit: 'g' }], benefits: 'La pastèque et le concombre hydratent la peau de l\'intérieur. Le lycopène de la pastèque protège contre le vieillissement photo-induit. La vitamine C du citron stimule le collagène.' },
    { id: 'B03', name: 'Bouye + Lait de coco + Miel', base: { type: 'Lait de coco', quantity: 200 }, ingredients: [{ name: 'Bouye', quantity: 20, unit: 'g' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'Le bouye est l\'un des fruits les plus riches en vitamine C, essentielle à la synthèse du collagène. Les graisses du lait de coco nourrissent la peau. Le miel est un humectant naturel puissant.' },
    { id: 'B04', name: 'Mangue + Papaye + Citron', base: { type: 'Eau', quantity: 100 }, ingredients: [{ name: 'Mangue', quantity: 100, unit: 'g' }, { name: 'Papaye', quantity: 100, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }], benefits: 'Ce duo tropical est riche en bêta-carotène, vitamines C et E. Ces trois antioxydants protègent contre le vieillissement cutané. La papaïne de la papaye améliore le teint en éliminant les cellules mortes.' },
    { id: 'B05', name: 'Bissap + Citron + Hibiscus + Miel', base: { type: 'Eau froide', quantity: 300 }, ingredients: [{ name: 'Fleurs de bissap séchées', quantity: 20, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'Les anthocyanes du bissap sont de puissants antioxydants qui protègent le collagène de la peau. Ils réduisent visiblement les signes du vieillissement. Ce "thé rouge beauté" est beau à l\'œil et bénéfique pour la peau.' },
    { id: 'B06', name: 'Concombre + Aloe vera + Citron vert', base: { type: 'Eau', quantity: 200 }, ingredients: [{ name: 'Concombre', quantity: 150, unit: 'g' }, { name: 'Gel d\'aloe vera', quantity: 30, unit: 'ml' }, { name: 'Citron vert', quantity: 0.5, unit: 'unité' }], benefits: 'L\'aloe vera est composé à 75% d\'eau et contient des polysaccharides qui hydratent la peau de l\'intérieur. Le concombre est apaisant. Ce mélange est anti-taches et illuminateur de teint.' },
    { id: 'B07', name: 'Ananas + Citron + Gingembre', base: { type: 'Eau de coco', quantity: 150 }, ingredients: [{ name: 'Ananas', quantity: 150, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Gingembre frais', quantity: 6, unit: 'g' }], benefits: 'La vitamine C de l\'ananas est particulièrement active pour stimuler la synthèse de collagène. La bromélaïne exfolie doucement la peau de l\'intérieur. L\'eau de coco hydrate profondément.' },
    { id: 'B08', name: 'Carotte + Curcuma + Gingembre + Citron', base: { type: 'Eau', quantity: 150 }, ingredients: [{ name: 'Carotte', quantity: 120, unit: 'g' }, { name: 'Curcuma', quantity: 0.5, unit: 'c.à.c' }, { name: 'Gingembre frais', quantity: 8, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }], benefits: 'Le curcuma est utilisé depuis des millénaires en cosmétique ayurvédique pour illuminer le teint. Le bêta-carotène de la carotte donne un éclat doré. Ce golden smoothie beauté agit de l\'intérieur.' },
    { id: 'B09', name: 'Épinards + Concombre + Citron + Menthe', base: { type: 'Eau', quantity: 150 }, ingredients: [{ name: 'Épinards', quantity: 60, unit: 'g' }, { name: 'Concombre', quantity: 100, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Menthe fraîche', quantity: 6, unit: 'feuilles' }], benefits: 'La chlorophylle des épinards est structurellement similaire à l\'hémoglobine. Elle oxygène et purifie le sang, ce qui se reflète sur l\'éclat de la peau. Le concombre hydrate et le citron illumine.' },
    { id: 'B10', name: 'Bouye + Orange + Carotte', base: { type: 'Eau', quantity: 150 }, ingredients: [{ name: 'Bouye', quantity: 15, unit: 'g' }, { name: 'Orange', quantity: 1, unit: 'unité' }, { name: 'Carotte', quantity: 100, unit: 'g' }], benefits: 'Triple source de vitamine C et bêta-carotène. Cette combinaison africaine est optimale pour la production de collagène et la protection solaire naturelle. La peau est lumineuse et protégée.' },
    { id: 'B11', name: 'Mangue + Lait de coco + Curcuma', base: { type: 'Lait de coco', quantity: 200 }, ingredients: [{ name: 'Mangue', quantity: 150, unit: 'g' }, { name: 'Curcuma', quantity: 0.5, unit: 'c.à.c' }], benefits: 'Les graisses MCT du lait de coco nourrissent les membranes cellulaires de la peau. La mangue apporte les vitamines A, C et E. Le curcuma unifie le teint et réduit les taches pigmentaires.' },
    { id: 'B12', name: 'Pastèque + Bissap + Citron', base: { type: 'Eau', quantity: 100 }, ingredients: [{ name: 'Pastèque', quantity: 150, unit: 'g' }, { name: 'Fleurs de bissap séchées', quantity: 10, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }], benefits: 'Le lycopène de la pastèque filtre naturellement les UV (équivalent SPF 3). Les anthocyanes du bissap protègent le collagène. Ce duo rouge est anti-âge et protecteur solaire naturel.' },
    { id: 'B13', name: 'Tamarin + Miel + Curcuma', base: { type: 'Eau tiède', quantity: 200 }, ingredients: [{ name: 'Tamarin', quantity: 20, unit: 'g' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }, { name: 'Curcuma', quantity: 0.5, unit: 'c.à.c' }], benefits: 'Ce mélange est un "skin tonic" africain traditionnel. L\'acide tartrique du tamarin est un exfoliant naturel chimique. Le miel humecte. Le curcuma unifie. Un trio beauté au pouvoir de brightening naturel.' },
    { id: 'B14', name: 'Moringa + Citron + Miel', base: { type: 'Eau', quantity: 250 }, ingredients: [{ name: 'Poudre de moringa', quantity: 5, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'Le moringa contient de la zéatine, une cytokinine qui ralentit le vieillissement cellulaire. Ses antioxydants protègent l\'ADN des cellules cutanées. Un "elixir jeunesse" africain aux preuves traditionnelles.' },
    { id: 'B15', name: 'Papaye + Concombre + Aloe vera', base: { type: 'Eau de coco', quantity: 150 }, ingredients: [{ name: 'Papaye', quantity: 120, unit: 'g' }, { name: 'Concombre', quantity: 80, unit: 'g' }, { name: 'Gel d\'aloe vera', quantity: 25, unit: 'ml' }], benefits: 'La papaïne de la papaye exfolie en douceur. L\'aloe vera répare et hydrate. Le concombre réduit l\'inflammation. L\'eau de coco nourrit. Ce smoothie est un soin de peau complet de l\'intérieur.' },
    { id: 'B16', name: 'Ananas + Moringa + Citron vert', base: { type: 'Eau de coco', quantity: 150 }, ingredients: [{ name: 'Ananas', quantity: 150, unit: 'g' }, { name: 'Poudre de moringa', quantity: 5, unit: 'g' }, { name: 'Citron vert', quantity: 0.5, unit: 'unité' }], benefits: 'L\'ananas fournit vitamine C et bromélaïne pour le collagène. Le moringa apporte des antioxydants exceptionnels. L\'eau de coco et le citron vert hydratent et illuminent la peau durablement.' }
  ],

  stress: [
    { id: 'S01', name: 'Banane + Lait de coco + Cannelle', base: { type: 'Lait de coco', quantity: 200 }, ingredients: [{ name: 'Banane mûre', quantity: 1, unit: 'unité' }, { name: 'Cannelle', quantity: 0.5, unit: 'c.à.c' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'La banane est riche en tryptophane, précurseur de la sérotonine (hormone du bonheur). Le magnésium du lait de coco réduit l\'anxiété. La cannelle stabilise la glycémie pour éviter les pics de cortisol.' },
    { id: 'S02', name: 'Mangue + Lait de coco + Vanille', base: { type: 'Lait de coco', quantity: 200 }, ingredients: [{ name: 'Mangue', quantity: 150, unit: 'g' }, { name: 'Vanille', quantity: 0.5, unit: 'c.à.c' }], benefits: 'La vanille contient de la vanilline aux propriétés anxiolytiques documentées. La mangue apporte des vitamines B6 impliquées dans la synthèse de neurotransmetteurs apaisants. Un smoothie doux pour le stress.' },
    { id: 'S03', name: 'Pastèque + Menthe + Citron', base: { type: 'Eau', quantity: 50 }, ingredients: [{ name: 'Pastèque', quantity: 200, unit: 'g' }, { name: 'Menthe fraîche', quantity: 10, unit: 'feuilles' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }], benefits: 'La pastèque contient du L-citrulline qui améliore la circulation sanguine et réduit la tension artérielle liée au stress. La menthe est reconnue pour ses effets relaxants sur le système nerveux.' },
    { id: 'S04', name: 'Banane + Datte + Lait d\'amande', base: { type: 'Lait d\'amande', quantity: 250 }, ingredients: [{ name: 'Banane mûre', quantity: 1, unit: 'unité' }, { name: 'Dattes Medjool', quantity: 3, unit: 'unités' }, { name: 'Cannelle', quantity: 0.5, unit: 'c.à.c' }], benefits: 'Ce smoothie anti-stress est riche en magnésium (dattes, amandes) et en tryptophane (banane). Le magnésium est le minéral anti-stress par excellence. La cannelle évite les pics glycémiques anxiogènes.' },
    { id: 'S05', name: 'Concombre + Menthe + Citron vert + Gingembre', base: { type: 'Eau', quantity: 200 }, ingredients: [{ name: 'Concombre', quantity: 120, unit: 'g' }, { name: 'Menthe fraîche', quantity: 10, unit: 'feuilles' }, { name: 'Citron vert', quantity: 0.5, unit: 'unité' }, { name: 'Gingembre frais', quantity: 5, unit: 'g' }], benefits: 'Ce mélange frais et léger réduit la tension artérielle. Le concombre et la menthe ont des effets rafraîchissants sur le système nerveux. Le gingembre doux aide à gérer les réponses au stress.' },
    { id: 'S06', name: 'Papaye + Lait de coco + Vanille', base: { type: 'Lait de coco', quantity: 200 }, ingredients: [{ name: 'Papaye', quantity: 150, unit: 'g' }, { name: 'Vanille', quantity: 0.5, unit: 'c.à.c' }], benefits: 'La papaye contient du magnésium et du potassium qui régulent le système nerveux. La vanille est un anxiolytique doux. Le lait de coco apporte des graisses saines pour la santé cérébrale.' },
    { id: 'S07', name: 'Ananas + Menthe + Citron + Cannelle', base: { type: 'Eau de coco', quantity: 150 }, ingredients: [{ name: 'Ananas', quantity: 150, unit: 'g' }, { name: 'Menthe fraîche', quantity: 8, unit: 'feuilles' }, { name: 'Cannelle', quantity: 0.5, unit: 'c.à.c' }], benefits: 'L\'ananas contient de la sérotonine naturelle et du tryptophane. La menthe agit sur les récepteurs GABA du cerveau pour réduire l\'anxiété. La cannelle équilibre le sucre sanguin, source de stress métabolique.' },
    { id: 'S08', name: 'Mangue + Gingembre + Citron + Miel', base: { type: 'Eau', quantity: 150 }, ingredients: [{ name: 'Mangue', quantity: 150, unit: 'g' }, { name: 'Gingembre frais', quantity: 6, unit: 'g' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'La mangue est riche en acide folique et vitamines B nécessaires à la production de sérotonine. Le miel contient des flavonoïdes anxiolytiques. Le gingembre réduit le cortisol.' },
    { id: 'S09', name: 'Bouye + Banane + Lait de coco', base: { type: 'Lait de coco', quantity: 200 }, ingredients: [{ name: 'Bouye', quantity: 15, unit: 'g' }, { name: 'Banane mûre', quantity: 1, unit: 'unité' }], benefits: 'Le bouye sénégalais est riche en vitamine B6, cofacteur de la synthèse de GABA et sérotonine. La banane apporte le tryptophane. Le lait de coco nourrit le cerveau. Un anti-stress africain naturel.' },
    { id: 'S10', name: 'Bissap + Menthe + Citron + Miel', base: { type: 'Eau froide', quantity: 300 }, ingredients: [{ name: 'Fleurs de bissap séchées', quantity: 15, unit: 'g' }, { name: 'Menthe fraîche', quantity: 10, unit: 'feuilles' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'La menthe agit sur les récepteurs sérotoninergiques. Le bissap est légèrement sédatif. Ensemble, cette infusion froide est une boisson de détente idéale pour les fins de journée stressantes.' },
    { id: 'S11', name: 'Pastèque + Basilic + Citron vert', base: { type: 'Eau', quantity: 50 }, ingredients: [{ name: 'Pastèque', quantity: 200, unit: 'g' }, { name: 'Basilic frais', quantity: 8, unit: 'feuilles' }, { name: 'Citron vert', quantity: 0.5, unit: 'unité' }], benefits: 'Le basilic contient du linalol et de l\'eugénol aux propriétés adaptogènes légères. Il aide l\'organisme à s\'adapter au stress. La pastèque hydrate et apporte du magnésium naturel.' },
    { id: 'S12', name: 'Carotte + Gingembre + Cannelle + Miel', base: { type: 'Lait de coco', quantity: 200 }, ingredients: [{ name: 'Carotte', quantity: 120, unit: 'g' }, { name: 'Gingembre frais', quantity: 6, unit: 'g' }, { name: 'Cannelle', quantity: 0.5, unit: 'c.à.c' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'La carotte apporte du bêta-carotène et du potassium qui régulent la tension artérielle. La cannelle stabilise la glycémie. Ce mélange doux et épicé réduit les réponses physiologiques au stress.' },
    { id: 'S13', name: 'Tamarin + Datte + Lait de coco', base: { type: 'Lait de coco', quantity: 200 }, ingredients: [{ name: 'Tamarin', quantity: 20, unit: 'g' }, { name: 'Dattes Medjool', quantity: 3, unit: 'unités' }], benefits: 'Le tamarin contient du magnésium et des acides aminés relaxants. Les dattes fournissent du tryptophane et du magnésium. Ce mélange doux sénégalais est un sédatif naturel pour les nuits agitées.' },
    { id: 'S14', name: 'Ananas + Concombre + Menthe + Citron', base: { type: 'Eau', quantity: 100 }, ingredients: [{ name: 'Ananas', quantity: 120, unit: 'g' }, { name: 'Concombre', quantity: 100, unit: 'g' }, { name: 'Menthe fraîche', quantity: 8, unit: 'feuilles' }, { name: 'Citron', quantity: 0.5, unit: 'unité' }], benefits: 'Ce mélange frais et léger est idéal pour les périodes de tension. L\'ananas apporte des enzymes digestives qui réduisent le stress intestinal. La menthe et le concombre calment le système nerveux.' },
    { id: 'S15', name: 'Moringa + Banane + Lait de coco + Miel', base: { type: 'Lait de coco', quantity: 200 }, ingredients: [{ name: 'Poudre de moringa', quantity: 5, unit: 'g' }, { name: 'Banane mûre', quantity: 1, unit: 'unité' }, { name: 'Miel', quantity: 1, unit: 'c.à.s' }], benefits: 'Le moringa est un adaptogène documenté qui aide l\'organisme à gérer le stress chronique. Sa richesse en vitamine B et magnésium régule le système nerveux. La banane et le miel complètent cet anti-stress naturel.' },
    { id: 'S16', name: 'Bouye + Datte + Cannelle + Lait de coco', base: { type: 'Lait de coco', quantity: 200 }, ingredients: [{ name: 'Bouye', quantity: 15, unit: 'g' }, { name: 'Dattes Medjool', quantity: 3, unit: 'unités' }, { name: 'Cannelle', quantity: 0.5, unit: 'c.à.c' }], benefits: 'Ce smoothie du soir associe le bouye riche en vitamines B au magnésium des dattes et aux propriétés équilibrantes de la cannelle. Un anti-stress africain doux pour un sommeil apaisé.' }
  ]
};

// ===== UTILITAIRES =====
const CATEGORY_LABELS = {
  energie: '⚡ Énergie',
  detox: '🌿 Détox',
  immunite: '🛡️ Immunité',
  digestion: '🌱 Digestion',
  beaute: '✨ Beauté',
  stress: '🧘 Anti-Stress'
};

const shuffleFisherYates = (array, usedIds = []) => {
  const available = array.filter(mix => !usedIds.includes(mix.id));
  const pool = available.length > 0 ? available : array;
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled[0];
};

const formatQuantity = (qty, unit) => {
  if (Number.isInteger(qty)) return `${qty} ${unit}`;
  const intPart = Math.floor(qty);
  if (Math.abs(qty - intPart - 0.5) < 0.01) return intPart > 0 ? `${intPart}½ ${unit}` : `½ ${unit}`;
  return `${qty.toFixed(1).replace('.', ',')} ${unit}`;
};

// ===== COMPOSANT PRINCIPAL =====
function App() {
  const [currentCategory, setCurrentCategory] = useState('energie');
  const [currentMixture, setCurrentMixture] = useState(null);
  const [usedMixtures, setUsedMixtures] = useState([]);
  const [peopleCount, setPeopleCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const calculateQuantities = useCallback((mixture) => {
    if (!mixture) return null;
    return {
      ...mixture,
      base: { ...mixture.base, quantity: parseFloat((mixture.base.quantity * peopleCount).toFixed(1)) },
      ingredients: mixture.ingredients.map(ing => ({
        ...ing,
        quantity: parseFloat((ing.quantity * peopleCount).toFixed(2))
      }))
    };
  }, [peopleCount]);

  const generateMixture = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const newMixture = shuffleFisherYates(MIXTURES_DB[currentCategory], usedMixtures);
      setCurrentMixture(newMixture);
      setUsedMixtures(prev => [...prev, newMixture.id].slice(-16));
      setIsLoading(false);
    }, 800);
  }, [currentCategory, usedMixtures]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setUsedMixtures([]);
    // On réinitialise volontairement les mélanges utilisés lors du changement de catégorie
    // eslint-disable-next-line
    generateMixture();
  }, [currentCategory]); // eslint-disable-line

  const exportPDF = useCallback(() => {
    if (!currentMixture) return;
    const scaled = calculateQuantities(currentMixture);
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Fond header
    doc.setFillColor(44, 26, 14);
    doc.rect(0, 0, 210, 35, 'F');

    // Titre
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('CADEYA SMOOTHIES', 105, 16, { align: 'center' });

    // Sous-titre
    doc.setTextColor(201, 123, 46);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(CATEGORY_LABELS[currentCategory] || currentCategory, 105, 26, { align: 'center' });

    // Nom du mélange
    doc.setTextColor(44, 26, 14);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(currentMixture.name, 105, 50, { align: 'center' });

    // Ligne décorative
    doc.setDrawColor(201, 123, 46);
    doc.setLineWidth(0.8);
    doc.line(20, 55, 190, 55);

    // Ingrédients
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(201, 123, 46);
    doc.text(`INGRÉDIENTS — ${peopleCount} personne${peopleCount > 1 ? 's' : ''}`, 20, 65);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(44, 26, 14);
    doc.setFontSize(10);
    let y = 74;

    scaled.ingredients.forEach(ing => {
      doc.text(`▸  ${ing.name}: ${formatQuantity(ing.quantity, ing.unit)}`, 25, y);
      y += 8;
    });

    doc.setFont('helvetica', 'bold');
    doc.text(`💧 Base: ${formatQuantity(scaled.base.quantity, 'ml')} ${scaled.base.type}`, 25, y + 2);
    y += 12;

    // Ligne
    doc.setDrawColor(238, 230, 220);
    doc.line(20, y, 190, y);
    y += 8;

    // Bienfaits
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(201, 123, 46);
    doc.setFontSize(11);
    doc.text('NOTES BIENFAITS', 20, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(92, 51, 23);
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(currentMixture.benefits, 165);
    doc.text(lines, 20, y);
    y += lines.length * 5.5 + 8;

    // Footer
    doc.setFillColor(44, 26, 14);
    doc.rect(0, 277, 210, 20, 'F');
    doc.setTextColor(201, 123, 46);
    doc.setFontSize(8);
    doc.text('Généré par IA · Cadeya Smoothies © 2026 · cadeya.com', 105, 288, { align: 'center' });

    doc.save(`Cadeya-${currentMixture.id}-${peopleCount}p.pdf`);
  }, [currentMixture, peopleCount, calculateQuantities, currentCategory]);

  const scaledMixture = currentMixture ? calculateQuantities(currentMixture) : null;

  // ===== SPLASH =====
  if (showSplash) return (
    <div className="splash-screen">
      <div className="splash-content">
        <img src={logo} alt="Cadeya" className="logo-img" />
        <h1>CADEYA SMOOTHIES</h1>
        <p>GÉNÉRATEUR DE MÉLANGES SANTÉ</p>
      </div>
    </div>
  );

  // ===== APP =====
  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <img src={logo} alt="Cadeya" className="header-logo" />
          <div>
            <h1>CADEYA SMOOTHIES</h1>
            <span>GÉNÉRATEUR DE MÉLANGES SANTÉ</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Catégories */}
        <div className="categories">
          {Object.keys(MIXTURES_DB).map(cat => (
            <button
              key={cat}
              className={`category-btn ${currentCategory === cat ? 'active' : ''}`}
              onClick={() => setCurrentCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Compteur personnes */}
        <div className="people-counter">
          <label>Pour <strong>{peopleCount}</strong> personne{peopleCount > 1 ? 's' : ''}</label>
          <input
            type="range" min="1" max="20" value={peopleCount}
            onChange={e => setPeopleCount(Number(e.target.value))}
          />
        </div>

        {/* Carte mélange */}
        <div className="mixture-card">
          {isLoading ? (
            <div className="loading">Génération en cours...</div>
          ) : scaledMixture ? (
            <>
              <img src={logo} alt="Cadeya" className="card-logo" />
              <span className="category-badge">{CATEGORY_LABELS[currentCategory]}</span>
              <h2>{currentMixture.name}</h2>

              <div className="ingredients">
                <h3>Ingrédients ({peopleCount} personne{peopleCount > 1 ? 's' : ''})</h3>
                <ul>
                  {scaledMixture.ingredients.map((ing, i) => (
                    <li key={i}>
                      {ing.name}: <strong>{formatQuantity(ing.quantity, ing.unit)}</strong>
                    </li>
                  ))}
                </ul>
                <div className="base">
                  Base: <strong>{formatQuantity(scaledMixture.base.quantity, 'ml')} {scaledMixture.base.type}</strong>
                </div>
              </div>

              <div className="benefits">
                <h3>Notes bienfaits</h3>
                <p>{currentMixture.benefits}</p>
              </div>

              <div className="certification">Généré par IA · Cadeya Smoothies © 2026</div>

              <div className="actions">
                <button className="btn-primary" onClick={generateMixture}>🎲 Nouveau mélange</button>
                <button className="btn-secondary" onClick={exportPDF}>📄 Exporter PDF</button>
              </div>
            </>
          ) : (
            <div className="loading">Chargement...</div>
          )}
        </div>

        {/* Bannière démo */}
        <div className="payment-demo">
          <p>🚀 Mode démo GRATUIT · PayDunya intégration Phase 2</p>
        </div>
      </main>

      <footer className="footer">
        <img src={logo} alt="Cadeya" className="footer-logo" />
        <p>© 2026 Cadeya Smoothies · Tous droits réservés</p>
      </footer>
    </div>
  );
}

export default App;
