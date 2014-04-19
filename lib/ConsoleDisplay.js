/* global console, module */
(function() {
    'use strict';

    function ConsoleDisplay(CellAutomataLogic) {
        this.height = CellAutomataLogic.height;
        this.width = CellAutomataLogic.width;
        this.cells = CellAutomataLogic.cells;
    }
    if (typeof console === undefined || !console.clear) {
        console.clear = function() {};
    }

    var BLACK_BG_RED_COLOR = 'background: #222; color: #f00',
        BLACK_BG_GREEN_COLOR = 'background: #222; color: #bada55',
        BLACK_BG_GRAY_COLOR = 'background: #222; color: #eee',
        BLACK_BG_DARKGRAY_COLOR = 'background: #222; color: #777',
        RELATIONS = {
        'dead': BLACK_BG_RED_COLOR,
        'alive': BLACK_BG_GREEN_COLOR,
        'empty': BLACK_BG_GRAY_COLOR,
        'occupied': BLACK_BG_DARKGRAY_COLOR
    };

    ConsoleDisplay.prototype.display = function() {
        var tempString = '',
            tempStyles = [],
            tempCell;
        console.clear();
        for (var i = 0; i < this.height; i++) {
            tempString = '';
            tempStyles = [];
            for (var j = 0; j < this.width; j++) {
                tempCell = this.cells[i * this.height + j];
                tempString = tempString + '%c 0 ';
                tempStyles.push(RELATIONS[tempCell.state]);
            }
            tempString = tempString.slice(0, -1);
            console.log.apply(console, [tempString].concat(tempStyles));

        }
        return this;
    };
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = ConsoleDisplay;
    } else {
        window.ConsoleDisplay = ConsoleDisplay;
    }
})();