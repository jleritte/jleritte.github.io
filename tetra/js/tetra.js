var Tetra = {
  //Max number of cards
  max: 100,
  //Arrays to Hold persistant Objects
  collection: [],
  gameCards: [],
  names: [],
  area: [],
  playerStats: {
    "wins":0,
    "losses":0,
    "draws":0
  },
  game: '',
  opponent: '',
  //Object templates
  //Card Data
  Card: function(num){
    this.num = num?num:Tetra.getCardNumber();
    this.name = null;
    this.maxAtk = 0;
    this.type = null;
    this.maxPdef = 0;
    this.maxMdef = 0;
    this.icon = "z";
    Tetra.getCardMaxes(this);
    this.atk = Math.floor(Tetra.getValue(0,this.maxAtk));
    this.pdef = Math.floor(Tetra.getValue(0,this.maxPdef));
    this.mdef = Math.floor(Tetra.getValue(0,this.maxMdef));
    this.arrwNum = Math.floor(Tetra.getValue(0,9));
    this.arrws = [];
    this.batWon = 2000;
    this.batLvl = 10;
    this.value = Tetra.convertValue(this);
    Tetra.setArrows(this);
  },
  //Card Store
  CardStore: function(type){
    this.type = type;
    this.cards = [];
    this.shifted = 1;
  },
  //Play Area
  PlayArea: function(){
    this.area = [];
    var count = 15,
    blocks = Math.floor(Tetra.getValue(0,7));
    while(true){
      if(blocks > 0){
        var temp = Math.floor(Tetra.getValue(0,16));
        if(!this.area[temp]){
          this.area[temp] = true;
          blocks--;
        }
      }
      else{
        if(!this.area[count]){
          this.area[count] = false;
        }
        count--;
      }
      if(count < 0){break;}
    }
  },
  //HTML or Visual Card
  HtmlCard: function(card,index){
    cardDiv = document.querySelector('template.card').content.children[0].cloneNode(true);
    Array.prototype.forEach.call(cardDiv.children,function(e,i){
      if(card.arrws[i]){
        e.className += ' arrow on';
      }
      if(e.className.match('name')){
        e.innerHTML = card.name;
      }
      if(e.className.match('value')){
        e.innerHTML = card.value;
      }
    });
    cardDiv.setAttribute('data-where', index);
    cardDiv.setAttribute('data-local', 'hand');
    return cardDiv;
  },
  //Html Challenger
  HtmlChallenger: function(){
    var j = 0,
      i = Math.floor(Tetra.getValue(0,19)),
      name = Tetra.challengers[i].name;
    for(j = 0;j < Tetra.names.length;j++){
      if(Tetra.names[j] === name){
        i = Math.floor(Tetra.getValue(0,19));
        name = Tetra.challengers[i].name;
        j = -1;
        continue;
      }
    }
    Tetra.names.push(name);
    this.name = name;
    this.img = new Image();
    this.img.src = Tetra.challengers[i].img;
    this.rating = '';
    for(j = 0;j < 5;j++){
      this.rating += (j <= Tetra.challengers[i].rating-1)?'<span class=power>&ofcir;</span>':'<span class=empty>&xodot;</span>';
    }
  },
  //Function Begin
  //Start Here
  init: function(where){
    this.loadStyles('css/tetra.css');
    this.loadScript('http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js',function(){
      Tetra.loadScript('js/cardList.js',function () {
        Tetra.buildGameArea(where);
      });
    });
  },
  //Loads Style in
  loadStyles: function(url){
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    var entry = document.getElementsByTagName('title')[0];
    entry.parentNode.insertBefore(link, entry);
  },
  //Loads Extra Files
  loadScript: function(url, callback){
    var script = document.createElement('script');
    script.async = true;
    script.src = url;
    var entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(script, entry);
    script.onload = script.onreadystatechange = function()
    {
      var rdyState = script.readyState;
      if (!rdyState || /complete|loaded/.test(script.readyState))
      {
        callback();
        script.onload = null;
        script.onreadystatechange = null;
      }
    };
  },
  //Loads Favicon
  loadFavicon: function(){
    var icon = document.createElement('link');
    icon.rel = 'shortcut icon';
    icon.href = 'images/favicon.ico';
    var entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(icon, entry);
  },
  //Parent Div
  buildGameArea: function(where){
    where = !where?'body':'.'+where;
    if(where === 'body'){
      document.querySelector('title').innerHTML = 'Tetra Masters';
      this.loadFavicon();
    }
    var div = document.createElement('div');
    div.className = 'game';
    document.querySelector(where).appendChild(div);
    Tetra.game = div;
    this.loadStartScreen();
  },
  //Start Screen\Main Menu
  loadStartScreen: function(){
    Tetra.game.className = 'game main';
    Tetra.game.innerHTML = this.mainScreen.join('\n');//require('templates').mainMenu.join('\n');
    Tetra.setMenuClicks();
  },
  //Menu Functionality
  setMenuClicks: function(){
    var buttons = document.querySelectorAll('.menuButton');
    buttons[0].addEventListener('click',function(event){
      Tetra.startNewGame();
    });
    buttons[1].addEventListener('click',function(event){
      Tetra.continueGame();
    });
    buttons[2].addEventListener('click',function(event){
      Tetra.loadOptionsMenu();
    });
  },
  //Main Menu Fucntions
  startNewGame: function(){
    this.createStartCards();
    this.loadChallengers();
  },
  continueGame: function(){
    this.loadPlayerCards();
    this.loadChallengers();
  },
  loadOptionsMenu: function(){
    alert('Options');
    var tempCards = [];
    if(localStorage.playerCards){
      delete localStorage.playerCards;
    }
    for(i = 0; i < 100;i++){
      tempCards.push(new this.Card(i+1));
    }
    for(i = 0;i < 100;i++){
      this.collection[i] = new this.CardStore(i+1);
    }
    for(i = 0;i < this.collection.length;i++){
      if(tempCards[i]){
        var type = tempCards[i].num;
        this.collection[type-1].cards.push(tempCards[i]);
      }
    }
    localStorage.playerCards = JSON.stringify(this.collection);
    this.loadChallengers();
  },
  //New Game Function
  createStartCards: function(){
    var tempCards = [];
    if(localStorage.playerCards){
      delete localStorage.playerCards;
    }
    for(i = 0; i < 5;i++){
      tempCards.push(new this.Card());
    }
    for(i = 0;i < 100;i++){
      this.collection[i] = new this.CardStore(i+1);
    }
    for(i = 0;i < this.collection.length;i++){
      if(tempCards[i]){
        var type = tempCards[i].num;
        this.collection[type-1].cards.push(tempCards[i]);
      }
    }
    localStorage.playerCards = JSON.stringify(this.collection);
  },
  //Continue Function
  loadPlayerCards: function(){
    localStorage.playerCards ? this.collection = JSON.parse(localStorage.playerCards) : this.startNewGame();
  },
  //Game Start Functions
  loadChallengers: function(){
    var list;
    this.names = [];
    Tetra.game.className = 'game challengers';
    Tetra.game.innerHTML = this.challengeScreen.join('\n');//require('templates').challengeScreen.join('\n');
    list = document.querySelector('.challengeList');
    for(i = 0;i < 10;i++){
      var li = document.createElement('li'),
          who = new Tetra.HtmlChallenger(),
          temp = document.createElement('span');
      li.className = 'challenge ' + who.name;
      li.appendChild(who.img);
      temp.innerHTML = who.name + '<br/>' + who.rating;
      li.appendChild(temp);
      list.appendChild(li);
    }
    Tetra.setButtons();
    Tetra.setChallengers();
  },
  setChallengers: function(){
    Array.prototype.forEach.call(document.querySelectorAll('.challenge'),function(e){
      e.addEventListener('click',function(){
        var who = this.className;
        who = who.replace('challenge ','');
        console.log(who);
        Tetra.opponent = who;
        Tetra.loadCardSelectionScreen();
      });
    });
  },
  loadCardSelectionScreen: function(){
    Tetra.game.className = 'game cards';
    Tetra.game.innerHTML = this.cardSelectionScreen.join('\n');//require('templates').cardSelectionScreen.join('\n');
    var table = document.querySelector('table.grid').firstElementChild,i,j;
    for(i = 0;i < 10;i++){
      table.innerHTML += this.cardSelectRow.join('\n');//require('templates').cardSelectRow.join('\n');
      var row = table.lastElementChild;
      for(j = 0;j < 10;j++){
        var cell = this.cardSelectCell;//require('templates').cardSelectCell.join('');
        cell.splice(1,1,'C'+parseInt(''+j+i));
        row.innerHTML += cell.join('');
      }
    }
    Tetra.collection.forEach(function(e,i){
      if(e.cards.length > 0){
        var type = e.cards[0].icon, cell = document.querySelector('.C'+i);
        cell.className += ' full icon-'+type;
        cell.firstElementChild.className = '';
        cell.firstElementChild.innerHTML = e.cards.length;
        if(e.cards.length == 1){
          cell.firstElementChild.className = "clear";
        }
      }
    });
    Tetra.fillPlayerInfo();
    Tetra.setButtons();
    Tetra.setSelectGrid();
    var temp = document.createElement('template');
    temp.className = 'card';
    temp.innerHTML = this.card.join('\n');//require('templates').card.join('\n');
    Tetra.game.appendChild(temp);
  },
  setSelectGrid: function(){
    Array.prototype.forEach.call(document.querySelectorAll('.full'),function(e){
      e.addEventListener('click',function(){
        Tetra.rendercardSelector(this);
      });
    });
  },
  setSelector: function(where){
    var temp;
    //TODO: Workout click events
    $('.selector').unbind('click').click(function(){
      if($(this).hasClass('left')){
        temp = where.cards.shift();
        where.cards.push(temp);
        where.shifted++;
        if(where.shifted > where.cards.length){
          where.shifted = 1;
        }
      }
      else{
        temp = where.cards.pop();
        where.cards.unshift(temp);
        where.shifted--;
        if(where.shifted < 1){
          where.shifted = where.cards.length;
        }
      }
      Tetra.rendercardSelector(where);
    });
    $('.card.1').unbind('click').click(function(){
      $(this).unbind('click');
      if(Tetra.gameCards.length <= 4){
        switch(Tetra.gameCards.length){
          case 0: $(this).css({left:'-454px',top:'325px'});break;
          case 1: $(this).css({left:'-349px',top:'325px'});break;
          case 2: $(this).css({left:'-244px',top:'325px'});break;
          case 3: $(this).css({left:'-139px',top:'325px'});break;
          case 4: $(this).css({left:'-34px',top:'325px'});break;
        }
        Tetra.gameCards.push(where.cards.shift());
        if(where.shifted > where.cards.length){
          where.shifted = 1;
        }
        setTimeout(function(){Tetra.rendercardSelector(where);},250);
        if(Tetra.gameCards.length === 5){
          temp = confirm('Ready to play?');
          temp?Tetra.buildPlayArea():function(){return;};
        }
      }
      else{
        alert('Hand is Full!!');
        temp = confirm('Ready to play?');
        temp?Tetra.buildPlayArea():function(){return};
      }
    });
    $('.tempC').unbind('click').click(function(){
      temp = $(this).attr('class');
      temp = temp.split(' ');
      temp = temp[temp.length -1];
      temp = Tetra.gameCards.splice(temp,1);
      temp = temp[0];
      Tetra.collection[temp.num-1].cards.push(temp);
      $(this).css({top:'-150px',border:'1px solid rgba(0,0,0,0)',background:'transparent'});
      setTimeout(function(){Tetra.rendercardSelector(where);},150);
    });
  },
  buildPlayArea: function(){
    Tetra.game.className = 'game Playing';
    Tetra.game.innerHTML = this.playField.join('\n');//require('templates').playField.join('\n');
    var temp = document.createElement('template');//rquire('templates').card.join('\n');
    temp.className = 'card';
    temp.innerHTML = this.card.join('\n')
    Tetra.game.appendChild(temp);
    Tetra.renderCards();
  },
  renderCards: function(){
    var i = 0,
      cards = this.gameCards;
    for(i = 0; i < 5;i++){
      cards.push(new this.Card());
    }
    for(i = 0; i < 10;i++){
      var temp;
      if(i < 5){
        temp = this.HtmlCard(this.gameCards[i],i);
        $(temp).removeClass('off template').addClass('hand faceUp blue top-'+(4-i)).attr('data-player',1);
        $($('.stack')[0]).append($(temp));
        this.isFaceUp(temp);
      }
      else{
        temp = this.HtmlCard(cards[i],i);
        $(temp).removeClass('off template').addClass('back top-'+(9-i)).attr('data-player',2);
        $($('.stack')[1]).append($(temp));
      }
    }
    this.setCards();
  },
  setCards: function(){
    $('.card').unbind('click').click(function(){
      var location = Tetra.getLocation(this);
      if(!$(this).hasClass('back')){
        if($('.selected').length===0||$(this).hasClass('selected')){
          if($(this).hasClass('played')||$(this).hasClass('selected')){
            $(this).removeClass('played selected r hand '+location).attr('data-local','hand')
              .addClass('hand');
          }
          else{
            $(this).addClass('selected')
              .removeClass('hand');
          }
        }
      }
      else{
        if($('.temp').length===0||$(this).hasClass('temp')){
          if($(this).hasClass('played')||$(this).hasClass('temp')){
            $(this).removeClass('faceUp red played temp l '+location).attr('data-local','hand');
            Tetra.isFaceUp(this);
          }
          else{
            $(this).addClass('temp');
          }
        }
      }
    });
    this.renderGrid();
  },
  renderGrid: function(){
    this.area = new this.PlayArea();
    $('.field').find('td').each(function (i) {
      if (Tetra.area.area[i]) {
        $(this).addClass('block');
      }
    });
    this.setGrid();
    this.getScores();
    this.setButtons();
  },
  setGrid: function(){
    $('.field td').click(function(event){
      var card;
      if($('.selected')[0]){
        card = $('.selected');
      }
      else if($('.temp')[0]){
        card = $('.temp');
      }
      var location = Tetra.getLocation(this);
      if($(this).hasClass('block')){
        card.click();
      }
      else if(card.hasClass('temp')){
        card.removeClass('temp').addClass('played red faceUp l '+location).attr('data-local',location);
        Tetra.isFaceUp(card);
        Tetra.checkForAttack(card);
      }
      else{
        card.removeClass('selected').addClass('played r '+location).attr('data-local',location);
        Tetra.checkForAttack(card);
      }
    });
  },
  getLocation: function(grid){
    return $(grid).attr('data-local');
  },
  getScores: function(fights){
    var p1 = 0,
      p2 = 0,
      i = 0,
      cards = $('.stack').children();
    for(i = 0;i < cards.length;i++){
      if($(cards[i]).hasClass('blue')&&$(cards[i]).hasClass('played')){
        p1++;
      }
      else if($(cards[i]).hasClass('red')&&$(cards[i]).hasClass('played')){
        p2++;
      }
    }
    $('.p1').attr('data-score',p1).html(p1);
    $('.p2').attr('data-score',p2).html(p2);
    Tetra.checkForGameEnd(fights);
  },
  //Buttons
  setButtons: function(){
    $('.menu').click(function(event){
      Tetra.loadStartScreen();
    });
    $('.reload').click(function(event){
      var classes = $('.buttons').parent().attr('class');
      classes = classes.split(' ');
      switch(classes[1]){
        case 'challengers': Tetra.loadChallengers();break;
        case 'cards':       Tetra.loadCardSelectionScreen();break;
        case 'Playing':     Tetra.buildPlayArea();break;
        default:            Tetra.loadStartScreen();
      }
      //location.reload();
    });
  },
  //Random Util Functions To be Sorted But needed to get going right now
  fillPlayerInfo: function(){
    if(localStorage.playerStats){
      Tetra.playerStats = JSON.parse(localStorage.playerStats);
    }
    else{
      Tetra.playerStats.wins = 0;
      Tetra.playerStats.losses = 0;
      Tetra.playerStats.draws = 0;
    }
    for(var stat in Tetra.playerStats) {
       if (Tetra.playerStats.hasOwnProperty(stat)) {
         $('.'+stat).children().html(Tetra.playerStats[stat]+"&nbsp;");
       } 
    }
    $('.cCount').children().text(Tetra.countCards());
    $('.type').children().text(Tetra.countTypes());
  },
  countCards: function(){
    var count = 0,
      i = 0;
    for(i;i < 100;i++){
      count += this.collection[i].cards.length;
    }
    return count;
  },
  countTypes: function(){
    var count = 0,
      i = 0;
    for(i;i < 100;i++){
      if(this.collection[i].cards.length > 0){
        count++;
      }
    }
    return count;        
  },
  checkForGameEnd: function(fights){
    var p1 = parseInt($('.p1').attr('data-score'),10),
      p2 = parseInt($('.p2').attr('data-score'),10),
      temp,
      tempCards = [];
    fights = fights?fights:[];
    if((p1+p2) === 10 && fights.length === 0){
      setTimeout(function(){
        tempCards = Tetra.gameCards.splice(5,5);
        Tetra.clearBoard();
        if(p1>p2){
          Tetra.playerStats.wins += 1;
          $('.blue').each(function(){
            if($(this).attr('data-where') > 4){
              $(this).addClass('hand').click(function(){
                temp = tempCards.slice($(this).attr('data-where')-5,$(this).attr('data-where')-4);
                temp = temp[0];
                Tetra.collection[temp.num-1].cards.push(temp);
                $(this).unbind().css({left:'50px',border:'1px solid rgba(0,0,0,0)',background:'rgba(0,0,0,0)'});
                var card = this;
                setTimeout(function(){$(card).remove();},200);
                Tetra.cleanUp();
              });
            }
          });
          if(p1 === 10){
            setTimeout(function(){
            for(var i = 5;i < 10;i++){
              var card = $('.blue')[i];
              $(card).trigger('click');
            }
            },400);
          }
        }
        if(p1<p2){
          Tetra.playerStats.losses += 1;
          $('.red').each(function(){
            if($(this).attr('data-where') < 4){
              $(this).addClass('hand').click(function(){
                temp = Tetra.gameCards.splice($(this).attr('data-where'),1);
                temp = temp[0];
                $(this).unbind().css({left:'-50px',border:'1px solid rgba(0,0,0,0)',background:'rgba(0,0,0,0)'});
                var card = this;
                setTimeout(function(){$(card).remove();},200);
                Tetra.cleanUp();
              });
            }
          });
          if(p2 === 10){
            setTimeout(function(){
            for(var i = 0;i < 5;i++){
              var card = $('.red')[i];
              Tetra.gameCards.shift();
              $(card).unbind().css({left:'-50px',border:'1px solid rgba(0,0,0,0)',background:'rgba(0,0,0,0)'});
              setTimeout(function(){$(card).remove();},200);
              Tetra.cleanUp();
            }
            },400);
          }
        }
        if(p1 === p2){
          Tetra.playerStats.draws += 1;
        }
      },1000);
    }
    else {
      return;
    }
  },
  cleanUp: function(){
    if(gameCards.length > 0){
      gameCards = gameCards.splice(0,5);
      while(true){
        collection[gameCards[0].num-1].cards.push(gameCards.shift());
        if(gameCards.length === 0){
          break;
        }
      }
    }
    // alert('saved');
    // localStorage.playerStats = JSON.stringify(playerStats);
    // localStorage.playerCards = JSON.stringify(collection);
  },
  clearBoard: function(){
    $('.card').attr('data-local','hand').each(function(){
      temp = $(this).attr('class');
      temp = temp.split(' ');
      for(var i = 0;i < temp.length;i++){
        if(temp[i].match(/top-\d/)){
          $(this).attr('data-local',temp[i]);
        }
      }
      temp = 'card ';
      temp += $(this).attr('data-local');
      temp = ($(this).attr('data-player') === '1')?temp + ' blue':temp + ' red';
      $(this).unbind('click').removeClass().addClass(temp);
    });
    temp = document.createElement('div');
    $('.fieldBox').empty().append($(temp).addClass('field').css('border','1px solid transparent'));
  },
  rendercardSelector: function(where){
    $('.hover').removeClass('hover');
    $(where).addClass('hover');
    if(where.cards){
      if(where.cards.length === 0){
        where.cards.push(0);
      }
    }
    if(where.className){
      where = where.className;
      where = where.split(' ');
      where = where[1].replace('C','');
      where = Tetra.collection[where];
    }
    $('.cardInfo').load('js/templates/cardInfo.html', function () {
      if(where.cards[0] !== 0){
        for(i = (where.cards.length <= 5)?where.cards.length-1:4;i > -1;i--){
          temp = new Tetra.HtmlCard(where.cards[i]);
          $('.select').append($(temp).removeClass('off').addClass('faceUp blue '+(i+1)).css({'left':i*10+45+'px','top':'5px'}));
          Tetra.isFaceUp(temp);
        }
      }
      else{
         where.cards.pop();
         $('.deleteButton').addClass('clear');
      }
      if(where.cards.length <= 1){
        $('.selector, .place').addClass('clear');
      }
      $('.max').text(where.cards.length);
      $('.cur').text(where.shifted);
      Tetra.setSelector(where);
    });
    $('.tempHand').empty();
    for(i = 0;i < Tetra.gameCards.length;i++){
      temp = new Tetra.HtmlCard(Tetra.gameCards[i]);
      $('.tempHand').append($(temp).removeClass('off template').addClass('faceUp blue tempC '+i).css('left',(50+(105*i))+'px'));
      Tetra.isFaceUp(temp);
    }
  },
  isFaceUp: function(card){
    if($(card).hasClass('faceUp')){
      $(card).children().each(function(){
        if($(this).hasClass('on')||$(this).hasClass('value')||$(this).hasClass('name')){
          $(this).removeClass('off');
        }
      });
    }
    else{
      $(card).children().each(function(){
        $(this).addClass('off');
      });
    }
  },
  getValue: function(min,max){
    return Math.random() * (max-min) + min;
  },
  getCardNumber: function(){
    var weights = [0.5,0.2,0.1,0.05,0.03,0.03,0.03,0.02,0.02,0.02],
      values = [1,2,3,4,5,6,7,8,9,10],
      num1 = this.getWeigthed(values,weights),
      num2 = this.getWeigthed(values,weights);
    return num1*num2;
  },
  getWeigthed: function(list,weight){
    var total = weight.reduce(function(prev,cur,i,arr){
      return prev + cur;
    }),
      random = this.getValue(0,total),
      sum = 0,
      i = 0;
    for(i = 0; i < list.length;i++){
      sum += weight[i];
      sum = +sum.toFixed(2);
      if(random <= sum){
        return list[i];
      }
    }
  },
  getCardMaxes: function(card){
    var list = this.masterCardList[card.num-1];
    card.name = list[0];
    card.maxAtk = list[1];
    card.type = list[2];
    card.maxPdef = list[3];
    card.maxMdef = list[4];
    card.icon = list[5];
  },
  convertValue: function(card){
    var value = '',
      temp = card.atk;
    value += this.convertToHex(temp);
    value += card.type;
    temp = card.pdef;
    value += this.convertToHex(temp);
    temp = card.mdef;
    value += this.convertToHex(temp);
    return value;
  },
  convertToHex: function(num){
    if(num>=0&&num<=15){
      num = 0;
    }else if(num>=16&&num<=31){
      num = 1;
    }else if(num>=32&&num<=47){
      num = 2;
    }else if(num>=48&&num<=63){
      num = 3;
    }else if(num>=64&&num<=79){
      num = 4;
    }else if(num>=80&&num<=95){
      num = 5;
    }else if(num>=96&&num<=111){
      num = 6;
    }else if(num>=112&&num<=127){
      num = 7;
    }else if(num>=128&&num<=143){
      num = 8;
    }else if(num>=144&&num<=159){
      num = 9;
    }else if(num>=160&&num<=175){
      num = 'A';
    }else if(num>=176&&num<=191){
      num = 'B';
    }else if(num>=192&&num<=207){
      num = 'C';
    }else if(num>=208&&num<=223){
      num = 'D';
    }else if(num>=224&&num<=239){
      num = 'E';
    }else if(num>=240&&num<=255){
      num = 'F';
    }
    return num;
  },
  setArrows: function(card){
    var count = card.arrwNum,
      total = 7;
    while(true){
      if(count > 0){
        var temp = Math.floor(this.getValue(0,8));
        if(!card.arrws[temp]){
          card.arrws[temp] = true;
          count--;
        }
      }
      else{
        if(!card.arrws[total]){
          card.arrws[total] = false;
        }
        total--;
      }
      if(total < 0){break;}
    }
  },
  getPrimes: function(max) {
    var sieve = [], i, j, primes = [];
    for (i = 2; i <= max; ++i) {
      if (!sieve[i]) {
        primes.push(i);
        for (j = i << 1; j <= max; j += i) {
          sieve[j] = true;
        }
      }
    }
    return primes;
  },
  checkForAttack: function(card){
    var arrows = this.gameCards[$(card).attr('data-where')].arrws,
      where = $(card).attr('data-local'),
      check = this.getSurround(where),
      fights = [],
      captures = [],
      i = 0;
    for(i = 0;i < arrows.length;i++){
      if(arrows[i]){
        if(!this.isEmpty(check[i])){
          if(this.isFight(check[i],where,$(card).attr('data-player'))){
            fights[i] = i;
          }
          else if($('.'+check[i]).attr('data-player') !== $(card).attr('data-player')){
            captures[i] = i;
          }
        }
      }
    }
    if(fights.length > 0){
      var count = 0;
      for(i = 0;i < fights.length;i++){
        if(fights[i] !== undefined){
          count++;
        }
      }
      if(count > 1){
        for(i = 0;i < fights.length;i++){
          if(fights[i] !== undefined){
            $('.'+check[i]).addClass('fight')
            .unbind('click').click(function(event){
              if($(this).hasClass('fight')){
                $('.stack').children().each(function(){
                  $(this).removeClass('fight');
                });
                Tetra.fight(this,card);
              }
            });
          }
        }
      }
      else{
        for(i = 0;i < fights.length;i++){
          if(fights[i] !== undefined){
            this.fight($('.'+check[fights[i]]),card);
          }
        }
      }
    }
    else if(fights.length === 0){
      for(i = 0;i < captures.length;i++){
        if(captures[i] !== undefined){
          this.capture($('.'+check[i]),card);
        }
      }
    }
    setTimeout(function(){Tetra.getScores(fights);},1001);
  },
  isEmpty: function(location){
    var empty = true;
    if($('.'+location)[0]){
      empty = false;
    }
    return empty;
  },
  isFight: function(card,threat,owner){
    var me = $('.'+card),
      arrows = this.gameCards[me.attr('data-where')].arrws,
      check = this.getSurround(me.attr('data-local')),
      fight = false,
      i = 0;
    for(i = 0;i < arrows.length;i++){
      if(arrows[i]&&check[i] === threat&&me.attr('data-player') !== owner){
        fight = true;
      }
    }
    return fight;
  },
  fight: function(attacked,attacker){
    var attckr = this.gameCards[$(attacker).attr('data-where')],
      attckd = this.gameCards[$(attacked).attr('data-where')],
      i = 0,
      attack = 0,
      defense = 0,
      type = attckr.type;
    setTimeout(function(){
      switch(type){
        case 'P':
        case 'M':
        case 'X':   attack = attckr.atk; break;
        case 'A':   attack = Tetra.largest(attckr); break;
      }
      switch(type){
        case 'P':   defense = attckd.pdef; break;
        case 'M':   defense = attckd.mdef; break;
        case 'X':   defense = Tetra.smaller(attckd); break;
        case 'A':   defense = Tetra.smallest(attckd); break;
      }
      attack -= Math.floor(Tetra.getValue(0,attack+1));
      defense -= Math.floor(Tetra.getValue(0,defense+1));
      console.log('Attack: '+attack+'\nDefense: '+defense);
      if(attack > defense){
        Tetra.capture(attacked,attacker,0);
        Tetra.checkCombo(attacked);
        Tetra.checkForAttack(attacker);
      }
      else{
         Tetra.capture(attacker,attacked,0);
         Tetra.checkCombo(attacker);
      }
    },1000);
  },
  checkCombo: function(card,recheck){
    var arrows = this.gameCards[$(card).attr('data-where')].arrws,
      where = $(card).attr('data-local'),
      check = this.getSurround(where),
      i = 0;
    for(i = 0;i < arrows.length;i++){
      if(arrows[i]){
        if(!this.isEmpty(check[i])){
          this.capture($('.'+check[i]),card);
        }
      }
    }
  },
  capture: function(loss,gain,time){
    loss = $(loss);
    gain = $(gain);
    loss.attr('data-player',gain.attr('data-player'));
    time = time === 0?time:1000;
    setTimeout(function(){
      if(gain.hasClass('blue')){
        loss.removeClass('red').addClass('blue');
      }
      else if(gain.hasClass('red')){
        loss.removeClass('blue').addClass('red');
      }
    },time);
  },
  getSurround: function(center){
    var i = 0,
      j = 0,
      row = center.charAt(0),
      col = center.charAt(1),
      blocks = $('.block');
      window.group = [];
     switch(row){
      case 'a':   group[i++] = false; group[i++] = false; group[i++] = row; group[i++] = 'b';
            group[i++] = 'b'; group[i++] = 'b';group[i++] = row; group[i++] = false; break;
      case 'b':   group[i++] = 'a'; group[i++] = 'a'; group[i++] = row; group[i++] = 'c';
            group[i++] = 'c'; group[i++] = 'c'; group[i++] = row; group[i++] = 'a'; break;
      case 'c':   group[i++] = 'b'; group[i++] = 'b'; group[i++] = row; group[i++] = 'd';
            group[i++] = 'd'; group[i++] = 'd'; group[i++] = row; group[i++] = 'b'; break;
      case 'd':   group[i++] = 'c'; group[i++] = 'c'; group[i++] = row; group[i++] = false;
            group[i++] = false; group[i++] = false; group[i++] = row; group[i++] = 'c'; break;
    }
    i = 0;
    switch(col){
      case '1':   group[i++] += col; group[i++] += '2'; group[i++] += '2'; group[i++] += '2';
            group[i++] += col; group[i++] = false; group[i++] = false; group[i++] = false; break;
      case '2':   group[i++] += col; group[i++] += '3'; group[i++] += '3'; group[i++] += '3';
            group[i++] += col; group[i++] += '1'; group[i++] += '1'; group[i++] += '1'; break;
      case '3':   group[i++] += col; group[i++] += '4'; group[i++] += '4'; group[i++] += '4';
            group[i++] += col; group[i++] += '2'; group[i++] += '2'; group[i++] += '2'; break;
      case '4':   group[i++] += col; group[i++] = false; group[i++] = false; group[i++] = false;
            group[i++] += col; group[i++] += '3'; group[i++] += '3'; group[i++] += '3'; break;
    }
    for(i = 0;i < group.length;i++){
      var patt = /false/;
      if(group[i]){
        if(group[i].match(patt)){
          group[i] = false;
        }
      }
    }
    for(i = 0;i < blocks.length;i++){
      for(j = 0;j < group.length;j++){
        if($(blocks[i]).attr('data-local') === group[j]){
          group[j] = false;
        }
      }
    }
    return group;
  },
  largest: function(card){
    var attack = card.atk;
    if(card.pdef > attack){
      attack = card.pdef;
    }
    if(card.mdef > attack){
      attack = card.mdef;
    }
    return attack;
  },
  smaller: function(card){
    var defense = card.pdef;
    if(card.mdef < defense){
      defense = card.mdef;
    }
    return defense;
  },
  smallest: function(card){
    var defense = card.atk;
    if(card.pdef < defense){
      defense = card.pdef;
    }
    if(card.mdef < defense){
      defense = card.mdef;
    }
    return defense;
  },
  //will be moved to templates file
  mainScreen: [
    "<div>",
      "<div class=\"title\">TETRA MASTERS</div>",
      "<div class=\"menuContainer\">",
        "<ul>",
          "<li class=\"menuButton\">NEW GAME</li>",
          "<li class=\"menuButton\">CONTINUE</li>",
          "<li class=\"menuButton\">OPTIONS</li>",
        "</ul>",
      "</div>",
    "</div>"
  ],
  challengeScreen: [
    "<div>",
      "<div class=\"header\">Please Select Opponent</div>",
      "<div class=\"challengerContain\">",
        "<ul class=\"challengeList\">",
        "</ul>",
      "</div>",
      "<div class=\"buttons\">",
        "<ul>",
          "<li class=\"menu\">Menu</li>",
          "<li class=\"reload\">Reload</li>",
        "</ul>",
      "</div>",
    "</div>"
  ],
  cardSelectionScreen: [
    "<div>",
      "<div class=\"gridContain\">",
        "<table class=\"grid\">",
          "<tbody>",
          "</tbody>",
        "</table>",
        "<ul>",
          "<li class=\"cCount\">Stock: <span>0</span></li>",
          "<li class=\"type\">Type: <span>0</span></li>",
        "</ul>",
      "</div>",
      "<div class=\"playerInfo\">",
        "<ul>",
          "<li class=\"collectorLvl\">Collector <span>LV</span>: <span class=\"wld\">1700p</span>",
            "<span class=\"rank\">Beginner</span></li>",
          "<hr />",
          "<li class=\"wins\">Wins:<span class=\"wld\">0 </span></li>",
          "<li class=\"losses\">Losses:<span class=\"wld\">0 </span></li>",
          "<li class=\"draws\">Draws:<span class=\"wld\">0 </span></li>",
        "</ul>",
      "</div>",
      "<div class=\"cardInfo\">",
      "</div>",
      "<div class=\"tempHand\"></div>",
      "<div class=\"buttons\">",
        "<ul>",
          "<li class=\"menu\">Menu</li>",
          "<li class=\"reload\">Reload</li>",
        "</ul>",
      "</div>",
    "</div>"
  ],
  cardSelectRow:[
    "<tr class=\"cardGrid\">",
    "</tr>"
  ],
  cardSelectCell: [
    "<td class=\"cardGrid ",-1,"\">",
      "<div class=\"cardGridcont\"></div>",
    "</td>"
  ],
  card: [
    "<div class=\"card off\" data-where=\"\" data-local=\"hand\">",
      "<div class=\"0 off up\"></div>",
      "<div class=\"1 off up right\"></div>",
      "<div class=\"2 off right\"></div>",
      "<div class=\"3 off down right\"></div>",
      "<div class=\"4 off down\"></div>",
      "<div class=\"5 off down left\"></div>",
      "<div class=\"6 off left\"></div>",
      "<div class=\"7 off up left\"></div>",
      "<div class=\"off value\"></div>",
      "<div class=\"off name\"></div>",
    "</div>"
  ],
  playField: [
    "<div>",
      "<div class=\"score\">",
        "<span class=\"p1\">0</span>",
        "<span class=\"divide\">/</span>",
        "<span class=\"p2\">0</span>",
      "</div>",
      "<div class=\"buttons\">",
        "<ul>",
          "<li class=\"menu\">Menu</li>",
          "<li class=\"reload\">Reload</li>",
        "</ul>",
      "</div>",
      "<div class=\"stack\"></div>",
      "<div class=\"fieldBox\">",
        "<table class=\"field\">",
          "<tr class='a'>",
            "<td data-local='a1'></td>",
            "<td data-local='a2'></td>",
            "<td data-local='a3'></td>",
            "<td data-local='a4'></td>",
          "</tr>",
          "<tr class='b'>",
            "<td data-local='b1'></td>",
            "<td data-local='b2'></td>",
            "<td data-local='b3'></td>",
            "<td data-local='b4'></td>",
          "</tr>",
          "<tr class='c'>",
            "<td data-local='c1'></td>",
            "<td data-local='c2'></td>",
            "<td data-local='c3'></td>",
            "<td data-local='c4'></td>",
          "</tr>",
          "<tr class='d'>",
            "<td data-local='d1'></td>",
            "<td data-local='d2'></td>",
            "<td data-local='d3'></td>",
            "<td data-local='d4'></td>",
          "</tr>",
        "</table>",
      "</div>",
    "<div class=\"stack\"></div>",
    "</div>"
  ]
};

