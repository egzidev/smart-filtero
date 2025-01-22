import {useState} from 'react';
import {Item, SelectedItem, SubItem, SubItems, UseSmartFilterResult} from "@/types";
import {LucideProps} from "lucide-react";

const useSmartFilter = (
  items: Item[],
  subItems: SubItems,
  excludeSelected: boolean = true
): UseSmartFilterResult => {

  const [query, setQuery] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [showSubItems, setShowSubItems] = useState<Item | null>(null);

  // const isItemSelected = (item: SubItem) => selectedItems.some(selected => selected.subItems.includes(item.label));
  const isItemSelected = (item: SubItem) => selectedItems.some(selected =>
    selected.subItems.some(sub => sub.label === item.label)
  );
  /*const areAllSubItemsSelected = (item: Item) => {
    if (!subItems[item.label]) return false;
    return subItems[item.label].every(subItem => isItemSelected(subItem));
  };*/

  const filteredItems = items.filter(item =>
    item.label?.toLowerCase().includes(query.toLowerCase()) &&
    (!excludeSelected || (!selectedItems.some(selected => selected.item === item.label)))
  );

  const subItemsCollector = subItems[showSubItems?.id ?? ''] || [];

  const filteredSubItems = subItemsCollector.filter(subItem =>
    subItem.label.toLowerCase().includes(query.toLowerCase()) && !isItemSelected(subItem)
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

      const newItem: SelectedItem = {
        id: item.id,
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
    setSelectedItems(prevSelectedItems => {
      const existingItemIndex = prevSelectedItems.findIndex(
        selectedItem => selectedItem.id === item.id
      );

      if (existingItemIndex !== -1) {
        // If the item already exists, add the sub-item to its subItems array
        const updatedItem = {
          ...prevSelectedItems[existingItemIndex],
          subItems: [
            ...prevSelectedItems[existingItemIndex].subItems,
          ],
        };

        // Update the existing item in the selectedItems array
        const updatedSelectedItems = [...prevSelectedItems];
        updatedSelectedItems[existingItemIndex] = updatedItem;


        return updatedSelectedItems;
      } else {
        // If the item does not exist, add it as a new item with the sub-item
        const newItem = {
          id: item.id,
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


  const removeItem = (item: string, subItemLabel?: string) => {
    setSelectedItems(prevSelectedItems => {
      // Filter out null values and handle sub-item removal
      return prevSelectedItems.reduce<SelectedItem[]>((accumulator, selectedItem) => {
        if (!selectedItem) return accumulator; // Skip null or undefined items

        if (selectedItem.item === item) {
          if (subItemLabel) {
            // Filter out the specific subItem based on label using reduce
            const filteredSubItems = selectedItem.subItems.reduce<SubItem[]>((subAccumulator, subItem) => {
              if (subItem.label !== subItemLabel) {
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

  const getSubItems = (item: Item) => {
    if(item.id && subItems[item.id])
      return subItems[item.id].filter(subItem => !isItemSelected(subItem));
    else return [];
  };

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
    getSubItems,
    showSubItems,
    handleSelect,
    resetSelectedItems,
    resetSubItems
  };
};

export default useSmartFilter;
