if (typeof require !== 'undefined' && typeof module !== 'undefined') {
    var Game = require('../lib/CellAutomataLogic')
}

describe('Game', function() {
    it('should be defined', function() {
        expect(Game).toBeDefined();
    })
    it('should accept width, height and initialState', function() {
        expect(Game.length).toEqual(3);
    })
    describe('#constructor', function() {
        var gameInstance, height = 10,
            width = 10
            beforeEach(function() {
                gameInstance = new Game(height, width);
            })
            it('should create cells', function() {
                expect(gameInstance.cells).toBeDefined();
                expect(gameInstance.cells instanceof Array).toBeTruthy();
            })
            it('should create appropriate amount of cells', function() {
                expect(gameInstance.cells.length).toEqual(width * height);
            })
            it('should assign each cell x & y', function() {
                var randomIndex = Math.floor(Math.random() * width * height);
                var randomCell = gameInstance.cells[randomIndex]
                expect(randomCell.x).toBeDefined();
                expect(randomCell.y).toBeDefined();
                expect(gameInstance.cells[0].x).toEqual(0)
                expect(gameInstance.cells[0].y).toEqual(0)
                expect(gameInstance.cells.slice(-1)[0].x).toEqual(width - 1)
                expect(gameInstance.cells.slice(-1)[0].y).toEqual(height - 1)
            })
            it('should assign each cell a state', function() {
                toHaveState = function(cell) {
                    return !!cell.state
                }
                expect(gameInstance.cells.every(toHaveState)).toBeTruthy();
            })
            it('should assign state according to initialState', function() {
                var FixtureState = ['alive', 'dead', 'empty', 'alive']
                var smallerGame = new Game(2, 2, FixtureState)
                expect(smallerGame.cells.map(function(cell) {
                    return cell.state
                })).toEqual(FixtureState);
            })
    })
    describe('instance', function() {
        var gameInstance,
            width = 4,
            height = 4,
            initialState = [
                'alive', 'dead', 'empty', 'alive',
                'alive', 'dead', 'empty', 'alive',
                'alive', 'dead', 'empty', 'alive',
                'alive', 'dead', 'empty', 'alive'
            ];
        beforeEach(function() {
            gameInstance = new Game(width, height, initialState)
        })
        it('should be an object', function() {
            expect(typeof gameInstance).toBe('object');
        })
        describe('#setState', function() {
            var newState = [
                'alive', 'alive', 'alive', 'dead',
                'alive', 'alive', 'alive', 'alive',
                'alive', 'alive', 'alive', 'dead',
                'alive', 'alive' /*'empty', 'empty' */
            ],
                listState = function(game) {
                    return game.cells.map(function(cell) {
                        return cell.state
                    })
                }
            it('should be defined', function() {
                expect(gameInstance.setState).toBeDefined();
            })
            it('should accept array of states', function() {
                expect(gameInstance.setState.length).toBeGreaterThan(0);
            })
            it('should set state for cells', function() {
                expect(listState(gameInstance)).toEqual(initialState);
                gameInstance.setState(newState)
                expect(listState(gameInstance)).toEqual(newState.concat(['empty', 'empty']));
            })
            it('should accept string for states', function() {
                expect(listState(gameInstance)).toEqual(initialState);
                gameInstance.setState('aaadaaaaaaadaa');
                expect(listState(gameInstance)).toEqual(newState.concat(['empty', 'empty']));
            })
        })
        describe('#setRules', function() {
            var defaults = {
                adjacent: true,
                favorableAmount: 3,
                overcrowdedAmount: 3,
                lonelyAmount: 2,
                instantDeath: true,
                wrappingField: true,
                turnsDecompose: 0
                // random: false,
            }
            it('should be defined', function() {
                expect(gameInstance.setRules).toBeDefined();
            })
            it('should set rules for instance', function() {
                expect(gameInstance.getRules()).not.toBeDefined();
                gameInstance.setRules({})
                expect(gameInstance.getRules()).toBeDefined();
            })
            it('should fallback to defaults if no rules are given', function() {
                gameInstance.setRules({})
                expect(gameInstance.getRules()).toEqual(defaults);
            })
            it('should extend defaults with provided values', function() {
                gameInstance.setRules({
                    adjacent: false,
                    lonelyAmount: 2
                })
                defaultsClone = JSON.parse(JSON.stringify(defaults))
                defaultsClone.adjacent = false
                defaultsClone.lonelyAmount = 2
                expect(gameInstance.getRules()).toEqual(defaultsClone);
            })
        })
        describe('#getXY', function() {
            it('should be defined', function() {
                expect(gameInstance.getXY).toBeDefined();
            })
            it('should return cell with corresponding values', function() {
                expect(gameInstance.getXY(2, 2).x).toEqual(2)
                expect(gameInstance.getXY(2, 2).y).toEqual(2)
            })
            it('should throw for outside boundaries values', function() {
                expect(gameInstance.getXY.bind(100, 100)).toThrow();
            })
        })
        describe('#getNeighbours', function() {
            function collectXY(gameInstance) {
                return gameInstance.map(function(cell) {
                    return [cell.x, cell.y]
                })
            }
            it('should be defined', function() {
                expect(gameInstance.getNeighbours).toBeDefined();
            })
            it('should return an array', function() {
                expect(gameInstance.getNeighbours(2, 2) instanceof Array).toBe(true);
            })
            describe('should return an array of cells nearby (adjacent = false)', function() {
                var simplestResult = [
                    [1, 2],
                    [3, 2],
                    [2, 1],
                    [2, 3]
                ],
                    actualResult = [];

                beforeEach(function() {
                    actualResult = gameInstance.getNeighbours(2, 2)
                })
                it('with 4 neighbours for central cell', function() {
                    expect(actualResult.length).toEqual(4)
                })
                it('and less for cell on side/corner', function() {
                    expect(gameInstance.getNeighbours(0, 0).length).toEqual(2)
                    expect(gameInstance.getNeighbours(width - 1, height - 1).length).toEqual(2)
                    expect(gameInstance.getNeighbours(width - 1, height - 2).length).toEqual(3)
                    expect(gameInstance.getNeighbours(width - 2, height - 1).length).toEqual(3)
                })
                it('neighbours should have coordinates next to initial', function() {
                    expect(collectXY(actualResult)).toEqual(simplestResult)
                })
            })
            describe('should return an array of cells nearby (wrapping = false)', function() {
                var simplestResult = [
                    [1, 0],
                    [0, 1]
                ],
                    actualResultNonAdjacent = [],
                    actualResultAdjacent = [];

                beforeEach(function() {
                    actualResultNonAdjacent = gameInstance.getNeighbours(0, 0, {
                        wrappingField: false,
                        adjacent: false
                    })
                    actualResultAdjacent = gameInstance.getNeighbours(0, 0, {
                        wrappingField: false,
                        adjacent: true
                    })
                })
                it('of length 2 when adjacent = false', function() {
                    expect(actualResultNonAdjacent.length).toEqual(2);
                })
                it('of length 3 when adjacent = true', function() {
                    expect(actualResultAdjacent.length).toEqual(3);
                })
                it('of cells nearby original', function() {
                    expect(collectXY(actualResultNonAdjacent)).toEqual(simplestResult);
                    expect(collectXY(actualResultAdjacent)).toEqual(simplestResult.concat([
                        [1, 1]
                    ]));
                })
            })
            describe('should return an array of cells nearby (wrapping = true)', function() {
                var simplestResult = [
                    [height - 1, 0],
                    [1, 0],
                    [0, width - 1],
                    [0, 1]
                ];
                var extendingResult = [
                    [height - 1, width - 1],
                    [height - 1, 1],
                    [1, width - 1],
                    [1, 1]
                ]

                actualResultNonAdjacent = [],
                    actualResultAdjacent = [];

                beforeEach(function() {
                    actualResultNonAdjacent = gameInstance.getNeighbours(0, 0, {
                        wrappingField: true,
                        adjacent: false
                    })
                    actualResultAdjacent = gameInstance.getNeighbours(0, 0, {
                        wrappingField: true,
                        adjacent: true
                    })
                })
                it('of length 4 when adjacent = false', function() {
                    expect(actualResultNonAdjacent.length).toEqual(4);
                })
                it('of length 8 when adjacent = true', function() {
                    expect(actualResultAdjacent.length).toEqual(8);
                })
                it('of cells nearby original', function() {
                    expect(collectXY(actualResultNonAdjacent))
                        .toEqual(simplestResult);
                    expect(collectXY(actualResultAdjacent))
                        .toEqual(simplestResult.concat(extendingResult));
                });
            })
            describe('should return an array of cells nearby (adjacent = true)', function() {
                var simplestResult = [
                    [1, 2],
                    [3, 2],
                    [2, 1],
                    [2, 3],
                    [1, 1],
                    [1, 3],
                    [3, 1],
                    [3, 3]
                ],
                    actualResult = [];

                beforeEach(function() {
                    actualResult = gameInstance.getNeighbours(2, 2, {
                        adjacent: true
                    })
                })
                it('with 8 neighbours for central cell', function() {
                    expect(actualResult.length).toEqual(8)
                })
                it('and less for cell on side/corner', function() {
                    expect(gameInstance.getNeighbours(0, 0, {
                        adjacent: true
                    }).length).toEqual(3)
                    expect(gameInstance.getNeighbours(width - 1, height - 1, {
                        adjacent: true
                    }).length).toEqual(3)
                    expect(gameInstance.getNeighbours(width - 1, height - 2, {
                        adjacent: true
                    }).length).toEqual(5)
                    expect(gameInstance.getNeighbours(width - 2, height - 1, {
                        adjacent: true
                    }).length).toEqual(5)
                })
                it('neighbours should have coordinates next to initial', function() {
                    expect(collectXY(actualResult)).toEqual(simplestResult)
                })
            })
        })
    });
    describe('#predictSingleCell', function() {
        var defaults = {
            adjacent: true,
            favorableAmount: 3,
            overcrowdedAmount: 3,
            lonelyAmount: 2,
            random: false,
            wrappingField: true,
            instantDeath: true,
            turnsDecompose: 0
        },
            height = 4,
            width = 4,
            gameInstance = new Game(width, height);
        it('should be defined', function() {
            expect(Game.predictSingleCell).toBeDefined();
        });
        it('should accept x, y, currentState, rules', function() {
            expect(Game.predictSingleCell.length).toEqual(4)
        })
        describe('given Conway\'s Game of Life rules', function() {
            function shuffle(o) { //v1.0
                for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
                return o;
            };

            function createLiveNeighboursString(n, originalCell) {
                if (!originalCell) {
                    originalCell = 'a'
                }
                var cellsToBe = []
                for (var i = 0; i < n; i++) {
                    cellsToBe.push('a')
                }
                // hardcoding for 3x3 = 9 - 1
                for (var i = 0; i < 9 - n - 1; i++) {
                    cellsToBe.push('e')
                }
                var letterPool = shuffle(cellsToBe)
                return letterPool.slice(0, 4).concat(originalCell).concat(letterPool.slice(4, 8)).join('')
            }
            var gameInstance;
            beforeEach(function() {
                gameInstance = new Game(3, 3).setRules({
                    adjacent: true,
                    overcrowdedAmount: 3,
                    favorableAmount: 3,
                    lonelyAmount: 2,
                    instantDeath: true,
                    turnsDecompose: 0
                });
            })
            describe('Any live cell with fewer than two live neighbours dies, as if caused by under-population.', function() {
                it('without single neighbour', function() {
                    gameInstance.setState("eeeeae");
                    var result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules());
                    expect(result).toEqual('empty');
                });
                describe('should account for diagonal neighbours', function() {
                    it('top-left', function() {
                        gameInstance.setState("aeeeae")
                        var result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules())
                        expect(result).toEqual('empty');
                    })
                    it('top-right', function() {
                        gameInstance.setState("eeaeae")
                        var result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules())
                        expect(result).toEqual('empty');
                    })
                    it('bottom-left', function() {
                        gameInstance.setState("eeeeaeaee")
                        var result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules())
                        expect(result).toEqual('empty');
                    })
                    it('bottom-right', function() {
                        gameInstance.setState("eeeeaeeea")
                        var result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules())
                        expect(result).toEqual('empty');
                    })
                });
                describe('should account for regular neighbours', function() {
                    it('left', function() {
                        gameInstance.setState('eeeaaeee');
                        var result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules());
                        expect(result).toEqual('empty');
                    })
                    it('right', function() {
                        gameInstance.setState('eeeeaaee');
                        var result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules());
                        expect(result).toEqual('empty');
                    })
                    it('top', function() {
                        gameInstance.setState('eaeeaeee');
                        var result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules());
                        expect(result).toEqual('empty');
                    })
                    it('bottom', function() {
                        gameInstance.setState('eeeeaeae');
                        var result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules());
                        expect(result).toEqual('empty');
                    })
                })
            })
            describe('Any live cell with two or three live neighbours lives on to the next generation.', function() {
                it('case #1: left-right', function() {
                    gameInstance.setState('eeeaaaeee');
                    var result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules());
                    expect(result).toEqual('alive');
                })
                it('case #2: bottom-right', function() {
                    gameInstance.setState('eeeeaaeae');
                    var result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules());
                    expect(result).toEqual('alive');
                })
                it('case #3: top-bottom', function() {
                    gameInstance.setState('eeeaaaeee');
                    var result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules());
                    expect(result).toEqual('alive');
                })
                it('case #4: top-right-left', function() {
                    gameInstance.setState('eeaaaeeee');
                    var result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules());
                    expect(result).toEqual('alive');
                })
            })
            describe('Any live cell with more than three live neighbours dies, as if by overcrowding.', function() {
                it('given there\'re 4 neighbours', function() {
                    var result;
                    for (var tries = 0; tries < 10; tries++) {
                        gameInstance.setState(createLiveNeighboursString(4));
                        result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules());
                        expect(result).toEqual('empty');
                    }
                })
                it('given there\'re 5 neighbours', function() {
                    var result;
                    for (var tries = 0; tries < 10; tries++) {
                        gameInstance.setState(createLiveNeighboursString(5));
                        result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules());
                        expect(result).toEqual('empty');
                    }
                })
                it('given there\'re 6 neighbours', function() {
                    var result;
                    for (var tries = 0; tries < 10; tries++) {
                        gameInstance.setState(createLiveNeighboursString(6));
                        result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules());
                        expect(result).toEqual('empty');
                    }
                })
                it('given there\'re 7 neighbours', function() {
                    var result, initial;
                    for (var tries = 0; tries < 10; tries++) {
                        gameInstance.setState(createLiveNeighboursString(7));
                        result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules());
                        expect(result).toEqual('empty');
                    }
                })
                it('given there\'re 8 neighbours', function() {
                    gameInstance.setState('aaaaaaaaa');
                    result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules());
                    expect(result).toEqual('empty');
                })
            })
            it('Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.', function() {
                var result;
                for (var tries = 0; tries < 10; tries++) {
                    gameInstance.setState(createLiveNeighboursString(3, 'e'));
                    result = Game.predictSingleCell(1, 1, gameInstance, gameInstance.getRules());
                    expect(result).toEqual('alive');
                }
            })
        })
        describe('given modified Conway\'s Game of life rules', function() {
            var thisSuiteGameInstance, thisSuiteRules = {
                    adjacent: true,
                    overcrowdedAmount: 3,
                    favorableAmount: 3,
                    lonelyAmount: 2,
                    instantDeath: false,
                    turnsDecompose: 3
                };
            beforeEach(function() {
                thisSuiteGameInstance = new Game(3, 3, "eeeeae").setRules(thisSuiteRules);
            })
            it('it should not mark cell empty, instead, mark it dead', function(){
                expect(thisSuiteGameInstance.getXY(1, 1).state).toEqual('alive')
                thisSuiteGameInstance.setState(Game.computeNextState(thisSuiteGameInstance, thisSuiteRules))
                expect(thisSuiteGameInstance.getXY(1, 1).state).toEqual('dead')
            })
            it('it should not mark cell empty, instead, mark it dead', function(){
                function skipTurn() {
                    thisSuiteGameInstance.setState(Game.computeNextState(thisSuiteGameInstance, thisSuiteRules))
                }
                expect(thisSuiteGameInstance.getXY(1, 1).state).toEqual('alive')
                for (var i = 0; i < thisSuiteRules.turnsDecompose; i++) {skipTurn()}
                expect(thisSuiteGameInstance.getXY(1, 1).state).toEqual('dead')
                skipTurn()
                expect(thisSuiteGameInstance.getXY(1, 1).state).toEqual('empty')
            })
        })
    });
    describe('#computeNextState', function() {
        var defaults = {
            adjacent: true,
            favorableAmount: 3,
            overcrowdedAmount: 3,
            lonelyAmount: 2,
            random: false,
            wrappingField: true,
            instantDeath: true,
            turnsDecompose: 0
        },
            height = 4,
            width = 4,
            gameInstance = new Game(width, height);
        beforeEach(function() {
            // I have jasmine 2.0 for html runner & 1.3 for node-jasmine 
            // and they differ in call through syntax
            var spiedMethod = spyOn(Game, 'predictSingleCell')
            try {
                spiedMethod.andCallThrough()
            } catch (e) {
                spiedMethod.and.callThrough()
            }
        })
        it('should be defined', function() {
            expect(Game.computeNextState).toBeDefined();
        })
        it('should accept current state & rules as arguments', function() {
            expect(Game.computeNextState.length).toBe(2);
        })
        it('should call Game.predictSingleCell', function() {
            Game.computeNextState(gameInstance, defaults)
            expect(Game.predictSingleCell).toHaveBeenCalled();
        })
        it('should return array of states', function() {
            var newState = Game.computeNextState(gameInstance, defaults)
            expect(newState instanceof Array).toBeTruthy();
            expect(newState.length).toEqual(width * height);
        })
        it('should return array of states for each cell', function() {
            gameInstance.setState();

            function isTruthy(el) {
                return el
            }
            var newState = Game.computeNextState(gameInstance, defaults)
            expect(newState.filter(isTruthy).length).toEqual(width * height);
        })
    })
})