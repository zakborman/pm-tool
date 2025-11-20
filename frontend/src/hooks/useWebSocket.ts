import { useEffect, useRef, useState } from 'react'

interface UseWebSocketOptions {
  token: string | null
  onMessage: (data: any) => void
  onPresenceUpdate?: (users: number[]) => void
}

export function useWebSocket({ token, onMessage, onPresenceUpdate }: UseWebSocketOptions) {
  const ws = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const reconnectTimeout = useRef<NodeJS.Timeout>()
  const shouldReconnect = useRef(true)
  const reconnectAttempts = useRef(0)

  useEffect(() => {
    if (!token) return

    shouldReconnect.current = true
    reconnectAttempts.current = 0

    const connect = () => {
      // Don't reconnect if we've exceeded attempts or component unmounted
      if (!shouldReconnect.current || reconnectAttempts.current >= 5) {
        console.log('WebSocket: Max reconnection attempts reached or component unmounted')
        return
      }

      try {
        const wsUrl = `ws://localhost:8000/ws?token=${token}`
        const socket = new WebSocket(wsUrl)

        socket.onopen = () => {
          console.log('WebSocket connected')
          setIsConnected(true)
          reconnectAttempts.current = 0
        }

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)

            if (data.type === 'presence_update') {
              onPresenceUpdate?.(data.active_users || [])
            } else {
              onMessage(data)
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        socket.onerror = (error) => {
          console.error('WebSocket error:', error)
        }

        socket.onclose = (event) => {
          console.log('WebSocket disconnected', event.code, event.reason)
          setIsConnected(false)

          // Only reconnect if not a normal closure and component is still mounted
          if (shouldReconnect.current && event.code !== 1000) {
            reconnectAttempts.current++
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000)

            reconnectTimeout.current = setTimeout(() => {
              console.log(`Attempting to reconnect... (attempt ${reconnectAttempts.current}/5)`)
              connect()
            }, delay)
          }
        }

        ws.current = socket
      } catch (error) {
        console.error('Error creating WebSocket:', error)
      }
    }

    connect()

    return () => {
      shouldReconnect.current = false
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close(1000, 'Component unmounting')
      }
    }
  }, [token])

  return { isConnected }
}
