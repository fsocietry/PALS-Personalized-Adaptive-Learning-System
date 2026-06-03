import { useState, useEffect } from 'react'

export function useCountUp(target, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let raf
    let timer

    const start = () => {
      const startTime = performance.now()
      const animate = (now) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.round(eased * target))
        if (progress < 1) raf = requestAnimationFrame(animate)
      }
      raf = requestAnimationFrame(animate)
    }

    timer = setTimeout(start, delay)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [target, duration, delay])

  return count
}
