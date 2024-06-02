import "./App.css";

import "react-lezer-highlighter/styles/default.css";
import { Code } from "./pewpew";
import { useState } from "react";

let code = `fn main() {
    println!("Hello, world!");
}

fn boobies(first, second) {
    println!("who likes ice cream?!");
}
`;

function App() {
  const [replace, setReplace] = useState([
    [["(", 1], "["],
    [[")", 1], "]"],
    [[`first, second`, 0], ""],
    // [[`second`, 0], ""],
    // [[`"who likes ice cream?!"`, 0], "i"],
  ]);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <Code
            code={code}
            replace={replace}
            insert={[
              [["(", 0], "dupa, argument", [")", 0]],
              // [["{", 1], "call_me();", ["}", 1]],
            ]}
          />
        </div>
      </header>
    </div>
  );
}

export default App;
