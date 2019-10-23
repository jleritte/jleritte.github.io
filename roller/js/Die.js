let dice = new WeakMap()

export default class Die{
  constructor(note,sides){
    dice.set(this,{
      note,
      sides,
      value: 0
    })
    roll(this)
  }
  get note() {
    return dice.get(this).note
  }
  get size() {
    return dice.get(this).sides
  }
  get value() {
    return dice.get(this).value
  }
  set value(value) {
    dice.get(this).value = value
  }
  set inValid(text) {
    let die = dice.get(this)
    die.value = text + die.value
  }
}

function roll(die) {
  die.value = Math.floor(Math.random() * (die.size) + 1)
}