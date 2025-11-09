import React from "react";
import {SelectedItemCmp} from "@/types";
import RemoveIcon from "./RemoveIcon";

const SelectedText: React.FC<SelectedItemCmp> = ({
  item,
  removeItem,
  validateStyle,
}) => {
  return (
    <div className={validateStyle('selectedText')}>
      <span>{item.label}</span>
      <RemoveIcon
        validateStyle={validateStyle}
        onClick={(e) => {
          e.stopPropagation();
          removeItem?.(item.value);
        }}
      />
    </div>
  );
}

export default SelectedText;