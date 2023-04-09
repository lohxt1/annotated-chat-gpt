import { useEffect, useRef, useState } from "react";

const Feedback = (props) => {
  const { feedbackOutput } = props;
  const textareaRef = useRef<HTMLTextAreaElement>();
  const [textareaHeight, setTextareaHeight] = useState(0);

  useEffect(() => {
    if (textareaRef?.current?.scrollHeight) {
      setTextareaHeight(textareaRef.current.scrollHeight);
    }
  }, [feedbackOutput]);

  return (
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
  );
};

export default Feedback;
