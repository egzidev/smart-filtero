import {X} from "lucide-react";
import React from "react";
import {SelectedSubItemCmp} from "@/types";

const SelectedMultiSubItem = React.forwardRef<HTMLDivElement, SelectedSubItemCmp>(({
  item,
  removeItem,
  validateStyle,
  onClick
}, ref) => {

  const getIcon = (
    icon: React.ComponentType<any> | React.ReactElement
  ) => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    const Icon = icon as React.ComponentType<any>;
    return <Icon size={14}/>;
  };

  // Handle empty state - show placeholder
  if (!item.subItems || item.subItems.length === 0) {
    return (
      <div ref={ref} className={validateStyle('selectedSubItem')} onClick={onClick}>
        <span>Select {item.label}</span>
        <div
          className={validateStyle('removeIcon')}
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering onClick
            removeItem(item.value); // Remove entire parent item
          }}
        >
          <X size={16}/>
        </div>
      </div>
    );
  }

  if (item.subItems && item.subItems.length > 1) {
    return (
      <div className={validateStyle('selectedSubItem')}>
        <span onClick={onClick}>{item.subItems.length} selected</span>
        <div
          className={validateStyle('removeIcon')}
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering onClick
            removeItem(item.value); // Remove entire parent item with all subitems
          }}
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

});

SelectedMultiSubItem.displayName = 'SelectedMultiSubItem';

export default SelectedMultiSubItem;