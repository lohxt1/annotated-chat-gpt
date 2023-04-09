import { useHistoryStore } from "stores/history";

const History = (props) => {
  const { history, setCurrentChatId } = useHistoryStore();

  const _handleClick = (id) => (e) => {
    setCurrentChatId(id);
  };

  const _handleNew = (e) => {
    setCurrentChatId();
  };

  return (
    <div className="flex h-full w-full flex-col border-r border-gray-100 dark:border-gray-900 md:w-[250px]">
      <div className="flex cursor-pointer justify-between border-b border-gray-100 py-4 px-2 text-gray-300 dark:border-gray-900">
        <label className="underline decoration-dashed">History</label>
        <label
          className="align-center flex cursor-pointer items-center border border-gray-500 px-1 text-xs"
          onClick={_handleNew}
        >
          New +
        </label>
      </div>
      {Object.keys(history).map((h) => (
        <div
          className="cursor-pointer border-b border-gray-100 py-2 px-2 text-sm dark:border-gray-900"
          onClick={_handleClick(h)}
        >
          {history[h][0]?.content}
        </div>
      ))}
    </div>
  );
};

export default History;
