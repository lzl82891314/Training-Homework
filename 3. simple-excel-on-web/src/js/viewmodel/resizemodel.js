'use strict';

export class ResizeModel {
    constructor(
        recordRow,
        recordColumn,
        indexRow,
        indexColumn,
        resizingHeight,
        resizingWidth,
        resizingClass,
        resizingClassName,
        maxRow,
        maxColumn,
        cellWidth,
        cellHeight
    ) {
        this.recordRow = recordRow;
        this.recordColumn = recordColumn;
        this.indexRow = indexRow;
        this.indexColumn = indexColumn;
        this.resizingHeight = resizingHeight;
        this.resizingWidth = resizingWidth;
        this.resizingClass = resizingClass;
        this.resizingClassName = resizingClassName;
        this.maxRow = maxRow;
        this.maxColumn = maxColumn;
    }
}
