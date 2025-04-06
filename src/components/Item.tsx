import React from "react";
import {ItemCmp} from "@/types";

const Item: React.FC<ItemCmp> = ({
  label,
  icon,
  query,
  onClick,
  isTyped = false,
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
    <li
      className={isTyped ? validateStyle('queryItem') : validateStyle('dropdownItem')}
      onClick={onClick}
    >
      {icon && getIcon(icon)}
      {label}{' '}{isTyped && <>{query}</>}
    </li>
  )
}

export default Item;