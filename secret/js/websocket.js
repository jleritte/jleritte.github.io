import {wrap,unwrap,setServerPubKey,exportPublicKey} from './crypto.js'
import {encode,decode,fromHexString,toHexString} from './utils.js'

let ws,emitter

export default class Socket {
  constructor(events) {
    emitter = events
    ws = ws || new WebSocket('wss://98.224.86.193:9000')
    ws.onopen = wsopen 
    ws.onmessage = wsmessage
    ws.onclose = wsclose
    ws.onerror = wserror
  }

  async send(action, data='') {
    let message = await wrap(JSON.stringify({action,data}))
    ws.send(message)
  }

  close() {
    ws.close(1000,"Logout")
  }
}

const wsopen = async e => {
  console.log('Connected')
  const key = await exportPublicKey()
  ws.send(JSON.stringify({action:"key",data:key}))
}
const wsclose = e => {
  if(e.wasClean) {
    console.log(`Connection closed - code:${e.code}  reason:${e.reason}`)
  } else {
    console.log('Connection Died')
  }
}
const wsmessage = async e => {
  let {data} = e
  data = JSON.parse(await unwrap(data))
  if(data.key) await setServerPubKey(data.key)
  else emitter.emit(data.action,data.success,data.data)
}
const wserror = e => console.log(`Error: ${e.message}`)