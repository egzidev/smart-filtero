import React, {useRef, useState} from "react";
import {Meta, StoryObj} from "@storybook/react";
import Input from "../components/Input";
import styles from "./../styles.module.css";
import './style.css'

/**
 * Input component is the search/filter input field used in SmartFiltero.
 * It handles user input, focus events, and displays placeholder text.
 * 
 * Used internally by SmartFiltero as the main input field.
 */
export default {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The Input component is the main search/filter input field.

**Features:**
- Search query input
- Focus handling
- Change event handling
- Customizable placeholder
- Styling support

**Use Cases:**
- Main filter search input
- Text query input
- Filter trigger input
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    inputRef: {
      description: 'React ref for the input element. Used for programmatic control.',
      control: { type: 'object' },
      table: {
        type: { summary: 'React.RefObject<HTMLInputElement>' },
        category: 'Refs',
      },
    },
    query: {
      description: 'Current input value/query string.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
        category: 'State',
      },
    },
    handleInputFocus: {
      description: 'Callback function called when the input receives focus.',
      action: 'focused',
      table: {
        type: { summary: 'InputFocusHandler' },
        category: 'Events',
      },
    },
    handleInputChange: {
      description: 'Callback function called when the input value changes.',
      action: 'changed',
      table: {
        type: { summary: 'InputChangeHandler' },
        category: 'Events',
      },
    },
    validateStyle: {
      description: 'Function to validate and return CSS class names for styling.',
      control: { type: 'object' },
      table: {
        type: { summary: 'StyleValidator' },
        category: 'Styling',
      },
    },
    placeholder: {
      description: 'Placeholder text shown when input is empty.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
        category: 'Content',
      },
    },
  },
  args: {
    handleInputFocus: () => {
    },
    handleInputChange: () => {
    },
    validateStyle: (style: string) => styles[style],
  },
} as Meta<typeof Input>;

const Template = (args: any) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(args.query || '');

  return (
    <div className={`${styles.container} ${styles.inputContainer}`}>
      <div className={styles.searchContainer}>
        <Input
          {...args}
          inputRef={inputRef}
          query={query}
          handleInputFocus={() => console.log("Input focused")}
          handleInputChange={(e) => setQuery(e.target.value)}
        />
      </div>
    </div>
  );
};

/**
 * Default input with placeholder.
 */
export const Default: StoryObj<typeof Input> = {
  render: Template,
  args: {
    placeholder: "Search or filter...",
  },
  parameters: {
    docs: {
      description: {
        story: 'Default input with a placeholder text guiding users on what to search or filter.',
      },
    },
  },
};

/**
 * Input with a pre-filled value.
 */
export const WithValue: StoryObj<typeof Input> = {
  render: Template,
  args: {
    query: "laptop",
    placeholder: "Search or filter...",
  },
  parameters: {
    docs: {
      description: {
        story: 'Input with a pre-filled query value. Useful for default searches or restoring previous queries.',
      },
    },
  },
};

/**
 * Input in focused state.
 */
export const FocusedState: StoryObj<typeof Input> = {
  render: Template,
  args: {
    placeholder: "Search or filter...",
  },
  play: async ({canvasElement}) => {
    const input = canvasElement.querySelector("input");
    if (input) input.focus();
  },
  parameters: {
    docs: {
      description: {
        story: 'Input in focused state. When focused, the dropdown with filter options appears.',
      },
    },
  },
};

/**
 * Input with custom placeholder.
 */
export const CustomPlaceholder: StoryObj<typeof Input> = {
  render: Template,
  args: {
    placeholder: "Search orders, customers, or filter by status...",
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom placeholder text that provides more specific guidance to users.',
      },
    },
  },
};
