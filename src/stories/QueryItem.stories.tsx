import React from "react";
import {Meta, StoryObj} from "@storybook/react";
import QueryItem from "../components/QueryItem";
import Item from "../components/Item";
import { Type} from "lucide-react";
import styles from "./../styles.module.css";
import './style.css'

export default {
  title: "Components/Query Item",
  component: QueryItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    query: "Search Query",
    isFocused: true,
    showSubItems: null,
    validateStyle: (style: string) => styles[style],
    children: (
      <div className="dropdown">
        <Item
          onClick={() => alert("Item clicked!")}
          label="Search for this text"
          icon={Type}
          validateStyle={() => styles.dropdownItem}
        />
      </div>
    ),
  },
} as Meta<typeof QueryItem>;



export const Typed: StoryObj<typeof QueryItem> = {};