import type { Preview } from "@storybook/nextjs-vite";

import "../src/_app/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ["Shared", "Entities", "Features", "Widgets", "Pages"],
      },
    },
  },
  tags: ["autodocs"],
};

export default preview;
