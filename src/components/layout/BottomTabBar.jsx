/* eslint-disable */
import { NavLink } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

const IcoHome = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 10L12 3l9 7v11a1 1 0 01-1 1H4a1 1 0 01-1-1V10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M9 21v-7h6v7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);
const IcoChart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 18l5-5 4 4 9-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IcoRocket = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14 2S19 4 19 11c0 3-2 5-4 6.5L12 20l-3-2.5C7 16 5 14 5 11 5 4 10 2 10 2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
const IcoCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 13l5 5L20 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IcoGrid = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const TABS = [
  { to: "/",         label: "Dashboard", Icon: IcoHome,   end: true },
  { to: "/analyse",  label: "Analyse",   Icon: IcoChart },
  { to: "/wachstum", label: "Wachstum",  Icon: IcoRocket },
  { to: "/tasks",    label: "Tasks",     Icon: IcoCheck },
  { to: "/mehr",     label: "Mehr",      Icon: IcoGrid },
];

export default function BottomTabBar() {
  const { t } = useLanguage();

  const TABS = [
    { to: "/",         labelKey: "dashboard", Icon: IcoHome,   end: true },
    { to: "/analyse",  labelKey: "analyse",   Icon: IcoChart },
    { to: "/wachstum", labelKey: "wachstum",  Icon: IcoRocket },
    { to: "/tasks",    labelKey: "tasks",     Icon: IcoCheck },
    { to: "/mehr",     labelKey: "more",      Icon: IcoGrid },
  ];

  return (
    <nav className="bottom-tabbar" role="navigation" aria-label="Mobile Navigation">
      {TABS.map(({ to, labelKey, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `bottom-tab${isActive ? " active" : ""}`}
          aria-label={t(labelKey)}
        >
          <Icon />
          <span>{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
