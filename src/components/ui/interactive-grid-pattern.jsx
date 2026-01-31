import React, { useState, useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

/**
 * The InteractiveGridPattern component.
 *
 * @see InteractiveGridPatternProps for the props interface.
 * @returns A React component.
 */
export function InteractiveGridPattern({
  width = 60,
  height = 60,
  squares = [24, 24],
  className,
  squaresClassName,
  ...props
}) {
  const containerRef = useRef(null)
  const [gridSize, setGridSize] = useState({ width: 40, height: 40, horizontal: 24, vertical: 24 })
  const [hoveredSquare, setHoveredSquare] = useState(null)
  const [touchStart, setTouchStart] = useState(null)

  // Calculate responsive grid dimensions based on container size
  useEffect(() => {
    const calculateGridDimensions = () => {
      const container = containerRef.current?.parentElement
      if (!container) return

      const containerWidth = container.clientWidth || window.innerWidth
      const containerHeight = container.clientHeight || window.innerHeight

      // Responsive calculations based on screen size
      let squareSize, horizontal, vertical

      if (containerWidth < 640) {
        // Mobile
        squareSize = Math.max(25, Math.floor(containerWidth / 20))
        horizontal = Math.ceil(containerWidth / squareSize)
        vertical = Math.ceil(containerHeight / squareSize)
      } else if (containerWidth < 1024) {
        // Tablet
        squareSize = Math.max(30, Math.floor(containerWidth / 25))
        horizontal = Math.ceil(containerWidth / squareSize)
        vertical = Math.ceil(containerHeight / squareSize)
      } else {
        // Desktop
        squareSize = Math.max(35, Math.floor(containerWidth / 30))
        horizontal = Math.ceil(containerWidth / squareSize)
        vertical = Math.ceil(containerHeight / squareSize)
      }

      setGridSize({
        width: squareSize,
        height: squareSize,
        horizontal: Math.min(horizontal, 30),
        vertical: Math.min(vertical, 30)
      })
    }

    calculateGridDimensions()
    
    const resizeObserver = new ResizeObserver(calculateGridDimensions)
    if (containerRef.current?.parentElement) {
      resizeObserver.observe(containerRef.current.parentElement)
    }

    return () => resizeObserver.disconnect()
  }, [])

  const handleSquareInteraction = (index) => {
    setHoveredSquare(index)
    setTimeout(() => setHoveredSquare(null), 300) // Reset after animation
  }

  const handleTouchStart = (e, index) => {
    e.preventDefault()
    setTouchStart(index)
    handleSquareInteraction(index)
  }

  const handleTouchMove = (e) => {
    if (touchStart !== null) {
      e.preventDefault()
      // Calculate which square is being touched
      const touch = e.touches[0]
      const element = document.elementFromPoint(touch.clientX, touch.clientY)
      if (element?.dataset?.squareIndex) {
        const index = parseInt(element.dataset.squareIndex)
        if (index !== touchStart) {
          setHoveredSquare(index)
        }
      }
    }
  }

  const handleTouchEnd = () => {
    setTouchStart(null)
    setTimeout(() => setHoveredSquare(null), 200)
  }

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0"
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <svg
        width={gridSize.width * gridSize.horizontal}
        height={gridSize.height * gridSize.vertical}
        className={cn("absolute inset-0 h-full w-full border border-gray-400/30", className)}
        {...props}>
        {Array.from({ length: gridSize.horizontal * gridSize.vertical }).map((_, index) => {
          const x = (index % gridSize.horizontal) * gridSize.width
          const y = Math.floor(index / gridSize.horizontal) * gridSize.height
          return (
            <rect
              key={index}
              data-square-index={index}
              x={x}
              y={y}
              width={gridSize.width}
              height={gridSize.height}
              className={cn(
                "stroke-gray-400/30 transition-all duration-100 ease-in-out [&:not(:hover)]:duration-1000",
                hoveredSquare === index ? "fill-gray-300/30" : "fill-transparent",
                squaresClassName
              )}
              onMouseEnter={() => handleSquareInteraction(index)}
              onMouseLeave={() => setHoveredSquare(null)}
              onTouchStart={(e) => handleTouchStart(e, index)} />
          );
        })}
      </svg>
    </div>
  );
}
