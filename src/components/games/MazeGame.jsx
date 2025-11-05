import { useState, useEffect, useRef } from 'react'

// size for each cell and wall thickness
const CELL_SIZE = 30
const WALL_THICKNESS = 3

// different maze setups for each level
// walls format: [x1, y1, x2, y2]
const generateMaze = (level) => {
  const mazes = [
    // level 1 — kinda easy
    {
      width: 8,
      height: 8,
      walls: [
        [1, 0, 1, 3], [3, 0, 3, 2], [3, 3, 3, 5], [5, 2, 5, 5], [5, 6, 5, 7],
        [0, 2, 2, 2], [1, 4, 4, 4], [3, 6, 6, 6], [5, 1, 7, 1]
      ],
      start: [0, 3],
      end: [7, 1]
    },
    // level 2 — gets trickier
    {
      width: 10,
      height: 10,
      walls: [
        [1, 0, 1, 4], [3, 1, 3, 3], [3, 5, 3, 8], [5, 2, 5, 5], [5, 7, 5, 9],
        [7, 0, 7, 2], [7, 4, 7, 6], [9, 3, 9, 6],
        [0, 2, 2, 2], [2, 4, 5, 4], [1, 6, 4, 6], [4, 2, 6, 2], [6, 5, 9, 5],
        [7, 8, 9, 8], [2, 8, 4, 8]
      ],
      start: [0, 4],
      end: [9, 7]
    },
    // level 3 — the big one
    {
      width: 12,
      height: 12,
      walls: [
        [1, 0, 1, 3], [1, 5, 1, 8], [3, 2, 3, 5], [3, 7, 3, 10],
        [5, 1, 5, 4], [5, 6, 5, 9], [7, 0, 7, 3], [7, 5, 7, 8],
        [9, 2, 9, 5], [9, 7, 9, 10], [11, 4, 11, 7],
        [0, 2, 2, 2], [2, 4, 5, 4], [1, 6, 4, 6], [4, 2, 7, 2],
        [6, 5, 9, 5], [8, 3, 11, 3], [7, 7, 10, 7], [2, 9, 5, 9],
        [5, 11, 8, 11], [9, 1, 11, 1], [10, 9, 11, 9]
      ],
      start: [0, 5],
      end: [11, 6]
    }
  ]
  return mazes[level]
}

const MazeGame = ({ onBack }) => {
  const [level, setLevel] = useState(0)
  const [maze, setMaze] = useState(null)
  const [playerPos, setPlayerPos] = useState([0, 0])
  const [path, setPath] = useState([])
  const [startTime, setStartTime] = useState(null)
  const [score, setScore] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [shortestPath, setShortestPath] = useState([])
  const [remainingSeconds, setRemainingSeconds] = useState(300)
  const canvasRef = useRef(null)

  // when level changes → reset maze + timer
  useEffect(() => {
    if (level < 3) {
      const newMaze = generateMaze(level)
      setMaze(newMaze)
      setPlayerPos(newMaze.start)
      setPath([])
      setStartTime(Date.now())
      setGameComplete(false)
      setRemainingSeconds(300)
      calculateShortestPath(newMaze)
    }
  }, [level])

  // countdown timer (5 mins per level)
  useEffect(() => {
    if (!maze || gameComplete) return
    const intervalId = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId)
          setGameComplete(true)
          setTimeout(() => handleNextLevel(), 200)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalId)
  }, [maze, gameComplete])

  // just BFS to get shortest path (for scoring)
  const calculateShortestPath = (mazeData) => {
    const { width, height, walls, start, end } = mazeData
    const visited = new Set()
    const queue = [[start, [start]]]
    
    while (queue.length > 0) {
      const [[x, y], currentPath] = queue.shift()
      const key = `${x},${y}`
      
      if (visited.has(key)) continue
      visited.add(key)
      
      if (x === end[0] && y === end[1]) {
        setShortestPath(currentPath)
        return
      }
      
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]
      for (const [dx, dy] of directions) {
        const nx = x + dx
        const ny = y + dy
        
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
        if (visited.has(`${nx},${ny}`)) continue
        if (!isValidMove(mazeData, x, y, nx, ny)) continue
        
        queue.push([[nx, ny], [...currentPath, [nx, ny]]])
      }
    }
  }

  // check if there’s a wall blocking the move
  const isValidMove = (mazeData, fromX, fromY, toX, toY) => {
    const { walls } = mazeData
    
    for (const wall of walls) {
      const [wx1, wy1, wx2, wy2] = wall
      
      // vertical wall
      if (wx1 === wx2) {
        const wallX = wx1
        if ((fromX < wallX && toX >= wallX) || (fromX >= wallX && toX < wallX)) {
          const minY = Math.min(wy1, wy2)
          const maxY = Math.max(wy1, wy2)
          if (fromY >= minY && fromY < maxY) return false
        }
      }
      
      // horizontal wall
      if (wy1 === wy2) {
        const wallY = wy1
        if ((fromY < wallY && toY >= wallY) || (fromY >= wallY && toY < wallY)) {
          const minX = Math.min(wx1, wx2)
          const maxX = Math.max(wx1, wx2)
          if (fromX >= minX && fromX < maxX) return false
        }
      }
    }
    
    return true
  }

  // handle player movement (arrow keys)
  const handleKeyPress = (e) => {
    if (gameComplete || !maze) return
    
    const [x, y] = playerPos
    let newX = x
    let newY = y
    
    if (e.key === 'ArrowUp') newY -= 1
    else if (e.key === 'ArrowDown') newY += 1
    else if (e.key === 'ArrowLeft') newX -= 1
    else if (e.key === 'ArrowRight') newX += 1
    else return
    
    if (newX < 0 || newX >= maze.width || newY < 0 || newY >= maze.height) return
    if (!isValidMove(maze, x, y, newX, newY)) return
    
    const newPos = [newX, newY]
    setPlayerPos(newPos)
    setPath([...path, newPos])
    
    // reached the end
    if (newX === maze.end[0] && newY === maze.end[1]) {
      const elapsed = (Date.now() - startTime) / 1000
      const pathLength = path.length + 1
      const optimalLength = shortestPath.length
      
      // simple scoring logic
      const pathBonus = Math.max(0, (optimalLength / pathLength) * 100)
      const timeBonus = Math.max(0, 100 - elapsed)
      const levelBonus = (level + 1) * 50
      
      const levelScore = Math.round(pathBonus + timeBonus + levelBonus)
      setScore(score + levelScore)
      setGameComplete(true)
    }
  }

  // key listener for movement
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [playerPos, path, gameComplete, maze, startTime, score, level, shortestPath])

  // draw everything on canvas
  useEffect(() => {
    if (!maze) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const width = maze.width * CELL_SIZE
    const height = maze.height * CELL_SIZE
    
    canvas.width = width
    canvas.height = height
    
    // background
    ctx.fillStyle = '#10b981'
    ctx.fillRect(0, 0, width, height)
    
    // draw walls
    ctx.strokeStyle = '#000'
    ctx.lineWidth = WALL_THICKNESS
    maze.walls.forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath()
      if (x1 === x2) {
        ctx.moveTo(x1 * CELL_SIZE, y1 * CELL_SIZE)
        ctx.lineTo(x2 * CELL_SIZE, y2 * CELL_SIZE)
      } else {
        ctx.moveTo(x1 * CELL_SIZE, y1 * CELL_SIZE)
        ctx.lineTo(x2 * CELL_SIZE, y2 * CELL_SIZE)
      }
      ctx.stroke()
    })
    
    // draw player path
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2
    if (path.length > 0) {
      ctx.beginPath()
      ctx.moveTo(maze.start[0] * CELL_SIZE + CELL_SIZE / 2, maze.start[1] * CELL_SIZE + CELL_SIZE / 2)
      path.forEach(([x, y]) => {
        ctx.lineTo(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2)
      })
      ctx.stroke()
    }
    
    // draw end (blue circle)
    const [endX, endY] = maze.end
    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(endX * CELL_SIZE + CELL_SIZE / 2, endY * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2)
    ctx.fill()
    
    // draw player (orange triangle)
    const [playerX, playerY] = playerPos
    ctx.fillStyle = '#f97316'
    ctx.beginPath()
    ctx.moveTo(playerX * CELL_SIZE + CELL_SIZE / 2, playerY * CELL_SIZE + CELL_SIZE / 4)
    ctx.lineTo(playerX * CELL_SIZE + CELL_SIZE / 4, playerY * CELL_SIZE + CELL_SIZE * 3 / 4)
    ctx.lineTo(playerX * CELL_SIZE + CELL_SIZE * 3 / 4, playerY * CELL_SIZE + CELL_SIZE * 3 / 4)
    ctx.closePath()
    ctx.fill()
  }, [maze, playerPos, path])

  const handleNextLevel = () => {
    if (level < 2) {
      setLevel(level + 1)
    } else {
      alert(`You did it! Final Score: ${score}`)
      onBack()
    }
  }

  if (!maze) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            ← Back
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Maze / Spaceship Puzzle</h1>
            <p className="text-gray-600">Level {level + 1} of 3 | Score: {score}</p>
            <p className="text-gray-700 mt-1">
              Time left: {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}
            </p>
          </div>
          <div className="w-24"></div>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6 mb-4">
          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              className="border-4 border-blue-500 rounded-lg"
              style={{ display: 'block' }}
            />
          </div>
          
          {gameComplete && (
            <div className="mt-4 p-4 bg-green-100 rounded-lg text-center">
              <p className="text-xl font-bold text-green-800">Level Complete!</p>
              <p className="text-gray-700">Your path: {path.length + 1} | Optimal: {shortestPath.length}</p>
              <p className="text-gray-700">Time: {((Date.now() - startTime) / 1000).toFixed(2)}s</p>
              <button
                onClick={handleNextLevel}
                className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                {level < 2 ? 'Next Level' : 'Finish'}
              </button>
            </div>
          )}
          
          <div className="mt-4 text-center text-gray-600">
            <p>Use arrow keys to move the ship. Reach the blue circle!</p>
            <p className="text-sm mt-2">Shorter paths + faster time = more points 🚀</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MazeGame
