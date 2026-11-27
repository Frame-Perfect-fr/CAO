/* ================================================================
   ScenoPlan — Default Scenography Demo Scene
   ================================================================ */

export function loadDefaultDemoScene(engine) {
    if (engine.elements.length > 0) return;

    engine.addElement({
        id: 'stage-large',
        name: 'Scène Principale (8×5m)',
        category: 'scene',
        shape: 'stage',
        width: 8.0,
        height: 5.0,
        color: '#2a2d36',
        description: 'Scène modulaire praticable'
    }, 11.0, 2.5);

    engine.addElement({
        id: 'podium',
        name: 'Pupitre orateur',
        category: 'scene',
        shape: 'rect',
        width: 0.8,
        height: 0.6,
        color: '#475569'
    }, 13.5, 4.0);

    engine.addElement({
        id: 'pnj-speaker',
        name: 'Orateur / Présentateur',
        category: 'characters',
        shape: 'person',
        width: 0.5,
        height: 0.5,
        color: '#ef4444'
    }, 14.5, 4.0);

    engine.addElement({
        id: 'lyre-beam-1',
        name: 'Lyre Beam Gauche',
        category: 'tech',
        shape: 'spotlight',
        width: 0.5,
        height: 0.5,
        color: '#00e5ff'
    }, 10.5, 3.0);

    engine.addElement({
        id: 'lyre-beam-2',
        name: 'Lyre Beam Droite',
        category: 'tech',
        shape: 'spotlight',
        width: 0.5,
        height: 0.5,
        color: '#3b82f6'
    }, 18.5, 3.0);

    engine.addElement({
        id: 'par-stand-1',
        name: 'PAR 64 Face',
        category: 'tech',
        shape: 'spotlight',
        width: 0.6,
        height: 0.6,
        color: '#ffbe3b'
    }, 12.0, 7.5);

    engine.addElement({
        id: 'table-rect-6p',
        name: 'Table VIP 1',
        category: 'tables',
        shape: 'rect',
        width: 2.2,
        height: 1.0,
        color: '#8b7355'
    }, 11.0, 10.5);

    engine.addElement({
        id: 'laptop-vip',
        name: 'PC Portable VIP',
        category: 'tech',
        shape: 'computer',
        width: 0.45,
        height: 0.35,
        color: '#475569'
    }, 11.8, 10.8);

    engine.addElement({
        id: 'table-rect-8p',
        name: 'Table Presse & Media',
        category: 'tables',
        shape: 'rect',
        width: 2.6,
        height: 1.0,
        color: '#705843'
    }, 16.0, 10.5);

    engine.addElement({
        id: 'pc-gamer',
        name: 'Tour PC Gamer RGB',
        category: 'tech',
        shape: 'computer',
        width: 0.5,
        height: 0.3,
        color: '#181c24'
    }, 16.8, 10.8);

    engine.addElement({
        id: 'table-cocktail',
        name: 'Mange-debout Accueil',
        category: 'tables',
        shape: 'circle',
        width: 0.8,
        height: 0.8,
        color: '#d5cbbe'
    }, 8.0, 10.5);

    engine.addElement({
        id: 'tv-stand-switch',
        name: 'TV avec Switch & 2 manettes',
        category: 'tech',
        shape: 'tv-switch',
        width: 1.4,
        height: 0.55,
        color: '#1e222b'
    }, 6.5, 7.5);

    engine.addElement({
        id: 'desk-regie',
        name: 'Régie Technique Audio/Lumière',
        category: 'production',
        shape: 'rect',
        width: 3.0,
        height: 1.2,
        color: '#1f232b'
    }, 13.5, 14.5);

    engine.addElement({
        id: 'laptop',
        name: 'PC Portable Console Lumière',
        category: 'tech',
        shape: 'computer',
        width: 0.5,
        height: 0.4,
        color: '#334155'
    }, 13.8, 14.7);

    engine.addElement({
        id: 'desktop-pc',
        name: 'Station PC Régie Vidéo',
        category: 'tech',
        shape: 'computer',
        width: 0.8,
        height: 0.6,
        color: '#1e293b'
    }, 15.2, 14.7);

    engine.addElement({
        id: 'pnj-tech',
        name: 'Ingénieur Son & Lumière',
        category: 'characters',
        shape: 'person',
        width: 0.5,
        height: 0.5,
        color: '#1e293b'
    }, 14.5, 15.5);

    engine.addElement({
        id: 'pnj-security',
        name: 'Agent de Sécurité',
        category: 'characters',
        shape: 'person',
        width: 0.5,
        height: 0.5,
        color: '#d4e600'
    }, 6.5, 13.0);

    engine.addElement({
        id: 'barriere-vauban',
        name: 'Barrière Vauban Entrée',
        category: 'security',
        shape: 'barrier',
        width: 2.5,
        height: 0.5,
        color: '#a0aec0'
    }, 5.5, 14.0);

    engine.addElement({
        id: 'pnj-visitor',
        name: 'Visiteur VIP',
        category: 'characters',
        shape: 'person',
        width: 0.5,
        height: 0.5,
        color: '#3b82f6'
    }, 8.0, 11.2);

    engine.render();
}
