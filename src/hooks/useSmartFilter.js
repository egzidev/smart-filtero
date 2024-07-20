import {useState} from 'react';

const useSmartFilter = (items, subItems, excludeSelected = true) => {
  const [query, setQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showSubItems, setShowSubItems] = useState(null);

  const isItemSelected = (item) => selectedItems.some(selected => selected.subItem === item.label);

  const areAllSubItemsSelected = (item) => {
    if (!subItems[item.label]) return false;
    return subItems[item.label].every(subItem => isItemSelected(subItem));
  };

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) &&
    (!excludeSelected || (!selectedItems.some(selected => selected.item === item.label) && !areAllSubItemsSelected(item)))
  );

  const subItemsCollector = subItems[showSubItems?.label] || [];

  const filteredSubItems = subItemsCollector.filter(subItem => {
      return subItem.label.toLowerCase().includes(query.toLowerCase()) && !isItemSelected(subItem);
    }
  );

  const selectItem = (item, subItem = null) => {
    setSelectedItems([...selectedItems, {
      item: item.label,
      subItem: subItem ? subItem.label : null,
      isAsync: item ? item.isAsync : null
    }]);
    setShowSubItems(null); // Clear sub-items when a main item is selected
  };

  const removeItem = (item) => {
    setSelectedItems(selectedItems.filter(i => i.subItem !== item));
  };

  const getSubItems = (item) => {
    return subItems[item.label] ? subItems[item.label].filter(subItem => !isItemSelected(subItem)) : [];
  };

  const handleSelect = (item) => {
    if (subItems[item.label]) {
      setShowSubItems(item);
    } else {
      selectItem(item);
    }
  };

  return {
    query,
    setQuery,
    filteredItems,
    filteredSubItems,
    selectedItems,
    selectItem,
    removeItem,
    getSubItems,
    showSubItems,
    handleSelect,
  };
};

export default useSmartFilter;
