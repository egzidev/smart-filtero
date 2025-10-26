import React, {useCallback, useEffect, useState} from "react";
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

  const handleClickOperator = (e: React.MouseEvent<HTMLSpanElement>) => {
    setShowOperators(true);
    getOperatorPosition(e.currentTarget.offsetLeft)
  }

  const handleClickOperatorInside = (e: React.MouseEvent<HTMLLIElement>, operator: Operator) => {
    handleChangeOperator(item, operator, e);
    setShowOperators(false);
  }

  return (
    <div className={validateStyle('selectedSubItem')}>
      <span onClick={(e) => handleClickOperator(e)}>{selectedOperator.label}</span>

      {showOperators && (
        <div className={validateStyle('dropdownContainer')}>
          <ul className={validateStyle('dropdownItemContainer')}>
            {operators.map((operator: Operator) => (
              <Item
                key={operator.value}
                label={operator.label}
                onClick={(e) => handleClickOperatorInside(e, operator)}
                validateStyle={validateStyle}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SelectedOperator;