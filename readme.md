# smart-filter

A ReactJS hook to get multiple filters for a list of items.

## How to use it?

You can use the project in this way:

### Install
```bash
# with npm
npm install smart-filter

# with yarn
yarn add smart-filter
```

### Usage

- Import the package in your app:
```js
import {useSmartFilter} from 'smart-filter';
```
- Set the items and subItems from the hook and get from hook what you need:
```js
const {
  query,
  setQuery,
  filteredItems,
  selectedItems,
  selectItem,
  removeItem,
  getSubItems,
} = useSmartFilter(items, subItems);
```# smart-filter
