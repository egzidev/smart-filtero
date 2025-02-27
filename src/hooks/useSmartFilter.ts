import {useState} from 'react';
import {Item, SelectedItem, SubItem, SubItemsProps, UseSmartFilterResult} from "@/types";
import {LucideProps} from "lucide-react";

const useSmartFilter = (
  items: Item[],
  subItems: SubItemsProps,
  excludeSelected: boolean = true,
): UseSmartFilterResult => {

  const [query, setQuery] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [showSubItems, setShowSubItems] = useState<Item | null>(null);


  // const isItemSelected = (item: SubItem) => selectedItems.some(selected => selected.subItems.includes(item.label));
  const isItemSelected = (item: SubItem) => selectedItems.some(selected =>
    selected.subItems.some(sub => sub.value === item.value)
  );

  /*const areAllSubItemsSelected = (item: Item) => {
    if (!subItems[item.label]) return false;
    return subItems[item.label].every(subItem => isItemSelected(subItem));
  };*/

  const filteredItems = items.filter(item =>
    item.value?.toLowerCase().includes(query.toLowerCase()) &&
    (!excludeSelected || (!selectedItems.some(selected => selected.item === item.value)))
  );

  const subItemsCollector = subItems[showSubItems?.value ?? ''] || [];

  const filteredSubItems = subItemsCollector.filter(subItem =>
    subItem.value.toLowerCase().includes(query.toLowerCase()) && !isItemSelected(subItem)
  );

  const selectItem = (item: Item, subItem?: SubItem) => {
    if (subItem) {
      setSelectedItems(prevSelectedItems => prevSelectedItems.map(selectedItem => {
        if (selectedItem.item === item.label) {
          const updatedSubItems: SubItem[] = [...selectedItem.subItems, subItem];
          return {
            ...selectedItem,
            subItems: updatedSubItems,
          };
        }
        return selectedItem;
      }));
    } else {

      // @ts-ignore
      const newItem: SelectedItem = {
        value: item.value,
        item: item.label ?? '',
        subItems: [],
        isAsync: item.isAsync ?? false,
        typed: item.typed ?? false,
      };

      setSelectedItems(prevSelectedItems => [...prevSelectedItems, newItem]);

      if (item.typed) {
        setQuery('');
      }
    }
    setShowSubItems(null);
  };

  const selectItemFromUrl = (item: Item, subItem?: SubItem | { label: string; icon: React.ComponentType<LucideProps> }) => {
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
          id: item.value,
          item: item.label ?? '',
          subItems: subItem ? [subItem] : [],
          isAsync: item.isAsync ?? false,
          typed: item.typed ?? false,
        };

        return newItem ? [...prevSelectedItems, newItem] : prevSelectedItems;
      }
    });

    if (item.typed) {
      setQuery('');
    }
    setShowSubItems(null);
  };


  const removeItem = (item: string, subItemValue?: string) => {
    setSelectedItems(prevSelectedItems => {
      // Filter out null values and handle sub-item removal
      return prevSelectedItems.reduce<SelectedItem[]>((accumulator, selectedItem) => {
        if (!selectedItem) return accumulator; // Skip null or undefined items

        if (selectedItem.item === item) {
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

  const handleSelect = (item: Item) => {
    selectItem(item);
    setShowSubItems(!item.typed ? item : null);
  };

  const resetSelectedItems = () => {
    setQuery('');
    setSelectedItems([]);
    setShowSubItems(null);
  }

  const resetSubItems = () => {
    setShowSubItems(null);
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
    resetSubItems
  };
};

export default useSmartFilter;
