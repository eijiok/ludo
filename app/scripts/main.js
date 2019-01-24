var Token = function(player, id) {
  this.player = player;
  this.id = id;
  this.position = -1;
};
var Tower = function(token1, token2) {
  this.tokens = [];
  this.tokens.push(token1);
  this.tokens.push(token2);

  this.remove = function (token) {
    for (var i = 0; i < this.tokens.length; i++) {
      if (this.tokens[i].id == token.id) {
        this.tokens.splice(i, 1);
        return tokens[0];
      }
    }
    return null;
  }
};

var Table = function () {
  var TOKEN_NUM = 4;
  this.path = [];
  this.tokens = [];
  this.home = [];
  this.numberOfPlayers;

  var PATH_SIZE = 19 * 4;

  this.init = function (numberOfPlayers, game) {
    this.numberOfPlayers = numberOfPlayers;
    for (var i = 0; i < numberOfPlayers; i++) {
      this.tokens[i] = [];
      this.home[i] = [];
      for (var j = 0; j < TOKEN_NUM; j++) {
        this.tokens[i][j] = new Token(i, j);
        this.home[i][j] = this.tokens[i][j];
      }
    }
    this.initPath();
    this.game = game;
  };
  this.initPath = function () {
    for (var i = 0; i < PATH_SIZE; i++) {
      this.path[i] = null;
    }
  };

  this.getTokenAtHome = function() {
    return this.home[this.game.turn];
  };
  this.getTokensOut = function() {
    var tokensOut = [];
    for (var i = 0; i < TOKEN_NUM; i++) {
      if (this.tokens[this.game.turn][i].position != -1) {
        tokensOut.push(this.tokens[this.game.turn][i]);
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

  this.walk = function(player, tokenId, steps) {
    var token = this.tokens[player][tokenId];
    // token.position += steps;
    var sentido = +1;
    var indiceCaminhoFinal = this.indiceCaminhoFinal(player);
    var ultimaPosicao = this.lastPosition(player);
    for (var i = 0; i < steps; i++) {
      this.step(player, tokenId, sentido);
      if (token.position == ultimaPosicao) {
        sentido = (-1) * sentido;
      }
    }
    this.game.nextPlayer();
  }

  this.indiceCaminhoFinal = function(player) {
    return (12 + ((player + 3) * 19)) % PATH_SIZE;
  };
  this.lastPosition = function(player) {
    return (18 + ((player + 3) * 19)) % PATH_SIZE;
  };

  this.step = function (player, tokenId, sentido) {
    var token = this.tokens[player][tokenId];
    var absolutePosition = this.getPathPosition(player, token.position);
    var nextAbsolutePosition;
    var caminhoFinal = this.indiceCaminhoFinal(player);
    if (token.position == -1) {
      nextAbsolutePosition = this.getPathPosition(player, 1);
    } else  if (absolutePosition > caminhoFinal) {
      nextAbsolutePosition = absolutePosition + sentido;
    } else {
      if (absolutePosition % 19 == 12 ) {
        nextAbsolutePosition = absolutePosition + 7;
      } else {
        nextAbsolutePosition = absolutePosition + 1;
      }
    }
    var nextContent = this.path[nextAbsolutePosition];
    if ((nextContent != null) && (nextContent instanceof Tower)){
      // do nothing
      return;
    } else {
      this.removeToken(absolutePosition, token);
      if (nextContent != null) {
        if (nextContent.player != token.player) {
          this.sendToHome(nextAbsolutePosition);
        }
      }

      this.addToken(nextAbsolutePosition, token);
    }
  };
  this.removeToken = function(position, token) {
    if (token.position == -1) {
      this.home[token.player][token.id] = null;
      return;
    }
    var previousPosition = this.path[position];
    if (previousPosition instanceof Tower) {
      var otherToken = previousPosition.remove(token);
      this.path[position] = otherToken;
    } else {
      this.path[position] = null;
    }
  };
  this.sendToHome = function (position) {
    var token = this.path[position];
    this.path[position] = null;
    token.position = 0;
  }
  this.addToken = function(position, token) {
    var nextPositionContent = this.path[position];
    if (nextPositionContent == null) {
      this.path[position] = token;
    } else {
      this.path[position] = new Tower(nextPositionContent, token);
    }
  };
  this.getPathPosition = function(player, position) {
    return (player * 19 + position) % PATH_SIZE;
  }
};

var TableView = function(table) {
  this.table = table;
  $('.content h1').css('display','none');
  $('.game img').css('display','none');
  $('.game').css('height', 'auto');
  var $printArea = $('.game');
  this.render = function() {
    $printArea.html('');
    var path = this.table.path;
    for (var i = 0; i < path.length ; i++) {
      var posicaoRelativa = i %19;
      if (posicaoRelativa == 12 || posicaoRelativa == 0) {
        $printArea.append('<br />');
      }

      $printArea.append(this.tokenValue(path[i]));
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
  var thiz = this;
  var TOKEN_NUM = 4;

  this.playersColor = ['verde', 'vermelho', 'azul', 'amarelo'];

  this.die = new Die();
  var logger = new Logger('message');
  this.canPlay = false;
  this.canRollTheDie = false;
  this.table = new Table();
  var tableView = new TableView(this.table);

  this.init = function (numberOfPlayers){
    this.numberOfPlayers = numberOfPlayers;
    this.table.init(numberOfPlayers, this);
    this.turn = 0;
    // this.tokens =[];
    // for (var i = 0; i < numberOfPlayers; i++) {
    //   this.tokens[i] = [];
    //   for (var j = 0; j < TOKEN_NUM; j++) {
    //     this.tokens[i][j] = new Token(j);
    //   }
    // }

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
    this.turn = (this.turn + 1) % this.numberOfPlayers;
    this.lastRolled = 0;
    this.help();
    this.canRollTheDie = true;
    this.canPlay = false;
    return this.turn;
  };
  this.writeTurn = function() {
    logger.writeLine('É a vez do ' + this.playersColor[this.turn]);
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

  this.afterRolledTheDie = function() {
    this.canRollTheDie = false;
    this.canPlay = true;
    var tokensAtHome = this.table.getTokenAtHome();
    if (tokensAtHome.length == 4) {
      if (! (this.lastRolled == 1 || this.lastRolled == 6)) {
        this.nextPlayer();
        return;
      }
    }
    this.help();
  };

  this.help = function() {
    logger.write("Jogador " + this.playersColor[this.turn] + ": ");
    if (this.lastRolled == 0) {
      logger.writeLine("Jogue o dado");
      return;
    }
    var tokenAtHome = this.table.getTokenAtHome();
    var todosEmCasa = tokenAtHome.length == 4;
    if (this.lastRolled == 1 || this.lastRolled == 6) {
      if (tokenAtHome.length > 0) {
        if (todosEmCasa) {
          logger.writeLine("Você pode tirar da casa " + this.table.printTokens(tokenAtHome));
        } else {
          var pawnOutOfHome = this.table.printTokens(this.table.getTokensOut());
          logger.writeLine("Você pode tirar da casa " + this.table.printTokens(tokenAtHome) + " ou andar com " + pawnOutOfHome);
        }
      } else {
        var pawnOutOfHome = this.table.printTokens(this.table.getTokensOut());
        logger.writeLine("Você pode andar com " + pawnOutOfHome);
      }
    } else {
      if (todosEmCasa) {
        logger.writeLine("Você perdeu a vez");
      } else {
        var pawnOutOfHome = this.table.printTokens(this.table.getTokensOut());
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
    this.table.walk(this.turn, tokenId, this.lastRolled);
    tableView.render();
  };
  this.verifyMove = function(tokenId) {
    var token = this.table.tokens[this.turn][tokenId];
    if (this.lastRolled != 1 && this.lastRolled != 6) {
      if (token.position == 0) {
        logger.writeLine("Você não pode sair sem tirar 6 ou 1");
        throw new Error("Jogada inválida- saida sem 6 ou 1");
      }
    }
  };

};
var game = new Game();
game.start(2);

//game.rollTheDie();

