
import { Meta, StoryObj } from "@storybook/react";
import {Type} from "lucide-react";
import Item from "../components/Item";
import styles from "./../styles.module.css";


export default {
  title: "Components/Item",
  component: Item,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    label: "Search for this text",
    icon: Type,
    query: "Typed Query",
    isTyped: false,
    validateStyle: (style: string) => styles[style],
    onClick: () => alert("Item clicked!"),
  },
} as Meta<typeof Item>;

export const Default: StoryObj<typeof Item> = {};
export const Typed: StoryObj<typeof Item> = {
  args: {
    label: "Search for this text: ",
    isTyped: true,
    query: "Typed Query",
    validateStyle: () => {
      return 'queryItem';
    },
  },
};