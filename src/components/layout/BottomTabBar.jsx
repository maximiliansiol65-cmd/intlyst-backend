/* eslint-disable */
import { NavLink } from "react-router-dom";

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
const IcoPeople = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 21c0-4 3.1-7 7-7s7 3 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M17 11a3 3 0 100-6M21 21c0-3-1.5-5.5-4-6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IcoSocial = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="18" cy="5"  r="3" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="6"  cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8.6 10.7l6.8-4M8.6 13.3l6.8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IcoCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 13l5 5L20 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TABS = [
  { to: "/",         label: "Dashboard", Icon: IcoHome,   end: true },
  { to: "/analyse",  label: "Analyse",   Icon: IcoChart },
  { to: "/wachstum", label: "Wachstum",  Icon: IcoRocket },
  { to: "/kunden",   label: "Kunden",    Icon: IcoPeople },
  { to: "/social",   label: "Social",    Icon: IcoSocial },
  { to: "/aufgaben", label: "Aufgaben",  Icon: IcoCheck },
];

export default function BottomTabBar() {
  return (
    <nav className="bottom-tabbar" role="navigation" aria-label="Mobile Navigation">
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `bottom-tab${isActive ? " active" : ""}`}
          aria-label={label}
        >
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
