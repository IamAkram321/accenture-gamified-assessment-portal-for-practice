import { useState } from 'react'
import GameSelector from './components/GameSelector'
import MazeGame from './components/games/MazeGame'
import KeyGame from './components/games/KeyGame'
import BubbleGame from './components/games/BubbleGame'

function App() {
  const [currentGame, setCurrentGame] = useState(null)

  if (currentGame === 'maze') {
    return <MazeGame onBack={() => setCurrentGame(null)} />
  }
  if (currentGame === 'key') {
    return <KeyGame onBack={() => setCurrentGame(null)} />
  }
  if (currentGame === 'bubble') {
    return <BubbleGame onBack={() => setCurrentGame(null)} />
  }

  return <GameSelector onSelectGame={setCurrentGame} />
}

export default App
