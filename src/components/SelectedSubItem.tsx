import {X} from "lucide-react";
import React from "react";
import {SelectedSubItemCmp} from "@/types";

const SelectedSubItem: React.FC<SelectedSubItemCmp> = ({
  item,
  removeItem,
  validateStyle,
}) => {

  const getIcon = (
    icon: React.ComponentType<any> | React.ReactElement
  ) => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    const Icon = icon as React.ComponentType<any>;
    return <Icon size={14} />;
  };


  return (
    item.subItems &&
    item.subItems.length > 0 &&
    item.subItems.map((subItem, idx) => (
      <div key={`${subItem}-${idx}`} className={validateStyle('selectedSubItem')}>
        {subItem.icon && (
          <div className={validateStyle('selectedSubItemIcon')}>
            {getIcon(subItem.icon)}
          </div>
        )}
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