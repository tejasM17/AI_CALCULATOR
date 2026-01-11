import { useAppContext } from '../../context/AppContext';

const CalcHistory = () => {
  const { calcHistory, loading, error, refreshHistory } = useAppContext();

  if (loading) return <div className="p-6 text-center text-gray-500">Loading calculations...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="px-4 py-2">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
        Calculations
      </h3>

      {calcHistory.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No calculations yet</p>
      ) : (
        <ul className="space-y-2">
          {calcHistory.map((item) => (
            <li
              key={item._id}
              className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => {
                console.log('Selected calc:', item);
              }}
            >
              <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                {item.title || 'Untitled Calculation'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {item.query?.slice(0, 40)}...
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {new Date(item.timestamp).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={refreshHistory}
        className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        Refresh
      </button>
    </div>
  );
};

export default CalcHistory;