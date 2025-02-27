import {Fragment, useCallback, useEffect, useRef, useState} from 'react';
import {Type} from 'lucide-react';
import {debounce} from 'lodash';
import useSmartFilter from '@/hooks/useSmartFilter';
import SelectedItem from '@/components/SelectedItem';
import React from "react";
import SelectedSubItem from "@/components/SelectedSubItem";
import QueryItem from "@/components/QueryItem";
import Items from "@/components/Items";
import Item from "@/components/Item";
import SubItems from "@/components/SubItems";
import {
  SmartFilteroProps,
  Item as ItemProps,
  SubItem as SubItemProps,
  StyleThemeProps
} from "@/types";
import SelectedText from "@/components/SelectedText";
import {X} from "lucide-react";
import {transformLabelToQueryParam, updateURLParams} from "@/utils/url";
import styles from '@/styles.module.css';
import Input from "@/components/Input";

const SmartFiltero: React.FC<SmartFilteroProps> = ({
  items,
  subItems,
  fetching,
  fetchFunctions,
  excludeSelected = true,
  styleTheme = {},
  getSelectedItems,
  defaultSelectedItems = [],
  withoutUrl = false,
  inputPlaceholder = 'Search or filter by...'
}) => {
  const {
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
  } = useSmartFilter(items, subItems, excludeSelected);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevLengthRef = useRef(selectedItems.length);
  const scrollableRef = useRef<HTMLDivElement>(null);

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ left: number } | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);

  const fetchDebounceOnQuery = debounce((item: ItemProps, query: string) => {
    if (item.value && fetchFunctions[item.value]) {
      fetchFunctions[item.value]?.(query);
    }
  }, 500);

  const fetchDebounceDefault = debounce((item: ItemProps) => {
    if (item.value && fetchFunctions[item.value]) {
      fetchFunctions[item.value]?.();
    }
  }, 500);

  const recalculatePosition = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (scrollableRef.current) {
        const scrollableElement = scrollableRef.current;

        // Optionally scroll the container to the end (if necessary)
        scrollableElement.scrollTo({
          left: scrollableElement.scrollWidth,
        });

        // Resolve the promise after the scroll operation
        setTimeout(() => resolve(), 0); // Adjust delay to fit your animation duration
      } else {
        resolve();
      }
    });
  }, []);

  const recalculateDropdown = useCallback(() => {
    if (inputRef.current && scrollableRef.current) {
      const inputElement = inputRef.current;
      const scrollableElement = scrollableRef.current;

      // Get the scroll position of the container
      const containerScrollLeft = scrollableElement.scrollLeft;

      // Calculate the offset of the input relative to the container
      const inputOffsetLeft = inputElement.offsetLeft;

      // Adjust the dropdown position to ensure alignment with the input
      setDropdownPosition({
        left: inputOffsetLeft - containerScrollLeft, // Adjust for container's scroll
      });
    }
  }, []);

  const handleInputFocus = () => {
    setIsFocused(true);
    setIsDropdownVisible(false); // Hide the dropdown initially

    recalculatePosition().then(() => {
      recalculateDropdown(); // Recalculate the dropdown position
      setIsDropdownVisible(true); // Show dropdown only after recalculations
    });
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
      setIsFocused(false);
      selectedItems.forEach(item => {
        if (item.subItems.length == 0 && item.value !== 'search') {
          removeSingleItem(item);
          resetSubItems();
          recalculatePosition().then(recalculateDropdown);
        }
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsFocused(true);  // Re-focus the dropdown when typing
  };

  const collectionRef = useRef<{ id: string; value: string }[]>([]);

  const handleClickItem = (item: ItemProps, e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
    handleSelect(item);
    setQuery('');
  };

  const handleClickSubItem = (subItem: SubItemProps, e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();

    if (!showSubItems) return;

    // Create the new collection entry
    const newItem = {id: showSubItems.value, value: subItem.value};

    selectItem(showSubItems, subItem);

    if (!withoutUrl) {
      updateURLParams({
        [transformLabelToQueryParam(showSubItems.value || '')]: subItem.value
      });
    }

    // Update collection by adding the new item
    collectionRef.current.push(newItem);

    // Call getSelectedItems with the updated collection
    getSelectedItems(collectionRef.current);

    // Reset query after selection
    setQuery('');
  };

  const handleClickSearchText = (e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();

    // Add the search item to the selected collection
    const searchItem = {
      id: `search`,
      value: query,
    };

    // Add searchItem to the previous collection
    const updatedCollection = [...collectionRef.current, searchItem];

    handleSelect({
      value: `search`,
      item: "Search",
      subItems: [],
      label: query,
      icon: Type,
      typed: true
    });

    setQuery('');
    if (!withoutUrl) {
      updateURLParams({
        ['search']: query
      });
    }

    // Update getSelectedItems with the previous collection + the new search item
    getSelectedItems(updatedCollection);

    // Update the collection ref with the updated collection
    collectionRef.current = updatedCollection;
  }

  const removeSingleItem = (item: ItemProps, subItemValue?: string) => {
    // Temp: Change the item.item
    const queryParam = item.item ? transformLabelToQueryParam(item.item) : '';

    // Determine the updated collection
    let updatedCollection: any[] = [];
    if (subItemValue) {
      // Handle subItem removal
      removeItem(item.item || '', subItemValue);
      removeURLParams(item.value || queryParam); // Use removeURLParams to remove the param

      // Remove the specific item from the collection
      updatedCollection = collectionRef.current.filter(
        (colItem) => colItem.id !== item.value || colItem.value !== subItemValue
      );
    } else {
      // Handle item removal
      removeItem(item.item || '');
      removeURLParams(item.value || queryParam); // Use removeURLParams to remove the param

      // Remove the specific item from the collection
      updatedCollection = collectionRef.current.filter(
        (colItem) => colItem.id !== item.value
      );
    }

    // Call getSelectedItems with the updated collection
    getSelectedItems(updatedCollection);

    // Update the collection ref with the updated collection
    collectionRef.current = updatedCollection;
  };

  const removeAllItems = () => {
    selectedItems.forEach(item => {
      removeSingleItem(item);
    });
    resetSelectedItems();
  };

  const removeURLParams = (param: string) => {
    const params = new URLSearchParams(window.location.search);
    params.delete(param);

    // @ts-ignore
    window.history.replaceState({}, '', params.size > 0 ? `${window.location.pathname}?${params}` : window.location.pathname);
  };

  // const validateStyle = (key: keyof StyleThemeProps) => styleTheme[key] || styles[key];
  const validateStyle = (style: string) => {
    // Convert the string to a StyleThemeProps key if valid, or default
    return styleTheme[style as keyof StyleThemeProps] || styles[style];
  };

  useEffect(() => {
    if (showSubItems && showSubItems.isAsync) {
      fetchDebounceDefault(showSubItems);
    }
  }, [showSubItems]);

  useEffect(() => {
    if (showSubItems?.isAsync && query) {
      fetchDebounceOnQuery(showSubItems, query);
    }
  }, [showSubItems, query, selectedItems]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const allParams: Record<string, string> = {};

    const urlQuery = params.get('query');
    if (urlQuery) {
      setQuery(urlQuery);
    }

    params.forEach((value, key) => {
      allParams[key] = value;

      // Find the matching item in items array by value
      const selectedItem = items.find(item => item.value === key);
      if (allParams.search) {
        selectItemFromUrl({
          value: "search",
          item: "Search",
          subItems: [],
          label: allParams.search,
          icon: Type,
          typed: true
        });
      }

      if (selectedItem) {
        selectItemFromUrl(selectedItem, {
          label: value,
          icon: selectedItem.icon || Type,
        });
      }
    });
  }, [])


  useEffect(() => {
    defaultSelectedItems.map(defaultSelectedItem => {
      console.log('defaultSelectedItem', defaultSelectedItem)
      const selectedItem = items.find(i => i.value === defaultSelectedItem.itemValue);
      // @ts-ignore
      const selectedSubItem = subItems[defaultSelectedItem.itemValue].find(i => i.value === defaultSelectedItem.subItemValue);

      if (selectedItem && selectedSubItem) {
        updateURLParams({
          [transformLabelToQueryParam(defaultSelectedItem.itemValue)]: selectedSubItem.label
        });
        selectItemFromUrl(selectedItem, {
          value: defaultSelectedItem.itemValue,
          label: selectedSubItem.label,
          icon: selectedItem.icon || Type,
        });
        // }
      }
    })
  }, [])

  useEffect(() => {
    const currentLength = selectedItems.length;
    const prevLength = prevLengthRef.current;

    if (currentLength >= prevLength) {
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
    fetching,
    isFocused,
    filteredItemsLength: filteredItems.length > 0,
    validateStyle,
  }

  const coreSelectedProps = {
    validateStyle,
    removeItem: removeSingleItem,
  }

  const hasSearchUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasSearchParam = urlParams.has('search');
    return !hasSearchParam && !collectionRef.current.some(item => item.id.startsWith('search'))
  }

  return (
    <div className={`${validateStyle('container')} ${validateStyle('inputContainer')}`}>
      <div className={validateStyle('scrollableContainerWithButton')}>
        <div ref={scrollableRef} className={validateStyle('scrollable')}>
          {selectedItems.length > 0 && (
            <div className={validateStyle('selectedItems')}>
              {selectedItems.map((item, idX) => (
                <Fragment key={`${idX}-${item.label}`}>
                  {item.value === 'search' ? (
                    <SelectedText {...coreSelectedProps} item={item}/>
                  ) : (
                    <>
                      <SelectedItem {...coreSelectedProps} item={item}/>
                      <SelectedSubItem {...coreSelectedProps} item={item}/>
                    </>
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
              <div className={validateStyle('dropdown')} style={{left: dropdownPosition.left}}>
                {/* Query Item */}
                {hasSearchUrl() && (
                  <QueryItem {...coreContainerProps}>
                    <Item
                      label="Search for this text"
                      icon={Type}
                      onClick={(e) => handleClickSearchText(e)}
                      validateStyle={validateStyle}
                      isTyped
                    />
                  </QueryItem>
                )}

                {/* Items */}
                <Items {...coreContainerProps}>
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
                <SubItems {...coreContainerProps}>
                  {!fetching ? (
                    filteredSubItems.length > 0
                      ? filteredSubItems.map((subItem, idX) => (
                        <Item
                          key={`${idX}-${subItem.value}`}
                          label={subItem.label}
                          icon={subItem.icon}
                          onClick={(e) => handleClickSubItem(subItem, e)}
                          validateStyle={validateStyle}
                        />
                      ))
                      : (
                        <li className={validateStyle('noItemsFound')}>No items found</li>
                      )
                  ) : (
                    <li className={validateStyle('loadItems')}>Loading...</li>
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
  );
};

export default SmartFiltero;
