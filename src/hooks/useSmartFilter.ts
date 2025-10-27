import {useState} from 'react';
import {IconType, Item, Operator, SelectedItem, SubItem, UseSmartFilterResult} from "@/types";
import {emptyString, isMultiOperator, isSameOperatorType} from "./../utils";

const useSmartFilter = (
  items: Item[],
  operators?: Operator[],
  excludeSelected: boolean = true,
): UseSmartFilterResult => {

  const [query, setQuery] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [showSubItems, setShowSubItems] = useState<Item | null>(null);

  const isItemSelected = (subItem: SubItem) => selectedItems.some(selected =>
    selected.subItems.some(sub => sub.value === subItem.value)
  );

  const filteredItems = items.filter(item =>
    item.value?.toLowerCase().includes(query.toLowerCase()) &&
    (!excludeSelected || (!selectedItems.some(selected => selected.value === item.value)))
  );

// Dynamically collect subItems based on selected item
  const subItemsCollector = showSubItems ? showSubItems.subItems || [] : [];
  const subItemsCollectorNew = showSubItems ? showSubItems.subItemsCollector || [] : [];

  const subItemsChange = subItemsCollectorNew.length > 0 ? subItemsCollectorNew : subItemsCollector

  const filteredSubItems = subItemsChange.filter((subItem: SubItem) =>
    subItem.label.toLowerCase().includes(query.toLowerCase())
  ).map((subItem: SubItem) => ({
    ...subItem,
    isSelected: isItemSelected(subItem),
  }));

  const selectItem = ({
    item,
    subItem,
    operator
  }: {
    item: Item,
    subItem?: SubItem,
    operator?: Operator
  }) => {
    if (subItem && operator) {
            // Handle subitem selection with operator (multi-select scenario)
      setSelectedItems(prevSelectedItems => prevSelectedItems.map(selectedItem => {
        if (selectedItem.value === item.value) {
          const isMultiSelectable = isMultiOperator(operator?.value || emptyString());

          const alreadyExists = selectedItem.subItems.some(s => s.value === subItem.value);

          let updatedSubItems: SubItem[] = [];

          if (isMultiSelectable) {
            if (alreadyExists) {
              updatedSubItems = selectedItem.subItems;
            } else {
              updatedSubItems = [...selectedItem.subItems, subItem];
            }
          } else {
            // In single-select mode, we replace
            updatedSubItems = [subItem];
          }

          if (!isMultiSelectable) {
            setShowSubItems(null);
          }

          return {
            ...selectedItem,
            subItems: updatedSubItems,
            subItemsCollector: selectedItem.subItemsCollector,
            subItemSelected: subItem,
            operatorSelected: operator, // Use the provided operator
            tempSelected: updatedSubItems.length === 0, // Keep tempSelected true if no subitems
          };
        }
        return selectedItem;
      }));
    } else if (subItem && !operator) {
      setSelectedItems(prevSelectedItems => prevSelectedItems.map(selectedItem => {
        if (selectedItem.value === item.value) {
          const isMultiSelectable = isMultiOperator(selectedItem.operatorSelected?.value || emptyString());

          const alreadyExists = selectedItem.subItems.some(s => s.value === subItem.value);

          let updatedSubItems: SubItem[] = [];

          if (isMultiSelectable) {
            if (alreadyExists) {
              updatedSubItems = selectedItem.subItems;
            } else {
              updatedSubItems = [...selectedItem.subItems, subItem];
            }
          } else {
            // In single-select mode, we replace
            updatedSubItems = [subItem];
          }

          if (!isMultiSelectable) {
            setShowSubItems(null);
          } else {

          }
          return {
            ...selectedItem,
            subItems: updatedSubItems,
            subItemsCollector: selectedItem.subItemsCollector, // if you use this prop
            subItemSelected: subItem,
            operatorSelected: selectedItem.operatorSelected,
            tempSelected: updatedSubItems.length === 0, // Keep tempSelected true if no subitems
          };
        }
        return selectedItem;
      }));
    } else if (item && !operator) {
      // If no subitem, create a new SelectedItem with empty subItems
      // Determine default operator from global operators or item-specific operators
      const defaultOperator = operators?.[0] || item.operators?.[0] || null;
      
      const newItem: SelectedItem = {
        value: item.value,
        label: item.label ?? '',
        icon: item.icon ?? null, // Ensure icon is passed
        typed: item.typed ?? false,
        subItemsCollector: item.subItems,
        subItems: [],
        tempSelected: true,
        operatorSelected: defaultOperator, // Set default operator if available
        operators: item.operators || operators,
      };

      setSelectedItems(prevSelectedItems => [...prevSelectedItems, newItem]);

      if (item.typed) {
        setQuery('');
      }
    } else if (item && operator) {
      const newIsMultiSelectable = isMultiOperator(operator?.value || emptyString());

      setSelectedItems(prevSelectedItems => {
        return prevSelectedItems.map(selectedItem => {
          if (selectedItem.value === item.value) {
            // Check if we're switching between operator types (multi <-> single)
            const operatorTypeChanged = !isSameOperatorType(
              selectedItem.operatorSelected?.value || emptyString(),
              operator?.value || emptyString()
            );

            if (operatorTypeChanged) {
              // Reset subitems when switching between multi/single operator types
              return {
                ...selectedItem,
                subItems: [],
                subItemSelected: null,
                operatorSelected: operator,
                tempSelected: true,
              };
            } else {
              // Same operator type, keep existing subitems and just update operator
              return {
                ...selectedItem,
                subItems: [...selectedItem.subItems],
                subItemSelected: selectedItem.subItemSelected,
                operatorSelected: operator,
                tempSelected: selectedItem.subItems.length === 0,
              };
            }
          }

          return selectedItem;
        });
      });
    }

    // else if (false) {
    //   setSelectedItems(prevSelectedItems => prevSelectedItems.map(selectedItem => {
    //     if (selectedItem.value === item.value) {
    //       console.log({
    //         subItems: [...selectedItem.subItems],
    //         subItemSelected: subItem,
    //         operatorSelected: operator
    //       })
    //       return {
    //         ...selectedItem,
    //         subItems: [...selectedItem.subItems],
    //         subItemSelected: selectedItem.subItemSelected,
    //         operatorSelected: operator,
    //       }
    //     }
    //     return selectedItem;
    //   }));
    // }

    // setShowSubItems(null);
  };

  const selectItemFromUrl = (item: Item, subItem?: SubItem | { label: string; icon: IconType }) => {
    // @ts-ignore
    setSelectedItems(prevSelectedItems => {
      const existingItemIndex = prevSelectedItems.findIndex(
        selectedItem => selectedItem.value === item.value
      );

      if (existingItemIndex !== -1) {
        // If the item already exists, add the sub-item to its subItems array
        const updatedItem = {
          ...prevSelectedItems[existingItemIndex],
          subItems: prevSelectedItems[existingItemIndex] ? [
            ...prevSelectedItems[existingItemIndex].subItems,
          ] : [],
        };

        // Update the existing item in the selectedItems array
        const updatedSelectedItems = [...prevSelectedItems];
        // @ts-ignore
        updatedSelectedItems[existingItemIndex] = updatedItem;


        return updatedSelectedItems;
      } else {
        // If the item does not exist, add it as a new item with the sub-item
        const newItem = {
          value: item.value,
          label: item.label ?? '',
          subItems: subItem ? [subItem] : [],
          isAsync: item.isAsync ?? false,
          typed: item.typed ?? false,
          icon: item.icon ?? null,
        };

        return newItem ? [...prevSelectedItems, newItem] : prevSelectedItems;
      }
    });

    if (item.typed) {
      setQuery('');
    }
    setShowSubItems(null);
  };


  const removeItem = (itemValue: string, subItemValue?: string, keepEmpty: boolean = false) => {
    console.log('🪝 useSmartFilter.removeItem called:', { itemValue, subItemValue, keepEmpty });
    
    setSelectedItems(prevSelectedItems => {
      console.log('📋 Previous selectedItems:', prevSelectedItems.map(item => ({
        value: item.value,
        label: item.label,
        subItems: item.subItems.length,
        tempSelected: item.tempSelected,
        operator: item.operatorSelected?.value
      })));
      
      // Filter out null values and handle sub-item removal
      const result = prevSelectedItems.reduce<SelectedItem[]>((accumulator, selectedItem) => {
        if (!selectedItem) return accumulator; // Skip null or undefined items

        if (selectedItem.value === itemValue) {
          console.log('✅ Found matching item:', selectedItem.value);
          
          if (subItemValue) {
            console.log('🔍 Filtering out subItem:', subItemValue);
            // Removing a specific subItem - filter it out
            const filteredSubItems = selectedItem.subItems.reduce<SubItem[]>((subAccumulator, subItem) => {
              if (subItem.value !== subItemValue) {
                subAccumulator.push(subItem);
              }
              return subAccumulator;
            }, []);
            
            console.log('📊 Filtered subItems count:', filteredSubItems.length);
            console.log('🔢 selectedItem.typed:', selectedItem.typed);
            console.log('🔢 keepEmpty:', keepEmpty);

            // Only keep the item if it's typed OR has remaining subItems
            // Don't keep empty items even if keepEmpty is true (to prevent showing placeholders after removal)
            const shouldKeep = selectedItem.typed || filteredSubItems.length > 0;
            console.log('❓ Should keep item?', shouldKeep);
            
            if (shouldKeep) {
              const updatedItem = {
                ...selectedItem, 
                subItems: filteredSubItems,
                tempSelected: filteredSubItems.length === 0 // Set tempSelected true when empty
              };
              console.log('✅ Keeping item with tempSelected:', updatedItem.tempSelected);
              accumulator.push(updatedItem);
            } else {
              console.log('❌ Not keeping item (will be removed completely - no subItems left)');
            }
          } else {
            console.log('🗑️ No subItemValue - removing entire parent item');
          }
          // If no subItemValue provided, we're removing the entire parent item
          // Don't add it to accumulator (this removes it completely)
        } else {
          // Different item - keep it in the list
          accumulator.push(selectedItem);
        }

        return accumulator;
      }, []);
      
      console.log('📋 New selectedItems:', result.map(item => ({
        value: item.value,
        label: item.label,
        subItems: item.subItems.length,
        tempSelected: item.tempSelected,
        operator: item.operatorSelected?.value
      })));
      
      return result;
    });
  };

  //  TODO: review this TMP
  /* const getSubItems = (item: Item) => {
     if(item.id && subItems[item.id])
       return subItems[item.id].filter(subItem => !isItemSelected(subItem));
     else return [];
   };*/

  const handleSelect = ({
    item,
    operator,
  }: {
    item: Item;
    operator?: Operator;
  }) => {
    if (operator) {
      selectItem({
        item,
        operator,
      });
    } else {
      selectItem({
        item,
      });
    }

    setShowSubItems(!item.typed ? item : null);
  };

  const changeSelectSubItem = (item: Item) => {
    setShowSubItems(item);
  }

  const resetSelectedItems = () => {
    setQuery('');
    setSelectedItems([]);
    setShowSubItems(null);
  }

  const resetSubItems = () => {
    setShowSubItems(null);
    setQuery('');
  }

  return {
    query,
    setQuery,
    filteredItems,
    filteredSubItems,
    selectedItems,
    selectItem,
    selectItemFromUrl,
    removeItem,
    showSubItems,
    handleSelect,
    resetSelectedItems,
    resetSubItems,
    changeSelectSubItem
  };
};

export default useSmartFilter;
