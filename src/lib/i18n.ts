import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const en = {
  nav: { home: 'Home', cycle: 'Cycle', chart: 'Chart', transits: 'Transits', messages: 'Messages', profile: 'Profile' },
  welcome: { tagline: 'Your cycle meets the cosmos', subtitle: 'Track your period, discover your chart, and receive daily cosmic insights personalized to you.', cta: 'Begin Your Journey', signin: 'Already have an account? Sign in' },
  onboarding: {
    next: 'Continue', back: 'Back', skip: 'Skip', step: 'Step {{current}} of {{total}}',
    birthDate: { title: 'When were you born?', subtitle: 'Your birth date unlocks your sun sign and natal chart.' },
    birthTime: { title: 'What time were you born?', subtitle: 'Your birth time reveals your rising sign.', known: 'I know my birth time', unknown: "I don't know my birth time" },
    birthPlace: { title: 'Where were you born?', subtitle: 'Your birthplace completes your natal chart.', placeholder: 'Type any city worldwide...' },
    periodTracking: { title: 'Do you want to track your period?', subtitle: 'Combine your cycle with your cosmic chart for deeper insights.', yes: 'Yes, track my cycle', no: 'No thanks' },
    periodRegularity: { title: 'Does your period come regularly?', subtitle: 'Understanding your cycle pattern helps with predictions.', yes: 'Yes, fairly regular', yesDesc: 'My cycle is predictable', no: "No, it's irregular", noDesc: 'My cycle varies' },
    lastPeriodKnowledge: { title: 'Do you know when your last period was?', subtitle: 'This helps us predict your upcoming cycle.', yes: 'Yes, I remember', yesDesc: 'I can provide the dates', no: "No, I don't remember", noDesc: 'Skip this step' },
    lastPeriod: { title: 'When was your last period?', subtitle: 'Select the start and end dates.' },
    lifestyle: { title: 'Are you using hormonal birth control?', subtitle: 'This affects cycle predictions and hormonal patterns.', yes: 'Yes', yesDesc: "I'm currently using hormonal birth control", no: 'No', noDesc: "I'm not using hormonal birth control" },
    hormonal: { title: 'How are you feeling?', subtitle: 'This helps us understand your current state.' },
    currentCity: { title: 'Where are you located now?', subtitle: 'Your current city for daily transit calculations.' },
    calculating: { title: 'Calculating your chart...', subtitle: 'Reading the stars at the moment of your birth.' },
    startDate: 'Start Date', endDate: 'End Date', pickStartFirst: 'Pick a start date first',
  },
  paywall: {
    title: 'Your cosmic journey awaits!', subtitle: 'Unlock your personalized chart and full app features',
    trial: '1 week full access', then: 'then {{price}}/month', free: 'Continue for free', freeDesc: 'Basic cycle tracking only',
    cta: 'Get Full Access ✦', freeCta: 'Continue for Free →', selectPlan: 'Select a plan to continue',
    disclaimer: 'Payment handled securely. Cancel anytime. Your data is always private.',
    features: { chart: 'Complete birth chart analysis', transits: 'Daily transit predictions', cycle: 'Period cycle tracking & forecasting', hormonal: 'Hormonal pattern insights', moon: 'Moon phase integration', wellness: 'Personalized wellness tips', unlimited: 'Unlimited chart access' },
  },
  auth: {
    signup: { title: 'Create your account', subtitle: 'Begin your cosmic wellness journey.', button: 'Create Account', login: 'Already have an account? Sign in' },
    login: { title: 'Welcome back', subtitle: 'Your cosmic journey continues.', button: 'Sign In', signup: "Don't have an account? Create one", forgot: 'Forgot password?' },
    name: 'Your name', email: 'Email address', password: 'Password',
    signingIn: 'Signing in...', creatingAccount: 'Creating account...',
    terms: 'By creating an account you agree to our terms of service and privacy policy.',
  },
  home: { greeting: 'Welcome back, {{name}} ✨', cycleDay: 'day', nextPeriod: 'Next period in {{days}} days · {{date}}', todayInsight: "Today's Cosmic Insight", todayWellness: "Today's Wellness", moon: 'Moon', transit: 'Transit', sunSign: 'Sun Sign', mood: 'Mood', stress: 'Stress', sleep: 'Sleep', notLogged: 'Not logged', readMore: 'Read full message' },
  cycle: {
    title: 'Your Cycle', addPeriod: 'Add Period', cycleLength: 'Cycle length: {{days}} days', nextPeriod: 'Next period: {{date}} · {{days}} days', day: 'day',
    phases: { menstrual: 'Menstrual Phase', follicular: 'Follicular Phase', ovulation: 'Ovulation Phase', luteal: 'Luteal Phase', unknown: 'Tracking...' },
    phaseDesc: { menstrual: 'Rest and restore. Your body is releasing.', follicular: 'Energy rising. Good time to start new things.', ovulation: 'Peak energy and confidence. You are magnetic.', luteal: 'Turn inward. Slow down and reflect.' },
    log: { title: 'Log {{date}}', flow: 'Period Flow', mood: 'Mood', symptoms: 'Symptoms', discharge: 'Discharge', sex: 'Sexual Activity', notes: 'Notes', save: 'Save Log', notesPlaceholder: 'How are you feeling today?', sexYes: '❤️ Yes', sexLog: '+ Log' },
    flow: { spotting: 'Spotting', light: 'Light', medium: 'Medium', heavy: 'Heavy' },
    moods: { happy: '😊 Happy', sad: '😔 Sad', irritable: '😤 Irritable', anxious: '😰 Anxious', tired: '😴 Tired', energetic: '⚡ Energetic', calm: '💆 Calm', overwhelmed: '🤯 Overwhelmed' },
    symptoms: { cramps: 'Cramps', bloating: 'Bloating', headache: 'Headache', fatigue: 'Fatigue', backache: 'Backache', nausea: 'Nausea', spotting: 'Spotting', tenderBreasts: 'Tender breasts', cravings: 'Cravings', insomnia: 'Insomnia', acne: 'Acne', moodSwings: 'Mood swings' },
    discharge: { none: 'None', dry: 'Dry', sticky: 'Sticky', creamy: 'Creamy', watery: 'Watery', eggWhite: 'Egg white' },
    history: 'Period History', noHistory: 'No periods logged yet. Add your last period to start tracking.',
    legend: { period: 'Period', predicted: 'Predicted', fertile: 'Fertile', ovulation: 'Ovulation' },
    addPeriodTitle: 'Add Period', savePeriod: 'Save Period',
    weekdays: { su: 'Su', mo: 'Mo', tu: 'Tu', we: 'We', th: 'Th', fr: 'Fr', sa: 'Sa' },
  },
  chart: { title: 'Your Birth Chart', sun: 'Sun', moon: 'Moon', rising: 'Rising', venus: 'Venus', mars: 'Mars', mercury: 'Mercury', jupiter: 'Jupiter', saturn: 'Saturn', sunDesc: 'Core identity and life force', moonDesc: 'Emotions and instincts', risingDesc: 'How others see you', venusDesc: 'Love and attraction', marsDesc: 'Drive and desire', mercuryDesc: 'Communication and mind', jupiterDesc: 'Expansion and wisdom', saturnDesc: 'Structure and discipline', calculating: 'Calculating...' },
  transits: {
    title: 'Live Transits', subtitle: 'Current planets aspecting your natal chart', updated: 'Updated {{time}}',
    activeNow: 'Active now', intensity: 'intensity', scanning: 'Scanning the current sky...',
    noTransits: 'No major transits active right now', noTransitsDesc: 'The sky is relatively quiet for your chart today.',
    noChart: 'Complete your birth chart first to see transits.',
    phase: 'Reading transits for your {{phase}} Phase', phaseSubtitle: 'how the current sky interacts with your natal {{sun}} Sun and {{moon}} Moon.',
    aspectGuide: 'Aspect Guide',
    aspects: { conjunction: 'Conjunction', trine: 'Trine', square: 'Square', opposition: 'Opposition', sextile: 'Sextile' },
    aspectDesc: { conjunction: 'Merging energies', trine: 'Harmonious flow', square: 'Tension & growth', opposition: 'Awareness & balance', sextile: 'Opportunity & ease' },
    planets: { sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn' },
  },
  messages: {
    title: 'Messages', new: '{{count}} new', phase: '{{phase}} Phase · Day {{day}}',
    loading: 'Reading your cosmic blueprint...', loadingDesc: 'Combining your natal chart with your {{phase}} phase energy',
    noMessages: 'No predictions yet', generate: "Generate Today's Insights", refresh: 'Refresh',
    notice: 'Your daily insights are generated fresh each day using your natal chart and current cycle phase. Tap the refresh icon for new predictions.',
    tryAgain: 'Try again', error: 'Could not load predictions. Please try again.',
  },
  profile: { title: 'Your Profile', birthInfo: 'Birth Info', dateOfBirth: 'Date of Birth', birthTime: 'Birth Time', birthPlace: 'Birth Place', currentCity: 'Current City', cycleInfo: 'Cycle Info', avgCycle: 'Avg Cycle Length', lastPeriodStart: 'Last Period Start', lastPeriodEnd: 'Last Period End', tracksPeriods: 'Tracks Periods', subscription: 'Subscription', status: 'Status', premium: '✦ Premium', free: 'Free', upgrade: 'Upgrade to Premium', support: 'Support', contactSupport: 'Contact Support', privacy: 'Privacy Policy', terms: 'Terms of Service', logout: 'Log Out', language: 'Language', selectLanguage: 'Select Language', days: 'days', yes: 'Yes', no: 'No', notSet: 'Not set', version: 'ZodiacCycle v1.0.0 · Made with ✦ for the cosmos' },
  landing: { heroLine1: 'Your Cycle,', heroLine2: 'Your Stars', feature1Title: 'Full Birth Chart', feature1Desc: 'Complete astrological analysis based on your exact birth time and location', feature2Title: 'Transit Insights', feature2Desc: 'Understand how current planetary movements affect your cycle and wellness', feature3Title: 'Smart Tracking', feature3Desc: 'Period and symptom tracking combined with astrological timing', subCta: 'Get started with your personalized cosmic wellness journey' },
  birthTimeInfo: { title: 'Why we need this information', sunDesc: 'Your birth date determines your Sun sign and core personality traits', moonDesc: 'Birth time and location help us calculate your Moon and Ascendant signs for deeper insights', planetsTitle: 'Planetary Positions', planetsDesc: 'Exact birth details allow us to map all planetary positions in your chart' },
  notifications: {
    title: 'Notifications', empty: 'No notifications yet', emptyBody: "We'll notify you about your cycle, transits, and daily insights", markAllRead: 'Mark all as read',
    periodSoonTitle: '🔴 Period due soon', periodSoonBody: 'Your period is expected in {{days}} days · {{date}}', periodToday: 'Your period may start today. Take it easy 💙',
    ovulationTitle: '🌕 Ovulation window', ovulationSoon: 'Your ovulation window opens in {{days}} days', ovulationToday: 'You may be ovulating today — peak fertility', ovulationPeak: 'You are in your peak ovulation window',
    phaseChangeTitle: '✨ New cycle phase', phaseChangeBody: 'You have entered your {{phase}} today',
    predictionsTitle: '🔮 Daily insights ready', predictionsBody: '{{count}} new cosmic insights are waiting for you', predictionsEmpty: 'Tap to generate your daily cosmic insights',
    transitsTitle: '⭐ {{count}} active transits', transitsBody: '{{aspect}} and more are affecting your chart today', transitsBodyGeneric: 'Current planetary movements are affecting your chart',
  },
  premium: {
    moreTransits: 'more transits available',
    transitLockedSub: 'Upgrade to see all active planetary transits',
    unlockTransits: 'Unlock All Transits ✦',
    unlockPremium: 'Unlock Premium ✦',
    dailyInsightsTitle: 'Daily Cosmic Insights',
    dailyInsightsSub: 'Unlock personalised daily predictions combining your natal chart with your current cycle phase.',
    feature1: 'Daily natal chart readings',
    feature2: 'Cycle phase + astrology combined',
    feature3: 'Transit interpretations personalised to you',
    feature4: 'Unlimited refreshes every day',
    feature5: 'No ads across the entire app',
    feature6: 'All 5 active transits revealed',
    trialNote: '€0.99 trial · then €5.49/mo · Cancel anytime',
  },
  common: { loading: 'Loading...', error: 'Something went wrong. Please try again.', retry: 'Try again', save: 'Save', cancel: 'Cancel', close: 'Close', confirm: 'Confirm', or: 'or' },
};

const fr: typeof en = {
  nav: { home: 'Accueil', cycle: 'Cycle', chart: 'Thème', transits: 'Transits', messages: 'Messages', profile: 'Profil' },
  welcome: { tagline: 'Votre cycle rencontre le cosmos', subtitle: 'Suivez vos règles, découvrez votre thème astral et recevez des insights cosmiques quotidiens personnalisés.', cta: 'Commencer votre voyage', signin: 'Déjà un compte ? Se connecter' },
  onboarding: { next: 'Continuer', back: 'Retour', skip: 'Passer', step: 'Étape {{current}} sur {{total}}', birthDate: { title: 'Quelle est votre date de naissance ?', subtitle: 'Votre date de naissance révèle votre signe solaire.' }, birthTime: { title: 'À quelle heure êtes-vous née ?', subtitle: 'Votre heure de naissance révèle votre ascendant.', known: 'Je connais mon heure de naissance', unknown: 'Je ne connais pas mon heure de naissance' }, birthPlace: { title: 'Où êtes-vous née ?', subtitle: 'Votre lieu de naissance complète votre thème natal.', placeholder: 'Tapez une ville...' }, periodTracking: { title: 'Voulez-vous suivre vos règles ?', subtitle: 'Combinez votre cycle avec votre thème cosmique.', yes: 'Oui, suivre mon cycle', no: 'Non merci' }, periodRegularity: { title: 'Vos règles sont-elles régulières ?', subtitle: 'Comprendre votre cycle aide aux prédictions.', yes: 'Oui, assez régulières', yesDesc: 'Mon cycle est prévisible', no: 'Non, irrégulières', noDesc: 'Mon cycle varie' }, lastPeriodKnowledge: { title: 'Savez-vous quand étaient vos dernières règles ?', subtitle: 'Cela nous aide à prédire votre prochain cycle.', yes: 'Oui, je me souviens', yesDesc: 'Je peux fournir les dates', no: 'Non, je ne me souviens pas', noDesc: 'Passer cette étape' }, lastPeriod: { title: 'Quand étaient vos dernières règles ?', subtitle: 'Sélectionnez les dates de début et de fin.' }, lifestyle: { title: 'Utilisez-vous une contraception hormonale ?', subtitle: 'Cela affecte les prédictions de cycle.', yes: 'Oui', yesDesc: "J'utilise une contraception hormonale", no: 'Non', noDesc: "Je n'utilise pas de contraception hormonale" }, hormonal: { title: 'Comment vous sentez-vous ?', subtitle: 'Cela nous aide à comprendre votre état actuel.' }, currentCity: { title: 'Où êtes-vous actuellement ?', subtitle: 'Votre ville actuelle pour les calculs de transits.' }, calculating: { title: 'Calcul de votre thème...', subtitle: 'Lecture des étoiles au moment de votre naissance.' }, startDate: 'Date de début', endDate: 'Date de fin', pickStartFirst: "Choisissez d'abord une date de début" },
  paywall: { title: 'Votre voyage cosmique vous attend !', subtitle: 'Débloquez votre thème personnalisé et toutes les fonctionnalités', trial: "1 semaine d'accès complet", then: 'puis {{price}}/mois', free: 'Continuer gratuitement', freeDesc: 'Suivi de cycle basique uniquement', cta: 'Accès complet ✦', freeCta: 'Continuer gratuitement →', selectPlan: 'Sélectionnez un plan pour continuer', disclaimer: 'Paiement sécurisé. Annulez à tout moment.', features: { chart: 'Analyse complète du thème natal', transits: 'Prédictions de transits quotidiennes', cycle: 'Suivi et prévision du cycle', hormonal: 'Insights sur les patterns hormonaux', moon: 'Intégration des phases lunaires', wellness: 'Conseils bien-être personnalisés', unlimited: 'Accès illimité au thème' } },
  auth: { signup: { title: 'Créez votre compte', subtitle: 'Commencez votre voyage cosmique.', button: 'Créer un compte', login: 'Déjà un compte ? Se connecter' }, login: { title: 'Bienvenue', subtitle: 'Votre voyage cosmique continue.', button: 'Se connecter', signup: 'Pas de compte ? Créer un', forgot: 'Mot de passe oublié ?' }, name: 'Votre nom', email: 'Adresse e-mail', password: 'Mot de passe', signingIn: 'Connexion...', creatingAccount: 'Création du compte...', terms: "En créant un compte, vous acceptez nos conditions d'utilisation." },
  home: { greeting: 'Bienvenue, {{name}} ✨', cycleDay: 'jour', nextPeriod: 'Prochaines règles dans {{days}} jours · {{date}}', todayInsight: 'Insight cosmique du jour', todayWellness: 'Bien-être du jour', moon: 'Lune', transit: 'Transit', sunSign: 'Signe solaire', mood: 'Humeur', stress: 'Stress', sleep: 'Sommeil', notLogged: 'Non enregistré', readMore: 'Lire le message complet' },
  cycle: { title: 'Votre Cycle', addPeriod: 'Ajouter règles', cycleLength: 'Durée du cycle : {{days}} jours', nextPeriod: 'Prochaines règles : {{date}} · {{days}} jours', day: 'jour', phases: { menstrual: 'Phase menstruelle', follicular: 'Phase folliculaire', ovulation: "Phase d'ovulation", luteal: 'Phase lutéale', unknown: 'Suivi...' }, phaseDesc: { menstrual: 'Repos et restauration.', follicular: 'Énergie montante.', ovulation: 'Énergie maximale.', luteal: "Tournez-vous vers l'intérieur." }, log: { title: 'Journal {{date}}', flow: 'Flux', mood: 'Humeur', symptoms: 'Symptômes', discharge: 'Pertes', sex: 'Activité sexuelle', notes: 'Notes', save: 'Enregistrer', notesPlaceholder: "Comment vous sentez-vous aujourd'hui ?", sexYes: '❤️ Oui', sexLog: '+ Ajouter' }, flow: { spotting: 'Légères pertes', light: 'Léger', medium: 'Moyen', heavy: 'Abondant' }, moods: { happy: '😊 Heureuse', sad: '😔 Triste', irritable: '😤 Irritable', anxious: '😰 Anxieuse', tired: '😴 Fatiguée', energetic: '⚡ Énergique', calm: '💆 Calme', overwhelmed: '🤯 Débordée' }, symptoms: { cramps: 'Crampes', bloating: 'Ballonnements', headache: 'Maux de tête', fatigue: 'Fatigue', backache: 'Mal au dos', nausea: 'Nausées', spotting: 'Spotting', tenderBreasts: 'Seins sensibles', cravings: 'Fringales', insomnia: 'Insomnie', acne: 'Acné', moodSwings: "Sautes d'humeur" }, discharge: { none: 'Aucune', dry: 'Sèche', sticky: 'Collante', creamy: 'Crémeuse', watery: 'Aqueuse', eggWhite: "Blanc d'œuf" }, history: 'Historique des règles', noHistory: 'Aucune règle enregistrée.', legend: { period: 'Règles', predicted: 'Prédit', fertile: 'Fertile', ovulation: 'Ovulation' }, addPeriodTitle: 'Ajouter règles', savePeriod: 'Enregistrer', weekdays: { su: 'Di', mo: 'Lu', tu: 'Ma', we: 'Me', th: 'Je', fr: 'Ve', sa: 'Sa' } },
  chart: { title: 'Votre Thème Natal', sun: 'Soleil', moon: 'Lune', rising: 'Ascendant', venus: 'Vénus', mars: 'Mars', mercury: 'Mercure', jupiter: 'Jupiter', saturn: 'Saturne', sunDesc: 'Identité et force vitale', moonDesc: 'Émotions et instincts', risingDesc: 'Comment les autres vous voient', venusDesc: 'Amour et attraction', marsDesc: 'Motivation et désir', mercuryDesc: 'Communication et esprit', jupiterDesc: 'Expansion et sagesse', saturnDesc: 'Structure et discipline', calculating: 'Calcul en cours...' },
  transits: { title: 'Transits en direct', subtitle: 'Planètes actuelles en aspect avec votre thème natal', updated: 'Mis à jour {{time}}', activeNow: 'Actif maintenant', intensity: 'intensité', scanning: 'Analyse du ciel actuel...', noTransits: 'Aucun transit majeur actif', noTransitsDesc: 'Le ciel est relativement calme pour votre thème.', noChart: 'Complétez votre thème natal pour voir les transits.', phase: 'Transits pour votre phase {{phase}}', phaseSubtitle: 'comment le ciel actuel interagit avec votre Soleil {{sun}} et votre Lune {{moon}}.', aspectGuide: 'Guide des aspects', aspects: { conjunction: 'Conjonction', trine: 'Trigone', square: 'Carré', opposition: 'Opposition', sextile: 'Sextile' }, aspectDesc: { conjunction: 'Énergies fusionnées', trine: 'Flux harmonieux', square: 'Tension et croissance', opposition: 'Conscience et équilibre', sextile: 'Opportunité et facilité' }, planets: { sun: 'Soleil', moon: 'Lune', mercury: 'Mercure', venus: 'Vénus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturne' } },
  messages: { title: 'Messages', new: '{{count}} nouveau(x)', phase: 'Phase {{phase}} · Jour {{day}}', loading: 'Lecture de votre thème cosmique...', loadingDesc: 'Combinaison de votre thème natal avec votre phase {{phase}}', noMessages: 'Pas encore de prédictions', generate: 'Générer les insights du jour', refresh: 'Actualiser', notice: 'Vos insights quotidiens sont générés chaque jour.', tryAgain: 'Réessayer', error: 'Impossible de charger les prédictions. Veuillez réessayer.' },
  profile: { title: 'Votre Profil', birthInfo: 'Infos de naissance', dateOfBirth: 'Date de naissance', birthTime: 'Heure de naissance', birthPlace: 'Lieu de naissance', currentCity: 'Ville actuelle', cycleInfo: 'Infos cycle', avgCycle: 'Durée moyenne du cycle', lastPeriodStart: 'Début des dernières règles', lastPeriodEnd: 'Fin des dernières règles', tracksPeriods: 'Suivi des règles', subscription: 'Abonnement', status: 'Statut', premium: '✦ Premium', free: 'Gratuit', upgrade: 'Passer Premium', support: 'Support', contactSupport: 'Contacter le support', privacy: 'Politique de confidentialité', terms: "Conditions d'utilisation", logout: 'Se déconnecter', language: 'Langue', selectLanguage: 'Choisir la langue', days: 'jours', yes: 'Oui', no: 'Non', notSet: 'Non défini', version: 'ZodiacCycle v1.0.0 · Fait avec ✦ pour le cosmos' },
  landing: { heroLine1: 'Votre cycle,', heroLine2: 'Vos étoiles', feature1Title: 'Thème natal complet', feature1Desc: 'Analyse astrologique complète basée sur votre heure et lieu de naissance exacts', feature2Title: 'Insights de transits', feature2Desc: 'Comprenez comment les mouvements planétaires actuels affectent votre cycle', feature3Title: 'Suivi intelligent', feature3Desc: 'Suivi du cycle combiné avec le timing astrologique', subCta: 'Commencez votre voyage cosmique personnalisé' },
  birthTimeInfo: { title: 'Pourquoi nous avons besoin de ces informations', sunDesc: 'Votre date de naissance détermine votre signe solaire', moonDesc: "L'heure et le lieu de naissance nous aident à calculer vos signes Lune et Ascendant", planetsTitle: 'Positions planétaires', planetsDesc: 'Les détails de naissance exacts nous permettent de cartographier toutes les positions planétaires' },
  notifications: {
    title: 'Notifications', empty: 'Pas encore de notifications', emptyBody: 'Nous vous informerons de votre cycle, des transits et des insights quotidiens', markAllRead: 'Tout marquer comme lu',
    periodSoonTitle: '🔴 Règles bientôt', periodSoonBody: 'Vos règles sont attendues dans {{days}} jours · {{date}}', periodToday: "Vos règles pourraient commencer aujourd'hui. Prenez soin de vous 💙",
    ovulationTitle: "🌕 Fenêtre d'ovulation", ovulationSoon: "Votre fenêtre d'ovulation s'ouvre dans {{days}} jours", ovulationToday: 'Vous pourriez ovuler aujourd\'hui — fertilité maximale', ovulationPeak: 'Vous êtes dans votre fenêtre d\'ovulation maximale',
    phaseChangeTitle: '✨ Nouvelle phase du cycle', phaseChangeBody: 'Vous êtes entrée dans votre {{phase}} aujourd\'hui',
    predictionsTitle: '🔮 Insights quotidiens prêts', predictionsBody: '{{count}} nouveaux insights cosmiques vous attendent', predictionsEmpty: 'Appuyez pour générer vos insights cosmiques quotidiens',
    transitsTitle: '⭐ {{count}} transits actifs', transitsBody: "{{aspect}} et plus affectent votre thème aujourd'hui", transitsBodyGeneric: 'Les mouvements planétaires actuels affectent votre thème',
  },
  premium: {
    moreTransits: 'autres transits disponibles',
    transitLockedSub: 'Passez à Premium pour voir tous les transits planétaires actifs',
    unlockTransits: 'Débloquer tous les transits ✦',
    unlockPremium: 'Débloquer Premium ✦',
    dailyInsightsTitle: 'Insights cosmiques quotidiens',
    dailyInsightsSub: 'Débloquez des prédictions quotidiennes personnalisées combinant votre thème natal avec votre phase de cycle.',
    feature1: 'Lectures quotidiennes du thème natal',
    feature2: 'Phase du cycle + astrologie combinées',
    feature3: 'Interprétations de transits personnalisées',
    feature4: 'Actualisations illimitées chaque jour',
    feature5: "Aucune publicité dans toute l'application",
    feature6: 'Les 5 transits actifs révélés',
    trialNote: "0,99€ d'essai · puis 5,49€/mois · Annulez à tout moment",
  },
  common: { loading: 'Chargement...', error: 'Une erreur est survenue. Veuillez réessayer.', retry: 'Réessayer', save: 'Enregistrer', cancel: 'Annuler', close: 'Fermer', confirm: 'Confirmer', or: 'ou' },
};

const de: typeof en = {
  nav: { home: 'Start', cycle: 'Zyklus', chart: 'Horoskop', transits: 'Transite', messages: 'Nachrichten', profile: 'Profil' },
  welcome: { tagline: 'Ihr Zyklus trifft den Kosmos', subtitle: 'Verfolgen Sie Ihren Zyklus, entdecken Sie Ihr Horoskop und erhalten Sie tägliche kosmische Einblicke.', cta: 'Ihre Reise beginnen', signin: 'Bereits ein Konto? Anmelden' },
  onboarding: { next: 'Weiter', back: 'Zurück', skip: 'Überspringen', step: 'Schritt {{current}} von {{total}}', birthDate: { title: 'Wann wurden Sie geboren?', subtitle: 'Ihr Geburtsdatum enthüllt Ihr Sonnenzeichen.' }, birthTime: { title: 'Zu welcher Zeit wurden Sie geboren?', subtitle: 'Ihre Geburtszeit enthüllt Ihren Aszendenten.', known: 'Ich kenne meine Geburtszeit', unknown: 'Ich kenne meine Geburtszeit nicht' }, birthPlace: { title: 'Wo wurden Sie geboren?', subtitle: 'Ihr Geburtsort vervollständigt Ihr Horoskop.', placeholder: 'Eine Stadt eingeben...' }, periodTracking: { title: 'Möchten Sie Ihren Zyklus verfolgen?', subtitle: 'Verbinden Sie Ihren Zyklus mit Ihrem Horoskop.', yes: 'Ja, meinen Zyklus verfolgen', no: 'Nein danke' }, periodRegularity: { title: 'Ist Ihre Periode regelmäßig?', subtitle: 'Ihr Zyklusmuster hilft bei Vorhersagen.', yes: 'Ja, ziemlich regelmäßig', yesDesc: 'Mein Zyklus ist vorhersehbar', no: 'Nein, unregelmäßig', noDesc: 'Mein Zyklus variiert' }, lastPeriodKnowledge: { title: 'Wissen Sie, wann Ihre letzte Periode war?', subtitle: 'Das hilft uns, Ihren nächsten Zyklus vorherzusagen.', yes: 'Ja, ich erinnere mich', yesDesc: 'Ich kann die Daten angeben', no: 'Nein, ich erinnere mich nicht', noDesc: 'Diesen Schritt überspringen' }, lastPeriod: { title: 'Wann war Ihre letzte Periode?', subtitle: 'Wählen Sie Start- und Enddatum.' }, lifestyle: { title: 'Verwenden Sie hormonelle Verhütung?', subtitle: 'Das beeinflusst Zyklusvorhersagen.', yes: 'Ja', yesDesc: 'Ich verwende hormonelle Verhütung', no: 'Nein', noDesc: 'Ich verwende keine hormonelle Verhütung' }, hormonal: { title: 'Wie fühlen Sie sich?', subtitle: 'Das hilft uns, Ihren aktuellen Zustand zu verstehen.' }, currentCity: { title: 'Wo befinden Sie sich gerade?', subtitle: 'Ihre aktuelle Stadt für Transitberechnungen.' }, calculating: { title: 'Ihr Horoskop wird berechnet...', subtitle: 'Die Sterne zum Zeitpunkt Ihrer Geburt werden gelesen.' }, startDate: 'Startdatum', endDate: 'Enddatum', pickStartFirst: 'Wählen Sie zuerst ein Startdatum' },
  paywall: { title: 'Ihre kosmische Reise wartet!', subtitle: 'Entsperren Sie Ihr personalisiertes Horoskop und alle Funktionen', trial: '1 Woche Vollzugang', then: 'dann {{price}}/Monat', free: 'Kostenlos fortfahren', freeDesc: 'Nur grundlegende Zyklusverfolgung', cta: 'Vollzugang ✦', freeCta: 'Kostenlos fortfahren →', selectPlan: 'Wählen Sie einen Plan', disclaimer: 'Sichere Zahlung. Jederzeit kündbar.', features: { chart: 'Vollständige Geburtshoroskop-Analyse', transits: 'Tägliche Transitvorhersagen', cycle: 'Zyklusverfolgung und -prognose', hormonal: 'Hormonelle Muster-Einblicke', moon: 'Mondphasen-Integration', wellness: 'Personalisierte Wellness-Tipps', unlimited: 'Unbegrenzter Horoskop-Zugang' } },
  auth: { signup: { title: 'Konto erstellen', subtitle: 'Beginnen Sie Ihre kosmische Reise.', button: 'Konto erstellen', login: 'Bereits ein Konto? Anmelden' }, login: { title: 'Willkommen zurück', subtitle: 'Ihre kosmische Reise geht weiter.', button: 'Anmelden', signup: 'Kein Konto? Erstellen', forgot: 'Passwort vergessen?' }, name: 'Ihr Name', email: 'E-Mail-Adresse', password: 'Passwort', signingIn: 'Anmeldung...', creatingAccount: 'Konto wird erstellt...', terms: 'Mit der Erstellung eines Kontos stimmen Sie unseren Nutzungsbedingungen zu.' },
  home: { greeting: 'Willkommen zurück, {{name}} ✨', cycleDay: 'Tag', nextPeriod: 'Nächste Periode in {{days}} Tagen · {{date}}', todayInsight: 'Heutiger kosmischer Einblick', todayWellness: 'Heutiges Wohlbefinden', moon: 'Mond', transit: 'Transit', sunSign: 'Sonnenzeichen', mood: 'Stimmung', stress: 'Stress', sleep: 'Schlaf', notLogged: 'Nicht erfasst', readMore: 'Vollständige Nachricht lesen' },
  cycle: { title: 'Ihr Zyklus', addPeriod: 'Periode hinzufügen', cycleLength: 'Zykluslänge: {{days}} Tage', nextPeriod: 'Nächste Periode: {{date}} · {{days}} Tage', day: 'Tag', phases: { menstrual: 'Menstruationsphase', follicular: 'Follikelphase', ovulation: 'Ovulationsphase', luteal: 'Lutealphase', unknown: 'Wird verfolgt...' }, phaseDesc: { menstrual: 'Ruhe und Erholung.', follicular: 'Energie steigt.', ovulation: 'Höchste Energie.', luteal: 'Nach innen kehren.' }, log: { title: 'Tagebuch {{date}}', flow: 'Stärke', mood: 'Stimmung', symptoms: 'Symptome', discharge: 'Ausfluss', sex: 'Sexuelle Aktivität', notes: 'Notizen', save: 'Speichern', notesPlaceholder: 'Wie fühlen Sie sich heute?', sexYes: '❤️ Ja', sexLog: '+ Eintragen' }, flow: { spotting: 'Schmierblutung', light: 'Leicht', medium: 'Mittel', heavy: 'Stark' }, moods: { happy: '😊 Glücklich', sad: '😔 Traurig', irritable: '😤 Gereizt', anxious: '😰 Ängstlich', tired: '😴 Müde', energetic: '⚡ Energiegeladen', calm: '💆 Ruhig', overwhelmed: '🤯 Überwältigt' }, symptoms: { cramps: 'Krämpfe', bloating: 'Blähungen', headache: 'Kopfschmerzen', fatigue: 'Müdigkeit', backache: 'Rückenschmerzen', nausea: 'Übelkeit', spotting: 'Schmierblutung', tenderBreasts: 'Empfindliche Brust', cravings: 'Heißhunger', insomnia: 'Schlaflosigkeit', acne: 'Akne', moodSwings: 'Stimmungsschwankungen' }, discharge: { none: 'Keine', dry: 'Trocken', sticky: 'Klebrig', creamy: 'Cremig', watery: 'Wässrig', eggWhite: 'Wie Eiweiß' }, history: 'Periodenhistorie', noHistory: 'Noch keine Perioden erfasst.', legend: { period: 'Periode', predicted: 'Vorhergesagt', fertile: 'Fruchtbar', ovulation: 'Ovulation' }, addPeriodTitle: 'Periode hinzufügen', savePeriod: 'Speichern', weekdays: { su: 'So', mo: 'Mo', tu: 'Di', we: 'Mi', th: 'Do', fr: 'Fr', sa: 'Sa' } },
  chart: { title: 'Ihr Geburtshoroskop', sun: 'Sonne', moon: 'Mond', rising: 'Aszendent', venus: 'Venus', mars: 'Mars', mercury: 'Merkur', jupiter: 'Jupiter', saturn: 'Saturn', sunDesc: 'Kernidentität und Lebenskraft', moonDesc: 'Emotionen und Instinkte', risingDesc: 'Wie andere Sie sehen', venusDesc: 'Liebe und Anziehung', marsDesc: 'Antrieb und Verlangen', mercuryDesc: 'Kommunikation und Verstand', jupiterDesc: 'Expansion und Weisheit', saturnDesc: 'Struktur und Disziplin', calculating: 'Wird berechnet...' },
  transits: { title: 'Live-Transite', subtitle: 'Aktuelle Planeten im Aspekt mit Ihrem Horoskop', updated: 'Aktualisiert {{time}}', activeNow: 'Gerade aktiv', intensity: 'Intensität', scanning: 'Aktuellen Himmel wird analysiert...', noTransits: 'Keine größeren Transite aktiv', noTransitsDesc: 'Der Himmel ist heute relativ ruhig.', noChart: 'Vervollständigen Sie Ihr Horoskop, um Transite zu sehen.', phase: 'Transite für Ihre {{phase}}-Phase', phaseSubtitle: 'wie der aktuelle Himmel mit Ihrer {{sun}}-Sonne und {{moon}}-Mond interagiert.', aspectGuide: 'Aspektführer', aspects: { conjunction: 'Konjunktion', trine: 'Trigon', square: 'Quadrat', opposition: 'Opposition', sextile: 'Sextil' }, aspectDesc: { conjunction: 'Verschmelzende Energien', trine: 'Harmonischer Fluss', square: 'Spannung & Wachstum', opposition: 'Bewusstsein & Balance', sextile: 'Chance & Leichtigkeit' }, planets: { sun: 'Sonne', moon: 'Mond', mercury: 'Merkur', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn' } },
  messages: { title: 'Nachrichten', new: '{{count}} neu', phase: '{{phase}}-Phase · Tag {{day}}', loading: 'Ihr kosmisches Profil wird gelesen...', loadingDesc: 'Ihr Horoskop wird mit Ihrer {{phase}}-Phase kombiniert', noMessages: 'Noch keine Vorhersagen', generate: 'Heutige Einblicke generieren', refresh: 'Aktualisieren', notice: 'Ihre täglichen Einblicke werden jeden Tag neu generiert.', tryAgain: 'Erneut versuchen', error: 'Vorhersagen konnten nicht geladen werden. Bitte versuchen Sie es erneut.' },
  profile: { title: 'Ihr Profil', birthInfo: 'Geburtsinfos', dateOfBirth: 'Geburtsdatum', birthTime: 'Geburtszeit', birthPlace: 'Geburtsort', currentCity: 'Aktuelle Stadt', cycleInfo: 'Zyklusinfos', avgCycle: 'Durchschnittliche Zykluslänge', lastPeriodStart: 'Beginn der letzten Periode', lastPeriodEnd: 'Ende der letzten Periode', tracksPeriods: 'Periodenerfassung', subscription: 'Abonnement', status: 'Status', premium: '✦ Premium', free: 'Kostenlos', upgrade: 'Auf Premium upgraden', support: 'Support', contactSupport: 'Support kontaktieren', privacy: 'Datenschutzrichtlinie', terms: 'Nutzungsbedingungen', logout: 'Abmelden', language: 'Sprache', selectLanguage: 'Sprache wählen', days: 'Tage', yes: 'Ja', no: 'Nein', notSet: 'Nicht gesetzt', version: 'ZodiacCycle v1.0.0 · Mit ✦ für den Kosmos gemacht' },
  landing: { heroLine1: 'Ihr Zyklus,', heroLine2: 'Ihre Sterne', feature1Title: 'Vollständiges Geburtshoroskop', feature1Desc: 'Vollständige astrologische Analyse basierend auf Ihrer genauen Geburtszeit und dem Geburtsort', feature2Title: 'Transiteinblicke', feature2Desc: 'Verstehen Sie, wie aktuelle Planetenbewegungen Ihren Zyklus beeinflussen', feature3Title: 'Intelligentes Tracking', feature3Desc: 'Periodentracking kombiniert mit astrologischem Timing', subCta: 'Beginnen Sie Ihre personalisierte kosmische Wellness-Reise' },
  birthTimeInfo: { title: 'Warum wir diese Informationen benötigen', sunDesc: 'Ihr Geburtsdatum bestimmt Ihr Sonnenzeichen und Ihre Kernpersönlichkeit', moonDesc: 'Geburtszeit und Ort helfen uns, Ihr Mond- und Aszendentzeichen zu berechnen', planetsTitle: 'Planetenpositionen', planetsDesc: 'Genaue Geburtsdaten ermöglichen uns, alle Planetenpositionen in Ihrem Horoskop zu kartieren' },
  notifications: {
    title: 'Benachrichtigungen', empty: 'Noch keine Benachrichtigungen', emptyBody: 'Wir benachrichtigen Sie über Ihren Zyklus, Transite und tägliche Einblicke', markAllRead: 'Alle als gelesen markieren',
    periodSoonTitle: '🔴 Periode bald fällig', periodSoonBody: 'Ihre Periode wird in {{days}} Tagen erwartet · {{date}}', periodToday: 'Ihre Periode könnte heute beginnen. Schonen Sie sich 💙',
    ovulationTitle: '🌕 Ovulationsfenster', ovulationSoon: 'Ihr Ovulationsfenster öffnet sich in {{days}} Tagen', ovulationToday: 'Sie könnten heute ovulieren — maximale Fruchtbarkeit', ovulationPeak: 'Sie befinden sich in Ihrem Hauptovulationsfenster',
    phaseChangeTitle: '✨ Neue Zyklusphase', phaseChangeBody: 'Sie haben heute Ihre {{phase}} begonnen',
    predictionsTitle: '🔮 Tägliche Einblicke bereit', predictionsBody: '{{count}} neue kosmische Einblicke warten auf Sie', predictionsEmpty: 'Tippen Sie, um Ihre täglichen kosmischen Einblicke zu generieren',
    transitsTitle: '⭐ {{count}} aktive Transite', transitsBody: '{{aspect}} und mehr beeinflussen heute Ihr Horoskop', transitsBodyGeneric: 'Aktuelle Planetenbewegungen beeinflussen Ihr Horoskop',
  },
  premium: {
    moreTransits: 'weitere Transite verfügbar',
    transitLockedSub: 'Upgraden Sie, um alle aktiven Planetentransite zu sehen',
    unlockTransits: 'Alle Transite freischalten ✦',
    unlockPremium: 'Premium freischalten ✦',
    dailyInsightsTitle: 'Tägliche kosmische Einblicke',
    dailyInsightsSub: 'Schalten Sie personalisierte tägliche Vorhersagen frei, die Ihr Geburtshoroskop mit Ihrer aktuellen Zyklusphase verbinden.',
    feature1: 'Tägliche Geburtshoroskop-Lesungen',
    feature2: 'Zyklusphase + Astrologie kombiniert',
    feature3: 'Personalisierte Transitinterpretationen',
    feature4: 'Unbegrenzte tägliche Aktualisierungen',
    feature5: 'Keine Werbung in der gesamten App',
    feature6: 'Alle 5 aktiven Transite enthüllt',
    trialNote: '0,99€ Probe · dann 5,49€/Monat · Jederzeit kündbar',
  },
  common: { loading: 'Wird geladen...', error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.', retry: 'Erneut versuchen', save: 'Speichern', cancel: 'Abbrechen', close: 'Schließen', confirm: 'Bestätigen', or: 'oder' },
};

const es: typeof en = {
  nav: { home: 'Inicio', cycle: 'Ciclo', chart: 'Carta', transits: 'Tránsitos', messages: 'Mensajes', profile: 'Perfil' },
  welcome: { tagline: 'Tu ciclo se encuentra con el cosmos', subtitle: 'Registra tu período, descubre tu carta astral y recibe insights cósmicos diarios personalizados.', cta: 'Comenzar tu viaje', signin: '¿Ya tienes cuenta? Iniciar sesión' },
  onboarding: { next: 'Continuar', back: 'Atrás', skip: 'Omitir', step: 'Paso {{current}} de {{total}}', birthDate: { title: '¿Cuándo naciste?', subtitle: 'Tu fecha de nacimiento revela tu signo solar.' }, birthTime: { title: '¿A qué hora naciste?', subtitle: 'Tu hora de nacimiento revela tu ascendente.', known: 'Conozco mi hora de nacimiento', unknown: 'No conozco mi hora de nacimiento' }, birthPlace: { title: '¿Dónde naciste?', subtitle: 'Tu lugar de nacimiento completa tu carta natal.', placeholder: 'Escribe cualquier ciudad del mundo...' }, periodTracking: { title: '¿Quieres registrar tu período?', subtitle: 'Combina tu ciclo con tu carta cósmica.', yes: 'Sí, registrar mi ciclo', no: 'No, gracias' }, periodRegularity: { title: '¿Tu período es regular?', subtitle: 'Tu patrón de ciclo ayuda con las predicciones.', yes: 'Sí, bastante regular', yesDesc: 'Mi ciclo es predecible', no: 'No, es irregular', noDesc: 'Mi ciclo varía' }, lastPeriodKnowledge: { title: '¿Sabes cuándo fue tu último período?', subtitle: 'Esto nos ayuda a predecir tu próximo ciclo.', yes: 'Sí, lo recuerdo', yesDesc: 'Puedo proporcionar las fechas', no: 'No, no lo recuerdo', noDesc: 'Omitir este paso' }, lastPeriod: { title: '¿Cuándo fue tu último período?', subtitle: 'Selecciona las fechas de inicio y fin.' }, lifestyle: { title: '¿Usas anticonceptivos hormonales?', subtitle: 'Esto afecta las predicciones del ciclo.', yes: 'Sí', yesDesc: 'Actualmente uso anticonceptivos hormonales', no: 'No', noDesc: 'No uso anticonceptivos hormonales' }, hormonal: { title: '¿Cómo te sientes?', subtitle: 'Esto nos ayuda a entender tu estado actual.' }, currentCity: { title: '¿Dónde estás ahora?', subtitle: 'Tu ciudad actual para cálculos de tránsitos.' }, calculating: { title: 'Calculando tu carta...', subtitle: 'Leyendo las estrellas en el momento de tu nacimiento.' }, startDate: 'Fecha de inicio', endDate: 'Fecha de fin', pickStartFirst: 'Elige primero una fecha de inicio' },
  paywall: { title: '¡Tu viaje cósmico te espera!', subtitle: 'Desbloquea tu carta personalizada y todas las funciones', trial: '1 semana de acceso completo', then: 'luego {{price}}/mes', free: 'Continuar gratis', freeDesc: 'Solo seguimiento básico del ciclo', cta: 'Obtener acceso completo ✦', freeCta: 'Continuar gratis →', selectPlan: 'Selecciona un plan para continuar', disclaimer: 'Pago seguro. Cancela cuando quieras.', features: { chart: 'Análisis completo de carta natal', transits: 'Predicciones de tránsitos diarias', cycle: 'Seguimiento y pronóstico del ciclo', hormonal: 'Insights de patrones hormonales', moon: 'Integración de fases lunares', wellness: 'Consejos de bienestar personalizados', unlimited: 'Acceso ilimitado a la carta' } },
  auth: { signup: { title: 'Crea tu cuenta', subtitle: 'Comienza tu viaje cósmico.', button: 'Crear cuenta', login: '¿Ya tienes cuenta? Iniciar sesión' }, login: { title: 'Bienvenida de nuevo', subtitle: 'Tu viaje cósmico continúa.', button: 'Iniciar sesión', signup: '¿No tienes cuenta? Crear una', forgot: '¿Olvidaste tu contraseña?' }, name: 'Tu nombre', email: 'Correo electrónico', password: 'Contraseña', signingIn: 'Iniciando sesión...', creatingAccount: 'Creando cuenta...', terms: 'Al crear una cuenta aceptas nuestros términos de servicio y política de privacidad.' },
  home: { greeting: 'Bienvenida, {{name}} ✨', cycleDay: 'día', nextPeriod: 'Próximo período en {{days}} días · {{date}}', todayInsight: 'Insight cósmico de hoy', todayWellness: 'Bienestar de hoy', moon: 'Luna', transit: 'Tránsito', sunSign: 'Signo solar', mood: 'Estado de ánimo', stress: 'Estrés', sleep: 'Sueño', notLogged: 'No registrado', readMore: 'Leer mensaje completo' },
  cycle: { title: 'Tu Ciclo', addPeriod: 'Agregar período', cycleLength: 'Duración del ciclo: {{days}} días', nextPeriod: 'Próximo período: {{date}} · {{days}} días', day: 'día', phases: { menstrual: 'Fase menstrual', follicular: 'Fase folicular', ovulation: 'Fase de ovulación', luteal: 'Fase lútea', unknown: 'Rastreando...' }, phaseDesc: { menstrual: 'Descanso y restauración.', follicular: 'Energía en aumento.', ovulation: 'Máxima energía.', luteal: 'Vuelta al interior.' }, log: { title: 'Registro {{date}}', flow: 'Flujo', mood: 'Estado de ánimo', symptoms: 'Síntomas', discharge: 'Flujo vaginal', sex: 'Actividad sexual', notes: 'Notas', save: 'Guardar', notesPlaceholder: '¿Cómo te sientes hoy?', sexYes: '❤️ Sí', sexLog: '+ Registrar' }, flow: { spotting: 'Manchado', light: 'Leve', medium: 'Moderado', heavy: 'Abundante' }, moods: { happy: '😊 Feliz', sad: '😔 Triste', irritable: '😤 Irritable', anxious: '😰 Ansiosa', tired: '😴 Cansada', energetic: '⚡ Enérgica', calm: '💆 Tranquila', overwhelmed: '🤯 Abrumada' }, symptoms: { cramps: 'Cólicos', bloating: 'Hinchazón', headache: 'Dolor de cabeza', fatigue: 'Fatiga', backache: 'Dolor de espalda', nausea: 'Náuseas', spotting: 'Manchado', tenderBreasts: 'Senos sensibles', cravings: 'Antojos', insomnia: 'Insomnio', acne: 'Acné', moodSwings: 'Cambios de humor' }, discharge: { none: 'Ninguno', dry: 'Seco', sticky: 'Pegajoso', creamy: 'Cremoso', watery: 'Acuoso', eggWhite: 'Clara de huevo' }, history: 'Historial de períodos', noHistory: 'No hay períodos registrados.', legend: { period: 'Período', predicted: 'Predicho', fertile: 'Fértil', ovulation: 'Ovulación' }, addPeriodTitle: 'Agregar período', savePeriod: 'Guardar', weekdays: { su: 'Do', mo: 'Lu', tu: 'Ma', we: 'Mi', th: 'Ju', fr: 'Vi', sa: 'Sá' } },
  chart: { title: 'Tu Carta Natal', sun: 'Sol', moon: 'Luna', rising: 'Ascendente', venus: 'Venus', mars: 'Marte', mercury: 'Mercurio', jupiter: 'Júpiter', saturn: 'Saturno', sunDesc: 'Identidad central y fuerza vital', moonDesc: 'Emociones e instintos', risingDesc: 'Cómo te ven los demás', venusDesc: 'Amor y atracción', marsDesc: 'Impulso y deseo', mercuryDesc: 'Comunicación y mente', jupiterDesc: 'Expansión y sabiduría', saturnDesc: 'Estructura y disciplina', calculating: 'Calculando...' },
  transits: { title: 'Tránsitos en vivo', subtitle: 'Planetas actuales en aspecto con tu carta natal', updated: 'Actualizado {{time}}', activeNow: 'Activo ahora', intensity: 'intensidad', scanning: 'Escaneando el cielo actual...', noTransits: 'No hay tránsitos mayores activos', noTransitsDesc: 'El cielo está relativamente tranquilo hoy.', noChart: 'Completa tu carta natal para ver los tránsitos.', phase: 'Tránsitos para tu fase {{phase}}', phaseSubtitle: 'cómo el cielo actual interactúa con tu Sol {{sun}} y tu Luna {{moon}}.', aspectGuide: 'Guía de aspectos', aspects: { conjunction: 'Conjunción', trine: 'Trígono', square: 'Cuadratura', opposition: 'Oposición', sextile: 'Sextil' }, aspectDesc: { conjunction: 'Energías fusionadas', trine: 'Flujo armonioso', square: 'Tensión y crecimiento', opposition: 'Conciencia y equilibrio', sextile: 'Oportunidad y facilidad' }, planets: { sun: 'Sol', moon: 'Luna', mercury: 'Mercurio', venus: 'Venus', mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno' } },
  messages: { title: 'Mensajes', new: '{{count}} nuevo(s)', phase: 'Fase {{phase}} · Día {{day}}', loading: 'Leyendo tu perfil cósmico...', loadingDesc: 'Combinando tu carta natal con tu fase {{phase}}', noMessages: 'Sin predicciones aún', generate: 'Generar insights de hoy', refresh: 'Actualizar', notice: 'Tus insights diarios se generan cada día usando tu carta natal y fase de ciclo actual.', tryAgain: 'Intentar de nuevo', error: 'No se pudieron cargar las predicciones. Por favor intenta de nuevo.' },
  profile: { title: 'Tu Perfil', birthInfo: 'Info de nacimiento', dateOfBirth: 'Fecha de nacimiento', birthTime: 'Hora de nacimiento', birthPlace: 'Lugar de nacimiento', currentCity: 'Ciudad actual', cycleInfo: 'Info del ciclo', avgCycle: 'Duración promedio del ciclo', lastPeriodStart: 'Inicio del último período', lastPeriodEnd: 'Fin del último período', tracksPeriods: 'Seguimiento de períodos', subscription: 'Suscripción', status: 'Estado', premium: '✦ Premium', free: 'Gratis', upgrade: 'Actualizar a Premium', support: 'Soporte', contactSupport: 'Contactar soporte', privacy: 'Política de privacidad', terms: 'Términos de servicio', logout: 'Cerrar sesión', language: 'Idioma', selectLanguage: 'Seleccionar idioma', days: 'días', yes: 'Sí', no: 'No', notSet: 'No definido', version: 'ZodiacCycle v1.0.0 · Hecho con ✦ para el cosmos' },
  landing: { heroLine1: 'Tu ciclo,', heroLine2: 'Tus estrellas', feature1Title: 'Carta natal completa', feature1Desc: 'Análisis astrológico completo basado en tu hora y lugar de nacimiento exactos', feature2Title: 'Insights de tránsitos', feature2Desc: 'Entiende cómo los movimientos planetarios actuales afectan tu ciclo', feature3Title: 'Seguimiento inteligente', feature3Desc: 'Seguimiento del ciclo combinado con el timing astrológico', subCta: 'Comienza tu viaje cósmico personalizado' },
  birthTimeInfo: { title: 'Por qué necesitamos esta información', sunDesc: 'Tu fecha de nacimiento determina tu signo solar y rasgos de personalidad', moonDesc: 'La hora y el lugar de nacimiento nos ayudan a calcular tus signos Luna y Ascendente', planetsTitle: 'Posiciones planetarias', planetsDesc: 'Los detalles exactos de nacimiento nos permiten mapear todas las posiciones planetarias' },
  notifications: {
    title: 'Notificaciones', empty: 'Sin notificaciones aún', emptyBody: 'Te notificaremos sobre tu ciclo, tránsitos e insights diarios', markAllRead: 'Marcar todo como leído',
    periodSoonTitle: '🔴 Período próximo', periodSoonBody: 'Tu período se espera en {{days}} días · {{date}}', periodToday: 'Tu período podría comenzar hoy. Cuídate 💙',
    ovulationTitle: '🌕 Ventana de ovulación', ovulationSoon: 'Tu ventana de ovulación se abre en {{days}} días', ovulationToday: 'Podrías estar ovulando hoy — máxima fertilidad', ovulationPeak: 'Estás en tu ventana de ovulación máxima',
    phaseChangeTitle: '✨ Nueva fase del ciclo', phaseChangeBody: 'Has entrado en tu {{phase}} hoy',
    predictionsTitle: '🔮 Insights diarios listos', predictionsBody: '{{count}} nuevos insights cósmicos te esperan', predictionsEmpty: 'Toca para generar tus insights cósmicos diarios',
    transitsTitle: '⭐ {{count}} tránsitos activos', transitsBody: '{{aspect}} y más afectan tu carta hoy', transitsBodyGeneric: 'Los movimientos planetarios actuales afectan tu carta',
  },
  premium: {
    moreTransits: 'tránsitos más disponibles',
    transitLockedSub: 'Actualiza para ver todos los tránsitos planetarios activos',
    unlockTransits: 'Desbloquear todos los tránsitos ✦',
    unlockPremium: 'Desbloquear Premium ✦',
    dailyInsightsTitle: 'Insights cósmicos diarios',
    dailyInsightsSub: 'Desbloquea predicciones diarias personalizadas que combinan tu carta natal con tu fase de ciclo actual.',
    feature1: 'Lecturas diarias de carta natal',
    feature2: 'Fase del ciclo + astrología combinadas',
    feature3: 'Interpretaciones de tránsitos personalizadas',
    feature4: 'Actualizaciones ilimitadas cada día',
    feature5: 'Sin anuncios en toda la aplicación',
    feature6: 'Los 5 tránsitos activos revelados',
    trialNote: '0,99€ de prueba · luego 5,49€/mes · Cancela cuando quieras',
  },
  common: { loading: 'Cargando...', error: 'Algo salió mal. Por favor intenta de nuevo.', retry: 'Intentar de nuevo', save: 'Guardar', cancel: 'Cancelar', close: 'Cerrar', confirm: 'Confirmar', or: 'o' },
};

const pt: typeof en = {
  nav: { home: 'Início', cycle: 'Ciclo', chart: 'Mapa', transits: 'Trânsitos', messages: 'Mensagens', profile: 'Perfil' },
  welcome: { tagline: 'Seu ciclo encontra o cosmos', subtitle: 'Acompanhe seu período, descubra seu mapa astral e receba insights cósmicos diários personalizados.', cta: 'Começar sua jornada', signin: 'Já tem conta? Entrar' },
  onboarding: { next: 'Continuar', back: 'Voltar', skip: 'Pular', step: 'Passo {{current}} de {{total}}', birthDate: { title: 'Quando você nasceu?', subtitle: 'Sua data de nascimento revela seu signo solar.' }, birthTime: { title: 'A que horas você nasceu?', subtitle: 'Sua hora de nascimento revela seu ascendente.', known: 'Sei meu horário de nascimento', unknown: 'Não sei meu horário de nascimento' }, birthPlace: { title: 'Onde você nasceu?', subtitle: 'Seu local de nascimento completa seu mapa natal.', placeholder: 'Digite qualquer cidade do mundo...' }, periodTracking: { title: 'Deseja acompanhar seu período?', subtitle: 'Combine seu ciclo com seu mapa cósmico.', yes: 'Sim, acompanhar meu ciclo', no: 'Não, obrigada' }, periodRegularity: { title: 'Seu período é regular?', subtitle: 'Seu padrão de ciclo ajuda nas previsões.', yes: 'Sim, bastante regular', yesDesc: 'Meu ciclo é previsível', no: 'Não, é irregular', noDesc: 'Meu ciclo varia' }, lastPeriodKnowledge: { title: 'Você sabe quando foi seu último período?', subtitle: 'Isso nos ajuda a prever seu próximo ciclo.', yes: 'Sim, eu lembro', yesDesc: 'Posso fornecer as datas', no: 'Não, não lembro', noDesc: 'Pular esta etapa' }, lastPeriod: { title: 'Quando foi seu último período?', subtitle: 'Selecione as datas de início e fim.' }, lifestyle: { title: 'Você usa anticoncepcionais hormonais?', subtitle: 'Isso afeta as previsões do ciclo.', yes: 'Sim', yesDesc: 'Uso anticoncepcionais hormonais', no: 'Não', noDesc: 'Não uso anticoncepcionais hormonais' }, hormonal: { title: 'Como você está se sentindo?', subtitle: 'Isso nos ajuda a entender seu estado atual.' }, currentCity: { title: 'Onde você está agora?', subtitle: 'Sua cidade atual para cálculos de trânsitos.' }, calculating: { title: 'Calculando seu mapa...', subtitle: 'Lendo as estrelas no momento do seu nascimento.' }, startDate: 'Data de início', endDate: 'Data de fim', pickStartFirst: 'Escolha primeiro uma data de início' },
  paywall: { title: 'Sua jornada cósmica espera!', subtitle: 'Desbloqueie seu mapa personalizado e todos os recursos', trial: '1 semana de acesso completo', then: 'depois {{price}}/mês', free: 'Continuar grátis', freeDesc: 'Apenas acompanhamento básico do ciclo', cta: 'Obter acesso completo ✦', freeCta: 'Continuar grátis →', selectPlan: 'Selecione um plano para continuar', disclaimer: 'Pagamento seguro. Cancele quando quiser.', features: { chart: 'Análise completa do mapa natal', transits: 'Previsões de trânsitos diárias', cycle: 'Acompanhamento e previsão do ciclo', hormonal: 'Insights de padrões hormonais', moon: 'Integração de fases lunares', wellness: 'Dicas de bem-estar personalizadas', unlimited: 'Acesso ilimitado ao mapa' } },
  auth: { signup: { title: 'Crie sua conta', subtitle: 'Comece sua jornada cósmica.', button: 'Criar conta', login: 'Já tem conta? Entrar' }, login: { title: 'Bem-vinda de volta', subtitle: 'Sua jornada cósmica continua.', button: 'Entrar', signup: 'Não tem conta? Criar uma', forgot: 'Esqueceu a senha?' }, name: 'Seu nome', email: 'Endereço de e-mail', password: 'Senha', signingIn: 'Entrando...', creatingAccount: 'Criando conta...', terms: 'Ao criar uma conta você concorda com nossos termos de serviço e política de privacidade.' },
  home: { greeting: 'Bem-vinda, {{name}} ✨', cycleDay: 'dia', nextPeriod: 'Próximo período em {{days}} dias · {{date}}', todayInsight: 'Insight cósmico de hoje', todayWellness: 'Bem-estar de hoje', moon: 'Lua', transit: 'Trânsito', sunSign: 'Signo solar', mood: 'Humor', stress: 'Estresse', sleep: 'Sono', notLogged: 'Não registrado', readMore: 'Ler mensagem completa' },
  cycle: { title: 'Seu Ciclo', addPeriod: 'Adicionar período', cycleLength: 'Duração do ciclo: {{days}} dias', nextPeriod: 'Próximo período: {{date}} · {{days}} dias', day: 'dia', phases: { menstrual: 'Fase menstrual', follicular: 'Fase folicular', ovulation: 'Fase de ovulação', luteal: 'Fase lútea', unknown: 'Rastreando...' }, phaseDesc: { menstrual: 'Descanso e restauração.', follicular: 'Energia aumentando.', ovulation: 'Energia máxima.', luteal: 'Voltar para dentro.' }, log: { title: 'Registro {{date}}', flow: 'Fluxo', mood: 'Humor', symptoms: 'Sintomas', discharge: 'Corrimento', sex: 'Atividade sexual', notes: 'Notas', save: 'Salvar', notesPlaceholder: 'Como você está se sentindo hoje?', sexYes: '❤️ Sim', sexLog: '+ Registrar' }, flow: { spotting: 'Sangramento leve', light: 'Leve', medium: 'Moderado', heavy: 'Intenso' }, moods: { happy: '😊 Feliz', sad: '😔 Triste', irritable: '😤 Irritada', anxious: '😰 Ansiosa', tired: '😴 Cansada', energetic: '⚡ Energizada', calm: '💆 Calma', overwhelmed: '🤯 Sobrecarregada' }, symptoms: { cramps: 'Cólicas', bloating: 'Inchaço', headache: 'Dor de cabeça', fatigue: 'Fadiga', backache: 'Dor nas costas', nausea: 'Náusea', spotting: 'Sangramento leve', tenderBreasts: 'Seios sensíveis', cravings: 'Desejos', insomnia: 'Insônia', acne: 'Acne', moodSwings: 'Mudanças de humor' }, discharge: { none: 'Nenhum', dry: 'Seco', sticky: 'Pegajoso', creamy: 'Cremoso', watery: 'Aquoso', eggWhite: 'Clara de ovo' }, history: 'Histórico de períodos', noHistory: 'Nenhum período registrado.', legend: { period: 'Período', predicted: 'Previsto', fertile: 'Fértil', ovulation: 'Ovulação' }, addPeriodTitle: 'Adicionar período', savePeriod: 'Salvar', weekdays: { su: 'Do', mo: 'Se', tu: 'Te', we: 'Qu', th: 'Qu', fr: 'Se', sa: 'Sá' } },
  chart: { title: 'Seu Mapa Natal', sun: 'Sol', moon: 'Lua', rising: 'Ascendente', venus: 'Vênus', mars: 'Marte', mercury: 'Mercúrio', jupiter: 'Júpiter', saturn: 'Saturno', sunDesc: 'Identidade central e força vital', moonDesc: 'Emoções e instintos', risingDesc: 'Como os outros te veem', venusDesc: 'Amor e atração', marsDesc: 'Impulso e desejo', mercuryDesc: 'Comunicação e mente', jupiterDesc: 'Expansão e sabedoria', saturnDesc: 'Estrutura e disciplina', calculating: 'Calculando...' },
  transits: { title: 'Trânsitos ao vivo', subtitle: 'Planetas atuais em aspecto com seu mapa natal', updated: 'Atualizado {{time}}', activeNow: 'Ativo agora', intensity: 'intensidade', scanning: 'Analisando o céu atual...', noTransits: 'Nenhum trânsito maior ativo', noTransitsDesc: 'O céu está relativamente calmo hoje.', noChart: 'Complete seu mapa natal para ver os trânsitos.', phase: 'Trânsitos para sua fase {{phase}}', phaseSubtitle: 'como o céu atual interage com seu Sol {{sun}} e sua Lua {{moon}}.', aspectGuide: 'Guia de aspectos', aspects: { conjunction: 'Conjunção', trine: 'Trígono', square: 'Quadratura', opposition: 'Oposição', sextile: 'Sextil' }, aspectDesc: { conjunction: 'Energias fundidas', trine: 'Fluxo harmonioso', square: 'Tensão e crescimento', opposition: 'Consciência e equilíbrio', sextile: 'Oportunidade e facilidade' }, planets: { sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno' } },
  messages: { title: 'Mensagens', new: '{{count}} novo(s)', phase: 'Fase {{phase}} · Dia {{day}}', loading: 'Lendo seu perfil cósmico...', loadingDesc: 'Combinando seu mapa natal com sua fase {{phase}}', noMessages: 'Sem previsões ainda', generate: 'Gerar insights de hoje', refresh: 'Atualizar', notice: 'Seus insights diários são gerados a cada dia usando seu mapa natal e fase de ciclo atual.', tryAgain: 'Tentar novamente', error: 'Não foi possível carregar as previsões. Por favor tente novamente.' },
  profile: { title: 'Seu Perfil', birthInfo: 'Info de nascimento', dateOfBirth: 'Data de nascimento', birthTime: 'Hora de nascimento', birthPlace: 'Local de nascimento', currentCity: 'Cidade atual', cycleInfo: 'Info do ciclo', avgCycle: 'Duração média do ciclo', lastPeriodStart: 'Início do último período', lastPeriodEnd: 'Fim do último período', tracksPeriods: 'Acompanhamento de períodos', subscription: 'Assinatura', status: 'Status', premium: '✦ Premium', free: 'Grátis', upgrade: 'Atualizar para Premium', support: 'Suporte', contactSupport: 'Contatar suporte', privacy: 'Política de privacidade', terms: 'Termos de serviço', logout: 'Sair', language: 'Idioma', selectLanguage: 'Selecionar idioma', days: 'dias', yes: 'Sim', no: 'Não', notSet: 'Não definido', version: 'ZodiacCycle v1.0.0 · Feito com ✦ para o cosmos' },
  landing: { heroLine1: 'Seu ciclo,', heroLine2: 'Suas estrelas', feature1Title: 'Mapa natal completo', feature1Desc: 'Análise astrológica completa baseada na sua hora e local de nascimento exatos', feature2Title: 'Insights de trânsitos', feature2Desc: 'Entenda como os movimentos planetários atuais afetam seu ciclo', feature3Title: 'Rastreamento inteligente', feature3Desc: 'Acompanhamento do ciclo combinado com timing astrológico', subCta: 'Comece sua jornada cósmica personalizada' },
  birthTimeInfo: { title: 'Por que precisamos dessas informações', sunDesc: 'Sua data de nascimento determina seu signo solar e traços de personalidade', moonDesc: 'Hora e local de nascimento nos ajudam a calcular seus signos Lua e Ascendente', planetsTitle: 'Posições planetárias', planetsDesc: 'Detalhes exatos de nascimento nos permitem mapear todas as posições planetárias' },
  notifications: {
    title: 'Notificações', empty: 'Sem notificações ainda', emptyBody: 'Vamos notificá-la sobre seu ciclo, trânsitos e insights diários', markAllRead: 'Marcar tudo como lido',
    periodSoonTitle: '🔴 Período em breve', periodSoonBody: 'Seu período é esperado em {{days}} dias · {{date}}', periodToday: 'Seu período pode começar hoje. Cuide-se 💙',
    ovulationTitle: '🌕 Janela de ovulação', ovulationSoon: 'Sua janela de ovulação abre em {{days}} dias', ovulationToday: 'Você pode estar ovulando hoje — fertilidade máxima', ovulationPeak: 'Você está na sua janela de ovulação máxima',
    phaseChangeTitle: '✨ Nova fase do ciclo', phaseChangeBody: 'Você entrou na sua {{phase}} hoje',
    predictionsTitle: '🔮 Insights diários prontos', predictionsBody: '{{count}} novos insights cósmicos esperam por você', predictionsEmpty: 'Toque para gerar seus insights cósmicos diários',
    transitsTitle: '⭐ {{count}} trânsitos ativos', transitsBody: '{{aspect}} e mais estão afetando seu mapa hoje', transitsBodyGeneric: 'Os movimentos planetários atuais afetam seu mapa',
  },
  premium: {
    moreTransits: 'mais trânsitos disponíveis',
    transitLockedSub: 'Atualize para ver todos os trânsitos planetários ativos',
    unlockTransits: 'Desbloquear todos os trânsitos ✦',
    unlockPremium: 'Desbloquear Premium ✦',
    dailyInsightsTitle: 'Insights cósmicos diários',
    dailyInsightsSub: 'Desbloqueie previsões diárias personalizadas combinando seu mapa natal com sua fase de ciclo atual.',
    feature1: 'Leituras diárias do mapa natal',
    feature2: 'Fase do ciclo + astrologia combinadas',
    feature3: 'Interpretações de trânsitos personalizadas',
    feature4: 'Atualizações ilimitadas todos os dias',
    feature5: 'Sem anúncios em todo o aplicativo',
    feature6: 'Todos os 5 trânsitos ativos revelados',
    trialNote: '€0,99 de teste · depois €5,49/mês · Cancele quando quiser',
  },
  common: { loading: 'Carregando...', error: 'Algo deu errado. Por favor tente novamente.', retry: 'Tentar novamente', save: 'Salvar', cancel: 'Cancelar', close: 'Fechar', confirm: 'Confirmar', or: 'ou' },
};

// ─── AI Translation helpers ───────────────────────────────────────────────────
export async function translateWithAI(text: string, targetLang: string): Promise<string> {
  const WORKER_URL = (import.meta as any).env?.VITE_WORKER_URL ?? '';
  try {
    const res = await fetch(`${WORKER_URL}/ai/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: 'You are a precise translator. Translate the given text to the target language. Return ONLY the translated text, nothing else. Preserve any {{variable}} placeholders exactly as they are.',
        messages: [{ role: 'user', content: `Translate to ${targetLang}:\n${text}` }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || text;
  } catch {
    return text;
  }
}

const CACHE_PREFIX = 'zodiac_translation_';

function getCachedTranslation(langCode: string): typeof en | null {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${langCode}`);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch { return null; }
}

function setCachedTranslation(langCode: string, data: typeof en) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${langCode}`, JSON.stringify(data));
  } catch {}
}

const LANGUAGES_FOR_AI = [
  { code: 'ar', name: 'Arabic' }, { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'hi', name: 'Hindi' }, { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }, { code: 'ru', name: 'Russian' },
  { code: 'tr', name: 'Turkish' }, { code: 'it', name: 'Italian' },
  { code: 'nl', name: 'Dutch' }, { code: 'pl', name: 'Polish' },
  { code: 'sv', name: 'Swedish' }, { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' }, { code: 'nb', name: 'Norwegian' },
  { code: 'uk', name: 'Ukrainian' }, { code: 'id', name: 'Indonesian' },
  { code: 'ms', name: 'Malay' }, { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' }, { code: 'ro', name: 'Romanian' },
  { code: 'hu', name: 'Hungarian' }, { code: 'cs', name: 'Czech' },
  { code: 'el', name: 'Greek' }, { code: 'he', name: 'Hebrew' },
  { code: 'fa', name: 'Persian' }, { code: 'bn', name: 'Bengali' },
  { code: 'ur', name: 'Urdu' }, { code: 'sw', name: 'Swahili' },
  { code: 'yo', name: 'Yoruba' }, { code: 'ig', name: 'Igbo' },
  { code: 'ha', name: 'Hausa' }, { code: 'am', name: 'Amharic' },
  { code: 'zu', name: 'Zulu' }, { code: 'af', name: 'Afrikaans' },
  { code: 'tl', name: 'Filipino' }, { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' }, { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' }, { code: 'pa', name: 'Punjabi' },
  { code: 'kn', name: 'Kannada' }, { code: 'ml', name: 'Malayalam' },
  { code: 'my', name: 'Burmese' }, { code: 'km', name: 'Khmer' },
  { code: 'ka', name: 'Georgian' }, { code: 'az', name: 'Azerbaijani' },
  { code: 'kk', name: 'Kazakh' }, { code: 'uz', name: 'Uzbek' },
  { code: 'hy', name: 'Armenian' }, { code: 'ne', name: 'Nepali' },
  { code: 'mn', name: 'Mongolian' }, { code: 'sq', name: 'Albanian' },
  { code: 'bs', name: 'Bosnian' }, { code: 'hr', name: 'Croatian' },
  { code: 'sr', name: 'Serbian' }, { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' }, { code: 'bg', name: 'Bulgarian' },
  { code: 'lt', name: 'Lithuanian' }, { code: 'lv', name: 'Latvian' },
  { code: 'et', name: 'Estonian' }, { code: 'is', name: 'Icelandic' },
  { code: 'cy', name: 'Welsh' }, { code: 'ga', name: 'Irish' },
  { code: 'eu', name: 'Basque' }, { code: 'ca', name: 'Catalan' },
];

async function generateFullTranslation(langCode: string, langName: string): Promise<typeof en> {
  const WORKER_URL = (import.meta as any).env?.VITE_WORKER_URL ?? '';
  const sections = Object.keys(en) as (keyof typeof en)[];
  const translated: any = {};
  for (const section of sections) {
    try {
      const res = await fetch(`${WORKER_URL}/ai/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: `You are a precise translator. Translate the JSON values to ${langName}. Keep ALL JSON keys exactly as they are. Keep {{variable}} placeholders exactly as they are. Keep emoji exactly as they are. Return ONLY valid JSON, no markdown, no explanation.`,
          messages: [{ role: 'user', content: `Translate these values to ${langName}. Return valid JSON only:\n${JSON.stringify((en as any)[section], null, 2)}` }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || '';
      const clean = text.replace(/```json|```/g, '').trim();
      translated[section] = JSON.parse(clean);
    } catch {
      translated[section] = (en as any)[section];
    }
  }
  return translated as typeof en;
}

export async function loadLanguage(langCode: string): Promise<void> {
  const base = langCode.split('-')[0];
  if (i18n.hasResourceBundle(base, 'translation')) return;
  const cached = getCachedTranslation(base);
  if (cached) {
    i18n.addResourceBundle(base, 'translation', cached, true, true);
    return;
  }
  const lang = LANGUAGES_FOR_AI.find(l => l.code === base);
  if (!lang) return;
  try {
    const translation = await generateFullTranslation(base, lang.name);
    setCachedTranslation(base, translation);
    i18n.addResourceBundle(base, 'translation', translation, true, true);
  } catch {}
}

// ─── Init ─────────────────────────────────────────────────────────────────────
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      de: { translation: de },
      es: { translation: es },
      pt: { translation: pt },
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'zodiac_language',
    },
  });

export default i18n; 