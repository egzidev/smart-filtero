import {useState} from 'react';
import {IconType, Item, Operator, SelectedItem, SubItem, UseSmartFilterResult} from "@/types";
import {emptyString, isMultiOperator} from "./../utils";

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

  const currentOperator = selectedItems.find(sel => sel.value === showSubItems?.value)?.operatorSelected;
  const isMultiSelectable = currentOperator && ["any", "not-any"].includes(currentOperator.value);

  const filteredSubItems = subItemsChange.filter(subItem =>
    subItem.label.toLowerCase().includes(query.toLowerCase())
  ).map(subItem => ({
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
    if (subItem && !operator) {
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
            tempSelected: false,
          };
        }
        return selectedItem;
      }));
    } else if (item && !operator) {
      // If no subitem, create a new SelectedItem with empty subItems
      const newItem: SelectedItem = {
        value: item.value,
        label: item.label ?? '',
        icon: item.icon ?? null, // Ensure icon is passed
        typed: item.typed ?? false,
        subItemsCollector: item.subItems,
        subItems: [],
        tempSelected: true,
      };

      setSelectedItems(prevSelectedItems => [...prevSelectedItems, newItem]);

      if (item.typed) {
        setQuery('');
      }
    } else if (item && operator) {
      const isMultiSelectable = isMultiOperator(operator?.value || emptyString())

      setSelectedItems(prevSelectedItems => {
        console.log('prevSelectedItems', prevSelectedItems)
        return prevSelectedItems.map(selectedItem => {
          if (selectedItem.value === item.value) {
            // If item has no subItems and operator is multi-select, add item as a virtual subItem
            // if (isMultiSelectable && (!item.subItems || item.subItems.length === 0)) {
            //   const alreadyExists = selectedItem.subItems.some(sub => sub.value === item.value);
            //   const updatedSubItems = alreadyExists
            //     ? selectedItem.subItems
            //     : [
            //       ...selectedItem.subItems, {
            //         value: item.value,
            //         label: item.label ?? '',
            //         icon: item.icon ?? null,
            //       }
            //     ];
            //
            //   return {
            //     ...selectedItem,
            //     subItems: updatedSubItems,
            //     subItemSelected: {
            //       value: item.value,
            //       label: item.label ?? '',
            //       icon: item.icon ?? null,
            //     },
            //     operatorSelected: operator,
            //   };
            // }

            // If not multi-select logic or item has real subItems
            if (!isMultiSelectable && selectedItem.subItems?.length > 1) {
              return {
                ...selectedItem,
                // subItemsCollector: selectedItem.subItemsCollectors,
                subItems: [],
                subItemSelected: null,
                operatorSelected: operator,
                tempSelected: true,
              };
            } else {
              return {
                ...selectedItem,
                subItems: [...selectedItem.subItems],
                subItemSelected: selectedItem.subItemSelected,
                // subItemsCollector: selectedItem.subItemsCollectors,
                operatorSelected: operator,
                tempSelected: false,
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


  const removeItem = (itemValue: string, subItemValue?: string) => {
    setSelectedItems(prevSelectedItems => {
      // Filter out null values and handle sub-item removal
      return prevSelectedItems.reduce<SelectedItem[]>((accumulator, selectedItem) => {
        if (!selectedItem) return accumulator; // Skip null or undefined items

        if (selectedItem.value === itemValue) {
          if (subItemValue) {
            // Filter out the specific subItem based on value using reduce
            const filteredSubItems = selectedItem.subItems.reduce<SubItem[]>((subAccumulator, subItem) => {
              if (subItem.value !== subItemValue) {
                subAccumulator.push(subItem);
              }
              return subAccumulator;
            }, []);

            // Only push the item if there are remaining subItems
            if (selectedItem.typed || filteredSubItems.length > 0) {
              accumulator.push({...selectedItem, subItems: filteredSubItems});
            }
          }
        } else {
          // Apply the filter logic without using filter
          if (selectedItem.typed || selectedItem.subItems.length > 0 || !selectedItem.subItems) {
            accumulator.push(selectedItem);
          }
        }

        return accumulator;
      }, []);
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
