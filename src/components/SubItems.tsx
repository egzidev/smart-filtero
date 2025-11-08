import React from "react";
import {Search} from "lucide-react";
import {SubItemsCmp} from "@/types";

const SubItems: React.FC<SubItemsCmp> = ({
  showSubItems,
  isFocused,
  children,
  validateStyle,
  subItemQuery,
  subItemInputRef,
  handleSubItemInputChange,
  subItemInputPlaceholder
}) => {
  return (
    showSubItems
    && isFocused
    && !showSubItems.typed
    && (
      <div className={validateStyle('dropdownSubItemWrapper')}>
        {/* Search input for subitems */}
        <div className={validateStyle('dropdownSubItemSearch')}>
          <Search className={validateStyle('dropdownSubItemSearchIcon')} size={16} />
          <input
            ref={subItemInputRef}
            type="text"
            value={subItemQuery || ''}
            onChange={handleSubItemInputChange}
            placeholder={subItemInputPlaceholder}
            className={validateStyle('dropdownSubItemSearchInput')}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
          />
        </div>
        <ul className={validateStyle('dropdownSubItemList')}>
          {children}
        </ul>
      </div>
    )
  )
}

export default SubItems;