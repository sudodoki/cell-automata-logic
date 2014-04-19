/* global require, module */
/* jshint expr: true */
(function() {
    'use strict';
    var deepExtend;
    if (typeof require !== 'undefined' && typeof module !== 'undefined') {
        deepExtend = require('./objectDeepExtend');
        // TODO: remove ridiculous discrimination against regular browser code
        var EventEmitter = require('events').EventEmitter;
        var util = require('util');
        util.inherits(Game, EventEmitter);
    } else {
        deepExtend = Object.deepExtend;
    }

    function Game(width, height, initialState) {
        this.cells = [];
        this.width = width;
        this.height = height;
        for (var i = 0; i < height * width; i++) {
            this.cells.push({
                x: i % width,
                y: Math.floor(i / width),
                /* Possible states: 'dead', 'alive', 'empty', 'occupied' */
                state: 'empty'
            });
        }
        if (initialState) {this.setState(initialState);}
        return this;
    }
    Game.prototype.getState = function() {
        return this.cells.map(function (cell) {
            return cell.state;
        });
    };
    Game.prototype.setState = function(stateList) {
        var dictionary = {
            'd': 'dead',
            'a': 'alive',
            'e': 'empty',
            'o': 'occupied'
        };
        if (!stateList || !stateList.length) {
            return;
        }
        if (typeof stateList === 'string') {
            stateList = stateList
                .split('')
                .map(function(letter) {
                    return dictionary[letter];
                });
        }
        var previousState, cell;
        for (var i = 0; i < this.width * this.height; i++) {
            cell = this.cells[i];
            previousState = cell.state;
            cell.state = (stateList[i] || 'empty');
            if (cell.state !== previousState) { cell.turnsSame = 0; }
            cell.turnsSame++;
        }
        this.emit && this.emit('update');
        return this;
    };
    var DEFAULT_RULES;

    DEFAULT_RULES = {
        adjacent: true,
        overcrowdedAmount: 3,
        favorableAmount: 3,
        lonelyAmount: 2,
        instantDeath: true,
        wrappingField: true,
        turnsDecompose: 0
        //random: false,
    };
    Game.prototype.setRules = function(rules) {
        this.rules = deepExtend(DEFAULT_RULES, rules);
        this.emit && this.emit('update');
        return this;
    };
    Game.prototype.getRules = function() {
        if (!this.rules) { return this.rules; }
        return JSON.parse(JSON.stringify(this.rules));
    };
    Game.prototype.cycleXY = function cycleXY(x, y) {
      var allStates = ['dead', 'alive', 'empty', 'occupied'];
      var currentState = this.getXY(x, y).state;
      var newState = allStates[(allStates.indexOf(currentState) + 1) % allStates.length];
      this.setStateXY(x, y, newState);
    };
    Game.prototype.setStateXY = function setStateXY(x, y,state) {
        this.getXY(x, y).state = state;
        this.emit && this.emit('update');
        return this;
    };
    Game.prototype.getXY = function getXY(x, y) {
        if (x < 0 || x >= this.width) {
            return null;
        }
        if (y < 0 || y >= this.height) {
            return null;
        }
        return this.cells[y * this.width + x];
    };

    var STRAIGHT_DIRECTIONS = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];
    var DIAGONAL_DIRECTIONS = [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1]
    ];
    Game.prototype.getNeighbours = function getNeigbours(x, y, options) {
        var adjacent = options && options.adjacent,
            wrapping = options && options.wrappingField,
            directions = STRAIGHT_DIRECTIONS,
            self = this;

        if (adjacent) {
            directions = directions.concat(DIAGONAL_DIRECTIONS);
        }

        function truthy(el) {
            return el;
        }

        function cycleBoundaries(value, minBoundary, maxBoundary) {
            if (minBoundary <= value && value < maxBoundary) {
                return value;
            }
            if (minBoundary > value) {
                return maxBoundary - 1;
            }
            if (maxBoundary <= value) {
                return minBoundary;
            }
            throw ('My life should end here, I failed my creator.');
        }
        return directions.map(function(shift) {
            var probableX = x + shift[0],
                probableY = y + shift[1];
            if (wrapping) {
                probableX = cycleBoundaries(probableX, 0, self.width);
                probableY = cycleBoundaries(probableY, 0, self.height);
            }
            return self.getXY(probableX, probableY);
        }).filter(truthy);
    };


    Game.predictSingleCell = function predictSingleCell(x, y, currentState, rules) {
        var cell = currentState.getXY(x, y),
            neigbours = currentState.getNeighbours(x, y, {
                adjacent: rules.adjacent,
                wrappingField: rules.wrappingField
            });

        function isState(state) {
            return function(cell) {
                return cell.state === state;
            };
        }

        if (cell.state === 'alive' && neigbours.filter(isState('alive')).length < rules.lonelyAmount) {
            return (rules.instantDeath) ? 'empty' : 'dead';
        }
        if (cell.state === 'alive' && (rules.lonelyAmount <= neigbours.filter(isState('alive')).length && neigbours.filter(isState('alive')).length <= rules.favorableAmount)) {
            return 'alive';
        }
        if (cell.state === 'alive' && neigbours.filter(isState('alive')).length > rules.overcrowdedAmount) {
            return rules.instantDeath ? 'empty' : 'dead';
        }
        if (cell.state === 'empty' && neigbours.filter(isState('alive')).length === rules.favorableAmount) {
            return 'alive';
        }
        if (cell.state === 'dead') {
          return (cell.turnsSame < rules.turnsDecompose) ? 'dead' : 'empty';
        }
        return cell.state;
    };

    Game.computeNextState = function computeNextState(currentState, rules) {
        var nextStatesArray = [];
        for (var y = 0; y < currentState.height; y++) {
            for (var x = 0; x < currentState.width; x++) {
                var newState = Game.predictSingleCell(x, y, currentState, rules);
                nextStatesArray.push(newState);
            }
        }
        return nextStatesArray;
    };
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Game;
    } else {
        window.Game = Game;
    }
})();