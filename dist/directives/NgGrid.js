"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var NgGridPlaceholder_1 = require('../components/NgGridPlaceholder');
var NgGrid = (function () {
    //	Constructor
    function NgGrid(_differs, _ngEl, _renderer, componentFactoryResolver, _containerRef) {
        this._differs = _differs;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        this.componentFactoryResolver = componentFactoryResolver;
        this._containerRef = _containerRef;
        //	Event Emitters
        this.onDragStart = new core_1.EventEmitter();
        this.onDrag = new core_1.EventEmitter();
        this.onDragStop = new core_1.EventEmitter();
        this.onResizeStart = new core_1.EventEmitter();
        this.onResize = new core_1.EventEmitter();
        this.onResizeStop = new core_1.EventEmitter();
        this.onItemChange = new core_1.EventEmitter();
        //	Public variables
        this.colWidth = 250;
        this.rowHeight = 250;
        this.minCols = 1;
        this.minRows = 1;
        this.marginTop = 10;
        this.marginRight = 10;
        this.marginBottom = 10;
        this.marginLeft = 10;
        this.isDragging = false;
        this.isResizing = false;
        this.autoStyle = true;
        this.resizeEnable = true;
        this.dragEnable = true;
        this.cascade = 'up';
        this.minWidth = 100;
        this.minHeight = 100;
        //	Private variables
        this._items = [];
        this._draggingItem = null;
        this._resizingItem = null;
        this._resizeDirection = null;
        this._itemGrid = { 1: { 1: null } };
        this._maxCols = 0;
        this._maxRows = 0;
        this._visibleCols = 0;
        this._visibleRows = 0;
        this._setWidth = 250;
        this._setHeight = 250;
        this._posOffset = null;
        this._adding = false;
        this._placeholderRef = null;
        this._fixToGrid = false;
        this._autoResize = false;
        this._destroyed = false;
        this._maintainRatio = false;
        this._preferNew = false;
        this._zoomOnDrag = false;
        this._limitToScreen = false;
        this._curMaxRow = 0;
        this._curMaxCol = 0;
        this._dragReady = false;
        this._resizeReady = false;
        this._config = NgGrid.CONST_DEFAULT_CONFIG;
    }
    Object.defineProperty(NgGrid.prototype, "config", {
        //	[ng-grid] attribute handler
        set: function (v) {
            this.setConfig(v);
            if (this._differ == null && v != null) {
                this._differ = this._differs.find(this._config).create(null);
            }
        },
        enumerable: true,
        configurable: true
    });
    //	Public methods
    NgGrid.prototype.ngOnInit = function () {
        this._renderer.setElementClass(this._ngEl.nativeElement, 'grid', true);
        if (this.autoStyle)
            this._renderer.setElementStyle(this._ngEl.nativeElement, 'position', 'relative');
        this.setConfig(this._config);
    };
    NgGrid.prototype.ngOnDestroy = function () {
        this._destroyed = true;
    };
    NgGrid.prototype.setConfig = function (config) {
        this._config = config;
        var maxColRowChanged = false;
        for (var x in config) {
            var val = config[x];
            var intVal = !val ? 0 : parseInt(val);
            switch (x) {
                case 'margins':
                    this.setMargins(val);
                    break;
                case 'col_width':
                    this.colWidth = Math.max(intVal, 1);
                    break;
                case 'row_height':
                    this.rowHeight = Math.max(intVal, 1);
                    break;
                case 'auto_style':
                    this.autoStyle = val ? true : false;
                    break;
                case 'auto_resize':
                    this._autoResize = val ? true : false;
                    break;
                case 'draggable':
                    this.dragEnable = val ? true : false;
                    break;
                case 'resizable':
                    this.resizeEnable = val ? true : false;
                    break;
                case 'max_rows':
                    maxColRowChanged = maxColRowChanged || this._maxRows != intVal;
                    this._maxRows = intVal < 0 ? 0 : intVal;
                    break;
                case 'max_cols':
                    maxColRowChanged = maxColRowChanged || this._maxCols != intVal;
                    this._maxCols = intVal < 0 ? 0 : intVal;
                    break;
                case 'visible_rows':
                    this._visibleRows = Math.max(intVal, 0);
                    break;
                case 'visible_cols':
                    this._visibleCols = Math.max(intVal, 0);
                    break;
                case 'min_rows':
                    this.minRows = Math.max(intVal, 1);
                    break;
                case 'min_cols':
                    this.minCols = Math.max(intVal, 1);
                    break;
                case 'min_height':
                    this.minHeight = Math.max(intVal, 1);
                    break;
                case 'min_width':
                    this.minWidth = Math.max(intVal, 1);
                    break;
                case 'zoom_on_drag':
                    this._zoomOnDrag = val ? true : false;
                    break;
                case 'cascade':
                    if (this.cascade != val) {
                        this.cascade = val;
                        this._cascadeGrid();
                    }
                    break;
                case 'fix_to_grid':
                    this._fixToGrid = val ? true : false;
                    break;
                case 'maintain_ratio':
                    this._maintainRatio = val ? true : false;
                    break;
                case 'prefer_new':
                    this._preferNew = val ? true : false;
                    break;
                case 'limit_to_screen':
                    this._limitToScreen = val ? true : false;
                    break;
            }
        }
        if (this._maintainRatio) {
            if (this.colWidth && this.rowHeight) {
                this._aspectRatio = this.colWidth / this.rowHeight;
            }
            else {
                this._maintainRatio = false;
            }
        }
        if (maxColRowChanged) {
            if (this._maxCols > 0 && this._maxRows > 0) {
                switch (this.cascade) {
                    case 'left':
                    case 'right':
                        this._maxCols = 0;
                        break;
                    case 'up':
                    case 'down':
                    default:
                        this._maxRows = 0;
                        break;
                }
            }
            for (var _i = 0, _a = this._items; _i < _a.length; _i++) {
                var item = _a[_i];
                var pos = item.getGridPosition();
                var dims = item.getSize();
                this._removeFromGrid(item);
                if (this._maxCols > 0 && dims.x > this._maxCols) {
                    dims.x = this._maxCols;
                    item.setSize(dims);
                }
                else if (this._maxRows > 0 && dims.y > this._maxRows) {
                    dims.y = this._maxRows;
                    item.setSize(dims);
                }
                if (this._hasGridCollision(pos, dims) || !this._isWithinBounds(pos, dims)) {
                    var newPosition = this._fixGridPosition(pos, dims);
                    item.setGridPosition(newPosition);
                }
                this._addToGrid(item);
            }
            this._cascadeGrid();
        }
        this._calculateRowHeight();
        this._calculateColWidth();
        var maxWidth = this._maxCols * this.colWidth;
        var maxHeight = this._maxRows * this.rowHeight;
        if (maxWidth > 0 && this.minWidth > maxWidth)
            this.minWidth = 0.75 * this.colWidth;
        if (maxHeight > 0 && this.minHeight > maxHeight)
            this.minHeight = 0.75 * this.rowHeight;
        if (this.minWidth > this.colWidth)
            this.minCols = Math.max(this.minCols, Math.ceil(this.minWidth / this.colWidth));
        if (this.minHeight > this.rowHeight)
            this.minRows = Math.max(this.minRows, Math.ceil(this.minHeight / this.rowHeight));
        if (this._maxCols > 0 && this.minCols > this._maxCols)
            this.minCols = 1;
        if (this._maxRows > 0 && this.minRows > this._maxRows)
            this.minRows = 1;
        this._updateRatio();
        for (var _b = 0, _c = this._items; _b < _c.length; _b++) {
            var item = _c[_b];
            this._removeFromGrid(item);
            item.setCascadeMode(this.cascade);
        }
        this._updateLimit();
        for (var _d = 0, _e = this._items; _d < _e.length; _d++) {
            var item = _e[_d];
            item.recalculateSelf();
            this._addToGrid(item);
        }
        this._cascadeGrid();
        this._updateSize();
    };
    NgGrid.prototype.getItemPosition = function (index) {
        return this._items[index].getGridPosition();
    };
    NgGrid.prototype.getItemSize = function (index) {
        return this._items[index].getSize();
    };
    NgGrid.prototype.ngDoCheck = function () {
        if (this._differ != null) {
            var changes = this._differ.diff(this._config);
            if (changes != null) {
                this._applyChanges(changes);
                return true;
            }
        }
        return false;
    };
    NgGrid.prototype.setMargins = function (margins) {
        this.marginTop = Math.max(parseInt(margins[0]), 0);
        this.marginRight = margins.length >= 2 ? Math.max(parseInt(margins[1]), 0) : this.marginTop;
        this.marginBottom = margins.length >= 3 ? Math.max(parseInt(margins[2]), 0) : this.marginTop;
        this.marginBottom = margins.length >= 3 ? Math.max(parseInt(margins[2]), 0) : this.marginTop;
        this.marginLeft = margins.length >= 4 ? Math.max(parseInt(margins[3]), 0) : this.marginRight;
    };
    NgGrid.prototype.enableDrag = function () {
        this.dragEnable = true;
    };
    NgGrid.prototype.disableDrag = function () {
        this.dragEnable = false;
    };
    NgGrid.prototype.enableResize = function () {
        this.resizeEnable = true;
    };
    NgGrid.prototype.disableResize = function () {
        this.resizeEnable = false;
    };
    NgGrid.prototype.addItem = function (ngItem) {
        ngItem.setCascadeMode(this.cascade);
        if (!this._preferNew) {
            var newPos = this._fixGridPosition(ngItem.getGridPosition(), ngItem.getSize());
            ngItem.savePosition(newPos);
        }
        this._items.push(ngItem);
        this._addToGrid(ngItem);
        ngItem.recalculateSelf();
        ngItem.onCascadeEvent();
    };
    NgGrid.prototype.removeItem = function (ngItem) {
        this._removeFromGrid(ngItem);
        for (var x = 0; x < this._items.length; x++) {
            if (this._items[x] == ngItem) {
                this._items.splice(x, 1);
            }
        }
        if (this._destroyed)
            return;
        this._cascadeGrid();
        this._updateSize();
        this._items.forEach(function (item) { return item.recalculateSelf(); });
    };
    NgGrid.prototype.updateItem = function (ngItem) {
        this._removeFromGrid(ngItem);
        this._addToGrid(ngItem);
        this._cascadeGrid();
        this._updateSize();
        ngItem.onCascadeEvent();
    };
    NgGrid.prototype.triggerCascade = function () {
        this._cascadeGrid(null, null, false);
    };
    //	Private methods
    NgGrid.prototype._calculateColWidth = function () {
        if (this._autoResize) {
            if (this._maxCols > 0 || this._visibleCols > 0) {
                var maxCols = this._maxCols > 0 ? this._maxCols : this._visibleCols;
                var maxWidth = this._ngEl.nativeElement.getBoundingClientRect().width;
                var colWidth = Math.floor(maxWidth / maxCols);
                colWidth -= (this.marginLeft + this.marginRight);
                if (colWidth > 0)
                    this.colWidth = colWidth;
                if (this.colWidth < this.minWidth || this.minCols > this._config.min_cols) {
                    this.minCols = Math.max(this._config.min_cols, Math.ceil(this.minWidth / this.colWidth));
                }
            }
        }
    };
    NgGrid.prototype._calculateRowHeight = function () {
        if (this._autoResize) {
            if (this._maxRows > 0 || this._visibleRows > 0) {
                var maxRows = this._maxRows > 0 ? this._maxRows : this._visibleRows;
                var maxHeight = window.innerHeight - this.marginTop - this.marginBottom;
                var rowHeight = Math.max(Math.floor(maxHeight / maxRows), this.minHeight);
                rowHeight -= (this.marginTop + this.marginBottom);
                if (rowHeight > 0)
                    this.rowHeight = rowHeight;
                if (this.rowHeight < this.minHeight || this.minRows > this._config.min_rows) {
                    this.minRows = Math.max(this._config.min_rows, Math.ceil(this.minHeight / this.rowHeight));
                }
            }
        }
    };
    NgGrid.prototype._updateRatio = function () {
        if (this._autoResize && this._maintainRatio) {
            if (this._maxCols > 0 && this._visibleRows <= 0) {
                this.rowHeight = this.colWidth / this._aspectRatio;
            }
            else if (this._maxRows > 0 && this._visibleCols <= 0) {
                this.colWidth = this._aspectRatio * this.rowHeight;
            }
            else if (this._maxCols == 0 && this._maxRows == 0) {
                if (this._visibleCols > 0) {
                    this.rowHeight = this.colWidth / this._aspectRatio;
                }
                else if (this._visibleRows > 0) {
                    this.colWidth = this._aspectRatio * this.rowHeight;
                }
            }
        }
    };
    NgGrid.prototype._updateLimit = function () {
        if (!this._autoResize && this._limitToScreen) {
            this._limitGrid(this._getContainerColumns());
        }
    };
    NgGrid.prototype._onResize = function (e) {
        this._calculateColWidth();
        this._calculateRowHeight();
        this._updateRatio();
        for (var _i = 0, _a = this._items; _i < _a.length; _i++) {
            var item = _a[_i];
            this._removeFromGrid(item);
        }
        this._updateLimit();
        for (var _b = 0, _c = this._items; _b < _c.length; _b++) {
            var item = _c[_b];
            this._addToGrid(item);
            item.recalculateSelf();
        }
        this._updateSize();
    };
    NgGrid.prototype._applyChanges = function (changes) {
        var _this = this;
        changes.forEachAddedItem(function (record) { _this._config[record.key] = record.currentValue; });
        changes.forEachChangedItem(function (record) { _this._config[record.key] = record.currentValue; });
        changes.forEachRemovedItem(function (record) { delete _this._config[record.key]; });
        this.setConfig(this._config);
    };
    NgGrid.prototype._onMouseDown = function (e) {
        var mousePos = this._getMousePosition(e);
        var item = this._getItemFromPosition(mousePos);
        if (item != null) {
            if (this.resizeEnable && item.canResize(e)) {
                this._resizeReady = true;
            }
            else if (this.dragEnable && item.canDrag(e)) {
                this._dragReady = true;
            }
        }
        return true;
    };
    NgGrid.prototype._resizeStart = function (e) {
        if (this.resizeEnable) {
            var mousePos = this._getMousePosition(e);
            var item = this._getItemFromPosition(mousePos);
            item.startMoving();
            this._resizingItem = item;
            this._resizeDirection = item.canResize(e);
            this._removeFromGrid(item);
            this._createPlaceholder(item);
            this.isResizing = true;
            this._resizeReady = false;
            this.onResizeStart.emit(item);
            item.onResizeStartEvent();
        }
    };
    NgGrid.prototype._dragStart = function (e) {
        if (this.dragEnable) {
            var mousePos = this._getMousePosition(e);
            var item = this._getItemFromPosition(mousePos);
            var itemPos = item.getPosition();
            var pOffset = { 'left': (mousePos.left - itemPos.left), 'top': (mousePos.top - itemPos.top) };
            item.startMoving();
            this._draggingItem = item;
            this._posOffset = pOffset;
            this._removeFromGrid(item);
            this._createPlaceholder(item);
            this.isDragging = true;
            this._dragReady = false;
            this.onDragStart.emit(item);
            item.onDragStartEvent();
            if (this._zoomOnDrag) {
                this._zoomOut();
            }
        }
    };
    NgGrid.prototype._zoomOut = function () {
        this._renderer.setElementStyle(this._ngEl.nativeElement, 'transform', 'scale(0.5, 0.5)');
    };
    NgGrid.prototype._resetZoom = function () {
        this._renderer.setElementStyle(this._ngEl.nativeElement, 'transform', '');
    };
    NgGrid.prototype._onMouseMove = function (e) {
        if (e.buttons == 1 && this._resizeReady) {
            this._resizeStart(e);
            return false;
        }
        else if (e.buttons == 1 && this._dragReady) {
            this._dragStart(e);
            return false;
        }
        else if (this._dragReady || this._resizeReady) {
            this._dragReady = false;
            this._resizeReady = false;
        }
        if (e.buttons == 0 && this.isDragging) {
            this._dragStop(e);
        }
        else if (e.buttons == 0 && this.isResizing) {
            this._resizeStop(e);
        }
        else if (this.isDragging) {
            this._drag(e);
        }
        else if (this.isResizing) {
            this._resize(e);
        }
        else {
            var mousePos = this._getMousePosition(e);
            var item = this._getItemFromPosition(mousePos);
            if (item) {
                item.onMouseMove(e);
            }
        }
        return true;
    };
    NgGrid.prototype._drag = function (e) {
        if (this.isDragging) {
            if (window.getSelection) {
                if (window.getSelection().empty) {
                    window.getSelection().empty();
                }
                else if (window.getSelection().removeAllRanges) {
                    window.getSelection().removeAllRanges();
                }
            }
            else if (document.selection) {
                document.selection.empty();
            }
            ;
            var mousePos = this._getMousePosition(e);
            var newL = (mousePos.left - this._posOffset.left);
            var newT = (mousePos.top - this._posOffset.top);
            var itemPos = this._draggingItem.getGridPosition();
            var gridPos = this._calculateGridPosition(newL, newT);
            var dims = this._draggingItem.getSize();
            if (!this._isWithinBoundsX(gridPos, dims))
                gridPos.col = this._maxCols - (dims.x - 1);
            if (!this._isWithinBoundsY(gridPos, dims))
                gridPos.row = this._maxRows - (dims.y - 1);
            if (!this._autoResize && this._limitToScreen) {
                if ((gridPos.col + dims.x - 1) > this._getContainerColumns()) {
                    gridPos.col = this._getContainerColumns() - (dims.x - 1);
                }
            }
            if (gridPos.col != itemPos.col || gridPos.row != itemPos.row) {
                this._draggingItem.setGridPosition(gridPos, this._fixToGrid);
                this._placeholderRef.instance.setGridPosition(gridPos);
                if (['up', 'down', 'left', 'right'].indexOf(this.cascade) >= 0) {
                    this._fixGridCollisions(gridPos, dims, true);
                    this._cascadeGrid(gridPos, dims);
                }
            }
            if (!this._fixToGrid) {
                this._draggingItem.setPosition(newL, newT);
            }
            this.onDrag.emit(this._draggingItem);
            this._draggingItem.onDragEvent();
        }
    };
    NgGrid.prototype._resize = function (e) {
        if (this.isResizing) {
            if (window.getSelection) {
                if (window.getSelection().empty) {
                    window.getSelection().empty();
                }
                else if (window.getSelection().removeAllRanges) {
                    window.getSelection().removeAllRanges();
                }
            }
            else if (document.selection) {
                document.selection.empty();
            }
            ;
            var mousePos = this._getMousePosition(e);
            var itemPos = this._resizingItem.getPosition();
            var itemDims = this._resizingItem.getDimensions();
            var newW = this._resizeDirection == 'height' ? itemDims.width : (mousePos.left - itemPos.left + 10);
            var newH = this._resizeDirection == 'width' ? itemDims.height : (mousePos.top - itemPos.top + 10);
            if (newW < this.minWidth)
                newW = this.minWidth;
            if (newH < this.minHeight)
                newH = this.minHeight;
            if (newW < this._resizingItem.minWidth)
                newW = this._resizingItem.minWidth;
            if (newH < this._resizingItem.minHeight)
                newH = this._resizingItem.minHeight;
            var calcSize = this._calculateGridSize(newW, newH);
            var itemSize = this._resizingItem.getSize();
            var iGridPos = this._resizingItem.getGridPosition();
            if (!this._isWithinBoundsX(iGridPos, calcSize))
                calcSize.x = (this._maxCols - iGridPos.col) + 1;
            if (!this._isWithinBoundsY(iGridPos, calcSize))
                calcSize.y = (this._maxRows - iGridPos.row) + 1;
            calcSize = this._resizingItem.fixResize(calcSize);
            if (calcSize.x != itemSize.x || calcSize.y != itemSize.y) {
                this._resizingItem.setSize(calcSize, false);
                this._placeholderRef.instance.setSize(calcSize);
                if (['up', 'down', 'left', 'right'].indexOf(this.cascade) >= 0) {
                    this._fixGridCollisions(iGridPos, calcSize, true);
                    this._cascadeGrid(iGridPos, calcSize);
                }
            }
            if (!this._fixToGrid)
                this._resizingItem.setDimensions(newW, newH);
            var bigGrid = this._maxGridSize(itemPos.left + newW + (2 * e.movementX), itemPos.top + newH + (2 * e.movementY));
            if (this._resizeDirection == 'height')
                bigGrid.x = iGridPos.col + itemSize.x;
            if (this._resizeDirection == 'width')
                bigGrid.y = iGridPos.row + itemSize.y;
            this.onResize.emit(this._resizingItem);
            this._resizingItem.onResizeEvent();
        }
    };
    NgGrid.prototype._onMouseUp = function (e) {
        if (this.isDragging) {
            this._dragStop(e);
            return false;
        }
        else if (this.isResizing) {
            this._resizeStop(e);
            return false;
        }
        return true;
    };
    NgGrid.prototype._dragStop = function (e) {
        if (this.isDragging) {
            this.isDragging = false;
            var itemPos = this._draggingItem.getGridPosition();
            this._draggingItem.savePosition(itemPos);
            this._addToGrid(this._draggingItem);
            this._cascadeGrid();
            this._draggingItem.stopMoving();
            this._draggingItem.onDragStopEvent();
            this.onDragStop.emit(this._draggingItem);
            this._draggingItem = null;
            this._posOffset = null;
            this._placeholderRef.destroy();
            this.onItemChange.emit(this._items.map(function (item) { return item.getEventOutput(); }));
            if (this._zoomOnDrag) {
                this._resetZoom();
            }
        }
    };
    NgGrid.prototype._resizeStop = function (e) {
        if (this.isResizing) {
            this.isResizing = false;
            var itemDims = this._resizingItem.getSize();
            this._resizingItem.setSize(itemDims);
            this._addToGrid(this._resizingItem);
            this._cascadeGrid();
            this._resizingItem.stopMoving();
            this._resizingItem.onResizeStopEvent();
            this.onResizeStop.emit(this._resizingItem);
            this._resizingItem = null;
            this._resizeDirection = null;
            this._placeholderRef.destroy();
            this.onItemChange.emit(this._items.map(function (item) { return item.getEventOutput(); }));
        }
    };
    NgGrid.prototype._maxGridSize = function (w, h) {
        var sizex = Math.ceil(w / (this.colWidth + this.marginLeft + this.marginRight));
        var sizey = Math.ceil(h / (this.rowHeight + this.marginTop + this.marginBottom));
        return { 'x': sizex, 'y': sizey };
    };
    NgGrid.prototype._calculateGridSize = function (width, height) {
        width += this.marginLeft + this.marginRight;
        height += this.marginTop + this.marginBottom;
        var sizex = Math.max(this.minCols, Math.round(width / (this.colWidth + this.marginLeft + this.marginRight)));
        var sizey = Math.max(this.minRows, Math.round(height / (this.rowHeight + this.marginTop + this.marginBottom)));
        if (!this._isWithinBoundsX({ col: 1, row: 1 }, { x: sizex, y: sizey }))
            sizex = this._maxCols;
        if (!this._isWithinBoundsY({ col: 1, row: 1 }, { x: sizex, y: sizey }))
            sizey = this._maxRows;
        return { 'x': sizex, 'y': sizey };
    };
    NgGrid.prototype._calculateGridPosition = function (left, top) {
        var col = Math.max(1, Math.round(left / (this.colWidth + this.marginLeft + this.marginRight)) + 1);
        var row = Math.max(1, Math.round(top / (this.rowHeight + this.marginTop + this.marginBottom)) + 1);
        if (!this._isWithinBoundsX({ col: col, row: row }, { x: 1, y: 1 }))
            col = this._maxCols;
        if (!this._isWithinBoundsY({ col: col, row: row }, { x: 1, y: 1 }))
            row = this._maxRows;
        return { 'col': col, 'row': row };
    };
    NgGrid.prototype._hasGridCollision = function (pos, dims) {
        var positions = this._getCollisions(pos, dims);
        if (positions == null || positions.length == 0)
            return false;
        return positions.some(function (v) {
            return !(v === null);
        });
    };
    NgGrid.prototype._getCollisions = function (pos, dims) {
        var returns = [];
        for (var j = 0; j < dims.y; j++) {
            if (this._itemGrid[pos.row + j] != null) {
                for (var i = 0; i < dims.x; i++) {
                    if (this._itemGrid[pos.row + j][pos.col + i] != null) {
                        var item = this._itemGrid[pos.row + j][pos.col + i];
                        if (returns.indexOf(item) < 0)
                            returns.push(item);
                        var itemPos = item.getGridPosition();
                        var itemDims = item.getSize();
                        i = itemPos.col + itemDims.x - pos.col;
                    }
                }
            }
        }
        return returns;
    };
    NgGrid.prototype._fixGridCollisions = function (pos, dims, shouldSave) {
        if (shouldSave === void 0) { shouldSave = false; }
        while (this._hasGridCollision(pos, dims)) {
            var collisions = this._getCollisions(pos, dims);
            this._removeFromGrid(collisions[0]);
            var itemPos = collisions[0].getGridPosition();
            var itemDims = collisions[0].getSize();
            switch (this.cascade) {
                case 'up':
                case 'down':
                default:
                    var oldRow = itemPos.row;
                    itemPos.row = pos.row + dims.y;
                    if (!this._isWithinBoundsY(itemPos, itemDims)) {
                        itemPos.col = pos.col + dims.x;
                        itemPos.row = oldRow;
                    }
                    break;
                case 'left':
                case 'right':
                    var oldCol = itemPos.col;
                    itemPos.col = pos.col + dims.x;
                    if (!this._isWithinBoundsX(itemPos, itemDims)) {
                        itemPos.col = oldCol;
                        itemPos.row = pos.row + dims.y;
                    }
                    break;
            }
            if (shouldSave) {
                collisions[0].savePosition(itemPos);
            }
            else {
                collisions[0].setGridPosition(itemPos);
            }
            this._fixGridCollisions(itemPos, itemDims, shouldSave);
            this._addToGrid(collisions[0]);
            collisions[0].onCascadeEvent();
        }
    };
    NgGrid.prototype._limitGrid = function (maxCols) {
        var items = this._items.slice();
        items.sort(function (a, b) {
            var aPos = a.getSavedPosition();
            var bPos = b.getSavedPosition();
            if (aPos.row == bPos.row) {
                return aPos.col == bPos.col ? 0 : (aPos.col < bPos.col ? -1 : 1);
            }
            else {
                return aPos.row < bPos.row ? -1 : 1;
            }
        });
        var columnMax = {};
        var largestGap = {};
        for (var i = 1; i <= maxCols; i++) {
            columnMax[i] = 1;
            largestGap[i] = 1;
        }
        var curPos = { col: 1, row: 1 };
        var currentRow = 1;
        var willCascade = function (item, col) {
            for (var i = col; i < col + item.sizex; i++) {
                if (columnMax[i] == currentRow)
                    return true;
            }
            return false;
        };
        while (items.length > 0) {
            var columns = [];
            var newBlock = {
                start: 1,
                end: 1,
                length: 0,
            };
            for (var col = 1; col <= maxCols; col++) {
                if (columnMax[col] <= currentRow) {
                    if (newBlock.length == 0) {
                        newBlock.start = col;
                    }
                    newBlock.length++;
                    newBlock.end = col + 1;
                }
                else if (newBlock.length > 0) {
                    columns.push(newBlock);
                    newBlock = {
                        start: col,
                        end: col,
                        length: 0,
                    };
                }
            }
            if (newBlock.length > 0) {
                columns.push(newBlock);
            }
            var tempColumns = columns.map(function (block) { return block.length; });
            var currentItems = [];
            while (items.length > 0) {
                var item = items[0];
                if (item.row > currentRow)
                    break;
                var fits = false;
                for (var x in tempColumns) {
                    if (item.sizex <= tempColumns[x]) {
                        tempColumns[x] -= item.sizex;
                        fits = true;
                        break;
                    }
                    else if (item.sizex > tempColumns[x]) {
                        tempColumns[x] = 0;
                    }
                }
                if (fits) {
                    currentItems.push(items.shift());
                }
                else {
                    break;
                }
            }
            if (currentItems.length > 0) {
                var itemPositions = [];
                var lastPosition = maxCols;
                for (var i = currentItems.length - 1; i >= 0; i--) {
                    var maxPosition = 1;
                    for (var j = columns.length - 1; j >= 0; j--) {
                        if (columns[j].start > lastPosition)
                            continue;
                        if (columns[j].start > (maxCols - currentItems[i].sizex))
                            continue;
                        if (columns[j].length < currentItems[i].sizex)
                            continue;
                        if (lastPosition < columns[j].end && (lastPosition - columns[j].start) < currentItems[i].sizex)
                            continue;
                        maxPosition = (lastPosition < columns[j].end ? lastPosition : columns[j].end) - currentItems[i].sizex;
                        break;
                    }
                    itemPositions[i] = Math.min(maxPosition, currentItems[i].row == currentRow ? currentItems[i].col : 1);
                    lastPosition = itemPositions[i];
                }
                var minPosition = 1;
                var currentItem = 0;
                while (currentItems.length > 0) {
                    var item = currentItems.shift();
                    for (var j = 0; j < columns.length; j++) {
                        if (columns[j].length < item.sizex)
                            continue;
                        if (minPosition > columns[j].end)
                            continue;
                        if (minPosition > columns[j].start && (columns[j].end - minPosition) < item.sizex)
                            continue;
                        if (minPosition < columns[j].start)
                            minPosition = columns[j].start;
                        break;
                    }
                    item.setGridPosition({ col: Math.max(minPosition, itemPositions[currentItem]), row: currentRow });
                    minPosition = item.currentCol + item.sizex;
                    currentItem++;
                    for (var i = item.currentCol; i < item.currentCol + item.sizex; i++) {
                        columnMax[i] = item.currentRow + item.sizey;
                    }
                }
            }
            else if (currentItems.length === 0 && columns.length === 1 && columns[0].length >= maxCols) {
                var item = items.shift();
                item.setGridPosition({ col: 1, row: currentRow });
                for (var i = item.currentCol; i < item.currentCol + item.sizex; i++) {
                    columnMax[i] = item.currentRow + item.sizey;
                }
            }
            var newRow = 0;
            for (var x in columnMax) {
                if (columnMax[x] > currentRow && (newRow == 0 || columnMax[x] < newRow)) {
                    newRow = columnMax[x];
                }
            }
            currentRow = newRow <= currentRow ? currentRow + 1 : newRow;
        }
    };
    NgGrid.prototype._cascadeGrid = function (pos, dims, shouldSave) {
        if (shouldSave === void 0) { shouldSave = true; }
        if (this._destroyed)
            return;
        if (pos && !dims)
            throw new Error('Cannot cascade with only position and not dimensions');
        if (this.isDragging && this._draggingItem && !pos && !dims) {
            pos = this._draggingItem.getGridPosition();
            dims = this._draggingItem.getSize();
        }
        else if (this.isResizing && this._resizingItem && !pos && !dims) {
            pos = this._resizingItem.getGridPosition();
            dims = this._resizingItem.getSize();
        }
        switch (this.cascade) {
            case 'up':
            case 'down':
                var lowRow = [0];
                for (var i = 1; i <= this._curMaxCol; i++)
                    lowRow[i] = 1;
                for (var r = 1; r <= this._curMaxRow; r++) {
                    if (this._itemGrid[r] == undefined)
                        continue;
                    for (var c = 1; c <= this._curMaxCol; c++) {
                        if (this._itemGrid[r] == undefined)
                            break;
                        if (r < lowRow[c])
                            continue;
                        if (this._itemGrid[r][c] != null) {
                            var item = this._itemGrid[r][c];
                            if (item.isFixed)
                                continue;
                            var itemDims = item.getSize();
                            var itemPos = item.getGridPosition();
                            if (itemPos.col != c || itemPos.row != r)
                                continue; //	If this is not the element's start
                            var lowest = lowRow[c];
                            for (var i = 1; i < itemDims.x; i++) {
                                lowest = Math.max(lowRow[(c + i)], lowest);
                            }
                            if (pos && (c + itemDims.x) > pos.col && c < (pos.col + dims.x)) {
                                if ((r >= pos.row && r < (pos.row + dims.y)) ||
                                    ((itemDims.y > (pos.row - lowest)) &&
                                        (r >= (pos.row + dims.y) && lowest < (pos.row + dims.y)))) {
                                    lowest = Math.max(lowest, pos.row + dims.y); //	Set the lowest row to be below it
                                }
                            }
                            var newPos = { col: c, row: lowest };
                            if (lowest != itemPos.row && this._isWithinBoundsY(newPos, itemDims)) {
                                this._removeFromGrid(item);
                                if (shouldSave) {
                                    item.savePosition(newPos);
                                }
                                else {
                                    item.setGridPosition(newPos);
                                }
                                item.onCascadeEvent();
                                this._addToGrid(item);
                            }
                            for (var i = 0; i < itemDims.x; i++) {
                                lowRow[c + i] = lowest + itemDims.y; //	Update the lowest row to be below the item
                            }
                        }
                    }
                }
                break;
            case 'left':
            case 'right':
                var lowCol = [0];
                for (var i = 1; i <= this._curMaxRow; i++)
                    lowCol[i] = 1;
                for (var r = 1; r <= this._curMaxRow; r++) {
                    if (this._itemGrid[r] == undefined)
                        continue;
                    for (var c = 1; c <= this._curMaxCol; c++) {
                        if (this._itemGrid[r] == undefined)
                            break;
                        if (c < lowCol[r])
                            continue;
                        if (this._itemGrid[r][c] != null) {
                            var item = this._itemGrid[r][c];
                            var itemDims = item.getSize();
                            var itemPos = item.getGridPosition();
                            if (itemPos.col != c || itemPos.row != r)
                                continue; //	If this is not the element's start
                            var lowest = lowCol[r];
                            for (var i = 1; i < itemDims.y; i++) {
                                lowest = Math.max(lowCol[(r + i)], lowest);
                            }
                            if (pos && (r + itemDims.y) > pos.row && r < (pos.row + dims.y)) {
                                if ((c >= pos.col && c < (pos.col + dims.x)) ||
                                    ((itemDims.x > (pos.col - lowest)) &&
                                        (c >= (pos.col + dims.x) && lowest < (pos.col + dims.x)))) {
                                    lowest = Math.max(lowest, pos.col + dims.x); //	Set the lowest col to be below it
                                }
                            }
                            var newPos = { col: lowest, row: r };
                            if (lowest != itemPos.col && this._isWithinBoundsX(newPos, itemDims)) {
                                this._removeFromGrid(item);
                                if (shouldSave) {
                                    item.savePosition(newPos);
                                }
                                else {
                                    item.setGridPosition(newPos);
                                }
                                item.onCascadeEvent();
                                this._addToGrid(item);
                            }
                            for (var i = 0; i < itemDims.y; i++) {
                                lowCol[r + i] = lowest + itemDims.x; //	Update the lowest col to be below the item
                            }
                        }
                    }
                }
                break;
            default:
                break;
        }
    };
    NgGrid.prototype._fixGridPosition = function (pos, dims) {
        while (this._hasGridCollision(pos, dims) || !this._isWithinBounds(pos, dims)) {
            if (this._hasGridCollision(pos, dims)) {
                switch (this.cascade) {
                    case 'up':
                    case 'down':
                    default:
                        pos.row++;
                        break;
                    case 'left':
                    case 'right':
                        pos.col++;
                        break;
                }
            }
            if (!this._isWithinBoundsY(pos, dims)) {
                pos.col++;
                pos.row = 1;
            }
            if (!this._isWithinBoundsX(pos, dims)) {
                pos.row++;
                pos.col = 1;
            }
        }
        return pos;
    };
    NgGrid.prototype._isWithinBoundsX = function (pos, dims) {
        return (this._maxCols == 0 || (pos.col + dims.x - 1) <= this._maxCols);
    };
    NgGrid.prototype._isWithinBoundsY = function (pos, dims) {
        return (this._maxRows == 0 || (pos.row + dims.y - 1) <= this._maxRows);
    };
    NgGrid.prototype._isWithinBounds = function (pos, dims) {
        return this._isWithinBoundsX(pos, dims) && this._isWithinBoundsY(pos, dims);
    };
    NgGrid.prototype._addToGrid = function (item) {
        var pos = item.getGridPosition();
        var dims = item.getSize();
        if (this._hasGridCollision(pos, dims)) {
            this._fixGridCollisions(pos, dims);
            pos = item.getGridPosition();
        }
        for (var j = 0; j < dims.y; j++) {
            if (this._itemGrid[pos.row + j] == null)
                this._itemGrid[pos.row + j] = {};
            for (var i = 0; i < dims.x; i++) {
                this._itemGrid[pos.row + j][pos.col + i] = item;
                this._updateSize(pos.col + dims.x - 1, pos.row + dims.y - 1);
            }
        }
    };
    NgGrid.prototype._removeFromGrid = function (item) {
        for (var y in this._itemGrid)
            for (var x in this._itemGrid[y])
                if (this._itemGrid[y][x] == item)
                    delete this._itemGrid[y][x];
    };
    NgGrid.prototype._updateSize = function (col, row) {
        if (this._destroyed)
            return;
        col = (col == undefined) ? this._getMaxCol() : col;
        row = (row == undefined) ? this._getMaxRow() : row;
        var maxCol = Math.max(this._curMaxCol, col);
        var maxRow = Math.max(this._curMaxRow, row);
        if (maxCol != this._curMaxCol || maxRow != this._curMaxRow) {
            this._curMaxCol = maxCol;
            this._curMaxRow = maxRow;
            this._renderer.setElementStyle(this._ngEl.nativeElement, 'width', '100%'); //(maxCol * (this.colWidth + this.marginLeft + this.marginRight))+'px');
            this._renderer.setElementStyle(this._ngEl.nativeElement, 'height', (this._curMaxRow * (this.rowHeight + this.marginTop + this.marginBottom)) + 'px');
        }
    };
    NgGrid.prototype._getMaxRow = function () {
        return Math.max.apply(null, this._items.map(function (item) { return item.getGridPosition().row + item.getSize().y - 1; }));
    };
    NgGrid.prototype._getMaxCol = function () {
        return Math.max.apply(null, this._items.map(function (item) { return item.getGridPosition().col + item.getSize().x - 1; }));
    };
    NgGrid.prototype._getMousePosition = function (e) {
        if ((window.TouchEvent && e instanceof TouchEvent) || (e.touches || e.changedTouches)) {
            e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
        }
        var refPos = this._ngEl.nativeElement.getBoundingClientRect();
        var left = e.clientX - refPos.left;
        var top = e.clientY - refPos.top;
        if (this.cascade == 'down')
            top = refPos.top + refPos.height - e.clientY;
        if (this.cascade == 'right')
            left = refPos.left + refPos.width - e.clientX;
        if (this.isDragging && this._zoomOnDrag) {
            left *= 2;
            top *= 2;
        }
        return {
            left: left,
            top: top
        };
    };
    NgGrid.prototype._getAbsoluteMousePosition = function (e) {
        if ((window.TouchEvent && e instanceof TouchEvent) || (e.touches || e.changedTouches)) {
            e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
        }
        return {
            left: e.clientX,
            top: e.clientY
        };
    };
    NgGrid.prototype._getContainerColumns = function () {
        var maxWidth = this._ngEl.nativeElement.getBoundingClientRect().width;
        return Math.floor(maxWidth / (this.colWidth + this.marginLeft + this.marginRight));
    };
    NgGrid.prototype._getItemFromPosition = function (position) {
        for (var _i = 0, _a = this._items; _i < _a.length; _i++) {
            var item = _a[_i];
            var size = item.getDimensions();
            var pos = item.getPosition();
            if (position.left > (pos.left + this.marginLeft) && position.left < (pos.left + this.marginLeft + size.width) &&
                position.top > (pos.top + this.marginTop) && position.top < (pos.top + this.marginTop + size.height)) {
                return item;
            }
        }
        return null;
    };
    NgGrid.prototype._createPlaceholder = function (item) {
        var pos = item.getGridPosition();
        var dims = item.getSize();
        var factory = this.componentFactoryResolver.resolveComponentFactory(NgGridPlaceholder_1.NgGridPlaceholder);
        var componentRef = item.containerRef.createComponent(factory);
        this._placeholderRef = componentRef;
        var placeholder = componentRef.instance;
        placeholder.registerGrid(this);
        placeholder.setCascadeMode(this.cascade);
        placeholder.setGridPosition({ col: pos.col, row: pos.row });
        placeholder.setSize({ x: dims.x, y: dims.y });
    };
    //	Default config
    NgGrid.CONST_DEFAULT_CONFIG = {
        margins: [10],
        draggable: true,
        resizable: true,
        max_cols: 0,
        max_rows: 0,
        visible_cols: 0,
        visible_rows: 0,
        col_width: 250,
        row_height: 250,
        cascade: 'up',
        min_width: 100,
        min_height: 100,
        fix_to_grid: false,
        auto_style: true,
        auto_resize: false,
        maintain_ratio: false,
        prefer_new: false,
        zoom_on_drag: false
    };
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], NgGrid.prototype, "onDragStart", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], NgGrid.prototype, "onDrag", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], NgGrid.prototype, "onDragStop", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], NgGrid.prototype, "onResizeStart", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], NgGrid.prototype, "onResize", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], NgGrid.prototype, "onResizeStop", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], NgGrid.prototype, "onItemChange", void 0);
    NgGrid = __decorate([
        core_1.Directive({
            selector: '[ngGrid]',
            inputs: ['config: ngGrid'],
            host: {
                '(mousedown)': '_onMouseDown($event)',
                '(mousemove)': '_onMouseMove($event)',
                '(mouseup)': '_onMouseUp($event)',
                '(touchstart)': '_onMouseDown($event)',
                '(touchmove)': '_onMouseMove($event)',
                '(touchend)': '_onMouseUp($event)',
                '(window:resize)': '_onResize($event)',
                '(document:mousemove)': '_onMouseMove($event)',
                '(document:mouseup)': '_onMouseUp($event)'
            },
        }), 
        __metadata('design:paramtypes', [core_1.KeyValueDiffers, core_1.ElementRef, core_1.Renderer, core_1.ComponentFactoryResolver, core_1.ViewContainerRef])
    ], NgGrid);
    return NgGrid;
}());
exports.NgGrid = NgGrid;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRpcmVjdGl2ZXMvTmdHcmlkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxxQkFBdU8sZUFBZSxDQUFDLENBQUE7QUFHdlAsa0NBQWtDLGlDQUFpQyxDQUFDLENBQUE7QUFpQnBFO0lBMkZDLGNBQWM7SUFDZCxnQkFBb0IsUUFBeUIsRUFDbEMsS0FBaUIsRUFDakIsU0FBbUIsRUFDbkIsd0JBQWtELEVBQ2xELGFBQStCO1FBSnRCLGFBQVEsR0FBUixRQUFRLENBQWlCO1FBQ2xDLFVBQUssR0FBTCxLQUFLLENBQVk7UUFDakIsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUNuQiw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBQ2xELGtCQUFhLEdBQWIsYUFBYSxDQUFrQjtRQS9GMUMsaUJBQWlCO1FBQ0EsZ0JBQVcsR0FBNkIsSUFBSSxtQkFBWSxFQUFjLENBQUM7UUFDdkUsV0FBTSxHQUE2QixJQUFJLG1CQUFZLEVBQWMsQ0FBQztRQUNsRSxlQUFVLEdBQTZCLElBQUksbUJBQVksRUFBYyxDQUFDO1FBQ3RFLGtCQUFhLEdBQTZCLElBQUksbUJBQVksRUFBYyxDQUFDO1FBQ3pFLGFBQVEsR0FBNkIsSUFBSSxtQkFBWSxFQUFjLENBQUM7UUFDcEUsaUJBQVksR0FBNkIsSUFBSSxtQkFBWSxFQUFjLENBQUM7UUFDeEUsaUJBQVksR0FBeUMsSUFBSSxtQkFBWSxFQUEwQixDQUFDO1FBRWpILG1CQUFtQjtRQUNaLGFBQVEsR0FBVyxHQUFHLENBQUM7UUFDdkIsY0FBUyxHQUFXLEdBQUcsQ0FBQztRQUN4QixZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBQ3BCLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFDcEIsY0FBUyxHQUFXLEVBQUUsQ0FBQztRQUN2QixnQkFBVyxHQUFXLEVBQUUsQ0FBQztRQUN6QixpQkFBWSxHQUFXLEVBQUUsQ0FBQztRQUMxQixlQUFVLEdBQVcsRUFBRSxDQUFDO1FBQ3hCLGVBQVUsR0FBWSxLQUFLLENBQUM7UUFDNUIsZUFBVSxHQUFZLEtBQUssQ0FBQztRQUM1QixjQUFTLEdBQVksSUFBSSxDQUFDO1FBQzFCLGlCQUFZLEdBQVksSUFBSSxDQUFDO1FBQzdCLGVBQVUsR0FBWSxJQUFJLENBQUM7UUFDM0IsWUFBTyxHQUFXLElBQUksQ0FBQztRQUN2QixhQUFRLEdBQVcsR0FBRyxDQUFDO1FBQ3ZCLGNBQVMsR0FBVyxHQUFHLENBQUM7UUFFL0Isb0JBQW9CO1FBQ1osV0FBTSxHQUFzQixFQUFFLENBQUM7UUFDL0Isa0JBQWEsR0FBZSxJQUFJLENBQUM7UUFDakMsa0JBQWEsR0FBZSxJQUFJLENBQUM7UUFDakMscUJBQWdCLEdBQVcsSUFBSSxDQUFDO1FBQ2hDLGNBQVMsR0FBcUQsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUdqRixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBQ3JCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFDekIsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFDekIsY0FBUyxHQUFXLEdBQUcsQ0FBQztRQUN4QixlQUFVLEdBQVcsR0FBRyxDQUFDO1FBQ3pCLGVBQVUsR0FBc0IsSUFBSSxDQUFDO1FBQ3JDLFlBQU8sR0FBWSxLQUFLLENBQUM7UUFDekIsb0JBQWUsR0FBb0MsSUFBSSxDQUFDO1FBQ3hELGVBQVUsR0FBWSxLQUFLLENBQUM7UUFDNUIsZ0JBQVcsR0FBWSxLQUFLLENBQUM7UUFFN0IsZUFBVSxHQUFZLEtBQUssQ0FBQztRQUM1QixtQkFBYyxHQUFZLEtBQUssQ0FBQztRQUVoQyxlQUFVLEdBQVksS0FBSyxDQUFDO1FBQzVCLGdCQUFXLEdBQVksS0FBSyxDQUFDO1FBQzdCLG1CQUFjLEdBQVksS0FBSyxDQUFDO1FBQ2hDLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFDdkIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUN2QixlQUFVLEdBQVksS0FBSyxDQUFDO1FBQzVCLGlCQUFZLEdBQVksS0FBSyxDQUFDO1FBdUI5QixZQUFPLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0lBZ0JELENBQUM7SUFiOUMsc0JBQUksMEJBQU07UUFEViw4QkFBOEI7YUFDOUIsVUFBVyxDQUFlO1lBQ3pCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFbEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5RCxDQUFDO1FBQ0YsQ0FBQzs7O09BQUE7SUFTRCxpQkFBaUI7SUFDVix5QkFBUSxHQUFmO1FBQ0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7WUFBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDckcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVNLDRCQUFXLEdBQWxCO1FBQ0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDeEIsQ0FBQztJQUVNLDBCQUFTLEdBQWhCLFVBQWlCLE1BQW9CO1FBQ3BDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBRXRCLElBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksTUFBTSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFdEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWCxLQUFLLFNBQVM7b0JBQ2IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDckIsS0FBSyxDQUFDO2dCQUNQLEtBQUssV0FBVztvQkFDZixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNwQyxLQUFLLENBQUM7Z0JBQ1AsS0FBSyxZQUFZO29CQUNoQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNyQyxLQUFLLENBQUM7Z0JBQ1AsS0FBSyxZQUFZO29CQUNoQixJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO29CQUNwQyxLQUFLLENBQUM7Z0JBQ1AsS0FBSyxhQUFhO29CQUNqQixJQUFJLENBQUMsV0FBVyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO29CQUN0QyxLQUFLLENBQUM7Z0JBQ1AsS0FBSyxXQUFXO29CQUNmLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUM7b0JBQ3JDLEtBQUssQ0FBQztnQkFDUCxLQUFLLFdBQVc7b0JBQ2YsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQztvQkFDdkMsS0FBSyxDQUFDO2dCQUNQLEtBQUssVUFBVTtvQkFDZCxnQkFBZ0IsR0FBRyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQztvQkFDL0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUM7b0JBQ3hDLEtBQUssQ0FBQztnQkFDUCxLQUFLLFVBQVU7b0JBQ2QsZ0JBQWdCLEdBQUcsZ0JBQWdCLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUM7b0JBQy9ELElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDO29CQUN4QyxLQUFLLENBQUM7Z0JBQ1AsS0FBSyxjQUFjO29CQUNsQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN4QyxLQUFLLENBQUM7Z0JBQ1AsS0FBSyxjQUFjO29CQUNsQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN4QyxLQUFLLENBQUM7Z0JBQ1AsS0FBSyxVQUFVO29CQUNkLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ25DLEtBQUssQ0FBQztnQkFDUCxLQUFLLFVBQVU7b0JBQ2QsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDbkMsS0FBSyxDQUFDO2dCQUNQLEtBQUssWUFBWTtvQkFDaEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDckMsS0FBSyxDQUFDO2dCQUNQLEtBQUssV0FBVztvQkFDZixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNwQyxLQUFLLENBQUM7Z0JBQ1AsS0FBSyxjQUFjO29CQUNsQixJQUFJLENBQUMsV0FBVyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO29CQUN0QyxLQUFLLENBQUM7Z0JBQ1AsS0FBSyxTQUFTO29CQUNiLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDekIsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7d0JBQ25CLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztvQkFDckIsQ0FBQztvQkFDRCxLQUFLLENBQUM7Z0JBQ1AsS0FBSyxhQUFhO29CQUNqQixJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO29CQUNyQyxLQUFLLENBQUM7Z0JBQ1AsS0FBSyxnQkFBZ0I7b0JBQ3BCLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUM7b0JBQ3pDLEtBQUssQ0FBQztnQkFDUCxLQUFLLFlBQVk7b0JBQ2hCLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUM7b0JBQ3JDLEtBQUssQ0FBQztnQkFDUCxLQUFLLGlCQUFpQjtvQkFDckIsSUFBSSxDQUFDLGNBQWMsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQztvQkFDekMsS0FBSyxDQUFDO1lBQ1IsQ0FBQztRQUNGLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUN6QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUNwRCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7WUFDN0IsQ0FBQztRQUNGLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDdEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDdEIsS0FBSyxNQUFNLENBQUM7b0JBQ1osS0FBSyxPQUFPO3dCQUNYLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO3dCQUNsQixLQUFLLENBQUM7b0JBQ1AsS0FBSyxJQUFJLENBQUM7b0JBQ1YsS0FBSyxNQUFNLENBQUM7b0JBQ1o7d0JBQ0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7d0JBQ2xCLEtBQUssQ0FBQztnQkFDUixDQUFDO1lBQ0YsQ0FBQztZQUVELEdBQUcsQ0FBQyxDQUFhLFVBQVcsRUFBWCxLQUFBLElBQUksQ0FBQyxNQUFNLEVBQVgsY0FBVyxFQUFYLElBQVcsQ0FBQztnQkFBeEIsSUFBSSxJQUFJLFNBQUE7Z0JBQ1osSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUNqQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBRTFCLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRTNCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ2pELElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztvQkFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDcEIsQ0FBQztnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDeEQsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO29CQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwQixDQUFDO2dCQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzNFLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ25ELElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ25DLENBQUM7Z0JBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN0QjtZQUVELElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNyQixDQUFDO1FBRUQsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFMUIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzdDLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUUvQyxFQUFFLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1lBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUNuRixFQUFFLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUV4RixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDbkgsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBRXZILEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ3hFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBRXhFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUVwQixHQUFHLENBQUMsQ0FBYSxVQUFXLEVBQVgsS0FBQSxJQUFJLENBQUMsTUFBTSxFQUFYLGNBQVcsRUFBWCxJQUFXLENBQUM7WUFBeEIsSUFBSSxJQUFJLFNBQUE7WUFDWixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2xDO1FBRUQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRXBCLEdBQUcsQ0FBQyxDQUFhLFVBQVcsRUFBWCxLQUFBLElBQUksQ0FBQyxNQUFNLEVBQVgsY0FBVyxFQUFYLElBQVcsQ0FBQztZQUF4QixJQUFJLElBQUksU0FBQTtZQUNaLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3RCO1FBRUQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBRU0sZ0NBQWUsR0FBdEIsVUFBdUIsS0FBYTtRQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUM3QyxDQUFDO0lBRU0sNEJBQVcsR0FBbEIsVUFBbUIsS0FBYTtRQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRU0sMEJBQVMsR0FBaEI7UUFDQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTlDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUU1QixNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2IsQ0FBQztRQUNGLENBQUM7UUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVNLDJCQUFVLEdBQWpCLFVBQWtCLE9BQXNCO1FBQ3ZDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzVGLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUM3RixJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDN0YsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzlGLENBQUM7SUFFTSwyQkFBVSxHQUFqQjtRQUNDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0lBQ3hCLENBQUM7SUFFTSw0QkFBVyxHQUFsQjtRQUNDLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0lBQ3pCLENBQUM7SUFFTSw2QkFBWSxHQUFuQjtRQUNDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFFTSw4QkFBYSxHQUFwQjtRQUNDLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO0lBQzNCLENBQUM7SUFFTSx3QkFBTyxHQUFkLFVBQWUsTUFBa0I7UUFDaEMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUN0QixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQy9FLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEIsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3pCLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRU0sMkJBQVUsR0FBakIsVUFBa0IsTUFBa0I7UUFDbkMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUU3QixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDckQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUIsQ0FBQztRQUNGLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBRTVCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFnQixJQUFLLE9BQUEsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUF0QixDQUFzQixDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVNLDJCQUFVLEdBQWpCLFVBQWtCLE1BQWtCO1FBQ25DLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRU0sK0JBQWMsR0FBckI7UUFDQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELGtCQUFrQjtJQUNWLG1DQUFrQixHQUExQjtRQUNDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUNwRSxJQUFJLFFBQVEsR0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssQ0FBQztnQkFFOUUsSUFBSSxRQUFRLEdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUM7Z0JBQ3RELFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNqRCxFQUFFLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO29CQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO2dCQUUzQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQzNFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzFGLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUM7SUFFTyxvQ0FBbUIsR0FBM0I7UUFDQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN0QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztnQkFDcEUsSUFBSSxTQUFTLEdBQVcsTUFBTSxDQUFDLFdBQVcsQ0FBQztnQkFFM0MsSUFBSSxTQUFTLEdBQVcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2xGLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNsRCxFQUFFLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO29CQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO2dCQUU5QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQzdFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVGLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUM7SUFFTyw2QkFBWSxHQUFwQjtRQUNDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDN0MsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztZQUNwRCxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDcEQsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7Z0JBQ3BELENBQUM7Z0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ3BELENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUM7SUFFTyw2QkFBWSxHQUFwQjtRQUNDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7UUFDOUMsQ0FBQztJQUNGLENBQUM7SUFFTywwQkFBUyxHQUFqQixVQUFrQixDQUFNO1FBQ3ZCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBRTNCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUVwQixHQUFHLENBQUMsQ0FBYSxVQUFXLEVBQVgsS0FBQSxJQUFJLENBQUMsTUFBTSxFQUFYLGNBQVcsRUFBWCxJQUFXLENBQUM7WUFBeEIsSUFBSSxJQUFJLFNBQUE7WUFDWixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzNCO1FBRUQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRXBCLEdBQUcsQ0FBQyxDQUFhLFVBQVcsRUFBWCxLQUFBLElBQUksQ0FBQyxNQUFNLEVBQVgsY0FBVyxFQUFYLElBQVcsQ0FBQztZQUF4QixJQUFJLElBQUksU0FBQTtZQUNaLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1NBQ3ZCO1FBRUQsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3BCLENBQUM7SUFFTyw4QkFBYSxHQUFyQixVQUFzQixPQUFZO1FBQWxDLGlCQU1DO1FBTEEsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFVBQUMsTUFBVyxJQUFPLEtBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvRixPQUFPLENBQUMsa0JBQWtCLENBQUMsVUFBQyxNQUFXLElBQU8sS0FBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxVQUFDLE1BQVcsSUFBTyxPQUFPLEtBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbEYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVPLDZCQUFZLEdBQXBCLFVBQXFCLENBQU07UUFDMUIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUUvQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNsQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztZQUMxQixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLENBQUM7UUFDRixDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNiLENBQUM7SUFFTyw2QkFBWSxHQUFwQixVQUFxQixDQUFNO1FBQzFCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFL0MsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1lBQzFCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBRTFCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzNCLENBQUM7SUFDRixDQUFDO0lBRU8sMkJBQVUsR0FBbEIsVUFBbUIsQ0FBTTtRQUN4QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9DLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNqQyxJQUFJLE9BQU8sR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUE7WUFFN0YsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1lBQzFCLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDO1lBQzFCLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBRXhCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBRXhCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDakIsQ0FBQztRQUNGLENBQUM7SUFDRixDQUFDO0lBRU8seUJBQVEsR0FBaEI7UUFDQyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUMxRixDQUFDO0lBRU8sMkJBQVUsR0FBbEI7UUFDQyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVPLDZCQUFZLEdBQXBCLFVBQXFCLENBQU07UUFDMUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFDeEIsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDM0IsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkIsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNmLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDUCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRS9DLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ1YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixDQUFDO1FBQ0YsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRU8sc0JBQUssR0FBYixVQUFjLENBQU07UUFDbkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDZCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDdEIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQzlCLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDbEMsQ0FBQztnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7b0JBQy9DLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDNUMsQ0FBQztZQUNMLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQU8sUUFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLFFBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDdEMsQ0FBQztZQUFBLENBQUM7WUFDVCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEQsSUFBSSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFaEQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNuRCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3RELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFeEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUN6QyxPQUFPLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRTVDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDekMsT0FBTyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUU1QyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDOUQsT0FBTyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzFELENBQUM7WUFDRixDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzlELElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzdELElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFdkQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUM3QyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDbEMsQ0FBQztZQUNGLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDNUMsQ0FBQztZQUVELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2xDLENBQUM7SUFDRixDQUFDO0lBRU8sd0JBQU8sR0FBZixVQUFnQixDQUFNO1FBQ3JCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ2QsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUM5QixNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2xDLENBQUM7Z0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO29CQUMvQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQzVDLENBQUM7WUFDTCxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFPLFFBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixRQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3RDLENBQUM7WUFBQSxDQUFDO1lBQ1QsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDL0MsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNsRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLElBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDcEcsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRWxHLEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUN4QixJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUN0QixFQUFFLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDekIsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDdkIsRUFBRSxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO2dCQUN0QyxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUM7WUFDcEMsRUFBRSxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDO2dCQUN2QyxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUM7WUFFckMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNuRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzVDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLENBQUM7WUFFcEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUM5QyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWpELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDOUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVqRCxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFbEQsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFELElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUVoRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDaEUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ2xELElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUN2QyxDQUFDO1lBQ0YsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRTlDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBRWpILEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxRQUFRLENBQUM7Z0JBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDN0UsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixJQUFJLE9BQU8sQ0FBQztnQkFBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUU1RSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNwQyxDQUFDO0lBQ0YsQ0FBQztJQUVPLDJCQUFVLEdBQWxCLFVBQW1CLENBQU07UUFDeEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQixNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNiLENBQUM7SUFFTywwQkFBUyxHQUFqQixVQUFrQixDQUFNO1FBQ3ZCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBRXhCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLENBQUM7WUFFbkQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFcEMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBRXBCLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNyQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFDMUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdkIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUUvQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQWdCLElBQUssT0FBQSxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQXJCLENBQXFCLENBQUMsQ0FBQyxDQUFDO1lBRXJGLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbkIsQ0FBQztRQUNGLENBQUM7SUFDRixDQUFDO0lBRU8sNEJBQVcsR0FBbkIsVUFBb0IsQ0FBTTtRQUN6QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztZQUV4QixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRTVDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXBDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUVwQixJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFDMUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztZQUM3QixJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRS9CLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUMsSUFBZ0IsSUFBSyxPQUFBLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBckIsQ0FBcUIsQ0FBQyxDQUFDLENBQUM7UUFDdEYsQ0FBQztJQUNGLENBQUM7SUFFTyw2QkFBWSxHQUFwQixVQUFxQixDQUFTLEVBQUUsQ0FBUztRQUN4QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNoRixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUNqRixNQUFNLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0lBRU8sbUNBQWtCLEdBQTFCLFVBQTJCLEtBQWEsRUFBRSxNQUFjO1FBQ3ZELEtBQUssSUFBSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDNUMsTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztRQUU3QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUvRyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzlGLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFFOUYsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVPLHVDQUFzQixHQUE5QixVQUErQixJQUFZLEVBQUUsR0FBVztRQUN2RCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNuRyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVuRyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3hGLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFFeEYsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVPLGtDQUFpQixHQUF6QixVQUEwQixHQUF1QixFQUFFLElBQW9CO1FBQ3RFLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRS9DLEVBQUUsQ0FBQyxDQUFDLFNBQVMsSUFBSSxJQUFJLElBQUksU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBRTdELE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBYTtZQUNuQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFTywrQkFBYyxHQUF0QixVQUF1QixHQUF1QixFQUFFLElBQW9CO1FBQ25FLElBQU0sT0FBTyxHQUFzQixFQUFFLENBQUM7UUFFdEMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDekMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3pDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUN6QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUN0RCxJQUFNLElBQUksR0FBZSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFFbEUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBQzdCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBRXBCLElBQU0sT0FBTyxHQUF1QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7d0JBQzNELElBQU0sUUFBUSxHQUFtQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBRWhELENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztvQkFDeEMsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFFTyxtQ0FBa0IsR0FBMUIsVUFBMkIsR0FBdUIsRUFBRSxJQUFvQixFQUFFLFVBQTJCO1FBQTNCLDBCQUEyQixHQUEzQixrQkFBMkI7UUFDcEcsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDMUMsSUFBTSxVQUFVLEdBQXNCLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRXJFLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFcEMsSUFBTSxPQUFPLEdBQXVCLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNwRSxJQUFNLFFBQVEsR0FBbUIsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRXpELE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixLQUFLLElBQUksQ0FBQztnQkFDVixLQUFLLE1BQU0sQ0FBQztnQkFDWjtvQkFDQyxJQUFNLE1BQU0sR0FBVyxPQUFPLENBQUMsR0FBRyxDQUFDO29CQUNuQyxPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFFL0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDL0MsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQy9CLE9BQU8sQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDO29CQUN0QixDQUFDO29CQUNELEtBQUssQ0FBQztnQkFDUCxLQUFLLE1BQU0sQ0FBQztnQkFDWixLQUFLLE9BQU87b0JBQ1gsSUFBTSxNQUFNLEdBQVcsT0FBTyxDQUFDLEdBQUcsQ0FBQztvQkFDbkMsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBRS9CLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQy9DLE9BQU8sQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDO3dCQUNyQixPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDaEMsQ0FBQztvQkFDRCxLQUFLLENBQUM7WUFDUixDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDaEIsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNyQyxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ1AsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBRUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDaEMsQ0FBQztJQUNGLENBQUM7SUFFTywyQkFBVSxHQUFsQixVQUFtQixPQUFlO1FBQ2pDLElBQU0sS0FBSyxHQUFzQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRXJELEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFhLEVBQUUsQ0FBYTtZQUN2QyxJQUFJLElBQUksR0FBdUIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDcEQsSUFBSSxJQUFJLEdBQXVCLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBRXBELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2xFLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDUCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyQyxDQUFDO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFNLFNBQVMsR0FBOEIsRUFBRSxDQUFDO1FBQ2hELElBQU0sVUFBVSxHQUE4QixFQUFFLENBQUM7UUFFakQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMzQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkIsQ0FBQztRQUVELElBQU0sTUFBTSxHQUF1QixFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3RELElBQUksVUFBVSxHQUFXLENBQUMsQ0FBQztRQUUzQixJQUFNLFdBQVcsR0FBK0MsVUFBQyxJQUFnQixFQUFFLEdBQVc7WUFDN0YsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQVcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNyRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDO29CQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDN0MsQ0FBQztZQUVELE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDZCxDQUFDLENBQUM7UUFRRixPQUFPLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDekIsSUFBTSxPQUFPLEdBQXFCLEVBQUUsQ0FBQztZQUNyQyxJQUFJLFFBQVEsR0FBYztnQkFDekIsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsR0FBRyxFQUFFLENBQUM7Z0JBQ04sTUFBTSxFQUFFLENBQUM7YUFDVCxDQUFDO1lBRUYsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQVcsQ0FBQyxFQUFFLEdBQUcsSUFBSSxPQUFPLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztnQkFDakQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBQ2xDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDMUIsUUFBUSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7b0JBQ3RCLENBQUM7b0JBRUQsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNsQixRQUFRLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ3hCLENBQUM7Z0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFFdkIsUUFBUSxHQUFHO3dCQUNWLEtBQUssRUFBRSxHQUFHO3dCQUNWLEdBQUcsRUFBRSxHQUFHO3dCQUNSLE1BQU0sRUFBRSxDQUFDO3FCQUNULENBQUM7Z0JBQ0gsQ0FBQztZQUNGLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDeEIsQ0FBQztZQUVELElBQUksV0FBVyxHQUFrQixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUMsS0FBZ0IsSUFBSyxPQUFBLEtBQUssQ0FBQyxNQUFNLEVBQVosQ0FBWSxDQUFDLENBQUM7WUFDakYsSUFBTSxZQUFZLEdBQXNCLEVBQUUsQ0FBQztZQUUzQyxPQUFPLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pCLElBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUM7b0JBQUMsS0FBSyxDQUFDO2dCQUVqQyxJQUFJLElBQUksR0FBWSxLQUFLLENBQUM7Z0JBQzFCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7b0JBQzNCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDbEMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUM7d0JBQzdCLElBQUksR0FBRyxJQUFJLENBQUM7d0JBQ1osS0FBSyxDQUFDO29CQUNQLENBQUM7b0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDeEMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDcEIsQ0FBQztnQkFDRixDQUFDO2dCQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ1YsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDbEMsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDUCxLQUFLLENBQUM7Z0JBQ1AsQ0FBQztZQUNGLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLElBQU0sYUFBYSxHQUFrQixFQUFFLENBQUM7Z0JBQ3hDLElBQUksWUFBWSxHQUFXLE9BQU8sQ0FBQztnQkFFbkMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNuRCxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7b0JBRXBCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzt3QkFDOUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUM7NEJBQUMsUUFBUSxDQUFDO3dCQUM5QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFBQyxRQUFRLENBQUM7d0JBQ25FLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQzs0QkFBQyxRQUFRLENBQUM7d0JBQ3hELEVBQUUsQ0FBQyxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDOzRCQUFDLFFBQVEsQ0FBQzt3QkFFekcsV0FBVyxHQUFHLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsWUFBWSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFBO3dCQUNyRyxLQUFLLENBQUM7b0JBQ1AsQ0FBQztvQkFFRCxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxVQUFVLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDdEcsWUFBWSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakMsQ0FBQztnQkFFRCxJQUFJLFdBQVcsR0FBVyxDQUFDLENBQUM7Z0JBQzVCLElBQUksV0FBVyxHQUFXLENBQUMsQ0FBQztnQkFFNUIsT0FBTyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUNoQyxJQUFNLElBQUksR0FBZSxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBRTlDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUN6QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7NEJBQUMsUUFBUSxDQUFDO3dCQUM3QyxFQUFFLENBQUMsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQzs0QkFBQyxRQUFRLENBQUM7d0JBQzNDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDOzRCQUFDLFFBQVEsQ0FBQzt3QkFDNUYsRUFBRSxDQUFDLENBQUMsV0FBVyxHQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7NEJBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7d0JBQ3BFLEtBQUssQ0FBQztvQkFDUCxDQUFDO29CQUVELElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7b0JBRWxHLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7b0JBQzNDLFdBQVcsRUFBRSxDQUFDO29CQUVkLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFXLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUM3RSxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO29CQUM3QyxDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDOUYsSUFBTSxJQUFJLEdBQWUsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUV2QyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztnQkFFbEQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQVcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQzdFLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQzdDLENBQUM7WUFDRixDQUFDO1lBRUQsSUFBSSxNQUFNLEdBQVcsQ0FBQyxDQUFDO1lBRXZCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3pFLE1BQU0sR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZCLENBQUM7WUFDRixDQUFDO1lBRUQsVUFBVSxHQUFHLE1BQU0sSUFBSSxVQUFVLEdBQUcsVUFBVSxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUM7UUFDN0QsQ0FBQztJQUNGLENBQUM7SUFFTyw2QkFBWSxHQUFwQixVQUFxQixHQUF3QixFQUFFLElBQXFCLEVBQUUsVUFBMEI7UUFBMUIsMEJBQTBCLEdBQTFCLGlCQUEwQjtRQUMvRixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQzVCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsc0RBQXNELENBQUMsQ0FBQztRQUUxRixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzVELEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzNDLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3JDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNuRSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUMzQyxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNyQyxDQUFDO1FBRUQsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDdEIsS0FBSyxJQUFJLENBQUM7WUFDVixLQUFLLE1BQU07Z0JBQ1YsSUFBTSxNQUFNLEdBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRWxDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUU7b0JBQ2hELE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRWYsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ25ELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDO3dCQUFDLFFBQVEsQ0FBQztvQkFFN0MsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQ25ELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDOzRCQUFDLEtBQUssQ0FBQzt3QkFDMUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFBQyxRQUFRLENBQUM7d0JBRTVCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQzs0QkFDbEMsSUFBTSxJQUFJLEdBQWUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDOUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQ0FBQyxRQUFRLENBQUM7NEJBRTNCLElBQU0sUUFBUSxHQUFtQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7NEJBQ2hELElBQU0sT0FBTyxHQUF1QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7NEJBRTNELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO2dDQUFDLFFBQVEsQ0FBQyxDQUFDLHFDQUFxQzs0QkFFekYsSUFBSSxNQUFNLEdBQVcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUUvQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQ0FDN0MsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7NEJBQzVDLENBQUM7NEJBRUQsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDakUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQ0FDM0MsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDO3dDQUNqQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0NBQzdELE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUF3QixvQ0FBb0M7Z0NBQ3pHLENBQUM7NEJBQ0YsQ0FBQzs0QkFFRCxJQUFNLE1BQU0sR0FBdUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQzs0QkFFM0QsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ3RFLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0NBRTNCLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0NBQ2hCLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7Z0NBQzNCLENBQUM7Z0NBQUMsSUFBSSxDQUFDLENBQUM7b0NBQ1AsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQ0FDOUIsQ0FBQztnQ0FFRCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7Z0NBQ3RCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ3ZCLENBQUM7NEJBRUQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0NBQzdDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyw2Q0FBNkM7NEJBQ25GLENBQUM7d0JBQ0YsQ0FBQztvQkFDRixDQUFDO2dCQUNGLENBQUM7Z0JBQ0QsS0FBSyxDQUFDO1lBQ1AsS0FBSyxNQUFNLENBQUM7WUFDWixLQUFLLE9BQU87Z0JBQ1gsSUFBTSxNQUFNLEdBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRWxDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUU7b0JBQ2hELE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRWYsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ25ELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDO3dCQUFDLFFBQVEsQ0FBQztvQkFFN0MsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQ25ELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDOzRCQUFDLEtBQUssQ0FBQzt3QkFDMUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFBQyxRQUFRLENBQUM7d0JBRTVCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQzs0QkFDbEMsSUFBTSxJQUFJLEdBQWUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDOUMsSUFBTSxRQUFRLEdBQW1CLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzs0QkFDaEQsSUFBTSxPQUFPLEdBQXVCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQzs0QkFFM0QsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0NBQUMsUUFBUSxDQUFDLENBQUMscUNBQXFDOzRCQUV6RixJQUFJLE1BQU0sR0FBVyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBRS9CLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dDQUM3QyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQzs0QkFDNUMsQ0FBQzs0QkFFRCxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUNqRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29DQUMzQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUM7d0NBQ2pDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQ0FDN0QsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQXdCLG9DQUFvQztnQ0FDekcsQ0FBQzs0QkFDRixDQUFDOzRCQUVELElBQU0sTUFBTSxHQUF1QixFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDOzRCQUUzRCxFQUFFLENBQUMsQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDdEUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQ0FFM0IsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztvQ0FDaEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQ0FDM0IsQ0FBQztnQ0FBQyxJQUFJLENBQUMsQ0FBQztvQ0FDUCxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dDQUM5QixDQUFDO2dDQUVELElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQ0FDdEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDdkIsQ0FBQzs0QkFFRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQ0FDN0MsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLDZDQUE2Qzs0QkFDbkYsQ0FBQzt3QkFDRixDQUFDO29CQUNGLENBQUM7Z0JBQ0YsQ0FBQztnQkFDRCxLQUFLLENBQUM7WUFDUDtnQkFDQyxLQUFLLENBQUM7UUFDUixDQUFDO0lBQ0YsQ0FBQztJQUVPLGlDQUFnQixHQUF4QixVQUF5QixHQUF1QixFQUFFLElBQW9CO1FBQ3JFLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDOUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUN0QixLQUFLLElBQUksQ0FBQztvQkFDVixLQUFLLE1BQU0sQ0FBQztvQkFDWjt3QkFDQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7d0JBQ1YsS0FBSyxDQUFDO29CQUNQLEtBQUssTUFBTSxDQUFDO29CQUNaLEtBQUssT0FBTzt3QkFDWCxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7d0JBQ1YsS0FBSyxDQUFDO2dCQUNSLENBQUM7WUFDRixDQUFDO1lBR0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNWLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ2IsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDVixHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNiLENBQUM7UUFDRixDQUFDO1FBQ0QsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFFTyxpQ0FBZ0IsR0FBeEIsVUFBeUIsR0FBdUIsRUFBRSxJQUFvQjtRQUNyRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUNPLGlDQUFnQixHQUF4QixVQUF5QixHQUF1QixFQUFFLElBQW9CO1FBQ3JFLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBQ08sZ0NBQWUsR0FBdkIsVUFBd0IsR0FBdUIsRUFBRSxJQUFvQjtRQUNwRSxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFFTywyQkFBVSxHQUFsQixVQUFtQixJQUFnQjtRQUNsQyxJQUFJLEdBQUcsR0FBdUIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3JELElBQU0sSUFBSSxHQUFtQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFNUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNuQyxHQUFHLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzlCLENBQUM7UUFFRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN6QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO2dCQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFMUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztnQkFFaEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM5RCxDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUM7SUFFTyxnQ0FBZSxHQUF2QixVQUF3QixJQUFnQjtRQUN2QyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQzVCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO29CQUNoQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVPLDRCQUFXLEdBQW5CLFVBQW9CLEdBQVksRUFBRSxHQUFZO1FBQzdDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7WUFBQyxNQUFNLENBQUM7UUFDNUIsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxHQUFHLENBQUM7UUFDbkQsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxHQUFHLENBQUM7UUFFbkQsSUFBSSxNQUFNLEdBQVcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3BELElBQUksTUFBTSxHQUFXLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUVwRCxFQUFFLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDNUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7WUFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7WUFFekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUEsd0VBQXdFO1lBQ2xKLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDdEosQ0FBQztJQUNGLENBQUM7SUFFTywyQkFBVSxHQUFsQjtRQUNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFnQixJQUFLLE9BQUEsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBakQsQ0FBaUQsQ0FBQyxDQUFDLENBQUM7SUFDdkgsQ0FBQztJQUVPLDJCQUFVLEdBQWxCO1FBQ0MsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQWdCLElBQUssT0FBQSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFqRCxDQUFpRCxDQUFDLENBQUMsQ0FBQztJQUN2SCxDQUFDO0lBRU8sa0NBQWlCLEdBQXpCLFVBQTBCLENBQU07UUFDL0IsRUFBRSxDQUFDLENBQUMsQ0FBTyxNQUFPLENBQUMsVUFBVSxJQUFJLENBQUMsWUFBWSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5RixDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQsSUFBTSxNQUFNLEdBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUVyRSxJQUFJLElBQUksR0FBVyxDQUFDLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDM0MsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBRXpDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDO1lBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ3pFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDO1lBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBRTNFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxJQUFJLENBQUMsQ0FBQztZQUNWLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDVixDQUFDO1FBRUQsTUFBTSxDQUFDO1lBQ04sSUFBSSxFQUFFLElBQUk7WUFDVixHQUFHLEVBQUUsR0FBRztTQUNSLENBQUM7SUFDSCxDQUFDO0lBRU8sMENBQXlCLEdBQWpDLFVBQWtDLENBQU07UUFDdkMsRUFBRSxDQUFDLENBQUMsQ0FBTyxNQUFPLENBQUMsVUFBVSxJQUFJLENBQUMsWUFBWSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5RixDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQsTUFBTSxDQUFDO1lBQ04sSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPO1lBQ2YsR0FBRyxFQUFFLENBQUMsQ0FBQyxPQUFPO1NBQ2QsQ0FBQztJQUNILENBQUM7SUFFTyxxQ0FBb0IsR0FBNUI7UUFDQyxJQUFNLFFBQVEsR0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNoRixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUVPLHFDQUFvQixHQUE1QixVQUE2QixRQUEyQjtRQUN2RCxHQUFHLENBQUMsQ0FBYSxVQUFXLEVBQVgsS0FBQSxJQUFJLENBQUMsTUFBTSxFQUFYLGNBQVcsRUFBWCxJQUFXLENBQUM7WUFBeEIsSUFBSSxJQUFJLFNBQUE7WUFDWixJQUFNLElBQUksR0FBeUIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3hELElBQU0sR0FBRyxHQUFzQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFbEQsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDNUcsUUFBUSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkcsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNiLENBQUM7U0FDRDtRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRU8sbUNBQWtCLEdBQTFCLFVBQTJCLElBQWdCO1FBQzFDLElBQU0sR0FBRyxHQUF1QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDdkQsSUFBTSxJQUFJLEdBQW1CLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUV0QyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsdUJBQXVCLENBQUMscUNBQWlCLENBQUMsQ0FBQztRQUN6RixJQUFJLFlBQVksR0FBb0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0YsSUFBSSxDQUFDLGVBQWUsR0FBRyxZQUFZLENBQUM7UUFDcEMsSUFBTSxXQUFXLEdBQXNCLFlBQVksQ0FBQyxRQUFRLENBQUM7UUFDN0QsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixXQUFXLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6QyxXQUFXLENBQUMsZUFBZSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzVELFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQTFyQ0QsaUJBQWlCO0lBQ0YsMkJBQW9CLEdBQWlCO1FBQ25ELE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNiLFNBQVMsRUFBRSxJQUFJO1FBQ2YsU0FBUyxFQUFFLElBQUk7UUFDZixRQUFRLEVBQUUsQ0FBQztRQUNYLFFBQVEsRUFBRSxDQUFDO1FBQ1gsWUFBWSxFQUFFLENBQUM7UUFDZixZQUFZLEVBQUUsQ0FBQztRQUNmLFNBQVMsRUFBRSxHQUFHO1FBQ2QsVUFBVSxFQUFFLEdBQUc7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLFNBQVMsRUFBRSxHQUFHO1FBQ2QsVUFBVSxFQUFFLEdBQUc7UUFDZixXQUFXLEVBQUUsS0FBSztRQUNsQixVQUFVLEVBQUUsSUFBSTtRQUNoQixXQUFXLEVBQUUsS0FBSztRQUNsQixjQUFjLEVBQUUsS0FBSztRQUNyQixVQUFVLEVBQUUsS0FBSztRQUNqQixZQUFZLEVBQUUsS0FBSztLQUNuQixDQUFDO0lBN0VGO1FBQUMsYUFBTSxFQUFFOzsrQ0FBQTtJQUNUO1FBQUMsYUFBTSxFQUFFOzswQ0FBQTtJQUNUO1FBQUMsYUFBTSxFQUFFOzs4Q0FBQTtJQUNUO1FBQUMsYUFBTSxFQUFFOztpREFBQTtJQUNUO1FBQUMsYUFBTSxFQUFFOzs0Q0FBQTtJQUNUO1FBQUMsYUFBTSxFQUFFOztnREFBQTtJQUNUO1FBQUMsYUFBTSxFQUFFOztnREFBQTtJQXZCVjtRQUFDLGdCQUFTLENBQUM7WUFDVixRQUFRLEVBQUUsVUFBVTtZQUNwQixNQUFNLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztZQUMxQixJQUFJLEVBQUU7Z0JBQ0wsYUFBYSxFQUFFLHNCQUFzQjtnQkFDckMsYUFBYSxFQUFFLHNCQUFzQjtnQkFDckMsV0FBVyxFQUFFLG9CQUFvQjtnQkFDakMsY0FBYyxFQUFFLHNCQUFzQjtnQkFDdEMsYUFBYSxFQUFFLHNCQUFzQjtnQkFDckMsWUFBWSxFQUFFLG9CQUFvQjtnQkFDbEMsaUJBQWlCLEVBQUUsbUJBQW1CO2dCQUN0QyxzQkFBc0IsRUFBRSxzQkFBc0I7Z0JBQzlDLG9CQUFvQixFQUFFLG9CQUFvQjthQUMxQztTQUNELENBQUM7O2NBQUE7SUF1dkNGLGFBQUM7QUFBRCxDQXR2Q0EsQUFzdkNDLElBQUE7QUF0dkNZLGNBQU0sU0FzdkNsQixDQUFBIiwiZmlsZSI6ImRpcmVjdGl2ZXMvTmdHcmlkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIFJlbmRlcmVyLCBFdmVudEVtaXR0ZXIsIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgSG9zdCwgVmlld0VuY2Fwc3VsYXRpb24sIFR5cGUsIENvbXBvbmVudFJlZiwgS2V5VmFsdWVEaWZmZXIsIEtleVZhbHVlRGlmZmVycywgT25Jbml0LCBPbkRlc3Ryb3ksIERvQ2hlY2ssIFZpZXdDb250YWluZXJSZWYsIE91dHB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBOZ0dyaWRDb25maWcsIE5nR3JpZEl0ZW1FdmVudCwgTmdHcmlkSXRlbVBvc2l0aW9uLCBOZ0dyaWRJdGVtU2l6ZSwgTmdHcmlkUmF3UG9zaXRpb24sIE5nR3JpZEl0ZW1EaW1lbnNpb25zIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9JTmdHcmlkJztcclxuaW1wb3J0IHsgTmdHcmlkSXRlbSB9IGZyb20gJy4vTmdHcmlkSXRlbSc7XHJcbmltcG9ydCB7IE5nR3JpZFBsYWNlaG9sZGVyIH0gZnJvbSAnLi4vY29tcG9uZW50cy9OZ0dyaWRQbGFjZWhvbGRlcic7XHJcblxyXG5ARGlyZWN0aXZlKHtcclxuXHRzZWxlY3RvcjogJ1tuZ0dyaWRdJyxcclxuXHRpbnB1dHM6IFsnY29uZmlnOiBuZ0dyaWQnXSxcclxuXHRob3N0OiB7XHJcblx0XHQnKG1vdXNlZG93biknOiAnX29uTW91c2VEb3duKCRldmVudCknLFxyXG5cdFx0Jyhtb3VzZW1vdmUpJzogJ19vbk1vdXNlTW92ZSgkZXZlbnQpJyxcclxuXHRcdCcobW91c2V1cCknOiAnX29uTW91c2VVcCgkZXZlbnQpJyxcclxuXHRcdCcodG91Y2hzdGFydCknOiAnX29uTW91c2VEb3duKCRldmVudCknLFxyXG5cdFx0Jyh0b3VjaG1vdmUpJzogJ19vbk1vdXNlTW92ZSgkZXZlbnQpJyxcclxuXHRcdCcodG91Y2hlbmQpJzogJ19vbk1vdXNlVXAoJGV2ZW50KScsXHJcblx0XHQnKHdpbmRvdzpyZXNpemUpJzogJ19vblJlc2l6ZSgkZXZlbnQpJyxcclxuXHRcdCcoZG9jdW1lbnQ6bW91c2Vtb3ZlKSc6ICdfb25Nb3VzZU1vdmUoJGV2ZW50KScsXHJcblx0XHQnKGRvY3VtZW50Om1vdXNldXApJzogJ19vbk1vdXNlVXAoJGV2ZW50KSdcclxuXHR9LFxyXG59KVxyXG5leHBvcnQgY2xhc3MgTmdHcmlkIGltcGxlbWVudHMgT25Jbml0LCBEb0NoZWNrLCBPbkRlc3Ryb3kge1xyXG5cdC8vXHRFdmVudCBFbWl0dGVyc1xyXG5cdEBPdXRwdXQoKSBwdWJsaWMgb25EcmFnU3RhcnQ6IEV2ZW50RW1pdHRlcjxOZ0dyaWRJdGVtPiA9IG5ldyBFdmVudEVtaXR0ZXI8TmdHcmlkSXRlbT4oKTtcclxuXHRAT3V0cHV0KCkgcHVibGljIG9uRHJhZzogRXZlbnRFbWl0dGVyPE5nR3JpZEl0ZW0+ID0gbmV3IEV2ZW50RW1pdHRlcjxOZ0dyaWRJdGVtPigpO1xyXG5cdEBPdXRwdXQoKSBwdWJsaWMgb25EcmFnU3RvcDogRXZlbnRFbWl0dGVyPE5nR3JpZEl0ZW0+ID0gbmV3IEV2ZW50RW1pdHRlcjxOZ0dyaWRJdGVtPigpO1xyXG5cdEBPdXRwdXQoKSBwdWJsaWMgb25SZXNpemVTdGFydDogRXZlbnRFbWl0dGVyPE5nR3JpZEl0ZW0+ID0gbmV3IEV2ZW50RW1pdHRlcjxOZ0dyaWRJdGVtPigpO1xyXG5cdEBPdXRwdXQoKSBwdWJsaWMgb25SZXNpemU6IEV2ZW50RW1pdHRlcjxOZ0dyaWRJdGVtPiA9IG5ldyBFdmVudEVtaXR0ZXI8TmdHcmlkSXRlbT4oKTtcclxuXHRAT3V0cHV0KCkgcHVibGljIG9uUmVzaXplU3RvcDogRXZlbnRFbWl0dGVyPE5nR3JpZEl0ZW0+ID0gbmV3IEV2ZW50RW1pdHRlcjxOZ0dyaWRJdGVtPigpO1xyXG5cdEBPdXRwdXQoKSBwdWJsaWMgb25JdGVtQ2hhbmdlOiBFdmVudEVtaXR0ZXI8QXJyYXk8TmdHcmlkSXRlbUV2ZW50Pj4gPSBuZXcgRXZlbnRFbWl0dGVyPEFycmF5PE5nR3JpZEl0ZW1FdmVudD4+KCk7XHJcblxyXG5cdC8vXHRQdWJsaWMgdmFyaWFibGVzXHJcblx0cHVibGljIGNvbFdpZHRoOiBudW1iZXIgPSAyNTA7XHJcblx0cHVibGljIHJvd0hlaWdodDogbnVtYmVyID0gMjUwO1xyXG5cdHB1YmxpYyBtaW5Db2xzOiBudW1iZXIgPSAxO1xyXG5cdHB1YmxpYyBtaW5Sb3dzOiBudW1iZXIgPSAxO1xyXG5cdHB1YmxpYyBtYXJnaW5Ub3A6IG51bWJlciA9IDEwO1xyXG5cdHB1YmxpYyBtYXJnaW5SaWdodDogbnVtYmVyID0gMTA7XHJcblx0cHVibGljIG1hcmdpbkJvdHRvbTogbnVtYmVyID0gMTA7XHJcblx0cHVibGljIG1hcmdpbkxlZnQ6IG51bWJlciA9IDEwO1xyXG5cdHB1YmxpYyBpc0RyYWdnaW5nOiBib29sZWFuID0gZmFsc2U7XHJcblx0cHVibGljIGlzUmVzaXppbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHRwdWJsaWMgYXV0b1N0eWxlOiBib29sZWFuID0gdHJ1ZTtcclxuXHRwdWJsaWMgcmVzaXplRW5hYmxlOiBib29sZWFuID0gdHJ1ZTtcclxuXHRwdWJsaWMgZHJhZ0VuYWJsZTogYm9vbGVhbiA9IHRydWU7XHJcblx0cHVibGljIGNhc2NhZGU6IHN0cmluZyA9ICd1cCc7XHJcblx0cHVibGljIG1pbldpZHRoOiBudW1iZXIgPSAxMDA7XHJcblx0cHVibGljIG1pbkhlaWdodDogbnVtYmVyID0gMTAwO1xyXG5cclxuXHQvL1x0UHJpdmF0ZSB2YXJpYWJsZXNcclxuXHRwcml2YXRlIF9pdGVtczogQXJyYXk8TmdHcmlkSXRlbT4gPSBbXTtcclxuXHRwcml2YXRlIF9kcmFnZ2luZ0l0ZW06IE5nR3JpZEl0ZW0gPSBudWxsO1xyXG5cdHByaXZhdGUgX3Jlc2l6aW5nSXRlbTogTmdHcmlkSXRlbSA9IG51bGw7XHJcblx0cHJpdmF0ZSBfcmVzaXplRGlyZWN0aW9uOiBzdHJpbmcgPSBudWxsO1xyXG5cdHByaXZhdGUgX2l0ZW1HcmlkOiB7IFtrZXk6IG51bWJlcl06IHsgW2tleTogbnVtYmVyXTogTmdHcmlkSXRlbSB9IH0gPSB7IDE6IHsgMTogbnVsbCB9IH07XHJcblx0cHJpdmF0ZSBfY29udGFpbmVyV2lkdGg6IG51bWJlcjtcclxuXHRwcml2YXRlIF9jb250YWluZXJIZWlnaHQ6IG51bWJlcjtcclxuXHRwcml2YXRlIF9tYXhDb2xzOiBudW1iZXIgPSAwO1xyXG5cdHByaXZhdGUgX21heFJvd3M6IG51bWJlciA9IDA7XHJcblx0cHJpdmF0ZSBfdmlzaWJsZUNvbHM6IG51bWJlciA9IDA7XHJcblx0cHJpdmF0ZSBfdmlzaWJsZVJvd3M6IG51bWJlciA9IDA7XHJcblx0cHJpdmF0ZSBfc2V0V2lkdGg6IG51bWJlciA9IDI1MDtcclxuXHRwcml2YXRlIF9zZXRIZWlnaHQ6IG51bWJlciA9IDI1MDtcclxuXHRwcml2YXRlIF9wb3NPZmZzZXQ6IE5nR3JpZFJhd1Bvc2l0aW9uID0gbnVsbDtcclxuXHRwcml2YXRlIF9hZGRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHRwcml2YXRlIF9wbGFjZWhvbGRlclJlZjogQ29tcG9uZW50UmVmPE5nR3JpZFBsYWNlaG9sZGVyPiA9IG51bGw7XHJcblx0cHJpdmF0ZSBfZml4VG9HcmlkOiBib29sZWFuID0gZmFsc2U7XHJcblx0cHJpdmF0ZSBfYXV0b1Jlc2l6ZTogYm9vbGVhbiA9IGZhbHNlO1xyXG5cdHByaXZhdGUgX2RpZmZlcjogS2V5VmFsdWVEaWZmZXI7XHJcblx0cHJpdmF0ZSBfZGVzdHJveWVkOiBib29sZWFuID0gZmFsc2U7XHJcblx0cHJpdmF0ZSBfbWFpbnRhaW5SYXRpbzogYm9vbGVhbiA9IGZhbHNlO1xyXG5cdHByaXZhdGUgX2FzcGVjdFJhdGlvOiBudW1iZXI7XHJcblx0cHJpdmF0ZSBfcHJlZmVyTmV3OiBib29sZWFuID0gZmFsc2U7XHJcblx0cHJpdmF0ZSBfem9vbU9uRHJhZzogYm9vbGVhbiA9IGZhbHNlO1xyXG5cdHByaXZhdGUgX2xpbWl0VG9TY3JlZW46IGJvb2xlYW4gPSBmYWxzZTtcclxuXHRwcml2YXRlIF9jdXJNYXhSb3c6IG51bWJlciA9IDA7XHJcblx0cHJpdmF0ZSBfY3VyTWF4Q29sOiBudW1iZXIgPSAwO1xyXG5cdHByaXZhdGUgX2RyYWdSZWFkeTogYm9vbGVhbiA9IGZhbHNlO1xyXG5cdHByaXZhdGUgX3Jlc2l6ZVJlYWR5OiBib29sZWFuID0gZmFsc2U7XHJcblxyXG5cdC8vXHREZWZhdWx0IGNvbmZpZ1xyXG5cdHByaXZhdGUgc3RhdGljIENPTlNUX0RFRkFVTFRfQ09ORklHOiBOZ0dyaWRDb25maWcgPSB7XHJcblx0XHRtYXJnaW5zOiBbMTBdLFxyXG5cdFx0ZHJhZ2dhYmxlOiB0cnVlLFxyXG5cdFx0cmVzaXphYmxlOiB0cnVlLFxyXG5cdFx0bWF4X2NvbHM6IDAsXHJcblx0XHRtYXhfcm93czogMCxcclxuXHRcdHZpc2libGVfY29sczogMCxcclxuXHRcdHZpc2libGVfcm93czogMCxcclxuXHRcdGNvbF93aWR0aDogMjUwLFxyXG5cdFx0cm93X2hlaWdodDogMjUwLFxyXG5cdFx0Y2FzY2FkZTogJ3VwJyxcclxuXHRcdG1pbl93aWR0aDogMTAwLFxyXG5cdFx0bWluX2hlaWdodDogMTAwLFxyXG5cdFx0Zml4X3RvX2dyaWQ6IGZhbHNlLFxyXG5cdFx0YXV0b19zdHlsZTogdHJ1ZSxcclxuXHRcdGF1dG9fcmVzaXplOiBmYWxzZSxcclxuXHRcdG1haW50YWluX3JhdGlvOiBmYWxzZSxcclxuXHRcdHByZWZlcl9uZXc6IGZhbHNlLFxyXG5cdFx0em9vbV9vbl9kcmFnOiBmYWxzZVxyXG5cdH07XHJcblx0cHJpdmF0ZSBfY29uZmlnID0gTmdHcmlkLkNPTlNUX0RFRkFVTFRfQ09ORklHO1xyXG5cclxuXHQvL1x0W25nLWdyaWRdIGF0dHJpYnV0ZSBoYW5kbGVyXHJcblx0c2V0IGNvbmZpZyh2OiBOZ0dyaWRDb25maWcpIHtcclxuXHRcdHRoaXMuc2V0Q29uZmlnKHYpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9kaWZmZXIgPT0gbnVsbCAmJiB2ICE9IG51bGwpIHtcclxuXHRcdFx0dGhpcy5fZGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKHRoaXMuX2NvbmZpZykuY3JlYXRlKG51bGwpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly9cdENvbnN0cnVjdG9yXHJcblx0Y29uc3RydWN0b3IocHJpdmF0ZSBfZGlmZmVyczogS2V5VmFsdWVEaWZmZXJzLFxyXG5cdFx0XHRcdHByaXZhdGUgX25nRWw6IEVsZW1lbnRSZWYsXHJcblx0XHRcdFx0cHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyLFxyXG5cdFx0XHRcdHByaXZhdGUgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXHJcblx0XHRcdFx0cHJpdmF0ZSBfY29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7fVxyXG5cclxuXHQvL1x0UHVibGljIG1ldGhvZHNcclxuXHRwdWJsaWMgbmdPbkluaXQoKTogdm9pZCB7XHJcblx0XHR0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50Q2xhc3ModGhpcy5fbmdFbC5uYXRpdmVFbGVtZW50LCAnZ3JpZCcsIHRydWUpO1xyXG5cdFx0aWYgKHRoaXMuYXV0b1N0eWxlKSB0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50U3R5bGUodGhpcy5fbmdFbC5uYXRpdmVFbGVtZW50LCAncG9zaXRpb24nLCAncmVsYXRpdmUnKTtcclxuXHRcdHRoaXMuc2V0Q29uZmlnKHRoaXMuX2NvbmZpZyk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcblx0XHR0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldENvbmZpZyhjb25maWc6IE5nR3JpZENvbmZpZyk6IHZvaWQge1xyXG5cdFx0dGhpcy5fY29uZmlnID0gY29uZmlnO1xyXG5cclxuXHRcdHZhciBtYXhDb2xSb3dDaGFuZ2VkID0gZmFsc2U7XHJcblx0XHRmb3IgKHZhciB4IGluIGNvbmZpZykge1xyXG5cdFx0XHR2YXIgdmFsID0gY29uZmlnW3hdO1xyXG5cdFx0XHR2YXIgaW50VmFsID0gIXZhbCA/IDAgOiBwYXJzZUludCh2YWwpO1xyXG5cclxuXHRcdFx0c3dpdGNoICh4KSB7XHJcblx0XHRcdFx0Y2FzZSAnbWFyZ2lucyc6XHJcblx0XHRcdFx0XHR0aGlzLnNldE1hcmdpbnModmFsKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgJ2NvbF93aWR0aCc6XHJcblx0XHRcdFx0XHR0aGlzLmNvbFdpZHRoID0gTWF0aC5tYXgoaW50VmFsLCAxKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgJ3Jvd19oZWlnaHQnOlxyXG5cdFx0XHRcdFx0dGhpcy5yb3dIZWlnaHQgPSBNYXRoLm1heChpbnRWYWwsIDEpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAnYXV0b19zdHlsZSc6XHJcblx0XHRcdFx0XHR0aGlzLmF1dG9TdHlsZSA9IHZhbCA/IHRydWUgOiBmYWxzZTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgJ2F1dG9fcmVzaXplJzpcclxuXHRcdFx0XHRcdHRoaXMuX2F1dG9SZXNpemUgPSB2YWwgPyB0cnVlIDogZmFsc2U7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlICdkcmFnZ2FibGUnOlxyXG5cdFx0XHRcdFx0dGhpcy5kcmFnRW5hYmxlID0gdmFsID8gdHJ1ZSA6IGZhbHNlO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAncmVzaXphYmxlJzpcclxuXHRcdFx0XHRcdHRoaXMucmVzaXplRW5hYmxlID0gdmFsID8gdHJ1ZSA6IGZhbHNlO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAnbWF4X3Jvd3MnOlxyXG5cdFx0XHRcdFx0bWF4Q29sUm93Q2hhbmdlZCA9IG1heENvbFJvd0NoYW5nZWQgfHwgdGhpcy5fbWF4Um93cyAhPSBpbnRWYWw7XHJcblx0XHRcdFx0XHR0aGlzLl9tYXhSb3dzID0gaW50VmFsIDwgMCA/IDAgOiBpbnRWYWw7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlICdtYXhfY29scyc6XHJcblx0XHRcdFx0XHRtYXhDb2xSb3dDaGFuZ2VkID0gbWF4Q29sUm93Q2hhbmdlZCB8fCB0aGlzLl9tYXhDb2xzICE9IGludFZhbDtcclxuXHRcdFx0XHRcdHRoaXMuX21heENvbHMgPSBpbnRWYWwgPCAwID8gMCA6IGludFZhbDtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgJ3Zpc2libGVfcm93cyc6XHJcblx0XHRcdFx0XHR0aGlzLl92aXNpYmxlUm93cyA9IE1hdGgubWF4KGludFZhbCwgMCk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlICd2aXNpYmxlX2NvbHMnOlxyXG5cdFx0XHRcdFx0dGhpcy5fdmlzaWJsZUNvbHMgPSBNYXRoLm1heChpbnRWYWwsIDApO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAnbWluX3Jvd3MnOlxyXG5cdFx0XHRcdFx0dGhpcy5taW5Sb3dzID0gTWF0aC5tYXgoaW50VmFsLCAxKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgJ21pbl9jb2xzJzpcclxuXHRcdFx0XHRcdHRoaXMubWluQ29scyA9IE1hdGgubWF4KGludFZhbCwgMSk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlICdtaW5faGVpZ2h0JzpcclxuXHRcdFx0XHRcdHRoaXMubWluSGVpZ2h0ID0gTWF0aC5tYXgoaW50VmFsLCAxKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgJ21pbl93aWR0aCc6XHJcblx0XHRcdFx0XHR0aGlzLm1pbldpZHRoID0gTWF0aC5tYXgoaW50VmFsLCAxKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgJ3pvb21fb25fZHJhZyc6XHJcblx0XHRcdFx0XHR0aGlzLl96b29tT25EcmFnID0gdmFsID8gdHJ1ZSA6IGZhbHNlO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAnY2FzY2FkZSc6XHJcblx0XHRcdFx0XHRpZiAodGhpcy5jYXNjYWRlICE9IHZhbCkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLmNhc2NhZGUgPSB2YWw7XHJcblx0XHRcdFx0XHRcdHRoaXMuX2Nhc2NhZGVHcmlkKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlICdmaXhfdG9fZ3JpZCc6XHJcblx0XHRcdFx0XHR0aGlzLl9maXhUb0dyaWQgPSB2YWwgPyB0cnVlIDogZmFsc2U7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlICdtYWludGFpbl9yYXRpbyc6XHJcblx0XHRcdFx0XHR0aGlzLl9tYWludGFpblJhdGlvID0gdmFsID8gdHJ1ZSA6IGZhbHNlO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAncHJlZmVyX25ldyc6XHJcblx0XHRcdFx0XHR0aGlzLl9wcmVmZXJOZXcgPSB2YWwgPyB0cnVlIDogZmFsc2U7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlICdsaW1pdF90b19zY3JlZW4nOlxyXG5cdFx0XHRcdFx0dGhpcy5fbGltaXRUb1NjcmVlbiA9IHZhbCA/IHRydWUgOiBmYWxzZTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMuX21haW50YWluUmF0aW8pIHtcclxuXHRcdFx0aWYgKHRoaXMuY29sV2lkdGggJiYgdGhpcy5yb3dIZWlnaHQpIHtcclxuXHRcdFx0XHR0aGlzLl9hc3BlY3RSYXRpbyA9IHRoaXMuY29sV2lkdGggLyB0aGlzLnJvd0hlaWdodDtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLl9tYWludGFpblJhdGlvID0gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAobWF4Q29sUm93Q2hhbmdlZCkge1xyXG5cdFx0XHRpZiAodGhpcy5fbWF4Q29scyA+IDAgJiYgdGhpcy5fbWF4Um93cyA+IDApIHtcdC8vXHRDYW4ndCBoYXZlIGJvdGgsIHByaW9yaXRpc2Ugb24gY2FzY2FkZVxyXG5cdFx0XHRcdHN3aXRjaCAodGhpcy5jYXNjYWRlKSB7XHJcblx0XHRcdFx0XHRjYXNlICdsZWZ0JzpcclxuXHRcdFx0XHRcdGNhc2UgJ3JpZ2h0JzpcclxuXHRcdFx0XHRcdFx0dGhpcy5fbWF4Q29scyA9IDA7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSAndXAnOlxyXG5cdFx0XHRcdFx0Y2FzZSAnZG93bic6XHJcblx0XHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0XHR0aGlzLl9tYXhSb3dzID0gMDtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKGxldCBpdGVtIG9mIHRoaXMuX2l0ZW1zKSB7XHJcblx0XHRcdFx0dmFyIHBvcyA9IGl0ZW0uZ2V0R3JpZFBvc2l0aW9uKCk7XHJcblx0XHRcdFx0dmFyIGRpbXMgPSBpdGVtLmdldFNpemUoKTtcclxuXHJcblx0XHRcdFx0dGhpcy5fcmVtb3ZlRnJvbUdyaWQoaXRlbSk7XHJcblxyXG5cdFx0XHRcdGlmICh0aGlzLl9tYXhDb2xzID4gMCAmJiBkaW1zLnggPiB0aGlzLl9tYXhDb2xzKSB7XHJcblx0XHRcdFx0XHRkaW1zLnggPSB0aGlzLl9tYXhDb2xzO1xyXG5cdFx0XHRcdFx0aXRlbS5zZXRTaXplKGRpbXMpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAodGhpcy5fbWF4Um93cyA+IDAgJiYgZGltcy55ID4gdGhpcy5fbWF4Um93cykge1xyXG5cdFx0XHRcdFx0ZGltcy55ID0gdGhpcy5fbWF4Um93cztcclxuXHRcdFx0XHRcdGl0ZW0uc2V0U2l6ZShkaW1zKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmICh0aGlzLl9oYXNHcmlkQ29sbGlzaW9uKHBvcywgZGltcykgfHwgIXRoaXMuX2lzV2l0aGluQm91bmRzKHBvcywgZGltcykpIHtcclxuXHRcdFx0XHRcdHZhciBuZXdQb3NpdGlvbiA9IHRoaXMuX2ZpeEdyaWRQb3NpdGlvbihwb3MsIGRpbXMpO1xyXG5cdFx0XHRcdFx0aXRlbS5zZXRHcmlkUG9zaXRpb24obmV3UG9zaXRpb24pO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dGhpcy5fYWRkVG9HcmlkKGl0ZW0pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLl9jYXNjYWRlR3JpZCgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2NhbGN1bGF0ZVJvd0hlaWdodCgpO1xyXG5cdFx0dGhpcy5fY2FsY3VsYXRlQ29sV2lkdGgoKTtcclxuXHJcblx0XHR2YXIgbWF4V2lkdGggPSB0aGlzLl9tYXhDb2xzICogdGhpcy5jb2xXaWR0aDtcclxuXHRcdHZhciBtYXhIZWlnaHQgPSB0aGlzLl9tYXhSb3dzICogdGhpcy5yb3dIZWlnaHQ7XHJcblxyXG5cdFx0aWYgKG1heFdpZHRoID4gMCAmJiB0aGlzLm1pbldpZHRoID4gbWF4V2lkdGgpIHRoaXMubWluV2lkdGggPSAwLjc1ICogdGhpcy5jb2xXaWR0aDtcclxuXHRcdGlmIChtYXhIZWlnaHQgPiAwICYmIHRoaXMubWluSGVpZ2h0ID4gbWF4SGVpZ2h0KSB0aGlzLm1pbkhlaWdodCA9IDAuNzUgKiB0aGlzLnJvd0hlaWdodDtcclxuXHJcblx0XHRpZiAodGhpcy5taW5XaWR0aCA+IHRoaXMuY29sV2lkdGgpIHRoaXMubWluQ29scyA9IE1hdGgubWF4KHRoaXMubWluQ29scywgTWF0aC5jZWlsKHRoaXMubWluV2lkdGggLyB0aGlzLmNvbFdpZHRoKSk7XHJcblx0XHRpZiAodGhpcy5taW5IZWlnaHQgPiB0aGlzLnJvd0hlaWdodCkgdGhpcy5taW5Sb3dzID0gTWF0aC5tYXgodGhpcy5taW5Sb3dzLCBNYXRoLmNlaWwodGhpcy5taW5IZWlnaHQgLyB0aGlzLnJvd0hlaWdodCkpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9tYXhDb2xzID4gMCAmJiB0aGlzLm1pbkNvbHMgPiB0aGlzLl9tYXhDb2xzKSB0aGlzLm1pbkNvbHMgPSAxO1xyXG5cdFx0aWYgKHRoaXMuX21heFJvd3MgPiAwICYmIHRoaXMubWluUm93cyA+IHRoaXMuX21heFJvd3MpIHRoaXMubWluUm93cyA9IDE7XHJcblxyXG5cdFx0dGhpcy5fdXBkYXRlUmF0aW8oKTtcclxuXHRcdFxyXG5cdFx0Zm9yIChsZXQgaXRlbSBvZiB0aGlzLl9pdGVtcykge1xyXG5cdFx0XHR0aGlzLl9yZW1vdmVGcm9tR3JpZChpdGVtKTtcclxuXHRcdFx0aXRlbS5zZXRDYXNjYWRlTW9kZSh0aGlzLmNhc2NhZGUpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLl91cGRhdGVMaW1pdCgpO1xyXG5cdFx0XHJcblx0XHRmb3IgKGxldCBpdGVtIG9mIHRoaXMuX2l0ZW1zKSB7XHJcblx0XHRcdGl0ZW0ucmVjYWxjdWxhdGVTZWxmKCk7XHJcblx0XHRcdHRoaXMuX2FkZFRvR3JpZChpdGVtKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9jYXNjYWRlR3JpZCgpO1xyXG5cdFx0dGhpcy5fdXBkYXRlU2l6ZSgpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGdldEl0ZW1Qb3NpdGlvbihpbmRleDogbnVtYmVyKTogTmdHcmlkSXRlbVBvc2l0aW9uIHtcclxuXHRcdHJldHVybiB0aGlzLl9pdGVtc1tpbmRleF0uZ2V0R3JpZFBvc2l0aW9uKCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZ2V0SXRlbVNpemUoaW5kZXg6IG51bWJlcik6IE5nR3JpZEl0ZW1TaXplIHtcclxuXHRcdHJldHVybiB0aGlzLl9pdGVtc1tpbmRleF0uZ2V0U2l6ZSgpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIG5nRG9DaGVjaygpOiBib29sZWFuIHtcclxuXHRcdGlmICh0aGlzLl9kaWZmZXIgIT0gbnVsbCkge1xyXG5cdFx0XHR2YXIgY2hhbmdlcyA9IHRoaXMuX2RpZmZlci5kaWZmKHRoaXMuX2NvbmZpZyk7XHJcblxyXG5cdFx0XHRpZiAoY2hhbmdlcyAhPSBudWxsKSB7XHJcblx0XHRcdFx0dGhpcy5fYXBwbHlDaGFuZ2VzKGNoYW5nZXMpO1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXRNYXJnaW5zKG1hcmdpbnM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcclxuXHRcdHRoaXMubWFyZ2luVG9wID0gTWF0aC5tYXgocGFyc2VJbnQobWFyZ2luc1swXSksIDApO1xyXG5cdFx0dGhpcy5tYXJnaW5SaWdodCA9IG1hcmdpbnMubGVuZ3RoID49IDIgPyBNYXRoLm1heChwYXJzZUludChtYXJnaW5zWzFdKSwgMCkgOiB0aGlzLm1hcmdpblRvcDtcclxuXHRcdHRoaXMubWFyZ2luQm90dG9tID0gbWFyZ2lucy5sZW5ndGggPj0gMyA/IE1hdGgubWF4KHBhcnNlSW50KG1hcmdpbnNbMl0pLCAwKSA6IHRoaXMubWFyZ2luVG9wO1xyXG5cdFx0dGhpcy5tYXJnaW5Cb3R0b20gPSBtYXJnaW5zLmxlbmd0aCA+PSAzID8gTWF0aC5tYXgocGFyc2VJbnQobWFyZ2luc1syXSksIDApIDogdGhpcy5tYXJnaW5Ub3A7XHJcblx0XHR0aGlzLm1hcmdpbkxlZnQgPSBtYXJnaW5zLmxlbmd0aCA+PSA0ID8gTWF0aC5tYXgocGFyc2VJbnQobWFyZ2luc1szXSksIDApIDogdGhpcy5tYXJnaW5SaWdodDtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBlbmFibGVEcmFnKCk6IHZvaWQge1xyXG5cdFx0dGhpcy5kcmFnRW5hYmxlID0gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkaXNhYmxlRHJhZygpOiB2b2lkIHtcclxuXHRcdHRoaXMuZHJhZ0VuYWJsZSA9IGZhbHNlO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGVuYWJsZVJlc2l6ZSgpOiB2b2lkIHtcclxuXHRcdHRoaXMucmVzaXplRW5hYmxlID0gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkaXNhYmxlUmVzaXplKCk6IHZvaWQge1xyXG5cdFx0dGhpcy5yZXNpemVFbmFibGUgPSBmYWxzZTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBhZGRJdGVtKG5nSXRlbTogTmdHcmlkSXRlbSk6IHZvaWQge1xyXG5cdFx0bmdJdGVtLnNldENhc2NhZGVNb2RlKHRoaXMuY2FzY2FkZSk7XHJcblx0XHRpZiAoIXRoaXMuX3ByZWZlck5ldykge1xyXG5cdFx0XHR2YXIgbmV3UG9zID0gdGhpcy5fZml4R3JpZFBvc2l0aW9uKG5nSXRlbS5nZXRHcmlkUG9zaXRpb24oKSwgbmdJdGVtLmdldFNpemUoKSk7XHJcblx0XHRcdG5nSXRlbS5zYXZlUG9zaXRpb24obmV3UG9zKTtcclxuXHRcdH1cclxuXHRcdHRoaXMuX2l0ZW1zLnB1c2gobmdJdGVtKTtcclxuXHRcdHRoaXMuX2FkZFRvR3JpZChuZ0l0ZW0pO1xyXG5cdFx0bmdJdGVtLnJlY2FsY3VsYXRlU2VsZigpO1xyXG5cdFx0bmdJdGVtLm9uQ2FzY2FkZUV2ZW50KCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcmVtb3ZlSXRlbShuZ0l0ZW06IE5nR3JpZEl0ZW0pOiB2b2lkIHtcclxuXHRcdHRoaXMuX3JlbW92ZUZyb21HcmlkKG5nSXRlbSk7XHJcblxyXG5cdFx0Zm9yIChsZXQgeDogbnVtYmVyID0gMDsgeCA8IHRoaXMuX2l0ZW1zLmxlbmd0aDsgeCsrKSB7XHJcblx0XHRcdGlmICh0aGlzLl9pdGVtc1t4XSA9PSBuZ0l0ZW0pIHtcclxuXHRcdFx0XHR0aGlzLl9pdGVtcy5zcGxpY2UoeCwgMSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAodGhpcy5fZGVzdHJveWVkKSByZXR1cm47XHJcblxyXG5cdFx0dGhpcy5fY2FzY2FkZUdyaWQoKTtcclxuXHRcdHRoaXMuX3VwZGF0ZVNpemUoKTtcclxuXHRcdHRoaXMuX2l0ZW1zLmZvckVhY2goKGl0ZW06IE5nR3JpZEl0ZW0pID0+IGl0ZW0ucmVjYWxjdWxhdGVTZWxmKCkpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHVwZGF0ZUl0ZW0obmdJdGVtOiBOZ0dyaWRJdGVtKTogdm9pZCB7XHJcblx0XHR0aGlzLl9yZW1vdmVGcm9tR3JpZChuZ0l0ZW0pO1xyXG5cdFx0dGhpcy5fYWRkVG9HcmlkKG5nSXRlbSk7XHJcblx0XHR0aGlzLl9jYXNjYWRlR3JpZCgpO1xyXG5cdFx0dGhpcy5fdXBkYXRlU2l6ZSgpO1xyXG5cdFx0bmdJdGVtLm9uQ2FzY2FkZUV2ZW50KCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdHJpZ2dlckNhc2NhZGUoKTogdm9pZCB7XHJcblx0XHR0aGlzLl9jYXNjYWRlR3JpZChudWxsLCBudWxsLCBmYWxzZSk7XHJcblx0fVxyXG5cclxuXHQvL1x0UHJpdmF0ZSBtZXRob2RzXHJcblx0cHJpdmF0ZSBfY2FsY3VsYXRlQ29sV2lkdGgoKTogdm9pZCB7XHJcblx0XHRpZiAodGhpcy5fYXV0b1Jlc2l6ZSkge1xyXG5cdFx0XHRpZiAodGhpcy5fbWF4Q29scyA+IDAgfHwgdGhpcy5fdmlzaWJsZUNvbHMgPiAwKSB7XHJcblx0XHRcdFx0dmFyIG1heENvbHMgPSB0aGlzLl9tYXhDb2xzID4gMCA/IHRoaXMuX21heENvbHMgOiB0aGlzLl92aXNpYmxlQ29scztcclxuXHRcdFx0XHR2YXIgbWF4V2lkdGg6IG51bWJlciA9IHRoaXMuX25nRWwubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcclxuXHJcblx0XHRcdFx0dmFyIGNvbFdpZHRoOiBudW1iZXIgPSBNYXRoLmZsb29yKG1heFdpZHRoIC8gbWF4Q29scyk7XHJcblx0XHRcdFx0Y29sV2lkdGggLT0gKHRoaXMubWFyZ2luTGVmdCArIHRoaXMubWFyZ2luUmlnaHQpO1xyXG5cdFx0XHRcdGlmIChjb2xXaWR0aCA+IDApIHRoaXMuY29sV2lkdGggPSBjb2xXaWR0aDtcclxuXHJcblx0XHRcdFx0aWYgKHRoaXMuY29sV2lkdGggPCB0aGlzLm1pbldpZHRoIHx8IHRoaXMubWluQ29scyA+IHRoaXMuX2NvbmZpZy5taW5fY29scykge1xyXG5cdFx0XHRcdFx0dGhpcy5taW5Db2xzID0gTWF0aC5tYXgodGhpcy5fY29uZmlnLm1pbl9jb2xzLCBNYXRoLmNlaWwodGhpcy5taW5XaWR0aCAvIHRoaXMuY29sV2lkdGgpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgX2NhbGN1bGF0ZVJvd0hlaWdodCgpOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLl9hdXRvUmVzaXplKSB7XHJcblx0XHRcdGlmICh0aGlzLl9tYXhSb3dzID4gMCB8fCB0aGlzLl92aXNpYmxlUm93cyA+IDApIHtcclxuXHRcdFx0XHR2YXIgbWF4Um93cyA9IHRoaXMuX21heFJvd3MgPiAwID8gdGhpcy5fbWF4Um93cyA6IHRoaXMuX3Zpc2libGVSb3dzO1xyXG5cdFx0XHRcdHZhciBtYXhIZWlnaHQ6IG51bWJlciA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuXHJcblx0XHRcdFx0dmFyIHJvd0hlaWdodDogbnVtYmVyID0gTWF0aC5tYXgoTWF0aC5mbG9vcihtYXhIZWlnaHQgLyBtYXhSb3dzKSwgdGhpcy5taW5IZWlnaHQpO1xyXG5cdFx0XHRcdHJvd0hlaWdodCAtPSAodGhpcy5tYXJnaW5Ub3AgKyB0aGlzLm1hcmdpbkJvdHRvbSk7XHJcblx0XHRcdFx0aWYgKHJvd0hlaWdodCA+IDApIHRoaXMucm93SGVpZ2h0ID0gcm93SGVpZ2h0O1xyXG5cclxuXHRcdFx0XHRpZiAodGhpcy5yb3dIZWlnaHQgPCB0aGlzLm1pbkhlaWdodCB8fCB0aGlzLm1pblJvd3MgPiB0aGlzLl9jb25maWcubWluX3Jvd3MpIHtcclxuXHRcdFx0XHRcdHRoaXMubWluUm93cyA9IE1hdGgubWF4KHRoaXMuX2NvbmZpZy5taW5fcm93cywgTWF0aC5jZWlsKHRoaXMubWluSGVpZ2h0IC8gdGhpcy5yb3dIZWlnaHQpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgX3VwZGF0ZVJhdGlvKCk6IHZvaWQge1xyXG5cdFx0aWYgKHRoaXMuX2F1dG9SZXNpemUgJiYgdGhpcy5fbWFpbnRhaW5SYXRpbykge1xyXG5cdFx0XHRpZiAodGhpcy5fbWF4Q29scyA+IDAgJiYgdGhpcy5fdmlzaWJsZVJvd3MgPD0gMCkge1xyXG5cdFx0XHRcdHRoaXMucm93SGVpZ2h0ID0gdGhpcy5jb2xXaWR0aCAvIHRoaXMuX2FzcGVjdFJhdGlvO1xyXG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMuX21heFJvd3MgPiAwICYmIHRoaXMuX3Zpc2libGVDb2xzIDw9IDApIHtcclxuXHRcdFx0XHR0aGlzLmNvbFdpZHRoID0gdGhpcy5fYXNwZWN0UmF0aW8gKiB0aGlzLnJvd0hlaWdodDtcclxuXHRcdFx0fSBlbHNlIGlmICh0aGlzLl9tYXhDb2xzID09IDAgJiYgdGhpcy5fbWF4Um93cyA9PSAwKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuX3Zpc2libGVDb2xzID4gMCkge1xyXG5cdFx0XHRcdFx0dGhpcy5yb3dIZWlnaHQgPSB0aGlzLmNvbFdpZHRoIC8gdGhpcy5fYXNwZWN0UmF0aW87XHJcblx0XHRcdFx0fSBlbHNlIGlmICh0aGlzLl92aXNpYmxlUm93cyA+IDApIHtcclxuXHRcdFx0XHRcdHRoaXMuY29sV2lkdGggPSB0aGlzLl9hc3BlY3RSYXRpbyAqIHRoaXMucm93SGVpZ2h0O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRwcml2YXRlIF91cGRhdGVMaW1pdCgpOiB2b2lkIHtcclxuXHRcdGlmICghdGhpcy5fYXV0b1Jlc2l6ZSAmJiB0aGlzLl9saW1pdFRvU2NyZWVuKSB7XHJcblx0XHRcdHRoaXMuX2xpbWl0R3JpZCh0aGlzLl9nZXRDb250YWluZXJDb2x1bW5zKCkpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRwcml2YXRlIF9vblJlc2l6ZShlOiBhbnkpOiB2b2lkIHtcclxuXHRcdHRoaXMuX2NhbGN1bGF0ZUNvbFdpZHRoKCk7XHJcblx0XHR0aGlzLl9jYWxjdWxhdGVSb3dIZWlnaHQoKTtcclxuXHJcblx0XHR0aGlzLl91cGRhdGVSYXRpbygpO1xyXG5cdFx0XHJcblx0XHRmb3IgKGxldCBpdGVtIG9mIHRoaXMuX2l0ZW1zKSB7XHJcblx0XHRcdHRoaXMuX3JlbW92ZUZyb21HcmlkKGl0ZW0pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLl91cGRhdGVMaW1pdCgpO1xyXG5cdFx0XHJcblx0XHRmb3IgKGxldCBpdGVtIG9mIHRoaXMuX2l0ZW1zKSB7XHJcblx0XHRcdHRoaXMuX2FkZFRvR3JpZChpdGVtKTtcclxuXHRcdFx0aXRlbS5yZWNhbGN1bGF0ZVNlbGYoKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGhpcy5fdXBkYXRlU2l6ZSgpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfYXBwbHlDaGFuZ2VzKGNoYW5nZXM6IGFueSk6IHZvaWQge1xyXG5cdFx0Y2hhbmdlcy5mb3JFYWNoQWRkZWRJdGVtKChyZWNvcmQ6IGFueSkgPT4geyB0aGlzLl9jb25maWdbcmVjb3JkLmtleV0gPSByZWNvcmQuY3VycmVudFZhbHVlOyB9KTtcclxuXHRcdGNoYW5nZXMuZm9yRWFjaENoYW5nZWRJdGVtKChyZWNvcmQ6IGFueSkgPT4geyB0aGlzLl9jb25maWdbcmVjb3JkLmtleV0gPSByZWNvcmQuY3VycmVudFZhbHVlOyB9KTtcclxuXHRcdGNoYW5nZXMuZm9yRWFjaFJlbW92ZWRJdGVtKChyZWNvcmQ6IGFueSkgPT4geyBkZWxldGUgdGhpcy5fY29uZmlnW3JlY29yZC5rZXldOyB9KTtcclxuXHJcblx0XHR0aGlzLnNldENvbmZpZyh0aGlzLl9jb25maWcpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfb25Nb3VzZURvd24oZTogYW55KTogYm9vbGVhbiB7XHJcblx0XHR2YXIgbW91c2VQb3MgPSB0aGlzLl9nZXRNb3VzZVBvc2l0aW9uKGUpO1xyXG5cdFx0dmFyIGl0ZW0gPSB0aGlzLl9nZXRJdGVtRnJvbVBvc2l0aW9uKG1vdXNlUG9zKTtcclxuXHJcblx0XHRpZiAoaXRlbSAhPSBudWxsKSB7XHJcblx0XHRcdGlmICh0aGlzLnJlc2l6ZUVuYWJsZSAmJiBpdGVtLmNhblJlc2l6ZShlKSkge1xyXG5cdFx0XHRcdHRoaXMuX3Jlc2l6ZVJlYWR5ID0gdHJ1ZTtcclxuXHRcdFx0fSBlbHNlIGlmICh0aGlzLmRyYWdFbmFibGUgJiYgaXRlbS5jYW5EcmFnKGUpKSB7XHJcblx0XHRcdFx0dGhpcy5fZHJhZ1JlYWR5ID0gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgX3Jlc2l6ZVN0YXJ0KGU6IGFueSk6IHZvaWQge1xyXG5cdFx0aWYgKHRoaXMucmVzaXplRW5hYmxlKSB7XHJcblx0XHRcdHZhciBtb3VzZVBvcyA9IHRoaXMuX2dldE1vdXNlUG9zaXRpb24oZSk7XHJcblx0XHRcdHZhciBpdGVtID0gdGhpcy5fZ2V0SXRlbUZyb21Qb3NpdGlvbihtb3VzZVBvcyk7XHJcblxyXG5cdFx0XHRpdGVtLnN0YXJ0TW92aW5nKCk7XHJcblx0XHRcdHRoaXMuX3Jlc2l6aW5nSXRlbSA9IGl0ZW07XHJcblx0XHRcdHRoaXMuX3Jlc2l6ZURpcmVjdGlvbiA9IGl0ZW0uY2FuUmVzaXplKGUpO1xyXG5cdFx0XHR0aGlzLl9yZW1vdmVGcm9tR3JpZChpdGVtKTtcclxuXHRcdFx0dGhpcy5fY3JlYXRlUGxhY2Vob2xkZXIoaXRlbSk7XHJcblx0XHRcdHRoaXMuaXNSZXNpemluZyA9IHRydWU7XHJcblx0XHRcdHRoaXMuX3Jlc2l6ZVJlYWR5ID0gZmFsc2U7XHJcblxyXG5cdFx0XHR0aGlzLm9uUmVzaXplU3RhcnQuZW1pdChpdGVtKTtcclxuXHRcdFx0aXRlbS5vblJlc2l6ZVN0YXJ0RXZlbnQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgX2RyYWdTdGFydChlOiBhbnkpOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLmRyYWdFbmFibGUpIHtcclxuXHRcdFx0dmFyIG1vdXNlUG9zID0gdGhpcy5fZ2V0TW91c2VQb3NpdGlvbihlKTtcclxuXHRcdFx0dmFyIGl0ZW0gPSB0aGlzLl9nZXRJdGVtRnJvbVBvc2l0aW9uKG1vdXNlUG9zKTtcclxuXHRcdFx0dmFyIGl0ZW1Qb3MgPSBpdGVtLmdldFBvc2l0aW9uKCk7XHJcblx0XHRcdHZhciBwT2Zmc2V0ID0geyAnbGVmdCc6IChtb3VzZVBvcy5sZWZ0IC0gaXRlbVBvcy5sZWZ0KSwgJ3RvcCc6IChtb3VzZVBvcy50b3AgLSBpdGVtUG9zLnRvcCkgfVxyXG5cclxuXHRcdFx0aXRlbS5zdGFydE1vdmluZygpO1xyXG5cdFx0XHR0aGlzLl9kcmFnZ2luZ0l0ZW0gPSBpdGVtO1xyXG5cdFx0XHR0aGlzLl9wb3NPZmZzZXQgPSBwT2Zmc2V0O1xyXG5cdFx0XHR0aGlzLl9yZW1vdmVGcm9tR3JpZChpdGVtKTtcclxuXHRcdFx0dGhpcy5fY3JlYXRlUGxhY2Vob2xkZXIoaXRlbSk7XHJcblx0XHRcdHRoaXMuaXNEcmFnZ2luZyA9IHRydWU7XHJcblx0XHRcdHRoaXMuX2RyYWdSZWFkeSA9IGZhbHNlO1xyXG5cclxuXHRcdFx0dGhpcy5vbkRyYWdTdGFydC5lbWl0KGl0ZW0pO1xyXG5cdFx0XHRpdGVtLm9uRHJhZ1N0YXJ0RXZlbnQoKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmICh0aGlzLl96b29tT25EcmFnKSB7XHJcblx0XHRcdFx0dGhpcy5fem9vbU91dCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHByaXZhdGUgX3pvb21PdXQoKTogdm9pZCB7XHJcblx0XHR0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50U3R5bGUodGhpcy5fbmdFbC5uYXRpdmVFbGVtZW50LCAndHJhbnNmb3JtJywgJ3NjYWxlKDAuNSwgMC41KScpO1xyXG5cdH1cclxuXHRcclxuXHRwcml2YXRlIF9yZXNldFpvb20oKTogdm9pZCB7XHJcblx0XHR0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50U3R5bGUodGhpcy5fbmdFbC5uYXRpdmVFbGVtZW50LCAndHJhbnNmb3JtJywgJycpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfb25Nb3VzZU1vdmUoZTogYW55KTogYm9vbGVhbiB7XHJcblx0XHRpZiAoZS5idXR0b25zID09IDEgJiYgdGhpcy5fcmVzaXplUmVhZHkpIHtcclxuXHRcdFx0dGhpcy5fcmVzaXplU3RhcnQoZSk7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH0gZWxzZSBpZiAoZS5idXR0b25zID09IDEgJiYgdGhpcy5fZHJhZ1JlYWR5KSB7XHJcblx0XHRcdHRoaXMuX2RyYWdTdGFydChlKTtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fSBlbHNlIGlmICh0aGlzLl9kcmFnUmVhZHkgfHwgdGhpcy5fcmVzaXplUmVhZHkpIHtcclxuXHRcdFx0dGhpcy5fZHJhZ1JlYWR5ID0gZmFsc2U7XHJcblx0XHRcdHRoaXMuX3Jlc2l6ZVJlYWR5ID0gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmIChlLmJ1dHRvbnMgPT0gMCAmJiB0aGlzLmlzRHJhZ2dpbmcpIHtcclxuXHRcdFx0dGhpcy5fZHJhZ1N0b3AoZSk7XHJcblx0XHR9IGVsc2UgaWYgKGUuYnV0dG9ucyA9PSAwICYmIHRoaXMuaXNSZXNpemluZykge1xyXG5cdFx0XHR0aGlzLl9yZXNpemVTdG9wKGUpO1xyXG5cdFx0fSBlbHNlIGlmICh0aGlzLmlzRHJhZ2dpbmcpIHtcclxuXHRcdFx0dGhpcy5fZHJhZyhlKTtcclxuXHRcdH0gZWxzZSBpZiAodGhpcy5pc1Jlc2l6aW5nKSB7XHJcblx0XHRcdHRoaXMuX3Jlc2l6ZShlKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHZhciBtb3VzZVBvcyA9IHRoaXMuX2dldE1vdXNlUG9zaXRpb24oZSk7XHJcblx0XHRcdHZhciBpdGVtID0gdGhpcy5fZ2V0SXRlbUZyb21Qb3NpdGlvbihtb3VzZVBvcyk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoaXRlbSkge1xyXG5cdFx0XHRcdGl0ZW0ub25Nb3VzZU1vdmUoZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIF9kcmFnKGU6IGFueSk6IHZvaWQge1xyXG5cdFx0aWYgKHRoaXMuaXNEcmFnZ2luZykge1xyXG5cdFx0ICAgICAgICBpZiAod2luZG93LmdldFNlbGVjdGlvbikge1xyXG5cdFx0ICAgICAgICAgICAgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5lbXB0eSkge1xyXG5cdFx0ICAgICAgICAgICAgICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5lbXB0eSgpO1xyXG5cdFx0ICAgICAgICAgICAgfSBlbHNlIGlmICh3aW5kb3cuZ2V0U2VsZWN0aW9uKCkucmVtb3ZlQWxsUmFuZ2VzKSB7XHJcblx0XHQgICAgICAgICAgICAgICAgd2luZG93LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcygpO1xyXG5cdFx0ICAgICAgICAgICAgfVxyXG5cdFx0ICAgICAgICB9IGVsc2UgaWYgKCg8YW55PmRvY3VtZW50KS5zZWxlY3Rpb24pIHtcclxuXHRcdCAgICAgICAgICAgICg8YW55PmRvY3VtZW50KS5zZWxlY3Rpb24uZW1wdHkoKTtcclxuXHRcdCAgICAgICAgfTtcclxuXHRcdFx0dmFyIG1vdXNlUG9zID0gdGhpcy5fZ2V0TW91c2VQb3NpdGlvbihlKTtcclxuXHRcdFx0dmFyIG5ld0wgPSAobW91c2VQb3MubGVmdCAtIHRoaXMuX3Bvc09mZnNldC5sZWZ0KTtcclxuXHRcdFx0dmFyIG5ld1QgPSAobW91c2VQb3MudG9wIC0gdGhpcy5fcG9zT2Zmc2V0LnRvcCk7XHJcblxyXG5cdFx0XHR2YXIgaXRlbVBvcyA9IHRoaXMuX2RyYWdnaW5nSXRlbS5nZXRHcmlkUG9zaXRpb24oKTtcclxuXHRcdFx0dmFyIGdyaWRQb3MgPSB0aGlzLl9jYWxjdWxhdGVHcmlkUG9zaXRpb24obmV3TCwgbmV3VCk7XHJcblx0XHRcdHZhciBkaW1zID0gdGhpcy5fZHJhZ2dpbmdJdGVtLmdldFNpemUoKTtcclxuXHJcblx0XHRcdGlmICghdGhpcy5faXNXaXRoaW5Cb3VuZHNYKGdyaWRQb3MsIGRpbXMpKVxyXG5cdFx0XHRcdGdyaWRQb3MuY29sID0gdGhpcy5fbWF4Q29scyAtIChkaW1zLnggLSAxKTtcclxuXHJcblx0XHRcdGlmICghdGhpcy5faXNXaXRoaW5Cb3VuZHNZKGdyaWRQb3MsIGRpbXMpKVxyXG5cdFx0XHRcdGdyaWRQb3Mucm93ID0gdGhpcy5fbWF4Um93cyAtIChkaW1zLnkgLSAxKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmICghdGhpcy5fYXV0b1Jlc2l6ZSAmJiB0aGlzLl9saW1pdFRvU2NyZWVuKSB7XHJcblx0XHRcdFx0aWYgKChncmlkUG9zLmNvbCArIGRpbXMueCAtIDEpID4gdGhpcy5fZ2V0Q29udGFpbmVyQ29sdW1ucygpKSB7XHJcblx0XHRcdFx0XHRncmlkUG9zLmNvbCA9IHRoaXMuX2dldENvbnRhaW5lckNvbHVtbnMoKSAtIChkaW1zLnggLSAxKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChncmlkUG9zLmNvbCAhPSBpdGVtUG9zLmNvbCB8fCBncmlkUG9zLnJvdyAhPSBpdGVtUG9zLnJvdykge1xyXG5cdFx0XHRcdHRoaXMuX2RyYWdnaW5nSXRlbS5zZXRHcmlkUG9zaXRpb24oZ3JpZFBvcywgdGhpcy5fZml4VG9HcmlkKTtcclxuXHRcdFx0XHR0aGlzLl9wbGFjZWhvbGRlclJlZi5pbnN0YW5jZS5zZXRHcmlkUG9zaXRpb24oZ3JpZFBvcyk7XHJcblxyXG5cdFx0XHRcdGlmIChbJ3VwJywgJ2Rvd24nLCAnbGVmdCcsICdyaWdodCddLmluZGV4T2YodGhpcy5jYXNjYWRlKSA+PSAwKSB7XHJcblx0XHRcdFx0XHR0aGlzLl9maXhHcmlkQ29sbGlzaW9ucyhncmlkUG9zLCBkaW1zLCB0cnVlKTtcclxuXHRcdFx0XHRcdHRoaXMuX2Nhc2NhZGVHcmlkKGdyaWRQb3MsIGRpbXMpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIXRoaXMuX2ZpeFRvR3JpZCkge1xyXG5cdFx0XHRcdHRoaXMuX2RyYWdnaW5nSXRlbS5zZXRQb3NpdGlvbihuZXdMLCBuZXdUKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5vbkRyYWcuZW1pdCh0aGlzLl9kcmFnZ2luZ0l0ZW0pO1xyXG5cdFx0XHR0aGlzLl9kcmFnZ2luZ0l0ZW0ub25EcmFnRXZlbnQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgX3Jlc2l6ZShlOiBhbnkpOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLmlzUmVzaXppbmcpIHtcclxuXHRcdCAgICAgICAgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24pIHtcclxuXHRcdCAgICAgICAgICAgIGlmICh3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuZW1wdHkpIHtcclxuXHRcdCAgICAgICAgICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuZW1wdHkoKTtcclxuXHRcdCAgICAgICAgICAgIH0gZWxzZSBpZiAod2luZG93LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcykge1xyXG5cdFx0ICAgICAgICAgICAgICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5yZW1vdmVBbGxSYW5nZXMoKTtcclxuXHRcdCAgICAgICAgICAgIH1cclxuXHRcdCAgICAgICAgfSBlbHNlIGlmICgoPGFueT5kb2N1bWVudCkuc2VsZWN0aW9uKSB7XHJcblx0XHQgICAgICAgICAgICAoPGFueT5kb2N1bWVudCkuc2VsZWN0aW9uLmVtcHR5KCk7XHJcblx0XHQgICAgICAgIH07XHJcblx0XHRcdHZhciBtb3VzZVBvcyA9IHRoaXMuX2dldE1vdXNlUG9zaXRpb24oZSk7XHJcblx0XHRcdHZhciBpdGVtUG9zID0gdGhpcy5fcmVzaXppbmdJdGVtLmdldFBvc2l0aW9uKCk7XHJcblx0XHRcdHZhciBpdGVtRGltcyA9IHRoaXMuX3Jlc2l6aW5nSXRlbS5nZXREaW1lbnNpb25zKCk7XHJcblx0XHRcdHZhciBuZXdXID0gdGhpcy5fcmVzaXplRGlyZWN0aW9uID09ICdoZWlnaHQnID8gaXRlbURpbXMud2lkdGggOiAobW91c2VQb3MubGVmdCAtIGl0ZW1Qb3MubGVmdCArIDEwKTtcclxuXHRcdFx0dmFyIG5ld0ggPSB0aGlzLl9yZXNpemVEaXJlY3Rpb24gPT0gJ3dpZHRoJyA/IGl0ZW1EaW1zLmhlaWdodCA6IChtb3VzZVBvcy50b3AgLSBpdGVtUG9zLnRvcCArIDEwKTtcclxuXHJcblx0XHRcdGlmIChuZXdXIDwgdGhpcy5taW5XaWR0aClcclxuXHRcdFx0XHRuZXdXID0gdGhpcy5taW5XaWR0aDtcclxuXHRcdFx0aWYgKG5ld0ggPCB0aGlzLm1pbkhlaWdodClcclxuXHRcdFx0XHRuZXdIID0gdGhpcy5taW5IZWlnaHQ7XHJcblx0XHRcdGlmIChuZXdXIDwgdGhpcy5fcmVzaXppbmdJdGVtLm1pbldpZHRoKVxyXG5cdFx0XHRcdG5ld1cgPSB0aGlzLl9yZXNpemluZ0l0ZW0ubWluV2lkdGg7XHJcblx0XHRcdGlmIChuZXdIIDwgdGhpcy5fcmVzaXppbmdJdGVtLm1pbkhlaWdodClcclxuXHRcdFx0XHRuZXdIID0gdGhpcy5fcmVzaXppbmdJdGVtLm1pbkhlaWdodDtcclxuXHJcblx0XHRcdHZhciBjYWxjU2l6ZSA9IHRoaXMuX2NhbGN1bGF0ZUdyaWRTaXplKG5ld1csIG5ld0gpO1xyXG5cdFx0XHR2YXIgaXRlbVNpemUgPSB0aGlzLl9yZXNpemluZ0l0ZW0uZ2V0U2l6ZSgpO1xyXG5cdFx0XHR2YXIgaUdyaWRQb3MgPSB0aGlzLl9yZXNpemluZ0l0ZW0uZ2V0R3JpZFBvc2l0aW9uKCk7XHJcblxyXG5cdFx0XHRpZiAoIXRoaXMuX2lzV2l0aGluQm91bmRzWChpR3JpZFBvcywgY2FsY1NpemUpKVxyXG5cdFx0XHRcdGNhbGNTaXplLnggPSAodGhpcy5fbWF4Q29scyAtIGlHcmlkUG9zLmNvbCkgKyAxO1xyXG5cclxuXHRcdFx0aWYgKCF0aGlzLl9pc1dpdGhpbkJvdW5kc1koaUdyaWRQb3MsIGNhbGNTaXplKSlcclxuXHRcdFx0XHRjYWxjU2l6ZS55ID0gKHRoaXMuX21heFJvd3MgLSBpR3JpZFBvcy5yb3cpICsgMTtcclxuXHJcblx0XHRcdGNhbGNTaXplID0gdGhpcy5fcmVzaXppbmdJdGVtLmZpeFJlc2l6ZShjYWxjU2l6ZSk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoY2FsY1NpemUueCAhPSBpdGVtU2l6ZS54IHx8IGNhbGNTaXplLnkgIT0gaXRlbVNpemUueSkge1xyXG5cdFx0XHRcdHRoaXMuX3Jlc2l6aW5nSXRlbS5zZXRTaXplKGNhbGNTaXplLCBmYWxzZSk7XHJcblx0XHRcdFx0dGhpcy5fcGxhY2Vob2xkZXJSZWYuaW5zdGFuY2Uuc2V0U2l6ZShjYWxjU2l6ZSk7XHJcblxyXG5cdFx0XHRcdGlmIChbJ3VwJywgJ2Rvd24nLCAnbGVmdCcsICdyaWdodCddLmluZGV4T2YodGhpcy5jYXNjYWRlKSA+PSAwKSB7XHJcblx0XHRcdFx0XHR0aGlzLl9maXhHcmlkQ29sbGlzaW9ucyhpR3JpZFBvcywgY2FsY1NpemUsIHRydWUpO1xyXG5cdFx0XHRcdFx0dGhpcy5fY2FzY2FkZUdyaWQoaUdyaWRQb3MsIGNhbGNTaXplKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICghdGhpcy5fZml4VG9HcmlkKVxyXG5cdFx0XHRcdHRoaXMuX3Jlc2l6aW5nSXRlbS5zZXREaW1lbnNpb25zKG5ld1csIG5ld0gpO1xyXG5cclxuXHRcdFx0dmFyIGJpZ0dyaWQgPSB0aGlzLl9tYXhHcmlkU2l6ZShpdGVtUG9zLmxlZnQgKyBuZXdXICsgKDIgKiBlLm1vdmVtZW50WCksIGl0ZW1Qb3MudG9wICsgbmV3SCArICgyICogZS5tb3ZlbWVudFkpKTtcclxuXHJcblx0XHRcdGlmICh0aGlzLl9yZXNpemVEaXJlY3Rpb24gPT0gJ2hlaWdodCcpIGJpZ0dyaWQueCA9IGlHcmlkUG9zLmNvbCArIGl0ZW1TaXplLng7XHJcblx0XHRcdGlmICh0aGlzLl9yZXNpemVEaXJlY3Rpb24gPT0gJ3dpZHRoJykgYmlnR3JpZC55ID0gaUdyaWRQb3Mucm93ICsgaXRlbVNpemUueTtcclxuXHJcblx0XHRcdHRoaXMub25SZXNpemUuZW1pdCh0aGlzLl9yZXNpemluZ0l0ZW0pO1xyXG5cdFx0XHR0aGlzLl9yZXNpemluZ0l0ZW0ub25SZXNpemVFdmVudCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfb25Nb3VzZVVwKGU6IGFueSk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKHRoaXMuaXNEcmFnZ2luZykge1xyXG5cdFx0XHR0aGlzLl9kcmFnU3RvcChlKTtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fSBlbHNlIGlmICh0aGlzLmlzUmVzaXppbmcpIHtcclxuXHRcdFx0dGhpcy5fcmVzaXplU3RvcChlKTtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfZHJhZ1N0b3AoZTogYW55KTogdm9pZCB7XHJcblx0XHRpZiAodGhpcy5pc0RyYWdnaW5nKSB7XHJcblx0XHRcdHRoaXMuaXNEcmFnZ2luZyA9IGZhbHNlO1xyXG5cclxuXHRcdFx0dmFyIGl0ZW1Qb3MgPSB0aGlzLl9kcmFnZ2luZ0l0ZW0uZ2V0R3JpZFBvc2l0aW9uKCk7XHJcblxyXG5cdFx0XHR0aGlzLl9kcmFnZ2luZ0l0ZW0uc2F2ZVBvc2l0aW9uKGl0ZW1Qb3MpO1xyXG5cdFx0XHR0aGlzLl9hZGRUb0dyaWQodGhpcy5fZHJhZ2dpbmdJdGVtKTtcclxuXHJcblx0XHRcdHRoaXMuX2Nhc2NhZGVHcmlkKCk7XHJcblxyXG5cdFx0XHR0aGlzLl9kcmFnZ2luZ0l0ZW0uc3RvcE1vdmluZygpO1xyXG5cdFx0XHR0aGlzLl9kcmFnZ2luZ0l0ZW0ub25EcmFnU3RvcEV2ZW50KCk7XHJcblx0XHRcdHRoaXMub25EcmFnU3RvcC5lbWl0KHRoaXMuX2RyYWdnaW5nSXRlbSk7XHJcblx0XHRcdHRoaXMuX2RyYWdnaW5nSXRlbSA9IG51bGw7XHJcblx0XHRcdHRoaXMuX3Bvc09mZnNldCA9IG51bGw7XHJcblx0XHRcdHRoaXMuX3BsYWNlaG9sZGVyUmVmLmRlc3Ryb3koKTtcclxuXHJcblx0XHRcdHRoaXMub25JdGVtQ2hhbmdlLmVtaXQodGhpcy5faXRlbXMubWFwKChpdGVtOiBOZ0dyaWRJdGVtKSA9PiBpdGVtLmdldEV2ZW50T3V0cHV0KCkpKTtcclxuXHJcblx0XHRcdGlmICh0aGlzLl96b29tT25EcmFnKSB7XHJcblx0XHRcdFx0dGhpcy5fcmVzZXRab29tKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgX3Jlc2l6ZVN0b3AoZTogYW55KTogdm9pZCB7XHJcblx0XHRpZiAodGhpcy5pc1Jlc2l6aW5nKSB7XHJcblx0XHRcdHRoaXMuaXNSZXNpemluZyA9IGZhbHNlO1xyXG5cclxuXHRcdFx0dmFyIGl0ZW1EaW1zID0gdGhpcy5fcmVzaXppbmdJdGVtLmdldFNpemUoKTtcclxuXHJcblx0XHRcdHRoaXMuX3Jlc2l6aW5nSXRlbS5zZXRTaXplKGl0ZW1EaW1zKTtcclxuXHRcdFx0dGhpcy5fYWRkVG9HcmlkKHRoaXMuX3Jlc2l6aW5nSXRlbSk7XHJcblxyXG5cdFx0XHR0aGlzLl9jYXNjYWRlR3JpZCgpO1xyXG5cclxuXHRcdFx0dGhpcy5fcmVzaXppbmdJdGVtLnN0b3BNb3ZpbmcoKTtcclxuXHRcdFx0dGhpcy5fcmVzaXppbmdJdGVtLm9uUmVzaXplU3RvcEV2ZW50KCk7XHJcblx0XHRcdHRoaXMub25SZXNpemVTdG9wLmVtaXQodGhpcy5fcmVzaXppbmdJdGVtKTtcclxuXHRcdFx0dGhpcy5fcmVzaXppbmdJdGVtID0gbnVsbDtcclxuXHRcdFx0dGhpcy5fcmVzaXplRGlyZWN0aW9uID0gbnVsbDtcclxuXHRcdFx0dGhpcy5fcGxhY2Vob2xkZXJSZWYuZGVzdHJveSgpO1xyXG5cclxuXHRcdFx0dGhpcy5vbkl0ZW1DaGFuZ2UuZW1pdCh0aGlzLl9pdGVtcy5tYXAoKGl0ZW06IE5nR3JpZEl0ZW0pID0+IGl0ZW0uZ2V0RXZlbnRPdXRwdXQoKSkpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfbWF4R3JpZFNpemUodzogbnVtYmVyLCBoOiBudW1iZXIpOiBOZ0dyaWRJdGVtU2l6ZSB7XHJcblx0XHR2YXIgc2l6ZXggPSBNYXRoLmNlaWwodyAvICh0aGlzLmNvbFdpZHRoICsgdGhpcy5tYXJnaW5MZWZ0ICsgdGhpcy5tYXJnaW5SaWdodCkpO1xyXG5cdFx0dmFyIHNpemV5ID0gTWF0aC5jZWlsKGggLyAodGhpcy5yb3dIZWlnaHQgKyB0aGlzLm1hcmdpblRvcCArIHRoaXMubWFyZ2luQm90dG9tKSk7XHJcblx0XHRyZXR1cm4geyAneCc6IHNpemV4LCAneSc6IHNpemV5IH07XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIF9jYWxjdWxhdGVHcmlkU2l6ZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IE5nR3JpZEl0ZW1TaXplIHtcclxuXHRcdHdpZHRoICs9IHRoaXMubWFyZ2luTGVmdCArIHRoaXMubWFyZ2luUmlnaHQ7XHJcblx0XHRoZWlnaHQgKz0gdGhpcy5tYXJnaW5Ub3AgKyB0aGlzLm1hcmdpbkJvdHRvbTtcclxuXHJcblx0XHR2YXIgc2l6ZXggPSBNYXRoLm1heCh0aGlzLm1pbkNvbHMsIE1hdGgucm91bmQod2lkdGggLyAodGhpcy5jb2xXaWR0aCArIHRoaXMubWFyZ2luTGVmdCArIHRoaXMubWFyZ2luUmlnaHQpKSk7XHJcblx0XHR2YXIgc2l6ZXkgPSBNYXRoLm1heCh0aGlzLm1pblJvd3MsIE1hdGgucm91bmQoaGVpZ2h0IC8gKHRoaXMucm93SGVpZ2h0ICsgdGhpcy5tYXJnaW5Ub3AgKyB0aGlzLm1hcmdpbkJvdHRvbSkpKTtcclxuXHJcblx0XHRpZiAoIXRoaXMuX2lzV2l0aGluQm91bmRzWCh7IGNvbDogMSwgcm93OiAxIH0sIHsgeDogc2l6ZXgsIHk6IHNpemV5IH0pKSBzaXpleCA9IHRoaXMuX21heENvbHM7XHJcblx0XHRpZiAoIXRoaXMuX2lzV2l0aGluQm91bmRzWSh7IGNvbDogMSwgcm93OiAxIH0sIHsgeDogc2l6ZXgsIHk6IHNpemV5IH0pKSBzaXpleSA9IHRoaXMuX21heFJvd3M7XHJcblxyXG5cdFx0cmV0dXJuIHsgJ3gnOiBzaXpleCwgJ3knOiBzaXpleSB9O1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfY2FsY3VsYXRlR3JpZFBvc2l0aW9uKGxlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIpOiBOZ0dyaWRJdGVtUG9zaXRpb24ge1xyXG5cdFx0dmFyIGNvbCA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQobGVmdCAvICh0aGlzLmNvbFdpZHRoICsgdGhpcy5tYXJnaW5MZWZ0ICsgdGhpcy5tYXJnaW5SaWdodCkpICsgMSk7XHJcblx0XHR2YXIgcm93ID0gTWF0aC5tYXgoMSwgTWF0aC5yb3VuZCh0b3AgLyAodGhpcy5yb3dIZWlnaHQgKyB0aGlzLm1hcmdpblRvcCArIHRoaXMubWFyZ2luQm90dG9tKSkgKyAxKTtcclxuXHJcblx0XHRpZiAoIXRoaXMuX2lzV2l0aGluQm91bmRzWCh7IGNvbDogY29sLCByb3c6IHJvdyB9LCB7IHg6IDEsIHk6IDEgfSkpIGNvbCA9IHRoaXMuX21heENvbHM7XHJcblx0XHRpZiAoIXRoaXMuX2lzV2l0aGluQm91bmRzWSh7IGNvbDogY29sLCByb3c6IHJvdyB9LCB7IHg6IDEsIHk6IDEgfSkpIHJvdyA9IHRoaXMuX21heFJvd3M7XHJcblxyXG5cdFx0cmV0dXJuIHsgJ2NvbCc6IGNvbCwgJ3Jvdyc6IHJvdyB9O1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfaGFzR3JpZENvbGxpc2lvbihwb3M6IE5nR3JpZEl0ZW1Qb3NpdGlvbiwgZGltczogTmdHcmlkSXRlbVNpemUpOiBib29sZWFuIHtcclxuXHRcdHZhciBwb3NpdGlvbnMgPSB0aGlzLl9nZXRDb2xsaXNpb25zKHBvcywgZGltcyk7XHJcblxyXG5cdFx0aWYgKHBvc2l0aW9ucyA9PSBudWxsIHx8IHBvc2l0aW9ucy5sZW5ndGggPT0gMCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdHJldHVybiBwb3NpdGlvbnMuc29tZSgodjogTmdHcmlkSXRlbSkgPT4ge1xyXG5cdFx0XHRyZXR1cm4gISh2ID09PSBudWxsKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfZ2V0Q29sbGlzaW9ucyhwb3M6IE5nR3JpZEl0ZW1Qb3NpdGlvbiwgZGltczogTmdHcmlkSXRlbVNpemUpOiBBcnJheTxOZ0dyaWRJdGVtPiB7XHJcblx0XHRjb25zdCByZXR1cm5zOiBBcnJheTxOZ0dyaWRJdGVtPiA9IFtdO1xyXG5cdFx0XHJcblx0XHRmb3IgKGxldCBqOiBudW1iZXIgPSAwOyBqIDwgZGltcy55OyBqKyspIHtcclxuXHRcdFx0aWYgKHRoaXMuX2l0ZW1HcmlkW3Bvcy5yb3cgKyBqXSAhPSBudWxsKSB7XHJcblx0XHRcdFx0Zm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGRpbXMueDsgaSsrKSB7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5faXRlbUdyaWRbcG9zLnJvdyArIGpdW3Bvcy5jb2wgKyBpXSAhPSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdGNvbnN0IGl0ZW06IE5nR3JpZEl0ZW0gPSB0aGlzLl9pdGVtR3JpZFtwb3Mucm93ICsgal1bcG9zLmNvbCArIGldO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0aWYgKHJldHVybnMuaW5kZXhPZihpdGVtKSA8IDApXHJcblx0XHRcdFx0XHRcdFx0cmV0dXJucy5wdXNoKGl0ZW0pO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Y29uc3QgaXRlbVBvczogTmdHcmlkSXRlbVBvc2l0aW9uID0gaXRlbS5nZXRHcmlkUG9zaXRpb24oKTtcclxuXHRcdFx0XHRcdFx0Y29uc3QgaXRlbURpbXM6IE5nR3JpZEl0ZW1TaXplID0gaXRlbS5nZXRTaXplKCk7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRpID0gaXRlbVBvcy5jb2wgKyBpdGVtRGltcy54IC0gcG9zLmNvbDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gcmV0dXJucztcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgX2ZpeEdyaWRDb2xsaXNpb25zKHBvczogTmdHcmlkSXRlbVBvc2l0aW9uLCBkaW1zOiBOZ0dyaWRJdGVtU2l6ZSwgc2hvdWxkU2F2ZTogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XHJcblx0XHR3aGlsZSAodGhpcy5faGFzR3JpZENvbGxpc2lvbihwb3MsIGRpbXMpKSB7XHJcblx0XHRcdGNvbnN0IGNvbGxpc2lvbnM6IEFycmF5PE5nR3JpZEl0ZW0+ID0gdGhpcy5fZ2V0Q29sbGlzaW9ucyhwb3MsIGRpbXMpO1xyXG5cclxuXHRcdFx0dGhpcy5fcmVtb3ZlRnJvbUdyaWQoY29sbGlzaW9uc1swXSk7XHJcblxyXG5cdFx0XHRjb25zdCBpdGVtUG9zOiBOZ0dyaWRJdGVtUG9zaXRpb24gPSBjb2xsaXNpb25zWzBdLmdldEdyaWRQb3NpdGlvbigpO1xyXG5cdFx0XHRjb25zdCBpdGVtRGltczogTmdHcmlkSXRlbVNpemUgPSBjb2xsaXNpb25zWzBdLmdldFNpemUoKTtcclxuXHJcblx0XHRcdHN3aXRjaCAodGhpcy5jYXNjYWRlKSB7XHJcblx0XHRcdFx0Y2FzZSAndXAnOlxyXG5cdFx0XHRcdGNhc2UgJ2Rvd24nOlxyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHRjb25zdCBvbGRSb3c6IG51bWJlciA9IGl0ZW1Qb3Mucm93O1xyXG5cdFx0XHRcdFx0aXRlbVBvcy5yb3cgPSBwb3Mucm93ICsgZGltcy55O1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZiAoIXRoaXMuX2lzV2l0aGluQm91bmRzWShpdGVtUG9zLCBpdGVtRGltcykpIHtcclxuXHRcdFx0XHRcdFx0aXRlbVBvcy5jb2wgPSBwb3MuY29sICsgZGltcy54O1xyXG5cdFx0XHRcdFx0XHRpdGVtUG9zLnJvdyA9IG9sZFJvdztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgJ2xlZnQnOlxyXG5cdFx0XHRcdGNhc2UgJ3JpZ2h0JzpcclxuXHRcdFx0XHRcdGNvbnN0IG9sZENvbDogbnVtYmVyID0gaXRlbVBvcy5jb2w7XHJcblx0XHRcdFx0XHRpdGVtUG9zLmNvbCA9IHBvcy5jb2wgKyBkaW1zLng7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmICghdGhpcy5faXNXaXRoaW5Cb3VuZHNYKGl0ZW1Qb3MsIGl0ZW1EaW1zKSkge1xyXG5cdFx0XHRcdFx0XHRpdGVtUG9zLmNvbCA9IG9sZENvbDtcclxuXHRcdFx0XHRcdFx0aXRlbVBvcy5yb3cgPSBwb3Mucm93ICsgZGltcy55O1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGlmIChzaG91bGRTYXZlKSB7XHJcblx0XHRcdFx0Y29sbGlzaW9uc1swXS5zYXZlUG9zaXRpb24oaXRlbVBvcyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Y29sbGlzaW9uc1swXS5zZXRHcmlkUG9zaXRpb24oaXRlbVBvcyk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuX2ZpeEdyaWRDb2xsaXNpb25zKGl0ZW1Qb3MsIGl0ZW1EaW1zLCBzaG91bGRTYXZlKTtcclxuXHRcdFx0dGhpcy5fYWRkVG9HcmlkKGNvbGxpc2lvbnNbMF0pO1xyXG5cdFx0XHRjb2xsaXNpb25zWzBdLm9uQ2FzY2FkZUV2ZW50KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHByaXZhdGUgX2xpbWl0R3JpZChtYXhDb2xzOiBudW1iZXIpOiB2b2lkIHtcclxuXHRcdGNvbnN0IGl0ZW1zOiBBcnJheTxOZ0dyaWRJdGVtPiA9IHRoaXMuX2l0ZW1zLnNsaWNlKCk7XHJcblx0XHRcclxuXHRcdGl0ZW1zLnNvcnQoKGE6IE5nR3JpZEl0ZW0sIGI6IE5nR3JpZEl0ZW0pID0+IHtcclxuXHRcdFx0bGV0IGFQb3M6IE5nR3JpZEl0ZW1Qb3NpdGlvbiA9IGEuZ2V0U2F2ZWRQb3NpdGlvbigpO1xyXG5cdFx0XHRsZXQgYlBvczogTmdHcmlkSXRlbVBvc2l0aW9uID0gYi5nZXRTYXZlZFBvc2l0aW9uKCk7XHJcblxyXG5cdFx0XHRpZiAoYVBvcy5yb3cgPT0gYlBvcy5yb3cpIHtcclxuXHRcdFx0XHRyZXR1cm4gYVBvcy5jb2wgPT0gYlBvcy5jb2wgPyAwIDogKGFQb3MuY29sIDwgYlBvcy5jb2wgPyAtMSA6IDEpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiBhUG9zLnJvdyA8IGJQb3Mucm93ID8gLTEgOiAxO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0Y29uc3QgY29sdW1uTWF4OiB7IFtjb2w6IG51bWJlcl06IG51bWJlciB9ID0ge307XHJcblx0XHRjb25zdCBsYXJnZXN0R2FwOiB7IFtjb2w6IG51bWJlcl06IG51bWJlciB9ID0ge307XHJcblx0XHRcclxuXHRcdGZvciAobGV0IGk6IG51bWJlciA9IDE7IGkgPD0gbWF4Q29sczsgaSsrKSB7XHJcblx0XHRcdGNvbHVtbk1heFtpXSA9IDE7XHJcblx0XHRcdGxhcmdlc3RHYXBbaV0gPSAxO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRjb25zdCBjdXJQb3M6IE5nR3JpZEl0ZW1Qb3NpdGlvbiA9IHsgY29sOiAxLCByb3c6IDEgfTtcclxuXHRcdGxldCBjdXJyZW50Um93OiBudW1iZXIgPSAxO1xyXG5cdFx0XHJcblx0XHRjb25zdCB3aWxsQ2FzY2FkZTogKGl0ZW06IE5nR3JpZEl0ZW0sIGNvbDogbnVtYmVyKSA9PiBib29sZWFuID0gKGl0ZW06IE5nR3JpZEl0ZW0sIGNvbDogbnVtYmVyKSA9PiB7XHJcblx0XHRcdGZvciAobGV0IGk6IG51bWJlciA9IGNvbDsgaSA8IGNvbCArIGl0ZW0uc2l6ZXg7IGkrKykge1xyXG5cdFx0XHRcdGlmIChjb2x1bW5NYXhbaV0gPT0gY3VycmVudFJvdykgcmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdGludGVyZmFjZSBHcmlkQmxvY2sge1xyXG5cdFx0XHRzdGFydDogbnVtYmVyO1xyXG5cdFx0XHRlbmQ6IG51bWJlcjtcclxuXHRcdFx0bGVuZ3RoOiBudW1iZXI7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHdoaWxlIChpdGVtcy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdGNvbnN0IGNvbHVtbnM6IEFycmF5PEdyaWRCbG9jaz4gPSBbXTtcclxuXHRcdFx0bGV0IG5ld0Jsb2NrOiBHcmlkQmxvY2sgPSB7XHJcblx0XHRcdFx0c3RhcnQ6IDEsXHJcblx0XHRcdFx0ZW5kOiAxLFxyXG5cdFx0XHRcdGxlbmd0aDogMCxcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRcdGZvciAobGV0IGNvbDogbnVtYmVyID0gMTsgY29sIDw9IG1heENvbHM7IGNvbCsrKSB7XHJcblx0XHRcdFx0aWYgKGNvbHVtbk1heFtjb2xdIDw9IGN1cnJlbnRSb3cpIHtcclxuXHRcdFx0XHRcdGlmIChuZXdCbG9jay5sZW5ndGggPT0gMCkge1xyXG5cdFx0XHRcdFx0XHRuZXdCbG9jay5zdGFydCA9IGNvbDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0bmV3QmxvY2subGVuZ3RoKys7XHJcblx0XHRcdFx0XHRuZXdCbG9jay5lbmQgPSBjb2wgKyAxO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAobmV3QmxvY2subGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdFx0Y29sdW1ucy5wdXNoKG5ld0Jsb2NrKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0bmV3QmxvY2sgPSB7XHJcblx0XHRcdFx0XHRcdHN0YXJ0OiBjb2wsXHJcblx0XHRcdFx0XHRcdGVuZDogY29sLFxyXG5cdFx0XHRcdFx0XHRsZW5ndGg6IDAsXHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYgKG5ld0Jsb2NrLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHRjb2x1bW5zLnB1c2gobmV3QmxvY2spO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRsZXQgdGVtcENvbHVtbnM6IEFycmF5PG51bWJlcj4gPSBjb2x1bW5zLm1hcCgoYmxvY2s6IEdyaWRCbG9jaykgPT4gYmxvY2subGVuZ3RoKTtcclxuXHRcdFx0Y29uc3QgY3VycmVudEl0ZW1zOiBBcnJheTxOZ0dyaWRJdGVtPiA9IFtdO1xyXG5cdFx0XHRcclxuXHRcdFx0d2hpbGUgKGl0ZW1zLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHRjb25zdCBpdGVtID0gaXRlbXNbMF07XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYgKGl0ZW0ucm93ID4gY3VycmVudFJvdykgYnJlYWs7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bGV0IGZpdHM6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHRcdFx0XHRmb3IgKGxldCB4IGluIHRlbXBDb2x1bW5zKSB7XHJcblx0XHRcdFx0XHRpZiAoaXRlbS5zaXpleCA8PSB0ZW1wQ29sdW1uc1t4XSkge1xyXG5cdFx0XHRcdFx0XHR0ZW1wQ29sdW1uc1t4XSAtPSBpdGVtLnNpemV4O1xyXG5cdFx0XHRcdFx0XHRmaXRzID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYgKGl0ZW0uc2l6ZXggPiB0ZW1wQ29sdW1uc1t4XSkge1xyXG5cdFx0XHRcdFx0XHR0ZW1wQ29sdW1uc1t4XSA9IDA7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmIChmaXRzKSB7XHJcblx0XHRcdFx0XHRjdXJyZW50SXRlbXMucHVzaChpdGVtcy5zaGlmdCgpKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoY3VycmVudEl0ZW1zLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHRjb25zdCBpdGVtUG9zaXRpb25zOiBBcnJheTxudW1iZXI+ID0gW107XHJcblx0XHRcdFx0bGV0IGxhc3RQb3NpdGlvbjogbnVtYmVyID0gbWF4Q29scztcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRmb3IgKGxldCBpID0gY3VycmVudEl0ZW1zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcblx0XHRcdFx0XHRsZXQgbWF4UG9zaXRpb24gPSAxO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRmb3IgKGxldCBqID0gY29sdW1ucy5sZW5ndGggLSAxOyBqID49IDA7IGotLSkge1xyXG5cdFx0XHRcdFx0XHRpZiAoY29sdW1uc1tqXS5zdGFydCA+IGxhc3RQb3NpdGlvbikgY29udGludWU7XHJcblx0XHRcdFx0XHRcdGlmIChjb2x1bW5zW2pdLnN0YXJ0ID4gKG1heENvbHMgLSBjdXJyZW50SXRlbXNbaV0uc2l6ZXgpKSBjb250aW51ZTtcclxuXHRcdFx0XHRcdFx0aWYgKGNvbHVtbnNbal0ubGVuZ3RoIDwgY3VycmVudEl0ZW1zW2ldLnNpemV4KSBjb250aW51ZTtcclxuXHRcdFx0XHRcdFx0aWYgKGxhc3RQb3NpdGlvbiA8IGNvbHVtbnNbal0uZW5kICYmIChsYXN0UG9zaXRpb24gLSBjb2x1bW5zW2pdLnN0YXJ0KSA8IGN1cnJlbnRJdGVtc1tpXS5zaXpleCkgY29udGludWU7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRtYXhQb3NpdGlvbiA9IChsYXN0UG9zaXRpb24gPCBjb2x1bW5zW2pdLmVuZCA/IGxhc3RQb3NpdGlvbiA6IGNvbHVtbnNbal0uZW5kKSAtIGN1cnJlbnRJdGVtc1tpXS5zaXpleFxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aXRlbVBvc2l0aW9uc1tpXSA9IE1hdGgubWluKG1heFBvc2l0aW9uLCBjdXJyZW50SXRlbXNbaV0ucm93ID09IGN1cnJlbnRSb3cgPyBjdXJyZW50SXRlbXNbaV0uY29sIDogMSk7XHJcblx0XHRcdFx0XHRsYXN0UG9zaXRpb24gPSBpdGVtUG9zaXRpb25zW2ldO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRsZXQgbWluUG9zaXRpb246IG51bWJlciA9IDE7XHJcblx0XHRcdFx0bGV0IGN1cnJlbnRJdGVtOiBudW1iZXIgPSAwO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHdoaWxlIChjdXJyZW50SXRlbXMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdFx0Y29uc3QgaXRlbTogTmdHcmlkSXRlbSA9IGN1cnJlbnRJdGVtcy5zaGlmdCgpO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGNvbHVtbnMubGVuZ3RoOyBqKyspIHtcclxuXHRcdFx0XHRcdFx0aWYgKGNvbHVtbnNbal0ubGVuZ3RoIDwgaXRlbS5zaXpleCkgY29udGludWU7XHJcblx0XHRcdFx0XHRcdGlmIChtaW5Qb3NpdGlvbiA+IGNvbHVtbnNbal0uZW5kKSBjb250aW51ZTtcclxuXHRcdFx0XHRcdFx0aWYgKG1pblBvc2l0aW9uID4gY29sdW1uc1tqXS5zdGFydCAmJiAoY29sdW1uc1tqXS5lbmQgLSBtaW5Qb3NpdGlvbikgPCBpdGVtLnNpemV4KSBjb250aW51ZTtcclxuXHRcdFx0XHRcdFx0aWYgKG1pblBvc2l0aW9uIDwgIGNvbHVtbnNbal0uc3RhcnQpIG1pblBvc2l0aW9uID0gY29sdW1uc1tqXS5zdGFydDtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGl0ZW0uc2V0R3JpZFBvc2l0aW9uKHsgY29sOiBNYXRoLm1heChtaW5Qb3NpdGlvbiwgaXRlbVBvc2l0aW9uc1tjdXJyZW50SXRlbV0pLCByb3c6IGN1cnJlbnRSb3cgfSk7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdG1pblBvc2l0aW9uID0gaXRlbS5jdXJyZW50Q29sICsgaXRlbS5zaXpleDtcclxuXHRcdFx0XHRcdGN1cnJlbnRJdGVtKys7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGZvciAobGV0IGk6IG51bWJlciA9IGl0ZW0uY3VycmVudENvbDsgaSA8IGl0ZW0uY3VycmVudENvbCArIGl0ZW0uc2l6ZXg7IGkrKykge1xyXG5cdFx0XHRcdFx0XHRjb2x1bW5NYXhbaV0gPSBpdGVtLmN1cnJlbnRSb3cgKyBpdGVtLnNpemV5O1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIGlmIChjdXJyZW50SXRlbXMubGVuZ3RoID09PSAwICYmIGNvbHVtbnMubGVuZ3RoID09PSAxICYmIGNvbHVtbnNbMF0ubGVuZ3RoID49IG1heENvbHMpIHtcdC8vXHRPbmx5IG9uZSBibG9jaywgYnV0IG5vIGl0ZW1zIGZpdC4gTWVhbnMgdGhlIG5leHQgaXRlbSBpcyB0b28gbGFyZ2VcclxuXHRcdFx0XHRjb25zdCBpdGVtOiBOZ0dyaWRJdGVtID0gaXRlbXMuc2hpZnQoKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpdGVtLnNldEdyaWRQb3NpdGlvbih7IGNvbDogMSwgcm93OiBjdXJyZW50Um93IH0pO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGZvciAobGV0IGk6IG51bWJlciA9IGl0ZW0uY3VycmVudENvbDsgaSA8IGl0ZW0uY3VycmVudENvbCArIGl0ZW0uc2l6ZXg7IGkrKykge1xyXG5cdFx0XHRcdFx0Y29sdW1uTWF4W2ldID0gaXRlbS5jdXJyZW50Um93ICsgaXRlbS5zaXpleTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGxldCBuZXdSb3c6IG51bWJlciA9IDA7XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IgKGxldCB4IGluIGNvbHVtbk1heCkge1xyXG5cdFx0XHRcdGlmIChjb2x1bW5NYXhbeF0gPiBjdXJyZW50Um93ICYmIChuZXdSb3cgPT0gMCB8fCBjb2x1bW5NYXhbeF0gPCBuZXdSb3cpKSB7XHJcblx0XHRcdFx0XHRuZXdSb3cgPSBjb2x1bW5NYXhbeF07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRjdXJyZW50Um93ID0gbmV3Um93IDw9IGN1cnJlbnRSb3cgPyBjdXJyZW50Um93ICsgMSA6IG5ld1JvdztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgX2Nhc2NhZGVHcmlkKHBvcz86IE5nR3JpZEl0ZW1Qb3NpdGlvbiwgZGltcz86IE5nR3JpZEl0ZW1TaXplLCBzaG91bGRTYXZlOiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xyXG5cdFx0aWYgKHRoaXMuX2Rlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdFx0aWYgKHBvcyAmJiAhZGltcykgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY2FzY2FkZSB3aXRoIG9ubHkgcG9zaXRpb24gYW5kIG5vdCBkaW1lbnNpb25zJyk7XHJcblxyXG5cdFx0aWYgKHRoaXMuaXNEcmFnZ2luZyAmJiB0aGlzLl9kcmFnZ2luZ0l0ZW0gJiYgIXBvcyAmJiAhZGltcykge1xyXG5cdFx0XHRwb3MgPSB0aGlzLl9kcmFnZ2luZ0l0ZW0uZ2V0R3JpZFBvc2l0aW9uKCk7XHJcblx0XHRcdGRpbXMgPSB0aGlzLl9kcmFnZ2luZ0l0ZW0uZ2V0U2l6ZSgpO1xyXG5cdFx0fSBlbHNlIGlmICh0aGlzLmlzUmVzaXppbmcgJiYgdGhpcy5fcmVzaXppbmdJdGVtICYmICFwb3MgJiYgIWRpbXMpIHtcclxuXHRcdFx0cG9zID0gdGhpcy5fcmVzaXppbmdJdGVtLmdldEdyaWRQb3NpdGlvbigpO1xyXG5cdFx0XHRkaW1zID0gdGhpcy5fcmVzaXppbmdJdGVtLmdldFNpemUoKTtcclxuXHRcdH1cclxuXHJcblx0XHRzd2l0Y2ggKHRoaXMuY2FzY2FkZSkge1xyXG5cdFx0XHRjYXNlICd1cCc6XHJcblx0XHRcdGNhc2UgJ2Rvd24nOlxyXG5cdFx0XHRcdGNvbnN0IGxvd1JvdzogQXJyYXk8bnVtYmVyPiA9IFswXTtcclxuXHJcblx0XHRcdFx0Zm9yIChsZXQgaTogbnVtYmVyID0gMTsgaSA8PSB0aGlzLl9jdXJNYXhDb2w7IGkrKylcclxuXHRcdFx0XHRcdGxvd1Jvd1tpXSA9IDE7XHJcblxyXG5cdFx0XHRcdGZvciAobGV0IHI6IG51bWJlciA9IDE7IHIgPD0gdGhpcy5fY3VyTWF4Um93OyByKyspIHtcclxuXHRcdFx0XHRcdGlmICh0aGlzLl9pdGVtR3JpZFtyXSA9PSB1bmRlZmluZWQpIGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRcdGZvciAobGV0IGM6IG51bWJlciA9IDE7IGMgPD0gdGhpcy5fY3VyTWF4Q29sOyBjKyspIHtcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuX2l0ZW1HcmlkW3JdID09IHVuZGVmaW5lZCkgYnJlYWs7XHJcblx0XHRcdFx0XHRcdGlmIChyIDwgbG93Um93W2NdKSBjb250aW51ZTtcclxuXHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLl9pdGVtR3JpZFtyXVtjXSAhPSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgaXRlbTogTmdHcmlkSXRlbSA9IHRoaXMuX2l0ZW1HcmlkW3JdW2NdO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChpdGVtLmlzRml4ZWQpIGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRjb25zdCBpdGVtRGltczogTmdHcmlkSXRlbVNpemUgPSBpdGVtLmdldFNpemUoKTtcclxuXHRcdFx0XHRcdFx0XHRjb25zdCBpdGVtUG9zOiBOZ0dyaWRJdGVtUG9zaXRpb24gPSBpdGVtLmdldEdyaWRQb3NpdGlvbigpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoaXRlbVBvcy5jb2wgIT0gYyB8fCBpdGVtUG9zLnJvdyAhPSByKSBjb250aW51ZTtcdC8vXHRJZiB0aGlzIGlzIG5vdCB0aGUgZWxlbWVudCdzIHN0YXJ0XHJcblxyXG5cdFx0XHRcdFx0XHRcdGxldCBsb3dlc3Q6IG51bWJlciA9IGxvd1Jvd1tjXTtcclxuXHJcblx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgaTogbnVtYmVyID0gMTsgaSA8IGl0ZW1EaW1zLng7IGkrKykge1xyXG5cdFx0XHRcdFx0XHRcdFx0bG93ZXN0ID0gTWF0aC5tYXgobG93Um93WyhjICsgaSldLCBsb3dlc3QpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKHBvcyAmJiAoYyArIGl0ZW1EaW1zLngpID4gcG9zLmNvbCAmJiBjIDwgKHBvcy5jb2wgKyBkaW1zLngpKSB7ICAgICAgICAgIC8vXHRJZiBvdXIgZWxlbWVudCBpcyBpbiBvbmUgb2YgdGhlIGl0ZW0ncyBjb2x1bW5zXHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoKHIgPj0gcG9zLnJvdyAmJiByIDwgKHBvcy5yb3cgKyBkaW1zLnkpKSB8fCAgICAgICAgICAgICAgICAgICAgICAgICAvL1x0SWYgdGhpcyByb3cgaXMgb2NjdXBpZWQgYnkgb3VyIGVsZW1lbnRcclxuXHRcdFx0XHRcdFx0XHRcdFx0KChpdGVtRGltcy55ID4gKHBvcy5yb3cgLSBsb3dlc3QpKSAmJiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1x0T3IgdGhlIGl0ZW0gY2FuJ3QgZml0IGFib3ZlIG91ciBlbGVtZW50XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0KHIgPj0gKHBvcy5yb3cgKyBkaW1zLnkpICYmIGxvd2VzdCA8IChwb3Mucm93ICsgZGltcy55KSkpKSB7ICAgIC8vXHRcdEFuZCB0aGlzIHJvdyBpcyBiZWxvdyBvdXIgZWxlbWVudCwgYnV0IHdlIGhhdmVuJ3QgY2F1Z2h0IGl0XHJcblx0XHRcdFx0XHRcdFx0XHRcdGxvd2VzdCA9IE1hdGgubWF4KGxvd2VzdCwgcG9zLnJvdyArIGRpbXMueSk7ICAgICAgICAgICAgICAgICAgICAgICAgLy9cdFNldCB0aGUgbG93ZXN0IHJvdyB0byBiZSBiZWxvdyBpdFxyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHRjb25zdCBuZXdQb3M6IE5nR3JpZEl0ZW1Qb3NpdGlvbiA9IHsgY29sOiBjLCByb3c6IGxvd2VzdCB9O1xyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdGlmIChsb3dlc3QgIT0gaXRlbVBvcy5yb3cgJiYgdGhpcy5faXNXaXRoaW5Cb3VuZHNZKG5ld1BvcywgaXRlbURpbXMpKSB7XHQvL1x0SWYgdGhlIGl0ZW0gaXMgbm90IGFscmVhZHkgb24gdGhpcyByb3cgbW92ZSBpdCB1cFxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5fcmVtb3ZlRnJvbUdyaWQoaXRlbSk7XHJcblx0XHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChzaG91bGRTYXZlKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGl0ZW0uc2F2ZVBvc2l0aW9uKG5ld1Bvcyk7XHJcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRpdGVtLnNldEdyaWRQb3NpdGlvbihuZXdQb3MpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0XHRpdGVtLm9uQ2FzY2FkZUV2ZW50KCk7XHJcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9hZGRUb0dyaWQoaXRlbSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgaXRlbURpbXMueDsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRsb3dSb3dbYyArIGldID0gbG93ZXN0ICsgaXRlbURpbXMueTtcdC8vXHRVcGRhdGUgdGhlIGxvd2VzdCByb3cgdG8gYmUgYmVsb3cgdGhlIGl0ZW1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgJ2xlZnQnOlxyXG5cdFx0XHRjYXNlICdyaWdodCc6XHJcblx0XHRcdFx0Y29uc3QgbG93Q29sOiBBcnJheTxudW1iZXI+ID0gWzBdO1xyXG5cclxuXHRcdFx0XHRmb3IgKGxldCBpOiBudW1iZXIgPSAxOyBpIDw9IHRoaXMuX2N1ck1heFJvdzsgaSsrKVxyXG5cdFx0XHRcdFx0bG93Q29sW2ldID0gMTtcclxuXHJcblx0XHRcdFx0Zm9yIChsZXQgcjogbnVtYmVyID0gMTsgciA8PSB0aGlzLl9jdXJNYXhSb3c7IHIrKykge1xyXG5cdFx0XHRcdFx0aWYgKHRoaXMuX2l0ZW1HcmlkW3JdID09IHVuZGVmaW5lZCkgY29udGludWU7XHJcblxyXG5cdFx0XHRcdFx0Zm9yIChsZXQgYzogbnVtYmVyID0gMTsgYyA8PSB0aGlzLl9jdXJNYXhDb2w7IGMrKykge1xyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5faXRlbUdyaWRbcl0gPT0gdW5kZWZpbmVkKSBicmVhaztcclxuXHRcdFx0XHRcdFx0aWYgKGMgPCBsb3dDb2xbcl0pIGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuX2l0ZW1HcmlkW3JdW2NdICE9IG51bGwpIHtcclxuXHRcdFx0XHRcdFx0XHRjb25zdCBpdGVtOiBOZ0dyaWRJdGVtID0gdGhpcy5faXRlbUdyaWRbcl1bY107XHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgaXRlbURpbXM6IE5nR3JpZEl0ZW1TaXplID0gaXRlbS5nZXRTaXplKCk7XHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgaXRlbVBvczogTmdHcmlkSXRlbVBvc2l0aW9uID0gaXRlbS5nZXRHcmlkUG9zaXRpb24oKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKGl0ZW1Qb3MuY29sICE9IGMgfHwgaXRlbVBvcy5yb3cgIT0gcikgY29udGludWU7XHQvL1x0SWYgdGhpcyBpcyBub3QgdGhlIGVsZW1lbnQncyBzdGFydFxyXG5cclxuXHRcdFx0XHRcdFx0XHRsZXQgbG93ZXN0OiBudW1iZXIgPSBsb3dDb2xbcl07XHJcblxyXG5cdFx0XHRcdFx0XHRcdGZvciAobGV0IGk6IG51bWJlciA9IDE7IGkgPCBpdGVtRGltcy55OyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHRcdGxvd2VzdCA9IE1hdGgubWF4KGxvd0NvbFsociArIGkpXSwgbG93ZXN0KTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmIChwb3MgJiYgKHIgKyBpdGVtRGltcy55KSA+IHBvcy5yb3cgJiYgciA8IChwb3Mucm93ICsgZGltcy55KSkgeyAgICAgICAgICAvL1x0SWYgb3VyIGVsZW1lbnQgaXMgaW4gb25lIG9mIHRoZSBpdGVtJ3Mgcm93c1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKChjID49IHBvcy5jb2wgJiYgYyA8IChwb3MuY29sICsgZGltcy54KSkgfHwgICAgICAgICAgICAgICAgICAgICAgICAgLy9cdElmIHRoaXMgY29sIGlzIG9jY3VwaWVkIGJ5IG91ciBlbGVtZW50XHJcblx0XHRcdFx0XHRcdFx0XHRcdCgoaXRlbURpbXMueCA+IChwb3MuY29sIC0gbG93ZXN0KSkgJiYgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9cdE9yIHRoZSBpdGVtIGNhbid0IGZpdCBhYm92ZSBvdXIgZWxlbWVudFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdChjID49IChwb3MuY29sICsgZGltcy54KSAmJiBsb3dlc3QgPCAocG9zLmNvbCArIGRpbXMueCkpKSkgeyAgICAvL1x0XHRBbmQgdGhpcyBjb2wgaXMgYmVsb3cgb3VyIGVsZW1lbnQsIGJ1dCB3ZSBoYXZlbid0IGNhdWdodCBpdFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRsb3dlc3QgPSBNYXRoLm1heChsb3dlc3QsIHBvcy5jb2wgKyBkaW1zLngpOyAgICAgICAgICAgICAgICAgICAgICAgIC8vXHRTZXQgdGhlIGxvd2VzdCBjb2wgdG8gYmUgYmVsb3cgaXRcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgbmV3UG9zOiBOZ0dyaWRJdGVtUG9zaXRpb24gPSB7IGNvbDogbG93ZXN0LCByb3c6IHIgfTtcclxuXHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHRpZiAobG93ZXN0ICE9IGl0ZW1Qb3MuY29sICYmIHRoaXMuX2lzV2l0aGluQm91bmRzWChuZXdQb3MsIGl0ZW1EaW1zKSkge1x0Ly9cdElmIHRoZSBpdGVtIGlzIG5vdCBhbHJlYWR5IG9uIHRoaXMgY29sIG1vdmUgaXQgdXBcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX3JlbW92ZUZyb21HcmlkKGl0ZW0pO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoc2hvdWxkU2F2ZSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRpdGVtLnNhdmVQb3NpdGlvbihuZXdQb3MpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0aXRlbS5zZXRHcmlkUG9zaXRpb24obmV3UG9zKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdFx0aXRlbS5vbkNhc2NhZGVFdmVudCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5fYWRkVG9HcmlkKGl0ZW0pO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGl0ZW1EaW1zLnk7IGkrKykge1xyXG5cdFx0XHRcdFx0XHRcdFx0bG93Q29sW3IgKyBpXSA9IGxvd2VzdCArIGl0ZW1EaW1zLng7XHQvL1x0VXBkYXRlIHRoZSBsb3dlc3QgY29sIHRvIGJlIGJlbG93IHRoZSBpdGVtXHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfZml4R3JpZFBvc2l0aW9uKHBvczogTmdHcmlkSXRlbVBvc2l0aW9uLCBkaW1zOiBOZ0dyaWRJdGVtU2l6ZSk6IE5nR3JpZEl0ZW1Qb3NpdGlvbiB7XHJcblx0XHR3aGlsZSAodGhpcy5faGFzR3JpZENvbGxpc2lvbihwb3MsIGRpbXMpIHx8ICF0aGlzLl9pc1dpdGhpbkJvdW5kcyhwb3MsIGRpbXMpKSB7XHJcblx0XHRcdGlmICh0aGlzLl9oYXNHcmlkQ29sbGlzaW9uKHBvcywgZGltcykpIHtcclxuXHRcdFx0XHRzd2l0Y2ggKHRoaXMuY2FzY2FkZSkge1xyXG5cdFx0XHRcdFx0Y2FzZSAndXAnOlxyXG5cdFx0XHRcdFx0Y2FzZSAnZG93bic6XHJcblx0XHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0XHRwb3Mucm93Kys7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSAnbGVmdCc6XHJcblx0XHRcdFx0XHRjYXNlICdyaWdodCc6XHJcblx0XHRcdFx0XHRcdHBvcy5jb2wrKztcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cclxuXHRcdFx0aWYgKCF0aGlzLl9pc1dpdGhpbkJvdW5kc1kocG9zLCBkaW1zKSkge1xyXG5cdFx0XHRcdHBvcy5jb2wrKztcclxuXHRcdFx0XHRwb3Mucm93ID0gMTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIXRoaXMuX2lzV2l0aGluQm91bmRzWChwb3MsIGRpbXMpKSB7XHJcblx0XHRcdFx0cG9zLnJvdysrO1xyXG5cdFx0XHRcdHBvcy5jb2wgPSAxO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcG9zO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfaXNXaXRoaW5Cb3VuZHNYKHBvczogTmdHcmlkSXRlbVBvc2l0aW9uLCBkaW1zOiBOZ0dyaWRJdGVtU2l6ZSkge1xyXG5cdFx0cmV0dXJuICh0aGlzLl9tYXhDb2xzID09IDAgfHwgKHBvcy5jb2wgKyBkaW1zLnggLSAxKSA8PSB0aGlzLl9tYXhDb2xzKTtcclxuXHR9XHJcblx0cHJpdmF0ZSBfaXNXaXRoaW5Cb3VuZHNZKHBvczogTmdHcmlkSXRlbVBvc2l0aW9uLCBkaW1zOiBOZ0dyaWRJdGVtU2l6ZSkge1xyXG5cdFx0cmV0dXJuICh0aGlzLl9tYXhSb3dzID09IDAgfHwgKHBvcy5yb3cgKyBkaW1zLnkgLSAxKSA8PSB0aGlzLl9tYXhSb3dzKTtcclxuXHR9XHJcblx0cHJpdmF0ZSBfaXNXaXRoaW5Cb3VuZHMocG9zOiBOZ0dyaWRJdGVtUG9zaXRpb24sIGRpbXM6IE5nR3JpZEl0ZW1TaXplKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5faXNXaXRoaW5Cb3VuZHNYKHBvcywgZGltcykgJiYgdGhpcy5faXNXaXRoaW5Cb3VuZHNZKHBvcywgZGltcyk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIF9hZGRUb0dyaWQoaXRlbTogTmdHcmlkSXRlbSk6IHZvaWQge1xyXG5cdFx0bGV0IHBvczogTmdHcmlkSXRlbVBvc2l0aW9uID0gaXRlbS5nZXRHcmlkUG9zaXRpb24oKTtcclxuXHRcdGNvbnN0IGRpbXM6IE5nR3JpZEl0ZW1TaXplID0gaXRlbS5nZXRTaXplKCk7XHJcblxyXG5cdFx0aWYgKHRoaXMuX2hhc0dyaWRDb2xsaXNpb24ocG9zLCBkaW1zKSkge1xyXG5cdFx0XHR0aGlzLl9maXhHcmlkQ29sbGlzaW9ucyhwb3MsIGRpbXMpO1xyXG5cdFx0XHRwb3MgPSBpdGVtLmdldEdyaWRQb3NpdGlvbigpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAobGV0IGo6IG51bWJlciA9IDA7IGogPCBkaW1zLnk7IGorKykge1xyXG5cdFx0XHRpZiAodGhpcy5faXRlbUdyaWRbcG9zLnJvdyArIGpdID09IG51bGwpIHRoaXMuX2l0ZW1HcmlkW3Bvcy5yb3cgKyBqXSA9IHt9O1xyXG5cdFx0XHRcclxuXHRcdFx0Zm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGRpbXMueDsgaSsrKSB7XHJcblx0XHRcdFx0dGhpcy5faXRlbUdyaWRbcG9zLnJvdyArIGpdW3Bvcy5jb2wgKyBpXSA9IGl0ZW07XHJcblxyXG5cdFx0XHRcdHRoaXMuX3VwZGF0ZVNpemUocG9zLmNvbCArIGRpbXMueCAtIDEsIHBvcy5yb3cgKyBkaW1zLnkgLSAxKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfcmVtb3ZlRnJvbUdyaWQoaXRlbTogTmdHcmlkSXRlbSk6IHZvaWQge1xyXG5cdFx0Zm9yIChsZXQgeSBpbiB0aGlzLl9pdGVtR3JpZClcclxuXHRcdFx0Zm9yIChsZXQgeCBpbiB0aGlzLl9pdGVtR3JpZFt5XSlcclxuXHRcdFx0XHRpZiAodGhpcy5faXRlbUdyaWRbeV1beF0gPT0gaXRlbSlcclxuXHRcdFx0XHRcdGRlbGV0ZSB0aGlzLl9pdGVtR3JpZFt5XVt4XTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgX3VwZGF0ZVNpemUoY29sPzogbnVtYmVyLCByb3c/OiBudW1iZXIpOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLl9kZXN0cm95ZWQpIHJldHVybjtcclxuXHRcdGNvbCA9IChjb2wgPT0gdW5kZWZpbmVkKSA/IHRoaXMuX2dldE1heENvbCgpIDogY29sO1xyXG5cdFx0cm93ID0gKHJvdyA9PSB1bmRlZmluZWQpID8gdGhpcy5fZ2V0TWF4Um93KCkgOiByb3c7XHJcblxyXG5cdFx0bGV0IG1heENvbDogbnVtYmVyID0gTWF0aC5tYXgodGhpcy5fY3VyTWF4Q29sLCBjb2wpO1xyXG5cdFx0bGV0IG1heFJvdzogbnVtYmVyID0gTWF0aC5tYXgodGhpcy5fY3VyTWF4Um93LCByb3cpO1xyXG5cdFx0XHJcblx0XHRpZiAobWF4Q29sICE9IHRoaXMuX2N1ck1heENvbCB8fCBtYXhSb3cgIT0gdGhpcy5fY3VyTWF4Um93KSB7XHJcblx0XHRcdHRoaXMuX2N1ck1heENvbCA9IG1heENvbDtcclxuXHRcdFx0dGhpcy5fY3VyTWF4Um93ID0gbWF4Um93O1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5fcmVuZGVyZXIuc2V0RWxlbWVudFN0eWxlKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwgJ3dpZHRoJywgJzEwMCUnKTsvLyhtYXhDb2wgKiAodGhpcy5jb2xXaWR0aCArIHRoaXMubWFyZ2luTGVmdCArIHRoaXMubWFyZ2luUmlnaHQpKSsncHgnKTtcclxuXHRcdFx0dGhpcy5fcmVuZGVyZXIuc2V0RWxlbWVudFN0eWxlKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwgJ2hlaWdodCcsICh0aGlzLl9jdXJNYXhSb3cgKiAodGhpcy5yb3dIZWlnaHQgKyB0aGlzLm1hcmdpblRvcCArIHRoaXMubWFyZ2luQm90dG9tKSkgKyAncHgnKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgX2dldE1heFJvdygpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIE1hdGgubWF4LmFwcGx5KG51bGwsIHRoaXMuX2l0ZW1zLm1hcCgoaXRlbTogTmdHcmlkSXRlbSkgPT4gaXRlbS5nZXRHcmlkUG9zaXRpb24oKS5yb3cgKyBpdGVtLmdldFNpemUoKS55IC0gMSkpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfZ2V0TWF4Q29sKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gTWF0aC5tYXguYXBwbHkobnVsbCwgdGhpcy5faXRlbXMubWFwKChpdGVtOiBOZ0dyaWRJdGVtKSA9PiBpdGVtLmdldEdyaWRQb3NpdGlvbigpLmNvbCArIGl0ZW0uZ2V0U2l6ZSgpLnggLSAxKSk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIF9nZXRNb3VzZVBvc2l0aW9uKGU6IGFueSk6IE5nR3JpZFJhd1Bvc2l0aW9uIHtcclxuXHRcdGlmICgoKDxhbnk+d2luZG93KS5Ub3VjaEV2ZW50ICYmIGUgaW5zdGFuY2VvZiBUb3VjaEV2ZW50KSB8fCAoZS50b3VjaGVzIHx8IGUuY2hhbmdlZFRvdWNoZXMpKSB7XHJcblx0XHRcdGUgPSBlLnRvdWNoZXMubGVuZ3RoID4gMCA/IGUudG91Y2hlc1swXSA6IGUuY2hhbmdlZFRvdWNoZXNbMF07XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgcmVmUG9zOiBhbnkgPSB0aGlzLl9uZ0VsLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG5cdFx0bGV0IGxlZnQ6IG51bWJlciA9IGUuY2xpZW50WCAtIHJlZlBvcy5sZWZ0O1xyXG5cdFx0bGV0IHRvcDogbnVtYmVyID0gZS5jbGllbnRZIC0gcmVmUG9zLnRvcDtcclxuXHJcblx0XHRpZiAodGhpcy5jYXNjYWRlID09ICdkb3duJykgdG9wID0gcmVmUG9zLnRvcCArIHJlZlBvcy5oZWlnaHQgLSBlLmNsaWVudFk7XHJcblx0XHRpZiAodGhpcy5jYXNjYWRlID09ICdyaWdodCcpIGxlZnQgPSByZWZQb3MubGVmdCArIHJlZlBvcy53aWR0aCAtIGUuY2xpZW50WDtcclxuXHRcdFxyXG5cdFx0aWYgKHRoaXMuaXNEcmFnZ2luZyAmJiB0aGlzLl96b29tT25EcmFnKSB7XHJcblx0XHRcdGxlZnQgKj0gMjtcclxuXHRcdFx0dG9wICo9IDI7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGxlZnQ6IGxlZnQsXHJcblx0XHRcdHRvcDogdG9wXHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfZ2V0QWJzb2x1dGVNb3VzZVBvc2l0aW9uKGU6IGFueSk6IE5nR3JpZFJhd1Bvc2l0aW9uIHtcclxuXHRcdGlmICgoKDxhbnk+d2luZG93KS5Ub3VjaEV2ZW50ICYmIGUgaW5zdGFuY2VvZiBUb3VjaEV2ZW50KSB8fCAoZS50b3VjaGVzIHx8IGUuY2hhbmdlZFRvdWNoZXMpKSB7XHJcblx0XHRcdGUgPSBlLnRvdWNoZXMubGVuZ3RoID4gMCA/IGUudG91Y2hlc1swXSA6IGUuY2hhbmdlZFRvdWNoZXNbMF07XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0bGVmdDogZS5jbGllbnRYLFxyXG5cdFx0XHR0b3A6IGUuY2xpZW50WVxyXG5cdFx0fTtcclxuXHR9XHJcblx0XHJcblx0cHJpdmF0ZSBfZ2V0Q29udGFpbmVyQ29sdW1ucygpOiBudW1iZXIge1xyXG5cdFx0Y29uc3QgbWF4V2lkdGg6IG51bWJlciA9IHRoaXMuX25nRWwubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcclxuXHRcdHJldHVybiBNYXRoLmZsb29yKG1heFdpZHRoIC8gKHRoaXMuY29sV2lkdGggKyB0aGlzLm1hcmdpbkxlZnQgKyB0aGlzLm1hcmdpblJpZ2h0KSk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIF9nZXRJdGVtRnJvbVBvc2l0aW9uKHBvc2l0aW9uOiBOZ0dyaWRSYXdQb3NpdGlvbik6IE5nR3JpZEl0ZW0ge1xyXG5cdFx0Zm9yIChsZXQgaXRlbSBvZiB0aGlzLl9pdGVtcykge1xyXG5cdFx0XHRjb25zdCBzaXplOiBOZ0dyaWRJdGVtRGltZW5zaW9ucyA9IGl0ZW0uZ2V0RGltZW5zaW9ucygpO1xyXG5cdFx0XHRjb25zdCBwb3M6IE5nR3JpZFJhd1Bvc2l0aW9uID0gaXRlbS5nZXRQb3NpdGlvbigpO1xyXG5cclxuXHRcdFx0aWYgKHBvc2l0aW9uLmxlZnQgPiAocG9zLmxlZnQgKyB0aGlzLm1hcmdpbkxlZnQpICYmIHBvc2l0aW9uLmxlZnQgPCAocG9zLmxlZnQgKyB0aGlzLm1hcmdpbkxlZnQgKyBzaXplLndpZHRoKSAmJlxyXG5cdFx0XHRcdHBvc2l0aW9uLnRvcCA+IChwb3MudG9wICsgdGhpcy5tYXJnaW5Ub3ApICYmIHBvc2l0aW9uLnRvcCA8IChwb3MudG9wICsgdGhpcy5tYXJnaW5Ub3AgKyBzaXplLmhlaWdodCkpIHtcclxuXHRcdFx0XHRyZXR1cm4gaXRlbTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBudWxsO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfY3JlYXRlUGxhY2Vob2xkZXIoaXRlbTogTmdHcmlkSXRlbSk6IHZvaWQge1xyXG5cdFx0Y29uc3QgcG9zOiBOZ0dyaWRJdGVtUG9zaXRpb24gPSBpdGVtLmdldEdyaWRQb3NpdGlvbigpO1xyXG5cdFx0Y29uc3QgZGltczogTmdHcmlkSXRlbVNpemUgPSBpdGVtLmdldFNpemUoKTtcclxuXHJcbiAgICAgICAgY29uc3QgZmFjdG9yeSA9IHRoaXMuY29tcG9uZW50RmFjdG9yeVJlc29sdmVyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KE5nR3JpZFBsYWNlaG9sZGVyKTtcclxuICAgICAgICB2YXIgY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8TmdHcmlkUGxhY2Vob2xkZXI+ID0gaXRlbS5jb250YWluZXJSZWYuY3JlYXRlQ29tcG9uZW50KGZhY3RvcnkpO1xyXG4gICAgICAgIHRoaXMuX3BsYWNlaG9sZGVyUmVmID0gY29tcG9uZW50UmVmO1xyXG4gICAgICAgIGNvbnN0IHBsYWNlaG9sZGVyOiBOZ0dyaWRQbGFjZWhvbGRlciA9IGNvbXBvbmVudFJlZi5pbnN0YW5jZTtcclxuICAgICAgICBwbGFjZWhvbGRlci5yZWdpc3RlckdyaWQodGhpcyk7XHJcbiAgICAgICAgcGxhY2Vob2xkZXIuc2V0Q2FzY2FkZU1vZGUodGhpcy5jYXNjYWRlKTtcclxuICAgICAgICBwbGFjZWhvbGRlci5zZXRHcmlkUG9zaXRpb24oeyBjb2w6IHBvcy5jb2wsIHJvdzogcG9zLnJvdyB9KTtcclxuICAgICAgICBwbGFjZWhvbGRlci5zZXRTaXplKHsgeDogZGltcy54LCB5OiBkaW1zLnkgfSk7XHJcblx0fVxyXG59Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
