import {ChevronDown} from "lucide-react";
import React from "react";
import {SelectedSubItemCmp} from "@/types";
import RemoveIcon from "./RemoveIcon";

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
        <ChevronDown className={validateStyle('selectedChevronIcon')} size={14} />
        <RemoveIcon
          validateStyle={validateStyle}
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering onClick
            removeItem(item.value); // Remove entire parent item
          }}
        />
      </div>
    );
  }

  if (item.subItems && item.subItems.length > 1) {
    return (
      <div className={validateStyle('selectedSubItem')} onClick={onClick}>
        <span>{item.subItems.length} selected</span>
        <ChevronDown className={validateStyle('selectedChevronIcon')} size={14} />
        <RemoveIcon
          validateStyle={validateStyle}
          onClick={(e) => {
            e.stopPropagation();
            removeItem(item.value);
          }}
        />
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
          <ChevronDown className={validateStyle('selectedChevronIcon')} size={14} />
          <RemoveIcon
            validateStyle={validateStyle}
            onClick={(e) => {
              e.stopPropagation();
              removeItem(item.value, subItem.value);
            }}
          />
        </div>
      ))
    )
  }

});

SelectedMultiSubItem.displayName = 'SelectedMultiSubItem';

export default SelectedMultiSubItem;