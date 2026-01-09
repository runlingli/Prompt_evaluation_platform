import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MdReaderProps {
  text: string;
}

const MdReader: React.FC<MdReaderProps> = ({ text }) => {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {text}
    </ReactMarkdown>
  );
};

export default MdReader;
