// Shared nav table — lives apart from Header so SearchOverlay can import it without a cycle.
export const NAV_LINKS = [
  { label: "Novidades", to: "/novidades" },
  { label: "Vestidos", to: "/categoria/vestidos" },
  { label: "Blusas", to: "/categoria/blusas" },
  { label: "Calças", to: "/categoria/calcas" },
  { label: "Shorts & Saias", to: "/categoria/shorts-e-saias" },
  { label: "Beachwear", to: "/categoria/beachwear" },
  { label: "Outlet", to: "/outlet", highlight: true },
];
