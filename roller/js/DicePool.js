import Die from './Die.js'
let  dice = {}, _text

export default class DicePool {
  constructor(text) {
    dice = processDice(text)
    _text = text
  }
  get pool() {
    dice.text = _text
    return dice
  }
}

//Converts the String to a Postfix(RPN) array for processing
function* toPostFix(text){
  const PRECEDENCE = {'r':5,'!':4,'v':3,'^':3,'t':2,'+':1,'-':1}
  let operators = [], i, last

  for(let elem of text.split(/([-+v^r!act])/)){
    last = i
    i = text.indexOf(elem,i)
    if(elem === '' && (i === 0|| text[last] === 'a'|| text[last] === 'c')) {
      i++
      continue
    }
    if(elem.match(/[-+v^r!act]/) && elem.length === 1){
      let cur = PRECEDENCE[elem],
          last = PRECEDENCE[operators[0]]
      if(elem === 'a'||elem === 'c'){
        operators[0] += elem
      } else if(cur < last){
        yield operators.shift()
        operators.unshift(elem)
      } else{
        operators.unshift(elem)
      }
    } else {
      yield elem
    }
  }
  while(operators.length){
    yield operators.shift()
  }
}
//Processes the RPN and returns an array of objects and values
function processDice(rollStr){
  let i = 0, temp = []

  for(let elem of toPostFix(rollStr)){
    if(elem.match(/[v^r!tca+-]/)){
      if(i + 2 === temp.length || elem === '+' || elem === '-'){
        temp.push(operate(elem,temp.pop(),temp.pop()))
        i = i >= temp.length ? i = temp.length - 1 : i
      } else {
        temp[i] = operate(elem,temp.pop(),temp[i])
      }
    } else {
      let t = getDice(elem)
      temp.push(t)
      if(Array.isArray(t)){
        i = temp.length - 1
      }
    }
  }
  temp = temp[0]

  return temp.reduce((acc,cur,i,array) => {
    if(typeof cur === 'object'){
      let temp = cur.note
      if(temp in acc){
        acc[temp].push(cur)
      } else {
        acc[temp] = [cur]
      }
    } else if(typeof cur === 'number'){
      array[i] = new Die('+',0)
      array[i].value = cur
      cur = array[i]
      if('+' in acc){
        acc['+'].push(cur)
      } else {
        acc['+'] = [cur]
      }
    } else {
      acc.Success = cur.replace(/[sb]/g,'')
    }
    if(i+1 === array.length && !('Success' in acc)) {
      acc.Total = getTotal(array)
    }
    return acc
  },{})
}
//Takes a string notation and converts *d* into array of dice or number into int
function getDice(note){
  let num,sides,dice,roll,fudge = false
  if(/\d*d\d+/.test(note)){
    roll = note.split('d')
    num = isNaN(parseInt(roll[0])) ? 1 : Math.abs(roll[0])
    sides = parseInt(roll[1])
  }
  else if(/\d*d%/.test(note)){
    num = 2
    sides = 10
  }
  else if(/\d*dF/.test(note)){
    fudge = true
    roll = note.split('d')
    num = isNaN(parseInt(roll[0])) ? 1 : Math.abs(roll[0])
    sides = 6
  }
  else{
    return parseInt(note)
  }
  dice = new Array(num).fill(0).map(_ => new Die(note,sides))
  if(fudge) convertToFudge(note,dice)
  return dice
}
//Converts dice to Fudge/Fate dice
function convertToFudge(note,dice){
  return dice.map(e => {
    let tmp = e.value
    if(tmp === 2||tmp === 3){
      e.value = -1
    }
    else if(tmp === 4||tmp === 6){
      e.value = 0
    }
    else if(tmp === 1||tmp === 5){
      e.value = 1
    }
  })
}
//Switch to handle how to process Roll notations
function operate(op,o1,o2){
  switch(op){
    case 'r': return reRoll(o1,o2)
    case '!':  return explodeRoll(o1,o2)
    case 'v':  return dropLowest(o1,o2)
    case '^':  return dropHighest(o1,o2)
    case 't':
    case 'ta':
    case 'tc':
    case 'tac':
    case 'tca':  return countSuccess(op,o1,o2)
    case '+':  return addToRoll(o1,o2)
    case '-':  return convertToNeg(o1,o2)
  }
}
//Function to re-roll dice based on a target number or lower, will use 1 if no number is given
function reRoll(limit,dice){
  limit = isNaN(limit) ? 1 : limit
  for(let die of dice){
    if(die && typeof die !== 'object'){
      continue
    }
    let size = die.size
    if(limit === size){
      continue
    }
    if(die.value <= limit){
      let tmp = new Die(die.note,size)
      die.inValid = 'r'
      dice.push(tmp)
    }
  }
  return dice
}
//Function to explode(add more die of same type) roll based on target number or higher, will use die size - 1 if no number given
function explodeRoll(limit,dice){
  limit = isNaN(limit) ? -1 : limit
  for(let die of dice) {
    if(limit === 1){
      break
    }
    if(die && typeof die !== 'object'){
      continue
    }
    let size = die.size,
      bns = limit === -1 ? size : limit
    if(!isNaN(die.value)){
      if(die.value >= bns){
        let tmp = new Die(die.note,size)
        dice.push(tmp)
      }
    }
  }
  return dice
}
//Function to drop lowest [number] of rolls out of the pool. Will only drop one if no number given
function dropLowest(cnt,dice){
  cnt =  isNaN(cnt) ? 1 : cnt
  let low, pos, pop, actv = dice.map((e,i) => {
    if(!isNaN(e.value)){
      return i
    }
  }).filter(_ => _ !== undefined)
  if(!actv.length){
    return dice
  }
  for(let j = 0; j < cnt;j++){
    low = dice[actv[0]].value
    pos = actv[0]
    pop = 0
    for(let i = 1; i < actv.length;i++){
      if(dice[actv[i]].value < low){
        low = dice[actv[i]].value
        pos = actv[i]
        pop = i
      }
    }
    dice[pos].inValid = 'dl'
    actv.splice(pop,1)
  }
  return dice
}
//Function to drop highest [number] of rolls out of the pool. Will only drop one if no number given
function dropHighest(cnt,dice){
  cnt =  isNaN(cnt) ? 1 : cnt
  let hgh, pos, pop, actv = dice.map(function(e,i){
    if(!isNaN(e.value)){
      return i
    }
  }).filter(_ => _ !== undefined)
  if(!actv.length){
    return dice
  }
  for(let j = 0; j < cnt;j++){
    hgh = dice[actv[0]].value
    pos = actv[0]
    pop = 0
    for(let i = 0;i < actv.length;i++){
      if(dice[actv[i]].value > hgh){
        hgh = dice[actv[i]].value
        pos = actv[i]
        pop = i
      }
    }
    dice[pos].inValid = 'dh'
    actv.splice(pop,1)
  }
  return dice
}
//Function to switch to Success based rolling. Modifiers can be added to include botch(1 subtracts) or bonus(max value adds 1).
function countSuccess(op,trgt,dice){
  let success = 0,
    botch = /c/.test(op),
    bonus = /a/.test(op)
  dice.forEach(e => {
    let t = isNaN(trgt) ? e.size : trgt
    if(e.value >= t){
      success++
      if(e.value === e.size && bonus){
        success++
      }
    }
    if(e.value === 1 && botch){
      success--
    }
  })
  success = success < 0 ? `b${success}` : success
  dice.push(`s${success}`)
  return dice
}
//Function to combine polls together. Will just append single value to array
function addToRoll(adder,roll){
  return [].concat.apply([],[roll,adder])
}
//Function to convert values to negative for subtraction
function convertToNeg(roll,adder){
  // console.log(roll,adder)
  if(typeof roll === 'object'){
    roll.forEach(function(e){
      if(typeof e !== 'object'){
        return
      }
      if(e.note.match(/-/)){
        if(e.value > 0){
          e.value = e.value*-1
        }
      }
    })
  }
  return addToRoll(roll,adder)
}
//Function to total rolls value if not success based
function getTotal(dice){
  return dice.reduce((a,{value}) => a + (typeof value === 'number' ? value : 0),0)
}
