import styles from "@/styles.module.css";
import React from "react";
import {ItemsCmp} from "@/types";

const Items: React.FC<ItemsCmp> = ({
  isFocused,
  showSubItems,
  fetching,
  filteredItemsLength,
  children,
}) => {
  return (
    isFocused
    && !showSubItems
    && !fetching
    && filteredItemsLength
    && (
      <ul className={styles.dropdownItemContainer}> {children} </ul>
    )
  )
}

export default Items;