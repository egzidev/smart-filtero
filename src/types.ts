import React from "react";
import {LucideProps} from "lucide-react";

export interface Item {
  id: string;
  label?: string;
  isAsync?: boolean;
  typed?: boolean;
  icon?: React.ComponentType<LucideProps>;
  item?: string;
  subItems?: SubItem[];
}

export interface ItemCmp {
  label?: string;
  icon?: React.ComponentType<LucideProps>;
  query?: string;
  onClick: (e: React.MouseEvent<HTMLLIElement>) => void;
  isTyped?: boolean;
  validateStyle: (style: string) => string;
}

export interface ItemsCmp {
  isFocused: boolean;
  showSubItems: Item | null;
  fetching: boolean;
  filteredItemsLength: boolean;
  children: React.ReactNode;
  validateStyle: (style: string) => string;
}

export interface InputCmp {
  inputRef: React.RefObject<HTMLInputElement>;
  query: string;
  handleInputFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validateStyle: (style: string) => string;
  placeholder: string;
}

export interface SubItemsCmp {
  showSubItems: Item | null;
  isFocused: boolean;
  children: React.ReactNode;
  validateStyle: (style: string) => string;
}

export interface QueryItemCmp {
  query: string;
  showSubItems: Item | null;
  isFocused: boolean;
  children: React.ReactNode;
  validateStyle: (style: string) => string;
}


export interface SelectedItemCmp {
  item: Item;
  removeItem: (item: Item, subItemLabel?: string) => void;
  validateStyle: (style: string) => string
}

export interface SelectedSubItemCmp {
  item: Item;
  removeItem: (item: Item, subItemLabel: string) => void;
  validateStyle: (style: string) => string

}

export interface SubItem {
  label: string;
  subItems?: SubItem;
  subItem?: string | null;
  icon?: React.ComponentType<LucideProps>;
}

export interface SubItems {
  [key: string]: SubItem[];
}

// Define types for selected items
export interface SelectedItem {
  id: string;
  isAsync?: boolean;
  typed: boolean;
  label?: string;
  subItem?: string;
  icon?: React.ComponentType<LucideProps>;
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
  selectItemFromUrl: (item: Item, subItem?: SubItem | { label: string; icon: React.ComponentType<LucideProps> }) => void;
  removeItem: (item: string, subItem?: string) => void;
  // getSubItems: (item: Item) => SubItem[];
  showSubItems: Item | null;
  handleSelect: (item: Item) => void;
  resetSelectedItems: () => void;
  resetSubItems: () => void;
}

interface SubItemProps {
  label: string;
  subItems?: SubItemProps;
  subItem?: string;
  icon?: React.ComponentType<LucideProps>;
}

export interface SubItemsProps {
  [key: string]: SubItemProps[];
}

interface FetchFunctions {
  [key: string]: (query?: string) => void;
}

export interface StyleThemeProps {
  container?: string;
  inputContainer?: string;
  dropdown?: string;
  dropdownItemContainer?: string;
  dropdownSubItemContainer?: string;
  selectedItems?: string;
  selectedItem?: string;
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

export interface SmartFilteroProps {
  items: Item[];
  subItems: SubItemsProps;
  fetching: boolean;
  fetchFunctions: FetchFunctions;
  excludeSelected?: boolean;
  styleTheme?: StyleThemeProps;
  getSelectedItems: (items: { id: string; value: string }[]) => void;
  withoutUrl?: boolean;
  inputPlaceholder?: string;
}