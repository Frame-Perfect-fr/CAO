/* ================================================================
   ScenoPlan — Left Sidebar Furniture Library Panel & Canvas Drop
   ================================================================ */

import { FURNITURE_LIBRARY, renderFurniturePreview } from '../catalog/index.js';

export function setupLibraryPanel(engine) {
    const libraryContainer = document.getElementById('library-categories');

    Object.entries(FURNITURE_LIBRARY).forEach(([catKey, category]) => {
        const catDiv = document.createElement('div');
        catDiv.className = 'library-category';
        catDiv.dataset.category = catKey;

        const header = document.createElement('div');
        header.className = 'category-header';
        header.innerHTML = `
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6,9 12,15 18,9"/></svg>
            <span class="category-icon">${category.icon}</span>
            <span>${category.name}</span>
        `;

        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'category-items';

        category.items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'library-item';
            itemEl.dataset.itemId = item.id;
            itemEl.dataset.category = catKey;
            itemEl.title = `${item.description}\n${item.width}m × ${item.height}m`;
            itemEl.draggable = true;

            const previewCanvas = document.createElement('canvas');
            previewCanvas.width = 88;
            previewCanvas.height = 88;
            previewCanvas.style.width = '44px';
            previewCanvas.style.height = '44px';
            const previewCtx = previewCanvas.getContext('2d');
            previewCtx.scale(2, 2);
            renderFurniturePreview(previewCtx, item, 44);

            const previewDiv = document.createElement('div');
            previewDiv.className = 'library-item-preview';
            previewDiv.appendChild(previewCanvas);

            const nameSpan = document.createElement('span');
            nameSpan.className = 'library-item-name';
            nameSpan.textContent = item.name;

            const sizeSpan = document.createElement('span');
            sizeSpan.className = 'library-item-size';
            sizeSpan.textContent = `${item.width}×${item.height}m`;

            itemEl.appendChild(previewDiv);
            itemEl.appendChild(nameSpan);
            itemEl.appendChild(sizeSpan);

            itemEl.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify(item));
                e.dataTransfer.effectAllowed = 'copy';

                const ghost = document.createElement('div');
                ghost.className = 'drag-ghost';
                ghost.style.width = '60px';
                ghost.style.height = '40px';
                ghost.style.position = 'fixed';
                ghost.style.top = '-100px';
                document.body.appendChild(ghost);
                e.dataTransfer.setDragImage(ghost, 30, 20);
                setTimeout(() => ghost.remove(), 0);
            });

            itemEl.addEventListener('click', () => {
                const center = engine.screenToScene(engine.canvas.width / 2, engine.canvas.height / 2);
                engine.addElement(item, center.x, center.y);
            });

            itemsDiv.appendChild(itemEl);
        });

        header.addEventListener('click', () => {
            header.classList.toggle('collapsed');
            itemsDiv.classList.toggle('collapsed');
        });

        catDiv.appendChild(header);
        catDiv.appendChild(itemsDiv);
        libraryContainer.appendChild(catDiv);
    });

    // Canvas Drop Target
    const canvasContainer = document.getElementById('canvas-container');

    canvasContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        try {
            const rect = engine.canvas.getBoundingClientRect();
            const sx = e.clientX - rect.left;
            const sy = e.clientY - rect.top;
            engine.screenToScene(sx, sy);
        } catch (err) { /* ignore */ }
    });

    canvasContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const rect = engine.canvas.getBoundingClientRect();
            const sx = e.clientX - rect.left;
            const sy = e.clientY - rect.top;
            const scene = engine.screenToScene(sx, sy);
            engine.addElement(data, scene.x, scene.y);
        } catch (err) {
            console.error('Drop error:', err);
        }
    });

    canvasContainer.addEventListener('dragleave', () => {
        engine.dropPreview = null;
        engine.render();
    });

    // Library Search
    document.getElementById('library-search').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        document.querySelectorAll('.library-category').forEach(cat => {
            let hasVisibleItems = false;
            cat.querySelectorAll('.library-item').forEach(item => {
                const name = item.querySelector('.library-item-name').textContent.toLowerCase();
                const title = (item.title || '').toLowerCase();
                const visible = !query || name.includes(query) || title.includes(query);
                item.style.display = visible ? '' : 'none';
                if (visible) hasVisibleItems = true;
            });
            cat.style.display = hasVisibleItems || !query ? '' : 'none';
            if (query && hasVisibleItems) {
                cat.querySelector('.category-header').classList.remove('collapsed');
                cat.querySelector('.category-items').classList.remove('collapsed');
            }
        });
    });
}
