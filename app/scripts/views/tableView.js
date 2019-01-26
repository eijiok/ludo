var TableView = function(table) {
  this.table = table;
  this.render = function() {  
    for (var i = 0; i < this.table.game.numberOfPlayers; i++) {
      for (var j = 0; j < this.table.game.numberOfTokens; j++) {
        this.renderToken(this.table.tokens[i][j]);
      }
    }
  };
  this.renderToken = function(token) {
    if (token.position == TOKEN_HOME) {
      this.renderHome(token);
      return;
    }
    if (token.position <= FORK_POS) {
      this.renderPath(token);
      return;
    }
    if (token.position < FINAL_POS) {
      this.renderLane(token);
      return;
    }
    if (token.position == FINAL_POS) {
      this.renderFinal(token);
      return;
    }
  };
  this.renderHome = function(token) {
    console.log('renderHome', token);
  };
  this.renderPath = function(token) {
    console.log('renderPath', token);
  };
  this.renderLane = function(token) {
    console.log('renderLane', token);
  };
  this.renderFinal = function(token) {
    console.log('renderFinal', token);
  };
  
};
