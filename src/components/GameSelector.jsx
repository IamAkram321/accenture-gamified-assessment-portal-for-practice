const GameSelector = ({ onSelectGame }) => {
  const games = [
    {
      id: 'maze',
      name: 'Maze / Spaceship Puzzle',
      description: 'Navigate from start to spaceship using the shortest path. Faster completion = more points!',
      icon: '🚀',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'key',
      name: 'Door & Key Puzzle',
      description: 'Squid Game style! Find the key by remembering which paths are safe. Only one correct path exists.',
      icon: '🗝️',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'bubble',
      name: 'Select Bubbles',
      description: 'Select arithmetic bubbles in ascending order of their results. Think carefully!',
      icon: '💭',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-5xl font-bold text-center mb-4 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Gamified Assessment Portal
        </h1>
        <p className="text-center text-gray-600 mb-12 text-lg">
          Practice these games to prepare for your accenture assessment
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={`${game.color} text-white rounded-xl p-8 shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl flex flex-col items-center space-y-4 cursor-pointer`}
            >
              <div className="text-6xl">{game.icon}</div>
              <h2 className="text-2xl font-bold">{game.name}</h2>
              <p className="text-sm text-white/90 text-center">{game.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Each game consists of 3 levels with increasing difficulty</p>
        </div>
      </div>
    </div>
  )
}

export default GameSelector
