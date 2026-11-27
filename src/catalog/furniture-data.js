/* ================================================================
   ScenoPlan — Furniture Catalog Definitions
   ================================================================ */

export const FURNITURE_LIBRARY = {
    tables: {
        name: "Tables",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="1"/><line x1="6" y1="16" x2="6" y2="20"/><line x1="18" y1="16" x2="18" y2="20"/></svg>`,
        items: [
            {
                id: "table-rect-160x60",
                name: "Table 160×60",
                width: 1.6,
                height: 0.6,
                color: "#8B7355",
                shape: "rect",
                seats: 4,
                description: "Table rectangulaire 1.60m × 0.60m (4 personnes)"
            },
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

// Automatically ensure every furniture item knows its parent category
Object.entries(FURNITURE_LIBRARY).forEach(([catKey, category]) => {
    if (category && category.items) {
        category.items.forEach(item => {
            item.category = catKey;
        });
    }
});
