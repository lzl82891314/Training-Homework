'use strict';

import { RenderingModel } from '../viewmodel/renderingmodel';
import { RefreshModel } from '../viewmodel/refreshmodel';
import { EventHandler } from './eventhandler';
import { TableRefreshModel, DataRefreshModel } from '../viewmodel/scrollingrefreshmodel';
import { ResizeModel } from '../viewmodel/resizemodel';
import { CharCodeUtil, ArrayExtension } from '../infrastructure/util';

/**
 * Excel数据类
 * 充当MVC中的Model层
 */
export class Excel {
    constructor(row, column) {
        // 初始化常量
        this._constantInitialize(row, column);

        // 初始化成员变量
        this.currentHeadCell = undefined;
        this.currentDirection = undefined;

        this.dottedLine = undefined;
        this.borderTop = document.getElementById('border-top');
        this.borderLeft = document.getElementById('border-left');
        this.borderRight = document.getElementById('border-right');
        this.borderBottom = document.getElementById('border-bottom');
        this.selectedCells = [];
        this.currentCell = undefined;
        this.startCell = undefined;
        this.isSelected = false;
        this.selectedData = {};
        this.inputCell = undefined;
        this.inputData = [];

        this.beginResizeEvent = undefined;

        this.eventHandler = new EventHandler();
        this.eventValidator = {};

        this.verticalScroll = document.getElementById('verticalScroll');
        this.horizonScroll = document.getElementById('horizonScroll');
        this.verticalStart = 0;
        this.horizonStart = 0;

        this.styleData = [];
        this.updateData = undefined;

        this._eventValidatorInitialize();
    }

    /**
     * 常量属性初始化
     */
    _constantInitialize(row, column) {
        /**
         * 默认行列数
         */
        this.ROW_COLUMN_COUNT_DEFAULT = 20;
        /**
         * 行数
         */
        this.ROW_COUNT = this.ROW_COLUMN_COUNT_DEFAULT;
        /**
         * 列数
         */
        this.COLUMN_COUNT = this.ROW_COLUMN_COUNT_DEFAULT;

        // 初始化输入参数
        if (!Number.isNaN(row)) {
            if (row > 0) {
                this.ROW_COUNT = row;
            }
        }
        if (!Number.isNaN(column)) {
            if (column > 0) {
                this.COLUMN_COUNT = column;
            }
        }

        /**
         * 最小界定px，如果小于此值，说明操作的是上一个Cell
         */
        this.MIN_PX = 10;

        /**
         * 最小单元格宽度
         */
        this.MIN_WIDTH = 60;

        /**
         * 最小单元格高度
         */
        this.MIN_HEIGHT = 25;

        /**
         * 单元格选中边界偏移量
         */
        this.BORDER_OFFSET = 0;

        this.MAX_COLUMN = this.COLUMN_COUNT < 22 ? this.COLUMN_COUNT : 22;
        this.MAX_ROW = this.ROW_COUNT < 20 ? this.ROW_COUNT : 20;

        this.PAGE_X_OFFSET = 235;
        this.PAGE_Y_OFFSET = 165;

        this.CONTAINER_WIDTH = 1380;
        this.CONTAINER_HEIGHT = 525;
        this.SCROLL_ARG = 50;

        this.CELL_WIDTH = 60;
        this.CELL_HEIGHT = 25;

        this.SCROLL_VERTICAL_MIN_LIMIT = this.CELL_HEIGHT - 1;
        this.SCROLL_HORIZON_MIN_LIMIT = this.CELL_WIDTH - 1;

        this.SCROLL_VERTICAL_MAX_LIMIT = (this.ROW_COUNT - this.MAX_ROW - 1) * this.CELL_HEIGHT - 1;
        this.SCROLL_HORIZON_MAX_LIMIT = (this.COLUMN_COUNT - this.MAX_COLUMN - 1) * this.CELL_WIDTH - 1;
    }

    _eventValidatorInitialize() {
        this.eventValidator.ResizeMouseDown = (event) => this.eventHandler.resizeEventValidator(event, EventHandler.MOUSEDOWN);
        this.eventValidator.ResizeMouseMove = (event) => this.eventHandler.resizeEventValidator(event, EventHandler.MOUSEMOVE, this.currentHeadCell);
        this.eventValidator.ResizeMouseUp = (event) => this.eventHandler.resizeEventValidator(event, EventHandler.MOUSEUP, this.currentHeadCell);

        this.eventValidator.SelectedMouseDown = (event) => this.eventHandler.selectedEventValidator(event, EventHandler.MOUSEDOWN);
        this.eventValidator.SelectedMouseMove = (event) =>
            this.eventHandler.selectedEventValidator(event, EventHandler.MOUSEMOVE, this.isSelected, this.selectedCells);
        this.eventValidator.SelectedMouseUp = (event) =>
            this.eventHandler.selectedEventValidator(event, EventHandler.MOUSEUP, this.isSelected, this.selectedCells);

        this.eventValidator.InputDblclick = (event) => this.eventHandler.inputEventValidator(event, EventHandler.DBLCLICK);
        this.eventValidator.InputBlur = (event) => this.eventHandler.inputEventValidator(event, EventHandler.BLUR);

        this.eventValidator.Scrolling = (event) => this.eventHandler.scrollEventValidator(event, EventHandler.SCROLL);
        this.eventValidator.Wheeling = (event) => this.eventHandler.scrollEventValidator(event, EventHandler.WHEEL);

        this.eventValidator.ContextMenu = (event) => this.eventHandler.contextMenuEventValidator(event);
        this.eventValidator.Updating = (event) => this.eventHandler.updatingEventValidator(event);
    }

    /**
     * Resize相关参数归零
     */
    _resizeArgumentToZero = () => {
        this.currentHeadCell = undefined;
        this.currentDirection = undefined;
        this.dottedLine = undefined;
        this.cellNumber = -1;
        this.cellChar = '@';
        // this.dottedLine.style.display = "none"; // 词条删除放入事件中完成
    };

    _concludeResizeCell = (event) => {
        const target = event.target;
        const rect = target.getBoundingClientRect();
        // Row Cell Resize
        if (target.className.indexOf('resizing-row') > -1) {
            const index = Number(target.dataset.number);
            if (Math.abs(rect.top - event.pageY) < this.MIN_PX) {
                // 说明此时需要操作的是上一个cell
                // 如果是第一个元素，则不能resize，因此直接返回undefined
                if (index === 0) {
                    return undefined;
                }
                return document.querySelector(`div[data-number="${index - 1}"][data-type='row']`);
            }
            return target;
        }
        // Column Cell Resize
        else {
            const index = Number(target.dataset.number);
            if (Math.abs(rect.left - event.pageX) < this.MIN_PX) {
                // 说明此时需要操作的是上一个cell
                // 如果是第一个元素，则不能resize，因此直接返回undefined
                if (index === 0) {
                    return undefined;
                }
                return document.querySelector(`div[data-number="${index - 1}"][data-type='column']`);
            }
            return target;
        }
    };

    _createSelectedBorderRefresh = () => {
        let topStyle, leftStyle, rightStyle, bottomStyle;
        // 说明只有第一个元素被选中
        if (this.selectedCells.length === 1) {
            const relativeRect = this._getCellRelativeRect(this.selectedCells[0]);

            topStyle = `left: ${relativeRect.left}px; top: ${relativeRect.top}px; width: ${relativeRect.width}px;`;
            leftStyle = `left: ${relativeRect.left}px; top: ${relativeRect.top}px; height: ${relativeRect.height}px;`;
            rightStyle = `left: ${relativeRect.right + this.BORDER_OFFSET}px; top: ${relativeRect.top}px; height: ${relativeRect.height}px;`;
            bottomStyle = `left: ${relativeRect.left}px; top: ${relativeRect.bottom + this.BORDER_OFFSET}px; width: ${relativeRect.width}px;`;
        } else {
            // 获取最大最小cell
            const boundCells = this._getBoundCells();
            if (!boundCells || !boundCells.boundMin) {
                return false;
            }
            const rectMax = boundCells.boundMax.getBoundingClientRect();

            const left = boundCells.boundMin.offsetLeft;
            const top = boundCells.boundMin.parentElement.offsetTop;
            const right = boundCells.boundMax.offsetLeft + rectMax.width + this.BORDER_OFFSET;
            const bottom = boundCells.boundMax.parentElement.offsetTop + rectMax.height + this.BORDER_OFFSET;

            const width = right - left;
            const height = bottom - top;

            topStyle = `left: ${left}px; top: ${top}px; width: ${width}px;`;
            leftStyle = `left: ${left}px; top: ${top}px; height: ${height}px;`;
            rightStyle = `left: ${right}px; top: ${top}px; height: ${height}px;`;
            bottomStyle = `left: ${left}px; top: ${bottom}px; width: ${width}px;`;
        }
        const refreshModel = new RefreshModel();
        refreshModel.add(RefreshModel.STYLE, this.borderTop, topStyle);
        refreshModel.add(RefreshModel.STYLE, this.borderLeft, leftStyle);
        refreshModel.add(RefreshModel.STYLE, this.borderRight, rightStyle);
        refreshModel.add(RefreshModel.STYLE, this.borderBottom, bottomStyle);
        refreshModel.add(
            RefreshModel.CLASS,
            undefined,
            'hidden',
            [this.borderTop, this.borderLeft, this.borderRight, this.borderBottom],
            RefreshModel.CLASS_REMOVE
        );

        return refreshModel;
    };

    _getBoundCells = () => {
        if (this.selectedCells.length === 1) {
            return {
                boundMin: this.selectedCells[0],
                boundMax: this.selectedCells[0],
            };
        }

        this.selectedCells = this.selectedCells.sort((cell1, cell2) => cell1.dataset.indexColumn > cell2.dataset.indexColumn);
        const rowMinCell = this.selectedCells[0];
        const rowMaxCell = this.selectedCells[this.selectedCells.length - 1];
        return {
            boundMin: rowMinCell,
            boundMax: rowMaxCell,
        };
    };

    _getCellRelativeRect = (target) => {
        if (!target) {
            return undefined;
        }
        const rect = target.getBoundingClientRect();
        const left = target.offsetLeft;
        const right = left + rect.width;
        const top = target.parentElement.offsetTop;
        const bottom = top + rect.height;
        return {
            left: left,
            top: top,
            right: right,
            bottom: bottom,
            width: rect.width,
            height: rect.height,
        };
    };

    _stepValidate = (step, type, isScroll) => {
        // 内部判断，当滚动条趋近于两端时，直接将数据回归初始值
        if (type === 'row' && step) {
            const topRow = document.querySelector(`div[data-type="row"][data-number="0"]`);
            const topRecord = Number(topRow.dataset.record);
            const bottomRow = document.querySelector(`div[data-type="row"][data-number="${this.MAX_ROW - 1}"]`);
            const bottomRecord = Number(bottomRow.dataset.record);

            let validatorMin, validatorMax;
            if (isScroll === true) {
                validatorMin = this.verticalScroll.scrollTop <= this.SCROLL_VERTICAL_MIN_LIMIT;
                validatorMax = this.verticalScroll.scrollTop >= this.SCROLL_VERTICAL_MAX_LIMIT;
            } else {
                validatorMin = topRecord + step < 1;
                validatorMax = bottomRecord + step > this.ROW_COUNT;
            }
            // 此时确认要将滚动条拉回起始点，需要将step设置成回到起点的step
            if (validatorMin && step < 0) {
                if (topRecord + step > 1 || topRecord + step < 1) {
                    step = 1 - topRecord;
                }
            }
            // 此时确认要进入终点，需要将step设置为终点最大值
            else if (validatorMax && step > 0) {
                if (bottomRecord + step < this.ROW_COUNT || bottomRecord + step > this.ROW_COUNT) {
                    step = this.ROW_COUNT - bottomRecord;
                }
            }
        } else if (type === 'column' && step) {
            const topColumn = document.querySelector(`div[data-type="column"][data-number="0"]`);
            const topRecord = CharCodeUtil.letterCharCodeFormat(topColumn.dataset.record);
            const bottomColumn = document.querySelector(`div[data-type="column"][data-number="${this.MAX_COLUMN - 1}"]`);
            const bottomRecord = CharCodeUtil.letterCharCodeFormat(bottomColumn.dataset.record);

            let validatorMin, validatorMax;
            if (isScroll === true) {
                validatorMin = this.horizonScroll.scrollLeft <= this.SCROLL_HORIZON_MIN_LIMIT;
                validatorMax = this.horizonScroll.scrollLeft >= this.SCROLL_HORIZON_MAX_LIMIT;
            } else {
                validatorMin = topRecord + step < 1;
                validatorMax = bottomRecord + step > this.COLUMN_COUNT;
            }
            // 此时确认要将滚动条拉回起始点，需要将step设置成回到起点的step
            if (validatorMin && step < 0) {
                if (topRecord + step > 1 || topRecord + step < 1) {
                    step = 1 - topRecord;
                }
            }
            // 此时确认要进入终点，需要将step设置为终点最大值
            else if (validatorMax && step > 0) {
                if (bottomRecord + step < this.COLUMN_COUNT || bottomRecord + step > this.COLUMN_COUNT) {
                    step = this.COLUMN_COUNT - bottomRecord;
                }
            }
        }
        return step;
    };

    _reCalculateBorderData = () => {
        const borderData = {
            borderTop: this.borderTop,
            borderLeft: this.borderLeft,
            borderRight: this.borderRight,
            borderBottom: this.borderBottom,
            isShowTop: true,
            isShowBottom: true,
            isShowLeft: true,
            isShowRight: true,
        };

        // 左上角
        const minLeftCell = document.querySelector(
            `div[data-record-row="${this.selectedData.minRecordRow}"][data-record-column="${this.selectedData.minRecordColumn}"]`
        );
        // 右上角
        const minRightCell = document.querySelector(
            `div[data-record-row="${this.selectedData.minRecordRow}"][data-record-column="${this.selectedData.maxRecordColumn}"]`
        );
        // 左下角
        const maxLeftCell = document.querySelector(
            `div[data-record-row="${this.selectedData.maxRecordRow}"][data-record-column="${this.selectedData.minRecordColumn}"]`
        );
        // 右下角
        const maxRightCell = document.querySelector(
            `div[data-record-row="${this.selectedData.maxRecordRow}"][data-record-column="${this.selectedData.maxRecordColumn}"]`
        );

        const minLeftRect = this._getCellRelativeRect(minLeftCell);
        const minRightRect = this._getCellRelativeRect(minRightCell);
        const maxLeftRect = this._getCellRelativeRect(maxLeftCell);
        const maxRightRect = this._getCellRelativeRect(maxRightCell);

        // 说明左上边界在整个表格中
        if (minLeftRect) {
            borderData.top = minLeftRect.top;
            borderData.left = minLeftRect.left;

            // 说明四个边界全在表格内
            if (maxRightRect) {
                borderData.right = maxRightRect.right + this.BORDER_OFFSET;
                borderData.bottom = maxRightRect.bottom + this.BORDER_OFFSET;
                borderData.height = maxRightRect.bottom - minLeftRect.top;
                borderData.width = maxRightRect.right - minLeftRect.left;
                return borderData;
            }
            // 说明只有左上点在表格内，其余各点均不在其中
            else {
                // 说明整个左边界在表格内，且右边界不在表格内
                if (maxLeftRect) {
                    this.isShowRight = false;
                    borderData.bottom = maxLeftRect.bottom + this.BORDER_OFFSET;
                    borderData.height = maxLeftRect.bottom - minLeftRect.top;
                    borderData.width = this.CONTAINER_WIDTH - this.CELL_WIDTH - minLeftRect.left;
                }
                // 说明上边界在表格内，且下边界不在表格内
                else if (minRightRect) {
                    this.isShowBottom = false;
                    borderData.right = minRightRect.right + this.BORDER_OFFSET;
                    borderData.height = this.CONTAINER_HEIGHT - this.CELL_HEIGHT - minLeftRect.top;
                    borderData.width = minRightRect.right - minLeftRect.left;
                }
                // 说明只有左上角在整个区域内，下边界和右边界都不展示
                else {
                    borderData.isShowRight = false;
                    borderData.isShowBottom = false;
                    borderData.height = this.CONTAINER_HEIGHT - this.CELL_HEIGHT - minLeftRect.top;
                    borderData.width = this.CONTAINER_WIDTH - this.CELL_WIDTH - minLeftRect.left;
                }
                return borderData;
            }
        }
        // 说明左上角不在整个表格内
        else {
            // 说明只有可能是左下或者右上角两个点在表内
            if (!maxRightRect) {
                // 说明只有左下角的点在表格内
                if (maxLeftRect) {
                    borderData.isShowTop = false;
                    borderData.isShowRight = false;
                    borderData.left = maxLeftRect.left;
                    borderData.bottom = maxLeftRect.bottom + this.BORDER_OFFSET;
                    borderData.height = maxLeftRect.bottom;
                    borderData.width = this.CONTAINER_WIDTH - this.CELL_WIDTH - maxLeftRect.left;
                }
                // 说明只有右上角在表格内
                else if (minRightRect) {
                    borderData.isShowBottom = false;
                    borderData.isShowLeft = false;
                    borderData.right = minRightRect.right + this.BORDER_OFFSET;
                    borderData.top = minRightRect.top;
                    borderData.height = this.CONTAINER_HEIGHT - this.CELL_HEIGHT - minRightRect.top;
                    borderData.width = minRightRect.right;
                }
                // 说明表格内没有选中框
                else {
                    borderData.isShowBottom = false;
                    borderData.isShowLeft = false;
                    borderData.isShowRight = false;
                    borderData.isShowTop = false;
                }
                return borderData;
            }

            // 说明此时右下角在表内
            borderData.bottom = maxRightRect.bottom + this.BORDER_OFFSET;
            borderData.right = maxRightRect.right + this.BORDER_OFFSET;

            // 说明下边界在表格内，且上边界不在表格内
            if (maxLeftRect) {
                borderData.isShowTop = false;
                borderData.left = maxLeftRect.left;
                borderData.height = maxRightRect.bottom;
                borderData.width = maxRightRect.right - maxLeftRect.left;
            }
            // 说明右边界在表格内，且左边界不在表给内
            else if (minRightRect) {
                borderData.isShowLeft = false;
                borderData.top = minRightRect.top;
                borderData.height = maxRightRect.bottom - minRightRect.top;
                borderData.width = maxRightRect.right;
            }
            // 说明只有右下角的点在表格内
            else {
                borderData.isShowTop = false;
                borderData.isShowLeft = false;
                borderData.height = maxRightRect.bottom;
                borderData.width = maxRightRect.right;
            }
            return borderData;
        }
    };

    _tableUpdating = (type) => {
        const step = type === 'insert' ? 1 : type === 'remove' ? -1 : 0;
        if (step === 0) {
            return false;
        }
        if (this.updateData.type === 'column') {
            this.COLUMN_COUNT += step;
            if (step > 0) {
                this.MAX_COLUMN = this.MAX_COLUMN >= 22 ? this.MAX_COLUMN : this.MAX_COLUMN + step;
            } else if (step < 0) {
                this.MAX_COLUMN = this.MAX_COLUMN > 22 ? this.MAX_COLUMN : this.MAX_COLUMN + step;
            }
            // 更新样式表
            if (this.styleData && this.styleData.length > 0) {
                const removeIndexArr = [];
                for (let index = 0; index < this.styleData.length; index++) {
                    const currentStyle = this.styleData[index];
                    if (!currentStyle) {
                        continue;
                    }
                    if (currentStyle.type === 'column') {
                        if (CharCodeUtil.letterCharCodeFormat(currentStyle.record) < CharCodeUtil.letterCharCodeFormat(this.updateData.record)) {
                            continue;
                        }
                        if (currentStyle.record === this.updateData.record && step < 0) {
                            removeIndexArr.push(index);
                            continue;
                        }
                        const number = Number(currentStyle.number);
                        currentStyle.record = CharCodeUtil.letterChange(currentStyle.record, step);
                        currentStyle.number = number + step;
                        currentStyle.className = `resized-column-${currentStyle.record}`;
                        currentStyle.class = `.${currentStyle.className} { ${currentStyle.value} }`;
                    }
                }
                if (removeIndexArr.length > 0) {
                    this.styleData = ArrayExtension.remove(this.styleData, removeIndexArr);
                }
            }

            // 更新选中cell
            if (this.selectedCells && this.selectedCells.length > 0) {
                const newSelectedCells = [];
                for (let index = 0; index < this.selectedCells.length; index++) {
                    const cell = this.selectedCells[index];
                    if (CharCodeUtil.letterCharCodeFormat(cell.dataset.recordColumn) < CharCodeUtil.letterCharCodeFormat(this.updateData.record)) {
                        continue;
                    }
                    if (cell.dataset.recordColumn === this.updateData.record && step < 0) {
                        continue;
                    }
                    const newColumn = CharCodeUtil.letterChange(cell.dataset.recordColumn, step);
                    const newCell = document.querySelector(`div[data-record-column="${newColumn}"][data-record-row="${cell.dataset.recordRow}"]`);
                    if (newCell) {
                        newSelectedCells.push(newCell);
                    }
                }
                if (newSelectedCells.length > 0) {
                    this.selectedCells = newSelectedCells;
                }
                // 排序
                this._getBoundCells();
                this.endSelected();
            }

            // 更新输入数据
            if (this.inputData && this.inputData.length > 0) {
                const removeIndexArr = [];
                for (let index = 0; index < this.inputData.length; index++) {
                    const data = this.inputData[index];
                    if (CharCodeUtil.letterCharCodeFormat(data.recordColumn) < CharCodeUtil.letterCharCodeFormat(this.updateData.record)) {
                        continue;
                    }
                    if (data.recordColumn === this.updateData.record && step < 0) {
                        removeIndexArr.push(index);
                        continue;
                    }
                    data.recordColumn = CharCodeUtil.letterChange(data.recordColumn, step);
                }
                if (removeIndexArr.length > 0) {
                    this.inputData = ArrayExtension.remove(this.inputData, removeIndexArr);
                }
            }
        } else if (this.updateData.type === 'row') {
            this.ROW_COUNT += step;
            if (step > 0) {
                this.MAX_ROW = this.MAX_ROW >= 20 ? this.MAX_ROW : this.MAX_ROW + step;
            } else if (step < 0) {
                this.MAX_ROW = this.MAX_ROW > 20 ? this.MAX_ROW : this.MAX_ROW + step;
            }
            // 更新样式表
            if (this.styleData && this.styleData.length > 0) {
                const removeIndexArr = [];
                for (let index = 0; index < this.styleData.length; index++) {
                    const currentStyle = this.styleData[index];
                    if (!currentStyle) {
                        continue;
                    }
                    if (currentStyle.type === 'row') {
                        if (Number(currentStyle.record) < Number(this.updateData.record)) {
                            continue;
                        }
                        if (currentStyle.record === this.updateData.record && step < 0) {
                            removeIndexArr.push(index);
                            continue;
                        }
                        const record = Number(currentStyle.record);
                        const number = Number(currentStyle.number);
                        currentStyle.record = record + step;
                        currentStyle.number = number + step;
                        currentStyle.className = `resized-row-${currentStyle.record}`;
                        currentStyle.class = `.${currentStyle.className} { ${currentStyle.value} }`;
                    }
                }
                if (removeIndexArr.length > 0) {
                    this.styleData = ArrayExtension.remove(this.styleData, removeIndexArr);
                }
            }

            // 更新选中cell
            if (this.selectedCells && this.selectedCells.length > 0) {
                const newSelectedCells = [];
                for (let index = 0; index < this.selectedCells.length; index++) {
                    const cell = this.selectedCells[index];
                    if (Number(cell.dataset.recordRow) < Number(this.updateData.record)) {
                        continue;
                    }
                    if (cell.dataset.recordRow === this.updateData.record && step < 0) {
                        continue;
                    }
                    const newRow = Number(cell.dataset.recordRow) + step;
                    const newCell = document.querySelector(`div[data-record-column="${cell.dataset.recordColumn}"][data-record-row="${newRow}"]`);
                    if (newCell) {
                        newSelectedCells.push(newCell);
                    }
                }
                if (newSelectedCells.length > 0) {
                    this.selectedCells = newSelectedCells;
                }
                // 排序
                this._getBoundCells();
                this.endSelected();
            }

            // 更新输入数据
            if (this.inputData && this.inputData.length > 0) {
                const removeIndexArr = [];
                for (let index = 0; index < this.inputData.length; index++) {
                    const data = this.inputData[index];
                    if (Number(data.recordRow) < Number(this.updateData.record)) {
                        continue;
                    }
                    if (data.recordRow === this.updateData.record && step < 0) {
                        removeIndexArr.push(index);
                        continue;
                    }
                    data.recordRow = Number(data.recordRow) + step;
                }
                if (removeIndexArr.length > 0) {
                    this.inputData = ArrayExtension.remove(this.inputData, removeIndexArr);
                }
            }
        }
    };

    generateRenderingModel = () => {
        const renderingModel = new RenderingModel();
        renderingModel.row = this.ROW_COUNT;
        renderingModel.column = this.COLUMN_COUNT;
        renderingModel.rowMax = this.MAX_ROW;
        renderingModel.columnMax = this.MAX_COLUMN;
        renderingModel.cellHeight = this.CELL_HEIGHT;
        renderingModel.cellWidth = this.CELL_WIDTH;

        return renderingModel;
    };

    isValidEvent = (type, event) => {
        return this.eventValidator[type](event);
    };

    beginResize = (event) => {
        this.currentHeadCell = this._concludeResizeCell(event);
        if (!this.currentHeadCell) {
            return false;
        }

        let styleString;
        if (event.target.className.indexOf('resizing-row') > -1) {
            this.currentDirection = 'ROW';
            this.dottedLine = document.getElementsByClassName('row-line')[0];
            styleString = `top: ${event.pageY - this.PAGE_Y_OFFSET}px;`;
        } else {
            this.currentDirection = 'COLUMN';
            this.dottedLine = document.getElementsByClassName('column-line')[0];
            styleString = `left: ${event.pageX - this.PAGE_X_OFFSET}px;`;
        }

        this.beginResizeEvent = event;
        const refreshModel = new RefreshModel();
        refreshModel.add(RefreshModel.STYLE, this.dottedLine, styleString);
        refreshModel.add(RefreshModel.CLASS, this.dottedLine, 'hidden', undefined, RefreshModel.CLASS_REMOVE);
        const spans = document.getElementsByClassName('span-column');
        refreshModel.add(RefreshModel.CLASS, undefined, 'resizing-column', spans, RefreshModel.CLASS_ADD);
        return refreshModel;
    };

    resizing = (event) => {
        let styleString;
        if (this.currentDirection === 'COLUMN') {
            styleString = `left: ${event.pageX - this.PAGE_X_OFFSET}px;`;
        } else if (this.currentDirection === 'ROW') {
            styleString = `top: ${event.pageY - this.PAGE_Y_OFFSET}px;`;
        }
        const refreshModel = new RefreshModel();
        refreshModel.add(RefreshModel.STYLE, this.dottedLine, styleString);
        return refreshModel;
    };

    endResizing = (event) => {
        const resizeModel = new ResizeModel();
        resizeModel.maxRow = this.MAX_ROW;
        resizeModel.maxColumn = this.MAX_COLUMN;
        resizeModel.cellHeight = this.CELL_HEIGHT;
        resizeModel.cellWidth = this.CELL_WIDTH;

        const rect = this._getCellRelativeRect(this.currentHeadCell);
        let resizingClass, resizingClassName, resizingWidth, resizingHeight, value;
        if (this.currentDirection === 'COLUMN') {
            resizingWidth = Number(event.pageX) - Number(this.beginResizeEvent.pageX);
            let currentWidth = rect.width;
            if (currentWidth + resizingWidth < this.CELL_WIDTH) {
                resizingWidth = this.CELL_WIDTH - currentWidth;
            }
            resizeModel.indexColumn = this.currentHeadCell.dataset.number;
            resizeModel.recordColumn = this.currentHeadCell.dataset.record;
            resizeModel.resizingWidth = resizingWidth;

            value = `width: ${currentWidth + resizingWidth}px;`;
            resizingClassName = `resized-column-${this.currentHeadCell.dataset.record}`;
            resizingClass = `.${resizingClassName} { ${value} }`;
        } else {
            resizingHeight = Number(event.pageY) - Number(this.beginResizeEvent.pageY);
            let currentHeight = rect.height;
            if (currentHeight + resizingHeight < this.CELL_HEIGHT) {
                resizingHeight = this.CELL_HEIGHT - currentHeight;
            }

            resizeModel.indexRow = this.currentHeadCell.dataset.number;
            resizeModel.recordRow = this.currentHeadCell.dataset.record;
            resizeModel.resizingHeight = resizingHeight;

            value = `height: ${currentHeight + resizingHeight}px;`;
            resizingClassName = `resized-row-${this.currentHeadCell.dataset.record}`;
            resizingClass = `.${resizingClassName} { ${value} }`;
        }

        const classIndex = this.styleData.findIndex((element) => element.className === resizingClassName);
        // 说明已经存在，直接修改值
        if (classIndex > -1) {
            this.styleData[classIndex].class = resizingClass;
        }
        // 说明不存在，需要插入
        else {
            this.styleData.push({
                value: value,
                className: resizingClassName,
                class: resizingClass,
                record: this.currentHeadCell.dataset.record,
                number: this.currentHeadCell.dataset.number,
                width: resizingWidth,
                height: resizingHeight,
                type: this.currentDirection.toLowerCase(),
            });
        }
        resizeModel.resizingClass = resizingClass;
        resizeModel.resizingClassName = resizingClassName;
        return resizeModel;
    };

    endResize = () => {
        const refreshModel = new RefreshModel();
        // 还需要传入选中边界相关参数，当前未完成因此空置
        const borderRefresh = this._createSelectedBorderRefresh();
        if (borderRefresh && borderRefresh.refreshDictionary && borderRefresh.refreshDictionary.length > 0) {
            borderRefresh.refreshDictionary.forEach((element) => refreshModel.refreshDictionary.push(element));
        }

        // 最后初始化移动虚线为空
        this.currentHeadCell = undefined;
        refreshModel.add(RefreshModel.CLASS, this.dottedLine, 'hidden', undefined, RefreshModel.CLASS_ADD);
        const spans = document.getElementsByClassName('span-column');
        refreshModel.add(RefreshModel.CLASS, undefined, 'resizing-column', spans, RefreshModel.CLASS_REMOVE);
        return refreshModel;
    };

    beginSelected = (event) => {
        // 首先初始化选中Border
        this.currentCell = undefined;
        this.startCell = undefined;
        for (let element of this.selectedCells) {
            element.classList.remove('selected');
        }
        this.selectedCells = [];
        this.selectedData = [];
        const initRefresh = new RefreshModel();
        initRefresh.add(RefreshModel.CLASS, this.borderTop, 'hidden', undefined, RefreshModel.CLASS_ADD);
        initRefresh.add(RefreshModel.CLASS, this.borderLeft, 'hidden', undefined, RefreshModel.CLASS_ADD);
        initRefresh.add(RefreshModel.CLASS, this.borderRight, 'hidden', undefined, RefreshModel.CLASS_ADD);
        initRefresh.add(RefreshModel.CLASS, this.borderBottom, 'hidden', undefined, RefreshModel.CLASS_ADD);

        // 之后开始计算
        if (event.target.className.indexOf('real-cell') > -1) {
            this.selectedCells.push(event.target);
            this.currentCell = event.target;
            this.startCell = event.target;
        } else if (event.target.className.indexOf('cell-span') > -1) {
            const headCell = event.target.parentElement;
            if (headCell.dataset.type === 'row') {
                const selectedCells = document.querySelectorAll(`div[data-record-row="${headCell.dataset.record}"]`);
                for (let element of selectedCells) {
                    this.selectedCells.push(element);
                }
            } else if (headCell.dataset.type === 'column') {
                const selectedCells = document.querySelectorAll(`div[data-record-column="${headCell.dataset.record}"]`);
                for (let element of selectedCells) {
                    this.selectedCells.push(element);
                }
            }
        }

        this.isSelected = true;
        initRefresh.add(RefreshModel.CLASS, undefined, 'selected', this.selectedCells, RefreshModel.CLASS_ADD);

        const borderRefresh = this._createSelectedBorderRefresh();
        borderRefresh.refreshDictionary.forEach((element) => initRefresh.refreshDictionary.push(element));
        return initRefresh;
    };

    selecting = (event) => {
        if (event.target !== this.currentCell) {
            this.currentCell = event.target;
            const currentColumn = Number(this.currentCell.dataset.indexColumn);
            const currentRow = Number(this.currentCell.dataset.indexRow);

            const startColumn = Number(this.startCell.dataset.indexColumn);
            const startRow = Number(this.startCell.dataset.indexRow);

            const minRow = currentRow > startRow ? startRow : currentRow;
            const minColumn = currentColumn > startColumn ? startColumn : currentColumn;
            const maxRow = currentRow > startRow ? currentRow : startRow;
            const maxColumn = currentColumn > startColumn ? currentColumn : startColumn;

            const newSelectedCells = [];
            for (let indexColumn = minColumn; indexColumn <= maxColumn; indexColumn++) {
                for (let indexRow = minRow; indexRow <= maxRow; indexRow++) {
                    const cell = document.querySelector(`div[data-index-row="${indexRow}"][data-index-column="${indexColumn}"]`);
                    if (cell) {
                        newSelectedCells.push(cell);
                    }
                }
            }
            if (newSelectedCells.length > 0) {
                const outdatedSelectedCells = document.getElementsByClassName('selected');
                if (outdatedSelectedCells && outdatedSelectedCells.length > 0) {
                    const arr = [];
                    for (let index = 0; index < outdatedSelectedCells.length; index++) {
                        arr.push({
                            recordRow: outdatedSelectedCells[index].dataset.recordRow,
                            recordColumn: outdatedSelectedCells[index].dataset.recordColumn,
                        });
                    }
                    for (let element of arr) {
                        const cell = document.querySelector(`div[data-record-row="${element.recordRow}"][data-record-column="${element.recordColumn}"]`);
                        cell.classList.remove('selected');
                    }
                }

                for (let element of newSelectedCells) {
                    element.classList.add('selected');
                }
            }
            this.selectedCells = newSelectedCells;
            const borderRefresh = this._createSelectedBorderRefresh();
            return borderRefresh;
        }
        return undefined;
    };

    endSelected = () => {
        if (this.selectedCells && this.selectedCells.length > 0) {
            const minCell = this.selectedCells[0];
            const maxCell = this.selectedCells[this.selectedCells.length - 1];
            this.selectedData = {
                minRecordRow: minCell.dataset.recordRow,
                minRecordColumn: minCell.dataset.recordColumn,
                maxRecordRow: maxCell.dataset.recordRow,
                maxRecordColumn: maxCell.dataset.recordColumn,
            };
        }
        this.isSelected = false;
    };

    inputting = (event) => {
        const rect = this._getCellRelativeRect(event.target);
        const inputText = document.getElementById('input');
        inputText.value = event.target.innerHTML;
        event.target.innerHTML = '';
        const refreshModel = new RefreshModel();
        refreshModel.add(
            RefreshModel.STYLE,
            inputText,
            `width: ${rect.width + this.BORDER_OFFSET}px; height: ${rect.height}px; top: ${rect.top}px; left: ${rect.left - this.BORDER_OFFSET}px;`
        );
        refreshModel.add(RefreshModel.CLASS, inputText, 'hidden', undefined, RefreshModel.CLASS_REMOVE);
        refreshModel.add(RefreshModel.FOCUS, inputText);
        inputText.dataset.recordRow = event.target.dataset.recordRow;
        inputText.dataset.recordColumn = event.target.dataset.recordColumn;
        return refreshModel;
    };

    endInput = (event) => {
        const cell = document.querySelector(
            `div[data-record-row="${event.target.dataset.recordRow}"][data-record-column="${event.target.dataset.recordColumn}"]`
        );
        const value = event.target.value;
        event.target.value = '';
        if (!cell) {
            return;
        }
        cell.innerHTML = value;
        this.inputData.push({
            recordRow: event.target.dataset.recordRow,
            recordColumn: event.target.dataset.recordColumn,
            value: value,
        });
        const refresh = new RefreshModel();
        refresh.add(RefreshModel.CLASS, event.target, 'hidden', undefined, RefreshModel.CLASS_ADD);
        return refresh;
    };

    scrolling = (event) => {
        let step, type;
        if (event.target.id === 'verticalScroll') {
            const distance = this.verticalScroll.scrollTop - this.verticalStart;
            if (Math.abs(distance) > this.CELL_HEIGHT) {
                step = Math.round(distance / this.CELL_HEIGHT);
                this.verticalStart = this.verticalScroll.scrollTop;
            }
            type = 'row';
        } else if (event.target.id === 'horizonScroll') {
            const distance = this.horizonScroll.scrollLeft - this.horizonStart;
            if (Math.abs(distance) > this.CELL_WIDTH) {
                step = Math.round(distance / this.CELL_WIDTH);
                this.horizonStart = this.horizonScroll.scrollLeft;
            }
            type = 'column';
        }

        const offset = this._stepValidate(step, type, true);
        if (!offset) {
            return;
        }
        const tableRefresh = new TableRefreshModel(
            offset,
            this.MAX_ROW,
            this.MAX_COLUMN,
            this.styleData,
            this.CELL_HEIGHT,
            this.CELL_WIDTH,
            this.ROW_COUNT,
            this.COLUMN_COUNT,
            type
        );
        return tableRefresh;
    };

    endScroll = () => {
        this.verticalStart = 0;
        this.horizonStart = 0;
    };

    beginWheel = () => {
        // 禁用浏览器默认滚轮
        event.preventDefault();
        this.verticalScroll.scrollTop += event.deltaY;
    };

    wheeling = (step) => {
        // 禁用浏览器默认滚轮
        event.preventDefault();

        const borderData = this._reCalculateBorderData();
        return new DataRefreshModel(step, this.inputData, borderData, this.styleData);
    };

    beginUpdate = (event) => {
        const refresh = new RefreshModel();
        const contextMenu = document.getElementById('contextMenu');
        const headCell = event.target.parentElement;
        const headRect = this._getCellRelativeRect(headCell);
        let top, left;
        if (headCell.dataset.type === 'column') {
            top = headRect.top + event.offsetY;
            left = headRect.left + event.offsetX + this.CELL_WIDTH;
        } else {
            top = Number(headCell.style.top.split('px')[0]) + event.offsetY + this.CELL_HEIGHT;
            left = headRect.left + event.offsetX;
        }
        const styleString = `top: ${top}px; left: ${left}px;`;
        refresh.add(RefreshModel.STYLE, contextMenu, styleString);
        refresh.add(RefreshModel.CLASS, contextMenu, 'hidden', undefined, RefreshModel.CLASS_REMOVE);
        this.updateData = {
            type: headCell.dataset.type,
            record: headCell.dataset.record,
        };
        return refresh;
    };

    updating = (event) => {
        if (event.target.id === 'insertSpan') {
            // 插入
            this._tableUpdating('insert');
        } else if (event.target.id === 'removeSpan') {
            // 删除
            this._tableUpdating('remove');
        } else {
            return false;
        }
        const tableRefresh = new TableRefreshModel(
            0,
            this.MAX_ROW,
            this.MAX_COLUMN,
            this.styleData,
            this.CELL_HEIGHT,
            this.CELL_WIDTH,
            this.ROW_COUNT,
            this.COLUMN_COUNT,
            this.updateData.type
        );
        return tableRefresh;
    };

    endUpdate = () => {
        const borderData = this._reCalculateBorderData();
        return new DataRefreshModel(0, this.inputData, borderData, this.selectedCells);
    };

    hidingContextMenu = (event) => {
        if (event.which === 1) {
            const contextMenu = document.getElementById('contextMenu');
            const refresh = new RefreshModel();
            refresh.add(RefreshModel.CLASS, contextMenu, 'hidden', undefined, RefreshModel.CLASS_ADD);
            return refresh;
        }
    };
}
