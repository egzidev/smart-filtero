import {X} from "lucide-react";
import React from "react";
import {SelectedSubItemCmp} from "@/types";

const SelectedSubItem: React.FC<SelectedSubItemCmp> = ({
  item,
  removeItem,
  validateStyle,
}) => {
  return (
    item.subItems &&
    item.subItems.length > 0 &&
    item.subItems.map((subItem, idx) => (
      <div key={`${subItem}-${idx}`} className={validateStyle('selectedSubItem')}>
        <span>{subItem.label}</span>
        <div
          className={validateStyle('removeIcon')}
          onClick={() => removeItem(item, subItem.value)}
        >
          <X size={16}/>
        </div>
      </div>
    ))
  );
}

export default SelectedSubItem;