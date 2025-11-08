import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import SelectedItem from "../components/SelectedItem";
import {Tag, MapPin, User} from "lucide-react";
import styles from "./../styles.module.css";
import './style.css';

/**
 * SelectedItem component displays a selected filter item.
 * It shows the item label and icon, and provides a remove button.
 * 
 * Used internally by SmartFiltero to render selected filters.
 */
export default {
  title: "Components/Selected Item",
  component: SelectedItem,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The SelectedItem component displays a selected filter item.

**Features:**
- Displays item label and icon
- Remove button functionality
- Styling support

**Use Cases:**
- Display selected filter categories (Status, City, Customer)
- Show active filters in the filter bar
- Allow users to remove selected filters
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    item: {
      description: 'The selected item to display. Contains label, icon, and sub-items.',
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
      value: "status",
      label: "Status",
      icon: Tag,
      typed: false,
      subItems: [],
    },
    validateStyle: (style: string) => styles[style],
    removeItem: (itemValue: string) => {
      console.log(`Removed item: ${itemValue}`);
    },
  },
} as Meta<typeof SelectedItem>;

/**
 * Default selected item with label and icon.
 */
export const Default: StoryObj<typeof SelectedItem> = {};

/**
 * Selected item with different icon.
 */
export const WithIcon: StoryObj<typeof SelectedItem> = {
  args: {
    item: {
      value: "city",
      label: "City",
      icon: MapPin,
      typed: false,
      subItems: [],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Selected item with a different icon (MapPin for City).',
      },
    },
  },
};

/**
 * Selected item without icon.
 */
export const WithoutIcon: StoryObj<typeof SelectedItem> = {
  args: {
    item: {
      value: "status",
      label: "Status",
      icon: undefined,
      typed: false,
      subItems: [],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Selected item without an icon. The label is still displayed.',
      },
    },
  },
};

/**
 * Multiple selected items example.
 */
export const MultipleSelected: StoryObj<typeof SelectedItem> = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <SelectedItem
        item={{
          value: "status",
          label: "Status",
          icon: Tag,
          typed: false,
          subItems: [],
        }}
        validateStyle={(style: string) => styles[style]}
        removeItem={() => {}}
      />
      <SelectedItem
        item={{
          value: "city",
          label: "City",
          icon: MapPin,
          typed: false,
          subItems: [],
        }}
        validateStyle={(style: string) => styles[style]}
        removeItem={() => {}}
      />
      <SelectedItem
        item={{
          value: "customer",
          label: "Customer",
          icon: User,
          typed: false,
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
        story: 'Example showing multiple selected items displayed together.',
      },
    },
  },
};
