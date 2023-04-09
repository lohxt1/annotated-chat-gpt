import { useEffect, useRef, useState } from "react";
import { useHistoryStore } from "stores/history";
import { useKeyStore } from "stores/key";
import { ChatBlock, type ChatGPTMessage, LoadingChatLine } from "./chatLine";

const InputMessage = ({ input, setInput, sendMessage }: any) => (
  <div className="clear-both mt-6 flex w-full">
    <input
      type="text"
      aria-label="chat input"
      required
      placeholder="Send a message..."
      className="ml-2 min-w-0 flex-auto appearance-none border border-gray-200 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:outline-none dark:border-gray-900 dark:border-gray-900 dark:bg-black sm:text-sm"
      value={input}
      onKeyDown={(e) => {
        if (e.key === "Enter" && input.length > 0) {
          sendMessage(input);
          setInput("");
        }
      }}
      onChange={(e) => {
        setInput(e.target.value);
      }}
    />
    <button
      type="submit"
      className="mx-2 flex-none"
      disabled={input.length <= 0}
      onClick={() => {
        if (input.length <= 0) return;
        sendMessage(input);
        setInput("");
      }}
    >
      →
    </button>
    <button
      type="submit"
      className="mx-2 flex-none"
      onClick={() => {
        // resendMessage(input);
        // setInput("");
      }}
    >
      ↻
    </button>
  </div>
);

export function Chat() {
  // const [messages, setMessages] = useState<ChatGPTMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { apikey } = useKeyStore();
  const { currentChatId, setCurrentChatId, messages, setHistory, history } =
    useHistoryStore();

  useEffect(() => {
    // Initiate new chat
    setCurrentChatId();
  }, []);

  // send message to API /api/chat endpoint
  const sendMessage = async (message: string, index: number) => {
    setLoading(true);
    let _index = index >= 0 ? index : 1000;
    const newMessages = [
      ...messages.slice(0, _index + 1),
      { role: "user", content: message } as ChatGPTMessage,
    ];
    setHistory(newMessages);
    const last10messages = newMessages.slice(-10); // remember last 10 messages

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: last10messages,
        apikey,
      }),
    });

    console.log("Edge function returned.");

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    let lastMessage = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      lastMessage = lastMessage + chunkValue;

      let _messages = [
        ...newMessages,
        { role: "assistant", content: lastMessage } as ChatGPTMessage,
      ];

      // setMessages(_messages);
      setHistory(_messages);

      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-full max-w-full flex-1 flex-col items-center justify-center">
      <div className="relative h-full w-full max-w-[700px]">
        <div className="relative h-full overflow-scroll">
          {messages.map(({ content, role }, index) => (
            <ChatBlock
              key={index}
              role={role}
              content={content}
              sendMessage={sendMessage}
              index={index}
            />
          ))}
          {loading && <LoadingChatLine />}
          {messages.length < 1 && (
            <div className="justify-content align-center clear-both m-auto flex h-[calc(100%_-_6.5rem)] w-full flex-grow items-center justify-center text-gray-300 dark:text-gray-700">
              Type a message to start the conversation
            </div>
          )}
          <div className="h-18 relative flex w-full md:h-24"></div>
          <ScrollToBlock loading={loading} messages={messages} />
        </div>
        <div className="align-center h-18 absolute bottom-0 left-0 flex w-full items-center justify-center border-t border-gray-100 bg-white pt-2 dark:border-gray-900 dark:bg-black md:h-24">
          <InputMessage
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
          />
        </div>
      </div>
    </div>
  );
}

const ScrollToBlock = (props) => {
  const { loading, messages } = props;
  const ref = useRef();

  useEffect(() => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  }, [loading, messages]);

  return <div className="relative flex h-[1px] w-full" ref={ref}></div>;
};
