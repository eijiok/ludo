var Game = function()  {
  var TOKEN_NUM = 4;

  this.playersColor = ['verde', 'vermelho', 'azul', 'amarelo'];
  this.place=[];
  this.currentPlace = 1;
  this.die = new Dice();
  var logger = new Logger('message');
  this.canPlay = false;
  this.canRollTheDie = false;
  this.table = new Table();
  this.numberOfTokens = TOKEN_NUM;
  window.tableView = new TextTableView(this.table);// new TableView(this.table);
  this.countSix = 0;

  this.init = function (numberOfPlayers){
    this.numberOfPlayers = numberOfPlayers;
    this.table.init(numberOfPlayers, this);
    this.currentPlayer = 0;
    this.place = [];
    for (var i = 0; i < numberOfPlayers; i++) {
      this.place[i] = null;
    }
    tableView.render();
  };

  this.start = function (numberOfPlayers) {
    this.isGameOver = false;
    this.init(numberOfPlayers);
    logger.reset();
    logger.writeLane("Começou");
    this.canRollTheDie = true;
    this.help();
    tableView.render();
  }

  this.nextPlayer = function(rolledNumber) {
    if (rolledNumber != 6 && this.countSix < 2) {
      this.currentPlayer = (this.currentPlayer + 1) % this.numberOfPlayers;  
      this.countSix =0;
    } else {
      this.countSix++;
    }
    var countNotPlaying = 0;
    while(this.place[this.currentPlayer] != null) {
      countNotPlaying++;
      this.currentPlayer = (this.currentPlayer + 1) % this.numberOfPlayers;
      if (countNotPlaying == this.numberOfPlayers) {
        this.isGameOver = true;
        this.canPlay = false;
        this.canRollTheDie = false;
        logger.writeLane('Game Over');
        return;
      }
    }
    this.lastRolled = 0;
    this.help();
    this.canRollTheDie = true;
    this.canPlay = false;
    return this.currentPlayer;
  };
  this.writeTurn = function() {
    logger.writeLane('É a vez do ' + this.playersColor[this.currentPlayer]);
  };
  this.lastRolled = 0;
  this.rollTheDie = function () {
    if (!this.canRollTheDie) {
      logger.writeLane('Não é hora de rodar o dado');
      return;
    }
    this.lastRolled = this.die.roll();
    logger.writeLane('Tirou no dado: ' + this.lastRolled);
    this.afterRolledTheDie();
  };
  this.roll = function (value) {
    if (!this.canRollTheDie) {
      logger.writeLane('Não é hora de rodar o dado');
      return;
    }
    this.lastRolled = value;
    logger.writeLane('Tirou no dado: ' + this.lastRolled);
    this.afterRolledTheDie();
  };

  this.afterRolledTheDie = function() {
    this.canRollTheDie = false;
    this.canPlay = true;
    var tokensAtHome = this.table.getTokenAtHome(this.currentPlayer);
    if (tokensAtHome.length == this.numberOfTokens) {
      if (! (this.lastRolled == 1 || this.lastRolled == 6)) {
        this.nextPlayer();
        return;
      }
    }
    this.help();
  };

  this.help = function() {
    tableView.render();
    if (this.isGameOver) {
      logger.write("Fim de jogo!");
      return;
    }
    logger.write("Jogador " + this.playersColor[this.currentPlayer] + ": ");
    if (this.lastRolled == 0) {
      logger.writeLane("Jogue o dado");
      return;
    }
    var tokenAtHome = this.table.getTokenAtHome(this.currentPlayer);
    var todosEmCasa = tokenAtHome.length == this.numberOfTokens;
    if (this.lastRolled == 1 || this.lastRolled == 6) {
      if (tokenAtHome.length > 0) {
        if (todosEmCasa) {
          logger.writeLane("Você pode tirar da casa " + this.table.printTokens(tokenAtHome));
        } else {
          var tokensInTheWay = this.table.getTokensInTheWay(this.currentPlayer);
          var pawnOutOfHome = this.table.printTokens(tokensInTheWay);
          logger.write("Você pode tirar da casa " + this.table.printTokens(tokenAtHome));
          if (tokensInTheWay.length > 0) {
            logger.write(" ou andar com " + pawnOutOfHome);
          }
          logger.writeLane("");
        }
      } else {
        var pawnOutOfHome = this.table.printTokens(this.table.getTokensInTheWay(this.currentPlayer));
        logger.writeLane("Você pode andar com " + pawnOutOfHome);
      }
    } else {
      if (todosEmCasa) {
        logger.writeLane("Você perdeu a vez");
      } else {
        var pawnOutOfHome = this.table.printTokens(this.table.getTokensInTheWay(this.currentPlayer));
        logger.writeLane("Você pode andar com " + pawnOutOfHome);
      }
    }
  };

  this.play = function(tokenId) {
    if (! this.canPlay) {
      logger.writeLane("Não é hora de andar");
      return;
    }
    this.verifyMove(tokenId);
    this.table.walk(this.currentPlayer, tokenId, this.lastRolled);
    tableView.render();
  };
  this.verifyMove = function(tokenId) {
    var token = this.table.tokens[this.currentPlayer][tokenId];
    if (token.position == FINAL_POS) {
      logger.writeLane("Não é possivel andar um peão na casa final");
      throw new Error("Jogada inválida- Não é possivel andar um peão na casa final");
      return;
    }
    if (this.lastRolled != 1 && this.lastRolled != 6) {
      if (token.position == 0) {
        logger.writeLane("Você não pode sair sem tirar 6 ou 1");
        throw new Error("Jogada inválida- saida sem 6 ou 1");
      }
    } 
  };
  this.verifyWinner = function(player) {
    for (var i = 0; i < this.numberOfTokens; i++) {
      if (this.table.tokens[player][i].position != FINAL_POS) {
        return false;
      }
    }
    return true;
  };
  this.tokenGetsToFinal = function(token) {
    if (this.verifyWinner(token.player)) {
      this.place[token.player] = this.currentPlace;
      logger.writeLane("Jogador " + this.playersColor[token.player] + " ficou em " + this.currentPlace);
      this.currentPlace++;
    }
  }
};
