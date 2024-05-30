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
  const prevCode = useRef();
  const actualResult = useRef();

  if (prevCode.current === code) {
    return <>{actualResult.current}</>;
  }

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

  // debugger;

  const real = [...result];

  const newResult = [...result];

  if (prevResult.current) {
    prevResult.current.forEach((prevChild, idx) => {
      const newChild = newResult[idx];

      if (
        typeof prevChild === "object" &&
        newChild?.key !== prevChild.key &&
        result.every((newChild) => newChild.key !== prevChild.key)
      ) {
        const copy =
          typeof newChild === "object"
            ? {
                ...newChild,
                props: {
                  ...newChild.props,
                  className: (newChild.props.className || "") + " appear",
                },
              }
            : newChild;

        const toRemove = {
          ...prevChild,
          props: {
            ...prevChild.props,
            className: (prevChild.props.className || "") + " remove",
            style: { "--length": newChild?.props?.["data-length"] || 0 },
          },
        };

        // newChild.props.className = newChild.props.className + " appear";

        // newChild.props = {
        //   ...newChild.props,
        // };

        newResult[idx] = copy;
        newResult.splice(idx, 0, toRemove);
      }
    });
  }

  actualResult.current = newResult;
  prevResult.current = real;
  prevCode.current = code;

  return <>{actualResult.current}</>;
};
