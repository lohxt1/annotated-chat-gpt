import { useEffect, useRef } from "react";
import useKeypress from "@/hooks/useKeypress";
import useMouseStatus from "@/hooks/useMouseStatus";
import { useFeedbackStore } from "@/modules/annotator/stores/feedback";
import { useSelectionStore } from "@/modules/annotator/stores/selection";
import { cn } from "@/utils/tailwind";

// Component that divides the input text in a set of seperate react component blocks.
// The text is broken down into blocks based on a regex that matches for spaces and special characters.
const Blocks = ({ input: text }) => {
  // Regex expression for splitting text matching word boundaries and whitespaces.
  //   const blocks = text.split(/(\b|\s)/).filter((_) => _.length > 0);

  // Split blocks by spaces
  const blocks = text
    .replace(/[\n\t\r]/g, " ")
    // .replace(/[\t]/g, " ")
    // .replace(/[\r]/g, " ")
    .split(" ")
    .filter((_) => _.length > 0);

  return (
    <>
      <div className="ml-4 mt-4 flex flex-row text-xs">
        <label className="mr-1 text-slate-300 underline decoration-dashed dark:text-slate-500">
          Select the text to start tagging
        </label>
        <label className="underline"></label>
      </div>
      <div className="align-start mb-4 flex select-none flex-wrap content-start items-start justify-start px-4 leading-8">
        {blocks.map((block, idx) => (
          <Block block={block} idx={idx} />
        ))}
      </div>
      <AddAnnotation text={text} />
    </>
  );
};

export default Blocks;

const Block = ({ block, idx }: { block: string; idx: number }) => {
  const ref = useRef();

  const { isMouseDown: isWindowMouseDown } = useMouseStatus({ ref: window });
  const { isMouseOver, isMouseDown } = useMouseStatus({ ref });
  const isShiftKeyPressed = useKeypress("Shift");

  const {
    setBlockStartIdx,
    blockStartIdx,
    setBlockMovingIdx,
    blockMovingIdx,
    indices,
  } = useSelectionStore();

  const { tag } = useFeedbackStore();

  useEffect(() => {
    if (isWindowMouseDown && isMouseDown) {
      setBlockStartIdx(idx);
      setBlockMovingIdx(idx);
    }
  }, [isMouseDown, isWindowMouseDown, isMouseOver]);

  useEffect(() => {
    if (isWindowMouseDown && isMouseOver && blockStartIdx >= 0) {
      setBlockMovingIdx(idx + 1);
    }
  }, [isMouseOver, isWindowMouseDown, blockStartIdx]);

  const selected = indices.includes(idx);

  const highlight = idx > blockStartIdx && idx < blockMovingIdx;

  const convertNewLines = (text: string) =>
    text.split("\n").map((line, i) => (
      <>
        {/* {line === " " ? "\u00A0" : line} */}
        {line}
        <br />
      </>
    ));

  const _block = convertNewLines(block);

  return (
    <span
      className={cn(
        "relative",
        "pr-1",
        // "rounded-sm border border-dashed border-[#0003] dark:border-[#fff3]",
        // selected || highlight
        //   ? "bg-black text-white dark:bg-white dark:text-black"
        //   : "",
        // highlight ? "underline decoration-dashed" : "",
      )}
      style={{ background: selected || highlight ? tag?.color : "transparent" }}
    >
      <span className="absolute top-0 left-0 h-full w-full" ref={ref}></span>
      <span></span>
      {block === " " ? "\u00A0" : block}
    </span>
  );
};

const AddAnnotation = ({ text }) => {
  const { tag } = useFeedbackStore();
  const { indices, resetSelection } = useSelectionStore();
  const { addAnnotation } = useFeedbackStore();
  const _handleClick = (e) => {
    addAnnotation({
      text,
      tag,
      indices,
    });
    resetSelection();
  };

  return (
    <div className="flex flex-row">
      <button
        className="mx-4 my-4 mr-2 w-fit rounded-sm border border-slate-500 px-2 py-1 disabled:opacity-50"
        onClick={() => resetSelection()}
        disabled={indices.length <= 0}
      >
        Reset
      </button>
      <button
        className="mx-4 my-4 w-fit rounded-sm border border-slate-500 px-2 py-1 disabled:opacity-50"
        onClick={_handleClick}
        disabled={indices.length <= 0}
      >
        Add
      </button>
    </div>
  );
};
