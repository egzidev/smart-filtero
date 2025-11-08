import React from "react";
import {Meta, StoryObj} from "@storybook/react";
import SubItems from "../components/SubItems";
import Item from "../components/Item";
import {CheckCircle, Clock, CircleX, Tag, MapPin, User} from 'lucide-react';
import styles from "./../styles.module.css";
import './style.css';

/**
 * SubItems component is a container for rendering sub-filter options.
 * It displays when a main filter item is selected and shows its sub-options.
 * 
 * Used internally by SmartFiltero to render sub-filter dropdowns.
 */
export default {
  title: "Components/Sub Items",
  component: SubItems,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The SubItems component is a container that renders sub-filter options.

**Features:**
- Shows/hides based on focus and parent item selection
- Displays sub-items for the selected parent item
- Handles loading and empty states
- Supports async sub-item loading

**Use Cases:**
- Status sub-options (Paid, In Progress, Canceled)
- City sub-options (New York, Los Angeles, Chicago)
- Category sub-options (Electronics, Clothing, Books)
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    showSubItems: {
      description: 'The parent item whose sub-items should be displayed. When null, component is hidden.',
      control: { type: 'object' },
      table: {
        type: { summary: 'Item | null' },
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
    validateStyle: {
      description: 'Function to validate and return CSS class names for styling.',
      control: { type: 'object' },
      table: {
        type: { summary: 'StyleValidator' },
        category: 'Styling',
      },
    },
    children: {
      description: 'React children (Item components) representing sub-items.',
      control: { type: 'object' },
      table: {
        type: { summary: 'React.ReactNode' },
        category: 'Content',
      },
    },
  },
  args: {
    showSubItems: {
      value: "status",
      label: "Status",
      icon: Tag,
      subItems: [
        {
          value: "cancel",
          label: "Canceled",
          icon: CircleX
        },
        {
          value: "in-progress",
          label: "In-progress",
          icon: Clock
        },
        {
          value: "paid",
          label: "Paid",
          icon: CheckCircle
        },
      ],
    },
    isFocused: true,
    validateStyle: (style: string) => styles[style],
    children: (
      <div className="dropdown">
        <Item
          onClick={() => alert("Item clicked!")}
          label="Canceled"
          icon={CircleX}
          validateStyle={() => styles.dropdownItem}
        />
        <Item
          onClick={() => alert("Item clicked!")}
          label="In-progress"
          icon={Clock}
          validateStyle={() => styles.dropdownItem}
        />
        <Item
          onClick={() => alert("Item clicked!")}
          label="Paid"
          icon={CheckCircle}
          validateStyle={() => styles.dropdownItem}
        />
      </div>
    ),
  },
} as Meta<typeof SubItems>;

/**
 * Default sub-items container showing status options.
 */
export const Default: StoryObj<typeof SubItems> = {};

/**
 * Sub-items container when not focused (hidden).
 */
export const WithoutFocus: StoryObj<typeof SubItems> = {
  args: {
    isFocused: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'When not focused, the sub-items container is hidden.',
      },
    },
  },
};

/**
 * Sub-items container when no parent item is selected (hidden).
 */
export const WithoutParentItem: StoryObj<typeof SubItems> = {
  args: {
    showSubItems: null,
  },
  parameters: {
    docs: {
      description: {
        story: 'When no parent item is selected, the sub-items container is hidden.',
      },
    },
  },
};

/**
 * Sub-items for city filter.
 */
export const CitySubItems: StoryObj<typeof SubItems> = {
  args: {
    showSubItems: {
      value: "city",
      label: "City",
      icon: MapPin,
      subItems: [],
    },
    children: (
      <div className="dropdown">
        <Item
          onClick={() => {}}
          label="New York"
          icon={MapPin}
          validateStyle={() => styles.dropdownItem}
        />
        <Item
          onClick={() => {}}
          label="Los Angeles"
          icon={MapPin}
          validateStyle={() => styles.dropdownItem}
        />
        <Item
          onClick={() => {}}
          label="Chicago"
          icon={MapPin}
          validateStyle={() => styles.dropdownItem}
        />
        <Item
          onClick={() => {}}
          label="Houston"
          icon={MapPin}
          validateStyle={() => styles.dropdownItem}
        />
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of sub-items for a city filter with multiple city options.',
      },
    },
  },
};

/**
 * Sub-items with many options.
 */
export const ManyOptions: StoryObj<typeof SubItems> = {
  args: {
    showSubItems: {
      value: "category",
      label: "Category",
      icon: Tag,
      subItems: [],
    },
    children: (
      <div className="dropdown">
        {['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Automotive', 'Health'].map((label, idx) => (
          <Item
            key={idx}
            onClick={() => {}}
            label={label}
            icon={Tag}
            validateStyle={() => styles.dropdownItem}
          />
        ))}
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with many sub-item options. The container handles scrolling for long lists.',
      },
    },
  },
};
