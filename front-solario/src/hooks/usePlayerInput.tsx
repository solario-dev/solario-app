import { useEffect, useRef } from "react"

export function usePlayerInput(ws: WebSocket) {
  const keys = useRef({ forward: false, back: false, left: false, right: false })

  useEffect(() => {
    const down = (e:any) => {
      if (e.key === "ArrowUp") keys.current.forward = true
      if (e.key === "ArrowDown") keys.current.back = true
      if (e.key === "ArrowLeft") keys.current.left = true
      if (e.key === "ArrowRight") keys.current.right = true
    }
    const up = (e:any) => {
      if (e.key === "ArrowUp") keys.current.forward = false
      if (e.key === "ArrowDown") keys.current.back = false
      if (e.key === "ArrowLeft") keys.current.left = false
      if (e.key === "ArrowRight") keys.current.right = false
    }

    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)

    const interval = setInterval(() => {
      ws.send(JSON.stringify({ type: "input", keys: keys.current }))
    }, 50)

    return () => {
      clearInterval(interval)
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
    }
  }, [ws])
}
