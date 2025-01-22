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

const SmartFiltero: React.FC<SmartFilteroProps> = ({
  items,
  subItems,
  fetching,
  fetchFunctions,
  excludeSelected = true,
  styleTheme = {},
  getSelectedItems
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
    if (item.id && fetchFunctions[item.id]) {
      fetchFunctions[item.id](query);
    }
  }, 500);

  const fetchDebounceDefault = debounce((item: ItemProps) => {
    if (item.id && fetchFunctions[item.id]) {
      fetchFunctions[item.id]();
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
        if (item.subItems.length == 0 && item.id !== 'search') {
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

  const handleClickItem = (item: ItemProps, e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
    handleSelect(item);
    setQuery('');
  };

  const handleClickSubItem = (subItem: SubItemProps, e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
    if (showSubItems) {
      selectItem(showSubItems, subItem);
      setQuery('');
      updateURLParams({
        [transformLabelToQueryParam(showSubItems.id || '')]: subItem.label
      });

      getSelectedItems({
        [transformLabelToQueryParam(showSubItems.id || '')]: subItem.label
      });
    }
  };

  const handleClickSearchText = (e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
    handleSelect({
      id: "search",
      item: "Search",
      subItems: [],
      label: query,
      icon: Type,
      typed: true
    });

    setQuery('');
    updateURLParams({
      ['search']: query
    });

    getSelectedItems({
      ['search']: query
    });
  }

  const removeSingleItem = (item: ItemProps, subItemLabel?: string) => {
    const queryParam = transformLabelToQueryParam(item.item);
    if (subItemLabel) {
      removeItem(item.item, subItemLabel);
      removeURLParams(item.id || queryParam); // Use removeURLParams to remove the param
      getSelectedItems({
        [item.id || queryParam]: null
      });
    } else {
      removeItem(item.item);
      removeURLParams(item.id || queryParam); // Use removeURLParams to remove the param
      getSelectedItems({
        [item.id || queryParam]: null
      });
    }
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

      // Find the matching item in items array by id
      const selectedItem = items.find(item => item.id === key);
      if (allParams.search) {
        selectItemFromUrl({
          id: "search",
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
  }

  const coreSelectedProps = {
    validateStyle,
    removeItem: removeSingleItem,
  }



  return (
    <div className={`${validateStyle('container')} ${validateStyle('inputContainer')}`}>
      <div className={validateStyle('scrollableContainerWithButton')}>
        <div ref={scrollableRef} className={validateStyle('scrollable')}>
          {selectedItems.length > 0 && (
            <div className={validateStyle('selectedItems')}>
              {selectedItems.map((item, idX) => (
                <Fragment key={`${idX}-${item.label}`}>
                  {item.id === 'search' ? (
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
            {isFocused && isDropdownVisible && dropdownPosition && (
              <div className={validateStyle('dropdown')} style={{left: dropdownPosition.left}}>
                {/* Query Item */}
                <QueryItem {...coreContainerProps}>
                  <Item
                    label="Search for this text"
                    icon={Type}
                    onClick={(e) => handleClickSearchText(e)}
                    validateStyle={validateStyle}
                    isTyped
                  />
                </QueryItem>

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
                          key={`${idX}-${subItem.label}`}
                          label={subItem.label}
                          icon={subItem.icon}
                          onClick={(e) => handleClickSubItem(subItem, e)}
                          validateStyle={validateStyle}
                        />
                      ))
                      : (
                        <p className={validateStyle('noItemsFound')}>No items found</p>
                      )
                  ) : (
                    <p className={validateStyle('loadItems')}>Loading...</p>
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
