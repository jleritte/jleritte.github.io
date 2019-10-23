import $$ from './DOM.js'
import h from './handlers.js'


//HTML Templates in string format
let uiContent = ["<div class=\"dr_contain\">",
    "<div class=\"dr_list dr_content\" tabindex=\"1\">",
      "<div class=\"dr_tab\">Saves</div>",
      "<div class=\"dr_listCont\">",
        "<ul class=\"dr_saved\"></ul>",
      "</div>",
    "</div>",
    "<div class=\"dr_roller dr_content\" tabindex=\"1\">",
      "<div class=\"dr_tab\">Rolls</div>",
      "<input class=\"dr_roll\" type=\"text\"></input>",
      "<input class=\"dr_rollButton dr_hide\" type=\"button\" value=\"Roll\"></input>",
      "<input class=\"dr_saveButton\" type=\"button\" value=\"Save\"></input>",
      "<div class=\"dr_result\"></div>",
    "</div>",
    "<div class=\"dr_usage\">",
      "<span class=\"dr_hide_widg\">Type Roll below - Hit Enter to roll</span>",
      "<span class=\"dr_hide_widg\">Press F1</span><span class=\"dr_hide\">Click here</span> to toggle Help",
    "</div>",
  "</div>"].join(''),
  saveContent = ["<li><span></span><span class=\"dr_delete\">X</span></li>"].join(''),
  helpContent = ["<div class=\"dr_helpBlur\">",
      "<div class='dr_helpContain'>",
        "<ul>",
          "<li>Standard Notation is <b>NdX</b>. It can be chained <b>NdX+NdX</b>. Empty <b>N</b> will counts as an 1.</li>",
          "<li>eg. <b>4d6</b> will roll 4 6-sided dice and <b>d6</b> will roll just 1.</li>",
          "<li><i>Precentile dice</i> - <b>d%</b> - Rolls 2d10 dice converting them to values between 1 and 100</li>",
          "<li><i>Fate/Fudge dice</i> - <b>NdF</b> - Rolls dice for the Fate system (-1, 0 or +1)</li>",
          // "<li><i>Feng Shui shorthand</i> - <b>dFS</b> - same as d6!-d6!</li>",
          "<li>Roll modifiers only effect the die type they follow unless parentheses are used.</li>",
          "<li><i>Drop Dice</i> - <b>v[Number]</b> - Drops the lowest \"number\" of dice in a roll.</li>",
          "<li><i>Keep Dice</i> - <b>^[Number]</b> - Keeps the lowest \"number\" of dice in a roll.</li>",
          "<li><i>Reroll Dice</i> - <b>r[Number]</b> - Rerolls any dice that come up equal to or lower than \"number.\"</li>",
          "<li><i>Exploding</i> - <b>![Number]</b> - Adds an extra dice every time a die comes up as the \"number\" or higher.</li>",
          "<li><i>Success-Counting</i> - <b>t[Number]</b> - Counts as successes the number of dice that land equal to or higher than \"number.\"</li>",
          "<li><ul>",
            "<li><i>  Success-Canceling</i> - <b>c</b> - Cancels out a success every time a die lands on \"1\" (the minimum).</li>",
            "<li><i>  Bonus Successes</i> - <b>a</b> - Adds a success every time a die lands on the maximum for that dice type.</li>",
          "</ul></li>",
        "</ul>",
      "</div>",
    "</div>"].join('')

// Functions to convert Templates HTML
let uiele = $$.create(uiContent),
  helpVisable = 0,
  helpele = $$.create(helpContent),
  keySet = false

export function ui(parent) {
  if(!parent) return
  if(parent.elements === document.body) {
    $$.css('css/fullPage.css')
    $$.query('title').text = 'Dice Roller'
    $$.icon()
    attachKeyHandlers()
  } else {
    $$.query('.dr_usage',node).click = helpHandle
    helpele.click = helpHandle
  }
  let node = uiele.elements
  $$.query('.dr_rollButton',node).click = h.roll
  $$.query('.dr_saveButton',node).click = h.save
  parent.add(uiele)
  h.load()
}


export function save(name,roll) {
  let saved = $$.create(saveContent)
  $$.query('span',saved.elements).text = name
  saved.elements.title = roll
  return saved
}

export function help(parent) {
  if(!parent) return
  helpVisable = !helpVisable
  helpVisable ? parent.add(helpele) : parent.remove(helpele)
}

function helpHandle() {
  help(uiele)
}

function attachKeyHandlers() {
  if(!keySet) {
    window.addEventListener('keyup',e => {
      // console.log(e)
      switch(e.key) {
        case 'Enter':   h.roll(); break
        case 'Escape':  h.clear(); break
        case 'F1':      helpHandle(); break
      }
    })
    window.addEventListener('keydown',function(e){
      if(e.key === 'F1'){
        e.preventDefault()
      }
    })
    keySet = !keySet
  }
}