"use client";

import { MDXProvider } from "@mdx-js/react";
import { ReactNode } from "react";

const mdxComponents = {
  h1: (props: any) => <h1 className="text-4xl font-bold mb-4" {...props} />,
  p: (props: any) => <p className="mb-4 leading-relaxed" {...props} />,
  a: (props: any) => (
    <a className="text-blue-600 hover:underline" {...props} />
  ),
};

export default function MDXProviderWrapper({ children }: { children: ReactNode }) {
  return <MDXProvider components={mdxComponents}>{children}</MDXProvider>;
}
