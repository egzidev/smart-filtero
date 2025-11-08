import React from "react";
import {ItemCmp} from "@/types";
import {CheckIcon} from "lucide-react";
import {CheckboxEmpty, CheckboxFilled} from "./CheckboxIcons";

const Item: React.FC<ItemCmp> = ({
  label,
  icon,
  query,
  onClick,
  isTyped = false,
  validateStyle,
  isSelected = false,
  isMultiOperator = false,
}) => {

  const getIcon = (
    icon: React.ComponentType<any> | React.ReactElement,
    size: number = 14
  ) => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    const Icon = icon as React.ComponentType<any>;
    return <Icon size={size} />;
  };

  return (
    <li
      className={isTyped ? validateStyle('queryItem') : validateStyle('dropdownItem')}
      onClick={onClick}
      data-selected={isSelected ? "true" : "false"}
    >
      {icon && getIcon(icon)}
      {label}{' '}{isTyped && <>{query}</>}
      {isMultiOperator && isSelected && (
        <span className={validateStyle('dropdownItemChecked')}><CheckboxFilled size={15} /></span>
      )}
      {isMultiOperator && !isSelected && (
        <span className={validateStyle('dropdownItemChecked')}><CheckboxEmpty size={15} /></span>
      )}
      {!isMultiOperator && isSelected &&
        <span className={validateStyle('dropdownItemChecked')}>{getIcon(CheckIcon, 16)}</span>}
    </li>
  )
}

export default Item;