import { cn } from "@/utils/tailwind";

type ChatGPTAgent = "user" | "system" | "assistant";

export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}

// loading placeholder animation for the chat line
export const LoadingChatLine = () => (
  <div
    className={
      "relative float-left clear-both w-full animate-pulse border-b border-gray-100 px-2 dark:border-gray-900"
    }
  >
    <div className="mb-5 flex w-full flex-row flex-wrap py-2">
      <div className="flex w-full flex-row">
        <p className="font-large text-xxl mr-2 text-gray-900 dark:text-gray-100">
          <div className="align-center flex h-6 w-6 items-center justify-center rounded-sm border border-gray-300 text-center text-xs">
            AI
          </div>
        </p>
        <div className="w-full space-y-4 pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 h-2 rounded bg-zinc-500"></div>
            <div className="col-span-1 h-2 rounded bg-zinc-500"></div>
          </div>
          <div className="h-2 rounded bg-zinc-500"></div>
        </div>
      </div>
    </div>
  </div>
);

// util helper to convert new lines to <br /> tags
const convertNewLines = (text: string) =>
  text.split("\n").map((line, i) => (
    <span key={i}>
      {line}
      <br />
    </span>
  ));

export function ChatLine({ role = "assistant", content }: ChatGPTMessage) {
  if (!content) {
    return null;
  }
  const formatteMessage = convertNewLines(content);

  return (
    <div
      className={cn(
        "relative float-left clear-both w-full border-b border-gray-100 px-2 pt-2 dark:border-gray-900",
        role == "assistant" ? "bg-[#00000004] dark:bg-[#ffffff04]" : "",
      )}
    >
      <div className="mb-5 flex flex-row flex-wrap py-2">
        <div className="flex flex-row">
          <p className="font-large text-xxl mr-2 text-gray-900 dark:text-gray-100">
            <div className="align-center flex h-6 w-6 items-center justify-center rounded-sm border border-gray-300 text-center text-xs">
              {role == "assistant" ? "AI" : ":D"}
            </div>
          </p>
          <p
            className={cn(
              "leading-8",
              role == "assistant" ? "" : "text-gray-500",
            )}
          >
            {formatteMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
