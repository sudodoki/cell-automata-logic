if (typeof require !== 'undefined' && typeof module !== 'undefined') {
    var Game = require('../lib/CellAutomataLogic')
    var ConsoleDisplay = require('../lib/ConsoleDisplay')
}

describe('ConsoleDisplay', function() {
    var height = 4,
        width = 4,
        gameInstance, displayInstance;
    beforeEach(function() {
        gameInstance = new Game(height, width, 'adeaaaaaaaadaa');
        displayInstance = new ConsoleDisplay(gameInstance);
    })
    describe('#display', function() {
        beforeEach(function() {
            spyOn(console, 'log')
            spyOn(console, 'clear')
        })
        it('should be defined', function() {
            expect(displayInstance.display).toBeDefined();
        })
        it('should call console.log', function() {
            displayInstance.display()
            expect(console.clear).toHaveBeenCalled();
        })
        it('should call console.log #' + height + ' times', function() {
            displayInstance.display()
            // Fix for 2.0 & 1.3
            var callCounts = console.log.calls.length || console.log.calls.count()
            expect(callCounts).toEqual(height);
        })
        it('should pass exactly ' + (width + 1) + ' strings to console.log each time', function() {
            displayInstance.display()
            for (var time = 0; time < height; time++) {
                // another 2.0 <->  1.3 fix
                if (!console.log.calls.argsFor) {
                    console.log.calls.argsFor = function(time) {
                        return console.log.calls[time].args
                    }
                }
                expect(console.log.calls.argsFor(time).length).toEqual(width + 1)
            }
        })
        it('should pass values and styles', function() {
            displayInstance.display()
            var handCalculated = [
                '%c 0 %c 0 %c 0 %c 0',
                //                          alive
                'background: #222; color: #bada55',
                //                          dead
                'background: #222; color: #f00',
                //                          empty
                'background: #222; color: #eee',
                //                          alive
                'background: #222; color: #bada55'
            ]
            // another 2.0 <->  1.3 fix
            if (!console.log.calls.argsFor) {
                console.log.calls.argsFor = function(time) {
                    return console.log.calls[time].args
                }
            }
            expect(console.log.calls.argsFor(0)).toEqual(handCalculated)
        })
    })
})