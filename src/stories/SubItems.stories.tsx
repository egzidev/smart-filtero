import React from "react";
import {Meta, StoryObj} from "@storybook/react";
import SubItems from "../components/SubItems";
import Item from "../components/Item";
import {CheckCircle, Clock, CircleX} from 'lucide-react';
import styles from "./../styles.module.css";
import './style.css';
export default {
  title: "Components/Sub Items",
  component: SubItems,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    showSubItems: {
      value: "1",
      label: "Show Sub Items",
      item: "Status",
      typed: false,
      subItems: [
        {
          value: "cancel",
          label: "Cancel",
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
          label="Cancel"
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

export const Default: StoryObj<typeof SubItems> = {};

export const WithoutFocus: StoryObj<typeof SubItems> = {
  args: {
    isFocused: false,
  },
};