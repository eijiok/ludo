var Table = function (numberOfPlayers) {
  var thiz = this;
  thiz = [];
  this.numberOfPlayers = numberOfPlayers;
  var turn = 0;
};

var Die = function() {
  this.roll = function() {
    return Math.floor(Math.random() * (6)) + 1;
  };
};
var Token = function(id) {
  this.position = 0;
  this.id = id;
};
var Logger = function (id) {
  var messageDom = document.getElementById(id);
  this.write = function(message) {
    console.log(message);
    messageDom.innerHTML += message;
  };

  this.writeLine = function(message) {
    console.log(message);
    messageDom.innerHTML += message + "<br />";
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

  this.init = function (numberOfPlayers){
    this.numberOfPlayers = numberOfPlayers;
    this.table = new Table(numberOfPlayers);
    this.tokens =[];
    this.turn = 0;
    for (var i = 0; i < numberOfPlayers; i++) {
      this.tokens[i] = [];
      for (var j = 0; j < TOKEN_NUM; j++) {
        this.tokens[i][j] = new Token(j);
      }
    }
  }

  this.start = function (numberOfPlayers) {
    this.init(numberOfPlayers);
    thiz.writeTurn();
    logger.reset();
    logger.writeLine("Começou");
    this.canRollTheDie = true;
    this.help();
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
    this.lastRolled = this.die.roll();
    logger.writeLine('Tirou no dado: ' + this.lastRolled);
    this.afterRolledTheDie();
  };

  this.afterRolledTheDie = function() {
    this.canRollTheDie = false;
    this.canPlay = true;
    var tokensAtHome = this.getTokenAtHome();
    if (tokensAtHome.length == 4) {
      if (! (this.lastRolled == 1 || this.lastRolled == 6)) {
        this.nextPlayer();
      }
    }
  }
  this.getTokenAtHome = function() {
    var tokensHome = [];
    for (var i = 0; i < TOKEN_NUM; i++) {
      var token = this.tokens[this.turn][i];
      if (token.position == 0) {
        tokensHome.push(token);
      }
    }
    return tokensHome;
  };
  this.getTokensOut = function() {
    var tokensOut = [];
    for (var i = 0; i < TOKEN_NUM; i++) {
      if (this.tokens[this.turn][i].position != 0) {
        tokensOut.push(this.tokens[this.turn][i]);
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


  this.help = function() {
    logger.write("Jogador " + this.playersColor[this.turn] + ": ");
    if (this.lastRolled == 0) {
      logger.writeLine("Jogue o dado");
      return;
    }
    var tokenAtHome = this.getTokenAtHome();
    var todosEmCasa = tokenAtHome.length == 4;
    if (this.lastRolled == 1 || this.lastRolled == 6) {
      if (tokenAtHome.length > 0) {
        if (todosEmCasa) {
          logger.writeLine("Você pode tirar da casa " + this.printTokens(tokenAtHome));
        } else {
          var pawnOutOfHome = this.printTokens(this.getTokensOut());
          logger.writeLine("Você pode tirar da casa " + this.printTokens(tokenAtHome) + " ou andar com " + pawnOutOfHome);
        }
      } else {
        var pawnOutOfHome = this.printTokens(this.getTokensOut());
        logger.writeLine("Você pode andar com " + pawnOutOfHome);
      }
    } else {
      if (todosEmCasa) {
        logger.writeLine("Você perdeu a vez");
      } else {
        var pawnOutOfHome = this.printTokens(this.getTokensOut());
        logger.writeLine("Você pode andar com " + pawnOutOfHome);
      }
    }
  };

  this.play = function(tokenId) {

  }
};
var game = new Game();
game.start(2);
game.rollTheDie();

