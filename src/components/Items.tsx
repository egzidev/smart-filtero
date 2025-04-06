import React from "react";
import {ItemsCmp} from "@/types";

const Items: React.FC<ItemsCmp> = ({
  isFocused,
  showSubItems,
  isLoading,
  filteredItemsLength,
  children,
  validateStyle
}) => {
  return (
    isFocused
    && !showSubItems
    && !isLoading
    && filteredItemsLength
    && (
      <ul className={validateStyle('dropdownItemContainer')}> {children} </ul>
    )
  )
}

export default Items;