import {X} from "lucide-react";
import React from "react";
import {SelectedItemCmp} from "@/types";

const SelectedText: React.FC<SelectedItemCmp> = ({
  item,
  removeItem,
  validateStyle,
}) => {
  return (
    <div className={validateStyle('selectedText')}>
      <span>{item.label}</span>
      <div className={validateStyle('removeIcon')} onClick={() => removeItem?.(item.value)}>
        <X size={16}/>
      </div>
    </div>
  );
}

export default SelectedText;