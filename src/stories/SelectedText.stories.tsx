import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import SelectedText from "../components/SelectedText";
import {Type} from "lucide-react";
import styles from "./../styles.module.css";
import './style.css'

/**
 * SelectedText component displays a selected text search query.
 * It shows the search text and provides a remove button.
 * 
 * Used internally by SmartFiltero to render selected text search queries.
 */
export default {
  title: "Components/Selected Text",
  component: SelectedText,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The SelectedText component displays a selected text search query.

**Features:**
- Displays search query text
- Remove button functionality
- Styling support

**Use Cases:**
- Display selected text search queries
- Show active search terms in the filter bar
- Allow users to remove selected search queries
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    item: {
      description: 'The selected text search item. Contains the search query text.',
      control: { type: 'object' },
      table: {
        type: { summary: 'Item' },
        category: 'Data',
      },
    },
    removeItem: {
      description: 'Callback function called when the remove button is clicked.',
      action: 'removed',
      table: {
        type: { summary: 'RemoveItemHandler' },
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
  },
  args: {
    item: {
      value: "search",
      label: "laptop",
      icon: Type,
      typed: true,
      subItems: [],
    },
    validateStyle: (style: string) => styles[style],
    removeItem: () => {
      console.log('Removed text search');
    },
  },
} as Meta<typeof SelectedText>;

const Template = (args: any) => {
  const [selectedItem, setSelectedItem] = useState(args.item);

  const removeItem = () => {
    setSelectedItem(null);
  };

  return selectedItem ? (
    <SelectedText {...args} item={selectedItem} removeItem={removeItem} />
  ) : (
    <p>No item selected</p>
  );
};

/**
 * Default selected text search query.
 */
export const Default: StoryObj<typeof SelectedText> = {
  render: Template,
  parameters: {
    docs: {
      description: {
        story: 'Default selected text search query showing the search term "laptop" with a remove button.',
      },
    },
  },
};

/**
 * Selected text with different query.
 */
export const WithDifferentQuery: StoryObj<typeof SelectedText> = {
  render: Template,
  args: {
    item: {
      value: "search",
      label: "smartphone",
      icon: Type,
      typed: true,
      subItems: [],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Selected text search with a different query term.',
      },
    },
  },
};

/**
 * Selected text with long query.
 */
export const WithLongQuery: StoryObj<typeof SelectedText> = {
  render: Template,
  args: {
    item: {
      value: "search",
      label: "wireless bluetooth headphones with noise cancellation",
      icon: Type,
      typed: true,
      subItems: [],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Selected text search with a long query term. The component handles text overflow appropriately.',
      },
    },
  },
};

/**
 * Empty state when no text search is selected.
 */
export const WithoutItem: StoryObj<typeof SelectedText> = {
  render: () => <p>No item selected</p>,
  parameters: {
    docs: {
      description: {
        story: 'When no text search is selected, nothing is displayed.',
      },
    },
  },
};

/**
 * Multiple selected text searches example.
 */
export const MultipleSelected: StoryObj<typeof SelectedText> = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <SelectedText
        item={{
          value: "search",
          label: "laptop",
          icon: Type,
          typed: true,
          subItems: [],
        }}
        validateStyle={(style: string) => styles[style]}
        removeItem={() => {}}
      />
      <SelectedText
        item={{
          value: "search",
          label: "smartphone",
          icon: Type,
          typed: true,
          subItems: [],
        }}
        validateStyle={(style: string) => styles[style]}
        removeItem={() => {}}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example showing multiple selected text searches displayed together.',
      },
    },
  },
};
