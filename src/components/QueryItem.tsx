import styles from "@/styles.module.css";
import React from "react";
import {QueryItemCmp} from "@/types";

const QueryItem: React.FC<QueryItemCmp> = ({
  query,
  showSubItems,
  isFocused,
  children
}) => {
  return (
    query
    && !showSubItems
    && isFocused
    && (
      <ul className={styles.dropdownItemContainer}>
        {children}
      </ul>
    )
  )
}

export default QueryItem;