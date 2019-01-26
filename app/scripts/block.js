/* depends on token.js*/

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
    currToken.position = 0;
    // currToken.player !== token.player
    this.content[0] = token;
    this.contentClass = CONTENT_NAME[this.content.length];
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
