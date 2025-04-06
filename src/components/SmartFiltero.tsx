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
  StyleThemeProps
} from "./../types";
import SelectedText from "./../components/SelectedText";
import {X} from "lucide-react";
import {transformLabelToQueryParam, updateURLParams} from "./../utils/url";
import "./../theme.css";
import styles from './../styles.module.css';
import Input from "./../components/Input";
import useAsync from "./../hooks/useAsync";
import useUpdateEffect from "./../hooks/useUpdateEffect";

const SmartFiltero: React.FC<SmartFilteroProps> = ({
  items,
  subItems,
  fetchFunctions,
  excludeSelected = true,
  styleTheme = {},
  getSelectedItems,
  withUrl = false,
  inputPlaceholder = 'Search or filter by...',
  searchItem = {
    label: 'Search for this text',
    icon: Type,
  },
  defaultQuery = '',
  defaultSelectedQuery = '',
  defaultSelectedItems = [],
  debounceDelay = 500,
  noResultsText = "No results found",
  loadingText = "Loading...",
}) => {
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
    resetSubItems
  } = useSmartFilter(items, subItems, excludeSelected);

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
  } = useAsync(subItems, debounceDelay, fetchFunctions);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevLengthRef = useRef(selectedItems.length);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const collectionRef = useRef<{ id: string; value: string }[]>([]);

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ left: number } | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);

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

    if (showSubItems?.isAsync) {
      // Check if there are matching subitems first
      const hasMatchingSubItems = filteredSubItems.some((subItem: any) =>
        subItem.label.toLowerCase().includes(newQuery.toLowerCase())
      );

      const isDeleting = newQuery.length < query.length; // Detect backspace

      // Fetch only if there are no matches OR if deleting characters
      if (!hasMatchingSubItems || isDeleting) {
        setIsSearching(true);

        fetchDebounceOnQuery(showSubItems, newQuery, (response) => {
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
    handleSelect(item);
    setQuery('');
  };

  const handleClickSubItem = (subItem: SubItemProps, e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();

    if (!showSubItems) return;

    // Create the new collection entry
    const newItem = {id: showSubItems.value, value: subItem.value};

    selectItem(showSubItems, subItem);

    if (withUrl) {
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

  const handleSearchItem = (type: 'click' | 'default', e?: React.MouseEvent<HTMLLIElement>) => {
    if (e) e.preventDefault();

    // Determine the label based on the type
    const label = type === 'click' ? query : defaultSelectedQuery;

    const searchItem = {
      id: `search`,
      value: label,
    };

    // Add searchItem to the previous collection
    const updatedCollection = [...collectionRef.current, searchItem];

    handleSelect({
      value: `search`,
      item: "Search",
      subItems: [],
      label,
      icon: Type,
      typed: true,
    });

    setQuery('');

    if (withUrl) {
      updateURLParams({['search']: query});
    }

    // Update getSelectedItems with the previous collection + the new search item
    getSelectedItems(updatedCollection);

    // Update the collection ref with the updated collection
    collectionRef.current = updatedCollection;
  };

  const removeSingleItem = (item: ItemProps, subItemValue?: string) => {
    // Temp: Change the item.item
    const queryParam = item.item ? transformLabelToQueryParam(item.item) : '';

    // Determine the updated collection
    let updatedCollection: any[] = [];
    if (subItemValue) {
      // Handle subItem removal
      removeItem(item.item || '', subItemValue);
      if (withUrl) {
        removeURLParams(item.value || queryParam); // Use removeURLParams to remove the param
      }
      // Remove the specific item from the collection
      updatedCollection = collectionRef.current.filter(
        (colItem) => colItem.id !== item.value || colItem.value !== subItemValue
      );
    } else {
      // Handle item removal
      removeItem(item.item || '');
      if (withUrl) {
        removeURLParams(item.value || queryParam); // Use removeURLParams to remove the param
      }
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
    if (defaultQuery && defaultSelectedQuery) {
      console.error("You can only provide either `defaultQuery` or `defaultSelectedQuery`, not both.");
    }

    if (defaultQuery && !selectedItems.length && !defaultSelectedQuery) {
      setQuery(defaultQuery);
    }

    if (defaultSelectedQuery && !selectedItems.length && !defaultQuery) {
      handleSearchItem('default')
    }

    return () => {
      resetSelectedItems();
    }
  }, [])

  useUpdateEffect(() => {
    if (showSubItems?.isAsync) {
      fetchInitial(showSubItems);
    }
  }, [showSubItems]);

  useEffect(() => {
    if (withUrl) {
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
            icon: selectedItem.icon ?? null,
          });
        }
      });
    }
  }, [])


  useEffect(() => {
    defaultSelectedItems.map(defaultSelectedItem => {
      const selectedItem = items.find(i => i.value === defaultSelectedItem.itemValue);
      const selectedSubItem = subItems[defaultSelectedItem.itemValue].find(i => i.value === defaultSelectedItem.subItemValue);

      if (selectedItem && selectedSubItem) {
        if (withUrl) {
          selectItemFromUrl(selectedItem, {
            value: defaultSelectedItem.itemValue,
            label: selectedSubItem.label,
            icon: selectedItem.icon ?? null,
          });

          updateURLParams({
            [transformLabelToQueryParam(defaultSelectedItem.itemValue)]: selectedSubItem.label
          });
        } else {
          selectItemFromUrl(selectedItem, {
            value: defaultSelectedItem.itemValue,
            label: selectedSubItem.label,
            icon: selectedItem.icon ?? null,
          });
        }
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
            <div className={validateStyle('selectedItemsContainer')}>
              {selectedItems.map((item, idX) => (
                <Fragment key={`${idX}-${item.label}`}>
                  {item.value === 'search' ? (
                    <SelectedText {...coreSelectedProps} item={item}/>
                  ) : (
                    <div className={validateStyle('selectedItemsWrapper')}>
                      <SelectedItem {...coreSelectedProps} item={item}/>
                      <SelectedSubItem {...coreSelectedProps} item={item}/>
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
              <div className={validateStyle('dropdownContainer')} style={{left: dropdownPosition.left}}>
                {/* Query Item */}
                {hasSearchUrl() && (
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
                <SubItems {...coreContainerProps}>
                  {isLoading || isSearching ? (
                    <li className={validateStyle('loadItems')}>{loadingText}</li>
                  ) : filteredSubItems.length > 0 || hasResults ? (
                    filteredSubItems.map((subItem, idX) => (
                      <Item
                        key={`${idX}-${subItem.value}`}
                        label={subItem.label}
                        icon={subItem.icon}
                        onClick={(e) => handleClickSubItem(subItem, e)}
                        validateStyle={validateStyle}
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
  );
};

export default SmartFiltero;
