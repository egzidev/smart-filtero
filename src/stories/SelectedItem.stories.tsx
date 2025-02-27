import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import SelectedItem from "../components/SelectedItem";
import styles from "./../styles.module.css";


export default {
  title: "Components/Selected Item",
  component: SelectedItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    item: {
      value: "1",
      item: "Selected Item",
      label: "Show Sub Items",
      typed: false,
      subItems: [],
    },
    validateStyle: (style: string) => styles[style],
  },
} as Meta<typeof SelectedItem>;

export const Default: StoryObj<typeof SelectedItem> = {};

