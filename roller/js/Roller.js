// python -m SimpleHTTPServer 9001
// python -m http.server 9001

import $$ from './DOM.js'
import {ui,help} from './templates.js'
import h from './handlers.js'

let parent = $$.query('.rollContain').elements ? $$.query('.rollContain') : $$.query('body')
class Roller {
  constructor() {
    $$.css('css/roller.css')
    ui(parent)
  }
}

new Roller()

// Revisit this Functionality later
// //Adds a closing parenthese to the end of the string
//   function autoParen(input){
//     var start = input.selectionStart,
//         end = input.selectionEnd;
//     input.value += ')';
//     input.setSelectionRange(start,end);
//   }