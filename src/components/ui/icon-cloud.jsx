import React, { useEffect, useRef, useState } from "react"
import { renderToString } from "react-dom/server"

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function IconCloud({
  icons,
  images
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [iconPositions, setIconPositions] = useState([])
  const [rotation] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [targetRotation, setTargetRotation] = useState(null)
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 1000 })
  const [screenType, setScreenType] = useState({ iconScale: 1.0 })
  const animationFrameRef = useRef(0)
  const rotationRef = useRef(rotation)
  const iconCanvasesRef = useRef([])
  const imagesLoadedRef = useRef([])

  // Handle responsive canvas sizing based on screen type
  const getScreenTypeSizing = (width) => {
    if (width < 640) {
      // Mobile: compact sizing
      return {
        heightMultiplier: 0.55,
        sizeFactor: 0.85,
        iconScale: 0.85
      }
    } else if (width < 1024) {
      // Tablet: medium sizing
      return {
        heightMultiplier: 0.7,
        sizeFactor: 0.95,
        iconScale: 0.95
      }
    } else if (width < 1280) {
      // Desktop: medium-large sizing
      return {
        heightMultiplier: 0.78,
        sizeFactor: 1.05,
        iconScale: 1.05
      }
    } else {
      // Large desktop: full sizing
      return {
        heightMultiplier: 0.85,
        sizeFactor: 1.15,
        iconScale: 1.25
      }
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect
      const screenWidth = window.innerWidth
      const sizing = getScreenTypeSizing(screenWidth)
      
      const size = Math.min(width * sizing.sizeFactor, window.innerHeight * sizing.heightMultiplier)
      setCanvasSize({ width: size, height: size })
      setScreenType(sizing)
    })

    resizeObserver.observe(container)
    
    // Initial size
    const initialWidth = container.offsetWidth
    const screenWidth = window.innerWidth
    const sizing = getScreenTypeSizing(screenWidth)
    const initialSize = Math.min(initialWidth * sizing.sizeFactor, window.innerHeight * sizing.heightMultiplier)
    setCanvasSize({ width: initialSize, height: initialSize })
    setScreenType(sizing)

    return () => resizeObserver.disconnect()
  }, [])

  // Create icon canvases once when icons/images change
  useEffect(() => {
    if (!icons && !images) return

    const items = icons || images || []
    imagesLoadedRef.current = new Array(items.length).fill(false)

    const newIconCanvases = items.map((item, index) => {
      const offscreen = document.createElement("canvas")
      offscreen.width = 80
      offscreen.height = 80
      const offCtx = offscreen.getContext("2d")

      if (offCtx) {
        if (images) {
          // Handle image URLs directly
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.src = items[index]
          img.onload = () => {
            offCtx.clearRect(0, 0, offscreen.width, offscreen.height)

            // Create circular clipping path
            offCtx.beginPath()
            offCtx.arc(40, 40, 40, 0, Math.PI * 2)
            offCtx.closePath()
            offCtx.clip()

            // Draw the image
            offCtx.drawImage(img, 0, 0, 80, 80)

            imagesLoadedRef.current[index] = true
          }
        } else {
          // Handle SVG icons
          offCtx.scale(0.8, 0.8)
          const svgString = renderToString(item)
          const img = new Image()
          img.src = "data:image/svg+xml;base64," + btoa(svgString)
          img.onload = () => {
            offCtx.clearRect(0, 0, offscreen.width, offscreen.height)
            offCtx.drawImage(img, 0, 0)
            imagesLoadedRef.current[index] = true
          }
        }
      }
      return offscreen
    })

    iconCanvasesRef.current = newIconCanvases
  }, [icons, images])

  // Generate initial icon positions on a sphere
  useEffect(() => {
    const items = icons || images || []
    const newIcons = []
    const numIcons = items.length || 20

    // Fibonacci sphere parameters
    const offset = 2 / numIcons
    const increment = Math.PI * (3 - Math.sqrt(5))

    for (let i = 0; i < numIcons; i++) {
      const y = i * offset - 1 + offset / 2
      const r = Math.sqrt(1 - y * y)
      const phi = i * increment

      const x = Math.cos(phi) * r
      const z = Math.sin(phi) * r

      const radius = Math.min(canvasSize.width, canvasSize.height) * 0.3
      newIcons.push({
        x: x * radius,
        y: y * radius,
        z: z * radius,
        scale: 1,
        opacity: 1,
        id: i,
      })
    }
    setTimeout(() => setIconPositions(newIcons), 0)
  }, [icons, images, canvasSize])

  // Handle mouse events
  const handleMouseDown = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect || !canvasRef.current) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    iconPositions.forEach((icon) => {
      const cosX = Math.cos(rotationRef.current.x)
      const sinX = Math.sin(rotationRef.current.x)
      const cosY = Math.cos(rotationRef.current.y)
      const sinY = Math.sin(rotationRef.current.y)

      const rotatedX = icon.x * cosY - icon.z * sinY
      const rotatedZ = icon.x * sinY + icon.z * cosY
      const rotatedY = icon.y * cosX + rotatedZ * sinX

      const screenX = canvasRef.current.width / 2 + rotatedX
      const screenY = canvasRef.current.height / 2 + rotatedY

          const baseRadius = Math.min(canvasSize.width, canvasSize.height) * 0.02 * screenType.iconScale
      const scale = (rotatedZ + canvasSize.width * 0.2) / (canvasSize.width * 0.3)
      const radius = baseRadius * scale
      const dx = x - screenX
      const dy = y - screenY

      if (dx * dx + dy * dy < radius * radius) {
        const targetX = -Math.atan2(icon.y, Math.sqrt(icon.x * icon.x + icon.z * icon.z))
        const targetY = Math.atan2(icon.x, icon.z)

        const currentX = rotationRef.current.x
        const currentY = rotationRef.current.y
        const distance = Math.sqrt(Math.pow(targetX - currentX, 2) + Math.pow(targetY - currentY, 2))

        const duration = Math.min(2000, Math.max(600, distance * 800))

        setTargetRotation({
          x: targetX,
          y: targetY,
          startX: currentX,
          startY: currentY,
          distance,
          startTime: performance.now(),
          duration,
        })
        return
      }
    })

    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setMousePos({ x, y })
    }

    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x
      const deltaY = e.clientY - lastMousePos.y

      rotationRef.current = {
        x: rotationRef.current.x + deltaY * 0.002,
        y: rotationRef.current.y + deltaX * 0.002,
      }

      setLastMousePos({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Animation and rendering
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)
      const dx = mousePos.x - centerX
      const dy = mousePos.y - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const speed = 0.003 + (distance / maxDistance) * 0.01

      if (targetRotation) {
        const elapsed = performance.now() - targetRotation.startTime
        const progress = Math.min(1, elapsed / targetRotation.duration)
        const easedProgress = easeOutCubic(progress)

        rotationRef.current = {
          x:
            targetRotation.startX +
            (targetRotation.x - targetRotation.startX) * easedProgress,
          y:
            targetRotation.startY +
            (targetRotation.y - targetRotation.startY) * easedProgress,
        }

        if (progress >= 1) {
          setTargetRotation(null)
        }
      } else if (!isDragging) {
        rotationRef.current = {
          x: rotationRef.current.x + (dy / canvas.height) * speed,
          y: rotationRef.current.y + (dx / canvas.width) * speed,
        }
      }

      iconPositions.forEach((icon, index) => {
        const cosX = Math.cos(rotationRef.current.x)
        const sinX = Math.sin(rotationRef.current.x)
        const cosY = Math.cos(rotationRef.current.y)
        const sinY = Math.sin(rotationRef.current.y)

        const rotatedX = icon.x * cosY - icon.z * sinY
        const rotatedZ = icon.x * sinY + icon.z * cosY
        const rotatedY = icon.y * cosX + rotatedZ * sinX

        const scale = (rotatedZ + 200) / 300
        const opacity = Math.max(0.2, Math.min(1, (rotatedZ + canvasSize.width * 0.15) / (canvasSize.width * 0.2)))

        ctx.save()
        ctx.translate(canvas.width / 2 + rotatedX, canvas.height / 2 + rotatedY)
        ctx.scale(scale, scale)
        ctx.globalAlpha = opacity

        if (icons || images) {
          // Only try to render icons/images if they exist
          if (
            iconCanvasesRef.current[index] &&
            imagesLoadedRef.current[index]
          ) {
            const iconSize = Math.min(canvasSize.width, canvasSize.height) * 0.04 * screenType.iconScale
            ctx.drawImage(iconCanvasesRef.current[index], -iconSize/2, -iconSize/2, iconSize, iconSize)
          }
        } else {
          // Show numbered circles if no icons/images are provided
          const circleRadius = Math.min(canvasSize.width, canvasSize.height) * 0.02 * screenType.iconScale
          ctx.beginPath()
          ctx.arc(0, 0, circleRadius, 0, Math.PI * 2)
          ctx.fillStyle = "#4444ff"
          ctx.fill()
          ctx.fillStyle = "white"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.font = `${Math.min(canvasSize.width, canvasSize.height) * 0.016 * screenType.iconScale}px Arial`
          ctx.fillText(`${icon.id + 1}`, 0, 0)
        }

        ctx.restore()
      })
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    };
  }, [icons, images, iconPositions, isDragging, mousePos, targetRotation, canvasSize, screenType.iconScale])

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="rounded-lg max-w-full max-h-full"
        aria-label="Interactive 3D Icon Cloud"
        role="img"
        style={{ 
          width: canvasSize.width, 
          height: canvasSize.height,
          touchAction: 'none'
        }} />
    </div>
  );
}