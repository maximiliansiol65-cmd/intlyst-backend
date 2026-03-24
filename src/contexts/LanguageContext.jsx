import React, { createContext, useContext, useState, useEffect } from 'react';

// Language translations
const translations = {
  de: {
    // Navigation
    dashboard: 'Dashboard',
    analyse: 'Analyse',
    wachstum: 'Wachstum',
    kunden: 'Kunden',
    standort: 'Standort',
    reports: 'Reports',
    market: 'Markt',
    abtests: 'A/B Tests',
    tasks: 'Tasks',
    alerts: 'Alerts',
    settings: 'Einstellungen',
    more: 'Mehr',

    // Settings tabs
    account: 'Konto',
    team: 'Team',
    dataSources: 'Datenquellen',
    notifications: 'Benachrichtigungen',
    subscription: 'Abonnement',
    language: 'Sprache',

    // Language names
    german: 'Deutsch',
    english: 'English',
    spanish: 'Español',
    french: 'Français',

    // Common buttons
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    close: 'Schließen',
    add: 'Hinzufügen',
    remove: 'Entfernen',
    logout: 'Abmelden',

    // Account
    profile: 'Profil',
    name: 'Name',
    email: 'E-Mail',
    password: 'Passwort',
    changePassword: 'Passwort ändern',
    currentPassword: 'Aktuelles Passwort',
    newPassword: 'Neues Passwort',
    confirmPassword: 'Passwort bestätigen',
    deleteAccount: 'Konto löschen',
    profileSaved: 'Profil gespeichert.',
    passwordChanged: 'Passwort geändert.',
    accountDeleted: 'Konto gelöscht.',

    // Reports
    createReport: 'Report erstellen',
    monthlyReport: 'Monatsreport',
    investorReport: 'Investoren-Report',
    teamReport: 'Team-Report',
    generateReport: 'Report generieren',
    saveInsight: 'Als Erkenntnis merken',
    exportPDF: 'PDF exportieren',
    insights: 'Erkenntnisse',
    savedInsights: 'Gespeicherte Erkenntnisse',
    chatHistory: 'Chat-History',
    aiSummary: 'KI-Zusammenfassung',
    searchInsights: 'Erkenntnisse durchsuchen...',

    // Dashboard
    goodMorning: 'Guten Morgen',
    goodDay: 'Guten Tag',
    goodEvening: 'Guten Abend',
    weeklyReview: 'Wöchentliches Review',
    recommendationsCompleted: 'Empfehlungen umgesetzt',
    revenue: 'Umsatz',
    nextRecommendations: 'Nächste Empfehlungen',
    goalAdjustment: 'Ziel-Anpassung',
    tooEasy: 'Zu einfach',
    perfect: 'Perfekt',
    tooHard: 'Zu schwer',
    suggestedTarget: 'Empfohlenes Ziel',
    accept: 'Akzeptieren',
    dismiss: 'Ablehnen',

    // Messages
    success: 'Erfolgreich',
    error: 'Fehler',
    loading: 'Wird geladen...',
    noData: 'Keine Daten verfügbar',
    empty: 'Leer',
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    analyse: 'Analysis',
    wachstum: 'Growth',
    kunden: 'Customers',
    standort: 'Location',
    reports: 'Reports',
    market: 'Market',
    abtests: 'A/B Tests',
    tasks: 'Tasks',
    alerts: 'Alerts',
    settings: 'Settings',
    more: 'More',

    // Settings tabs
    account: 'Account',
    team: 'Team',
    dataSources: 'Data Sources',
    notifications: 'Notifications',
    subscription: 'Subscription',
    language: 'Language',

    // Language names
    german: 'Deutsch',
    english: 'English',
    spanish: 'Español',
    french: 'Français',

    // Common buttons
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    add: 'Add',
    remove: 'Remove',
    logout: 'Logout',

    // Account
    profile: 'Profile',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    deleteAccount: 'Delete Account',
    profileSaved: 'Profile saved.',
    passwordChanged: 'Password changed.',
    accountDeleted: 'Account deleted.',

    // Reports
    createReport: 'Create Report',
    monthlyReport: 'Monthly Report',
    investorReport: 'Investor Report',
    teamReport: 'Team Report',
    generateReport: 'Generate Report',
    saveInsight: 'Save as Insight',
    exportPDF: 'Export PDF',
    insights: 'Insights',
    savedInsights: 'Saved Insights',
    chatHistory: 'Chat History',
    aiSummary: 'AI Summary',
    searchInsights: 'Search insights...',

    // Dashboard
    goodMorning: 'Good Morning',
    goodDay: 'Good Day',
    goodEvening: 'Good Evening',
    weeklyReview: 'Weekly Review',
    recommendationsCompleted: 'Recommendations Completed',
    revenue: 'Revenue',
    nextRecommendations: 'Next Recommendations',
    goalAdjustment: 'Goal Adjustment',
    tooEasy: 'Too Easy',
    perfect: 'Perfect',
    tooHard: 'Too Hard',
    suggestedTarget: 'Suggested Target',
    accept: 'Accept',
    dismiss: 'Dismiss',

    // Messages
    success: 'Success',
    error: 'Error',
    loading: 'Loading...',
    noData: 'No data available',
    empty: 'Empty',
  },
  es: {
    // Navigation
    dashboard: 'Panel de Control',
    analyse: 'Análisis',
    wachstum: 'Crecimiento',
    kunden: 'Clientes',
    standort: 'Ubicación',
    reports: 'Reportes',
    market: 'Mercado',
    abtests: 'Pruebas A/B',
    tasks: 'Tareas',
    alerts: 'Alertas',
    settings: 'Configuración',
    more: 'Más',

    // Settings tabs
    account: 'Cuenta',
    team: 'Equipo',
    dataSources: 'Fuentes de Datos',
    notifications: 'Notificaciones',
    subscription: 'Suscripción',
    language: 'Idioma',

    // Language names
    german: 'Deutsch',
    english: 'English',
    spanish: 'Español',
    french: 'Français',

    // Common buttons
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    close: 'Cerrar',
    add: 'Agregar',
    remove: 'Quitar',
    logout: 'Cerrar Sesión',

    // Account
    profile: 'Perfil',
    name: 'Nombre',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    changePassword: 'Cambiar Contraseña',
    currentPassword: 'Contraseña Actual',
    newPassword: 'Nueva Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    deleteAccount: 'Eliminar Cuenta',
    profileSaved: 'Perfil guardado.',
    passwordChanged: 'Contraseña cambiada.',
    accountDeleted: 'Cuenta eliminada.',

    // Reports
    createReport: 'Crear Reporte',
    monthlyReport: 'Reporte Mensual',
    investorReport: 'Reporte para Inversores',
    teamReport: 'Reporte del Equipo',
    generateReport: 'Generar Reporte',
    saveInsight: 'Guardar como Insight',
    exportPDF: 'Exportar PDF',
    insights: 'Insights',
    savedInsights: 'Insights Guardados',
    chatHistory: 'Historial de Chat',
    aiSummary: 'Resumen de IA',
    searchInsights: 'Buscar insights...',

    // Dashboard
    goodMorning: 'Buenos Días',
    goodDay: 'Buen Día',
    goodEvening: 'Buenas Noches',
    weeklyReview: 'Revisión Semanal',
    recommendationsCompleted: 'Recomendaciones Completadas',
    revenue: 'Ingresos',
    nextRecommendations: 'Próximas Recomendaciones',
    goalAdjustment: 'Ajuste de Objetivo',
    tooEasy: 'Muy Fácil',
    perfect: 'Perfecto',
    tooHard: 'Muy Difícil',
    suggestedTarget: 'Objetivo Sugerido',
    accept: 'Aceptar',
    dismiss: 'Rechazar',

    // Messages
    success: 'Éxito',
    error: 'Error',
    loading: 'Cargando...',
    noData: 'No hay datos disponibles',
    empty: 'Vacío',
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de Bord',
    analyse: 'Analyse',
    wachstum: 'Croissance',
    kunden: 'Clients',
    standort: 'Localisation',
    reports: 'Rapports',
    market: 'Marché',
    abtests: 'Tests A/B',
    tasks: 'Tâches',
    alerts: 'Alertes',
    settings: 'Paramètres',
    more: 'Plus',

    // Settings tabs
    account: 'Compte',
    team: 'Équipe',
    dataSources: 'Sources de Données',
    notifications: 'Notifications',
    subscription: 'Abonnement',
    language: 'Langue',

    // Language names
    german: 'Deutsch',
    english: 'English',
    spanish: 'Español',
    french: 'Français',

    // Common buttons
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    close: 'Fermer',
    add: 'Ajouter',
    remove: 'Retirer',
    logout: 'Déconnexion',

    // Account
    profile: 'Profil',
    name: 'Nom',
    email: 'E-mail',
    password: 'Mot de Passe',
    changePassword: 'Changer le Mot de Passe',
    currentPassword: 'Mot de Passe Actuel',
    newPassword: 'Nouveau Mot de Passe',
    confirmPassword: 'Confirmer le Mot de Passe',
    deleteAccount: 'Supprimer le Compte',
    profileSaved: 'Profil enregistré.',
    passwordChanged: 'Mot de passe modifié.',
    accountDeleted: 'Compte supprimé.',

    // Reports
    createReport: 'Créer un Rapport',
    monthlyReport: 'Rapport Mensuel',
    investorReport: 'Rapport pour Investisseurs',
    teamReport: 'Rapport d\'Équipe',
    generateReport: 'Générer un Rapport',
    saveInsight: 'Enregistrer comme Insight',
    exportPDF: 'Exporter en PDF',
    insights: 'Insights',
    savedInsights: 'Insights Enregistrés',
    chatHistory: 'Historique de Chat',
    aiSummary: 'Résumé IA',
    searchInsights: 'Rechercher des insights...',

    // Dashboard
    goodMorning: 'Bonjour',
    goodDay: 'Bon Jour',
    goodEvening: 'Bonsoir',
    weeklyReview: 'Examen Hebdomadaire',
    recommendationsCompleted: 'Recommandations Complétées',
    revenue: 'Chiffre d\'Affaires',
    nextRecommendations: 'Prochaines Recommandations',
    goalAdjustment: 'Ajustement d\'Objectif',
    tooEasy: 'Trop Facile',
    perfect: 'Parfait',
    tooHard: 'Trop Difficile',
    suggestedTarget: 'Objectif Suggéré',
    accept: 'Accepter',
    dismiss: 'Rejeter',

    // Messages
    success: 'Succès',
    error: 'Erreur',
    loading: 'Chargement...',
    noData: 'Aucune donnée disponible',
    empty: 'Vide',
  },
};

// Create context
const LanguageContext = createContext();

// Provider component
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage
    const saved = localStorage.getItem('app-language');
    return saved || 'de';
  });

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('app-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['de'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
