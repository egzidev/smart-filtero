import React from "react";

export type IconType = React.ComponentType<any> | React.ReactElement | null;
export type StyleValidator = (style: string) => string;
export type InputFocusHandler = (e: React.FocusEvent<HTMLInputElement>) => void;
export type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;
export type MaybeAsync<T> = T | Promise<T>;
export type RemoveItemHandler = (selectedItemValue: string, selectedSubItemValue?: string) => void;
export type RemoveItemByValueHandler = (selectedItem: string, subItem?: string) => void;
export type OperatorValue = 'is' | 'is-not' | 'any' | 'not-any';

export interface BaseItem {
  value: string;
  label: string;
  icon?: IconType;
  operators?: Operator[];
  operatorSelected?: Operator;
}

export interface WithChildren {
  children: React.ReactNode;
}

export interface Item extends BaseItem {
  operations?: string[];
  isAsync?: boolean;
  typed?: boolean;
  item?: string;
  subItems?: SubItem[];
  debounceDelay?: number;
  onClick?: (item: Item, subItem: SubItem) => void;
}

export interface ItemCmp {
  label?: string;
  icon?: IconType;
  query?: string;
  onClick: (e: React.MouseEvent<HTMLLIElement>) => void;
  isTyped?: boolean;
  validateStyle: StyleValidator;
  isSelected?: boolean;
  isMultiOperator?: boolean | string;
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

export type Operator = {
  value: OperatorValue;
  label: string;
} | null;

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
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;

}

export interface SubItem extends BaseItem {
  isSelected?: boolean;
}


// Define types for selected items
export interface SelectedItem extends BaseItem {
  typed: boolean;
  subItems: SubItem[];
  subItemsCollector?: SubItem[];
  tempSelected?: boolean;
}

// Define the hook's return type
export interface UseSmartFilterResult {
  query: string;
  setQuery: (query: string) => void;
  filteredItems: Item[];
  filteredSubItems: SubItem[];
  selectedItems: SelectedItem[];
  selectItem: ({item, subItem, operator}: { item: Item, subItem?: SubItem, operator?: Operator }) => void;
  selectItemFromUrl: (item: Item, subItem?: SubItem | { label: string; icon: IconType }) => void;
  removeItem: RemoveItemByValueHandler;
  // getSubItems: (item: Item) => SubItem[];
  showSubItems: Item | null;
  handleSelect: ({item, operator}: { item: Item, operator?: Operator }) => void;
  resetSelectedItems: () => void;
  resetSubItems: () => void;
  changeSelectSubItem: (item: Item) => void;
}

interface SubItemProps extends BaseItem {
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
  operators?: Operator[];
  fetchFunctions?: FetchFunctions;
  excludeSelected?: boolean;
  styleTheme?: StyleThemeProps;
  onChangeSelection: (items: { id: string; value: string }[]) => void;
  withUrl?: boolean;
  inputPlaceholder?: string;
  searchItem?: {
    label: string;
    icon?: React.ComponentType<any> | React.ReactElement | null
  }
  defaultSelectedItems?: { itemValue: string; subItemValue: string }[];
  debounceDelay?: number;
  loadingText?: string;
  noResultsText?: string;
  onItemClick?: (item: Item, subItem: SubItem) => void;
  onItemRemoveClick?: (item: Item, subItem: SubItem) => void;
}

type XOR<T, U> =
  | (T & { [K in keyof U]?: never })
  | (U & { [K in keyof T]?: never });

type OnlyOneQuery = XOR<{ defaultSearchQuery?: string }, { defaultQuerySelection?: string }>;

export type SmartFilteroProps = BaseSmartFilteroProps & OnlyOneQuery;