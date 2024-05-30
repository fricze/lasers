import "./App.css";

import "react-lezer-highlighter/styles/default.css";
import { Code } from "./pewpew";
import { useState } from "react";

let code = `fn main() {
    println!("Hello, world!");
}

fn boobies(first, second) {
    println!("who likes boobies?!");
}
`;

function App() {
  const [replace, setReplace] = useState(
    new Map([
      [["(", 1], "["],
      [[")", 1], "]"],
      // [[`first`, 0], "print, titties"],
    ]),
  );

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <Code
            code={code}
            replace={replace}
            insert={[
              [["(", 0], "dupa, argument", [")", 0]],
              // [["(", "0"], "dupa, argument", [")", "0"]],
            ]}
          />
        </div>
      </header>
    </div>
  );
}

export default App;
