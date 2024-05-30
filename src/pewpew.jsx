import { parser } from "@lezer/rust";
import { highlightCode, classHighlighter } from "@lezer/highlight";

export const Code = ({ code, replace, insert }) => {
  insert = insert || [];

  let result = [];

  const typesMap = new Map();

  function emit(text, classes) {
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
    const position = getIndicesOf(token, code, true)[index];
    console.log(token);
    console.log(position);
    code = replaceAt(code, value, position + 1, token.length);
  }

  highlightCode(code, parser.parse(code), classHighlighter, emit, emitBreak);

  // this works for simple replace, but not for syntax analysis
  // for (const [[openingToken, openingIndex], value] of replace) {
  //   const key = `${openingToken}-${openingIndex}`;
  //   console.log(key);
  //   const index = result.findIndex((child) => child.key === key);
  //   if (index < 0) {
  //     break;
  //   }

  //   const newToken = result[index];

  //   const toAppear = {
  //     ...newToken,
  //     key: `hello-${Math.random()}`,
  //     props: {
  //       ...newToken.props,
  //       children: value,
  //       className: (newToken.props.className || "") + " appear",
  //       style: { "--length": value.length || 0 },
  //     },
  //   };

  //   const toRemove = {
  //     ...newToken,
  //     props: {
  //       ...newToken.props,
  //       className: (newToken.props.className || "") + " remove",
  //       style: { ...newToken.props.style, "--new-length": value.length || 0 },
  //     },
  //   };

  //   result[index] = toAppear;
  //   result.splice(index, 0, toRemove);
  // }

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
        key={"empty"}
        style={{ "--length": length - 1 }}
      />,
    );
  }

  return <>{result}</>;
};
