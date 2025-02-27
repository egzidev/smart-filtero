import React, {useRef, useState} from "react";
import {Meta, StoryObj} from "@storybook/react";
import Input from "../components/Input";
import styles from "./../styles.module.css";
import './style.css'

export default {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    handleInputFocus: () => {
    },
    handleInputChange: () => {
    },
    classNameWrapper: "searchWrapper",
    classNameInput: "searchInput",
    validateStyle: (style: string) => styles[style],
  },
} as Meta<typeof Input>;

const Template = (args: any) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(args.query);

  return (
    <div className={`${styles.container} ${styles.inputContainer}`}>
      <div className={styles.searchContainer}>
        <Input
          {...args}
          inputRef={inputRef}
          query={query}
          handleInputFocus={() => console.log("Input focused")}
          handleInputChange={(e) => setQuery(e.target.value)}
        />
      </div>
    </div>
  );
};

export const Default: StoryObj<typeof Input> = {
  render: Template,
  args:{
    placeholder: "Search or filter...",
  }
};

export const WithValue: StoryObj<typeof Input> = {
  render: Template,
  args: {
    query: "Type here...",
  },
};

export const FocusedState: StoryObj<typeof Input> = {
  render: Template,
  args:{
    placeholder: "Search or filter...",
  },
  play: async ({canvasElement}) => {
    const input = canvasElement.querySelector("input");
    if (input) input.focus();
  },
};