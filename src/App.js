import "./App.css";

import "react-lezer-highlighter/styles/default.css";
import { Code } from "./lasers";
import { useRef, useState } from "react";

let _code = `fn main() {
    println!("Hello, world!");
}`;

function App() {
  const [code, setCode] = useState(_code);
  const ref = useRef(false);

  const change = () => {
    setCode((code) =>
      ref.current
        ? code.replace("main", "jasna_dupa").replace("Hello", "hi")
        : code.replace("jasna_dupa", "main").replace("hi", "Hello"),
    );

    ref.current = !ref.current;
  };

  return (
    <div className="App" onClick={change}>
      <header className="App-header">
        <div>
          <Code code={code} />
        </div>
      </header>
    </div>
  );
}

export default App;
