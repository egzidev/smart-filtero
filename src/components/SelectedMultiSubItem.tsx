import {X} from "lucide-react";
import React from "react";
import {SelectedSubItemCmp} from "@/types";

const SelectedMultiSubItem: React.FC<SelectedSubItemCmp> = ({
  item,
  removeItem,
  validateStyle,
  onClick
}) => {

  const getIcon = (
    icon: React.ComponentType<any> | React.ReactElement
  ) => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    const Icon = icon as React.ComponentType<any>;
    return <Icon size={14}/>;
  };

  if (item.subItems && item.subItems.length > 1) {
    return (
      <div className={validateStyle('selectedSubItem')} onClick={onClick}>
        <span>{item.subItems.length} selected</span>
        <div
          className={validateStyle('removeIcon')}
        >
          <X size={16}/>
        </div>
      </div>
    )
  } else {
    return (
      item.subItems &&
      item.subItems.length > 0 &&
      item.subItems.map((subItem, idx) => (
        <div key={`${subItem}-${idx}`} className={validateStyle('selectedSubItem')} onClick={onClick}>
          {subItem.icon && (
            <div className={validateStyle('selectedSubItemIcon')}>
              {getIcon(subItem.icon)}
            </div>
          )}
          <span>{subItem.label}</span>
          <div
            className={validateStyle('removeIcon')}
            onClick={() => removeItem(item.value, subItem.value)}
          >
            <X size={16}/>
          </div>
        </div>
      ))
    )
  }

}

export default SelectedMultiSubItem;