import { useState, useEffect } from 'react'

// Generate grid configurations for 3 difficulty levels
const generateGrid = (level) => {
  const grids = [
    // Level 1: 4x4 grid, easier
    {
      size: 4,
      start: [0, 0],
      key: [3, 2],
      validCells: [
        [0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [3, 2]
      ]
    },
    // Level 2: 5x5 grid, medium
    {
      size: 5,
      start: [0, 0],
      key: [4, 4],
      validCells: [
        [0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3], [3, 3], [3, 4], [4, 4]
      ]
    },
    // Level 3: 6x6 grid, hard
    {
      size: 6,
      start: [0, 0],
      key: [5, 5],
      validCells: [
        [0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 1], [3, 1], [3, 2], [3, 3],
        [4, 3], [4, 4], [5, 4], [5, 5]
      ]
    }
  ]
  return grids[level]
}

const KeyGame = ({ onBack }) => {
  const [level, setLevel] = useState(0)
  const [grid, setGrid] = useState(null)
  const [playerPos, setPlayerPos] = useState([0, 0])
  const [revealedCells, setRevealedCells] = useState({})
  const [score, setScore] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(60)

  useEffect(() => {
    if (level < 3) {
      const newGrid = generateGrid(level)
      setGrid(newGrid)
      setPlayerPos(newGrid.start)
      setRevealedCells({})
      setGameComplete(false)
      setAttempts(0)
      setRemainingSeconds(60)
    }
  }, [level])

  // Countdown timer per level (1 minute)
  useEffect(() => {
    if (!grid || gameComplete) return
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
  }, [grid, gameComplete])

  const isCellValid = (x, y) => {
    if (!grid) return false
    return grid.validCells.some(([vx, vy]) => vx === x && vy === y)
  }

  const handleCellClick = (x, y) => {
    if (gameComplete || !grid) return
    
    // Check if cell is adjacent to current position
    const [px, py] = playerPos
    const dx = Math.abs(x - px)
    const dy = Math.abs(y - py)
    
    if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) return
    
    setAttempts(attempts + 1)
    
    const isValid = isCellValid(x, y)
    const cellKey = `${x},${y}`
    
    setRevealedCells({
      ...revealedCells,
      [cellKey]: isValid
    })
    
    if (isValid) {
      setPlayerPos([x, y])
      
      // so we are checking  if reached key
      if (x === grid.key[0] && y === grid.key[1]) {
        const levelScore = Math.max(0, 500 - attempts * 10) * (level + 1)
        setScore(score + levelScore)
        setGameComplete(true)
      }
    } else {
      // Invalid cell - reset all progress. clear revealed cells and reset position
      setTimeout(() => {
        setRevealedCells({})
        setPlayerPos(grid.start)
      }, 500)
    }
  }

  const getCellColor = (x, y) => {
    const cellKey = `${x},${y}`
    const revealed = cellKey in revealedCells
    
    if (revealed) {
      return revealedCells[cellKey] ? 'bg-green-500' : 'bg-red-500'
    }
    
    const [px, py] = playerPos
    if (x === px && y === py) {
      return 'bg-orange-400'
    }
    
    if (x === grid.key[0] && y === grid.key[1] && gameComplete) {
      return 'bg-yellow-400'
    }
    
    return 'bg-gray-200 hover:bg-gray-300'
  }

  const handleNextLevel = () => {
    if (level < 2) {
      setLevel(level + 1)
    } else {
      alert(`Congratulations! You completed all levels! Total Score: ${score}`)
      onBack()
    }
  }

  if (!grid) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            ← Back
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Door & Key Puzzle</h1>
            <p className="text-gray-600">Level {level + 1} of 3 | Score: {score} | Attempts: {attempts}</p>
            <p className="text-gray-700 mt-1">Time left: {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}</p>
          </div>
          <div className="w-24"></div>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6 mb-4">
          <div className="flex flex-col items-center mb-4">
            <div
              className="grid gap-1 border-4 border-blue-500 rounded-lg p-2 bg-white"
              style={{
                gridTemplateColumns: `repeat(${grid.size}, minmax(0, 1fr))`,
                width: `${grid.size * 70}px`
              }}
            >
              {Array.from({ length: grid.size * grid.size }).map((_, idx) => {
                const x = idx % grid.size
                const y = Math.floor(idx / grid.size)
                const [px, py] = playerPos
                const isPlayer = x === px && y === py
                const isKey = x === grid.key[0] && y === grid.key[1]
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleCellClick(x, y)}
                    disabled={gameComplete}
                    className={`
                      ${getCellColor(x, y)}
                      w-16 h-16 rounded transition-all duration-200
                      flex items-center justify-center text-2xl
                      ${!gameComplete && !isPlayer ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                      border-2 border-gray-400
                    `}
                  >
                    {isPlayer && '🧑'}
                    {isKey && gameComplete && '🗝️'}
                    {isKey && !gameComplete && !isPlayer && '?'}
                  </button>
                )
              })}
            </div>
          </div>

          {gameComplete && (
            <div className="mt-4 p-4 bg-green-100 rounded-lg text-center">
              <p className="text-xl font-bold text-green-800">Level Complete!</p>
              <p className="text-gray-700">Attempts: {attempts}</p>
              <button
                onClick={handleNextLevel}
                className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                {level < 2 ? 'Next Level' : 'Finish'}
              </button>
            </div>
          )}

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-400 rounded border-2 border-gray-400"></div>
                <span>You</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded border-2 border-gray-400"></div>
                <span>Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500 rounded border-2 border-gray-400"></div>
                <span>Danger</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded border-2 border-gray-400"></div>
                <span>Unknown</span>
              </div>
            </div>
            <p className="text-center text-gray-600 text-sm mt-4">
              Click adjacent cells to move. Remember which paths are safe (green) and dangerous (red)!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KeyGame
