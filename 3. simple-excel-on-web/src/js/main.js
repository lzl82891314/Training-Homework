'use strict';

import { ExcelController } from './controller/excelcontroller';

window.onload = () => {
    const excelController = new ExcelController();
    excelController.startup(200, 200);
};
