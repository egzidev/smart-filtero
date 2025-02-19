import React from "react";
import {InputCmp} from "@/types";

const Input: React.FC<InputCmp> = ({
  inputRef,
  query,
  handleInputFocus,
  handleInputChange,
  validateStyle,
}) => (
  <div className={validateStyle('searchWrapper')}>
    <input
      ref={inputRef}
      type="text"
      value={query}
      onFocus={handleInputFocus}
      onChange={handleInputChange}
      placeholder="Search..."
      className={validateStyle('searchInput')}
    />
  </div>
)

export default Input;