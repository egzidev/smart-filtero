import {X} from "lucide-react";
import React from "react";
import {SelectedItemCmp} from "@/types";

const SelectedItem: React.FC<SelectedItemCmp> = ({
  item,
  removeItem,
  validateStyle,
}) => {
  return (
    <div className={validateStyle('selectedItem')}>
      <span>{item.label}</span>
      {item.typed && (
        <div className={validateStyle('removeIcon')} onClick={() => removeItem(item.value)}>
          <X size={16}/>
        </div>
      )}
    </div>
  );
}

export default SelectedItem;