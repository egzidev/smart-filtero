import React from "react";
import {SelectedItemCmp} from "@/types";

const SelectedItem: React.FC<SelectedItemCmp> = ({
  item,
  validateStyle,
}) => {
  return (
    <div className={validateStyle('selectedItem')}>
      <span>{item.label}</span>
    </div>
  );
}

export default SelectedItem;