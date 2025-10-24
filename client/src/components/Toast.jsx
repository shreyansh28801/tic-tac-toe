function Toast({ message, type = 'info' }) {
  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-bounce-slow">
      <div className={`${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3`}>
        <span className="text-xl">{icons[type]}</span>
        <span className="font-semibold">{message}</span>
      </div>
    </div>
  );
}

export default Toast;

