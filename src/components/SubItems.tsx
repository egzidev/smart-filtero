import styles from "@/styles.module.css";
import React from "react";
import {SubItemsCmp} from "@/types";

const SubItems: React.FC<SubItemsCmp> = ({
  showSubItems,
  isFocused,
  children,
}) => {
  return (
    showSubItems
    && isFocused
    && !showSubItems.typed
    && (
      <ul className={styles.dropdownSubItemContainer}>
        {children}
      </ul>
    )
  )
}

export default SubItems;