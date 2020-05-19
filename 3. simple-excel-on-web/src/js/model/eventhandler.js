'use strict';

/**
 * 事件处理器
 */
export class EventHandler {
    constructor() {}

    static MOUSEUP = 'MOUSEUP';
    static MOUSEMOVE = 'MOUSEMOVE';
    static MOUSEDOWN = 'MOUSEDOWN';
    static CLICK = 'CLICK';
    static DBLCLICK = 'DBLCLICK';
    static BLUR = 'BLUR';
    static SCROLL = 'SCROLL';
    static WHEEL = 'WHEEL';

    _baseValidate = (event) => {
        if (!event) {
            return false;
        }
        if (!event.target) {
            return false;
        }
        return true;
    };

    resizeEventValidator = (event, eventType, currentHeadCell) => {
        if (this._baseValidate(event) === false) {
            return false;
        }
        if (eventType === EventHandler.MOUSEDOWN) {
            if (event.target.className.indexOf('head-bg resizing-column') <= -1 && event.target.className.indexOf('head-bg resizing-row') <= -1) {
                return false;
            }
        } else {
            if (!currentHeadCell) {
                return false;
            }
        }
        return true;
    };

    selectedEventValidator = (event, eventType, isSelected, selectedCells) => {
        if (this._baseValidate(event) === false) {
            return false;
        }
        if (eventType === EventHandler.MOUSEDOWN) {
            if (event.target.className.indexOf('real-cell') <= -1) {
                return false;
            }
        } else if (eventType === EventHandler.MOUSEMOVE) {
            if (event.target.className.indexOf('real-cell') <= -1) {
                return false;
            }
            if (!isSelected || isSelected === false) {
                return false;
            }
            if (!selectedCells || selectedCells.length === 0) {
                return false;
            }
        } else {
            if (!selectedCells || selectedCells.length === 0) {
                return false;
            }
        }
        return true;
    };

    inputEventValidator = (event, eventType) => {
        if (this._baseValidate(event) === false) {
            return false;
        }
        if (eventType === EventHandler.DBLCLICK) {
            if (event.target.className.indexOf('real-cell') <= -1) {
                return false;
            }
        }
        return true;
    };

    scrollEventValidator = (event, eventType) => {
        if (this._baseValidate(event) === false) {
            return false;
        }
        if (eventType === EventHandler.WHEEL) {
            if (event.deltaY === 0) {
                return false;
            }
        } else if (eventType === EventHandler.SCROLL) {
        } else {
            return false;
        }

        return true;
    };

    contextMenuEventValidator = (event) => {
        if (this._baseValidate(event) === false) {
            return false;
        }
        if (!event.which) {
            return false;
        }
        if (event.target.className.indexOf('cell-span') <= -1) {
            return false;
        }
        return true;
    };

    updatingEventValidator = (event) => {
        if (this._baseValidate(event) === false) {
            return false;
        }
        if (event.target.className.indexOf('update-span') <= -1) {
            return false;
        }
        return true;
    };
}
