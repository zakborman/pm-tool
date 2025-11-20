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

  useEffect(() => {
    if (!token) return

    const connect = () => {
      const wsUrl = `ws://localhost:8000/ws?token=${token}`
      const socket = new WebSocket(wsUrl)

      socket.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
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

      socket.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)

        // Reconnect after 3 seconds
        reconnectTimeout.current = setTimeout(() => {
          console.log('Attempting to reconnect...')
          connect()
        }, 3000)
      }

      ws.current = socket
    }

    connect()

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [token, onMessage, onPresenceUpdate])

  return { isConnected }
}
