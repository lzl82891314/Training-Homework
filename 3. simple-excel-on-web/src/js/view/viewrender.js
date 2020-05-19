'use strict';

import { CharCodeUtil } from '../infrastructure/util';
import { RefreshModel } from '../viewmodel/refreshmodel';
import { ResizeModel } from '../viewmodel/resizemodel';

/**
 * 视图渲染器
 * 充当MVC中的view层
 */
export class ViewRender {
    _renderingCell = (isHead, x, y, isLetter) => {
        const cell = document.createElement('div');
        cell.setAttribute('draggable', false);
        cell.ondragstart = (event) => {
            return false;
        };
        const positionX = CharCodeUtil.letterFromIndex(x);
        const positionY = y;
        cell.id = `${positionX}_${positionY}`;
        cell.classList.add('cell');
        cell.dataset.column = positionX;
        cell.dataset.row = positionY;

        // 如果是表头，则需要加入表头内部的span标签展示表头数据
        if (isHead === true) {
            const span = document.createElement('span');
            span.setAttribute('draggable', false);
            span.ondragstart = (event) => {
                return false;
            };
            if (isLetter === true) {
                span.innerHTML = positionX;
                span.classList.add('cell-span');
                span.classList.add('span-column');
                cell.classList.add('head-column');
            } else {
                span.innerHTML = positionY;
                span.classList.add('cell-span');
                span.classList.add('span-row');
                cell.classList.add('head-row');
            }
            cell.classList.add('cell-head');
            cell.appendChild(span);
        } else {
            cell.classList.add('real-cell');
        }

        return cell;
    };

    _createDynamicClass = (classString) => {
        const css = document.createElement('style');
        css.type = 'text/css';
        const textNode = document.createTextNode(classString);
        css.appendChild(textNode);
        return css;
    };

    _addDynamicClass = (classString) => {
        const css = this._createDynamicClass(classString);
        const heads = document.getElementsByTagName('head');
        if (!heads || !heads.length || heads.length === 0) {
            return false;
        }
        heads[0].appendChild(css);
        return true;
    };

    _renderingHead = (renderingModel) => {
        const columnHead = document.getElementById('columnHead');
        const rowHead = document.getElementById('rowHead');

        const columnFragment = document.createDocumentFragment();
        const columnCount = renderingModel.column > renderingModel.columnMax ? renderingModel.columnMax : renderingModel.column;
        for (let index = 1; index <= columnCount; index++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.classList.add('head-bg');
            cell.classList.add('resizing-column');
            cell.ondragstart = () => {
                return false;
            };
            cell.dataset.type = 'column';
            cell.dataset.number = index - 1;
            cell.dataset.record = CharCodeUtil.letterFromIndex(index);
            cell.style = `left: ${(index - 1) * renderingModel.cellWidth}px`;
            const span = document.createElement('span');
            span.classList.add('cell-span');
            span.classList.add('span-column');
            span.innerHTML = CharCodeUtil.letterFromIndex(index);
            cell.appendChild(span);
            columnFragment.appendChild(cell);
        }

        columnHead.appendChild(columnFragment);

        const rowFragment = document.createDocumentFragment();
        const rowCount = renderingModel.row > renderingModel.rowMax ? renderingModel.rowMax : renderingModel.row;
        for (let index = 1; index <= rowCount; index++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.classList.add('head-bg');
            cell.classList.add('resizing-row');
            cell.ondragstart = () => {
                return false;
            };
            cell.dataset.type = 'row';
            cell.dataset.number = index - 1;
            cell.dataset.record = index;
            cell.style = `top: ${(index - 1) * renderingModel.cellHeight}px`;
            const span = document.createElement('span');
            span.classList.add('cell-span');
            span.classList.add('span-row');
            span.innerHTML = index;
            cell.appendChild(span);
            rowFragment.appendChild(cell);
        }

        rowHead.appendChild(rowFragment);
    };

    _renderTable = (renderingModel) => {
        const table = document.getElementById('table');
        const tableFragment = document.createDocumentFragment();
        const rowCount = renderingModel.row > renderingModel.rowMax ? renderingModel.rowMax : renderingModel.row;
        const columnCount = renderingModel.column > renderingModel.columnMax ? renderingModel.columnMax : renderingModel.column;
        for (let rowIndex = 1; rowIndex <= rowCount; rowIndex++) {
            const row = document.createElement('div');
            row.classList.add('table-row');
            row.dataset.number = rowIndex - 1;
            row.dataset.record = rowIndex;
            row.dataset.type = 'table-row';
            row.style = `top: ${(rowIndex - 1) * renderingModel.cellHeight}px;`;
            const columnFragment = document.createDocumentFragment();
            for (let columnIndex = 1; columnIndex <= columnCount; columnIndex++) {
                const cell = document.createElement('div');
                cell.ondragstart = () => {
                    return false;
                };
                cell.classList.add('cell');
                cell.classList.add('real-cell');
                cell.dataset.indexRow = rowIndex - 1;
                cell.dataset.indexColumn = columnIndex - 1;
                cell.dataset.recordRow = rowIndex;
                cell.dataset.recordColumn = `${CharCodeUtil.letterFromIndex(columnIndex)}`;
                cell.style = `left: ${(columnIndex - 1) * renderingModel.cellWidth}px;`;
                columnFragment.appendChild(cell);
            }
            row.appendChild(columnFragment);
            tableFragment.appendChild(row);
        }

        table.appendChild(tableFragment);
    };

    _renderScrollBar = (renderingModel) => {
        const horizonScroll = document.getElementById('horizonScroll');
        const verticalScroll = document.getElementById('verticalScroll');

        if (renderingModel.row > renderingModel.rowMax) {
            if (!verticalScroll) {
                return false;
            }
            verticalScroll.classList.remove('hidden');
            verticalScroll.children[0].style.height = `${526 + (renderingModel.row - renderingModel.rowMax) * renderingModel.cellHeight}px`;
            verticalScroll.children[0].scrollTop = 0;
        } else {
            verticalScroll.classList.add('hidden');
        }

        if (renderingModel.column > renderingModel.columnMax) {
            if (!horizonScroll) {
                return false;
            }
            horizonScroll.classList.remove('hidden');
            horizonScroll.children[0].style.width = `${1380 + (renderingModel.column - renderingModel.columnMax) * renderingModel.cellWidth}px`;
            verticalScroll.children[0].scrollLeft = 0;
        } else {
            horizonScroll.classList.add('hidden');
        }
    };

    _styleElimination = (clearModel) => {
        // 清除头部样式
        const columnHead = document.getElementById('columnHead');
        columnHead.style = '';
        columnHead.className = 'column-head';
        for (let index = 0; index < columnHead.children.length; index++) {
            columnHead.children[index].className = 'cell head-bg resizing-column';
            columnHead.children[index].style = `left: ${index * clearModel.width}px;`;
        }
        const rowHead = document.getElementById('rowHead');
        rowHead.style = '';
        rowHead.className = 'row-head';
        for (let index = 0; index < rowHead.children.length; index++) {
            rowHead.children[index].className = 'cell head-bg resizing-row';
            rowHead.children[index].style = `top: ${index * clearModel.height}px;`;
        }

        // 清除table-row样式
        const tableRows = document.getElementsByClassName('table-row');
        for (let rowIndex = 0; rowIndex < tableRows.length; rowIndex++) {
            const tableRow = tableRows[rowIndex];
            tableRow.style = `top: ${rowIndex * clearModel.height}px;`;
            tableRow.className = 'table-row';

            for (let columnIndex = 0; columnIndex < tableRow.children.length; columnIndex++) {
                const cell = tableRow.children[columnIndex];
                cell.style = `left: ${columnIndex * clearModel.width}px;`;
                cell.className = 'cell real-cell';
            }
        }
    };

    _clearUp = () => {
        const table = document.getElementById('table');
        table.innerHTML = '';
        const columnHead = document.getElementById('columnHead');
        columnHead.innerHTML = '';
        const rowHead = document.getElementById('rowHead');
        rowHead.innerHTML = '';
        const borders = document.getElementsByClassName('selected-border');
        for (let element of borders) {
            element.classList.add('hidden');
        }
        const dottedLines = document.getElementsByClassName('dotted-line');
        for (let element of dottedLines) {
            element.classList.add('hidden');
        }
        const scrolls = document.getElementsByClassName('scroll');
        for (let element of scrolls) {
            element.classList.add('hidden');
        }
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.classList.add('hidden');
    };

    render = (renderingModel) => {
        if (!renderingModel || renderingModel.row <= 0 || renderingModel.column <= 0) {
            throw new Error('rendering argument error');
        }

        this._clearUp();
        this._renderingHead(renderingModel);
        this._renderTable(renderingModel);
        this._renderScrollBar(renderingModel);
    };

    refresh = (refreshModel) => {
        if (refreshModel && refreshModel.refreshDictionary && refreshModel.refreshDictionary.length > 0) {
            const length = refreshModel.refreshDictionary.length;
            for (let index = 0; index < length; index++) {
                const refreshData = refreshModel.refreshDictionary[index];
                if (refreshData.type === RefreshModel.STYLE) {
                    if (refreshData.target) {
                        refreshData.target.style = refreshData.value;
                    }
                    if (refreshData.targets && refreshData.targets.length > 0) {
                        for (let targetIndex = 0; targetIndex < refreshData.targets.length; targetIndex++) {
                            refreshData.targets[targetIndex].style = refreshData.value;
                        }
                    }
                } else if (refreshData.type === RefreshModel.CSS) {
                    const css = this._createDynamicClass(refreshData.value);
                    const heads = document.getElementsByTagName('head');
                    if (!heads || !heads.length || heads.length === 0) {
                        return false;
                    }
                    heads[0].appendChild(css);
                    const className = refreshData.value.split('{')[0].trimEnd().split('.')[1];
                    if (refreshData.target) {
                        refreshData.target.classList.add(className);
                    }
                    if (refreshData.targets && refreshData.targets.length > 0) {
                        refreshData.targets.forEach((element) => {
                            element.classList.add(className);
                        });
                    }
                } else if (refreshData.type === RefreshModel.CLASS) {
                    if (refreshData.target) {
                        if (refreshData.operateType === RefreshModel.CLASS_ADD) {
                            refreshData.target.classList.add(refreshData.value);
                        } else if (refreshData.operateType === RefreshModel.CLASS_REMOVE) {
                            refreshData.target.classList.remove(refreshData.value);
                        } else if (refreshData.operateType === RefreshModel.CLASS_TOGGLE) {
                            refreshData.target.classList.toggle(refreshData.value);
                        }
                    }
                    if (refreshData.targets && refreshData.targets.length > 0) {
                        for (let targetIndex = 0; targetIndex < refreshData.targets.length; targetIndex++) {
                            if (refreshData.operateType === RefreshModel.CLASS_ADD) {
                                refreshData.targets[targetIndex].classList.add(refreshData.value);
                            } else if (refreshData.operateType === RefreshModel.CLASS_REMOVE) {
                                refreshData.targets[targetIndex].classList.remove(refreshData.value);
                            } else if (refreshData.operateType === RefreshModel.CLASS_TOGGLE) {
                                refreshData.targets[targetIndex].classList.toggle(refreshData.value);
                            }
                        }
                    }
                } else if (refreshData.type === RefreshModel.FOCUS) {
                    if (refreshData.target) {
                        refreshData.target.focus();
                    }
                }
            }
        }
    };

    tableRefresh = (tableRefreshModel) => {
        if (!tableRefreshModel) {
            return false;
        }

        if (tableRefreshModel.type === 'row') {
            // 首先修改行头
            const headRows = document.getElementsByClassName('resizing-row');
            for (let index = 0; index < tableRefreshModel.maxRow; index++) {
                const headRow = headRows[index];
                const newRecord = Number.parseInt(headRow.dataset.record) + tableRefreshModel.step;
                headRow.dataset.record = newRecord;
                const span = headRow.children[0];
                span.innerHTML = newRecord;
            }

            // 其次修改行信息
            const tableRows = document.querySelectorAll(`div[data-type="table-row"]`);
            for (let index = 0; index < tableRows.length; index++) {
                // 首先切换所有record下标
                const recordRow = Number(tableRows[index].dataset.record);
                tableRows[index].dataset.record = recordRow + tableRefreshModel.step;
            }
        } else {
            // 首先修改列头
            const headColumns = document.getElementsByClassName('resizing-column');
            for (let index = 0; index < tableRefreshModel.maxColumn; index++) {
                const headColumn = headColumns[index];
                const newRecord = CharCodeUtil.letterChange(headColumn.dataset.record, tableRefreshModel.step);
                headColumn.dataset.record = newRecord;
                const span = headColumn.children[0];
                span.innerHTML = newRecord;
            }
        }

        const cells = document.getElementsByClassName('real-cell');
        // 然后修改Row信息
        for (let index = 0; index < cells.length; index++) {
            // 首先切换所有record下标
            const recordRow = Number(cells[index].dataset.recordRow);
            const recordColumn = CharCodeUtil.letterChange(cells[index].dataset.recordColumn, tableRefreshModel.step);
            if (tableRefreshModel.type === 'row') {
                cells[index].dataset.recordRow = recordRow + tableRefreshModel.step;
            } else {
                cells[index].dataset.recordColumn = recordColumn;
            }
            cells[index].innerHTML = '';
        }

        // 最后更新样式
        if (tableRefreshModel.styleData && tableRefreshModel.styleData.length > 0) {
            // 样式清除
            this._styleElimination({ height: tableRefreshModel.cellHeight, width: tableRefreshModel.cellWidth });
            for (let index = 0; index < tableRefreshModel.styleData.length; index++) {
                const singleStyle = tableRefreshModel.styleData[index];
                const resizeModel = new ResizeModel();
                resizeModel.maxRow = tableRefreshModel.maxRow;
                resizeModel.maxColumn = tableRefreshModel.maxColumn;
                resizeModel.resizingClass = singleStyle.class;
                resizeModel.resizingClassName = singleStyle.className;
                resizeModel.cellHeight = tableRefreshModel.cellHeight;
                resizeModel.cellWidth = tableRefreshModel.cellWidth;

                if (singleStyle.type === 'column') {
                    resizeModel.recordColumn = singleStyle.record;
                    resizeModel.indexColumn = singleStyle.number;
                    resizeModel.resizingWidth = singleStyle.width;
                } else {
                    resizeModel.recordRow = singleStyle.record;
                    resizeModel.indexRow = singleStyle.number;
                    resizeModel.resizingHeight = singleStyle.height;
                }
                this.resize(resizeModel);
            }
        } else {
            // 样式清除
            this._styleElimination({ height: tableRefreshModel.cellHeight, width: tableRefreshModel.cellWidth });
        }
    };

    dataRefresh = (dataRefresh) => {
        if (dataRefresh.inputData && dataRefresh.inputData.length > 0) {
            // 然后切换所有内容
            for (let index = 0; index < dataRefresh.inputData.length; index++) {
                const input = dataRefresh.inputData[index];
                const cell = document.querySelector(`div[data-record-row="${input.recordRow}"][data-record-column="${input.recordColumn}"]`);
                if (cell) {
                    cell.innerHTML = input.value;
                }
            }
        } else {
            const cells = document.querySelectorAll('div[class="cell real-cell"]');
            cells.forEach((element) => (element.innerHTML = ''));
        }
        if (dataRefresh.borderData && dataRefresh.borderData.height) {
            const borderData = dataRefresh.borderData;
            if (borderData.isShowTop) {
                borderData.borderTop.style = `left: ${borderData.left}px; top: ${borderData.top}px; width: ${borderData.width}px;`;
                borderData.borderTop.classList.remove('hidden');
            } else {
                borderData.borderTop.classList.add('hidden');
            }
            if (borderData.isShowLeft) {
                borderData.borderLeft.style = `left: ${borderData.left}px; top: ${borderData.top}px; height: ${borderData.height}px;`;
                borderData.borderLeft.classList.remove('hidden');
            } else {
                borderData.borderLeft.classList.add('hidden');
            }
            if (borderData.isShowRight) {
                borderData.borderRight.style = `left: ${borderData.right}px; top: ${borderData.top}px; height: ${borderData.height}px;`;
                borderData.borderRight.classList.remove('hidden');
            } else {
                borderData.borderRight.classList.add('hidden');
            }
            if (borderData.isShowBottom) {
                borderData.borderBottom.style = `left: ${borderData.left}px; top: ${borderData.bottom}px; width: ${borderData.width}px;`;
                borderData.borderBottom.classList.remove('hidden');
            } else {
                borderData.borderBottom.classList.add('hidden');
            }

            if (dataRefresh.selectedCells && dataRefresh.selectedCells.length > 0) {
                const selectedOutdatedCells = document.getElementsByClassName('selected');
                if (selectedOutdatedCells && selectedOutdatedCells.length > 0) {
                    for (let element of selectedOutdatedCells) {
                        element.classList.remove('selected');
                    }
                }
                for (let element of dataRefresh.selectedCells) {
                    element.classList.add('selected');
                }
            }
        } else {
            dataRefresh.borderData.borderTop.classList.add('hidden');
            dataRefresh.borderData.borderLeft.classList.add('hidden');
            dataRefresh.borderData.borderRight.classList.add('hidden');
            dataRefresh.borderData.borderBottom.classList.add('hidden');
        }
    };

    resize = (resizeModel) => {
        if (!resizeModel) {
            return false;
        }

        // 行更新
        if (resizeModel.recordRow) {
            if (!resizeModel.resizingHeight) {
                return false;
            }
            // 修改行头
            const rowHead = document.querySelector(`div[data-type="row"][data-record="${resizeModel.recordRow}"]`);
            if (!rowHead) {
                return false;
            }
            this._addDynamicClass(resizeModel.resizingClass);
            rowHead.classList.add(resizeModel.resizingClassName);

            // 修改table-row下的所有单元格
            const tableCells = document.querySelectorAll(`div[data-record-row="${resizeModel.recordRow}"]`);
            tableCells.forEach((element) => element.classList.add(resizeModel.resizingClassName));

            // 修改行数据
            const cells = document.querySelectorAll(`div[data-record="${resizeModel.recordRow}"][data-type="table-row"]`);
            cells.forEach((element) => element.classList.add(resizeModel.resizingClassName));

            // 最后修改此行之后的所有元素
            for (let index = Number(rowHead.dataset.number) + 1; index < resizeModel.maxRow; index++) {
                let preTop = 0;
                let preHeight = resizeModel.cellHeight;
                const preRowHead = document.querySelector(`div[data-type="row"][data-number="${index - 1}"]`);
                if (preRowHead) {
                    preTop = Number(preRowHead.style.top.split('px')[0]);
                    preHeight = preRowHead.getBoundingClientRect().height;
                }
                const singleRowHead = document.querySelector(`div[data-type="row"][data-number="${index}"]`);
                const singleTopStr = preTop + preHeight + 'px';
                singleRowHead.style.top = singleTopStr;

                const singleCells = document.querySelectorAll(`div[data-number="${index}"][data-type="table-row"]`);
                singleCells.forEach((element) => (element.style.top = singleTopStr));
            }
        }
        // 列更新
        else if (resizeModel.recordColumn) {
            if (!resizeModel.resizingWidth) {
                return false;
            }
            // 修改列头
            const rowHead = document.querySelector(`div[data-type="column"][data-record="${resizeModel.recordColumn}"]`);
            if (!rowHead) {
                return false;
            }
            this._addDynamicClass(resizeModel.resizingClass);
            rowHead.classList.add(resizeModel.resizingClassName);

            // 修改列数据
            const cells = document.querySelectorAll(`div[data-record-column="${resizeModel.recordColumn}"]`);
            cells.forEach((element) => element.classList.add(resizeModel.resizingClassName));

            // 最后修改此行之后的所有元素
            for (let index = Number(rowHead.dataset.number) + 1; index < resizeModel.maxColumn; index++) {
                let preLeft = 0;
                let preWidth = resizeModel.cellWidth;
                const preRowHead = document.querySelector(`div[data-type="column"][data-number="${index - 1}"]`);
                if (preRowHead) {
                    preLeft = Number(preRowHead.style.left.split('px')[0]);
                    preWidth = preRowHead.getBoundingClientRect().width;
                }
                const singleRowHead = document.querySelector(`div[data-type="column"][data-number="${index}"]`);
                const singleTopStr = preLeft + preWidth + 'px';
                singleRowHead.style.left = singleTopStr;

                const singleCells = document.querySelectorAll(`div[data-index-column="${index}"]`);
                singleCells.forEach((element) => (element.style.left = singleTopStr));
            }
        } else {
            return false;
        }
    };

    reloadStyle = (styleData) => {
        if (styleData && styleData.length > 0) {
            for (let index = 0; index < styleData.length; index++) {
                const style = styleData[index];

                if (style.type === 'row') {
                    // 首先更新头
                    const rowHead = document.querySelector(`div[data-type="row"][data-record="${style.record}"]`);
                    if (!rowHead) {
                        continue;
                    }
                    rowHead.classList.add(style.className);

                    const tableRow = document.querySelector(`div[data-type='table-row'][data-record="${style.record}"]`);
                    tableRow.classList.add(style.className);

                    // 更新实际单元格
                    const cells = document.querySelectorAll(`div[data-record-row="${style.record}"]`);
                    cells.forEach((element) => element.classList.add(style.className));
                } else {
                    const columnHead = document.querySelector(`div[data-type="column"][data-record="${style.record}"]`);
                    if (!columnHead) {
                        continue;
                    }
                    // 更新实际单元格
                    const cells = document.querySelectorAll(`div[data-record-column="${style.record}"]`);
                    cells.forEach((element) => element.classList.add(style.className));
                }
            }
        }
    };
}
