import { useState, useEffect } from 'react'

const calculateValue = (expression) => {
  const parts = expression.split(' ')
  const num1 = parseFloat(parts[0])
  const operator = parts[1]
  const num2 = parseFloat(parts[2])
  
  switch (operator) {
    case '+': return num1 + num2
    case '-': return num1 - num2
    case '*': return num1 * num2
    case '/': return num1 / num2
    default: return 0
  }
}

const generateBubbles = (level) => {
  const bubbleData = [
    // Level 1: Simple integers, 3 bubbles
    [
      { id: 0, expression: '15 - 11' },
      { id: 1, expression: '15 / 5' },
      { id: 2, expression: '2 * 1' }
    ],
    // Level 2: Mixed operations, 4 bubbles, some fractions
    [
      { id: 0, expression: '10 / 4' },
      { id: 1, expression: '7 - 5' },
      { id: 2, expression: '3 * 3' },
      { id: 3, expression: '1 + 1' }
    ],
    // Level 3: More complex, 5 bubbles, more fractions
    [
      { id: 0, expression: '8 / 3' },
      { id: 1, expression: '12 / 5' },
      { id: 2, expression: '5 - 2' },
      { id: 3, expression: '2 * 2' },
      { id: 4, expression: '9 / 4' }
    ]
  ]
  
  // here calculating values and create bubbles
  const bubbles = bubbleData[level].map(bubble => ({
    ...bubble,
    value: calculateValue(bubble.expression)
  }))
  
  // Shuffling the bubbles
  const shuffled = [...bubbles]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

const BubbleGame = ({ onBack }) => {
  const [level, setLevel] = useState(0)
  const [bubbles, setBubbles] = useState([])
  const [selectedOrder, setSelectedOrder] = useState([])
  const [score, setScore] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [result, setResult] = useState(null)
  const [remainingSeconds, setRemainingSeconds] = useState(60)

  useEffect(() => {
    if (level < 3) {
      const newBubbles = generateBubbles(level)
      setBubbles(newBubbles)
      setSelectedOrder([])
      setGameComplete(false)
      setStartTime(Date.now())
      setResult(null)
      setRemainingSeconds(60)
    }
  }, [level])

  // countdown timer per level (1 minute)
  useEffect(() => {
    if (gameComplete || !bubbles.length) return
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
  }, [bubbles, gameComplete])

  const handleBubbleClick = (bubbleId) => {
    if (gameComplete) return
    
    if (selectedOrder.includes(bubbleId)) {
      // Deselect if already selected
      setSelectedOrder(selectedOrder.filter(id => id !== bubbleId))
    } else {
      // Add to selection
      setSelectedOrder([...selectedOrder, bubbleId])
    }
  }

  const handleSubmit = () => {
    if (selectedOrder.length !== bubbles.length) {
      alert('Please select all bubbles!')
      return
    }

    // Check if order is correct ascending by value
    const isCorrect = selectedOrder.every((id, index) => {
      if (index === 0) return true
      const prevBubble = bubbles.find(b => b.id === selectedOrder[index - 1])
      const currBubble = bubbles.find(b => b.id === id)
      return currBubble.value >= prevBubble.value
    })

    const elapsed = (Date.now() - startTime) / 1000
    const timeBonus = Math.max(0, 200 - elapsed)
    const levelBonus = (level + 1) * 100

    if (isCorrect) {
      const levelScore = Math.round(timeBonus + levelBonus)
      setScore(score + levelScore)
      setGameComplete(true)
      setResult('correct')
    } else {
      setResult('incorrect')
      setTimeout(() => {
        setResult(null)
        setSelectedOrder([])
      }, 2000)
    }
  }

  const handleReset = () => {
    setSelectedOrder([])
    setResult(null)
  }

  const handleNextLevel = () => {
    if (level < 2) {
      setLevel(level + 1)
    } else {
      alert(`Congratulations! You completed all levels! Total Score: ${score}`)
      onBack()
    }
  }

  const getBubblePosition = (index, total) => {
    const bubbleSize = 96
    const containerWidth = 536
    const containerHeight = 400
    
    if (total === 3) {
      const positions = [
        { top: 50, left: 50 },
        { top: 200, left: 220 }, 
        { top: 50, left: 390 }
      ]
      return positions[index] || { top: 50, left: 220 }
    } else if (total === 4) {
      const positions = [
        { top: 50, left: 50 },
        { top: 50, left: 280 },
        { top: 200, left: 165 },
        { top: 200, left: 395 }
      ]
      return positions[index] || { top: 50, left: 220 }
    } else if (total === 5) {
      const positions = [
        { top: 30, left: 50 },
        { top: 30, left: 290 },
        { top: 150, left: 20 },
        { top: 150, left: 440 },
        { top: 270, left: 220 } 
      ]
      return positions[index] || { top: 50, left: 220 }
    }
    
    return { top: 50, left: 220 }
  }

  if (!bubbles.length) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            ← Back
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Select Bubbles</h1>
            <p className="text-gray-600">Level {level + 1} of 3 | Score: {score}</p>
            <p className="text-gray-700 mt-1">Time left: {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}</p>
          </div>
          <div className="w-24"></div>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6 mb-4">
          <div className="relative border-4 border-blue-500 rounded-xl p-8 min-h-[400px] bg-white" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            {bubbles.map((bubble, index) => {
              const isSelected = selectedOrder.includes(bubble.id)
              const selectedIndex = selectedOrder.indexOf(bubble.id)
              const position = getBubblePosition(index, bubbles.length)
              
              return (
                <button
                  key={bubble.id}
                  onClick={() => handleBubbleClick(bubble.id)}
                  disabled={gameComplete}
                  className={`
                    absolute w-24 h-24 rounded-full border-4 transition-all duration-200
                    ${isSelected 
                      ? 'bg-yellow-300 border-yellow-500 scale-110 shadow-lg' 
                      : 'bg-white border-gray-400 hover:scale-105 hover:shadow-md'
                    }
                    flex flex-col items-center justify-center cursor-pointer
                    ${gameComplete && result === 'correct' && isSelected ? 'bg-green-300 border-green-500' : ''}
                    ${result === 'incorrect' && isSelected ? 'bg-red-300 border-red-500 animate-pulse' : ''}
                  `}
                  style={{
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                    transform: isSelected ? 'scale(110%)' : 'scale(100%)'
                  }}
                >
                  <span className="text-lg font-bold text-gray-800">{bubble.expression}</span>
                  {isSelected && (
                    <span className="text-sm font-bold text-blue-600 mt-1">
                      #{selectedIndex + 1}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex justify-center gap-4">
            {!gameComplete ? (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={selectedOrder.length !== bubbles.length}
                  className={`
                    px-6 py-3 rounded-lg font-bold text-white transition
                    ${selectedOrder.length === bubbles.length
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-300 cursor-not-allowed'
                    }
                  `}
                >
                  Submit Order
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-lg font-bold bg-gray-400 text-white hover:bg-gray-500 transition"
                >
                  Reset
                </button>
              </>
            ) : (
              <div className="text-center w-full">
                <p className="text-xl font-bold text-green-800 mb-4">Level Complete!</p>
                <div className="mb-4">
                  <p className="text-gray-700 mb-2">Correct order:</p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {selectedOrder.map((id, idx) => {
                      const bubble = bubbles.find(b => b.id === id)
                      return (
                        <span
                          key={id}
                          className="px-3 py-1 bg-green-200 rounded-full text-sm font-semibold"
                        >
                          {idx + 1}. {bubble.expression} = {bubble.value % 1 === 0 ? bubble.value : bubble.value.toFixed(2)}
                        </span>
                      )
                    })}
                  </div>
                </div>
                <button
                  onClick={handleNextLevel}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-bold"
                >
                  {level < 2 ? 'Next Level' : 'Finish'}
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 text-center text-gray-600">
            <p>Select bubbles in ascending order of their results (smallest to largest).</p>
            <p className="text-sm mt-2">
              Click bubbles to select them. The number shows your selection order.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BubbleGame
