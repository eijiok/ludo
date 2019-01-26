var FINAL_LANE_SIZE = 6;
var PATH_SIZE = 13 * 4;
var FORK_POS = PATH_SIZE - 1;
var FINAL_POS = FORK_POS + 6;


var Table = function () {

  this.path = new Path(PATH_SIZE);
  this.tokens = [];
  this.finalLanes = [];
  this.numberOfPlayers;

  this.init = function (numberOfPlayers, game) {
    this.numberOfPlayers = numberOfPlayers;
    this.game = game;

    for (var i = 0; i < numberOfPlayers; i++) {
      this.tokens[i] = [];
      this.finalLanes[i] = [];

      for (var j = 0; j < this.game.numberOfTokens; j++) {
        this.tokens[i][j] = new Token(i, j);
      }
      this.finalLanes[i] = new Path(FINAL_LANE_SIZE);
    }

    this.path = new Path(PATH_SIZE);
  };

  this.getTokenAtHome = function(player) {
    var home = [];
    for (var i = 0 ; i < this.game.numberOfTokens; i++) {
      if (this.tokens[player][i].position == TOKEN_HOME) {
        home.push(this.tokens[player][i]);
      }
    }
    return home;
  };
  this.getTokensInTheWay = function(player) {
    var tokensOut = [];
    for (var i = 0; i < this.game.numberOfTokens; i++) {
      var pos =this.tokens[player][i].position;
      if (pos != TOKEN_HOME && pos != FINAL_POS) {
        tokensOut.push(this.tokens[player][i]);
      }
    }
    return tokensOut;
  };

  this.printTokens = function(tokenList) {
    var result = [];
    for (var i in tokenList) {
      var token = tokenList[i];
      result.push(token.id);
    }
    return result.join(", ");
  };

  this.getFinalLanePosition = function (position) {
    var result = position - FORK_POS - 1;
    if (result >= FINAL_LANE_SIZE) {
      result = FINAL_LANE_SIZE - (result - FINAL_LANE_SIZE + 1);
    }
    return result;
  };
  this.getRelativePosition = function (position) {
    if (position <= FINAL_POS) {
      return position;
    }
    return FINAL_POS - (position - FINAL_POS);
  }
  this.canWalk = function (player, position) {
    if (position == 0) {
      return false;
    }
    if (position <= FORK_POS) {
      return this.path.canWalk(this.getPathPosition(player, position));
    }
    if (position == FINAL_POS) {
      return true;
    }

    return this.finalLanes[player].canWalk(this.getFinalLanePosition(position));
  };

  this.removeToken = function (position, token) {
    if (token.position == TOKEN_HOME) {
      return;
    }

    if (position <= FORK_POS) {
      this.path.remove(token, this.getPathPosition(token.player, position));
      return;
    }
    this.finalLanes[token.player].remove(token, this.getFinalLanePosition(position));
    return;
  };

  this.addToken = function (position, token) {
    if (token.position == TOKEN_HOME) {
      // this.home[token.player][token.id] = token;
      return;
    }

    if (position <= FORK_POS) {
      this.path.add(token, this.getPathPosition(token.player, position));
      return;
    }
    if (position == FINAL_POS) {
      // this.end[token.player][token.id] = token;
      return;
    }
    return this.finalLanes[token.player].add(token, this.getFinalLanePosition(position));
  };

  this.walk = function(player, tokenId, steps) {
    var token = this.tokens[player][tokenId];
    // var direction = +1;
    var numSteps=0;
    for( var i = 0; i < steps; i++) {
      if( ! this.canWalk(player, token.position + numSteps + 1) ) {
        break;
      }
      numSteps++;
    }
    this.removeToken(token.position, token);
    token.position = this.getRelativePosition(token.position + numSteps);
    var replacedToken = this.addToken(token.position, token);
    if (replacedToken != null) {
      replacedToken.position = 0;
    }

    if (token.position == FINAL_POS) {
      this.game.tokenGetsToFinal(token);
    } 
    this.game.nextPlayer(steps);
  };

  this.getPathPosition = function(player, position) {
    return (position + (player * 13)) % PATH_SIZE;
  };
};
