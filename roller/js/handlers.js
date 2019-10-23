import $$ from './DOM.js'
import DicePool from './DicePool.js'
import {save,help} from './templates.js'

const ERROR = `Check Input`,
  saved = localStorage.savedRolls ? JSON.parse(localStorage.savedRolls) : {}
let results, clear, list, loaded = false


//Function that validates the text
function validateText(text){
  return /d/.test(text)
}

//Function to get the Result from the inputed roll
function getResult(){
  let result = $$.query('.dr_roll').value,
      target = $$.query('.dr_result')
  if(validateText(result)){
    if($$.query('.dr_row').elements) {
      clearResult()
    }
    let dice = new DicePool(result).pool
    results = formatResult(dice)
    clear = $$.create('<input type="button" value="Clear"/>');
    clear.click = clearResult
    target.add(clear)
  }
  else{
    target.text = ERROR
  }
}

//Function to clear the result contents
function clearResult(){
  // document.querySelector('.roll').value = '';
  while(results.length) {
    $$.query('.dr_result').remove(results.pop())
  }
  $$.query('.dr_result').remove(clear)
}

//Function to load saved rolls
function loadSaves() {
  list = $$.query('ul.dr_saved')
  if(!loaded) {
    for(let name in saved) {
      let li = save(name,saved[name])
      list.add(li)
      $$.query('.dr_delete',li.elements).click = deleteR
      li.dblclick = fillI
    }
    loaded = !loaded
  }
}

//Function used to save a roll and add it to the saved list
function saveRoll(){
  let mtch = false, where, roll = $$.query('.dr_roll').value
  if(validateText(roll)){
    let name = prompt("Enter Name For Roll",roll);
    if(name === null) {
      return
    }
    for(let entry in saved){
      if(saved[entry] === roll){
        mtch = true
        where = entry
      }
    }
    if(!mtch){
      if(saved[name]) {
        mtch=true
      }
      saved[name] = roll
      if(!mtch){
        let li = save(name, roll)
        list.add(li)
        $$.query('.dr_delete',li.elements).click = deleteR
        li.dblclick = fillI
      }
    }else{
      alert("Already saved as "+where)
    }
  }
  localStorage.savedRolls = JSON.stringify(saved);
}
function deleteR(e) {
  deleteRoll(e.target);
}
function fillI(e) {
  fillInput(e.target)
}

//Function to delete roll and remove from the saved list
function deleteRoll(roll){
  let target = roll.previousElementSibling.textContent
  for(let rll in saved){
    if(rll === target){
      target = saved[rll]
      delete saved[rll]
    }
  }
  $$.query('.dr_saved').remove($$.query(`[title="${target}"]`))
  localStorage.savedRolls = JSON.stringify(saved)
}

//Function used to fill the Input from the saved list
function fillInput(roll){
  let input = $$.query('.dr_roll')
  input.focus.value = saved[roll.textContent]
  getResult()
}

//Function that formats the result for display in a human readable way
function formatResult(dice){
  let result = $$.query('.dr_result'),rows = []
  for(var die in dice){
    let row = $$.create('<span class="dr_row"></span>')
    row.add('<b>'+die+':</b> ')
    die = dice[die]
    if(Array.isArray(die)){
      for(let i=0;i<die.length;i++){
        if(isNaN(die[i].value)){
          var num = die[i].value
          num = num.replace(/[A-z]/g,'')
          row.add('<span class="dr_disabled">'+num+'</span> ')
        }
        else{
          if(die[i].value === die[i].size){
            row.add('<span class="dr_max">'+die[i].value+'</span> ')
          }
          else{
            row.add('<span>'+die[i].value+'</span> ')
          }
        }
      }
    }
    else{
      row.add('<span>'+die+'</span>')
    }
    result.add(row)
    rows.push(row)
  }
  return rows
}

export default {roll: getResult, clear: clearResult, save: saveRoll,load: loadSaves}