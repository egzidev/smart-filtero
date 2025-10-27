import React, {useEffect, useRef, useState} from "react";
import Item from "./../components/Item";
import {Operator} from "@/types";


const SelectedOperator: React.FC<any> = ({
  item,
  selectedOperator,
  operators,
  validateStyle,
  handleChangeOperator,
  getOperatorPosition
}) => {

  const [showOperators, setShowOperators] = useState(false);
  const operatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (operatorRef.current && !operatorRef.current.contains(e.target as Node)) {
        setShowOperators(false);
      }
    };

    if (showOperators) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOperators]);

  const handleClickOperator = (e: React.MouseEvent<HTMLSpanElement>) => {
    // Toggle the dropdown instead of just opening it
    setShowOperators(prev => !prev);
    // Pass the position relative to the current operator element
    if (!showOperators) {
      getOperatorPosition(e.currentTarget.offsetLeft + e.currentTarget.offsetWidth);
    }
  }

  const handleClickOperatorInside = (operator: Operator) => {
    setShowOperators(false);
    handleChangeOperator(item, operator);
  }

  return (
    <div ref={operatorRef} className={validateStyle('selectedSubItem')}>
      <span onClick={(e) => handleClickOperator(e)}>{selectedOperator.label}</span>

      {showOperators && (
        <div className={validateStyle('operatorDropdownContainer')}>
          <ul className={validateStyle('operatorDropdownItemContainer')}>
            {operators.map((operator: Operator) => 
              operator && (
                <Item
                  key={operator.value}
                  label={operator.label}
                  onClick={() => handleClickOperatorInside(operator)}
                  validateStyle={validateStyle}
                />
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SelectedOperator;