import React from "react";
import {Meta, StoryObj} from "@storybook/react";
import Item from "../components/Item";
import {MapPin, Users} from "lucide-react";
import Items from "./../components/Items";
import styles from "./../styles.module.css";
import './style.css';

export default {
  title: "Components/Items",
  component: Items,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    isFocused: true,
    showSubItems: null,
    fetching: false,
    filteredItemsLength: true,
    children: (
      <div className="dropdown">
        <Item
          onClick={() => alert("Item clicked!")}
          label="City"
          icon={MapPin}
          validateStyle={() => styles.dropdownItem}
        />
        <Item
          onClick={() => alert("Item clicked!")}
          label="Client"
          icon={Users}
          validateStyle={() => styles.dropdownItem}
        />
      </div>
    ),
    validateStyle: (style: string) => styles[style],
  },
} as Meta<typeof Items>;



export const Default: StoryObj<typeof Items> = {};

