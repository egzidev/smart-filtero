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
      <span>{item.item}</span>
      {item.typed && (
        <div className={validateStyle('removeIcon')} onClick={() => removeItem(item)}>
          <X size={16}/>
        </div>
      )}
    </div>
  );
}

export default SelectedItem;