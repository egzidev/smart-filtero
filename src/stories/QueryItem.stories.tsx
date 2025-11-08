import React from "react";
import {Meta, StoryObj} from "@storybook/react";
import QueryItem from "../components/QueryItem";
import Item from "../components/Item";
import { Type, Tag} from "lucide-react";
import styles from "./../styles.module.css";
import './style.css'

/**
 * QueryItem component displays a text search option in the dropdown.
 * It appears when the user types a search query and allows them to select it.
 * 
 * Used internally by SmartFiltero to render text search options.
 */
export default {
  title: "Components/Query Item",
  component: QueryItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The QueryItem component displays a text search option in the dropdown.

**Features:**
- Shows/hides based on query and focus state
- Displays search query option
- Handles click events

**Use Cases:**
- Text search option in dropdown
- Free-form query selection
- Search query trigger
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    query: {
      description: 'Current search query text. When empty, component is hidden.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
        category: 'State',
      },
    },
    isFocused: {
      description: 'Whether the filter input is currently focused. Controls visibility.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        category: 'State',
      },
    },
    showSubItems: {
      description: 'Currently selected item showing sub-items. When set, component is hidden.',
      control: { type: 'object' },
      table: {
        type: { summary: 'Item | null' },
        category: 'State',
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
    children: {
      description: 'React children (Item component) representing the search query option.',
      control: { type: 'object' },
      table: {
        type: { summary: 'React.ReactNode' },
        category: 'Content',
      },
    },
  },
  args: {
    query: "laptop",
    isFocused: true,
    showSubItems: null,
    validateStyle: (style: string) => styles[style],
    children: (
      <div className="dropdown">
        <Item
          onClick={() => alert("Search query clicked!")}
          label="Search for this text"
          icon={Type}
          query="laptop"
          isTyped={true}
          validateStyle={() => styles.dropdownItem}
        />
      </div>
    ),
  },
} as Meta<typeof QueryItem>;

/**
 * Default query item with search query.
 */
export const Default: StoryObj<typeof QueryItem> = {};

/**
 * Query item with different search query.
 */
export const WithDifferentQuery: StoryObj<typeof QueryItem> = {
  args: {
    query: "smartphone",
    children: (
      <div className="dropdown">
        <Item
          onClick={() => {}}
          label="Search for this text"
          icon={Type}
          query="smartphone"
          isTyped={true}
          validateStyle={() => styles.dropdownItem}
        />
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Query item with a different search query. The query text is highlighted in the label.',
      },
    },
  },
};

/**
 * Query item when not focused (hidden).
 */
export const NotFocused: StoryObj<typeof QueryItem> = {
  args: {
    isFocused: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'When not focused, the query item is hidden.',
      },
    },
  },
};

/**
 * Query item when sub-items are shown (hidden).
 */
export const WithSubItems: StoryObj<typeof QueryItem> = {
  args: {
    showSubItems: {
      value: 'status',
      label: 'Status',
      icon: Tag,
      subItems: [],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'When sub-items are being shown, the query item is hidden.',
      },
    },
  },
};

/**
 * Query item with empty query (hidden).
 */
export const EmptyQuery: StoryObj<typeof QueryItem> = {
  args: {
    query: "",
  },
  parameters: {
    docs: {
      description: {
        story: 'When the query is empty, the query item is hidden.',
      },
    },
  },
};
