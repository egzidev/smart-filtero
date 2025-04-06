import React from "react";

export type IconType = React.ComponentType<any> | React.ReactElement | null;
export type StyleValidator = (style: string) => string;
export type InputFocusHandler = (e: React.FocusEvent<HTMLInputElement>) => void;
export type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;
export type MaybeAsync<T> = T | Promise<T>;
export type RemoveItemHandler = (item: Item, subItemLabel?: string) => void;
export type RemoveItemByValueHandler = (item: string, subItem?: string) => void;

export interface BaseItem {
  value: string;
  label: string;
  icon?: IconType;
}

export interface WithChildren {
  children: React.ReactNode;
}

export interface Item extends BaseItem {
  isAsync?: boolean;
  typed?: boolean;
  item?: string;
  subItems?: SubItem[];
  debounceDelay?: number;
}

export interface ItemCmp {
  label?: string;
  icon?: IconType;
  query?: string;
  onClick: (e: React.MouseEvent<HTMLLIElement>) => void;
  isTyped?: boolean;
  validateStyle: StyleValidator;
}

export interface ItemsCmp extends WithChildren {
  isFocused: boolean;
  showSubItems: Item | null;
  isLoading: boolean;
  filteredItemsLength: boolean;
  validateStyle: StyleValidator;
}

export interface InputCmp {
  inputRef: React.RefObject<HTMLInputElement>;
  query: string;
  handleInputFocus: InputFocusHandler;
  handleInputChange: InputChangeHandler;
  validateStyle: StyleValidator;
  placeholder: string;
}

export interface SubItemsCmp extends WithChildren {
  showSubItems: Item | null;
  isFocused: boolean;
  validateStyle: StyleValidator;
}

export interface QueryItemCmp extends WithChildren {
  query: string;
  showSubItems: Item | null;
  isFocused: boolean;
  validateStyle: StyleValidator;
}


export interface SelectedItemCmp {
  item: Item;
  removeItem: RemoveItemHandler;
  validateStyle: (style: string) => string
}

export interface SelectedSubItemCmp {
  item: Item;
  removeItem: RemoveItemHandler;
  validateStyle: StyleValidator;

}

export interface SubItem extends BaseItem {
  subItems?: SubItem;
  subItem?: string | null;
}


// Define types for selected items
export interface SelectedItem extends BaseItem {
  isAsync?: boolean;
  typed: boolean;
  subItem?: string;
  item: string;
  subItems: SubItem[];
}

// Define the hook's return type
export interface UseSmartFilterResult {
  query: string;
  setQuery: (query: string) => void;
  filteredItems: Item[];
  filteredSubItems: SubItem[];
  selectedItems: SelectedItem[];
  selectItem: (item: Item, subItem?: SubItem) => void;
  selectItemFromUrl: (item: Item, subItem?: SubItem | { label: string; icon: IconType }) => void;
  removeItem: RemoveItemByValueHandler;
  // getSubItems: (item: Item) => SubItem[];
  showSubItems: Item | null;
  handleSelect: (item: Item) => void;
  resetSelectedItems: () => void;
  resetSubItems: () => void;
}

interface SubItemProps extends BaseItem{
  subItems?: SubItemProps;
  subItem?: string;
}

export interface SubItemsProps {
  [key: string]: SubItemProps[];
}

export interface FetchFunctions {
  [key: string]: (query?: string) => MaybeAsync<void>;
}

export interface StyleThemeProps {
  container?: string;
  inputContainer?: string;
  dropdownContainer?: string;
  dropdownItemContainer?: string;
  dropdownSubItemContainer?: string;
  selectedItemsContainer?: string;
  selectedItemsWrapper?: string;
  selectedItem?: string;
  selectedText?: string;
  selectedSubItem?: string;
  removeIcon?: string;
  searchInput?: string;
  queryItem?: string;
  dropdownItem?: string;
  noItemsFound?: string;
  loadItems?: string;
  clearFilterButton?: string;
  scrollableContainerWithButton?: string;
  scrollable?: string;
  searchContainer?: string;
  searchWrapper?: string;
}


interface BaseSmartFilteroProps {
  items: Item[];
  subItems: SubItemsProps;
  fetchFunctions?: FetchFunctions;
  excludeSelected?: boolean;
  styleTheme?: StyleThemeProps;
  getSelectedItems: (items: { id: string; value: string }[]) => void;
  withUrl?: boolean;
  inputPlaceholder?: string;
  searchItem?: {
    label: string;
    icon?: React.ComponentType<any> | React.ReactElement| null
  }
  defaultSelectedItems?: { itemValue: string; subItemValue: string }[];
  debounceDelay?: number;
  loadingText?: string;
  noResultsText?: string;
}

type XOR<T, U> =
  | (T & { [K in keyof U]?: never })
  | (U & { [K in keyof T]?: never });

type OnlyOneQuery = XOR<{ defaultQuery?: string }, { defaultSelectedQuery?: string }>;

export type SmartFilteroProps = BaseSmartFilteroProps & OnlyOneQuery;