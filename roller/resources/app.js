(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Die = require('./Die.js');
//This is an object to handle a group of dice
function DicePool(text){
  var _private = {
    dice: parseText(text)
  };
//Internal Functon to create pool
  function parseText(roll){
    if(roll.match('dFS')){
      roll = roll.replace('dFS','d6!-d6!');
    }
    roll = _toPostFix(roll);
    roll = _processDice(roll);
    return roll;
  }

//Public functions
  Object.defineProperties(this,{
    'getPool': {
      value: _getPool.bind(_private),
      emunerable: true
    }
  });
}

//Returns the dice Pool
function _getPool(){
  return this.dice;
}
//Converts the String to a Postfix(RPN) array for processing
function _toPostFix(text){
  var val = [],ops = [];
  text = text.split(/([-+v^r!act\(\)])/);
  text = text.filter(function(e,i,a){
    var keep = true;
    if(i === 0 && e === ''){
      return false;
    }
    if(e === ''){
      if(a[i-1] === ')'||a[i-1] === 'a'||a[i-1] === 'c'){
        keep = false;
      } else if(a[i+1] === "("){
        keep = false;
        if(a[i-1].match(/[v^r!tca]/)){
          keep = true;
        }
      }
    }
    return keep;
  });
  text.forEach(function(e,i,a){
    var PRECEDENCE = {'r':5,'!':4,'v':3,'^':3,'t':2,'+':1,'-':1};
    if(e.match(/-/) && e.length === 1){
      a[i+1] = e+a[i+1];
    }
    if(e.match(/[-+v^r!act\(\)]/)&&e.length === 1){
      var cur = PRECEDENCE[e],
          last = PRECEDENCE[ops[0]];
      if(e === ')'){
        var esc = true;
        while(esc){
          if(ops[0] !== '('){
            val.push(ops.shift());
            if(ops[0] === '('){
              ops.shift();
              esc = false;
            }
          }
        }
      } else if(e === 'a'||e === 'c'){
        ops[0] += e;
      } else if(cur < last&& e !== '('){
        val.push(ops.shift());
        ops.unshift(e);
      } else{
        ops.unshift(e);
      }
    } else {
      val.push(e);
    }
  });
  while(ops.length){
    val.push(ops.shift());
  }
  return val;
}
//Processes the RPN and returns an array of objects and values
function _processDice(arry){
  var roll = {}, i = 0, temp = [],keys;
  keys = arry.filter(function(e){
    return e.match(/d/);
  });
  while(arry.length){
    if(arry[0].match(/[v^r!tca+]/)||(arry[0] === '-'&&arry[0].length === 1)){
      if(i + 2 === temp.length||arry[0] === '+'||arry[0] === '-'){
        temp.push(_processAdders(arry.shift(),temp.pop(),temp.pop()));
        if(i >= temp.length){ i = temp.length - 1;}
      } else {
        temp[i] = _processAdders(arry.shift(),temp.pop(),temp[i]);
      }
    } else {
      t = _getDice(arry.shift());
      temp.push(t);
      if(Array.isArray(t)){
        i = temp.length - 1;
      }
    }
  }
  temp[0].forEach(function(e,i,a){
    if(typeof e === 'object'){
      var temp = e.getNote();
      if(temp in roll){
        roll[temp].push(e);
      } else {
        roll[temp] = [e];
      }
    } else if(typeof e === 'number'){
      a[i] = new Die('+',0);
      a[i].setValue(e);
      e = a[i];
      if('+' in roll){
        roll['+'].push(e);
      } else {
        roll['+'] = [e];
      }
    } else {
      roll.Success = e.replace(/[sb]/g,'');
    }
  });
  if(!('Success' in roll)){
    roll.Total = _getTotal(temp[0]);
  }
  return roll;
}
//Takes a string notation and converts *d* into array of dice or numder into int
function _getDice(note){
  var num,sides,dice =[];
  if(/\d*d\d+/.test(note)){
    roll = note.split('d');
    num = isNaN(parseInt(roll[0]))?1:Math.abs(roll[0]);
    sides = parseInt(roll[1]);
  }
  else if(/\d*d%/.test(note)){
    num = 2;
    sides = 10;
  }
  else if(/\d*dF/.test(note)){
    roll = note.split('d');
    num = isNaN(parseInt(roll[0]))?1:Math.abs(roll[0]);
    sides = 6;
  }
  else{
    return parseInt(note);
  }
  while(dice.length < num){
    dice.push(new Die(note,sides));
  }
  _rollDice(note,dice);
  return dice;
}
//Rolls and array of dice and applies special rules if applicable
function _rollDice(note,dice){
  dice.forEach(function(e){
    e.roll();
  });
  if(/\d*d%/.test(note)){
    var prcnt = 0;
    dice.forEach(function(e){
      e.setValue(e.getValue() - 1);
    });
    dice[0].setValue(dice[0].getValue() * 10);
    dice.forEach(function(e){
      prcnt += e.getValue();
    });
    if(prcnt === 0){
      prcnt = 100;
    }
    dice = prcnt;
  }
  else if(/\d*dF/.test(note)){
    var total = 0;
    dice.forEach(function(e){
      var tmp = e.getValue();
      if(tmp === 2||tmp === 3){
        e.setValue(-1);
      }
      else if(tmp === 4||tmp === 6){
        e.setValue(0);
      }
      else if(tmp === 1||tmp === 5){
        e.setValue(1);
      }
      total += e.getValue();
    });
    dice = total;
  }
  return dice;
}
//Switch to handle how to process Roll notations
function _processAdders(op,o1,o2){
  var newO;
  switch(op){
    case 'r':  newO = _reRoll(o1,o2);break;
    case '!':  newO = _explodeRoll(o1,o2);break;
    case 'v':  newO = _dropLowest(o1,o2);break;
    case '^':  newO = _dropHighest(o1,o2);break;
    case 't':
    case 'ta':
    case 'tc':
    case 'tac':
    case 'tca':  newO = _countSuccess(op,o1,o2);break;
    case '+':  newO = _addToRoll(o1,o2);break;
    case '-':  newO = _convertToNeg(o1,o2);break;
  }
  return newO;
}
//Function to reroll dice based on a target number or lower, will use 1 if no number is given
function _reRoll(limit,dice){
  limit = isNaN(limit)?1:limit;
  var cnt = 0, size;
  while(true){
    if(typeof dice[cnt] !== 'object' && dice[cnt] !== undefined){
      cnt++;
      continue;
    }
    if(cnt >= dice.length){
      break;
    }
    size = dice[cnt].getSize();
    if(limit === size){
      continue;
    }
    if(dice[cnt].getValue() <= limit){
      var tmp = new Die(dice[cnt].getNote(),size);
      tmp.roll();
      dice[cnt].inValid('r');
      dice.splice(cnt+1,0,tmp);
    }
    cnt++;
  }
  return dice;
}
//Function to explode(add more die of same type) roll based on target number or higher, will use die size - 1 if no number given
function _explodeRoll(limit,dice){
  limit = isNaN(limit)?-1:limit;
  var cnt = 0, size, bns;
  while(true){
    if(typeof dice[cnt] !== 'object' && dice[cnt] !== undefined){
      cnt++;
      continue;
    }
    if(cnt >= dice.length){
      break;
    }
    if(limit === 1){
      break;
    }
    size = dice[cnt].getSize();
    bns = limit === -1?size:limit;
    if(!isNaN(dice[cnt].getValue())){
      if(dice[cnt].getValue() >= bns){
        var tmp = new Die(dice[cnt].getNote(),size);
        tmp.roll();
        dice.splice(cnt+1,0,tmp);
      }
    }
    cnt++;
  }
  return dice;
}
//Function to drop lowest [number] of rolls out of the pool. Will only drop one if no numebr given
function _dropLowest(cnt,dice){
  cnt =  isNaN(cnt)?-1:cnt;
  var i, j, low, pos, pop, tote, actv = [];
  dice.forEach(function(e,i){
    if(!isNaN(e.getValue())){
      actv.push(i);
    }
  });
  if(!actv.length){
    return dice;
  }
  tote = cnt === -1?1:cnt;
  for(j = 0; j < tote;j++){
    if(tote < 0){
      break;
    }
    low = dice[actv[0]].getValue();
    pos = actv[0];
    pop = 0;
    for(i = 0; i < actv.length;i++){
      if(dice[actv[i]].getValue() < low){
        low = dice[actv[i]].getValue();
        pos = actv[i];
        pop = i;
      }
    }
    dice[pos].inValid('dl');
    actv.splice(pop,1);
  }
  return dice;
}
//Function to drop highest [number] of rolls out of the pool. Will only drop one if no numebr given
function _dropHighest(cnt,dice){
  cnt =  isNaN(cnt)?-1:cnt;
  var i, j, hgh, pos, pop, tote, actv = [];
  dice.forEach(function(e,i){
    if(!isNaN(e.getValue())){
      actv.push(i);
    }
  });
  if(!actv.length){
    return dice;
  }
  tote = cnt === -1?1:cnt;
  for(j = 0; j < tote;j++){
    if(tote < 0){
      break;
    }
    hgh = dice[actv[0]].getValue();
    pos = actv[0];
    pop = 0;
    for(i = 0;i < actv.length;i++){
      if(dice[actv[i]].getValue() > hgh){
        hgh = dice[actv[i]].getValue();
        pos = actv[i];
        pop = i;
      }
    }
    dice[pos].inValid('dh');
    actv.splice(pop,1);
  }
  return dice;
}
//Function to switch to Success based rolling. Moditfiers can be added to include botch(1 subtracts) or bonus(max value adds 1).
function _countSuccess(op,trgt,dice){
  var success = 0,
    botch = op.match(/c/)?true:false,
    bonus = op.match(/a/)?true:false;
  dice.forEach(function(e){
    var t = isNaN(trgt)?-1:trgt;
    if(t === -1){
      t = e.getSize();
    }
    if(e.getValue() >= t){
      success++;
      if(e.getValue() === e.getSize() && bonus){
        success++;
      }
    }
    if(e.getValue() === 1 && botch){
      success--;
    }
  });
  success = success < 0?'b'+success:success;
  dice.push('s'+success);
  return dice;
}
//Function to combine polls together. Will just append single value to array
function _addToRoll(adder,roll){
  return [].concat.apply([],[roll,adder]);
}
//Function to convert values to negative for subtration
function _convertToNeg(roll,adder){
  if(typeof roll === 'object'){
    roll.forEach(function(e){
      if(typeof e !== 'object'){
        return;
      }
      if(e.getNote().match(/-/)){
        if(e.getValue() > 0){
          e.setValue(e.getValue()*-1);
        }
      }
    });
  }
  return _addToRoll(roll,adder);
}
//Function to total rolls value if not success based
function _getTotal(dice){
  var total = 0;
  dice.forEach(function(e,i,a){
    if(typeof e.getValue() === 'number'){
      total += e.getValue();
    }
  });
  return total;
}

module.exports = DicePool;
},{"./Die.js":2}],2:[function(require,module,exports){
//This is a die object that is used to create a die of any size
function Die(note,sides){
  var _private = {
    note: note,
    sides: sides,
    value: 0
  };

//Public Funtcions
  Object.defineProperties(this,{
    'getNote': {
      value: _getNote.bind(_private),
      emunerable: true
    },
    'getValue': {
      value: _getValue.bind(_private),
      emunerable: true
    },
    'getSize': {
      value: _getSize.bind(_private),
      emunerable: true
    },
    'inValid': {
      value: _inValid.bind(_private),
      emunerable: true
    },
    'setValue': {
      value: _setValue.bind(_private),
      emunerable: true
    },
    'roll': {
      value: _roll.bind(_private),
      emunerable: true
    }
  });
}

//Returns the Note of the die
function _getNote(){
  return this.note;
}
//Returns the current Value of the die
function _getValue(){
  return this.value;
}
//Returns the Size of the die
function _getSize(){
  return this.sides;
}
//Appends Value to mark as not valid
function _inValid(text){
  this.value = text + this.value;
}
//Sets Value for special cases
function _setValue(value){
  this.value = value;
}
//Rolls the Die changing the value from 1 to # of sides
function _roll(){
  this.value = Math.floor(Math.random() * (this.sides) + 1);
}

module.exports = Die;
},{}],3:[function(require,module,exports){
var DicePool = require('./DicePool.js');
var Utils = require('./Utils.js');

// Working on turning into modules and will Reactify it ultimately
function Roller(){
  var _private = {
    'saved': localStorage.savedRolls ? JSON.parse(localStorage.savedRolls): {},
    'buildGUI': buildGUI,
    'loadStyles': loadStyles
  };
  utils = new Utils();

//Function that loads the saved rolls and fills the GUi
  function fillSaved(){
    var template = document.querySelector('template.save'),
        list = document.querySelector('ul.saved');
    for(var roll in _private.saved){
      var li = document.importNode(template.content,true);
      list.appendChild(li);
      li = list.lastElementChild;
      li.firstElementChild.addEventListener('click',deleteR);
      li.lastElementChild.textContent = roll;
      li.addEventListener('dblclick',fillI);
    }
    function deleteR(e) {
      utils.deleteRoll(e.target);
    }
    function fillI(e) {
      utils.fillInput(e.target);
    }
  }
//Function to load the CSS
  function loadStyles(url){
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    var entry = document.getElementsByTagName('title')[0];
    entry.parentNode.insertBefore(link, entry);
  }
//Builds the pieces of the GUI and determines if the widget lives on the page by itself
  function buildGUI(where){
    where = !where?'body':'.'+where;
    if(where === 'body'){
      document.querySelector('title').innerHTML = 'Dice Roller';
      loadFavicon();
    }
    where = document.querySelector(where);
    loadTemplate(where);
    connectKey();
  }
//Loads the templates needed
  function loadTemplate(where){
    var templates = require('./templates'),
        keys = Object.keys(templates);

    keys.forEach(function(elem){
      var template = document.createElement('template');

      template.innerHTML = templates[elem].join("\n");
      if(elem === "game") {
        where.appendChild(document.importNode(template.content,true));
      } else {
        template.className = elem;
        where.appendChild(template);
      }
    });
    document.querySelector('input').addEventListener('focus',function(e){
      e.target.select();
    }); 
    connectButton(document.querySelector('.save'));
    fillSaved();
  }
//Adds the event listeners for different key strokes
  function connectKey(){
    document.addEventListener('keydown',function(e){
      if(e.which === 112){
        e.preventDefault();
      }
    });
    document.addEventListener('keyup',function(e){
      if(e.which === 13){
        utils.getResult();
      }
      else if(e.which === 27){
        utils.clearResult();
      }
      else if(e.which === 112){
        toggleHelp();
      }
    });
    document.querySelector('.roll').addEventListener('keyup',function(e){
      if(e.which === 57){
        autoParen(e.target);
      }
    });
  }
//Adds a closing parenthese to the end of the string
  function autoParen(input){
    var start = input.selectionStart,
        end = input.selectionEnd;
    input.value += ')';
    input.setSelectionRange(start,end);
  }
//adds the event listener for the save button
  function connectButton(butt){
    butt.addEventListener('click', function(){utils.saveRoll();});
  }
//Function that shows and removes the help screen
  function toggleHelp(){
    var contain = document.querySelector('.contain');
    if(document.querySelectorAll('.help').length === 1){
      var help = document.importNode(document.querySelector('template.help').content,true);
      contain.appendChild(help);
      help = document.querySelector('.helpBlur');
      help.className = 'helpBlur help';
    }
    else{
      contain.removeChild(contain.lastElementChild);
    }
  }
//Adds the Fovicon to the page if widget lives in the body
  function loadFavicon(){
    var icon = document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/x-icon';
    icon.href = './img/favicon.ico';
    var entry = document.getElementsByTagName('title')[0];
    entry.parentNode.insertBefore(icon, entry);
  }
//Public functions
  Object.defineProperties(this,{
    'init': {
      value: _init.bind(_private),
      emunerable: true
    }
  });
}

window.Roller = Roller;

//Initalizer used to start the widget building process
function _init(where){
  this.loadStyles('css/roller.css');
  window.location.hash = 'roll';
  this.buildGUI(where);
}

},{"./DicePool.js":1,"./Utils.js":4,"./templates":5}],4:[function(require,module,exports){
var DicePool = require('./DicePool.js');

//This is a object to hold util functions
function utils(){
  var _private = {
    'error': 'Check Input',
    'saved': localStorage.savedRolls ? JSON.parse(localStorage.savedRolls): {},
    'grabText': _grabText,
    'getResult': _getResult
  };

//Function the grobs and validates the text
  function _grabText(){
    var roll = document.querySelector('.roll').value;
    var splt = roll.split('d');
    if(splt.length > 1){
      return roll;
    }
    return _private.error;
  }

//Public functions
  Object.defineProperties(this,{
    private: _private,
    'getResult': {
      value: _getResult.bind(_private),
      emunerable: true
    },
    'clearResult': {
      value: _clearResult.bind(_private),
      emunerable: true
    },
    'saveRoll': {
      value: _saveRoll.bind(_private),
      emunerable: true
    },
    'deleteRoll': {
      value: _deleteRoll.bind(_private),
      emunerable: true
    },
    'formatResult': {
      value: _formatResult.bind(_private),
      emunerable: true
    },
    'grabtext': {
      value: _grabText.bind(_private),
      emunerable: true
    },
    'fillInput': {
      value: _fillInput.bind(_private),
      emunerable: true
    }
  });
}

//Function to get the Result from the inputed roll
function _getResult(){
  var result = this.grabText();
  if(result !== this.error){
    dice = new DicePool(result);
    dice = dice.getPool();
    document.querySelector('.result').innerHTML = _formatResult(dice);
    var clear = document.createElement('button');
    clear.textContent = 'Clear';
    clear.addEventListener('click',_clearResult);
    document.querySelector('.result').appendChild(clear);
  }
  else{
    document.querySelector('.result').innerHTML = result;
  }
}
//Function to clear the result contents
function _clearResult(){
  document.querySelector('.roll').value = '';
  document.querySelector('.result').innerHTML = '';
}
//Function used to save a roll and add it to the saved list
function _saveRoll(){
  var mtch = false, where, save = this.grabText();
  if(save !== this.error){
    var name = prompt("Enter Name For Roll",save);
    if(name === null) {
      return;
    }
    for(var roll in this.saved){
      if(this.saved[roll] === save){
        mtch = true;
        where = roll;
      }
    }
    if(!mtch){
      if(this.saved[name]) {
        mtch=true;
      }
      this.saved[name] = save;
      if(!mtch){
      var template = document.querySelector('template.save'),
          list = document.querySelector('ul.saved'),
          li = document.importNode(template.content,true);
    list.appendChild(li);
    li = list.lastElementChild;
    li.firstElementChild.addEventListener('click',deleteR);
    li.lastElementChild.textContent = name;
    li.addEventListener('dblclick',fillI);
      }
    }else{
      alert("Already saved as "+where);
    }
  }
  localStorage.savedRolls = JSON.stringify(this.saved);
  function deleteR(e) {
    _deleteRoll(e.target);
  }
  function fillI(e) {
    _fillInput(e.target);
  }
}
//Function to delete roll and remove from the saved list
function _deleteRoll(roll){
  var save = roll.parentElement.textContent;
  for(var rll in this.saved){
    if('x'+rll === save){
      delete this.saved[rll];
    }
  }
  roll.parentElement.parentElement.removeChild(roll.parentElement);
  localStorage.savedRolls = JSON.stringify(this.saved);
}
//Function that formats the result for display in a human readable way
function _formatResult(dice){
  var result = '';
  for(var die in dice){
    result += '<b>'+die+':</b> ';
    die = dice[die];
    if(Array.isArray(die)){
      for(i=0;i<die.length;i++){
        if(isNaN(die[i].getValue())){
          var num = die[i].getValue();
          num = num.replace(/[A-z]/g,'');
          result += '<span class="disabled">'+num+'</span> ';
        }
        else{
          if(die[i].getValue() === die[i].getSize()){
            result += '<span class="max">'+die[i].getValue()+'</span> ';
          }
          else{
            result += '<span>'+die[i].getValue()+'</span> ';
          }
        }
      }
    }
    else{
      result += die;
    }
    result += '</br>';
  }
  return result;
}
//Function used to fill the Input from the saved list
function _fillInput(roll){
  var str = roll.textContent;
  document.querySelector('.roll').value = this.saved[str];
  window.location.hash = 'roll';
  this.getResult();
}

module.exports = utils;
},{"./DicePool.js":1}],5:[function(require,module,exports){
module.exports=//HTML Templates in string format
{
  "game": ["<div class=\"contain\">",
    "<div id=\"roll\" class=\"tab\">",
    "<a href=\"#roll\">Roller</a>",
  "<div class=\"roller content\">",
    "<input class=\"roll\" type=\"text\"></input>",
    "<input class=\"save\" type=\"button\" value=\"Save\"></input>",
    "<div class=\"result\"></div>",
  "</div>",
  "</div>",
    "<div id=\"save\" class=\"tab\">",
    "<a href=\"#save\">Saves</a>",
  "<div class=\"list content\">",
    "<div class=\"listCont\">",
      "<ul class=\"saved\"></ul>",
    "</div>",
  "</div>",
  "</div>",
  "<div class=\"usage\">",
    "<p>Type Roll below - Hit Enter to roll</p>",
    "<p>Press F1 to toggle Help</p>",
  "</div>",
"</div>"],
  "save": ["<li><span class=\"delete\">X</span><span></span></li>"],
  "help": ["<div class=\"helpBlur\">",
      "<div class='helpContain'>",
        "<ul>",
          "<li>Standard Notation is <b>NdX</b>. It can be chained <b>NdX+NdX</b>. Empty <b>N</b> will counts as an 1.</li>",
          "<li>eg. <b>4d6</b> will roll 4 6-sided dice and <b>d6</b> will roll just 1.</li>",
          "<li><i>Precentile dice</i> - <b>d%</b> - Rolls 2d10 dice converting them to values between 1 and 100</li>",
          "<li><i>Fate/Fudge dice</i> - <b>NdF</b> - Rolls dice for the Fate system (-1, 0 or +1)</li>",
          "<li><i>Feng Shui shorthand</i> - <b>dFS</b> - same as d6!-d6!</li>",
          "<li>Roll modifiers only effect the die type they follow unless parentheses are used.</li>",
          "<li><i>Drop Dice</i> - <b>v[Number]</b> - Drops the lowest \"number\" of dice in a roll.</li>",
          "<li><i>Keep Dice</i> - <b>^[Number]</b> - Keeps the lowest \"number\" of dice in a roll.</li>",
          "<li><i>Reroll Dice</i> - <b>r[Number]</b> - Rerolls any dice that come up equal to or lower than \"number.\"</li>",
          "<li><i>Exploding</i> - <b>![Number]</b> - Adds an extra dice every time a die comes up as the \"number\" or higher.</li>",
          "<li><i>Success-Counting</i> - <b>t[Number]</b> - Counts as successes the number of dice that land equal to or higher than \"number.\"</li>",
          "<li><ul>",
            "<li><i>  Success-Canceling</i> - <b>c</b> - Cancels out a success every time a die lands on \"1\" (the minimum).</li>",
            "<li><i>  Bonus Successes</i> - <b>a</b> - Adds a success every time a die lands on the maximum for that dice type.</li>",
          "</ul>",
        "</ul></li>",
      "</div>",
    "</div>"]
}
},{}]},{},[3]);
