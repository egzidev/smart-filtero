import React from "react";
import {ItemsCmp} from "@/types";

const Items: React.FC<ItemsCmp> = ({
  isFocused,
  showSubItems,
  fetching,
  filteredItemsLength,
  children,
  validateStyle
}) => {
  return (
    isFocused
    && !showSubItems
    && !fetching
    && filteredItemsLength
    && (
      <ul className={validateStyle('dropdownItemContainer')}> {children} </ul>
    )
  )
}

export default Items;