/* ================================================================
   ScenoPlan — Canvas Engine
   Handles canvas rendering, pan/zoom, grid, and element interaction.
   ================================================================ */

class CanvasEngine {
    constructor(canvasId, containerId) {
        this.canvas = document.getElementById(canvasId);
        this.container = document.getElementById(containerId);
        this.ctx = this.canvas.getContext('2d');

        // Scene dimensions in meters
        this.sceneWidth = 30;
        this.sceneHeight = 20;

        // Pixels per meter (scale)
        this.ppm = 50;

        // Viewport (pan)
        this.panX = 0;
        this.panY = 0;

        // Zoom
        this.zoom = 1;
        this.minZoom = 0.1;
        this.maxZoom = 5;

        // Grid
        this.showGrid = true;
        this.snapToGrid = true;
        this.gridSize = 0.5; // meters
        this.showDimensions = true;

        // Elements (placed furniture)
        this.elements = [];
        this.selectedElement = null;
        this.hoveredElement = null;

        // Interaction state
        this.currentTool = 'select';
        this.isDragging = false;
        this.isPanning = false;
        this.isResizing = false;
        this.isRotating = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.resizeHandle = -1;

        // Measure tool
        this.measureStart = null;
        this.measureEnd = null;
        this.isMeasuring = false;

        // Wall tool
        this.wallStart = null;
        this.isDrawingWall = false;

        // Zone tool
        this.zoneStart = null;
        this.isDrawingZone = false;

        // Text tool
        this.isPlacingText = false;

        // Drop target (drag from library)
        this.dropPreview = null;

        // Undo/Redo
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoSteps = 50;

        // Callbacks
        this.onSelectionChange = null;
        this.onElementsChange = null;

        // ID counter
        this._nextId = 1;

        this.init();
    }

    init() {
        this.resizeCanvas();
        this.centerView();

        window.addEventListener('resize', () => this.resizeCanvas());
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
        this.canvas.addEventListener('dblclick', (e) => this.onDblClick(e));

        // Context menu
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.onContextMenu(e);
        });

        this.render();
    }

    resizeCanvas() {
        const rect = this.container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.canvasWidth = rect.width;
        this.canvasHeight = rect.height;
        this.render();
    }

    centerView() {
        const totalW = this.sceneWidth * this.ppm * this.zoom;
        const totalH = this.sceneHeight * this.ppm * this.zoom;
        this.panX = (this.canvasWidth - totalW) / 2;
        this.panY = (this.canvasHeight - totalH) / 2;
    }

    fitView() {
        const padding = 60;
        const scaleX = (this.canvasWidth - padding * 2) / (this.sceneWidth * this.ppm);
        const scaleY = (this.canvasHeight - padding * 2) / (this.sceneHeight * this.ppm);
        this.zoom = Math.min(scaleX, scaleY);
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom));
        this.centerView();
        this.render();
        this.updateZoomDisplay();
    }

    // ─── Coordinate Conversion ─────────────────────────────────────

    /** Screen coordinates to scene coordinates (meters) */
    screenToScene(sx, sy) {
        const px = (sx - this.panX) / (this.zoom * this.ppm);
        const py = (sy - this.panY) / (this.zoom * this.ppm);
        return { x: px, y: py };
    }

    /** Scene coordinates (meters) to screen coordinates */
    sceneToScreen(mx, my) {
        const sx = mx * this.ppm * this.zoom + this.panX;
        const sy = my * this.ppm * this.zoom + this.panY;
        return { x: sx, y: sy };
    }

    /** Snap to grid */
    snapPoint(x, y) {
        if (!this.snapToGrid) return { x, y };
        const gs = this.gridSize;
        return {
            x: Math.round(x / gs) * gs,
            y: Math.round(y / gs) * gs
        };
    }

    // ─── Element Management ────────────────────────────────────────

    addElement(templateItem, x, y) {
        const snapped = this.snapPoint(x, y);
        const element = {
            ...templateItem,
            uid: this._nextId++,
            x: snapped.x - templateItem.width / 2,
            y: snapped.y - templateItem.height / 2,
            rotation: 0,
            opacity: 1,
            locked: false,
            name: templateItem.name
        };

        this.saveUndoState();
        this.elements.push(element);
        this.selectElement(element);
        this.render();
        this.notifyElementsChange();
        return element;
    }

    removeElement(element) {
        if (!element) return;
        this.saveUndoState();
        const idx = this.elements.indexOf(element);
        if (idx >= 0) {
            this.elements.splice(idx, 1);
            if (this.selectedElement === element) {
                this.selectElement(null);
            }
            this.render();
            this.notifyElementsChange();
        }
    }

    duplicateElement(element) {
        if (!element) return;
        this.saveUndoState();
        const dup = { ...element, uid: this._nextId++ };
        dup.x += 0.5;
        dup.y += 0.5;
        this.elements.push(dup);
        this.selectElement(dup);
        this.render();
        this.notifyElementsChange();
        return dup;
    }

    selectElement(element) {
        this.selectedElement = element;
        if (this.onSelectionChange) {
            this.onSelectionChange(element);
        }
        this.render();
    }

    bringToFront(element) {
        if (!element) return;
        const idx = this.elements.indexOf(element);
        if (idx >= 0 && idx < this.elements.length - 1) {
            this.saveUndoState();
            this.elements.splice(idx, 1);
            this.elements.push(element);
            this.render();
            this.notifyElementsChange();
        }
    }

    sendToBack(element) {
        if (!element) return;
        const idx = this.elements.indexOf(element);
        if (idx > 0) {
            this.saveUndoState();
            this.elements.splice(idx, 1);
            this.elements.unshift(element);
            this.render();
            this.notifyElementsChange();
        }
    }

    moveElementLayer(element, delta) {
        if (!element) return;
        const idx = this.elements.indexOf(element);
        if (idx === -1) return;
        const newIdx = idx + delta;
        if (newIdx < 0 || newIdx >= this.elements.length) return;
        this.saveUndoState();
        this.elements.splice(idx, 1);
        this.elements.splice(newIdx, 0, element);
        this.render();
        this.notifyElementsChange();
    }

    setElementHidden(element, hidden) {
        if (!element) return;
        this.saveUndoState();
        element.hidden = !!hidden;
        if (element.hidden && this.selectedElement === element) {
            this.selectElement(null);
        }
        this.render();
        this.notifyElementsChange();
    }

    setElementLocked(element, locked) {
        if (!element) return;
        this.saveUndoState();
        element.locked = !!locked;
        this.render();
        this.notifyElementsChange();
        this.notifySelectionUpdate();
    }

    panToElement(element) {
        if (!element) return;
        const cx = (element.x + element.width / 2) * this.ppm;
        const cy = (element.y + element.height / 2) * this.ppm;
        this.panX = this.canvasWidth / 2 - cx * this.zoom;
        this.panY = this.canvasHeight / 2 - cy * this.zoom;
        this.render();
    }

    updateElement(element, props) {
        if (!element) return;
        this.saveUndoState();
        Object.assign(element, props);
        this.render();
        this.notifyElementsChange();
    }

    // ─── Hit Testing ───────────────────────────────────────────────

    hitTest(sceneX, sceneY) {
        // Iterate in reverse (top-most first)
        for (let i = this.elements.length - 1; i >= 0; i--) {
            const el = this.elements[i];
            if (el.hidden) continue;
            if (this.isPointInElement(sceneX, sceneY, el)) {
                return el;
            }
        }
        return null;
    }

    isPointInElement(px, py, el) {
        // Transform point to element local coords (handle rotation)
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const rad = -(el.rotation || 0) * Math.PI / 180;

        const dx = px - cx;
        const dy = py - cy;
        const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
        const localY = dx * Math.sin(rad) + dy * Math.cos(rad);

        if (el.shape === 'circle' || el.shape === 'carpet-circle') {
            const rx = el.width / 2;
            const ry = el.height / 2;
            return (localX * localX) / (rx * rx) + (localY * localY) / (ry * ry) <= 1;
        }

        return Math.abs(localX) <= el.width / 2 && Math.abs(localY) <= el.height / 2;
    }

    hitTestHandle(screenX, screenY) {
        if (!this.selectedElement) return -1;
        const el = this.selectedElement;
        const w = el.width * this.ppm * this.zoom;
        const h = el.height * this.ppm * this.zoom;
        const pos = this.sceneToScreen(el.x, el.y);
        const x = pos.x;
        const y = pos.y;

        const handles = [
            { x: x, y: y },
            { x: x + w, y: y },
            { x: x + w, y: y + h },
            { x: x, y: y + h },
            { x: x + w / 2, y: y },
            { x: x + w, y: y + h / 2 },
            { x: x + w / 2, y: y + h },
            { x: x, y: y + h / 2 }
        ];

        const centerX = x + w / 2;
        const centerY = y + h / 2;
        const rad = (el.rotation || 0) * Math.PI / 180;

        for (let i = 0; i < handles.length; i++) {
            const dx = handles[i].x - centerX;
            const dy = handles[i].y - centerY;
            const rx = dx * Math.cos(rad) - dy * Math.sin(rad) + centerX;
            const ry = dx * Math.sin(rad) + dy * Math.cos(rad) + centerY;

            if (Math.abs(screenX - rx) <= 6 && Math.abs(screenY - ry) <= 6) {
                return i;
            }
        }

        // Check rotation handle
        const rotY = y - 24 * this.zoom;
        const rdx = x + w / 2 - centerX;
        const rdy = rotY - centerY;
        const rrx = rdx * Math.cos(rad) - rdy * Math.sin(rad) + centerX;
        const rry = rdx * Math.sin(rad) + rdy * Math.cos(rad) + centerY;

        if (Math.sqrt((screenX - rrx) ** 2 + (screenY - rry) ** 2) <= 8) {
            return 99; // rotation handle
        }

        return -1;
    }

    // ─── Mouse Events ──────────────────────────────────────────────

    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const scene = this.screenToScene(sx, sy);

        // Close context menu
        document.getElementById('context-menu').style.display = 'none';

        if (e.button === 1 || (e.button === 0 && (this.currentTool === 'pan' || e.spaceKey))) {
            // Middle click or pan tool: start panning
            this.isPanning = true;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            this.container.classList.add('panning');
            return;
        }

        if (e.button !== 0) return;

        switch (this.currentTool) {
            case 'select':
                // Check resize/rotation handles first
                if (this.selectedElement) {
                    const handle = this.hitTestHandle(sx, sy);
                    if (handle === 99) {
                        this.isRotating = true;
                        this.dragStartX = sx;
                        this.dragStartY = sy;
                        this.saveUndoState();
                        return;
                    } else if (handle >= 0) {
                        this.isResizing = true;
                        this.resizeHandle = handle;
                        this.dragStartX = sx;
                        this.dragStartY = sy;
                        this._resizeOriginal = {
                            x: this.selectedElement.x,
                            y: this.selectedElement.y,
                            width: this.selectedElement.width,
                            height: this.selectedElement.height
                        };
                        this.saveUndoState();
                        return;
                    }
                }

                // Hit test elements
                const hit = this.hitTest(scene.x, scene.y);
                if (hit) {
                    if (hit.locked) {
                        this.selectElement(hit);
                        return;
                    }
                    this.selectElement(hit);
                    this.isDragging = true;
                    this.dragOffsetX = scene.x - hit.x;
                    this.dragOffsetY = scene.y - hit.y;
                    this.saveUndoState();
                } else {
                    this.selectElement(null);
                }
                break;

            case 'measure':
                this.isMeasuring = true;
                this.measureStart = { ...scene };
                this.measureEnd = { ...scene };
                break;

            case 'wall':
                if (!this.isDrawingWall) {
                    const snapped = this.snapPoint(scene.x, scene.y);
                    this.wallStart = snapped;
                    this.isDrawingWall = true;
                }
                break;

            case 'zone':
                if (!this.isDrawingZone) {
                    const snapped = this.snapPoint(scene.x, scene.y);
                    this.zoneStart = snapped;
                    this.isDrawingZone = true;
                }
                break;

            case 'text':
                this.addTextElement(scene.x, scene.y);
                break;
        }
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const scene = this.screenToScene(sx, sy);

        // Update status bar coordinates
        this.updateCoords(scene.x, scene.y);

        if (this.isPanning) {
            const dx = e.clientX - this.dragStartX;
            const dy = e.clientY - this.dragStartY;
            this.panX += dx;
            this.panY += dy;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            this.render();
            return;
        }

        if (this.isRotating && this.selectedElement) {
            const el = this.selectedElement;
            const cx = el.x + el.width / 2;
            const cy = el.y + el.height / 2;
            const centerScreen = this.sceneToScreen(cx, cy);
            const angle = Math.atan2(sy - centerScreen.y, sx - centerScreen.x);
            let deg = angle * 180 / Math.PI + 90;
            if (e.shiftKey) {
                deg = Math.round(deg / 15) * 15;
            }
            if (deg < 0) deg += 360;
            if (deg >= 360) deg -= 360;
            el.rotation = deg;
            this.render();
            this.notifySelectionUpdate();
            return;
        }

        if (this.isResizing && this.selectedElement) {
            this.performResize(sx, sy, e.shiftKey);
            return;
        }

        if (this.isDragging && this.selectedElement) {
            let newX = scene.x - this.dragOffsetX;
            let newY = scene.y - this.dragOffsetY;
            if (this.snapToGrid) {
                const snapped = this.snapPoint(newX, newY);
                newX = snapped.x;
                newY = snapped.y;
            }
            this.selectedElement.x = newX;
            this.selectedElement.y = newY;
            this.render();
            this.notifySelectionUpdate();
            return;
        }

        if (this.isMeasuring) {
            this.measureEnd = { ...scene };
            this.render();
            this.showMeasureTooltip(e.clientX, e.clientY);
            return;
        }

        if (this.isDrawingWall) {
            this.render();
            this.drawWallPreview(scene);
            return;
        }

        if (this.isDrawingZone) {
            this.render();
            this.drawZonePreview(scene);
            return;
        }

        // Drop preview
        if (this.dropPreview) {
            const snapped = this.snapPoint(scene.x, scene.y);
            this.dropPreview.x = snapped.x - this.dropPreview.width / 2;
            this.dropPreview.y = snapped.y - this.dropPreview.height / 2;
            this.render();
            return;
        }

        // Hover state
        if (this.currentTool === 'select') {
            const hovered = this.hitTest(scene.x, scene.y);
            if (hovered !== this.hoveredElement) {
                this.hoveredElement = hovered;
                this.canvas.style.cursor = hovered ? 'move' : 'default';
                this.render();
            }

            // Check handles cursor
            if (this.selectedElement) {
                const handle = this.hitTestHandle(sx, sy);
                if (handle === 99) {
                    this.canvas.style.cursor = 'grab';
                } else if (handle >= 0) {
                    const cursors = ['nw-resize', 'ne-resize', 'se-resize', 'sw-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize'];
                    this.canvas.style.cursor = cursors[handle];
                }
            }
        }
    }

    onMouseUp(e) {
        if (this.isPanning) {
            this.isPanning = false;
            this.container.classList.remove('panning');
            return;
        }

        if (this.isRotating) {
            this.isRotating = false;
            this.notifyElementsChange();
            return;
        }

        if (this.isResizing) {
            this.isResizing = false;
            this.resizeHandle = -1;
            this.notifyElementsChange();
            return;
        }

        if (this.isDragging) {
            this.isDragging = false;
            this.notifyElementsChange();
            return;
        }

        if (this.isMeasuring) {
            this.isMeasuring = false;
            // Keep measurement visible
            setTimeout(() => {
                this.measureStart = null;
                this.measureEnd = null;
                document.getElementById('measure-tooltip').style.display = 'none';
                this.render();
            }, 3000);
            return;
        }

        if (this.isDrawingWall) {
            const rect = this.canvas.getBoundingClientRect();
            const sx = e.clientX - rect.left;
            const sy = e.clientY - rect.top;
            const scene = this.screenToScene(sx, sy);
            const snapped = this.snapPoint(scene.x, scene.y);
            this.finishWall(snapped);
            return;
        }

        if (this.isDrawingZone) {
            const rect = this.canvas.getBoundingClientRect();
            const sx = e.clientX - rect.left;
            const sy = e.clientY - rect.top;
            const scene = this.screenToScene(sx, sy);
            const snapped = this.snapPoint(scene.x, scene.y);
            this.finishZone(snapped);
            return;
        }

        if (this.dropPreview) {
            this.addElement(this.dropPreview, this.dropPreview.x + this.dropPreview.width / 2, this.dropPreview.y + this.dropPreview.height / 2);
            this.dropPreview = null;
            this.render();
        }
    }

    onWheel(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const oldZoom = this.zoom;
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom *= delta;
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom));

        // Zoom towards mouse
        this.panX = mx - (mx - this.panX) * (this.zoom / oldZoom);
        this.panY = my - (my - this.panY) * (this.zoom / oldZoom);

        this.render();
        this.updateZoomDisplay();
    }

    onDblClick(e) {
        // Double click on element to edit name
        const rect = this.canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const scene = this.screenToScene(sx, sy);
        const hit = this.hitTest(scene.x, scene.y);
        if (hit) {
            const newName = prompt('Renommer l\'élément:', hit.name || hit.id);
            if (newName !== null) {
                this.saveUndoState();
                hit.name = newName;
                this.render();
                this.notifySelectionUpdate();
            }
        }
    }

    onContextMenu(e) {
        const rect = this.canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const scene = this.screenToScene(sx, sy);
        const hit = this.hitTest(scene.x, scene.y);

        if (hit) {
            this.selectElement(hit);
            const menu = document.getElementById('context-menu');
            menu.style.display = 'block';
            menu.style.left = e.clientX + 'px';
            menu.style.top = e.clientY + 'px';

            // Update lock button text
            const lockBtn = menu.querySelector('[data-action="lock"]');
            lockBtn.textContent = hit.locked ? 'Déverrouiller' : 'Verrouiller';
        }
    }

    // ─── Resize ────────────────────────────────────────────────────

    performResize(sx, sy, proportional) {
        const el = this.selectedElement;
        if (!el || !this._resizeOriginal) return;

        const scene = this.screenToScene(sx, sy);
        const snapped = this.snapPoint(scene.x, scene.y);
        const orig = this._resizeOriginal;
        const handle = this.resizeHandle;

        let newX = orig.x, newY = orig.y, newW = orig.width, newH = orig.height;

        // Handle-based resize
        switch (handle) {
            case 0: // top-left
                newW = orig.x + orig.width - snapped.x;
                newH = orig.y + orig.height - snapped.y;
                newX = snapped.x;
                newY = snapped.y;
                break;
            case 1: // top-right
                newW = snapped.x - orig.x;
                newH = orig.y + orig.height - snapped.y;
                newY = snapped.y;
                break;
            case 2: // bottom-right
                newW = snapped.x - orig.x;
                newH = snapped.y - orig.y;
                break;
            case 3: // bottom-left
                newW = orig.x + orig.width - snapped.x;
                newH = snapped.y - orig.y;
                newX = snapped.x;
                break;
            case 4: // top-center
                newH = orig.y + orig.height - snapped.y;
                newY = snapped.y;
                break;
            case 5: // right-center
                newW = snapped.x - orig.x;
                break;
            case 6: // bottom-center
                newH = snapped.y - orig.y;
                break;
            case 7: // left-center
                newW = orig.x + orig.width - snapped.x;
                newX = snapped.x;
                break;
        }

        // Minimum size
        if (newW < 0.1) { newW = 0.1; if (handle === 0 || handle === 3 || handle === 7) newX = orig.x + orig.width - 0.1; }
        if (newH < 0.1) { newH = 0.1; if (handle === 0 || handle === 1 || handle === 4) newY = orig.y + orig.height - 0.1; }

        // Proportional resize
        if (proportional) {
            const ratio = orig.width / orig.height;
            if (handle <= 3) {
                newH = newW / ratio;
            }
        }

        el.x = newX;
        el.y = newY;
        el.width = newW;
        el.height = newH;

        this.render();
        this.notifySelectionUpdate();
    }

    // ─── Wall & Zone Tools ─────────────────────────────────────────

    drawWallPreview(scenePos) {
        const snapped = this.snapPoint(scenePos.x, scenePos.y);
        const start = this.sceneToScreen(this.wallStart.x, this.wallStart.y);
        const end = this.sceneToScreen(snapped.x, snapped.y);

        this.ctx.save();
        this.ctx.strokeStyle = '#6c8cff';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([8, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Length label
        const dist = Math.sqrt((snapped.x - this.wallStart.x) ** 2 + (snapped.y - this.wallStart.y) ** 2);
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        this.ctx.fillStyle = '#6c8cff';
        this.ctx.font = '600 12px "JetBrains Mono", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${dist.toFixed(2)}m`, midX, midY - 10);

        this.ctx.restore();
    }

    finishWall(endPoint) {
        const dx = endPoint.x - this.wallStart.x;
        const dy = endPoint.y - this.wallStart.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length < 0.1) {
            this.isDrawingWall = false;
            this.wallStart = null;
            return;
        }

        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const midX = (this.wallStart.x + endPoint.x) / 2;
        const midY = (this.wallStart.y + endPoint.y) / 2;
        const wallElement = {
            id: 'wall',
            isWall: true,
            category: 'walls',
            name: `Mur ${length.toFixed(1)}m`,
            width: length,
            height: 0.12,
            color: '#9A9AAA',
            shape: 'rect',
            x: midX - length / 2,
            y: midY - 0.06,
            rotation: angle,
            opacity: 1,
            locked: false,
            uid: this._nextId++
        };

        this.saveUndoState();
        this.elements.push(wallElement);
        this.selectElement(wallElement);
        this.isDrawingWall = false;
        this.wallStart = null;
        this.render();
        this.notifyElementsChange();
    }

    drawZonePreview(scenePos) {
        const snapped = this.snapPoint(scenePos.x, scenePos.y);
        const start = this.sceneToScreen(this.zoneStart.x, this.zoneStart.y);
        const end = this.sceneToScreen(snapped.x, snapped.y);

        const x = Math.min(start.x, end.x);
        const y = Math.min(start.y, end.y);
        const w = Math.abs(end.x - start.x);
        const h = Math.abs(end.y - start.y);

        this.ctx.save();
        this.ctx.fillStyle = 'rgba(108, 140, 255, 0.08)';
        this.ctx.strokeStyle = '#6c8cff';
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([6, 4]);
        this.ctx.fillRect(x, y, w, h);
        this.ctx.strokeRect(x, y, w, h);
        this.ctx.setLineDash([]);

        // Dimensions
        const zoneW = Math.abs(snapped.x - this.zoneStart.x);
        const zoneH = Math.abs(snapped.y - this.zoneStart.y);
        this.ctx.fillStyle = '#6c8cff';
        this.ctx.font = '600 12px "JetBrains Mono", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${zoneW.toFixed(2)} × ${zoneH.toFixed(2)}m = ${(zoneW * zoneH).toFixed(1)}m²`, x + w / 2, y + h / 2);

        this.ctx.restore();
    }

    finishZone(endPoint) {
        const x = Math.min(this.zoneStart.x, endPoint.x);
        const y = Math.min(this.zoneStart.y, endPoint.y);
        const w = Math.abs(endPoint.x - this.zoneStart.x);
        const h = Math.abs(endPoint.y - this.zoneStart.y);

        if (w < 0.2 || h < 0.2) {
            this.isDrawingZone = false;
            this.zoneStart = null;
            return;
        }

        const zoneElement = {
            id: 'zone',
            isZone: true,
            category: 'zone',
            name: `Zone ${(w * h).toFixed(0)}m²`,
            width: w,
            height: h,
            color: '#6c8cff',
            shape: 'carpet',
            x: x,
            y: y,
            rotation: 0,
            opacity: 0.15,
            locked: false,
            uid: this._nextId++
        };

        this.saveUndoState();
        this.elements.unshift(zoneElement); // Add behind
        this.selectElement(zoneElement);
        this.isDrawingZone = false;
        this.zoneStart = null;
        this.render();
        this.notifyElementsChange();
    }

    addTextElement(x, y) {
        const text = prompt('Texte à ajouter:');
        if (!text) return;

        const textElement = {
            id: 'text',
            name: text,
            width: Math.max(1, text.length * 0.15),
            height: 0.4,
            color: '#CCCCCC',
            shape: 'text',
            x: x - 0.5,
            y: y - 0.2,
            rotation: 0,
            opacity: 1,
            locked: false,
            uid: this._nextId++,
            textContent: text
        };

        this.saveUndoState();
        this.elements.push(textElement);
        this.selectElement(textElement);
        this.render();
        this.notifyElementsChange();
    }

    /**
     * Générateur automatique de rangées de chaises (Parterre / Conférence)
     * Normes de sécurité ERP, allée centrale de circulation et numérotation.
     */
    generateChairBlock(options = {}) {
        const rows = Math.max(1, parseInt(options.rows, 10) || 8);
        const seatsPerRow = Math.max(1, parseInt(options.seatsPerRow, 10) || 12);
        const gapX = options.gapX !== undefined ? parseFloat(options.gapX) : 0.08; // 8cm entre chaises
        const rowSpacing = options.rowSpacing !== undefined ? parseFloat(options.rowSpacing) : 0.95; // 95cm entre rangées
        const hasAisle = options.hasAisle !== false;
        const aisleWidth = hasAisle ? (options.aisleWidth !== undefined ? parseFloat(options.aisleWidth) : 1.40) : 0; // 1.40m = 2 UP ERP
        const numberSeats = options.numberSeats !== false;
        const color = options.color || '#4A607A';
        const rotation = options.rotation !== undefined ? parseInt(options.rotation, 10) : 180; // 180° = face à la scène en haut

        const chairW = 0.45;
        const chairH = 0.45;

        // Calcul des blocs et dimensions
        const half1 = hasAisle ? Math.ceil(seatsPerRow / 2) : seatsPerRow;
        const half2 = hasAisle ? (seatsPerRow - half1) : 0;
        
        let totalW = seatsPerRow * chairW + (seatsPerRow - 1) * gapX;
        if (hasAisle && seatsPerRow > 1) {
            totalW += aisleWidth;
        }
        const totalH = (rows - 1) * rowSpacing + chairH;

        // Position d'ancrage (centre de la vue ou coordonnées spécifiées)
        let cx = options.originX;
        let cy = options.originY;
        if (cx === undefined || cy === undefined) {
            const center = this.screenToScene(this.canvas.width / 2, this.canvas.height / 2);
            cx = center.x;
            cy = center.y;
        }

        const startX = cx - totalW / 2;
        const startY = cy - totalH / 2;

        const newChairs = [];

        // Helper pour lettrage de rangée (A..Z, AA..ZZ)
        const getRowLetter = (idx) => {
            if (idx < 26) return String.fromCharCode(65 + idx);
            const first = String.fromCharCode(65 + Math.floor(idx / 26) - 1);
            const second = String.fromCharCode(65 + (idx % 26));
            return first + second;
        };

        for (let r = 0; r < rows; r++) {
            const rowLetter = getRowLetter(r);
            const rowY = startY + r * rowSpacing;

            for (let s = 0; s < seatsPerRow; s++) {
                let seatX = startX + s * (chairW + gapX);
                if (hasAisle && s >= half1) {
                    seatX += aisleWidth;
                }

                const seatNum = s + 1;
                const chairName = numberSeats ? `${rowLetter}-${seatNum}` : 'Chaise';

                const chairElement = {
                    id: 'chair',
                    name: chairName,
                    category: 'chairs',
                    shape: 'chair',
                    width: chairW,
                    height: chairH,
                    x: seatX,
                    y: rowY,
                    rotation: rotation,
                    color: color,
                    opacity: 1,
                    locked: false,
                    uid: this._nextId++,
                    row: rowLetter,
                    seatIndex: seatNum
                };

                newChairs.push(chairElement);
            }
        }

        // Enregistre 1 seul état d'Undo pour tout le parterre
        this.saveUndoState();

        // Ajoute toutes les chaises au plan
        this.elements.push(...newChairs);

        this.selectElement(newChairs[0] || null);
        this.render();
        this.notifyElementsChange();

        return {
            totalChairs: newChairs.length,
            rows,
            seatsPerRow,
            totalWidth: totalW,
            totalHeight: totalH,
            elements: newChairs
        };
    }

    // ─── Undo / Redo ───────────────────────────────────────────────

    saveUndoState() {
        const state = JSON.stringify(this.elements.map(el => ({ ...el })));
        this.undoStack.push(state);
        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length === 0) return;
        const currentState = JSON.stringify(this.elements.map(el => ({ ...el })));
        this.redoStack.push(currentState);
        const prevState = JSON.parse(this.undoStack.pop());
        this.elements = prevState;
        this._nextId = Math.max(...this.elements.map(el => el.uid), 0) + 1;
        this.selectElement(null);
        this.render();
        this.notifyElementsChange();
    }

    redo() {
        if (this.redoStack.length === 0) return;
        const currentState = JSON.stringify(this.elements.map(el => ({ ...el })));
        this.undoStack.push(currentState);
        const nextState = JSON.parse(this.redoStack.pop());
        this.elements = nextState;
        this._nextId = Math.max(...this.elements.map(el => el.uid), 0) + 1;
        this.selectElement(null);
        this.render();
        this.notifyElementsChange();
    }

    // ─── Rendering ─────────────────────────────────────────────────

    render() {
        const ctx = this.ctx;
        const w = this.canvasWidth;
        const h = this.canvasHeight;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Get theme colors from CSS
        const style = getComputedStyle(document.body);
        const canvasBg = style.getPropertyValue('--canvas-bg').trim();
        const sceneBg = style.getPropertyValue('--scene-bg').trim();
        const sceneBorder = style.getPropertyValue('--scene-border').trim();
        const gridLine = style.getPropertyValue('--grid-line').trim();
        const gridLineMajor = style.getPropertyValue('--grid-line-major').trim();

        // Background
        ctx.fillStyle = canvasBg;
        ctx.fillRect(0, 0, w, h);

        ctx.save();

        // Scene area
        const sceneScreenX = this.panX;
        const sceneScreenY = this.panY;
        const sceneScreenW = this.sceneWidth * this.ppm * this.zoom;
        const sceneScreenH = this.sceneHeight * this.ppm * this.zoom;

        // Scene shadow
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = sceneBg;
        ctx.fillRect(sceneScreenX, sceneScreenY, sceneScreenW, sceneScreenH);
        ctx.shadowColor = 'transparent';

        // Scene border
        ctx.strokeStyle = sceneBorder;
        ctx.lineWidth = 1;
        ctx.strokeRect(sceneScreenX, sceneScreenY, sceneScreenW, sceneScreenH);

        // Clip to scene
        ctx.save();
        ctx.beginPath();
        ctx.rect(sceneScreenX, sceneScreenY, sceneScreenW, sceneScreenH);
        ctx.clip();

        // Grid
        if (this.showGrid) {
            this.renderGrid(ctx, sceneScreenX, sceneScreenY, sceneScreenW, sceneScreenH, gridLine, gridLineMajor);
        }

        // Elements
        ctx.save();
        ctx.translate(this.panX, this.panY);
        ctx.scale(this.zoom, this.zoom);

        for (const element of this.elements) {
            if (element.hidden) continue;
            const isSelected = element === this.selectedElement;
            renderFurnitureOnCanvas(ctx, element, this.ppm, isSelected, this.showDimensions);

            // Hover highlight
            if (element === this.hoveredElement && !isSelected) {
                const ew = element.width * this.ppm;
                const eh = element.height * this.ppm;
                const ex = element.x * this.ppm;
                const ey = element.y * this.ppm;
                ctx.save();
                ctx.translate(ex + ew / 2, ey + eh / 2);
                ctx.rotate((element.rotation || 0) * Math.PI / 180);
                ctx.strokeStyle = 'rgba(108, 140, 255, 0.4)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 4]);
                ctx.strokeRect(-ew / 2 - 2, -eh / 2 - 2, ew + 4, eh + 4);
                ctx.setLineDash([]);
                ctx.restore();
            }

            // Text elements
            if (element.shape === 'text') {
                ctx.save();
                const ex = element.x * this.ppm;
                const ey = element.y * this.ppm;
                const ew = element.width * this.ppm;
                const eh = element.height * this.ppm;
                ctx.translate(ex + ew / 2, ey + eh / 2);
                ctx.rotate((element.rotation || 0) * Math.PI / 180);
                ctx.globalAlpha = element.opacity;
                ctx.fillStyle = element.color;
                ctx.font = `600 ${Math.max(12, eh * 0.7)}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(element.textContent || element.name, 0, 0);
                ctx.restore();
            }
        }

        // Drop preview
        if (this.dropPreview) {
            ctx.save();
            ctx.globalAlpha = 0.5;
            renderFurnitureOnCanvas(ctx, this.dropPreview, this.ppm, false, false);
            ctx.restore();
        }

        ctx.restore();

        // Measurement line
        if (this.measureStart && this.measureEnd) {
            this.renderMeasurement(ctx);
        }

        ctx.restore(); // clip
        ctx.restore(); // save
    }

    renderGrid(ctx, sx, sy, sw, sh, lineColor, majorColor) {
        const gridPx = this.gridSize * this.ppm * this.zoom;

        // Don't draw grid if too small
        if (gridPx < 4) return;

        ctx.save();

        // Minor grid lines
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 0.5;
        ctx.beginPath();

        for (let x = sx; x <= sx + sw; x += gridPx) {
            ctx.moveTo(Math.round(x) + 0.5, sy);
            ctx.lineTo(Math.round(x) + 0.5, sy + sh);
        }
        for (let y = sy; y <= sy + sh; y += gridPx) {
            ctx.moveTo(sx, Math.round(y) + 0.5);
            ctx.lineTo(sx + sw, Math.round(y) + 0.5);
        }
        ctx.stroke();

        // Major grid lines (every 5 grid units)
        const majorGridPx = gridPx * (this.gridSize < 1 ? Math.round(1 / this.gridSize) : 5);
        if (majorGridPx > gridPx) {
            ctx.strokeStyle = majorColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let x = sx; x <= sx + sw; x += majorGridPx) {
                ctx.moveTo(Math.round(x) + 0.5, sy);
                ctx.lineTo(Math.round(x) + 0.5, sy + sh);
            }
            for (let y = sy; y <= sy + sh; y += majorGridPx) {
                ctx.moveTo(sx, Math.round(y) + 0.5);
                ctx.lineTo(sx + sw, Math.round(y) + 0.5);
            }
            ctx.stroke();
        }

        // Ruler labels
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted').trim();
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        const labelStep = Math.max(1, Math.ceil(40 / gridPx) * this.gridSize);
        const labelStepPx = labelStep * this.ppm * this.zoom;

        // Top ruler
        for (let i = 0, x = sx; x <= sx + sw; i += labelStep, x += labelStepPx) {
            if (x > sx + 10) {
                ctx.fillText(`${i}`, x, sy - 4);
            }
        }

        // Left ruler
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0, y = sy; y <= sy + sh; i += labelStep, y += labelStepPx) {
            if (y > sy + 10) {
                ctx.fillText(`${i}`, sx - 6, y);
            }
        }

        ctx.restore();
    }

    renderMeasurement(ctx) {
        if (!this.measureStart || !this.measureEnd) return;

        const start = this.sceneToScreen(this.measureStart.x, this.measureStart.y);
        const end = this.sceneToScreen(this.measureEnd.x, this.measureEnd.y);

        ctx.save();
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Endpoints
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(start.x, start.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(end.x, end.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    showMeasureTooltip(cx, cy) {
        if (!this.measureStart || !this.measureEnd) return;
        const dx = this.measureEnd.x - this.measureStart.x;
        const dy = this.measureEnd.y - this.measureStart.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const tooltip = document.getElementById('measure-tooltip');
        tooltip.style.display = 'block';
        tooltip.style.left = (cx + 16) + 'px';
        tooltip.style.top = (cy - 16) + 'px';
        tooltip.textContent = `${dist.toFixed(2)} m`;
    }

    // ─── Helpers ───────────────────────────────────────────────────

    updateCoords(x, y) {
        const el = document.getElementById('status-coords');
        if (el) {
            el.textContent = `X: ${x.toFixed(2)}m — Y: ${y.toFixed(2)}m`;
        }
    }

    updateZoomDisplay() {
        const el = document.getElementById('zoom-level');
        if (el) {
            el.textContent = `${Math.round(this.zoom * 100)}%`;
        }
    }

    notifySelectionUpdate() {
        if (this.onSelectionChange && this.selectedElement) {
            this.onSelectionChange(this.selectedElement);
        }
    }

    notifyElementsChange() {
        if (this.onElementsChange) {
            this.onElementsChange(this.elements);
        }
    }

    setTool(toolName) {
        this.currentTool = toolName;

        // Reset states
        this.isMeasuring = false;
        this.isDrawingWall = false;
        this.isDrawingZone = false;
        this.measureStart = null;
        this.measureEnd = null;
        this.wallStart = null;
        this.zoneStart = null;

        document.getElementById('measure-tooltip').style.display = 'none';

        // Update container class
        this.container.className = '';
        if (toolName !== 'select') {
            this.container.classList.add('tool-' + toolName);
        }

        // Update toolbar
        document.querySelectorAll('.canvas-tool[data-tool]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === toolName);
        });

        this.render();
    }

    setZoom(newZoom) {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        const oldZoom = this.zoom;
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
        this.panX = centerX - (centerX - this.panX) * (this.zoom / oldZoom);
        this.panY = centerY - (centerY - this.panY) * (this.zoom / oldZoom);
        this.render();
        this.updateZoomDisplay();
    }

    // ─── Export ─────────────────────────────────────────────────────

    exportPNG() {
        // Create a temporary high-res canvas
        const dpr = 2;
        const tempCanvas = document.createElement('canvas');
        const padding = 40;
        const w = this.sceneWidth * this.ppm * dpr + padding * 2;
        const h = this.sceneHeight * this.ppm * dpr + padding * 2;
        tempCanvas.width = w;
        tempCanvas.height = h;
        const ctx = tempCanvas.getContext('2d');

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);

        // Scene border
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 2;
        ctx.strokeRect(padding, padding, w - padding * 2, h - padding * 2);

        // Grid
        const gridPx = this.gridSize * this.ppm * dpr;
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let x = padding; x <= w - padding; x += gridPx) {
            ctx.moveTo(x, padding);
            ctx.lineTo(x, h - padding);
        }
        for (let y = padding; y <= h - padding; y += gridPx) {
            ctx.moveTo(padding, y);
            ctx.lineTo(w - padding, y);
        }
        ctx.stroke();

        // Elements
        ctx.save();
        ctx.translate(padding, padding);
        ctx.scale(dpr, dpr);
        for (const element of this.elements) {
            if (element.hidden) continue;
            renderFurnitureOnCanvas(ctx, element, this.ppm, false, true);
        }
        ctx.restore();

        // Title
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(document.getElementById('project-name').value, padding, padding - 12);

        // Scale info
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#888888';
        ctx.textAlign = 'right';
        ctx.fillText(`Échelle: 1px = ${(1/this.ppm).toFixed(3)}m | Grille: ${this.gridSize}m`, w - padding, padding - 12);

        // Download
        const link = document.createElement('a');
        link.download = `${document.getElementById('project-name').value.replace(/\s+/g, '_')}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }

    exportPDF() {
        // Simple PDF export using print
        // For a proper PDF we'd need jsPDF, but let's keep it dependency-free
        const tempCanvas = document.createElement('canvas');
        const dpr = 2;
        const padding = 40;
        const w = this.sceneWidth * this.ppm * dpr + padding * 2;
        const h = this.sceneHeight * this.ppm * dpr + padding * 2;
        tempCanvas.width = w;
        tempCanvas.height = h;
        const ctx = tempCanvas.getContext('2d');

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 2;
        ctx.strokeRect(padding, padding, w - padding * 2, h - padding * 2);

        const gridPx = this.gridSize * this.ppm * dpr;
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let x = padding; x <= w - padding; x += gridPx) {
            ctx.moveTo(x, padding);
            ctx.lineTo(x, h - padding);
        }
        for (let y = padding; y <= h - padding; y += gridPx) {
            ctx.moveTo(padding, y);
            ctx.lineTo(w - padding, y);
        }
        ctx.stroke();

        ctx.save();
        ctx.translate(padding, padding);
        ctx.scale(dpr, dpr);
        for (const element of this.elements) {
            if (element.hidden) continue;
            renderFurnitureOnCanvas(ctx, element, this.ppm, false, true);
        }
        ctx.restore();

        ctx.fillStyle = '#333333';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(document.getElementById('project-name').value, padding, padding - 12);

        // Open in new window for printing
        const imgData = tempCanvas.toDataURL('image/png');
        const printWin = window.open('', '_blank');
        printWin.document.write(`
            <html>
            <head><title>${document.getElementById('project-name').value} - ScenoPlan</title>
            <style>
                @page { size: landscape; margin: 1cm; }
                body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                img { max-width: 100%; max-height: 100vh; }
            </style>
            </head>
            <body><img src="${imgData}" onload="window.print()"></body>
            </html>
        `);
    }

    // ─── Nomenclature Matériel (BOM) & Fiches Prestataires ─────────

    getBOMInventory() {
        const inventory = {};
        let totalItems = 0;
        let totalSeats = 0;
        let totalLinear = 0;
        let totalOccupiedArea = 0;

        for (const el of this.elements) {
            if (el.hidden) continue;
            totalItems++;

            // Calcul places assises
            if (el.shape === 'chair' || el.category === 'chairs' || (el.id && el.id.startsWith('chair'))) {
                totalSeats++;
            } else if (el.seats && typeof el.seats === 'number') {
                totalSeats += el.seats;
            }

            // Calcul linéaire pour murs, barrières Vauban, Heras
            const isLinear = el.isWall || el.shape === 'barrier' || el.shape === 'fence' || (el.id && (el.id.includes('barrier') || el.id.includes('vauban') || el.id.includes('heras') || el.id.includes('wall')));
            const length = Math.max(el.width || 0, el.height || 0);
            if (isLinear) {
                totalLinear += length;
            }

            // Surface occupée
            const area = (el.width || 0) * (el.height || 0);
            totalOccupiedArea += area;

            // Clé de groupement par type & dimension
            const wVal = (el.width || 0).toFixed(2);
            const hVal = (el.height || 0).toFixed(2);
            const key = `${el.id || el.shape}_${wVal}x${hVal}`;

            if (!inventory[key]) {
                // Détermination de la catégorie technique
                let techCat = el.category || 'Mobilier';
                if (el.isWall || el.shape === 'barrier' || el.shape === 'fence') {
                    techCat = 'Cloisons & Sécurité';
                } else if (techCat === 'chairs') {
                    techCat = 'Assises';
                } else if (techCat === 'tables') {
                    techCat = 'Tables';
                } else if (techCat === 'scene') {
                    techCat = 'Scène & Structures';
                } else if (techCat === 'tech') {
                    techCat = 'Audiovisuel & Énergie';
                } else if (techCat === 'deco') {
                    techCat = 'Décoration';
                } else if (techCat === 'people') {
                    techCat = 'Personnel & Public';
                }

                inventory[key] = {
                    id: el.id || el.shape,
                    name: el.description || el.name || el.id || 'Élément',
                    category: techCat,
                    width: el.width || 0,
                    height: el.height || 0,
                    color: el.color || '#4A607A',
                    shape: el.shape,
                    isLinear: isLinear,
                    count: 0,
                    totalLength: 0,
                    totalArea: 0,
                    sampleNames: []
                };
            }

            inventory[key].count++;
            if (isLinear) inventory[key].totalLength += length;
            inventory[key].totalArea += area;
            if (el.name && inventory[key].sampleNames.length < 3 && !inventory[key].sampleNames.includes(el.name)) {
                inventory[key].sampleNames.push(el.name);
            }
        }

        const sortedItems = Object.values(inventory).sort((a, b) => {
            if (a.category !== b.category) return a.category.localeCompare(b.category);
            return b.count - a.count;
        });

        return {
            items: sortedItems,
            totalItems,
            totalSeats,
            totalLinear,
            totalOccupiedArea,
            sceneWidth: this.sceneWidth,
            sceneHeight: this.sceneHeight,
            sceneArea: this.sceneWidth * this.sceneHeight,
            freeArea: Math.max(0, (this.sceneWidth * this.sceneHeight) - totalOccupiedArea)
        };
    }

    exportBOMCSV() {
        const bom = this.getBOMInventory();
        const rawName = document.getElementById('project-name')?.value || 'Projet';
        const projectName = rawName.replace(/;/g, ' ').trim();
        const dateStr = new Date().toLocaleDateString('fr-FR');

        let csv = '\uFEFF'; // UTF-8 BOM pour ouverture directe Excel
        csv += `ScenoPlan - Nomenclature Matériel & Fiche Technique\n`;
        csv += `Projet;${projectName};Date;${dateStr}\n`;
        csv += `Surface Salle;${bom.sceneArea.toFixed(1)} m²;Emprise Mobilier;${bom.totalOccupiedArea.toFixed(1)} m²;Surface Libre;${bom.freeArea.toFixed(1)} m²\n`;
        csv += `Total Éléments Posés;${bom.totalItems};Places Assises Totales;${bom.totalSeats};Linéaire Barrières & Cloisons;${bom.totalLinear.toFixed(2)} m\n\n`;

        csv += `Catégorie;Désignation;Identifiant;Dimensions Unitaires (L x P m);Quantité;Linéaire / Surface Totale;Exemples d'étiquettes\n`;

        for (const item of bom.items) {
            const dimStr = `${item.width.toFixed(2)} × ${item.height.toFixed(2)}`;
            const metricStr = item.isLinear ? `${item.totalLength.toFixed(2)} m lin.` : `${item.totalArea.toFixed(2)} m²`;
            const samplesStr = item.sampleNames.join(', ');
            csv += `"${item.category}";"${item.name}";"${item.id}";"${dimStr}";${item.count};"${metricStr}";"${samplesStr}"\n`;
        }

        return csv;
    }

    downloadBOMCSV() {
        const csv = this.exportBOMCSV();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const rawName = document.getElementById('project-name')?.value || 'Nomenclature';
        const cleanName = rawName.trim().replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_') || 'Projet';
        a.href = url;
        a.download = `Nomenclature_${cleanName}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    printBOMTechnicalSheet() {
        const bom = this.getBOMInventory();
        const projectName = document.getElementById('project-name')?.value || 'Mon Projet Scénographique';
        const dateStr = new Date().toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        let rowsHtml = '';
        bom.items.forEach(item => {
            const dimStr = `${item.width.toFixed(2)} × ${item.height.toFixed(2)} m`;
            const metricStr = item.isLinear ? `${item.totalLength.toFixed(2)} m lin.` : `${item.totalArea.toFixed(2)} m²`;
            rowsHtml += `
                <tr>
                    <td style="display:flex;align-items:center;gap:8px;">
                        <span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${item.color};border:1px solid rgba(0,0,0,0.2);"></span>
                        <strong>${item.name}</strong>
                    </td>
                    <td><span style="background:#f0f2f5;padding:2px 6px;border-radius:3px;font-size:10px;">${item.category}</span></td>
                    <td style="font-family:monospace;font-size:11px;">${dimStr}</td>
                    <td style="text-align:center;font-weight:bold;font-size:13px;color:#1a365d;">${item.count}</td>
                    <td style="text-align:right;font-family:monospace;">${metricStr}</td>
                </tr>
            `;
        });

        const printWin = window.open('', '_blank');
        if (!printWin) {
            alert("Veuillez autoriser les fenêtres pop-up pour imprimer la fiche technique.");
            return;
        }

        printWin.document.write(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <title>Fiche Technique & Nomenclature - ${projectName}</title>
                <style>
                    @page { size: A4 landscape; margin: 12mm; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        color: #1a202c;
                        margin: 0;
                        padding: 15px;
                        font-size: 11px;
                        background: #fff;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        border-bottom: 2px solid #2d3748;
                        padding-bottom: 10px;
                        margin-bottom: 12px;
                    }
                    .title { font-size: 18px; font-weight: 700; margin: 0 0 4px 0; color: #1a365d; }
                    .subtitle { font-size: 11px; color: #718096; margin: 0; }
                    .meta { text-align: right; font-size: 10.5px; color: #4a5568; line-height: 1.4; }
                    .kpis {
                        display: grid;
                        grid-template-columns: repeat(5, 1fr);
                        gap: 10px;
                        margin-bottom: 15px;
                    }
                    .kpi {
                        border: 1px solid #e2e8f0;
                        background: #f7fafc;
                        border-radius: 6px;
                        padding: 8px;
                        text-align: center;
                    }
                    .kpi-val { font-size: 16px; font-weight: 700; color: #2b6cb0; }
                    .kpi-lbl { font-size: 9.5px; text-transform: uppercase; color: #718096; margin-top: 2px; font-weight: 600; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th {
                        background: #edf2f7;
                        text-align: left;
                        padding: 7px 8px;
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        border-bottom: 2px solid #cbd5e0;
                        color: #4a5568;
                    }
                    td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
                    tr:nth-child(even) td { background: #fcfdfd; }
                    .signatures {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 25px;
                        page-break-inside: avoid;
                    }
                    .sig-box {
                        width: 44%;
                        border: 1px dashed #a0aec0;
                        border-radius: 6px;
                        padding: 10px 12px;
                        min-height: 60px;
                        font-size: 10px;
                        color: #4a5568;
                        background: #fafafa;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1 class="title">📋 Fiche Technique & Nomenclature Matériel</h1>
                        <p class="subtitle">ScenoPlan — Conception Scénographique & Fiches Prestataires</p>
                    </div>
                    <div class="meta">
                        <div><strong>Projet :</strong> ${projectName}</div>
                        <div><strong>Édité le :</strong> ${dateStr}</div>
                        <div><strong>Salle / Scène :</strong> ${bom.sceneWidth}m × ${bom.sceneHeight}m (${bom.sceneArea} m²)</div>
                    </div>
                </div>

                <div class="kpis">
                    <div class="kpi">
                        <div class="kpi-val">${bom.totalItems}</div>
                        <div class="kpi-lbl">Total Matériel Posé</div>
                    </div>
                    <div class="kpi">
                        <div class="kpi-val">${bom.totalSeats}</div>
                        <div class="kpi-lbl">Places Assises Totales</div>
                    </div>
                    <div class="kpi">
                        <div class="kpi-val">${bom.totalLinear.toFixed(1)} m</div>
                        <div class="kpi-lbl">Linéaire Cloisons / Barrières</div>
                    </div>
                    <div class="kpi">
                        <div class="kpi-val">${bom.totalOccupiedArea.toFixed(1)} m²</div>
                        <div class="kpi-lbl">Emprise Mobilier</div>
                    </div>
                    <div class="kpi">
                        <div class="kpi-val">${bom.freeArea.toFixed(1)} m²</div>
                        <div class="kpi-lbl">Surface Libre Dégagée</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Désignation Matériel</th>
                            <th>Catégorie</th>
                            <th>Dimensions (L × P)</th>
                            <th style="text-align:center;">Quantité</th>
                            <th style="text-align:right;">Linéaire / Surface Totale</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>

                <div class="signatures">
                    <div class="sig-box">
                        <strong>Régie Générale / Responsable Technique</strong><br>
                        Nom, date et signature pour accord :
                    </div>
                    <div class="sig-box">
                        <strong>Prestataire Audiovisuel / Fournisseur Mobilier</strong><br>
                        Bon de prise en charge et livraison :
                    </div>
                </div>
            </body>
            </html>
        `);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => printWin.print(), 300);
    }

    // ─── Serialization ─────────────────────────────────────────────

    serialize() {
        return JSON.stringify({
            version: 1,
            projectName: document.getElementById('project-name').value,
            sceneWidth: this.sceneWidth,
            sceneHeight: this.sceneHeight,
            gridSize: this.gridSize,
            elements: this.elements
        }, null, 2);
    }

    deserialize(json) {
        try {
            const data = JSON.parse(json);
            if (data.version !== 1) throw new Error('Version incompatible');
            document.getElementById('project-name').value = data.projectName || 'Projet';
            this.sceneWidth = data.sceneWidth || 30;
            this.sceneHeight = data.sceneHeight || 20;
            this.gridSize = data.gridSize || 0.5;
            this.elements = data.elements || [];
            this._nextId = Math.max(...this.elements.map(el => el.uid || 0), 0) + 1;
            this.selectedElement = null;
            this.undoStack = [];
            this.redoStack = [];
            this.fitView();
            this.notifyElementsChange();
            return true;
        } catch (e) {
            console.error('Failed to load project:', e);
            alert('Erreur lors du chargement du projet.');
            return false;
        }
    }

    clearAll() {
        this.saveUndoState();
        this.elements = [];
        this.selectedElement = null;
        this._nextId = 1;
        this.render();
        this.notifyElementsChange();
        if (this.onSelectionChange) this.onSelectionChange(null);
    }
}
