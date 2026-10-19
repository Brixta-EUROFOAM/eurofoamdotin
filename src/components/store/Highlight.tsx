import { Fragment } from "react";

/*
  Headline highlighter: ==words== get the solid orange block with white text.
  A censored swear like "Bullsh#*t." is highlighted automatically, so
  "Buy a Mattress, not Bullsh#*t." works with or without the == marks.
*/
export default function Highlight({ text }: { text: string }) {
  const marked = text.includes("==") ? text : text.replace(/(\S*#\*\S*)/, "==$1==");
  return (
    <>
      {marked.split(/==([^=]+)==/).map((part, i) =>
        i % 2 ? (
          <span key={i} className="g-hl">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}
