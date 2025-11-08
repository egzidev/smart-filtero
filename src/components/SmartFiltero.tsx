import {Fragment, useCallback, useEffect, useRef, useState} from 'react';
import {Type} from 'lucide-react';
import useSmartFilter from './../hooks/useSmartFilter';
import SelectedItem from './../components/SelectedItem';
import React from "react";
import SelectedSubItem from "./../components/SelectedSubItem";
import QueryItem from "./../components/QueryItem";
import Items from "./../components/Items";
import Item from "./../components/Item";
import SubItems from "./../components/SubItems";
import {
  SmartFilteroProps,
  Item as ItemProps,
  SubItem as SubItemProps,
  SelectedItem as SelectedItemType,
  StyleThemeProps,
  Operator
} from "./../types";
import SelectedText from "./../components/SelectedText";
import {X} from "lucide-react";
import {
  emptyString,
  hasSearchUrl,
  isMultiOperator,
  isSameOperatorType,
  transformLabelToQueryParam,
  updateURLParams
} from "./../utils";
import "./../theme.css";
import styles from './../styles.module.css';
import Input from "./../components/Input";
import useAsync from "./../hooks/useAsync";
import useUpdateEffect from "./../hooks/useUpdateEffect";
import SelectedOperator from "./../components/SelectedOperator";
import SelectedMultiSubItem from "./../components/SelectedMultiSubItem";

const SmartFiltero: React.FC<SmartFilteroProps> = ({
  items,
  operators,
  fetchFunctions,
  excludeSelected = true,
  styleTheme = {},
  onChangeSelection,
  withUrl = false,
  inputPlaceholder = 'Search or filter by...',
  subItemInputPlaceholder = 'Type to search...',
  searchItem = {
    label: 'Search for this text',
    icon: Type,
  },
  defaultSearchQuery = '',
  defaultQuerySelection = '',
  defaultSelectedItems = [],
  debounceDelay = 500,
  noResultsText = "No results found",
  loadingText = "Loading...",
  onItemClick,
  onItemRemoveClick,
}) => {
  const [subItemDropdownPosition, setSubItemDropdownPosition] = useState<{ left: number; } | null>(null);

  const {
    // states
    query,
    filteredItems,
    filteredSubItems,
    selectedItems,
    showSubItems,
    // functions
    setQuery,
    selectItem,
    selectItemFromUrl,
    removeItem,
    handleSelect,
    resetSelectedItems,
    resetSubItems,
    changeSelectSubItem
  } = useSmartFilter(items, operators, excludeSelected);

  const {
    // states
    isLoading,
    isSearching,
    hasResults,
    fetchDebounceOnQuery,
    // functions
    fetchInitial,
    setIsSearching,
    setHasResults,
  } = useAsync(debounceDelay, fetchFunctions);

  const selectedOperator = operators ? operators[0] : null

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevLengthRef = useRef(selectedItems.length);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const collectionRef = useRef<{ id: string; value: string; operator?: Operator }[]>([]);

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ left: number } | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const [operatorSelected, setOperatorSelected] = useState<Operator>(null);
  const [dropdownSource, setDropdownSource] = useState<'input' | 'subitem' | null>(null); // Track what triggered the dropdown
  const [subItemQuery, setSubItemQuery] = useState<string>(''); // Search query for subitems
  const subItemInputRef = useRef<HTMLInputElement>(null);

  const recalculatePosition = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (scrollableRef.current) {
        const scrollableElement = scrollableRef.current;

        // Optionally scroll the container to the end (if necessary)
        scrollableElement.scrollTo({
          left: scrollableElement.scrollWidth,
        });
        if (!isMultiOperator(operatorSelected?.value || emptyString())) {
          setSubItemDropdownPosition(null);
          setOperatorSelected(selectedOperator)
        }

        // Resolve the promise after the scroll operation
        setTimeout(() => resolve(), 0); // Adjust delay to fit your animation duration
      } else {
        resolve();
      }
    });
  }, []);

  const tempSelectedRef = useRef<HTMLDivElement | null>(null);

  const recalculateDropdown = useCallback(() => {
    if (scrollableRef.current) {
      const scrollableElement = scrollableRef.current;

      // Prefer tempSelected ref if available
      const targetElement = tempSelectedRef.current || inputRef.current;
      if (!targetElement) return;

      const containerScrollLeft = scrollableElement.scrollLeft;
      const targetOffsetLeft = targetElement.offsetLeft;

      setDropdownPosition({
        left: targetOffsetLeft - containerScrollLeft,
      });
    }
  }, []);

  const removeEmptySubItem = () => {
    selectedItems.forEach(item => {
      // Don't remove empty items if they have an operator (keep the placeholder visible)
      const hasOperator = item.operatorSelected !== undefined && item.operatorSelected !== null;
      
      if (item.subItems.length == 0 && item.value !== 'search' && !hasOperator) {
        removeSingleItem(item.value);
        resetSubItems();
        recalculatePosition().then(recalculateDropdown);
      }
    });
  }
  const handleInputFocus = () => {
    setIsFocused(true);
    setIsDropdownVisible(false); // Hide the dropdown initially

    // Reset all dropdown-related state immediately
    setSubItemDropdownPosition(null);
    tempSelectedRef.current = null; // Clear the temp selected ref to ensure dropdown aligns to input
    resetSubItems();
    setSubItemQuery(''); // Clear subitem query when resetting
    setDropdownSource('input'); // Mark that dropdown is triggered from input
    
    recalculatePosition().then(() => {
      recalculateDropdown(); // Recalculate the dropdown position
      // Only after recalculation is complete, show the dropdown
      setIsDropdownVisible(true);
      // Clean up empty items after dropdown is positioned correctly
      removeEmptySubItem();
    });
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
      setIsFocused(false);
      removeEmptySubItem()
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsFocused(true);  // Re-focus the dropdown when typing
    // Don't trigger async fetch here - that's handled in subitem search
  };

  const handleSubItemInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubItemQuery = e.target.value;
    setSubItemQuery(newSubItemQuery);

    if (showSubItems?.isAsync) {
      // Check if there are matching subitems first
      const hasMatchingSubItems = filteredSubItems.some((subItem: any) =>
        subItem.label?.toLowerCase().includes(newSubItemQuery.toLowerCase()) ||
        subItem.value?.toLowerCase().includes(newSubItemQuery.toLowerCase())
      );

      const isDeleting = newSubItemQuery.length < subItemQuery.length; // Detect backspace

      // Fetch only if there are no matches OR if deleting characters
      if (!hasMatchingSubItems || isDeleting) {
        setIsSearching(true);
        fetchDebounceOnQuery(showSubItems, newSubItemQuery, (response) => {
          setHasResults(response.length > 0);
          setIsSearching(false);
        });
      } else {
        setHasResults(true); // We have matches locally
      }
    }
  };

  const handleClickItem = (item: ItemProps, e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();

    handleSelect({
      item,
    });

    // Update collection for item selection
    const defaultOperator = operators ? operators[0] : null;
    const newItem = operators && defaultOperator 
      ? {id: item.value, value: item.value, operator: defaultOperator}
      : {id: item.value, value: item.value};
    
    // Add to collection if it's a typed item (search)
    if (item.typed) {
      collectionRef.current.push(newItem);
      onChangeSelection(collectionRef.current);
      syncURLWithCollection(collectionRef.current);
    }

    setQuery('');
  }

  const handleClickSubItem = (subItem: SubItemProps, e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
    if (!showSubItems) return;

    // Get the currently active operator for this item group using the same logic as rendering
    const activeOperator = getCurrentOperatorForRendering();
    const isMulti = isMultiOperator(activeOperator?.value || emptyString());
    
    // Clear subitem query after selection (for non-multi operators)
    if (!isMulti) {
      setSubItemQuery('');
    }

    // Create the new collection entry - only include operator if it exists
    const newItem = activeOperator 
      ? {id: showSubItems.value, value: subItem.value, operator: activeOperator}
      : {id: showSubItems.value, value: subItem.value};

    // Update collection based on operator type
    
    if (!isMulti) {
      // For single operators ("is", "is not"), replace any existing item with same id
      selectItem({item: showSubItems, subItem, operator: activeOperator});
      tempSelectedRef.current = null;
      
      const existingIndex = collectionRef.current.findIndex(
        entry => entry.id === newItem.id
      );
      
      if (existingIndex !== -1) {
        // Replace existing item
        collectionRef.current[existingIndex] = newItem;
      } else {
        // Add new item
        collectionRef.current.push(newItem);
      }
    } else {
      // For multi operators ("any of", "not any of"), check if item is already selected
      const existingIndex = collectionRef.current.findIndex(
        entry => entry.id === newItem.id && entry.value === newItem.value
      );

      if (existingIndex !== -1) {
        // Item is already selected - REMOVE it (unselect)
        collectionRef.current.splice(existingIndex, 1);
        // Also remove from selectedItems, but keep the parent item even if empty (keepEmpty: true)
        removeSingleItem(newItem.id, newItem.value, true);
      } else {
        // Item is not selected - ADD it
        selectItem({item: showSubItems, subItem, operator: activeOperator});
        tempSelectedRef.current = null;
        collectionRef.current.push(newItem);
      }
    }

    // Call onChangeSelection with the updated collection
    onChangeSelection(collectionRef.current);

    // Sync URL with collection changes
    syncURLWithCollection(collectionRef.current);

    // Reset query after selection
    setQuery('');

    if (showSubItems.onClick) {
      showSubItems.onClick(showSubItems, subItem);
    }

    if (onItemClick) {
      onItemClick(showSubItems, subItem);
    }

    // Use the activeOperator we calculated earlier (which includes the most up-to-date operator)
    if(!isMulti) {
      // For single operators, close the dropdown after selection
      setIsFocused(false);
    } else {
      // For multi operators, keep dropdown open to allow multiple selections
      // The dropdown should stay at the current position
    }
  };

  const handleChangeOperator = (item: SelectedItemType, selectedOperator: Operator) => {
    const currentOperator = item.operatorSelected;
    const newOperator = selectedOperator;
    
    // Check if we're switching between operator types (multi <-> single)
    const operatorTypeChanged = !isSameOperatorType(
      currentOperator?.value || emptyString(), 
      newOperator?.value || emptyString()
    );

    selectItem({item, operator: selectedOperator});

    if (operatorTypeChanged) {
      // Reset selected items when switching between multi/single operator types
      // Remove all items with this id from collection
      collectionRef.current = collectionRef.current.filter(
        (entry) => entry.id !== item.value
      );


      
      // Open dropdown for subitem selection after operator type change
      if ((item.subItems && item.subItems.length > 0) || (item.subItemsCollector && item.subItemsCollector.length > 0)) {
        // Reset dropdown positioning state before opening
        tempSelectedRef.current = null;
        setSubItemDropdownPosition(null);
        setDropdownSource('input'); // Operator change shows dropdown from item position, treat as 'input' style
        
        setIsFocused(true);
        setIsDropdownVisible(false); // Hide dropdown temporarily
        
        // Set the showSubItems to the current item to show its subitems
        const itemForSubItems: ItemProps = {
          value: item.value,
          label: item.label,
          icon: item.icon,
          subItems: item.subItemsCollector || item.subItems || [],
          operators: item.operators,
          operatorSelected: selectedOperator
        };
        changeSelectSubItem(itemForSubItems);
        
        // Recalculate dropdown position after DOM update
        setTimeout(() => {
          recalculatePosition().then(() => {
            recalculateDropdown();
            setIsDropdownVisible(true); // Show dropdown after recalculation
          });
        }, 0);
      }
    } else {
      // Same operator type, just update the operator for existing items
      collectionRef.current = collectionRef.current.map(entry => {
        if (entry.id === item.value) {
          // Only include operator if it exists
          return selectedOperator 
            ? { ...entry, operator: selectedOperator }
            : (() => {
                const { operator, ...rest } = entry;
                return rest;
              })();
        }
        return entry;
      });


      
      // Update showSubItems with the new operator even when operator type doesn't change
      if (showSubItems && showSubItems.value === item.value) {
        const updatedShowSubItems: ItemProps = {
          ...showSubItems,
          operatorSelected: selectedOperator
        };
        changeSelectSubItem(updatedShowSubItems);
      }
    }

    // Set the selected operator state
    setOperatorSelected(selectedOperator);

    // Notify parent
    onChangeSelection(collectionRef.current);

    // Sync URL with collection changes  
    syncURLWithCollection(collectionRef.current);

    // Handle dropdown repositioning based on operator type change
    if (operatorTypeChanged) {
      // Operator type changed - dropdown will be repositioned above in the operatorTypeChanged block
      // No additional action needed here
    } else if (!isMultiOperator(selectedOperator?.value || emptyString()) && item.subItems && item.subItems.length > 1) {
      // Same operator type, non-multi operator with multiple subitems - show dropdown to change selection
      tempSelectedRef.current = null;
      setSubItemDropdownPosition(null);
      setDropdownSource('input'); // Treat as input-style positioning
      
      setIsFocused(true);
      setIsDropdownVisible(false); // Hide dropdown temporarily
      
      // Recalculate dropdown position after DOM update for non-multi operators
      setTimeout(() => {
        recalculatePosition().then(() => {
          recalculateDropdown();
          setIsDropdownVisible(true); // Show dropdown after recalculation
        });
      }, 0);
    } else {
      // For other cases (multi-operator staying multi, or single staying single with only 1 subitem)
      // Don't show dropdown, just update the operator
      // Reset positioning state to prevent interference with future dropdown opens
      if (!isMultiOperator(selectedOperator?.value || emptyString())) {
        tempSelectedRef.current = null;
        setSubItemDropdownPosition(null);
        setDropdownSource(null);
      }
    }
  };

  const handleChangeSubItem = (item: ItemProps, e: React.MouseEvent<HTMLDivElement>) => {
    setIsFocused(true);
    changeSelectSubItem(item);
    setDropdownSource('subitem'); // Mark that dropdown is triggered from clicking a subitem
    setSubItemDropdownPosition({
      left: e.currentTarget.offsetLeft,
    });
    setOperatorSelected(item.operatorSelected || null)
  }

  const handleSearchItem = (type: 'click' | 'default', e?: React.MouseEvent<HTMLLIElement>) => {
    if (e) e.preventDefault();

    // Determine the label based on the type
    const label = type === 'click' ? query : defaultQuerySelection;

    const searchItem = {
      id: `search`,
      value: label,
    };

    // Add searchItem to the previous collection
    const updatedCollection = [...collectionRef.current, searchItem];

    handleSelect({
      item: {
        value: `search`,
        label,
        subItems: [],
        icon: Type,
        typed: true,
      }
    });

    setQuery('');



    // Update onChangeSelection with the previous collection + the new search item
    onChangeSelection(updatedCollection);

    // Update the collection ref with the updated collection
    collectionRef.current = updatedCollection;

    // Sync URL with collection changes
    syncURLWithCollection(updatedCollection);
  };

  const removeSingleItem = (selectedItemValue: string, selectedSubItemValue?: string, keepEmpty: boolean = false) => {
    console.log('🔧 removeSingleItem called:', { selectedItemValue, selectedSubItemValue, keepEmpty });
    console.log('📚 Current collectionRef:', JSON.stringify(collectionRef.current, null, 2));
    
    // Find parent item
    const parentItem = items.find(i => i.value === selectedItemValue);

    // Find subItem if value is provided
    const subItem = parentItem?.subItems?.find(i => i.value === selectedSubItemValue);
    
    console.log('🔍 Found parentItem:', parentItem?.label);
    console.log('🔍 Found subItem:', subItem?.label);

    // Determine the updated collection
    let updatedCollection: any[] = [];
    if (selectedSubItemValue) {
      console.log('➡️ Removing subItem, calling removeItem with keepEmpty:', keepEmpty);
      // Handle subItem removal
      removeItem(selectedItemValue || '', selectedSubItemValue, keepEmpty);

      // Remove the specific item from the collection
      updatedCollection = collectionRef.current.filter(
        (colItem) => colItem.id !== selectedItemValue || colItem.value !== selectedSubItemValue
      );
      console.log('📚 Updated collection after subItem removal:', JSON.stringify(updatedCollection, null, 2));
    } else {
      console.log('➡️ Removing entire parent item');
      // Handle item removal
      removeItem(selectedItemValue || '');

      // Remove the specific item from the collection
      updatedCollection = collectionRef.current.filter(
        (colItem) => colItem.id !== selectedItemValue
      );
      console.log('📚 Updated collection after parent removal:', JSON.stringify(updatedCollection, null, 2));
    }

    // Call onChangeSelection with the updated collection
    onChangeSelection(updatedCollection);

    // Update the collection ref with the updated collection
    collectionRef.current = updatedCollection;

    // Sync URL with collection changes
    syncURLWithCollection(updatedCollection);

    if (onItemRemoveClick && parentItem && subItem) {
      onItemRemoveClick(parentItem, subItem);
    }
  };

  const removeAllItems = () => {
    selectedItems.forEach(item => {
      removeSingleItem(item.value);
    });
    resetSelectedItems();
  };

  const validateStyle = (style: string) => {
    // Convert the string to a StyleThemeProps key if valid, or default
    return styleTheme[style as keyof StyleThemeProps] || styles[style];
  };

  useEffect(() => {
    if (defaultSearchQuery && defaultQuerySelection) {
      console.error("You can only provide either `defaultSearchQuery` or `defaultQuerySelection`, not both.");
    }

    if (defaultSearchQuery && !selectedItems.length && !defaultQuerySelection) {
      setQuery(defaultSearchQuery);
    }

    if (defaultQuerySelection && !selectedItems.length && !defaultSearchQuery) {
      handleSearchItem('default')
    }

    return () => {
      resetSelectedItems();
    }
  }, [])

  useUpdateEffect(() => {
    if (showSubItems?.isAsync) {
      fetchInitial(showSubItems);
      setSubItemQuery(''); // Clear subitem query when switching items
    } else {
      setSubItemQuery(''); // Clear subitem query when switching to non-async items
    }
  }, [showSubItems]);

  useEffect(() => {
    if (!withUrl) return;

    const params = new URLSearchParams(window.location.search);
    const urlQuery = params.get('query');
    if (urlQuery) setQuery(urlQuery);

    const allParams: Record<string, string> = {};
    params.forEach((value, key) => {
      allParams[key] = value;
    });

    // Parse pipe separator URL parameters (operator:value1|value2)
    Object.entries(allParams).forEach(([key, value]) => {
      if (key === 'search') {
        selectItemFromUrl({
          value: "search",
          label: value,
          subItems: [],
          icon: Type,
          typed: true,
        });
        return;
      }

      // Find the corresponding item
      const selectedItem = items.find(item => transformLabelToQueryParam(item.value) === key);
      if (!selectedItem) return;

      // Parse pipe separator format: "operator:value1|value2"
      const colonIndex = value.indexOf(':');
      if (colonIndex === -1) {
        // Fallback: treat as simple value with default operator
        const operator = operators ? operators[0] : null;
        const selectedSubItem = selectedItem.subItems?.find(subItem => subItem.value === value);
        if (selectedSubItem) {
          selectItemFromUrl({
            value: selectedItem.value,
            label: selectedItem.label,
            operatorSelected: operator,
          }, {
            value: selectedSubItem.value,
            label: selectedSubItem.label,
            icon: selectedSubItem.icon ?? null,
          });
        }
        return;
      }

      const operatorValue = value.substring(0, colonIndex);
      const valuesString = value.substring(colonIndex + 1);
      const operator = operators?.find(op => op && op.value === operatorValue) || (operators ? operators[0] : null);
      
      // Handle pipe-separated values
      const values = valuesString.split('|').filter(Boolean);
      
      values.forEach(val => {
        const selectedSubItem = selectedItem.subItems?.find(subItem => subItem.value === val);
        if (selectedSubItem) {
          selectItemFromUrl({
            value: selectedItem.value,
            label: selectedItem.label,
            operatorSelected: operator,
          }, {
            value: selectedSubItem.value,
            label: selectedSubItem.label,
            icon: selectedSubItem.icon ?? null,
          });
        }
      });
    });
  }, []);

  useEffect(() => {
    if (!defaultSelectedItems.length) return;

    defaultSelectedItems.map(defaultSelectedItem => {
      const selectedItem = items.find(i => i.value === defaultSelectedItem.itemValue);
      const selectedSubItem = selectedItem?.subItems?.find(i => i.value === defaultSelectedItem.subItemValue);

      if (selectedItem && selectedSubItem) {
        if (withUrl) {
          selectItemFromUrl(selectedItem, {
            value: defaultSelectedItem.itemValue,
            label: selectedSubItem.label,
            icon: selectedSubItem.icon ?? null,
          });

          updateURLParams({
            [transformLabelToQueryParam(defaultSelectedItem.itemValue)]: selectedSubItem.value
          });
        } else {
          selectItemFromUrl(selectedItem, {
            value: defaultSelectedItem.itemValue,
            label: selectedSubItem.label,
            icon: selectedSubItem.icon ?? null,
          });
        }
      }
    })
  }, [])

  // Sync URL whenever collection changes
  const syncURLWithCollection = useCallback((collection: { id: string; value: string; operator?: Operator }[]) => {
    if (!withUrl) return;

    // Clear all existing parameters first (including search)
    const params = new URLSearchParams(window.location.search);
    
    // Remove all filter parameters (including search)
    Array.from(params.keys()).forEach(key => {
      params.delete(key);
    });

    // Rebuild URL parameters from current collection
    const filterGroups: Record<string, { operator: Operator, values: string[] }> = {};
    
    collection.forEach(entry => {
      if (entry.id === 'search') {
        // Handle search separately
        params.set('search', entry.value);
      } else if (entry.operator) {
        const paramKey = transformLabelToQueryParam(entry.id);
        
        if (!filterGroups[paramKey]) {
          filterGroups[paramKey] = { operator: entry.operator, values: [] };
        }
        
        // For single operators, replace the values array with just the new value
        if (!isMultiOperator(entry.operator.value)) {
          filterGroups[paramKey].values = [entry.value];
        } else {
          // For multi operators, add to values if not already present
          if (!filterGroups[paramKey].values.includes(entry.value)) {
            filterGroups[paramKey].values.push(entry.value);
          }
        }
      }
    });

    // Set parameters for each filter group
    Object.entries(filterGroups).forEach(([paramKey, group]) => {
      if (group.operator) {
        const valueString = group.values.join('|');
        params.set(paramKey, `${group.operator.value}:${valueString}`);
      }
    });

    // Update URL
    const newUrl = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [withUrl, items]);

  useEffect(() => {
    const currentLength = selectedItems.length;
    const prevLength = prevLengthRef.current;

    if (currentLength > prevLength) {
      recalculatePosition().then(recalculateDropdown);
    }

    // Update the ref with the current length
    prevLengthRef.current = currentLength;

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };

  }, [selectedItems]);

  const coreContainerProps = {
    query,
    showSubItems,
    isFocused,
    filteredItemsLength: filteredItems.length > 0,
    validateStyle,
  }

  // Smart removeItem that checks if parent should be kept when empty
  const smartRemoveItem = (itemValue: string, subItemValue?: string) => {
    console.log('🗑️ smartRemoveItem called:', { itemValue, subItemValue });
    
    // Close dropdown and reset state when removing items
    setIsFocused(false);
    setIsDropdownVisible(false);
    resetSubItems();
    tempSelectedRef.current = null;
    setSubItemDropdownPosition(null);
    setDropdownSource(null);
    
    if (subItemValue) {
      // Removing a subitem - check if parent should be kept when it becomes empty
      const parentItem = selectedItems.find(item => item.value === itemValue);
      console.log('📦 Parent item found:', parentItem);
      console.log('📊 Parent item subItems:', parentItem?.subItems);
      console.log('📊 Parent item subItems length:', parentItem?.subItems?.length);
      
      const hasOperator = parentItem?.operatorSelected !== undefined && parentItem?.operatorSelected !== null;
      console.log('⚙️ Has operator:', hasOperator, 'Operator:', parentItem?.operatorSelected);
      console.log('🔄 Calling removeSingleItem with keepEmpty:', hasOperator);
      
      // Keep the parent item if it has an operator
      removeSingleItem(itemValue, subItemValue, hasOperator);
    } else {
      console.log('🗑️ Removing entire parent item');
      // Removing the entire parent item - always remove completely (keepEmpty: false)
      removeSingleItem(itemValue, undefined, false);
    }
  };

  const coreSelectedProps = {
    validateStyle,
    removeItem: smartRemoveItem,
  }

  const getOperators = (item: ItemProps) => {
    return operators || item.operators || [];
  }

  // Get the current operator for multi-select rendering
  const getCurrentOperatorForRendering = () => {
    if (!showSubItems) return null;
    const currentItem = selectedItems.find(item => item.value === showSubItems?.value);
    return currentItem?.operatorSelected || showSubItems?.operatorSelected || operatorSelected;
  }

  const isCurrentOperatorMulti = isMultiOperator(getCurrentOperatorForRendering()?.value || emptyString());

  // Filter subitems using subItemQuery (separate from main query)
  const filteredSubItemsWithQuery = subItemQuery 
    ? filteredSubItems.filter((subItem: any) =>
        subItem.label?.toLowerCase().includes(subItemQuery.toLowerCase()) ||
        subItem.value?.toLowerCase().includes(subItemQuery.toLowerCase())
      )
    : filteredSubItems;

  // Debug state
  const [showDebug, setShowDebug] = useState(false);

  return (
    <>
    <div className={`${validateStyle('container')} ${validateStyle('inputContainer')}`}>
      <div className={validateStyle('scrollableContainerWithButton')}>
        <div ref={scrollableRef} className={validateStyle('scrollable')}>
          {selectedItems.length > 0 && (
            <div className={validateStyle('selectedItemsContainer')}>
              {selectedItems.map((item, idX) => (
                <Fragment key={`${idX}-${item.label}`}>
                  {item.value === 'search' ? (
                    <SelectedText {...coreSelectedProps} item={item}/>
                  ) : (
                    <div className={validateStyle('selectedItemsWrapper')}>
                      <SelectedItem {...coreSelectedProps} item={item}/>
                      {getOperators(item) && getOperators(item).length > 0 && (
                        <SelectedOperator
                          item={item}
                          selectedOperator={item.operatorSelected || getOperators(item)[0]}
                          validateStyle={validateStyle}
                          operators={getOperators(item)}
                          handleChangeOperator={handleChangeOperator}
                          getOperatorPosition={(position: number) => {
                            // Only set if we don't already have a subItemDropdownPosition
                            if (!subItemDropdownPosition) {
                                setSubItemDropdownPosition({left: position});
                            }
                          }}
                        />
                      )}
                      {isMultiOperator(item.operatorSelected?.value || emptyString()) ?
                        <SelectedMultiSubItem
                          ref={tempSelectedRef}
                          {...coreSelectedProps}
                          item={item}
                          onClick={(e) => handleChangeSubItem(item, e)}/>
                        :
                        <SelectedSubItem
                          ref={tempSelectedRef}
                          {...coreSelectedProps}
                          item={item}
                          onClick={(e) => handleChangeSubItem(item, e)}/>
                      }
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          )}

          <div ref={searchContainerRef} className={validateStyle('searchContainer')}>
            <Input
              inputRef={inputRef}
              query={query}
              handleInputFocus={handleInputFocus}
              handleInputChange={handleInputChange}
              validateStyle={validateStyle}
              placeholder={selectedItems.length ? '' : inputPlaceholder}
            />
            {isFocused && isDropdownVisible && dropdownPosition && (
              <div className={validateStyle('dropdownContainer')}
                   style={{
                     left: dropdownSource === 'subitem' && subItemDropdownPosition 
                       ? subItemDropdownPosition.left 
                       : dropdownPosition.left
                   }}>
                {/* Query Item */}
                {hasSearchUrl(collectionRef) && (
                  <QueryItem {...coreContainerProps}>
                    <Item
                      label={searchItem.label}
                      icon={searchItem.icon}
                      onClick={(e) => handleSearchItem('click', e)}
                      validateStyle={validateStyle}
                      isTyped
                    />
                  </QueryItem>
                )}

                {/* Items */}
                <Items {...coreContainerProps} isLoading={isLoading}>
                  {filteredItems.map((item, idX) => (
                    <Item
                      key={`${idX}-${item.label}`}
                      label={item.label}
                      icon={item.icon}
                      onClick={(e) => handleClickItem(item, e)}
                      validateStyle={validateStyle}
                    />
                  ))}
                </Items>

                {/* Sub items */}
                <SubItems 
                  {...coreContainerProps}
                  subItemQuery={subItemQuery}
                  subItemInputRef={subItemInputRef}
                  handleSubItemInputChange={handleSubItemInputChange}
                  subItemInputPlaceholder={subItemInputPlaceholder}
                >
                  {isLoading || isSearching ? (
                    <li className={validateStyle('loadItems')}>{loadingText}</li>
                  ) : filteredSubItemsWithQuery.length > 0 || hasResults ? (
                    filteredSubItemsWithQuery.map((subItem, idX) => (
                      <Item
                        key={`${idX}-${subItem.value}`}
                        label={subItem.label}
                        icon={subItem.icon}
                        onClick={(e) => handleClickSubItem(subItem, e)}
                        validateStyle={validateStyle}
                        isSelected={subItem.isSelected}
                        isMultiOperator={isCurrentOperatorMulti}
                      />
                    ))
                  ) : (
                    !isSearching && <li className={validateStyle('noItemsFound')}>{noResultsText}</li>
                  )}
                </SubItems>
              </div>
            )}
          </div>

        </div>
        {selectedItems.length > 0 && (
          <button
            type="button"
            className={validateStyle('clearFilterButton')}
            onClick={removeAllItems}
          >
            <X size={16}/>
          </button>
        )}
      </div>
    </div>
    
    {/* Debug Panel Toggle Button */}
    {!showDebug && (
      <button
        onClick={() => setShowDebug(true)}
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid #00ff00',
          color: '#00ff00',
          cursor: 'pointer',
          padding: '8px 12px',
          fontSize: '12px',
          fontFamily: 'monospace',
          borderRadius: '4px',
          zIndex: 9998,
          boxShadow: '0 2px 8px rgba(0, 255, 0, 0.3)'
        }}
        title="Show Debug Panel"
      >
        🐛 Debug
      </button>
    )}
    
    {/* Debug Panel */}
    {showDebug && (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: '#00ff00',
        padding: '16px',
        margin: '16px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 9999,
        borderTop: '2px solid #00ff00',
        maxHeight: '1000px',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <strong style={{ color: '#00ff00' }}>🐛 Debug Panel</strong>
          <button 
            onClick={() => setShowDebug(false)}
            style={{
              background: 'transparent',
              border: '1px solid #00ff00',
              color: '#00ff00',
              cursor: 'pointer',
              padding: '2px 8px',
              fontSize: '10px'
            }}
          >
            Close
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <div><strong>isFocused:</strong> {isFocused ? '✅ true' : '❌ false'}</div>
            <div><strong>isDropdownVisible:</strong> {isDropdownVisible ? '✅ true' : '❌ false'}</div>
            <div><strong>showSubItems:</strong> {showSubItems ? showSubItems.value : 'null'}</div>
            <div><strong>query:</strong> "{query}"</div>
            <div style={{ color: '#ffff00' }}><strong>dropdownSource:</strong> {dropdownSource || 'null'}</div>
          </div>
          <div>
            <div><strong>dropdownPosition:</strong> {dropdownPosition ? `${dropdownPosition.left}px` : 'null'}</div>
            <div><strong>subItemDropdownPosition:</strong> {subItemDropdownPosition ? `${subItemDropdownPosition.left}px` : 'null'}</div>
            <div><strong>tempSelectedRef:</strong> {tempSelectedRef.current ? '✅ set' : '❌ null'}</div>
            <div><strong>operatorSelected:</strong> {operatorSelected?.value || 'null'}</div>
            <div style={{ color: '#ff00ff', marginTop: '4px' }}>
              <strong>🎯 Active Position:</strong> {
                dropdownSource === 'subitem' && subItemDropdownPosition 
                  ? `${subItemDropdownPosition.left}px (subitem)` 
                  : dropdownPosition ? `${dropdownPosition.left}px (input)` : 'null'
              }
            </div>
          </div>
        </div>
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #00ff00' }}>
          <strong>Current Operator:</strong> {getCurrentOperatorForRendering()?.value || 'null'} 
          {isCurrentOperatorMulti ? ' (Multi)' : ' (Single)'}
        </div>
        <div style={{ marginTop: '4px' }}>
          <strong>Selected Items:</strong> {selectedItems.length} items
          {selectedItems.length > 0 && (
            <div style={{ marginLeft: '16px', marginTop: '4px' }}>
              {selectedItems.map((item, idx) => (
                <div key={idx} style={{ fontSize: '11px', color: '#88ff88' }}>
                  {idx + 1}. {item.label} ({item.value}) - 
                  Op: {item.operatorSelected?.value || 'none'} - 
                  SubItems: {item.subItems?.length || 0}
                  {item.tempSelected ? ' [TEMP]' : ''}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ marginTop: '8px', fontSize: '10px', color: '#888' }}>
          Input offsetLeft: {inputRef.current?.offsetLeft || 'n/a'}px | 
          Scroll Left: {scrollableRef.current?.scrollLeft || 0}px
        </div>
      </div>
    )}
    </>
  );
};

export default SmartFiltero;
