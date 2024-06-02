import { diff } from "diff-match-patch-es";

export type Range = [number, number];

export interface MatchedRanges {
  from: Range;
  to: Range;
  content: string;
}

export function findTextMatches(
  a: string,
  b: string,
  options = {},
): MatchedRanges[] {
  let delta = diff(a, b);
  // delta = options?.diffCleanup?.(delta) || delta;
  console.log(delta);

  let aContent = "";
  let bContent = "";

  const matched: MatchedRanges[] = [];

  for (const [op, text] of delta) {
    if (op === 0) {
      matched.push({
        from: [aContent.length, aContent.length + text.length],
        to: [bContent.length, bContent.length + text.length],
        content: text,
      });
      aContent += text;
      bContent += text;
    } else if (op === -1) {
      aContent += text;
    } else if (op === 1) {
      bContent += text;
    }
  }

  if (aContent !== a || bContent !== b) throw new Error("Content mismatch");

  return matched;
}
