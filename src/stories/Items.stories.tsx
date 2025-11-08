import React from "react";
import {Meta, StoryObj} from "@storybook/react";
import Item from "../components/Item";
import {MapPin, Users, Tag, CheckCircle, Clock, CircleX} from "lucide-react";
import Items from "./../components/Items";
import styles from "./../styles.module.css";
import './style.css';

// Default children for Items component
const defaultChildren = (
  <div className="dropdown">
    <Item
      onClick={() => alert("Item clicked!")}
      label="Status"
      icon={Tag}
      validateStyle={() => styles.dropdownItem}
    />
    <Item
      onClick={() => alert("Item clicked!")}
      label="City"
      icon={MapPin}
      validateStyle={() => styles.dropdownItem}
    />
    <Item
      onClick={() => alert("Item clicked!")}
      label="Customer"
      icon={Users}
      validateStyle={() => styles.dropdownItem}
    />
  </div>
);

/**
 * Items component is a container for rendering a list of filter items.
 * It handles loading states and visibility based on focus and sub-item selection.
 * 
 * Used internally by SmartFiltero to render the main filter options dropdown.
 */
export default {
  title: "Components/Items",
  component: Items,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Items component is a container that renders a list of filter items.

**Features:**
- Shows/hides based on focus state
- Hides when sub-items are being shown
- Displays loading state
- Handles empty states

**Use Cases:**
- Main filter category dropdown (Status, City, Customer)
- Filter option list container
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isFocused: {
      description: 'Whether the filter input is currently focused. Controls visibility.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        category: 'State',
      },
    },
    showSubItems: {
      description: 'Currently selected item showing sub-items. When set, this component hides.',
      control: { type: 'object' },
      table: {
        type: { summary: 'Item | null' },
        category: 'State',
      },
    },
    isLoading: {
      description: 'Whether async data is currently loading. Shows loading indicator.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        category: 'State',
      },
    },
    filteredItemsLength: {
      description: 'Whether there are filtered items to display. Controls empty state.',
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
      description: 'React children (Item components) to render inside this container.',
      control: { type: 'object' },
      table: {
        type: { summary: 'React.ReactNode' },
        category: 'Content',
      },
    },
  },
  args: {
    isFocused: true,
    showSubItems: null,
    isLoading: false,
    filteredItemsLength: true,
    children: defaultChildren,
    validateStyle: (style: string) => styles[style],
  },
} as Meta<typeof Items>;

/**
 * Default items container with multiple filter options.
 */
export const Default: StoryObj<typeof Items> = {};

/**
 * Items container when not focused (hidden).
 */
export const NotFocused: StoryObj<typeof Items> = {
  args: {
    isFocused: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'When not focused, the items container is hidden.',
      },
    },
  },
};

/**
 * Items container when sub-items are being shown (hidden).
 */
export const WithSubItems: StoryObj<typeof Items> = {
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
        story: 'When sub-items are being shown, the main items container is hidden.',
      },
    },
  },
};

/**
 * Items container with loading state.
 */
export const Loading: StoryObj<typeof Items> = {
  args: {
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'When loading async data, a loading indicator is shown instead of items.',
      },
    },
  },
};

// Multiple categories children
const multipleCategoriesChildren = (
  <div className="dropdown">
    <Item
      onClick={() => {}}
      label="Status"
      icon={Tag}
      validateStyle={() => styles.dropdownItem}
    />
    <Item
      onClick={() => {}}
      label="Paid"
      icon={CheckCircle}
      validateStyle={() => styles.dropdownItem}
    />
    <Item
      onClick={() => {}}
      label="In Progress"
      icon={Clock}
      validateStyle={() => styles.dropdownItem}
    />
    <Item
      onClick={() => {}}
      label="Canceled"
      icon={CircleX}
      validateStyle={() => styles.dropdownItem}
    />
    <Item
      onClick={() => {}}
      label="City"
      icon={MapPin}
      validateStyle={() => styles.dropdownItem}
    />
    <Item
      onClick={() => {}}
      label="Customer"
      icon={Users}
      validateStyle={() => styles.dropdownItem}
    />
  </div>
);

/**
 * Items container with multiple filter categories.
 */
export const MultipleCategories: StoryObj<typeof Items> = {
  args: {
    children: multipleCategoriesChildren,
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with multiple filter categories and various icons.',
      },
    },
  },
};
