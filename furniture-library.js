/* ================================================================
   ScenoPlan — Furniture Library
   Defines all available furniture items with their shapes, 
   dimensions, and visual rendering.
   ================================================================ */

const FURNITURE_LIBRARY = {
    tables: {
        name: "Tables",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="1"/><line x1="6" y1="16" x2="6" y2="20"/><line x1="18" y1="16" x2="18" y2="20"/></svg>`,
        items: [
            {
                id: "table-rect-6",
                name: "Table rect. 6p",
                width: 1.8,   // meters
                height: 0.8,
                color: "#8B7355",
                shape: "rect",
                seats: 6,
                description: "Table rectangulaire 6 personnes"
            },
            {
                id: "table-rect-8",
                name: "Table rect. 8p",
                width: 2.4,
                height: 0.8,
                color: "#8B7355",
                shape: "rect",
                seats: 8,
                description: "Table rectangulaire 8 personnes"
            },
            {
                id: "table-rect-10",
                name: "Table rect. 10p",
                width: 3.0,
                height: 0.9,
                color: "#8B7355",
                shape: "rect",
                seats: 10,
                description: "Table rectangulaire 10 personnes"
            },
            {
                id: "table-round-6",
                name: "Table ronde 6p",
                width: 1.2,
                height: 1.2,
                color: "#8B7355",
                shape: "circle",
                seats: 6,
                description: "Table ronde 6 personnes (Ø120cm)"
            },
            {
                id: "table-round-8",
                name: "Table ronde 8p",
                width: 1.5,
                height: 1.5,
                color: "#8B7355",
                shape: "circle",
                seats: 8,
                description: "Table ronde 8 personnes (Ø150cm)"
            },
            {
                id: "table-round-10",
                name: "Table ronde 10p",
                width: 1.8,
                height: 1.8,
                color: "#8B7355",
                shape: "circle",
                seats: 10,
                description: "Table ronde 10 personnes (Ø180cm)"
            },
            {
                id: "table-cocktail",
                name: "Table cocktail",
                width: 0.6,
                height: 0.6,
                color: "#A0937E",
                shape: "circle",
                seats: 0,
                description: "Table haute cocktail (Ø60cm)"
            },
            {
                id: "table-conference",
                name: "Table conférence",
                width: 4.0,
                height: 1.2,
                color: "#7A6B55",
                shape: "rect",
                seats: 14,
                description: "Grande table de conférence"
            }
        ]
    },
    chairs: {
        name: "Chaises & Assises",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 11V5a2 2 0 012-2h10a2 2 0 012 2v6"/><rect x="4" y="11" width="16" height="4" rx="1"/><line x1="6" y1="15" x2="6" y2="21"/><line x1="18" y1="15" x2="18" y2="21"/></svg>`,
        items: [
            {
                id: "chair",
                name: "Chaise",
                width: 0.45,
                height: 0.45,
                color: "#5D7A99",
                shape: "chair",
                description: "Chaise standard"
            },
            {
                id: "armchair",
                name: "Fauteuil",
                width: 0.7,
                height: 0.7,
                color: "#6B5B8A",
                shape: "rect-rounded",
                description: "Fauteuil confortable"
            },
            {
                id: "sofa-2",
                name: "Canapé 2 places",
                width: 1.5,
                height: 0.8,
                color: "#6B5B8A",
                shape: "rect-rounded",
                description: "Canapé 2 places"
            },
            {
                id: "sofa-3",
                name: "Canapé 3 places",
                width: 2.1,
                height: 0.8,
                color: "#6B5B8A",
                shape: "rect-rounded",
                description: "Canapé 3 places"
            },
            {
                id: "bench",
                name: "Banc",
                width: 1.8,
                height: 0.4,
                color: "#7A8B6B",
                shape: "rect",
                description: "Banc 3 places"
            },
            {
                id: "pouf",
                name: "Pouf",
                width: 0.5,
                height: 0.5,
                color: "#8B6B6B",
                shape: "circle",
                description: "Pouf individuel"
            }
        ]
    },
    buffets: {
        name: "Buffets & Bars",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="1"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="8" y1="6" x2="8" y2="12"/><line x1="16" y1="12" x2="16" y2="18"/></svg>`,
        items: [
            {
                id: "buffet-line",
                name: "Buffet linéaire",
                width: 3.0,
                height: 0.8,
                color: "#8B8878",
                shape: "rect",
                description: "Buffet linéaire standard"
            },
            {
                id: "buffet-L",
                name: "Buffet en L",
                width: 2.4,
                height: 2.4,
                color: "#8B8878",
                shape: "L-shape",
                description: "Buffet en forme de L"
            },
            {
                id: "bar-straight",
                name: "Bar droit",
                width: 2.0,
                height: 0.6,
                color: "#5A4A3A",
                shape: "rect",
                description: "Bar droit avec comptoir"
            },
            {
                id: "bar-curved",
                name: "Bar arrondi",
                width: 2.0,
                height: 1.2,
                color: "#5A4A3A",
                shape: "arc",
                description: "Bar avec comptoir arrondi"
            }
        ]
    },
    scene: {
        name: "Scène & Estrade",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="8" width="20" height="10" rx="1"/><path d="M4 8V6a1 1 0 011-1h14a1 1 0 011 1v2"/></svg>`,
        items: [
            {
                id: "stage-small",
                name: "Estrade 3×2",
                width: 3.0,
                height: 2.0,
                color: "#4A4A5A",
                shape: "rect",
                description: "Petite estrade 3m × 2m"
            },
            {
                id: "stage-medium",
                name: "Estrade 6×4",
                width: 6.0,
                height: 4.0,
                color: "#4A4A5A",
                shape: "rect",
                description: "Estrade moyenne 6m × 4m"
            },
            {
                id: "stage-large",
                name: "Estrade 10×6",
                width: 10.0,
                height: 6.0,
                color: "#4A4A5A",
                shape: "rect",
                description: "Grande estrade 10m × 6m"
            },
            {
                id: "podium",
                name: "Pupitre",
                width: 0.6,
                height: 0.5,
                color: "#5A5A6A",
                shape: "trapezoid",
                description: "Pupitre / lutrin"
            }
        ]
    },
    expo: {
        name: "Stands & Cloisons",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>`,
        items: [
            {
                id: "stand-3x3",
                name: "Stand 3×3",
                width: 3.0,
                height: 3.0,
                color: "#6A7A8A",
                shape: "stand",
                description: "Stand d'exposition 3m × 3m"
            },
            {
                id: "stand-6x3",
                name: "Stand 6×3",
                width: 6.0,
                height: 3.0,
                color: "#6A7A8A",
                shape: "stand",
                description: "Stand d'exposition 6m × 3m"
            },
            {
                id: "stand-9x3",
                name: "Stand 9×3",
                width: 9.0,
                height: 3.0,
                color: "#6A7A8A",
                shape: "stand",
                description: "Grand stand 9m × 3m"
            },
            {
                id: "partition-wall",
                name: "Cloison 2.5m",
                width: 2.5,
                height: 0.08,
                color: "#9A9AAA",
                shape: "rect",
                description: "Cloison amovible 2.5m"
            },
            {
                id: "partition-wall-short",
                name: "Cloison 1.5m",
                width: 1.5,
                height: 0.08,
                color: "#9A9AAA",
                shape: "rect",
                description: "Cloison amovible 1.5m"
            }
        ]
    },
    tech: {
        name: "Technique",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
        items: [
            {
                id: "projector-screen",
                name: "Écran projecteur",
                width: 3.0,
                height: 0.15,
                color: "#E8E8E8",
                shape: "rect",
                description: "Écran de projection 3m"
            },
            {
                id: "tv-screen",
                name: "Écran TV",
                width: 1.4,
                height: 0.1,
                color: "#333344",
                shape: "rect",
                description: "Écran TV 55 pouces"
            },
            {
                id: "tv-stand-switch",
                name: "TV avec Switch & 2 manettes",
                width: 1.4,
                height: 0.55,
                color: "#1e222b",
                shape: "tv-switch",
                description: "Meuble TV avec plateau, écran 55\", console Nintendo Switch et 2 manettes"
            },
            {
                id: "speaker",
                name: "Enceinte",
                width: 0.4,
                height: 0.35,
                color: "#2A2A3A",
                shape: "rect",
                description: "Enceinte sur pied"
            },
            {
                id: "light-spot",
                name: "Spot éclairage",
                width: 0.3,
                height: 0.3,
                color: "#FFD700",
                shape: "circle",
                description: "Spot d'éclairage"
            },
            {
                id: "lyre-beam",
                name: "Lyre asservie / Spot",
                width: 0.45,
                height: 0.45,
                color: "#3377FF",
                shape: "spotlight",
                description: "Lyre robotisée motorisée avec faisceau"
            },
            {
                id: "par-stand",
                name: "Projecteur PAR sur pied",
                width: 0.5,
                height: 0.5,
                color: "#FFAA22",
                shape: "spotlight",
                description: "Projecteur PAR sur pied télescopique"
            },
            {
                id: "followspot",
                name: "Poursuite scénique",
                width: 0.8,
                height: 0.5,
                color: "#EEEEEE",
                shape: "spotlight",
                description: "Poursuite de scène sur trépied lourd"
            },
            {
                id: "laptop",
                name: "PC Portable / Régie",
                width: 0.4,
                height: 0.3,
                color: "#556677",
                shape: "computer",
                description: "Ordinateur portable ouvert"
            },
            {
                id: "desktop-pc",
                name: "Station PC & Écran",
                width: 0.6,
                height: 0.4,
                color: "#334455",
                shape: "computer",
                description: "Poste de travail PC avec écran et clavier"
            },
            {
                id: "pc-gamer",
                name: "Tour PC Gamer RGB",
                width: 0.5,
                height: 0.3,
                color: "#181C24",
                shape: "computer",
                description: "Tour PC gaming avec vitre en verre trempé et ventilateurs ARGB"
            },
            {
                id: "setup-gamer",
                name: "Setup Gamer Complet",
                width: 1.2,
                height: 0.7,
                color: "#141720",
                shape: "computer",
                description: "Station gaming : Écran 34\", tour ARGB, clavier mécanique & souris"
            },
            {
                id: "power-box",
                name: "Boîtier électrique",
                width: 0.4,
                height: 0.4,
                color: "#CC4444",
                shape: "rect",
                description: "Boîtier de raccordement"
            }
        ]
    },
    deco: {
        name: "Décoration",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c-4.97 0-9-2.24-9-5v-4l9-7 9 7v4c0 2.76-4.03 5-9 5z"/><path d="M12 22v-7"/></svg>`,
        items: [
            {
                id: "plant-pot",
                name: "Plante en pot",
                width: 0.5,
                height: 0.5,
                color: "#4A8B5A",
                shape: "circle",
                description: "Plante décorative en pot"
            },
            {
                id: "flower-arrangement",
                name: "Composition florale",
                width: 0.4,
                height: 0.4,
                color: "#CC6699",
                shape: "circle",
                description: "Centre de table fleuri"
            },
            {
                id: "carpet-rect",
                name: "Tapis rectangulaire",
                width: 3.0,
                height: 2.0,
                color: "#8B4444",
                shape: "carpet",
                description: "Tapis rectangulaire 3×2m"
            },
            {
                id: "carpet-round",
                name: "Tapis rond",
                width: 2.0,
                height: 2.0,
                color: "#8B4444",
                shape: "carpet-circle",
                description: "Tapis rond Ø2m"
            }
        ]
    },
    signage: {
        name: "Signalétique",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="12" rx="2"/><line x1="12" y1="15" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/></svg>`,
        items: [
            {
                id: "banner-stand",
                name: "Roll-up banner",
                width: 0.85,
                height: 0.3,
                color: "#5588AA",
                shape: "rect",
                description: "Roll-up 85cm × 200cm (h)"
            },
            {
                id: "totem",
                name: "Totem",
                width: 0.5,
                height: 0.5,
                color: "#5588AA",
                shape: "rect",
                description: "Totem signalétique"
            },
            {
                id: "reception-desk",
                name: "Accueil / Desk",
                width: 2.0,
                height: 0.7,
                color: "#6A7A8A",
                shape: "arc",
                description: "Comptoir d'accueil"
            }
        ]
    },
    barriers: {
        name: "Sécurité & Barrières",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="8" rx="1"/><line x1="4" y1="14" x2="4" y2="20"/><line x1="20" y1="14" x2="20" y2="20"/><line x1="7" y1="6" x2="17" y2="14"/><line x1="12" y1="6" x2="22" y2="14"/></svg>`,
        items: [
            {
                id: "vauban-barrier",
                name: "Barrière Vauban",
                width: 2.0,
                height: 0.12,
                color: "#B0B0B0",
                shape: "barrier",
                description: "Barrière Vauban 2m (acier galvanisé)"
            },
            {
                id: "vauban-barrier-short",
                name: "Barr. Vauban 1m",
                width: 1.0,
                height: 0.12,
                color: "#B0B0B0",
                shape: "barrier",
                description: "Barrière Vauban courte 1m"
            },
            {
                id: "heras-fence",
                name: "Clôture Heras",
                width: 3.5,
                height: 0.06,
                color: "#888888",
                shape: "fence",
                description: "Panneau clôture Heras 3.5m × 2m (h)"
            },
            {
                id: "crowd-barrier",
                name: "Barrière police",
                width: 2.5,
                height: 0.10,
                color: "#C0C0C0",
                shape: "barrier",
                description: "Barrière de foule type police 2.5m"
            },
            {
                id: "belt-stanchion",
                name: "Potelet à sangle",
                width: 0.3,
                height: 0.3,
                color: "#D4AF37",
                shape: "circle",
                description: "Potelet à sangle rétractable"
            },
            {
                id: "belt-line-3m",
                name: "Ligne potelets 3m",
                width: 3.0,
                height: 0.08,
                color: "#D4AF37",
                shape: "barrier-belt",
                description: "Ligne de 3 potelets à sangle (3m)"
            },
            {
                id: "jersey-barrier",
                name: "Bloc jersey béton",
                width: 1.6,
                height: 0.6,
                color: "#8A8A8A",
                shape: "rect",
                description: "Bloc jersey béton anti-véhicule"
            },
            {
                id: "cone",
                name: "Cône signalisation",
                width: 0.3,
                height: 0.3,
                color: "#FF6B00",
                shape: "cone",
                description: "Cône de signalisation"
            },
            {
                id: "fire-extinguisher",
                name: "Extincteur",
                width: 0.25,
                height: 0.25,
                color: "#DD2222",
                shape: "circle",
                description: "Extincteur sur pied"
            },
            {
                id: "first-aid",
                name: "Poste secours",
                width: 3.0,
                height: 3.0,
                color: "#DD3333",
                shape: "stand",
                description: "Poste de premiers secours 3×3m"
            },
            {
                id: "exit-sign",
                name: "Sortie secours",
                width: 0.6,
                height: 0.08,
                color: "#22BB44",
                shape: "rect",
                description: "Panneau sortie de secours"
            },
            {
                id: "fire-lane",
                name: "Voie pompiers",
                width: 6.0,
                height: 4.0,
                color: "#DD333320",
                shape: "carpet",
                description: "Zone réservée voie pompiers 6×4m"
            }
        ]
    },
    production: {
        name: "Production & Régie",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8,21 16,21"/><line x1="12" y1="17" x2="12" y2="21"/><circle cx="7" cy="10" r="1"/><rect x="10" y="8" width="8" height="5" rx="1"/></svg>`,
        items: [
            {
                id: "pc-securite",
                name: "PC Sécurité",
                width: 4.0,
                height: 3.0,
                color: "#CC3333",
                shape: "stand",
                description: "Poste de commandement sécurité"
            },
            {
                id: "pc-organisation",
                name: "PC Organisation",
                width: 4.0,
                height: 3.0,
                color: "#3366AA",
                shape: "stand",
                description: "Poste de commandement organisation"
            },
            {
                id: "regie-son",
                name: "Régie son",
                width: 3.0,
                height: 2.0,
                color: "#444466",
                shape: "rect",
                description: "Régie son / mixage"
            },
            {
                id: "regie-lumiere",
                name: "Régie lumière",
                width: 2.5,
                height: 1.8,
                color: "#555577",
                shape: "rect",
                description: "Régie éclairage"
            },
            {
                id: "regie-video",
                name: "Régie vidéo",
                width: 3.0,
                height: 2.0,
                color: "#335555",
                shape: "rect",
                description: "Régie vidéo / réalisation"
            },
            {
                id: "generator",
                name: "Groupe électrogène",
                width: 2.5,
                height: 1.2,
                color: "#FF8800",
                shape: "rect",
                description: "Groupe électrogène 100kVA"
            },
            {
                id: "generator-small",
                name: "Groupe élec. petit",
                width: 1.5,
                height: 0.8,
                color: "#FF8800",
                shape: "rect",
                description: "Groupe électrogène 30kVA"
            },
            {
                id: "cable-ramp",
                name: "Passe-câbles",
                width: 3.0,
                height: 0.15,
                color: "#FFCC00",
                shape: "rect",
                description: "Rampe passe-câbles 3m"
            },
            {
                id: "flight-case",
                name: "Flight case",
                width: 1.2,
                height: 0.6,
                color: "#333333",
                shape: "rect",
                description: "Flight case matériel"
            },
            {
                id: "truss-point",
                name: "Pied de structure",
                width: 0.4,
                height: 0.4,
                color: "#AAAAAA",
                shape: "rect",
                description: "Pied de truss / structure alu"
            },
            {
                id: "ambulance",
                name: "Ambulance (emprise)",
                width: 6.0,
                height: 2.5,
                color: "#FFFFFF",
                shape: "vehicle",
                description: "Emplacement ambulance 6×2.5m"
            },
            {
                id: "vehicle-small",
                name: "Véhicule léger",
                width: 4.5,
                height: 2.0,
                color: "#6688AA",
                shape: "vehicle",
                description: "Emplacement véhicule léger"
            },
            {
                id: "truck",
                name: "Camion / Semi",
                width: 12.0,
                height: 2.8,
                color: "#556677",
                shape: "vehicle",
                description: "Emplacement camion semi-remorque"
            }
        ]
    },
    backgrounds: {
        name: "Fonds & Habillage",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="2"/><path d="M21 15l-5-5L5 21"/></svg>`,
        items: [
            {
                id: "green-screen-3m",
                name: "Fond vert 3m",
                width: 3.0,
                height: 0.15,
                color: "#00CC44",
                shape: "backdrop",
                description: "Fond vert (chromakey) 3m × 2.5m (h)"
            },
            {
                id: "green-screen-6m",
                name: "Fond vert 6m",
                width: 6.0,
                height: 0.15,
                color: "#00CC44",
                shape: "backdrop",
                description: "Fond vert (chromakey) 6m × 3m (h)"
            },
            {
                id: "black-backdrop",
                name: "Fond noir 3m",
                width: 3.0,
                height: 0.15,
                color: "#1A1A1A",
                shape: "backdrop",
                description: "Fond noir pendrillon 3m × 3m (h)"
            },
            {
                id: "white-backdrop",
                name: "Fond blanc 3m",
                width: 3.0,
                height: 0.15,
                color: "#EEEEEE",
                shape: "backdrop",
                description: "Fond blanc studio 3m × 2.5m (h)"
            },
            {
                id: "photobooth",
                name: "Photobooth",
                width: 2.5,
                height: 2.0,
                color: "#CC44AA",
                shape: "stand",
                description: "Espace photobooth 2.5×2m"
            },
            {
                id: "press-wall",
                name: "Mur presse",
                width: 4.0,
                height: 0.2,
                color: "#4466AA",
                shape: "backdrop",
                description: "Mur presse / photocall 4m × 2.3m (h)"
            },
            {
                id: "drape-line",
                name: "Ligne de pendrillons",
                width: 6.0,
                height: 0.1,
                color: "#222222",
                shape: "rect",
                description: "Pendrillons occultants 6m"
            },
            {
                id: "jupe-scene",
                name: "Jupe de scène",
                width: 4.0,
                height: 0.08,
                color: "#111111",
                shape: "rect",
                description: "Jupe / frise de scène 4m"
            }
        ]
    },
    logistics: {
        name: "Logistique & Sanitaire",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>`,
        items: [
            {
                id: "tent-3x3",
                name: "Tente / Barnum 3×3",
                width: 3.0,
                height: 3.0,
                color: "#DDDDDD",
                shape: "tent",
                description: "Tente pliante barnum 3×3m"
            },
            {
                id: "tent-6x3",
                name: "Tente 6×3",
                width: 6.0,
                height: 3.0,
                color: "#DDDDDD",
                shape: "tent",
                description: "Tente structure 6×3m"
            },
            {
                id: "tent-12x6",
                name: "Chapiteau 12×6",
                width: 12.0,
                height: 6.0,
                color: "#CCCCCC",
                shape: "tent",
                description: "Chapiteau structure 12×6m"
            },
            {
                id: "mobile-toilet",
                name: "Toilette mobile",
                width: 1.2,
                height: 1.2,
                color: "#3388AA",
                shape: "rect",
                description: "Cabine sanitaire mobile"
            },
            {
                id: "toilet-block-4",
                name: "Bloc 4 sanitaires",
                width: 5.0,
                height: 1.5,
                color: "#3388AA",
                shape: "rect",
                description: "Bloc de 4 cabines sanitaires"
            },
            {
                id: "pmr-toilet",
                name: "Sanitaire PMR",
                width: 1.8,
                height: 1.8,
                color: "#3388AA",
                shape: "rect",
                description: "Cabine sanitaire PMR"
            },
            {
                id: "trash-bin",
                name: "Poubelle",
                width: 0.4,
                height: 0.4,
                color: "#556633",
                shape: "circle",
                description: "Poubelle / tri sélectif"
            },
            {
                id: "trash-container",
                name: "Benne déchets",
                width: 2.5,
                height: 1.5,
                color: "#445522",
                shape: "rect",
                description: "Benne à déchets"
            },
            {
                id: "water-point",
                name: "Point d'eau",
                width: 0.6,
                height: 0.6,
                color: "#2299DD",
                shape: "circle",
                description: "Fontaine / point d'eau"
            },
            {
                id: "food-truck",
                name: "Food truck",
                width: 6.0,
                height: 2.5,
                color: "#CC8844",
                shape: "vehicle",
                description: "Emplacement food truck"
            },
            {
                id: "catering-zone",
                name: "Zone traiteur",
                width: 5.0,
                height: 4.0,
                color: "#CC884430",
                shape: "carpet",
                description: "Zone traiteur / cuisine 5×4m"
            },
            {
                id: "storage",
                name: "Stockage / Vestiaire",
                width: 3.0,
                height: 2.0,
                color: "#777788",
                shape: "rect",
                description: "Zone stockage ou vestiaire"
            }
        ]
    },
    characters: {
        name: "Personnages & PNJ",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
        items: [
            {
                id: "pnj-visitor",
                name: "Visiteur / Public",
                width: 0.5,
                height: 0.5,
                color: "#3366AA",
                shape: "person",
                description: "Personnage debout (échelle 1.75m)"
            },
            {
                id: "pnj-security",
                name: "Agent de sécurité",
                width: 0.5,
                height: 0.5,
                color: "#D4E600",
                shape: "person",
                description: "Agent de sécurité avec gilet fluo"
            },
            {
                id: "pnj-tech",
                name: "Technicien régie",
                width: 0.5,
                height: 0.5,
                color: "#222222",
                shape: "person",
                description: "Technicien du spectacle en noir"
            },
            {
                id: "pnj-speaker",
                name: "Présentateur scène",
                width: 0.5,
                height: 0.5,
                color: "#993333",
                shape: "person",
                description: "Animateur / Présentateur sur scène avec micro"
            },
            {
                id: "pnj-seated",
                name: "Personne assise",
                width: 0.45,
                height: 0.45,
                color: "#448866",
                shape: "person",
                description: "Personnage assis pour chaise ou gradin"
            }
        ]
    }
};

/**
 * Renders a furniture item preview on a small canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} item - furniture item definition
 * @param {number} size - canvas size in pixels
 */
function renderFurniturePreview(ctx, item, size) {
    const padding = 6;
    const drawSize = size - padding * 2;
    const scale = Math.min(drawSize / item.width, drawSize / item.height) * 0.85;
    const w = item.width * scale;
    const h = item.height * scale;
    const cx = size / 2;
    const cy = size / 2;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(cx, cy);

    const fillColor = item.color;
    const strokeColor = adjustBrightness(fillColor, -30);

    switch (item.shape) {
        case "rect":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h);
            ctx.fill();
            ctx.stroke();
            break;

        case "rect-rounded":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.5;
            roundedRect(ctx, -w / 2, -h / 2, w, h, Math.min(w, h) * 0.2);
            ctx.fill();
            ctx.stroke();
            break;

        case "circle":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;

        case "chair":
            // Seat
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.5;
            roundedRect(ctx, -w / 2, -h / 2 + h * 0.15, w, h * 0.85, 3);
            ctx.fill();
            ctx.stroke();
            // Backrest
            ctx.fillStyle = adjustBrightness(fillColor, -20);
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h * 0.2);
            ctx.fill();
            ctx.stroke();
            break;

        case "stand":
            // Floor area
            ctx.fillStyle = fillColor + "40";
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h);
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);
            // Back wall
            ctx.fillStyle = fillColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h * 0.1);
            ctx.fill();
            ctx.stroke();
            // Side walls
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w * 0.05, h);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.rect(w / 2 - w * 0.05, -h / 2, w * 0.05, h);
            ctx.fill();
            ctx.stroke();
            break;

        case "L-shape":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-w / 2, -h / 2);
            ctx.lineTo(w / 2, -h / 2);
            ctx.lineTo(w / 2, -h / 2 + h * 0.35);
            ctx.lineTo(-w / 2 + w * 0.35, -h / 2 + h * 0.35);
            ctx.lineTo(-w / 2 + w * 0.35, h / 2);
            ctx.lineTo(-w / 2, h / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

        case "trapezoid":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-w * 0.3, -h / 2);
            ctx.lineTo(w * 0.3, -h / 2);
            ctx.lineTo(w / 2, h / 2);
            ctx.lineTo(-w / 2, h / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

        case "arc":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(0, h * 0.1, w / 2, h / 2, 0, Math.PI, 0);
            ctx.lineTo(w / 2, h / 2);
            ctx.lineTo(-w / 2, h / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

        case "carpet":
            ctx.fillStyle = fillColor + "60";
            ctx.strokeStyle = fillColor;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 2]);
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h);
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);
            break;

        case "carpet-circle":
            ctx.fillStyle = fillColor + "60";
            ctx.strokeStyle = fillColor;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 2]);
            ctx.beginPath();
            ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);
            break;

        case "barrier":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h);
            ctx.fill();
            ctx.stroke();
            // Cross-hatch pattern (Vauban style)
            ctx.strokeStyle = adjustBrightness(fillColor, -40);
            ctx.lineWidth = 0.8;
            const step = Math.max(3, h * 0.6);
            for (let i = -w / 2; i < w / 2; i += step) {
                ctx.beginPath();
                ctx.moveTo(i, -h / 2);
                ctx.lineTo(i + h, h / 2);
                ctx.stroke();
            }
            // End circles (feet)
            ctx.fillStyle = adjustBrightness(fillColor, -20);
            ctx.beginPath(); ctx.arc(-w / 2, 0, h * 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(w / 2, 0, h * 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            break;

        case "fence":
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.5;
            ctx.fillStyle = fillColor + '30';
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h);
            ctx.fill();
            ctx.stroke();
            // Mesh pattern
            ctx.strokeStyle = fillColor;
            ctx.lineWidth = 0.5;
            const fstep = Math.max(2, w * 0.08);
            for (let i = -w / 2; i <= w / 2; i += fstep) {
                ctx.beginPath(); ctx.moveTo(i, -h / 2); ctx.lineTo(i, h / 2); ctx.stroke();
            }
            break;


        case "backdrop":
            // Vertical drape representation
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h);
            ctx.fill();
            ctx.stroke();
            // Top rail
            ctx.fillStyle = adjustBrightness(fillColor, 30);
            ctx.fillRect(-w / 2 - 1, -h / 2 - 2, w + 2, 3);
            // Wave pattern
            ctx.strokeStyle = adjustBrightness(fillColor, 20) + '60';
            ctx.lineWidth = 0.5;
            for (let i = -w / 2 + 3; i < w / 2; i += 5) {
                ctx.beginPath();
                ctx.moveTo(i, -h / 2);
                ctx.lineTo(i, h / 2);
                ctx.stroke();
            }
            break;


        case "tent":
            // Tent footprint with roof indication
            ctx.fillStyle = fillColor + '40';
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h);
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);
            // Roof cross
            ctx.strokeStyle = fillColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2, h / 2);
            ctx.moveTo(w / 2, -h / 2); ctx.lineTo(-w / 2, h / 2);
            ctx.stroke();
            // Corner posts
            ctx.fillStyle = '#888888';
            const ps = Math.max(1.5, Math.min(w, h) * 0.06);
            ctx.fillRect(-w / 2 - ps/2, -h / 2 - ps/2, ps, ps);
            ctx.fillRect(w / 2 - ps/2, -h / 2 - ps/2, ps, ps);
            ctx.fillRect(-w / 2 - ps/2, h / 2 - ps/2, ps, ps);
            ctx.fillRect(w / 2 - ps/2, h / 2 - ps/2, ps, ps);
            break;

        case "vehicle":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.5;
            roundedRect(ctx, -w / 2, -h / 2, w, h, Math.min(w, h) * 0.15);
            ctx.fill();
            ctx.stroke();
            // Windshield
            ctx.fillStyle = adjustBrightness(fillColor, -30);
            roundedRect(ctx, w / 2 - w * 0.2, -h / 2 + h * 0.15, w * 0.15, h * 0.7, 2);
            ctx.fill();
            // Arrow direction
            ctx.fillStyle = adjustBrightness(fillColor, -20);
            ctx.beginPath();
            ctx.moveTo(w / 2 - w * 0.1, 0);
            ctx.lineTo(w / 2 - w * 0.2, -h * 0.2);
            ctx.lineTo(w / 2 - w * 0.2, h * 0.2);
            ctx.closePath();
            ctx.fill();
            break;

        case "cone":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, -h / 2);
            ctx.lineTo(w / 2, h / 2);
            ctx.lineTo(-w / 2, h / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Stripe
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.moveTo(-w * 0.15, h * 0.1);
            ctx.lineTo(w * 0.15, h * 0.1);
            ctx.lineTo(w * 0.25, h * 0.3);
            ctx.lineTo(-w * 0.25, h * 0.3);
            ctx.closePath();
            ctx.fill();
            break;

        case "barrier-belt":
            // Poles with sangle line
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.5;
            // Belt line
            ctx.strokeStyle = fillColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-w / 2, 0);
            ctx.lineTo(w / 2, 0);
            ctx.stroke();
            // Poles
            const poleCount = Math.max(2, Math.ceil(w / 8) + 1);
            const poleSpacing = w / (poleCount - 1);
            ctx.fillStyle = fillColor;
            for (let i = 0; i < poleCount; i++) {
                const px = -w / 2 + i * poleSpacing;
                ctx.beginPath();
                ctx.arc(px, 0, h * 0.35, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
            break;


        case "person":
            // Head
            ctx.fillStyle = adjustBrightness(fillColor, 20);
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(0, -h * 0.15, Math.min(w, h) * 0.28, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Shoulders/Torso
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.ellipse(0, h * 0.15, w * 0.45, h * 0.28, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;

        case "computer":
            if (item.id && item.id.includes('pc-gamer')) {
                // Gamer Tower PC (Top-down view)
                ctx.fillStyle = '#14161c';
                ctx.strokeStyle = '#00e5ff';
                ctx.lineWidth = 1.5;
                roundedRect(ctx, -w / 2, -h / 2, w, h, 2);
                ctx.fill();
                ctx.stroke();

                // Glass side panel
                ctx.strokeStyle = '#ff007f';
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(-w / 2, h / 2);
                ctx.lineTo(w / 2, h / 2);
                ctx.stroke();

                // 2 RGB intake fan dots
                [-w * 0.25, w * 0.25].forEach((fx, idx) => {
                    ctx.fillStyle = idx === 0 ? '#00ffff' : '#ff007f';
                    ctx.beginPath();
                    ctx.arc(fx, -h * 0.2, Math.min(w, h) * 0.22, 0, Math.PI * 2);
                    ctx.fill();
                });
            } else if (item.id && item.id.includes('setup-gamer')) {
                // Curved monitor
                ctx.strokeStyle = '#00e5ff';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(0, -h * 0.1, w * 0.38, -Math.PI * 0.75, -Math.PI * 0.25);
                ctx.stroke();

                // Keyboard
                ctx.fillStyle = '#1e232e';
                ctx.fillRect(-w * 0.25, h * 0.15, w * 0.5, h * 0.3);

                // Gamer Tower on side
                ctx.fillStyle = '#0f1117';
                ctx.strokeStyle = '#ff007f';
                ctx.lineWidth = 1.2;
                ctx.fillRect(w * 0.32, -h * 0.4, w * 0.16, h * 0.8);
                ctx.strokeRect(w * 0.32, -h * 0.4, w * 0.16, h * 0.8);
            } else {
                // Base / Keyboard
                ctx.fillStyle = fillColor;
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 1.2;
                roundedRect(ctx, -w / 2, -h / 2 + h * 0.2, w, h * 0.8, 2);
                ctx.fill();
                ctx.stroke();
                // Screen
                ctx.fillStyle = '#223344';
                ctx.fillRect(-w * 0.4, -h / 2, w * 0.8, h * 0.35);
            }
            break;

        case "tv-switch": {
            // Stand / Lower shelf
            ctx.fillStyle = '#1c2027';
            ctx.strokeStyle = '#384152';
            ctx.lineWidth = 1.2;
            roundedRect(ctx, -w / 2, -h / 2, w, h, 3);
            ctx.fill();
            ctx.stroke();

            // Lower shelf inner accent line
            ctx.strokeStyle = '#2b3342';
            ctx.lineWidth = 0.8;
            roundedRect(ctx, -w * 0.45, -h * 0.42, w * 0.9, h * 0.84, 2);
            ctx.stroke();

            // TV Base stand
            ctx.fillStyle = '#475569';
            ctx.fillRect(-w * 0.14, -h * 0.25 - 2, w * 0.28, 4);

            // TV Screen Frame
            const tvW = w * 0.84;
            const tvY = -h * 0.25;
            ctx.fillStyle = '#0f1115';
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1;
            roundedRect(ctx, -tvW / 2, tvY - 2, tvW, 4, 1);
            ctx.fill();
            ctx.stroke();

            // Screen front luminous glow
            ctx.strokeStyle = '#00c3e3';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-tvW / 2 + 1, tvY + 2);
            ctx.lineTo(tvW / 2 - 1, tvY + 2);
            ctx.stroke();

            // Switch Console
            const swW = w * 0.22;
            const swH = h * 0.32;
            const swX = -w * 0.22;
            const swY = h * 0.16;
            // Screen
            ctx.fillStyle = '#0c0e12';
            ctx.fillRect(swX - swW * 0.26, swY - swH / 2, swW * 0.52, swH);
            // Left Joy-Con (Neon Blue)
            ctx.fillStyle = '#00c3e3';
            roundedRect(ctx, swX - swW / 2, swY - swH / 2, swW * 0.24, swH, 1.5);
            ctx.fill();
            // Right Joy-Con (Neon Red)
            ctx.fillStyle = '#ff3c28';
            roundedRect(ctx, swX + swW * 0.26, swY - swH / 2, swW * 0.24, swH, 1.5);
            ctx.fill();

            // 2 Controllers
            [-w * 0.02, w * 0.22].forEach(cx => {
                const cW = w * 0.16;
                const cH = h * 0.30;
                ctx.fillStyle = '#222630';
                ctx.strokeStyle = '#3d4758';
                ctx.lineWidth = 0.8;
                roundedRect(ctx, cx - cW / 2, swY - cH / 2, cW, cH, 2);
                ctx.fill();
                ctx.stroke();
                // Sticks/Buttons
                ctx.fillStyle = '#00c3e3';
                ctx.fillRect(cx - cW * 0.3, swY - cH * 0.2, 2, 2);
                ctx.fillStyle = '#ff3c28';
                ctx.fillRect(cx + cW * 0.2, swY + cH * 0.1, 2, 2);
            });
            break;
        }

        case "spotlight": {
            // Fixture Body
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(0, 0, Math.min(w, h) * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Light beam projection
            ctx.fillStyle = 'rgba(255, 220, 50, 0.35)';
            ctx.beginPath();
            const itemId = (item.id || '').toLowerCase();
            const itemName = (item.name || '').toLowerCase();
            const invertBeam = itemId.includes('par-stand') || itemId.includes('par') || itemName.includes('par') ||
                               itemId.includes('followspot') || itemId.includes('poursuite') || itemName.includes('poursuite');
            if (invertBeam) {
                ctx.moveTo(0, 0);
                ctx.lineTo(-w / 2, h / 2);
                ctx.lineTo(w / 2, h / 2);
            } else {
                ctx.moveTo(0, 0);
                ctx.lineTo(-w / 2, -h / 2);
                ctx.lineTo(w / 2, -h / 2);
            }
            ctx.closePath();
            ctx.fill();
            break;
        }

        default:
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h);
            ctx.fill();
            ctx.stroke();
    }

    ctx.restore();
}

/**
 * Renders a furniture item on the main canvas at scene scale
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Object} element - placed element with position, dimensions, rotation
 * @param {number} ppm - pixels per meter
 * @param {boolean} selected
 * @param {boolean} showDimensions
 */
function renderFurnitureOnCanvas(ctx, element, ppm, selected, showDimensions) {
    const w = element.width * ppm;
    const h = element.height * ppm;
    const x = element.x * ppm;
    const y = element.y * ppm;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate((element.rotation || 0) * Math.PI / 180);
    ctx.globalAlpha = element.opacity !== undefined ? element.opacity : 1;

    const fillColor = element.color;
    const strokeColor = selected ? 'var(--accent)' : adjustBrightness(fillColor, -30);
    const lineWidth = selected ? 2 : 1;

    switch (element.shape) {
        case "rect":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h);
            ctx.fill();
            ctx.stroke();
            break;

        case "rect-rounded": {
            const r = Math.min(w, h) * 0.15;
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            roundedRect(ctx, -w / 2, -h / 2, w, h, r);
            ctx.fill();
            ctx.stroke();
            break;
        }

        case "circle":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Draw chairs around round tables
            if (element.seats && element.seats > 0) {
                drawSeatsAroundCircle(ctx, w / 2, h / 2, element.seats, ppm);
            }
            break;


        case "chair":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            roundedRect(ctx, -w / 2, -h / 2 + h * 0.15, w, h * 0.85, 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = adjustBrightness(fillColor, -20);
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h * 0.2);
            ctx.fill();
            ctx.stroke();
            break;

        case "stand":
            ctx.fillStyle = fillColor + "30";
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h);
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);
            // Back wall
            ctx.fillStyle = fillColor;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, Math.max(h * 0.04, 3));
            ctx.fill();
            ctx.stroke();
            // Side walls
            const wallThickness = Math.max(w * 0.03, 2);
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, wallThickness, h);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.rect(w / 2 - wallThickness, -h / 2, wallThickness, h);
            ctx.fill();
            ctx.stroke();
            break;

        case "L-shape":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(-w / 2, -h / 2);
            ctx.lineTo(w / 2, -h / 2);
            ctx.lineTo(w / 2, -h / 2 + h * 0.35);
            ctx.lineTo(-w / 2 + w * 0.35, -h / 2 + h * 0.35);
            ctx.lineTo(-w / 2 + w * 0.35, h / 2);
            ctx.lineTo(-w / 2, h / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

        case "trapezoid":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(-w * 0.3, -h / 2);
            ctx.lineTo(w * 0.3, -h / 2);
            ctx.lineTo(w / 2, h / 2);
            ctx.lineTo(-w / 2, h / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

        case "arc":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.ellipse(0, h * 0.1, w / 2, h / 2, 0, Math.PI, 0);
            ctx.lineTo(w / 2, h / 2);
            ctx.lineTo(-w / 2, h / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

        case "carpet":
            ctx.fillStyle = fillColor + "40";
            ctx.strokeStyle = fillColor + "80";
            ctx.lineWidth = 1;
            ctx.setLineDash([6, 3]);
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h);
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);
            break;

        case "carpet-circle":
            ctx.fillStyle = fillColor + "40";
            ctx.strokeStyle = fillColor + "80";
            ctx.lineWidth = 1;
            ctx.setLineDash([6, 3]);
            ctx.beginPath();
            ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);
            break;

        case "barrier":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h);
            ctx.fill();
            ctx.stroke();
            // Cross-hatch pattern (Vauban)
            ctx.strokeStyle = adjustBrightness(fillColor, -40);
            ctx.lineWidth = 1;
            const bStep = Math.max(4, h * 0.8);
            for (let i = -w / 2; i < w / 2; i += bStep) {
                ctx.beginPath();
                ctx.moveTo(i, -h / 2);
                ctx.lineTo(i + h, h / 2);
                ctx.stroke();
            }
            // End circles (feet)
            ctx.fillStyle = adjustBrightness(fillColor, -20);
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.beginPath(); ctx.arc(-w / 2, 0, h * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(w / 2, 0, h * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            break;

        case "fence":
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.fillStyle = fillColor + '20';
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h);
            ctx.fill();
            ctx.stroke();
            // Mesh vertical lines
            ctx.strokeStyle = fillColor + '80';
            ctx.lineWidth = 0.5;
            const fenceStep = Math.max(3, w * 0.03);
            for (let i = -w / 2; i <= w / 2; i += fenceStep) {
                ctx.beginPath(); ctx.moveTo(i, -h / 2); ctx.lineTo(i, h / 2); ctx.stroke();
            }
            // End posts
            ctx.fillStyle = '#666666';
            ctx.fillRect(-w / 2 - 2, -h / 2 - 2, 4, h + 4);
            ctx.fillRect(w / 2 - 2, -h / 2 - 2, 4, h + 4);
            break;

        case "backdrop":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = selected ? '#6c8cff' : strokeColor;
            ctx.lineWidth = lineWidth + 1;
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h);
            ctx.fill();
            ctx.stroke();
            // Top rail / pipe
            ctx.fillStyle = '#888888';
            ctx.fillRect(-w / 2 - 3, -h / 2 - 3, w + 6, 4);
            // Drape folds
            ctx.strokeStyle = adjustBrightness(fillColor, 20) + '40';
            ctx.lineWidth = 0.8;
            const drapeStep = Math.max(5, w * 0.04);
            for (let i = -w / 2 + drapeStep; i < w / 2; i += drapeStep) {
                ctx.beginPath();
                ctx.moveTo(i, -h / 2);
                ctx.lineTo(i, h / 2);
                ctx.stroke();
            }
            break;


        case "tent":
            ctx.fillStyle = fillColor + '25';
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1;
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h);
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);
            // Roof diagonals
            ctx.strokeStyle = fillColor + '60';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2, h / 2);
            ctx.moveTo(w / 2, -h / 2); ctx.lineTo(-w / 2, h / 2);
            ctx.stroke();
            // Corner posts
            ctx.fillStyle = '#777777';
            const postSize = Math.max(3, Math.min(w, h) * 0.03);
            ctx.fillRect(-w / 2 - postSize/2, -h / 2 - postSize/2, postSize, postSize);
            ctx.fillRect(w / 2 - postSize/2, -h / 2 - postSize/2, postSize, postSize);
            ctx.fillRect(-w / 2 - postSize/2, h / 2 - postSize/2, postSize, postSize);
            ctx.fillRect(w / 2 - postSize/2, h / 2 - postSize/2, postSize, postSize);
            // Center mark
            ctx.fillStyle = fillColor + '40';
            ctx.beginPath();
            ctx.arc(0, 0, Math.min(w, h) * 0.06, 0, Math.PI * 2);
            ctx.fill();
            break;

        case "vehicle":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            const vr = Math.min(w, h) * 0.12;
            roundedRect(ctx, -w / 2, -h / 2, w, h, vr);
            ctx.fill();
            ctx.stroke();
            // Windshield
            ctx.fillStyle = adjustBrightness(fillColor, -30) + '80';
            roundedRect(ctx, w / 2 - w * 0.18, -h / 2 + h * 0.15, w * 0.12, h * 0.7, 2);
            ctx.fill();
            // Wheels
            ctx.fillStyle = '#333333';
            const wheelW = Math.max(3, w * 0.05);
            const wheelH = Math.max(4, h * 0.18);
            ctx.fillRect(-w / 2 + w * 0.12, -h / 2 - wheelH * 0.3, wheelW, wheelH);
            ctx.fillRect(-w / 2 + w * 0.12, h / 2 - wheelH * 0.7, wheelW, wheelH);
            ctx.fillRect(w / 2 - w * 0.25, -h / 2 - wheelH * 0.3, wheelW, wheelH);
            ctx.fillRect(w / 2 - w * 0.25, h / 2 - wheelH * 0.7, wheelW, wheelH);
            break;

        case "cone":
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(0, -h / 2);
            ctx.lineTo(w / 2, h / 2);
            ctx.lineTo(-w / 2, h / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // White reflective stripe
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.moveTo(-w * 0.15, h * 0.1);
            ctx.lineTo(w * 0.15, h * 0.1);
            ctx.lineTo(w * 0.25, h * 0.3);
            ctx.lineTo(-w * 0.25, h * 0.3);
            ctx.closePath();
            ctx.fill();
            break;

        case "barrier-belt":
            // Belt / sangle line
            ctx.strokeStyle = fillColor;
            ctx.lineWidth = Math.max(2, h * 0.3);
            ctx.beginPath();
            ctx.moveTo(-w / 2, 0);
            ctx.lineTo(w / 2, 0);
            ctx.stroke();
            // Poles
            const beltPoleCount = Math.max(2, Math.ceil(w / (1.5 * ppm)) + 1);
            const beltSpacing = w / (beltPoleCount - 1);
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = adjustBrightness(fillColor, -30);
            ctx.lineWidth = lineWidth;
            for (let i = 0; i < beltPoleCount; i++) {
                const bpx = -w / 2 + i * beltSpacing;
                ctx.beginPath();
                ctx.arc(bpx, 0, Math.max(3, h * 0.6), 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
            break;


        case "person":
            // Head
            ctx.fillStyle = adjustBrightness(fillColor, 20);
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.arc(0, -h * 0.15, Math.min(w, h) * 0.28, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Torso / Shoulders
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.ellipse(0, h * 0.15, w * 0.45, h * 0.28, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;

        case "computer":
            if (element.id && element.id.includes('pc-gamer')) {
                // Gamer Tower PC (Top-down view)
                ctx.fillStyle = '#14161c';
                ctx.strokeStyle = '#00e5ff';
                ctx.lineWidth = lineWidth + 0.5;
                roundedRect(ctx, -w / 2, -h / 2, w, h, 3);
                ctx.fill();
                ctx.stroke();

                // Glass side panel
                ctx.strokeStyle = '#ff007f';
                ctx.lineWidth = lineWidth + 1;
                ctx.beginPath();
                ctx.moveTo(-w / 2, h / 2);
                ctx.lineTo(w / 2, h / 2);
                ctx.stroke();

                // 2 RGB intake fan circles
                [-w * 0.25, w * 0.25].forEach((fx, idx) => {
                    ctx.fillStyle = idx === 0 ? '#00ffff' : '#ff007f';
                    ctx.beginPath();
                    ctx.arc(fx, -h * 0.2, Math.min(w, h) * 0.22, 0, Math.PI * 2);
                    ctx.fill();
                });
            } else if (element.id && element.id.includes('setup-gamer')) {
                // Curved monitor
                ctx.strokeStyle = '#00e5ff';
                ctx.lineWidth = lineWidth + 2;
                ctx.beginPath();
                ctx.arc(0, -h * 0.1, w * 0.38, -Math.PI * 0.75, -Math.PI * 0.25);
                ctx.stroke();

                // Keyboard
                ctx.fillStyle = '#1e232e';
                ctx.fillRect(-w * 0.25, h * 0.15, w * 0.5, h * 0.3);

                // Gamer Tower on side
                ctx.fillStyle = '#0f1117';
                ctx.strokeStyle = '#ff007f';
                ctx.lineWidth = lineWidth;
                ctx.fillRect(w * 0.32, -h * 0.4, w * 0.16, h * 0.8);
                ctx.strokeRect(w * 0.32, -h * 0.4, w * 0.16, h * 0.8);
            } else {
                // Keyboard / Base
                ctx.fillStyle = fillColor;
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = lineWidth;
                roundedRect(ctx, -w / 2, -h / 2 + h * 0.2, w, h * 0.8, 3);
                ctx.fill();
                ctx.stroke();
                // Screen
                ctx.fillStyle = '#253545';
                ctx.fillRect(-w * 0.4, -h / 2, w * 0.8, h * 0.35);
            }
            break;

        case "tv-switch": {
            // Stand / Lower shelf
            ctx.fillStyle = '#1c2027';
            ctx.strokeStyle = '#384152';
            ctx.lineWidth = lineWidth + 0.5;
            roundedRect(ctx, -w / 2, -h / 2, w, h, 4);
            ctx.fill();
            ctx.stroke();

            // Lower shelf inner accent line & support legs
            ctx.strokeStyle = '#2b3342';
            ctx.lineWidth = 1;
            roundedRect(ctx, -w * 0.46, -h * 0.42, w * 0.92, h * 0.84, 3);
            ctx.stroke();

            // 4 corner post markers
            const legR = Math.max(2, w * 0.015);
            ctx.fillStyle = '#111317';
            [-w * 0.45, w * 0.45].forEach(lx => {
                [-h * 0.42, h * 0.42].forEach(ly => {
                    ctx.beginPath();
                    ctx.arc(lx, ly, legR, 0, Math.PI * 2);
                    ctx.fill();
                });
            });

            // TV Base stand
            ctx.fillStyle = '#475569';
            ctx.fillRect(-w * 0.16, -h * 0.22 - 3, w * 0.32, 6);

            // TV Screen Frame (Thick chassis)
            const tvW = w * 0.85;
            const tvY = -h * 0.22;
            const tvThick = Math.max(4, h * 0.08);
            ctx.fillStyle = '#0f1115';
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1.2;
            roundedRect(ctx, -tvW / 2, tvY - tvThick / 2, tvW, tvThick, 2);
            ctx.fill();
            ctx.stroke();

            // TV Luminous display edge
            ctx.strokeStyle = '#00c3e3';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-tvW / 2 + 2, tvY + tvThick / 2);
            ctx.lineTo(tvW / 2 - 2, tvY + tvThick / 2);
            ctx.stroke();

            // Nintendo Switch Console & Dock (Left side)
            const swW = w * 0.22;
            const swH = h * 0.32;
            const swX = -w * 0.22;
            const swY = h * 0.16;

            // Dock body
            ctx.fillStyle = '#14171d';
            ctx.strokeStyle = '#2d3340';
            ctx.lineWidth = 1;
            roundedRect(ctx, swX - swW / 2, swY - swH / 2, swW, swH, 3);
            ctx.fill();
            ctx.stroke();

            // Central tablet screen
            ctx.fillStyle = '#08090c';
            ctx.fillRect(swX - swW * 0.26, swY - swH * 0.45, swW * 0.52, swH * 0.9);

            // Left Joy-Con (Neon Blue)
            ctx.fillStyle = '#00c3e3';
            roundedRect(ctx, swX - swW / 2, swY - swH * 0.45, swW * 0.24, swH * 0.9, 2);
            ctx.fill();
            // Left Stick
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(swX - swW * 0.38, swY - swH * 0.14, Math.max(1.5, swW * 0.04), 0, Math.PI * 2);
            ctx.fill();

            // Right Joy-Con (Neon Red)
            ctx.fillStyle = '#ff3c28';
            roundedRect(ctx, swX + swW * 0.26, swY - swH * 0.45, swW * 0.24, swH * 0.9, 2);
            ctx.fill();
            // Right Buttons
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(swX + swW * 0.38, swY + swH * 0.14, Math.max(1.5, swW * 0.04), 0, Math.PI * 2);
            ctx.fill();

            // 2 Gamepad Controllers (Switch Pro Controllers)
            [w * 0.06, w * 0.26].forEach((cx, idx) => {
                const cW = w * 0.16;
                const cH = h * 0.30;

                ctx.save();
                ctx.translate(cx, swY);
                // Slight natural tilt
                ctx.rotate((idx === 0 ? -0.08 : 0.08));

                // Controller shell
                ctx.fillStyle = '#20242e';
                ctx.strokeStyle = '#3d4758';
                ctx.lineWidth = 1;
                roundedRect(ctx, -cW / 2, -cH / 2, cW, cH, 4);
                ctx.fill();
                ctx.stroke();

                // Grips (Handles on sides)
                ctx.fillStyle = '#171920';
                roundedRect(ctx, -cW / 2, 0, cW * 0.28, cH / 2, 2);
                ctx.fill();
                roundedRect(ctx, cW / 2 - cW * 0.28, 0, cW * 0.28, cH / 2, 2);
                ctx.fill();

                // D-Pad on left
                ctx.fillStyle = '#556075';
                ctx.fillRect(-cW * 0.28, -cH * 0.12, cW * 0.14, cH * 0.24);
                ctx.fillRect(-cW * 0.33, -cH * 0.07, cW * 0.24, cH * 0.14);

                // ABXY Buttons on right
                ctx.fillStyle = '#00c3e3';
                ctx.fillRect(cW * 0.20, -cH * 0.25, 2, 2);
                ctx.fillStyle = '#ff3c28';
                ctx.fillRect(cW * 0.20, cH * 0.05, 2, 2);
                ctx.fillStyle = '#ffbe3b';
                ctx.fillRect(cW * 0.12, -cH * 0.10, 2, 2);
                ctx.fillStyle = '#00e676';
                ctx.fillRect(cW * 0.28, -cH * 0.10, 2, 2);

                // Asymmetric Sticks
                ctx.fillStyle = '#0d0f13';
                ctx.beginPath();
                ctx.arc(-cW * 0.22, -cH * 0.22, Math.max(1.5, cW * 0.08), 0, Math.PI * 2);
                ctx.arc(cW * 0.12, cH * 0.15, Math.max(1.5, cW * 0.08), 0, Math.PI * 2);
                ctx.fill();

                // Center Home / Capture buttons
                ctx.fillStyle = '#44ee77';
                ctx.fillRect(-1, cH * 0.25, 2, 2);

                ctx.restore();
            });
            break;
        }

        case "spotlight": {
            // Projector Base
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.arc(0, 0, Math.min(w, h) * 0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Light Cone
            ctx.fillStyle = 'rgba(255, 220, 50, 0.3)';
            ctx.beginPath();
            const elId = (element.id || '').toLowerCase();
            const elName = (element.name || '').toLowerCase();
            const invertBeam = elId.includes('par-stand') || elId.includes('par') || elName.includes('par') ||
                               elId.includes('followspot') || elId.includes('poursuite') || elName.includes('poursuite');
            if (invertBeam) {
                ctx.moveTo(0, 0);
                ctx.lineTo(-w / 2, h / 2);
                ctx.lineTo(w / 2, h / 2);
            } else {
                ctx.moveTo(0, 0);
                ctx.lineTo(-w / 2, -h / 2);
                ctx.lineTo(w / 2, -h / 2);
            }
            ctx.closePath();
            ctx.fill();
            break;
        }

        default:
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h);
            ctx.fill();
            ctx.stroke();
    }

    // Draw seats around rectangular tables
    if (element.shape === "rect" && element.seats && element.seats > 0) {
        drawSeatsAroundRect(ctx, w, h, element.seats, ppm);
    }

    // Draw label
    ctx.globalAlpha = 1;
    const fontSize = Math.max(10, Math.min(14, w * 0.12));
    ctx.font = `500 ${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = getContrastColor(fillColor);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = element.name || element.id;
    if (w > 30 && h > 20) {
        ctx.fillText(label, 0, 0, w - 8);
    }

    // Draw dimension annotations
    if (showDimensions && (selected || element.shape === 'stand')) {
        drawDimensionAnnotations(ctx, w, h, element.width, element.height);
    }

    ctx.restore();

    // Draw selection handles
    if (selected) {
        drawSelectionHandles(ctx, x, y, w, h, element.rotation || 0);
    }
}

function drawSeatsAroundCircle(ctx, rx, ry, count, ppm) {
    const chairSize = 0.22 * ppm;
    const gap = 0.08 * ppm;
    const radius = Math.max(rx, ry) + chairSize / 2 + gap;

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const sx = Math.cos(angle) * radius;
        const sy = Math.sin(angle) * radius;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillStyle = '#5D7A99';
        ctx.strokeStyle = '#4A6580';
        ctx.lineWidth = 1;
        roundedRect(ctx, -chairSize / 2, -chairSize / 2, chairSize, chairSize, 3);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

function drawSeatsAroundRect(ctx, w, h, count, ppm) {
    const chairSize = 0.22 * ppm;
    const gap = 0.06 * ppm;

    // Distribute chairs: long sides get more
    const longSide = Math.max(w, h);
    const shortSide = Math.min(w, h);
    const longCount = Math.ceil(count * 0.35);
    const shortCount = Math.floor((count - longCount * 2) / 2);

    // Top side
    const topCount = longCount;
    for (let i = 0; i < topCount; i++) {
        const sx = -w / 2 + (i + 0.5) * (w / topCount);
        const sy = -h / 2 - chairSize / 2 - gap;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.fillStyle = '#5D7A9980';
        ctx.strokeStyle = '#4A658080';
        ctx.lineWidth = 1;
        roundedRect(ctx, -chairSize / 2, -chairSize / 2, chairSize, chairSize, 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    // Bottom side
    const bottomCount = longCount;
    for (let i = 0; i < bottomCount; i++) {
        const sx = -w / 2 + (i + 0.5) * (w / bottomCount);
        const sy = h / 2 + chairSize / 2 + gap;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.fillStyle = '#5D7A9980';
        ctx.strokeStyle = '#4A658080';
        ctx.lineWidth = 1;
        roundedRect(ctx, -chairSize / 2, -chairSize / 2, chairSize, chairSize, 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    // Left side
    if (shortCount > 0) {
        for (let i = 0; i < shortCount; i++) {
            const sx = -w / 2 - chairSize / 2 - gap;
            const sy = -h / 2 + (i + 0.5) * (h / shortCount);
            ctx.save();
            ctx.translate(sx, sy);
            ctx.fillStyle = '#5D7A9980';
            ctx.strokeStyle = '#4A658080';
            ctx.lineWidth = 1;
            roundedRect(ctx, -chairSize / 2, -chairSize / 2, chairSize, chairSize, 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }

    // Right side
    if (shortCount > 0) {
        for (let i = 0; i < shortCount; i++) {
            const sx = w / 2 + chairSize / 2 + gap;
            const sy = -h / 2 + (i + 0.5) * (h / shortCount);
            ctx.save();
            ctx.translate(sx, sy);
            ctx.fillStyle = '#5D7A9980';
            ctx.strokeStyle = '#4A658080';
            ctx.lineWidth = 1;
            roundedRect(ctx, -chairSize / 2, -chairSize / 2, chairSize, chairSize, 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }
}

function drawDimensionAnnotations(ctx, w, h, widthM, heightM) {
    ctx.save();
    ctx.setLineDash([]);
    const offset = 16;

    // Horizontal dimension
    ctx.strokeStyle = '#6c8cff88';
    ctx.fillStyle = '#6c8cff';
    ctx.lineWidth = 1;
    ctx.font = '500 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    // Top line
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2 - offset);
    ctx.lineTo(w / 2, -h / 2 - offset);
    ctx.stroke();
    // End caps
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2 - offset - 4);
    ctx.lineTo(-w / 2, -h / 2 - offset + 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w / 2, -h / 2 - offset - 4);
    ctx.lineTo(w / 2, -h / 2 - offset + 4);
    ctx.stroke();
    // Label
    ctx.fillText(`${widthM.toFixed(2)}m`, 0, -h / 2 - offset - 4);

    // Vertical dimension
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.beginPath();
    ctx.moveTo(w / 2 + offset, -h / 2);
    ctx.lineTo(w / 2 + offset, h / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w / 2 + offset - 4, -h / 2);
    ctx.lineTo(w / 2 + offset + 4, -h / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w / 2 + offset - 4, h / 2);
    ctx.lineTo(w / 2 + offset + 4, h / 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(w / 2 + offset + 6, 0);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${heightM.toFixed(2)}m`, 0, -2);
    ctx.restore();

    ctx.restore();
}

function drawSelectionHandles(ctx, x, y, w, h, rotation) {
    const handles = [
        { x: x, y: y },                     // top-left
        { x: x + w, y: y },                 // top-right
        { x: x + w, y: y + h },             // bottom-right
        { x: x, y: y + h },                 // bottom-left
        { x: x + w / 2, y: y },             // top-center
        { x: x + w, y: y + h / 2 },         // right-center
        { x: x + w / 2, y: y + h },         // bottom-center
        { x: x, y: y + h / 2 }              // left-center
    ];

    const centerX = x + w / 2;
    const centerY = y + h / 2;
    const rad = rotation * Math.PI / 180;

    ctx.save();
    // Draw selection border
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rad);
    ctx.strokeStyle = '#6c8cff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4);
    ctx.setLineDash([]);
    ctx.restore();

    // Draw handles
    handles.forEach(handle => {
        // Rotate handle around center
        const dx = handle.x - centerX;
        const dy = handle.y - centerY;
        const rx = dx * Math.cos(rad) - dy * Math.sin(rad) + centerX;
        const ry = dx * Math.sin(rad) + dy * Math.cos(rad) + centerY;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#6c8cff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(rx - 4, ry - 4, 8, 8);
        ctx.fill();
        ctx.stroke();
    });

    // Rotation handle
    const rotHandleY = y - 24;
    const rdx = x + w / 2 - centerX;
    const rdy = rotHandleY - centerY;
    const rrx = rdx * Math.cos(rad) - rdy * Math.sin(rad) + centerX;
    const rry = rdx * Math.sin(rad) + rdy * Math.cos(rad) + centerY;

    // Line to rotation handle
    const topCenterDx = 0;
    const topCenterDy = -h / 2 - 2;
    const tcx = topCenterDx * Math.cos(rad) - topCenterDy * Math.sin(rad) + centerX;
    const tcy = topCenterDx * Math.sin(rad) + topCenterDy * Math.cos(rad) + centerY;

    ctx.strokeStyle = '#6c8cff88';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tcx, tcy);
    ctx.lineTo(rrx, rry);
    ctx.stroke();

    ctx.fillStyle = '#6c8cff';
    ctx.beginPath();
    ctx.arc(rrx, rry, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
}

/* ---------- Utility Functions ---------- */

function roundedRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function adjustBrightness(hex, amount) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    // Handle hex with alpha
    const baseHex = hex.substring(0, 6);
    let r = parseInt(baseHex.substring(0, 2), 16);
    let g = parseInt(baseHex.substring(2, 4), 16);
    let b = parseInt(baseHex.substring(4, 6), 16);
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getContrastColor(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const baseHex = hex.substring(0, 6);
    const r = parseInt(baseHex.substring(0, 2), 16);
    const g = parseInt(baseHex.substring(2, 4), 16);
    const b = parseInt(baseHex.substring(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.5 ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)';
}

// Automatically ensure every furniture item knows its parent category
Object.entries(FURNITURE_LIBRARY).forEach(([catKey, category]) => {
    if (category && category.items) {
        category.items.forEach(item => {
            item.category = catKey;
        });
    }
});
