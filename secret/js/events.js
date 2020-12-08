const listeners = new WeakMap()

export default class EventEmitter {
  constructor() {
    listeners.set(this,new Map())
  }
  listen(name,cb) {
    listeners.get(this).set(name,cb)
  }
  emit(event,...args) {
    listeners.get(this).get(event)(...args)
  }
}