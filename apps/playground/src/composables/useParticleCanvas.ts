import { ref, onMounted, onUnmounted } from 'vue'

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

export interface UseParticleCanvasOptions {
  count?: number
  linkDistance?: number
  color?: string
  lineWidth?: number
}

export function useParticleCanvas(
  canvasRef: ReturnType<typeof ref<HTMLCanvasElement | null>>,
  options: UseParticleCanvasOptions = {},
) {
  const {
    count = 60,
    linkDistance = 100,
    color = 'rgba(24,144,255,0.8)',
    lineWidth = 0.2,
  } = options

  const particles = ref<Particle[]>([])
  let raf = 0

  onMounted(() => {
    for (let i = 0; i < count; i++) {
      particles.value.push({
        x: Math.random() * 600,
        y: Math.random() * 500,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
      })
    }
    raf = requestAnimationFrame(animate)
  })

  onUnmounted(() => cancelAnimationFrame(raf))

  function animate() {
    const canvas = canvasRef.value
    if (!canvas) {
      raf = requestAnimationFrame(animate)
      return
    }
    const ctx = canvas.getContext('2d')!
    const w = (canvas.width = canvas.offsetWidth * devicePixelRatio)
    const h = (canvas.height = canvas.offsetHeight * devicePixelRatio)
    const dpr = devicePixelRatio

    ctx.clearRect(0, 0, w, h)

    // 绘制粒子
    particles.value.forEach(p => {
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0 || p.x > w / dpr) p.vx *= -1
      if (p.y < 0 || p.y > h / dpr) p.vy *= -1

      ctx.beginPath()
      ctx.arc(p.x * dpr, p.y * dpr, p.r * dpr, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    })

    // 连线
    for (let i = 0; i < particles.value.length; i++) {
      for (let j = i + 1; j < particles.value.length; j++) {
        const a = particles.value[i],
          b = particles.value[j]
        const dx = a.x - b.x,
          dy = a.y - b.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < linkDistance) {
          ctx.beginPath()
          ctx.moveTo(a.x * dpr, a.y * dpr)
          ctx.lineTo(b.x * dpr, b.y * dpr)
          ctx.strokeStyle = `rgba(24,144,255,${(1 - dist / linkDistance) * lineWidth})`
          ctx.lineWidth = 1 * dpr
          ctx.stroke()
        }
      }
    }

    raf = requestAnimationFrame(animate)
  }

  return { particles }
}
