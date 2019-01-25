var TOKEN_NUM = 4;
var TOKEN_HOME = 0;
var Token = function(player, id) {
  this.player = player;
  this.id = id;
  this.position = TOKEN_HOME;
};

var EMPTY = 'EMPTY',
  TOKEN = 'TOKEN',
  TOWER = 'TOWER';

var Block = function(pos) {
  this.content = [];
  this.contentClass = EMPTY;
  this.pos = pos;

  var CONTENT_NAME = [EMPTY, TOKEN, TOWER];
  this.canAdd = function() {
    return (this.content.length < 2);
  };
  this.add = function (token) {
    if (! this.canAdd) {
      throw new Error('cannot pass a tower')
    }
    if(this.content.length === 0) {
      this.content.push(token);
      this.contentClass = TOKEN;
      return null;
    }
    var currToken = this.content[0];
    if (currToken.player === token.player) {
      this.content.push(token);
      this.contentClass = TOWER;
      return null;
    }
    // currToken.player !== token.player
    this.content[0] = token;
    this.contentClass = TOWER;
    return currToken;
  };

  this.remove = function (token) {
    if (this.content.length === 0) {
      throw new Error('Cannot remove empty house');
    }

    for (var i = 0; i < this.content.length; i++) {
      var currToken = this.content[i];
      if (currToken.player === token.player && currToken.id === token.id) {
        this.content.splice(i, 1);
        this.contentClass = CONTENT_NAME[this.content.length];
        return;
      }
    }
    throw new Error('Cannot remove ' + token.player + ": " + token.id);
  };
  this.print = function() {
    var name = ' ' + this.pos+ ":"
    if (this.contentClass === EMPTY) {
      name += '__';
    } else if (this.contentClass === TOKEN) {
      var token = this.content[0];
      name += token.player+':('+token.id+')';
    } else  if (this.contentClass === TOWER) {
      var token0 = this.content[0];
      var token1 = this.content[1];
      name+= token0.player+':('+token0.id+ '-'+token1.id+')';
    }
    return name + ' | ';
  }
};

var Path = function(pathSize) {
  this.lines = [];
  for (var i = 0; i < pathSize; i++) {
    this.lines[i] = new Block(i);
  }

  this.canWalk = function (position){
    var block = this.lines[position];
    return block.canAdd();
  };
  this.add = function (token, position){
    var block = this.lines[position];
    return block.add(token);
  };
  this.remove = function (token, position) {
    var block = this.lines[position];
    return block.remove(token);
  };
};
var FINAL_LINE_SIZE = 6;
var PATH_SIZE = 13 * 4;
var FORK_POS = PATH_SIZE - 1;
var FINAL_POS = FORK_POS + 6;


var Table = function () {

  this.path = new Path(PATH_SIZE);
  this.tokens = [];
  this.finalLines = [];
  this.numberOfPlayers;

  this.init = function (numberOfPlayers, game) {
    this.numberOfPlayers = numberOfPlayers;
    this.game = game;

    for (var i = 0; i < numberOfPlayers; i++) {
      this.tokens[i] = [];
      this.finalLines[i] = [];

      for (var j = 0; j < TOKEN_NUM; j++) {
        this.tokens[i][j] = new Token(i, j);
      }
      this.finalLines[i] = new Path(FINAL_LINE_SIZE);
    }

    this.path = new Path(PATH_SIZE);
  };

  this.getTokenAtHome = function(player) {
    var home = [];
    for (var i = 0 ; i < 4; i++) {
      if (this.tokens[player][i].position == TOKEN_HOME) {
        home.push(this.tokens[player][i]);
      }
    }
    return home;
  };
  this.getTokensOut = function(player) {
    var tokensOut = [];
    for (var i = 0; i < TOKEN_NUM; i++) {
      if (this.tokens[player][i].position != TOKEN_HOME) {
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
    if (result >= FINAL_LINE_SIZE) {
      result = result - (result - FINAL_LINE_SIZE);
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

    return this.finalLines[player].canWalk(this.getFinalLanePosition(position));
  };

  this.removeToken = function (position, token) {
    if (token.position == TOKEN_HOME) {
      return;
    }

    if (position <= FORK_POS) {
      this.path.remove(token, this.getPathPosition(token.player, position));
      return;
    }
    this.finalLines[token.player].remove(token, this.getFinalLanePosition(position));
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
    return this.finalLines[token.player].add(token, this.getFinalLanePosition(position));
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

    // this.home[replacedToken.player][replacedToken.id] = replacedToken;

    //
    // if (nextRelativePosition <= FORK_POS) {
    //   for (var i = currentPathPosition; i <= nextRelativePosition; i++) {
    //     path.canWalk(token, i)
    //   }
    // } else if (nextRelativePosition < FINAL_POS) {
    //   if (currentPosition < FORK_POS) {
    //
    //   } else {
    //
    //   }
    //
    // } else if (nextRelativePosition == FINAL_POS) {
    //
    // } else if (nextRelativePosition > FINAL_POS) {
    //
    // }
    //
    //
    // for (var i = 0; i < steps; i++) {
    //
    //   var nextRelativePosition = token.position + direction;
    //   if (token.position > FORK_POS) {
    //     var nextPosition = nextRelativePosition % (FORK_POS + 1);
    //     if (this.finalLines[token.player].canWalk(token, nextPosition)) {
    //       this.finalLines[token.player].remove(token , token.position % (FORK_POS + 1));
    //       this.finalLines[token.player].add(token, nextPosition);
    //       token.position += direction;
    //     }
    //     if (token.position == FINAL_POS) {
    //       direction = (-1) * direction;
    //     }
    //   } else if (token.position == FORK_POS) {
    //     // entra na reta final
    //     var nextPosition = nextRelativePosition % (FORK_POS + 1);
    //     if (this.finalLines[token.player].canWalk(token, 0)) {
    //       this.path.remove(token, this.getPathPosition(token));
    //       this.finalLines[token.player].add(token , nextPosition);
    //       token.position += direction;
    //     }
    //   } else { // token.position < FORK_POS
    //     var currentPosition = this.getPathPosition(token);
    //     var nextPosition = (currentPosition + 1) % PATH_SIZE;
    //     if (this.path.canWalk(token, nextPosition)) {
    //       if (token.position !== TOKEN_HOME) {
    //         this.path.remove(token, currentPosition);
    //       }
    //       var replacedToken = this.path.add(token, nextPosition);
    //       token.position += direction;
    //       if (replacedToken !== null) {
    //         replacedToken.position = 0;
    //       }
    //     }
    //   }
    // }
    if (token.position == FINAL_POS) {
      this.game.tokenGetsToFinal(token);
    }
    this.game.nextPlayer();
  };

  this.getPathPosition = function(player, position) {
    return (position + (player * 13)) % PATH_SIZE;
  };
};

var TableView = function(table) {
  this.table = table;
  $('.content h1').css('display','none');
  $('.game img').css('display','none');
  $('.game').css('height', 'auto');
  var $printArea = $('.game');

  this.render = function() {
    $printArea.html('');
    var path = this.table.path.lines;
    for (var i = 0; i < path.length ; i++) {
      if (i %13 == 0) {
        $printArea.append('<br />');
      }
      $printArea.append(path[i].print());
    }
    $printArea.append('<br />');

    $printArea.append("Home: <br />")
    for (var i = 0; i < this.table.game.numberOfPlayers; i++) {
      var tokens = this.table.getTokenAtHome(i);
      $printArea.append('Player: ' + i);
      $printArea.append('<br/>');
      $printArea.append(this.table.printTokens(tokens));
      $printArea.append('<br/>');
    }
    $printArea.append('<br/>');

    $printArea.append("Final lines: <br />")
    for (var i = 0; i < this.table.game.numberOfPlayers; i++) {
      for (var j = 0; j < this.table.finalLines[i].lines.length; j++) {
        $printArea.append(this.table.finalLines[i].lines[j].print());
      }
      $printArea.append('<br />');
    }


  };
  this.tokenValue = function(token) {
    if (! token ) {
      return ' ____ '
    }
    return ' P' +token.player + ':'+token.id + " ";
  }
};

var Die = function() {
  this.roll = function() {
    return Math.floor(Math.random() * (6)) + 1;
  };
};
var Logger = function (id) {
  var messageDom = document.getElementById(id);
  var breakline = false;
  var cache = '';
  this.write = function(message) {
    console.log(message);
    cache += message;
    console.log('cache', cache);
  };

  this.writeLine = function(message) {
    console.log(message);
    messageDom.innerHTML = cache + message + '<br />' + messageDom.innerHTML ;
    cache = '';
  };
  this.reset = function(){
    console.log("reset");
    messageDom.innerHTML = "";
  };

};
var Game = function()  {

  this.playersColor = ['verde', 'vermelho', 'azul', 'amarelo'];

  this.die = new Die();
  var logger = new Logger('message');
  this.canPlay = false;
  this.canRollTheDie = false;
  this.table = new Table();
  window.tableView = new TableView(this.table);

  this.init = function (numberOfPlayers){
    this.numberOfPlayers = numberOfPlayers;
    this.table.init(numberOfPlayers, this);
    this.currentPlayer = 0;
    tableView.render();
  };

  this.start = function (numberOfPlayers) {

    this.init(numberOfPlayers);
    logger.reset();
    logger.writeLine("Começou");
    this.canRollTheDie = true;
    this.help();
    tableView.render();
  }
  this.nextPlayer = function() {
    this.currentPlayer = (this.currentPlayer + 1) % this.numberOfPlayers;
    this.lastRolled = 0;
    this.help();
    this.canRollTheDie = true;
    this.canPlay = false;
    return this.currentPlayer;
  };
  this.writeTurn = function() {
    logger.writeLine('É a vez do ' + this.playersColor[this.currentPlayer]);
  };
  this.lastRolled = 0;
  this.rollTheDie = function () {
    if (!this.canRollTheDie) {
      logger.writeLine('Não é hora de rodar o dado');
      return;
    }
    this.lastRolled = this.die.roll();
    logger.writeLine('Tirou no dado: ' + this.lastRolled);
    this.afterRolledTheDie();
  };
  this.roll = function (value) {
    if (!this.canRollTheDie) {
      logger.writeLine('Não é hora de rodar o dado');
      return;
    }
    this.lastRolled = value;
    logger.writeLine('Tirou no dado: ' + this.lastRolled);
    this.afterRolledTheDie();
  };

  this.afterRolledTheDie = function() {
    this.canRollTheDie = false;
    this.canPlay = true;
    var tokensAtHome = this.table.getTokenAtHome(this.currentPlayer);
    if (tokensAtHome.length == 4) {
      if (! (this.lastRolled == 1 || this.lastRolled == 6)) {
        this.nextPlayer();
        return;
      }
    }
    this.help();
  };

  this.help = function() {
    tableView.render();
    logger.write("Jogador " + this.playersColor[this.currentPlayer] + ": ");
    if (this.lastRolled == 0) {
      logger.writeLine("Jogue o dado");
      return;
    }
    var tokenAtHome = this.table.getTokenAtHome(this.currentPlayer);
    var todosEmCasa = tokenAtHome.length == 4;
    if (this.lastRolled == 1 || this.lastRolled == 6) {
      if (tokenAtHome.length > 0) {
        if (todosEmCasa) {
          logger.writeLine("Você pode tirar da casa " + this.table.printTokens(tokenAtHome));
        } else {
          var pawnOutOfHome = this.table.printTokens(this.table.getTokensOut(this.currentPlayer));
          logger.writeLine("Você pode tirar da casa " + this.table.printTokens(tokenAtHome) + " ou andar com " + pawnOutOfHome);
        }
      } else {
        var pawnOutOfHome = this.table.printTokens(this.table.getTokensOut(this.currentPlayer));
        logger.writeLine("Você pode andar com " + pawnOutOfHome);
      }
    } else {
      if (todosEmCasa) {
        logger.writeLine("Você perdeu a vez");
      } else {
        var pawnOutOfHome = this.table.printTokens(this.table.getTokensOut(this.currentPlayer));
        logger.writeLine("Você pode andar com " + pawnOutOfHome);
      }
    }
  };

  this.play = function(tokenId) {
    if (! this.canPlay) {
      logger.writeLine("Não é hora de andar");
      return;
    }
    this.verifyMove(tokenId);
    this.table.walk(this.currentPlayer, tokenId, this.lastRolled);
    tableView.render();
  };
  this.verifyMove = function(tokenId) {
    var token = this.table.tokens[this.currentPlayer][tokenId];
    if (this.lastRolled != 1 && this.lastRolled != 6) {
      if (token.position == 0) {
        logger.writeLine("Você não pode sair sem tirar 6 ou 1");
        throw new Error("Jogada inválida- saida sem 6 ou 1");
      }
    }
  };
  this.tokenGetsToFinal = function(token) {
    logger.writeLine("Jogador " + this.playersColor[token.player] + " Venceu!");
    this.canPlay = false;
    this.canRollTheDie = false;
    return;
  }

};
var game = new Game();
game.start(1);

//game.rollTheDie();

