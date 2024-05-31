import { parser } from "@lezer/rust";
import { highlightTree } from "@lezer/highlight";
import { classHighlighter } from "./highlight.ts";

function highlightCode(
  code,
  tree,
  highlighter,
  putText,
  putBreak,
  from = 0,
  to = code.length,
) {
  let pos = from;
  function writeTo(p, classes) {
    if (p <= pos) return;
    for (let text = code.slice(pos, p), i = 0; ; ) {
      let nextBreak = text.indexOf("\n", i);
      let upto = nextBreak < 0 ? text.length : nextBreak;
      if (upto > i) putText(text.slice(i, upto), classes, pos, p);
      if (nextBreak < 0) break;
      putBreak();
      i = nextBreak + 1;
    }
    pos = p;
  }

  highlightTree(
    tree,
    highlighter,
    (from, to, classes) => {
      writeTo(from, "");
      writeTo(to, classes);
    },
    from,
    to,
  );
  writeTo(to, "");
}

export const Code = ({ code, replace, insert }) => {
  insert = insert || [];

  const oldCode = code;

  const result = [];
  const oldResult = [];

  const typesMap = new Map();
  const oldTypesMap = new Map();
  const empties = [];

  const insertPositions = [];

  highlightCode(
    oldCode,
    parser.parse(oldCode),
    classHighlighter,
    emitOld,
    emitBreakOld,
  );

  // console.log(oldResult);

  function emitOld(text, classes, start, stop) {
    if (classes) {
      const count = oldTypesMap.get(text) || 0;
      oldTypesMap.set(text, count + 1);

      const key = `${text}-${count}`;
      oldResult.push(
        <span
          className={classes}
          key={key}
          data-key={key}
          data-length={text.length}
          style={{ "--length": text.length }}
          title={key}
        >
          {text}
        </span>,
      );
    } else {
      oldResult.push(<span style={{ whiteSpace: "pre" }}>{text}</span>);
    }
  }

  function emitBreakOld() {
    oldResult.push("\n");
  }

  function emit(text, classes, start, stop) {
    const insertPos =
      insertPositions.find(
        ([iStart, iStop]) => start >= iStart && stop <= iStop,
      ) ||
      insertPositions.find(
        ([iStart, iStop]) => start === iStart && iStop === iStart,
      );

    let insertKey;
    if (insertPos && typeof classes === "string") {
      if (insertPos[0] === start) {
        insertKey = insertPos[2];
      }
      classes = classes + " new";
    }

    if (classes) {
      const count = typesMap.get(text) || 0;
      typesMap.set(text, count + 1);

      const key = `${text}-${count}`;
      result.push(
        <span
          className={classes}
          key={key}
          data-key={key}
          data-length={text.length}
          style={{ "--length": text.length }}
          title={key}
          insert-key={insertKey}
        >
          {text}
        </span>,
      );
    } else {
      result.push(<span style={{ whiteSpace: "pre" }}>{text}</span>);
    }
  }

  function emitBreak() {
    result.push("\n");
  }

  function getIndicesOf(searchStr, str, caseSensitive) {
    var searchStrLen = searchStr.length;
    if (searchStrLen === 0) {
      return [];
    }
    var startIndex = 0,
      index,
      indices = [];
    if (!caseSensitive) {
      str = str.toLowerCase();
      searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
      indices.push(index);
      startIndex = index + searchStrLen;
    }
    return indices;
  }

  const insertAt = (str, sub, pos) =>
    `${str.slice(0, pos)}${sub}${str.slice(pos)}`;

  for (const [[token, index], value] of insert) {
    const position = getIndicesOf(token, code, true)[index];
    code = insertAt(code, value, position + 1);
  }

  const replaceAt = (str, sub, pos, length) =>
    `${str.slice(0, pos - 1)}${sub}${str.slice(pos + length - 1)}`;

  for (const [[token, index], value] of replace) {
    // console.log(token, index);
    const position = getIndicesOf(token, code, true)[index];
    insertPositions.push([
      position,
      position + value.length,
      `${token}-${index}`,
    ]);
    console.log(insertPositions);
    code = replaceAt(code, value, position + 1, token.length);
  }

  highlightCode(code, parser.parse(code), classHighlighter, emit, emitBreak);

  for (const [[token, index], value] of replace) {
    const key = `${token}-${index}`;
    const element = oldResult.find((element) => element.key === key);
    if (!element) {
      break;
    }
    const anchor = result.findIndex((a) => a?.props?.["insert-key"] === key);
    // console.log(value);

    result.splice(anchor, 0, {
      ...element,
      props: {
        ...element.props,
        className: (element.props.className || "") + " empty",
        style: {
          ...element.props.style,
          "--start": element.props.style["--length"],
          "--length": value.length,
        },
      },
    });
  }

  for (const [
    [openingToken, openingIndex],
    value,
    [closingToken, closingIndex],
  ] of insert) {
    const openingKey = `${openingToken}-${openingIndex}`;
    const closingKey = `${closingToken}-${closingIndex}`;

    const openingPosition = result.findIndex(
      (child) => child.key === openingKey,
    );
    const closingPosition = result.findIndex(
      (child) => child.key === closingKey,
    );

    let startPosition = openingPosition + 1;

    const appearing = result.slice(startPosition, closingPosition);
    const length = appearing
      .map((a) => (typeof a === "object" ? a.props.children : a))
      .join("").length;

    appearing.forEach((child, idx) => {
      if (typeof result[startPosition] === "object") {
        result[startPosition] = {
          ...result[startPosition],
          props: {
            ...result[startPosition].props,
            className: (result[startPosition].props.className || "") + " new",
            style: { ...result[startPosition].props.style, "--move": length },
          },
        };
      }

      startPosition = startPosition + 1;
    });

    result.splice(
      openingPosition + 1,
      0,
      <span
        className="empty"
        key={"empty" + openingKey}
        style={{ "--length": length - 1, "--start": 0 }}
      />,
    );
  }

  return <>{result}</>;
};
