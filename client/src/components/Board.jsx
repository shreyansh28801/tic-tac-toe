function Board({ board, onCellClick, disabled, winningLine = null }) {
  const isWinningCell = (index) => {
    return winningLine && winningLine.includes(index);
  };

  return (
    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
      {board.map((cell, index) => (
        <button
          key={index}
          onClick={() => !cell && !disabled && onCellClick(index)}
          disabled={disabled || cell !== null}
          className={`
            game-cell aspect-square
            ${isWinningCell(index) ? 'winning-cell' : ''}
            ${cell === 'X' ? 'text-purple-400' : cell === 'O' ? 'text-pink-400' : ''}
          `}
        >
          {cell === 'X' && (
            <span className="animate-bounce-slow">✕</span>
          )}
          {cell === 'O' && (
            <span className="animate-bounce-slow">◯</span>
          )}
        </button>
      ))}
    </div>
  );
}

export default Board;

