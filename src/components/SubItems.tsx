import React from "react";
import {SubItemsCmp} from "@/types";

const SubItems: React.FC<SubItemsCmp> = ({
  showSubItems,
  isFocused,
  children,
  validateStyle
}) => {
  return (
    showSubItems
    && isFocused
    && !showSubItems.typed
    && (
      <ul className={validateStyle('dropdownSubItemContainer')}>
        {children}
      </ul>
    )
  )
}

export default SubItems;