import React from "react";
import {ItemCmp} from "@/types";
import {CheckIcon, Square, SquareCheck} from "lucide-react";

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
    >
      {icon && getIcon(icon)}
      {label}{' '}{isTyped && <>{query}</>}
      {isMultiOperator && isSelected && (
        <span className={validateStyle('dropdownItemChecked')}>{getIcon(SquareCheck, 16)}</span>
      )}
      {isMultiOperator && !isSelected && (
        <span className={validateStyle('dropdownItemChecked')}>{getIcon(Square, 16)}</span>
      )}
      {!isMultiOperator && isSelected &&
        <span className={validateStyle('dropdownItemChecked')}>{getIcon(CheckIcon, 16)}</span>}
    </li>
  )
}

export default Item;