---
stepsCompleted: [1, 2, 3]
inputDocuments: 
  - .github/copilot-instructions.md
  - README.md
  - docs/supabase-schema.md
workflowType: 'prd'
lastStep: 3
briefCount: 0
researchCount: 0
brainstormingCount: 0
projectDocsCount: 3
---

# Product Requirements Document - taskflow - Copy

**Author:** smfcoder
**Date:** 2026-01-06

## Executive Summary

### Product Vision

**Taskflow** est une application de formation d'habitudes cross-platform (Web + Android) qui évolue d'un tracker fonctionnel vers un **système d'engagement comportemental adaptatif**. Cette phase MVP transforme l'application existante en ajoutant trois piliers : **notifications intelligentes auto-adaptatives**, **gamification psychologique à timing optimal**, et **économie de récompense soutenable**.

### Brownfield Context

L'application existante (Angular 21 + Supabase + Tailwind v4) fournit les fondations :
- Architecture standalone components, SupabaseService pattern, Angular Signals
- Pages : Dashboard, Habit Form, Calendar, Login, Settings
- Données : Habits avec fréquences, logging, streaks

### MVP Feature Additions

**Phase 1 - Corrections Structurelles**
- Rendre fonctionnelle la page **All Habits**
- Fusionner **Profile → Settings**
- Implémenter **persistance Settings** (nouvelle table `user_settings`)

**Phase 2 - Système de Notifications Adaptatif Intelligent**

**Architecture Décisionnelle :**
- **Algorithme :** Rule-based system via Supabase Edge Functions (pas de ML complexe)
- **Analyse comportementale :** 7 derniers jours → ajuste fréquence notifications
  - 6-7 complétions = Zen (1 notif/jour)
  - 3-5 complétions = Balanced (2 notifs/jour)
  - 0-2 complétions = Persistent (3-4 notifs/jour)
- **Transparence zéro friction :** L'utilisateur n'a RIEN à configurer, le système s'adapte automatiquement
- **Override disponible :** Settings avancés pour power users seulement

**Implémentation Multi-Plateforme (Dégradation Gracieuse) :**
- **Android (Capacitor)** : Notifications riches avec Action Buttons ("✓ Fait !"), expansion avec animations
- **Web Push** : Notifications standard avec deep links (API limitée, pas d'animations)
- **iOS** : Phase 2 (si Capacitor permet facilement, sinon reporté)

**UX Onboarding Simplifié :**
- Jour 1-3 : Aucune mention de modes, fonctionne en coulisses
- Jour 4+ : Si irrégularité → notification explique "On augmente les rappels 💪"
- Progressive disclosure : 95% des utilisateurs ne pensent jamais aux modes

**Phase 3 - Gamification à 3 Niveaux Optimisée**

**Niveau 1 (Immédiat - Timing Psychologique) :**
- **Première complétion** : Animation complète ~800ms (confettis, son, haptic)
- **Complétions suivantes** : Animation subtile ~300ms (checkmark, haptic)
- **Performance Target :** 60fps sur Snapdragon 700+, <100ms render

**Niveau 2 (Milestones Streaks) :**
- **3/5/7/14/30 jours** : Animations épiques ~2s (fireworks, messages motivants)
- Célébrations amplifiées avec progression visualisée

**Niveau 3 (Économie de Points) :**

**Attribution Points :**
- Complétion : 100pts
- Streak 3j : +500pts | 7j : +1,500pts | 14j : +3,000pts | 30j : +10,000pts
- Perfection hebdomadaire : +2,000pts

**Seuils de Récompense (3 Tiers) :**
- **Tier 1** (Quick Wins) : 5K-7.5K pts = Thème/Analytics premium 7j
- **Tier 2** (Mid-Term) : 15K-25K pts = Feature premium 14j / 1 mois gratuit
- **Tier 3** (Ultra Rare) : 50K-100K pts = Badge exclusif / Lifetime (1% atteignent)

**Économie Soutenable :**
- Utilisateur parfait génère ~18K pts/mois
- Pour 1 mois gratuit (25K) = 6-8 semaines perfection
- Business impact acceptable (LTV élevé si SI engagé)

**Sécurité :**
- Supabase RLS : Users READ only, Edge Functions WRITE only
- Transactions atomiques, anti-tampering

**Phase 4 - Revamp Dashboard**
- Design plus intuitif avec feedback dopaminergique
- Intégration animations de récompense seamless
- Respect "Reduce Motion" accessibility

### What Makes This Special

**1. Intelligence Invisible**

Le mode adaptatif par défaut **retire une décision cognitive**. L'utilisateur n'a pas à deviner quel style de rappel lui convient - l'app apprend et ajuste. C'est un parent qui donne plus de liberté quand on fait confiance, plus de structure quand on dévie. Psychologiquement brillant.

**2. Dopamine Distribuée Stratégiquement**

**Timing optimal basé sur recherche UX :**
- Immédiat (checkbox) : Récompense pavlovienne <500ms
- Milestones (streaks) : Célébrations épiques attendues
- Long-terme (points) : Objectif secondaire qui survit aux échecs

Distribution temporelle combat abandon post-échec de streak.

**3. Économie de Motivation Équilibrée**

Système de points avec **3 tiers psychologiques** :
- Quick wins maintiennent engagement court-terme
- Mid-term goals créent aspiration
- Ultra rare donnent bragging rights (1% seulement)

Récompense consistance sans cannibaliser monétisation.

**4. Pragmatisme Technique**

Pas de sur-engineering. Rule-based vs ML. Dégradation gracieuse multi-plateforme. Android first pour innovation (rich notifications), fallback simple ailleurs.

**Le moment "aha" utilisateur :**

"L'app comprend quand j'ai besoin d'aide vs quand me laisser tranquille. Et putain, ces confettis me rendent heureux."

## Project Classification

**Technical Type:** web_app → web_app + mobile_app (Capacitor hybrid)

**Platform Strategy:**
- Web: PWA + Web Push API (limited richness)
- Android: Capacitor native (rich notifications prioritaires MVP)
- iOS: Phase 2 evaluation

**Domain:** General + Behavioral Psychology + Gamification

**Complexity:** Medium-High
- Adaptive notification engine (rule-based, Supabase Edge Functions)
- Rich notifications Android (Action Buttons, expandable)
- Points economy avec RLS security
- Animation performance optimization
- Cross-platform graceful degradation

**Architecture Decisions :**
- Supabase Edge Functions pour logique adaptive (serverless, scalable)
- Rule-based system (pas ML) : prévisible, testable, debuggable
- RLS + transactions atomiques pour points (anti-tampering)
- Animation budget <100ms render sur mid-range devices

**New Tables Required:**
- `user_settings` (notification preferences, adaptive state)
- `user_points` (points balance, transaction history, RLS protected)
- `notification_log` (analytics, effectiveness tracking)

**Testability Requirements :**

**Success Metrics (KPIs) :**
- 40%+ users en Zen mode après 30j (adaptive fonctionne)
- +15% taux complétion post-gamification
- Persistent 60%+ open rate, Zen 30%+ open rate

**Test Coverage:**
- Manual matrix : 18 scenarios cross-platform
- Appium Android, Selenium Web (partial ok)
- Battery drain testing 3 devices
- 80%+ code coverage sur nouveaux services
- Existing Angular tests 100% pass (regression)

**Performance Targets:**
- 60fps animations sur Snapdragon 700+
- Confettis <100ms render time
- Respect "Reduce Motion" accessibility

