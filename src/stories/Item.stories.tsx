import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import {Type, Tag, User, MapPin} from "lucide-react";
import Item from "../components/Item";
import styles from "./../styles.module.css";
import './style.css';

/**
 * Item component represents a single filterable item in the dropdown.
 * It can display an icon, label, and handle click events.
 * 
 * Used internally by SmartFiltero to render filter options.
 */
export default {
  title: "Components/Item",
  component: Item,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Item component is used to render individual filter options in the dropdown.

**Features:**
- Icon support (React component or element)
- Click handling
- Typed query highlighting
- Selected state indication
- Multi-operator selection support

**Use Cases:**
- Filter category items (Status, City, Category)
- Sub-filter items (Paid, New York, Electronics)
- Search query items
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      description: 'The text label to display for this item.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
        category: 'Content',
      },
    },
    icon: {
      description: 'Icon component or element to display before the label.',
      control: { type: 'object' },
      table: {
        type: { summary: 'IconType' },
        category: 'Content',
      },
    },
    query: {
      description: 'Current search query. Used to highlight matching text in typed items.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
        category: 'State',
      },
    },
    isTyped: {
      description: 'Whether this is a typed/search query item. Highlights the query text.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        category: 'State',
      },
    },
    isSelected: {
      description: 'Whether this item is currently selected. Shows visual indication.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        category: 'State',
      },
    },
    isMultiOperator: {
      description: 'Whether the current operator supports multiple selections. Affects selection UI.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean | string' },
        category: 'State',
      },
    },
    onClick: {
      description: 'Callback function called when the item is clicked.',
      action: 'clicked',
      table: {
        type: { summary: '(e: React.MouseEvent<HTMLLIElement>) => void' },
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
    label: "Status",
    icon: Tag,
    query: "",
    isTyped: false,
    isSelected: false,
    isMultiOperator: false,
    validateStyle: (style: string) => styles[style],
    onClick: () => alert("Item clicked!"),
  },
} as Meta<typeof Item>;

/**
 * Default item with icon and label.
 */
export const Default: StoryObj<typeof Item> = {};

/**
 * Item without an icon.
 */
export const WithoutIcon: StoryObj<typeof Item> = {
  args: {
    label: "City",
    icon: undefined,
  },
};

/**
 * Typed/search query item that highlights the query text.
 */
export const Typed: StoryObj<typeof Item> = {
  args: {
    label: "Search for this text",
    icon: Type,
    query: "laptop",
    isTyped: true,
    validateStyle: () => 'queryItem',
  },
  parameters: {
    docs: {
      description: {
        story: 'Typed items are used for search queries. The query text is highlighted in the label.',
      },
    },
  },
};

/**
 * Selected item state with visual indication.
 */
export const Selected: StoryObj<typeof Item> = {
  args: {
    label: "Paid",
    icon: Tag,
    isSelected: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Selected items show a visual indication (typically a checkmark or highlight).',
      },
    },
  },
};

/**
 * Item with multi-operator selection support.
 */
export const MultiSelect: StoryObj<typeof Item> = {
  args: {
    label: "New York",
    icon: MapPin,
    isSelected: true,
    isMultiOperator: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'When using multi-operators (like "any of"), items can be selected multiple times. The selection UI reflects this.',
      },
    },
  },
};

/**
 * Various item examples with different icons.
 */
export const WithDifferentIcons: StoryObj<typeof Item> = {
  render: (args) => (
    <div className="dropdown" style={{ minWidth: '200px' }}>
      <Item
        {...args}
        onClick={() => {}}
        label="Status"
        icon={Tag}
        validateStyle={(style: string) => styles[style]}
      />
      <Item
        {...args}
        onClick={() => {}}
        label="Customer"
        icon={User}
        validateStyle={(style: string) => styles[style]}
      />
      <Item
        {...args}
        onClick={() => {}}
        label="City"
        icon={MapPin}
        validateStyle={(style: string) => styles[style]}
      />
      <Item
        {...args}
        onClick={() => {}}
        label="Search Query"
        icon={Type}
        query="laptop"
        isTyped={true}
        validateStyle={(style: string) => style === 'queryItem' ? 'queryItem' : styles[style]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of items with different icons and use cases.',
      },
    },
  },
};
