import { io } from 'socket.io-client'

const socket = io('http://localhost:3000', {
  autoConnect: false
})

export function connectSocket() {
  if (!socket.connected) {
    socket.connect()
  }
}

export function disconnectSocket() {
  socket.disconnect()
}

export function onAccessLog(callback) {
  socket.on('access_log', callback)
  return () => socket.off('access_log', callback)
}

export function onResidentCreated(callback) {
  socket.on('resident_created', callback)
  return () => socket.off('resident_created', callback)
}

export function onVisitorCheckIn(callback) {
  socket.on('visitor_checkin', callback)
  return () => socket.off('visitor_checkin', callback)
}

export function onDeviceSynced(callback) {
  socket.on('device_synced', callback)
  return () => socket.off('device_synced', callback)
}

export default socket
