'use strict';

export class TableRefreshModel {
    constructor(step, maxRow, maxColumn, styleData, cellHeight, cellWidth, rowCount, columnCount, type = 'row') {
        this.step = step;
        this.maxRow = maxRow;
        this.maxColumn = maxColumn;
        this.styleData = styleData;
        this.cellHeight = cellHeight;
        this.cellWidth = cellWidth;
        this.rowCount = rowCount;
        this.columnCount = columnCount;
        this.type = type;
    }
}

export class DataRefreshModel {
    constructor(step, inputData, borderData, selectedCells) {
        this.step = step;
        this.inputData = inputData;
        this.borderData = borderData;
        this.selectedCells = selectedCells;
    }
}
