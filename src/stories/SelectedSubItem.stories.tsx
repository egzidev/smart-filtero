import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import SelectedSubItem from "../components/SelectedSubItem";
import {Tag, CheckCircle, Clock, CircleX} from "lucide-react";
import "./style.css";
import styles from "./../styles.module.css";

/**
 * SelectedSubItem component displays a selected sub-filter option.
 * It shows the sub-item label and icon, and provides a remove button.
 * 
 * Used internally by SmartFiltero to render selected sub-filters.
 */
export default {
  title: "Components/Selected Sub Item",
  component: SelectedSubItem,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The SelectedSubItem component displays a selected sub-filter option.

**Features:**
- Displays sub-item label and icon
- Remove button functionality
- Styling support
- Click to change selection

**Use Cases:**
- Display selected sub-options (Paid, New York, Electronics)
- Show active sub-filters in the filter bar
- Allow users to remove or change selected sub-filters
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    item: {
      description: 'The parent item containing the selected sub-items.',
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
    onClick: {
      description: 'Callback function called when the sub-item is clicked (to change selection).',
      action: 'clicked',
      table: {
        type: { summary: '(e: React.MouseEvent<HTMLDivElement>) => void' },
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
      subItems: [{
        value: "paid",
        label: "Paid",
        icon: CheckCircle,
      },
      {
        value: "in-progress",
        label: "In-progress",
        icon: Clock,
      },
      {
        value: "cancel",
        label: "Canceled",
        icon: CircleX,
      }],
    },
    validateStyle: (style: string) => styles[style],
  },
} as Meta<typeof SelectedSubItem>;

const Template = (args: any) => {
  const [selectedItem, setSelectedItem] = useState(args.item);

  const removeItem = (itemValue: string, subItemValue?: string) => {
    const updatedSubItems = selectedItem.subItems.filter((sub: any) => sub.value !== subItemValue);
    setSelectedItem({ ...selectedItem, subItems: updatedSubItems });
  };

  return selectedItem.subItems.length > 0 ? (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {selectedItem.subItems.map((subItem: any) => (
        <SelectedSubItem
          key={subItem.value}
          {...args}
          item={{ ...selectedItem, subItems: [subItem] }}
          removeItem={removeItem}
          onClick={() => console.log(`Clicked sub-item: ${subItem.label}`)}
        />
      ))}
    </div>
  ) : (
    <p>No sub-items selected</p>
  );
};

/**
 * Default selected sub-item with label and icon.
 */
export const Default: StoryObj<typeof SelectedSubItem> = {
  render: Template,
  parameters: {
    docs: {
      description: {
        story: 'Default selected sub-item showing a status option (Paid) with icon and remove button.',
      },
    },
  },
};

/**
 * Multiple selected sub-items.
 */
export const MultipleSelected: StoryObj<typeof SelectedSubItem> = {
  render: Template,
  args: {
    item: {
      value: "status",
      label: "Status",
      icon: Tag,
      typed: false,
      subItems: [
        { value: "paid", label: "Paid", icon: CheckCircle },
        { value: "in-progress", label: "In-progress", icon: Clock },
        { value: "cancel", label: "Canceled", icon: CircleX },
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing multiple selected sub-items. This is used with multi-operators like "any of".',
      },
    },
  },
};

/**
 * Selected sub-item without icon.
 */
export const WithoutIcon: StoryObj<typeof SelectedSubItem> = {
  render: Template,
  args: {
    item: {
      value: "city",
      label: "City",
      icon: Tag,
      typed: false,
      subItems: [
        { value: "new_york", label: "New York", icon: undefined },
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Selected sub-item without an icon. The label is still displayed.',
      },
    },
  },
};

/**
 * Empty state when no sub-items are selected.
 */
export const WithoutSubItems: StoryObj<typeof SelectedSubItem> = {
  render: () => <p>No sub-items selected</p>,
  parameters: {
    docs: {
      description: {
        story: 'When no sub-items are selected, nothing is displayed.',
      },
    },
  },
};
