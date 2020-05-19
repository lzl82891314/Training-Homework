'use strict';

import { Excel } from '../model/excel';
import { ViewRender } from '../view/viewrender';
import { EventUtil } from '../infrastructure/util';

/**
 * Excel程序处理器
 * 充当MVC中的controller层
 */
export class ExcelController {
    constructor() {
        this.currentExcel = undefined;
        this.excels = [];
        this.viewRender = new ViewRender();
    }

    startup(row = 25, column = 25) {
        this.currentExcel = new Excel(row, column);
        this.excels.push(this.currentExcel);
        const renderingModel = this.currentExcel.generateRenderingModel();
        this.viewRender.render(renderingModel);
        this._eventBinding();
    }

    _eventBinding() {
        EventUtil.addEvent(document, 'mousedown', this._mouseDownResizeHandler);
        EventUtil.addEvent(document, 'mousemove', this._mouseMovingResizeHandler);
        EventUtil.addEvent(document, 'mouseup', this._mouseUpResizeHandler);

        EventUtil.addEvent(document, 'mousedown', this._mouseDownCellSelectedHandler);
        EventUtil.addEvent(document, 'mousemove', this._mouseMovingCellsSelectedHandler);
        EventUtil.addEvent(document, 'mouseup', this._mouseUpCellSelectedHandler);

        const container = document.getElementById('container');
        EventUtil.addEvent(container, 'dblclick', this._dblclickInputHandler);
        EventUtil.addEvent(container, 'scroll', this._scrollHandler);
        EventUtil.addEvent(container, 'wheel', this._wheelHandler);
        const input = document.getElementById('input');
        EventUtil.addEvent(input, 'blur', this._blurCellInputHandler);

        const scroll = document.getElementsByClassName('scroll');
        for (let index = 0; index < scroll.length; index++) {
            EventUtil.addEvent(scroll[index], 'scroll', this._scrollHandler);
            EventUtil.addEvent(scroll[index], 'blur', this._endScrollHandler);
        }
        EventUtil.addEvent(container, 'mousedown', this._mouseDownContextMenuHandler);
        EventUtil.addEvent(document, 'click', this._clickContextMenuHiddenHandler);

        const updateSpan = document.getElementsByClassName('update-span');
        for (let index = 0; index < updateSpan.length; index++) {
            EventUtil.addEvent(updateSpan[index], 'click', this._clickUpdateHandler);
        }

        const btn = document.getElementById('btnChange');
        EventUtil.addEvent(btn, 'click', this._clickStartupHandler);
    }

    _mouseDownResizeHandler = (event) => {
        if (!this.currentExcel.isValidEvent('ResizeMouseDown', event)) {
            return false;
        }
        const refreshModel = this.currentExcel.beginResize(event);
        this.viewRender.refresh(refreshModel);
    };

    _mouseMovingResizeHandler = (event) => {
        if (!this.currentExcel.isValidEvent('ResizeMouseMove', event)) {
            return false;
        }
        const refreshModel = this.currentExcel.resizing(event);
        this.viewRender.refresh(refreshModel);
    };

    _mouseUpResizeHandler = (event) => {
        if (!this.currentExcel.isValidEvent('ResizeMouseUp', event)) {
            return false;
        }
        const endResizingRefresh = this.currentExcel.endResizing(event);
        this.viewRender.resize(endResizingRefresh);
        const refreshModel = this.currentExcel.endResize();
        this.viewRender.refresh(refreshModel);
    };

    _mouseDownCellSelectedHandler = (event) => {
        if (!this.currentExcel.isValidEvent('SelectedMouseDown', event)) {
            return false;
        }
        const refreshModel = this.currentExcel.beginSelected(event);
        this.viewRender.refresh(refreshModel);
    };

    _mouseMovingCellsSelectedHandler = (event) => {
        if (!this.currentExcel.isValidEvent('SelectedMouseMove', event)) {
            return false;
        }
        const refreshModel = this.currentExcel.selecting(event);
        if (refreshModel) {
            this.viewRender.refresh(refreshModel);
        }
    };

    _mouseUpCellSelectedHandler = (event) => {
        if (!this.currentExcel.isValidEvent('SelectedMouseUp', event)) {
            return false;
        }
        this.currentExcel.endSelected();
    };

    _dblclickInputHandler = (event) => {
        if (!this.currentExcel.isValidEvent('InputDblclick', event)) {
            return false;
        }
        const refreshModel = this.currentExcel.inputting(event);
        this.viewRender.refresh(refreshModel);
    };

    _blurCellInputHandler = (event) => {
        if (!this.currentExcel.isValidEvent('InputBlur', event)) {
            return false;
        }
        const refreshModel = this.currentExcel.endInput(event);
        this.viewRender.refresh(refreshModel);
    };

    _scrollHandler = (event) => {
        if (!this.currentExcel.isValidEvent('Scrolling', event)) {
            return false;
        }
        const tableRefresh = this.currentExcel.scrolling(event);
        if (tableRefresh && tableRefresh.step) {
            this.viewRender.tableRefresh(tableRefresh);
            const dataRefresh = this.currentExcel.wheeling(tableRefresh.step);
            if (dataRefresh) {
                this.viewRender.dataRefresh(dataRefresh);
            }
        }
    };

    _endScrollHandler = () => {
        this.currentExcel.endScroll();
    };

    _wheelHandler = (event) => {
        if (!this.currentExcel.isValidEvent('Wheeling', event)) {
            return false;
        }
        this.currentExcel.beginWheel();
    };

    _mouseDownContextMenuHandler = (event) => {
        if (!this.currentExcel.isValidEvent('ContextMenu', event)) {
            return false;
        }
        if (event.which === 3) {
            const refreshModel = this.currentExcel.beginUpdate(event);
            this.viewRender.refresh(refreshModel);
        } else if (event.which === 1) {
            const refreshModel = this.currentExcel.beginSelected(event);
            this.viewRender.refresh(refreshModel);
        }
    };

    _clickContextMenuHiddenHandler = (event) => {
        const refresh = this.currentExcel.hidingContextMenu(event);
        if (refresh) {
            this.viewRender.refresh(refresh);
        }
    };

    _clickUpdateHandler = (event) => {
        if (!this.currentExcel.isValidEvent('Updating', event)) {
            return false;
        }
        const tableRefresh = this.currentExcel.updating(event);
        if (tableRefresh) {
            const renderingModel = this.currentExcel.generateRenderingModel();
            this.viewRender.render(renderingModel);
            this.viewRender.tableRefresh(tableRefresh);
            const dataRefresh = this.currentExcel.endUpdate();
            if (dataRefresh) {
                this.viewRender.dataRefresh(dataRefresh);
            }
        }
    };

    _clickStartupHandler = () => {
        let row = document.getElementById('row-value').value;
        let column = document.getElementById('column-value').value;

        if (Number.isNaN(row) || Number(row) <= 0) {
            row = 2000;
        }
        if (Number.isNaN(column) || Number(column) <= 0) {
            column = 2000;
        }

        row = Number(row);
        column = Number(column);

        this.startup(row, column);
    };
}
