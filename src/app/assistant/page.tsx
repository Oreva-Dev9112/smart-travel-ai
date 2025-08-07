'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import * as remarkGfm from 'remark-gfm';

export default function AssistantPage() {
  const [markdown] = useState(`# Welcome!\n\n- [x] Task one\n- [ ] Task two`);

  return (
    <div className="p-6">
      <ReactMarkdown remarkPlugins={[remarkGfm.default]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}