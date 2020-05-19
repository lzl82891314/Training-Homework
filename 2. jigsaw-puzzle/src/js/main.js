'use strict';

/**
 * 拼图游戏处理器
 */
class JigsawPuzzleHandler {
    constructor() {
        this._constInitialize();
        this._resultDictionaryInitialize();
        this._piecesDataInitialize();
        this._attractingDataInitialize();
    }

    /**
     * 常量初始化
     */
    _constInitialize() {
        /**
         * 拼图容器向左Margin距离
         * 如果要在样式表中修改容器的margin-left，则需要对应修改此常量值
         */
        this.LEFT_MARGIN = 150;

        /**
         * 聘通容器向上margin距离
         * 功能点同上
         */
        this.TOP_MARGIN = 100;

        /**
         * 拼图散落方法所用到的X轴随机数计算种子
         */
        this.X_OFFSET_SEED = 100;

        /**
         * 拼图散落方法所用到的Y轴随机数计算种子
         */
        this.Y_OFFSET_SEED = 400;

        /**
         * 拼图散落方法所用到的X轴平移基数
         * 所有的拼图都是以此参数为基础加上述中的随机散落值进行打乱
         */
        this.X_OFFSET_LIMIT = 1200;

        /**
         * 拼图散落方法所用到的Y轴平移基数
         * 功能同上
         */
        this.Y_OFFSET_LIMIT = 0;

        /**
         * 移动拼图时，拼图所提升的z-index值
         */
        this.Z_INDEX_INCREASE_SEED = 20;

        /**
         * 拼图块移动TOP极限距离
         */
        this.TOP_MOVING_LIMIT = -20;

        /**
         * 拼图块移动LEFT极限距离
         */
        this.LEFT_MOVING_LIMIT = -150;

        /**
         * 拼图块移动RIGHT极限距离
         */
        this.RIGHT_MOVING_LIMIT = 1375;

        /**
         * 拼图块移动BOTTOM极限距离
         */
        this.BOTTOM_MOVING_LIMIT = 635;

        /**
         * 拼图容器宽度
         * 如果修改了样式表中父容器的宽度，需要同步修改此值保持一致
         */
        this.CONTAINER_WIDTH = 1000;

        /**
         * 拼图容器高度
         * 功能同上
         */
        this.CONTAINER_HEIGHT = 600;

        /**
         * 默认背景图地址
         * 当页面第一次初始化时加载的图片地址
         */
        this.DEFAULT_BG_URL = './resource/picture_01.jpg';

        /**
         * 游戏难度下限
         */
        this.LEVEL_MIN_LIMIT = 2;

        /**
         * 游戏难度上限
         */
        this.LEVEL_MAX_LIMIT = 16;
    }

    /**
     * 拼图块吸附边界集合初始化
     */
    _piecesDataInitialize() {
        this.PIECE_WIDTH = (this.CONTAINER_WIDTH / this.LEVEL).toFixed(0);
        this.PIECE_HEIGHT = (this.CONTAINER_HEIGHT / this.LEVEL).toFixed(0);

        // 边界计算公式为：(n-1) * width + width / 2
        this.ATTRACTING_X_LIMITS = [this.LEFT_MOVING_LIMIT];
        this.ATTRACTING_Y_LIMITS = [this.TOP_MOVING_LIMIT];

        for (let index = 0; index < this.LEVEL; index++) {
            this.ATTRACTING_X_LIMITS.push(index * this.PIECE_WIDTH + this.PIECE_WIDTH / 2);
            this.ATTRACTING_Y_LIMITS.push(index * this.PIECE_HEIGHT + this.PIECE_HEIGHT / 2);
        }
    }

    /**
     * 拼图结果集合初始化
     */
    _resultDictionaryInitialize() {
        this.resultDic = [];
        // 对一个piece的定位可以设计成一个(x, y)的坐标，然后再结构中是一个二维数组
        for (let indexY = 0; indexY < this.LEVEL; indexY++) {
            let innerArr = [];
            for (let indexX = 0; indexX < this.LEVEL; indexX++) {
                innerArr.push(-1);
            }
            this.resultDic.push(innerArr);
        }
    }

    /**
     * 拼图块吸附功能数据初始化
     */
    _attractingDataInitialize() {
        this.attractingData = [];
        for (let indexY = 0; indexY < this.LEVEL; indexY++) {
            let innerArr = [];
            for (let indexX = 0; indexX < this.LEVEL; indexX++) {
                innerArr.push({
                    x: indexX * this.PIECE_WIDTH,
                    y: indexY * this.PIECE_HEIGHT,
                    isCover: false,
                });
            }
            this.attractingData.push(innerArr);
        }
    }

    /**
     * 移动时拼图块时lock的一些参数归零
     */
    _movingArugmentToZero() {
        this.relativeX = 0;
        this.relativeY = 0;
        this.isMoving = false;
        this.movingTarget = {};
    }

    /**
     * 项目参数归零
     */
    _argumentToZero() {
        this._resultDictionaryInitialize();
        this._piecesDataInitialize();
        this._attractingDataInitialize();
        this._movingArugmentToZero();
    }

    /**
     * 鼠标按下事件处理方法
     */
    mouseDownHandler = (event) => {
        const target = this.targetCheck(event);
        if (!target) {
            throw new Error('argument error');
        }
        this.movingTarget = target;
        // 提高z-index以盖过其他拼图
        target.style.zIndex = this.Z_INDEX_INCREASE_SEED;
        let rect = target.getBoundingClientRect();
        this.relativeX = event.clientX - rect.left;
        this.relativeY = event.clientY - rect.top;
        this.isMoving = true;
        const idArr = target.id.split('_');
        if (idArr && idArr.length === 2) {
            const resultPoint = this.resultDic[Number(idArr[0])][Number(idArr[1])];
            if (resultPoint && resultPoint !== -1) {
                this.attractingData[resultPoint.x][resultPoint.y].isCover = false;
                this.resultDic[Number(idArr[0])][Number(idArr[1])] = -1;
            }
        }
    };

    /**
     * 鼠标弹上事件处理方法
     */
    mouseUpHandler = (event) => {
        const target = this.targetCheck(event);
        if (this.isMoving === true) {
            // 吸附功能
            this.pieceAttracting(target, event);
            target.style.zIndex = target.style.zIndex - this.Z_INDEX_INCREASE_SEED;
            // 移动参数归零
            this._movingArugmentToZero();
        }
    };

    /**
     * 鼠标移动事件处理方法
     */
    mouseMoveHandler = (event) => {
        if (this.isMoving === true) {
            if (!this.movingTarget) {
                throw new Error('argument error');
            }

            let toX = event.pageX - this.relativeX - this.LEFT_MARGIN;
            let toY = event.pageY - this.relativeY - this.TOP_MARGIN;
            if (toX < this.LEFT_MOVING_LIMIT) {
                toX = this.LEFT_MOVING_LIMIT;
            } else if (toX > this.RIGHT_MOVING_LIMIT) {
                toX = this.RIGHT_MOVING_LIMIT;
            }
            if (toY < this.TOP_MOVING_LIMIT) {
                toY = this.TOP_MOVING_LIMIT;
            } else if (toY > this.BOTTOM_MOVING_LIMIT) {
                toY = this.BOTTOM_MOVING_LIMIT;
            }
            EventUtil.movingHandler(this.movingTarget, toX, toY);
        }
    };

    /**
     * 选择图片按钮点击事件处理方法
     */
    fileButtonClickHandler = (event) => {
        const inputFile = document.getElementById('inputFile');
        if (inputFile) {
            inputFile.click();
        }
    };

    /**
     * 文件改变事件处理方法
     */
    fileHandler = (event) => {
        if (!event) {
            return false;
        }

        const target = event.target;
        if (target.files && target.files.length > 0) {
            const imageUrl = URL.createObjectURL(target.files[0]);
            this.startup(this.LEVEL, imageUrl);
        }
    };

    /**
     * 难度按钮点击事件处理方法
     */
    levelButtonClickHandler = (event) => {
        if (!event) {
            return false;
        }

        const inputElement = document.getElementById('level-value');
        if (!inputElement) {
            return false;
        }

        let level = Number(inputElement.value);
        if (level && !Number.isNaN(level)) {
            // 异常参数处理
            if (level < this.LEVEL_MIN_LIMIT) {
                level = this.LEVEL_MIN_LIMIT;
            } else if (level > this.LEVEL_MAX_LIMIT) {
                level = this.LEVEL_MAX_LIMIT;
            }

            // 调用startup方法重新开始游戏
            this.startup(level, this.CURRENT_BG_URL);
        }
    };

    /**
     * 重置按钮点击处理方法
     */
    clearButtonClickHandler = (event) => {
        if (!event) {
            return false;
        }

        this._argumentToZero();
        this.piecesUpset();
    };

    /**
     * 目标参数验证
     */
    targetCheck(event) {
        if (!event || !event.target) {
            throw new Error('argument error');
        }
        return event.target;
    }

    /**
     * 拼图块吸附功能
     */
    pieceAttracting(target, event) {
        let toX = event.pageX - this.relativeX - this.LEFT_MARGIN;
        let toY = event.pageY - this.relativeY - this.TOP_MARGIN;
        let index = this.fetchAttractingLimit(toX, toY);

        if (index.x > -1) {
            const attractingPiece = this.attractingData[index.x][index.y];
            if (attractingPiece && attractingPiece.isCover === false) {
                const idArr = target.id.split('_');
                if (idArr && idArr.length === 2) {
                    toX = attractingPiece.x;
                    toY = attractingPiece.y;
                    this.attractingData[index.x][index.y].isCover = true;
                    // 根据上一步操作，讲次逻辑再次反制
                    this.resultDic[Number(idArr[0])][Number(idArr[1])] = { x: index.x, y: index.y };
                    EventUtil.movingHandler(target, toX, toY);
                    this.gameEnding();
                }
            }
        }
    }

    /**
     * 获取当前x, y坐标下的吸附块边界
     */
    fetchAttractingLimit(toX, toY) {
        let index = {
            x: -1,
            y: -1,
        };

        for (let indexY = 1; indexY <= this.LEVEL; indexY++) {
            for (let indexX = 1; indexX <= this.LEVEL; indexX++) {
                if (toX > this.ATTRACTING_X_LIMITS[indexX - 1] && toX <= this.ATTRACTING_X_LIMITS[indexX]) {
                    if (toY > this.ATTRACTING_Y_LIMITS[indexY - 1] && toY <= this.ATTRACTING_Y_LIMITS[indexY]) {
                        // 此处注意：ATTRACTING_X_LIMITS确定的是列，相反的ATTRACTING_Y_LIMITS确定行，因此最终赋值的时候indexX和indexY要倒置
                        index.x = indexY - 1;
                        index.y = indexX - 1;
                        return index;
                    }
                }
            }
        }

        return index;
    }

    /**
     * 事件绑定
     */
    eventBinding() {
        // 绑定piece
        const pieces = document.getElementsByClassName('pieces');
        if (pieces && pieces.length > 0) {
            for (let index = 0; index < pieces.length; index++) {
                EventUtil.addEvent(pieces[index], 'mousedown', this.mouseDownHandler);
                EventUtil.addEvent(pieces[index], 'mouseup', this.mouseUpHandler);
            }

            // 绑定document
            EventUtil.addEvent(document, 'mousemove', this.mouseMoveHandler);

            // 绑定上传按钮
            const fileUploadButton = document.getElementById('fileUploadButton');
            if (fileUploadButton) {
                EventUtil.addEvent(fileUploadButton, 'click', this.fileButtonClickHandler);
                const inputFile = document.getElementById('inputFile');
                if (inputFile) {
                    EventUtil.addEvent(inputFile, 'change', this.fileHandler);
                }
            }

            // 绑定button按钮
            const levelButton = document.getElementById('btnLevelChange');
            if (levelButton) {
                EventUtil.addEvent(levelButton, 'click', this.levelButtonClickHandler);
            }
            const clearButton = document.getElementById('btnClear');
            if (clearButton) {
                EventUtil.addEvent(clearButton, 'click', this.clearButtonClickHandler);
            }
        }
    }

    /**
     * 事件解绑
     */
    eventUnbinding() {
        // 解绑piece
        const pieces = document.getElementsByClassName('pieces');
        if (pieces && pieces.length > 0) {
            for (let index = 0; index < pieces.length; index++) {
                EventUtil.removeEvent(pieces[index], 'mousedown', this.mouseDownHandler);
                EventUtil.removeEvent(pieces[index], 'mouseup', this.mouseUpHandler);
            }

            // 解绑document
            EventUtil.removeEvent(document, 'mousemove', this.mouseMoveHandler);

            // 解绑上传按钮
            const fileUploadButton = document.getElementById('fileUploadButton');
            if (fileUploadButton) {
                EventUtil.removeEvent(fileUploadButton, 'click', this.fileButtonClickHandler);
                const inputFile = document.getElementById('inputFile');
                if (inputFile) {
                    EventUtil.removeEvent(inputFile, 'change', this.fileHandler);
                }
            }

            // 解绑button按钮
            const levelButton = document.getElementById('btnLevelChange');
            if (levelButton) {
                EventUtil.removeEvent(levelButton, 'click', this.levelButtonClickHandler);
            }
            const clearButton = document.getElementById('btnClear');
            if (clearButton) {
                EventUtil.removeEvent(clearButton, 'click', this.clearButtonClickHandler);
            }
        }
    }

    /**
     * 拼图块打乱
     */
    piecesUpset() {
        const pieces = document.getElementsByClassName('pieces');
        const length = pieces.length;
        for (let index = 0; index < length; index++) {
            const toX = Math.random() * this.X_OFFSET_SEED + this.X_OFFSET_LIMIT;
            const toY = Math.random() * this.Y_OFFSET_SEED + this.Y_OFFSET_LIMIT;
            EventUtil.movingHandler(pieces[index], toX, toY);
        }
    }

    /**
     * 功能启动方法
     * @param level 选择的难度
     * @param bgUrl 选择的背景图
     */
    startup(level = 3, bgUrl = '') {
        // 异常参数验证
        if (Number.isNaN(level)) {
            level = 3;
        } else if (level < this.LEVEL_MIN_LIMIT) {
            level = this.LEVEL_MIN_LIMIT;
        } else if (level > this.LEVEL_MAX_LIMIT) {
            level = this.LEVEL_MAX_LIMIT;
        }
        if (!bgUrl || bgUrl === '') {
            bgUrl = this.DEFAULT_BG_URL;
        }

        this.LEVEL = level;
        this.CURRENT_BG_URL = bgUrl;

        // 首先调用drawingPuzzlePieces()方法构建页面布局
        this.drawingPuzzlePieces(bgUrl);

        // 其次归零参数
        this._argumentToZero();

        // 之后绑定事件，绑定前先解绑
        this.eventUnbinding();
        this.eventBinding();

        // 最后打乱拼图块
        this.piecesUpset();
    }

    /**
     * 判断是否游戏结束方法
     */
    isGameEnding() {
        for (let indexY = 0; indexY < this.LEVEL; indexY++) {
            for (let indexX = 0; indexX < this.LEVEL; indexX++) {
                if (this.attractingData[indexX][indexY].isCover === false) {
                    return false;
                }
                const piecePoint = this.resultDic[indexX][indexY];
                // 由于存入的时候反转，因此此处应该再次反转
                if (piecePoint.x !== indexY || piecePoint.y !== indexX) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 游戏结束方法
     */
    gameEnding() {
        if (this.isGameEnding()) {
            setTimeout(() => {
                alert('你已经完成了此拼图游戏，恭喜你！！你可以选择向更高难度发起挑战~');
            }, 500);
        }
    }

    /**
     * 拼图块绘制方法
     */
    drawingPuzzlePieces() {
        const bgContainer = document.getElementById('bgContainer');
        bgContainer.style.backgroundImage = `url('${this.CURRENT_BG_URL}')`;

        const container = document.getElementById('puzzleContainer');
        let appendHTML = '';
        for (let indexY = 0; indexY < this.LEVEL; indexY++) {
            for (let indexX = 0; indexX < this.LEVEL; indexX++) {
                const styleHTML = this.createPiecesStyle(indexX, indexY);
                appendHTML += `<div id='${indexX}_${indexY}' class='pieces' style='${styleHTML}'></div>`;
            }
        }
        container.innerHTML = appendHTML;
    }

    /**
     * 拼图块样式拼接
     * @param {*} indexX 对应拼图块的X坐标
     * @param {*} indexY 对应拼图块的Y坐标
     */
    createPiecesStyle(indexX, indexY) {
        const stylePercent = 1 / this.LEVEL;
        let styleHTML = `width: ${stylePercent * 100}%; height: ${stylePercent * 100}%; left: ${indexX * stylePercent * 100}%; top: ${
            indexY * stylePercent * 100
        }%; `;
        const bgOffsetPercent = 1 / (this.LEVEL - 1);
        styleHTML += `background: url("${this.CURRENT_BG_URL}"); background-size: 1000px 600px; `;
        styleHTML += `background-position: left ${bgOffsetPercent * indexX * 100}% top ${bgOffsetPercent * indexY * 100}%;`;
        return styleHTML;
    }
}

/**
 * 事件辅助工具类
 */
class EventUtil {
    /**
     *添加事件方法
     * @static 静态方法
     * @param {*} target 需要绑定的事件目标元素
     * @param {*} eventType 事件类型
     * @param {*} handler 事件响应方法
     * @memberof EventHandler
     */
    static addEvent(target, eventType, handler) {
        try {
            if (target.addEventListener) {
                target.addEventListener(eventType, handler, false);
            } else {
                target.attachEvent('on' + eventType, (event) => {
                    return handler.call(target, event);
                });
            }
        } catch (exception) {
            throw new Error(exception);
        }
    }

    /**
     *解绑事件方法
     * @static 静态方法
     * @param {*} target 需要解绑的事件目标元素
     * @param {*} eventType 事件类型
     * @param {*} handler 事件响应方法
     * @memberof EventHandler
     */
    static removeEvent(target, eventType, handler) {
        try {
            target.removeEventListener(eventType, handler);
        } catch (exception) {
            throw new Error(exception);
        }
    }

    /**
     * 元素移动处理方法
     * 方法中的坐标都是只相对坐标，即相对于父容器的坐标
     * @static
     * @param {*} target 目标元素
     * @param {*} toX 目标的X坐标
     * @param {*} toY 目标的Y坐标
     * @memberof EventHandler
     */
    static movingHandler(target, toX, toY) {
        if (target) {
            target.style.left = `${toX}px`;
            target.style.top = `${toY}px`;
        }
    }
}

window.onload = () => {
    let handler = new JigsawPuzzleHandler();
    handler.startup();
};
