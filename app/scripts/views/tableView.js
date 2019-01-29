var XY = function(x, y) {
  this.x = x;
  this.y = y;

  this.rotate = function (n) {
    var pos = this;
    for (var i =0; i < n; i++) {
      pos = this.rotate90(pos);
    }
  };
  this.rotate90 = function (pos) {
    return new XY (-pos.y, pos.x);
  }
};
var TableView = function(table) {
  var center =new XY(400, 400);
  var box = new XY(50, 50);
  var home = [];
  home[0]= new XY(-275, -225);
  home[1]= new XY(-225, -275);
  home[2]= new XY(-175, -225);
  home[3]= new XY(-225, -175);
  var pathPosition = function(pos) {
    posicaoDeslocada = pos;
    quadrante = (Math.floor)(pos-1 / 13);
    posQ1 = pos % 13;
    var x, y;
    if (posQ1 == 0) {
      x = +50;
      y = -50 - (6 * 50);
    } else if (posQ1 < 6) {
      y = -50;
      x = -50 - ((6 - posQ1) * 50);
    } else if (posQ1 < 12) {
      x = -50;
      y = -50 - ((6 - posQ1) * 50);
    } else {
      x = 0;
      y = -50 - (6 * 50);
    };
    var coordinate =new XY (x, y);
    return coordinate.rotate(quadrante);
  };
  var finalLane = function(pos) {
    var x, y;
    y = 0;
    x = -50 - ((6 - pos) * 50);
    return new XY (x, y);
  };


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
