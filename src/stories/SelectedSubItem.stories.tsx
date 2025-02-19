import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import SelectedSubItem from "../components/SelectedSubItem";
import "./style.css";
import styles from "./../styles.module.css";

export default {
  title: "Components/Selected Sub Item",
  component: SelectedSubItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    item: {
      id: "1",
      item: "Selected Text",
      typed: true,
      subItems: [{
        label: "Sub Item 1",
        icon: undefined as any,
      },
      {
        label: "Sub Item 2",
        icon: undefined as any,
      },
      {
        label: "Sub Item 3",
        icon: undefined as any,
      }],
    },
    validateStyle: (style: string) => styles[style],
  },
} as Meta<typeof SelectedSubItem>;

const Template = (args: any) => {
  const [selectedItem, setSelectedItem] = useState(args.item);

  const removeItem = (item: any, subItemLabel: string) => {
    const updatedSubItems = item.subItems.filter((sub: any) => sub.label !== subItemLabel);
    setSelectedItem({ ...item, subItems: updatedSubItems });
    console.log(`Removed: ${subItemLabel}`);
  };

  return selectedItem.subItems.length > 0 ? (
    <SelectedSubItem {...args} item={selectedItem} removeItem={removeItem} />
  ) : (
    <p>No sub-items selected</p>
  );
};

export const Default: StoryObj<typeof SelectedSubItem> = {
  render: Template,
};

export const WithoutSubItems: StoryObj<typeof SelectedSubItem> = {
  render: () => <p>No sub-items selected</p>,
};