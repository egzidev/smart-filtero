import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import SelectedText from "../components/SelectedText";
import styles from "./../styles.module.css";
import './style.css'

export default {
  title: "Components/Selected Text",
  component: SelectedText,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    item: {
      id: "1",
      item: "Selected Text",
      typed: true,
      subItems: [],
    },
    validateStyle: (style: string) => styles[style],
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

export const Default: StoryObj<typeof SelectedText> = {
  render: Template,
};

export const WithoutItem: StoryObj<typeof SelectedText> = {
  render: () => <p>No item selected</p>,
};