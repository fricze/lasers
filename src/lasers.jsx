import { parser } from "@lezer/rust";
import { highlightCode, classHighlighter } from "@lezer/highlight";
import { useRef } from "react";

// export let result = document.createElement("pre");

// function emit(text, classes) {
//   let node = document.createTextNode(text);
//   if (classes) {
//     let span = document.createElement("span");
//     span.appendChild(node);
//     span.className = classes;
//     node = span;
//   }
//   result.appendChild(node);
// }

// function emitBreak() {
//   result.appendChild(document.createTextNode("\n"));
// }

// highlightCode(code, parser.parse(code), classHighlighter, emit, emitBreak);

export const Code = ({ code }) => {
  const prevResult = useRef();

  let result = [];

  const typesMap = new Map();

  function emit(text, classes) {
    if (classes) {
      const count = typesMap.get(text) || 0;
      typesMap.set(text, count + 1);

      result.push(
        <span
          className={classes}
          key={`${text}-${count}`}
          data-key={`${text}-${count}`}
          data-length={text.length}
          style={{ "--length": text.length }}
        >
          {text}
        </span>,
      );
    } else {
      result.push(text);
    }
  }

  function emitBreak() {
    result.push("\n");
  }

  highlightCode(code, parser.parse(code), classHighlighter, emit, emitBreak);

  if (prevResult.current) {
    prevResult.current.forEach((prevChild, idx) => {
      const newChild = result[idx];

      if (
        typeof prevChild === "object" &&
        newChild?.key !== prevChild.key &&
        result.every((newChild) => newChild.key !== prevChild.key)
      ) {
        result[idx] = {
          ...newChild,
          props: {
            ...newChild.props,
            className: (newChild.props.className || "") + " appear",
          },
        };

        result.splice(idx, 0, {
          ...prevChild,
          props: {
            ...prevChild.props,
            className: (prevChild.props.className || "") + " remove",
            style: { "--length": newChild.props["data-length"] },
          },
        });
      }
    });
  }

  console.log(result);

  prevResult.current = result;

  return <>{result}</>;
};
