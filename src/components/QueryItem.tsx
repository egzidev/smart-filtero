import React from "react";
import {QueryItemCmp} from "@/types";

const QueryItem: React.FC<QueryItemCmp> = ({
  query,
  showSubItems,
  isFocused,
  children,
  validateStyle
}) => {
  return (
    query
    && !showSubItems
    && isFocused
    && (
      <ul className={validateStyle('dropdownItemContainer')}>
        {children}
      </ul>
    )
  )
}

export default QueryItem;