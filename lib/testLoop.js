console.clear();
var initialState = 'aeeeeeaaeeaa'
var game = new Game(5, 5, initialState).setRules({
    wrappingField: true
});
var display = new ConsoleDisplay(game)
setInterval(function() {
    game.setState(Game.computeNextState(game, game.getRules()))
    display.display()
}, 1000)