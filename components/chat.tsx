import { useEffect, useRef, useState } from "react";
import Annotator from "modules/annotator";
import { type ChatGPTMessage, ChatLine, LoadingChatLine } from "./chatLine";

// default first message to display in UI (not necessary to define the prompt)
export const initialMessages: ChatGPTMessage[] = [
  // {
  //   role: "assistant",
  //   content: "Hi! I am a friendly AI assistant. Ask me anything!",
  // },
];

const InputMessage = ({ input, setInput, sendMessage }: any) => (
  <div className="clear-both mt-6 flex w-full">
    <input
      type="text"
      aria-label="chat input"
      required
      className="ml-2 min-w-0 flex-auto appearance-none border border-gray-100 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:outline-none dark:border-gray-900 dark:bg-black sm:text-sm"
      value={input}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
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
      onClick={() => {
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
  const [messages, setMessages] = useState<ChatGPTMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [feedbackOutput, setFeedbackOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef();

  const textareaRef = useRef<HTMLTextAreaElement>();
  const [textareaHeight, setTextareaHeight] = useState(0);

  useEffect(() => {
    if (textareaRef?.current?.scrollHeight) {
      setTextareaHeight(textareaRef.current.scrollHeight);
    }
  }, [feedbackOutput]);

  useEffect(() => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  }, [loading, messages]);

  // send message to API /api/chat endpoint
  const sendMessage = async (message: string) => {
    setLoading(true);
    const newMessages = [
      ...messages,
      { role: "user", content: message } as ChatGPTMessage,
    ];
    setMessages(newMessages);
    const last10messages = newMessages.slice(-10); // remember last 10 messages

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: last10messages,
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

      setMessages([
        ...newMessages,
        { role: "assistant", content: lastMessage } as ChatGPTMessage,
      ]);

      setLoading(false);
    }
  };

  let latestOutput =
    messages.length > 1 && messages.slice(-1)?.[0]?.role == "assistant"
      ? messages.slice(-1)?.[0]?.content
      : null;

  let _messages = latestOutput ? messages.slice(0, -1) : messages;

  console.log(feedbackOutput);

  return (
    <div className="relative  h-screen w-full max-w-[700px] border-gray-100 dark:border-gray-900 lg:border">
      <div className="relative h-full overflow-scroll">
        {_messages.map(({ content, role }, index) => (
          <ChatLine key={index} role={role} content={content} />
        ))}
        {loading && <LoadingChatLine />}
        {_messages.length < 1 && (
          <div className="justify-content align-center clear-both m-auto flex h-[calc(100%_-_6.5rem)] w-full flex-grow items-center justify-center text-gray-300 dark:text-gray-700">
            Type a message to start the conversation
          </div>
        )}
        {latestOutput && (
          <Annotator
            input={latestOutput}
            setOutput={(v) => {
              setFeedbackOutput(v);
            }}
          />
        )}
        {feedbackOutput && feedbackOutput.length > 0 ? (
          <div className="mt-2 flex h-fit w-full flex-col border-t border-gray-100 p-4 dark:border-gray-900">
            <>
              <div className="flex flex-row text-xs">
                <label className="mr-1 text-slate-300 underline decoration-dashed dark:text-slate-500">
                  Feedback Prompt
                </label>
              </div>
              <textarea
                ref={textareaRef}
                style={{
                  height: textareaHeight ? `${textareaHeight}px` : "auto",
                }}
                className="mt-4 h-auto w-full border border-gray-500 bg-transparent p-2"
                // value={JSON.stringify(feedbackOutput, null, 4)}
                value={feedbackOutput}
              />
            </>
          </div>
        ) : null}
        <div className="h-18 relative flex w-full md:h-24"></div>
        <div className="relative flex h-[1px] w-full" ref={ref}></div>
      </div>
      <div className="align-center h-18 absolute bottom-0 left-0 flex w-full items-center justify-center border-t border-gray-100 bg-white pt-2 dark:border-gray-900 dark:bg-black md:h-24">
        <InputMessage
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
}
