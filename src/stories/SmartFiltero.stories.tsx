import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Meta, StoryFn, StoryObj} from '@storybook/react';
import SmartFiltero from "./../components/SmartFiltero";
import {Item, SmartFilteroProps, SubItem} from '@/types';
import {User, Tag, CircleX, Clock, CheckCircle, MapPin, ShoppingBag, Calendar} from 'lucide-react';
import './style.css';

/**
 * SmartFiltero is a powerful, flexible filtering component that allows users to:
 * - Filter data using hierarchical items and sub-items
 * - Support async data loading
 * - Sync filter state with URL parameters
 * - Use custom operators (is, is not, any of, not any of)
 * - Handle text search queries
 * - Customize styling and behavior
 * 
 * Perfect for data tables, dashboards, and any interface requiring advanced filtering capabilities.
 */
export default {
  title: 'Smart Filtero',
  component: SmartFiltero,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
SmartFiltero is a comprehensive filtering component that provides:

- **Hierarchical Filtering**: Organize filters into items and sub-items
- **Async Data Loading**: Load filter options dynamically from APIs
- **URL Synchronization**: Keep filter state in sync with URL parameters
- **Custom Operators**: Support for "is", "is not", "any of", "not any of" and more
- **Text Search**: Built-in support for free-text search queries
- **Fully Customizable**: Customize styling, placeholders, and behavior

## Use Cases

- E-commerce product filtering (category, brand, price range)
- Data table filtering (status, date ranges, tags)
- Dashboard filters (user selection, date ranges, metrics)
- Search interfaces with advanced filtering
- Any application requiring complex filter combinations
        `,
      },
    },
  },
  argTypes: {
    items: {
      description: 'Array of filter items. Each item can have sub-items for hierarchical filtering.',
      control: { type: 'object' },
      table: {
        type: { summary: 'Item[]' },
        category: 'Data',
      },
    },
    operators: {
      description: 'Custom operators for filtering (e.g., "is", "is not", "any of", "not any of"). If not provided, defaults to the first operator in the item\'s operators array.',
      control: { type: 'object' },
      table: {
        type: { summary: 'Operator[]' },
        category: 'Configuration',
      },
    },
    fetchFunctions: {
      description: 'Object mapping item values to async fetch functions. Used for loading filter options dynamically.',
      control: { type: 'object' },
      table: {
        type: { summary: 'FetchFunctions' },
        category: 'Async',
      },
    },
    excludeSelected: {
      description: 'Whether to exclude already selected items from the dropdown list.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
        category: 'Configuration',
      },
    },
    styleTheme: {
      description: 'Custom CSS class names to override default styling.',
      control: { type: 'object' },
      table: {
        type: { summary: 'StyleThemeProps' },
        category: 'Styling',
      },
    },
    onChangeSelection: {
      description: 'Callback function called whenever the selection changes. Receives an array of selected items.',
      action: 'selection changed',
      table: {
        type: { summary: '(items: { id: string; value: string; operator?: Operator }[]) => void' },
        category: 'Events',
      },
    },
    withUrl: {
      description: 'Enable URL synchronization. Filter state will be reflected in URL parameters.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'Configuration',
      },
    },
    inputPlaceholder: {
      description: 'Placeholder text for the search input field.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'Search or filter by...'" },
        category: 'UI',
      },
    },
    searchItem: {
      description: 'Configuration for the text search item (label and icon).',
      control: { type: 'object' },
      table: {
        type: { summary: '{ label: string; icon?: IconType }' },
        category: 'UI',
      },
    },
    defaultSelectedItems: {
      description: 'Array of items to pre-select when the component mounts.',
      control: { type: 'object' },
      table: {
        type: { summary: '{ itemValue: string; subItemValue: string }[]' },
        category: 'Data',
      },
    },
    defaultSearchQuery: {
      description: 'Default search query text to display in the input (mutually exclusive with defaultQuerySelection).',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
        category: 'Data',
      },
    },
    defaultQuerySelection: {
      description: 'Default search query to auto-select (mutually exclusive with defaultSearchQuery).',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
        category: 'Data',
      },
    },
    debounceDelay: {
      description: 'Debounce delay in milliseconds for async fetch operations.',
      control: { type: 'number' },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '500' },
        category: 'Async',
      },
    },
    loadingText: {
      description: 'Text to display while loading async data.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'Loading...'" },
        category: 'UI',
      },
    },
    noResultsText: {
      description: 'Text to display when no results are found.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'No results found'" },
        category: 'UI',
      },
    },
    onItemClick: {
      description: 'Callback fired when an item/sub-item is selected.',
      action: 'item clicked',
      table: {
        type: { summary: '(item: Item, subItem: SubItem) => void' },
        category: 'Events',
      },
    },
    onItemRemoveClick: {
      description: 'Callback fired when an item/sub-item is removed.',
      action: 'item removed',
      table: {
        type: { summary: '(item: Item, subItem: SubItem) => void' },
        category: 'Events',
      },
    },
  },
} as Meta<typeof SmartFiltero>;

// ============================================================================
// Sample Data & Fetch Functions
// ============================================================================

// Note: The type definition says fetchFunctions return void, but the actual implementation
// expects them to return data arrays. This is a type mismatch in the library itself.
// We use type assertions to work around this.
const fetchCustomers = async (query = '') => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/users${query ? `?name_like=${query}` : ''}`);
  const data = await response.json();
  return data.map((user: { username: string, name: string }) => ({
    value: user.username,
    label: user.name,
    icon: User,
  })) as any;
};

const fetchProducts = async (query = '') => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  const allProducts = [
    { value: 'laptop', label: 'Laptop' },
    { value: 'phone', label: 'Smartphone' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'headphones', label: 'Headphones' },
    { value: 'keyboard', label: 'Keyboard' },
  ];
  
  if (!query) return allProducts as any;
  return allProducts.filter(p => 
    p.label.toLowerCase().includes(query.toLowerCase())
  ) as any;
};

// Basic items for most examples
const basicItems: Item[] = [
  {
    value: 'status',
    label: 'Status',
    icon: Tag,
    subItems: [
      { value: 'cancel', label: 'Canceled', icon: CircleX },
      { value: 'in-progress', label: 'In-progress', icon: Clock },
      { value: 'paid', label: 'Paid', icon: CheckCircle },
    ],
  },
  {
    value: 'city',
    label: 'City',
    icon: MapPin,
    subItems: [
      { value: 'new_york', label: 'New York' },
      { value: 'los_angeles', label: 'Los Angeles' },
      { value: 'chicago', label: 'Chicago' },
      { value: 'houston', label: 'Houston' },
      { value: 'phoenix', label: 'Phoenix' },
    ],
  },
];

// E-commerce example items
const ecommerceItems: Item[] = [
  {
    value: 'category',
    label: 'Category',
    icon: ShoppingBag,
    subItems: [
      { value: 'electronics', label: 'Electronics' },
      { value: 'clothing', label: 'Clothing' },
      { value: 'books', label: 'Books' },
      { value: 'home', label: 'Home & Garden' },
    ],
  },
  {
    value: 'brand',
    label: 'Brand',
    icon: Tag,
    subItems: [
      { value: 'apple', label: 'Apple' },
      { value: 'samsung', label: 'Samsung' },
      { value: 'sony', label: 'Sony' },
      { value: 'lg', label: 'LG' },
    ],
  },
  {
    value: 'product',
    label: 'Product',
    icon: ShoppingBag,
    subItems: [],
    isAsync: true,
  },
];

// ============================================================================
// Template Components
// ============================================================================

const BasicTemplate: StoryFn<SmartFilteroProps> = (args) => {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  return (
    <div>
      <SmartFiltero
        {...args}
        onChangeSelection={(items) => {
          setSelectedItems(items.map(item => ({ ...item })))
        }}
      />
      <div className="selected-items">
        <h3>Selected Items</h3>
        <pre>{JSON.stringify(selectedItems, null, 2)}</pre>
      </div>
    </div>
  );
};

const UrlSyncTemplate: StoryFn<SmartFilteroProps> = (args) => {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useState(window.location.search);

  useEffect(() => {
    const handleUrlChange = () => setSearchParams(window.location.search);
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const filterParams = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    const storybookParams = ["viewMode", "id", "globals", "args"];
    storybookParams.forEach((key) => params.delete(key));
    return params.toString() || 'No filter parameters';
  }, [searchParams]);

  return (
    <div>
      <SmartFiltero
        {...args}
        withUrl={true}
        onChangeSelection={(items) => {
          setSelectedItems(items);
        }}
      />
      <div className="selected-items">
        <h3>Selected Items</h3>
        <pre>{JSON.stringify(selectedItems, null, 2)}</pre>
        <h3>URL Parameters</h3>
        <pre>{filterParams}</pre>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          💡 Try selecting filters and notice how the URL updates. You can share or bookmark URLs with filters applied!
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// Stories: Basic Usage
// ============================================================================

/**
 * The most basic usage of SmartFiltero. Simply provide an array of items with their sub-items.
 * Users can click on items to see sub-items, then select filters.
 */
export const Basic: StoryObj<SmartFilteroProps> = {
  render: BasicTemplate,
  args: {
    items: basicItems,
    onChangeSelection: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic usage with static filter items. Click on an item to see its sub-items, then select a filter.',
      },
    },
  },
};

/**
 * Customize the placeholder text shown in the search input.
 */
export const CustomPlaceholder: StoryObj<SmartFilteroProps> = {
  render: BasicTemplate,
  args: {
    items: basicItems,
    inputPlaceholder: 'Search orders or filter by status, city...',
    onChangeSelection: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Customize the input placeholder to guide users on what they can search or filter.',
      },
    },
  },
};

/**
 * Pre-select some filters when the component loads.
 */
export const WithDefaultSelection: StoryFn<SmartFilteroProps> = (args) => {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const handleChangeSelectionRef = useRef<((items: any[]) => void) | null>(null);

  // Create the onChangeSelection callback using useCallback
  // Use map to create new object references for React state updates
  const handleChangeSelection = useCallback((items: any[]) => {
    console.log('items', items);
    setSelectedItems(items.map(item => ({ ...item })));
  }, []);

  // Store the callback in ref
  useEffect(() => {
    handleChangeSelectionRef.current = handleChangeSelection;
  }, [handleChangeSelection]);

  // Manually construct and trigger onChangeSelection for default items
  // because selectItemFromUrl doesn't update collectionRef or call onChangeSelection
  useEffect(() => {
    if (args.defaultSelectedItems && args.defaultSelectedItems.length > 0 && !isInitialized) {
      const initialCollection = args.defaultSelectedItems.map(defaultItem => {
        const item = args.items.find(i => i.value === defaultItem.itemValue);
        const subItem = item?.subItems?.find(s => s.value === defaultItem.subItemValue);
        
        if (item && subItem) {
          return {
            id: item.value,
            value: subItem.value,
          };
        }
        return null;
      }).filter(Boolean) as { id: string; value: string }[];

      // Call onChangeSelection after a delay to allow component to initialize
      setTimeout(() => {
        if (initialCollection.length > 0 && handleChangeSelectionRef.current) {
          handleChangeSelectionRef.current(initialCollection);
          setIsInitialized(true);
        }
      }, 300);
    }
  }, [args.defaultSelectedItems, args.items, isInitialized]);

  return (
    <div>
      <SmartFiltero
        {...args}
        onChangeSelection={(items) => {
          handleChangeSelection(items);
        }}
      />
      <div className="selected-items">
        <h3>Selected Items</h3>
        <pre>{JSON.stringify(selectedItems, null, 2)}</pre>
        {selectedItems.length === 0 && !isInitialized && (
          <p style={{ fontSize: '14px', color: '#999', marginTop: '10px', fontStyle: 'italic' }}>
            ⏳ Waiting for default items to be selected... (The component processes defaultSelectedItems on mount)
          </p>
        )}
        {selectedItems.length > 0 && (
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            ✅ Notice that Status → Paid and City → New York are pre-selected when the component loads!
          </p>
        )}
      </div>
    </div>
  );
};

WithDefaultSelection.args = {
  items: basicItems,
  defaultSelectedItems: [
    { itemValue: 'status', subItemValue: 'paid' },
    { itemValue: 'city', subItemValue: 'new_york' },
  ],
  
  onChangeSelection: () => {},
};

WithDefaultSelection.parameters = {
  docs: {
    description: {
      story: 'Pre-select filters using `defaultSelectedItems`. Useful for initializing filters from saved preferences or URL parameters. The component will automatically select these items when it mounts.',
    },
  },
};

// ============================================================================
// Stories: Operators
// ============================================================================

/**
 * Use custom operators to control how filters are applied. 
 * Single operators (is, is not) allow one selection per filter.
 * Multi operators (any of, not any of) allow multiple selections.
 */
export const WithCustomOperators: StoryObj<SmartFilteroProps> = {
  render: BasicTemplate,
  args: {
    items: basicItems,
    operators: [
      { value: 'is', label: 'is' },
      { value: 'is-not', label: 'is not' },
      { value: 'any', label: 'any of' },
      { value: 'not-any', label: 'not any of' },
    ],
    onChangeSelection: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: `
Custom operators allow you to control filter behavior:

- **Single operators** ("is", "is not"): Allow only one selection per filter
- **Multi operators** ("any of", "not any of"): Allow multiple selections per filter

Try selecting "City" → "any of" → then select multiple cities!
        `,
      },
    },
  },
};

// ============================================================================
// Stories: Async Data Loading
// ============================================================================

/**
 * Load filter options dynamically from an API. 
 * Set `isAsync: true` on an item and provide a fetch function.
 */
export const WithAsyncData: StoryObj<SmartFilteroProps> = {
  render: BasicTemplate,
  args: {
    items: [
      {
        value: 'customer_username',
        label: 'Customer',
        icon: User,
        subItems: [],
        isAsync: true,
      }
    ],
    fetchFunctions: {
      customer_username: fetchCustomers,
    } as any,
    debounceDelay: 500,
    loadingText: 'Loading customers...',
    noResultsText: 'No customers found',
    inputPlaceholder: 'Search for a customer...',
    onChangeSelection: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: `
Load filter options dynamically from APIs in real-time:

1. Set \`isAsync: true\` on an item
2. Provide a fetch function in \`fetchFunctions\` object
3. The function receives a query string and should return an array of sub-items
4. Data is fetched as you type (with debouncing)

**Try it:** Click on "Customer" and start typing to see real-time data fetching from the API!
        `,
      },
    },
  },
};

/**
 * E-commerce example with async product search.
 */
export const EcommerceExample: StoryObj<SmartFilteroProps> = {
  render: BasicTemplate,
  args: {
    items: ecommerceItems,
    fetchFunctions: {
      product: fetchProducts,
    } as any,
    operators: [
      { value: 'is', label: 'is' },
      { value: 'any', label: 'any of' },
    ],
    inputPlaceholder: 'Search products or filter by category, brand...',
    onChangeSelection: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Real-world e-commerce example with category, brand, and async product search.',
      },
    },
  },
};

// ============================================================================
// Stories: URL Synchronization
// ============================================================================

/**
 * Enable URL synchronization to keep filter state in the URL.
 * This allows users to share filtered views and bookmark specific filter combinations.
 */
export const WithUrlSync: StoryObj<SmartFilteroProps> = {
  render: UrlSyncTemplate,
  args: {
    items: basicItems,
    withUrl: true,
    operators: [
      { value: 'is', label: 'is' },
      { value: 'is-not', label: 'is not' },
      { value: 'any', label: 'any of' },
      { value: 'not-any', label: 'not any of' },
    ],
    onChangeSelection: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: `
URL synchronization enables:

- **Shareable URLs**: Users can share links with filters applied
- **Bookmarkable**: Save specific filter combinations
- **Browser navigation**: Back/forward buttons work with filters
- **Deep linking**: Link directly to filtered views

The URL format uses pipe separators: \`status=is:paid&city=any:new_york|chicago\`
        `,
      },
    },
  },
};

/**
 * Advanced URL sync example showing the pipe separator format.
 */
export const UrlSyncAdvanced: StoryFn<SmartFilteroProps> = (args) => {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [currentUrl, setCurrentUrl] = useState(window.location.href);
  
  useEffect(() => {
    const handleUrlChange = () => setCurrentUrl(window.location.href);
    window.addEventListener('popstate', handleUrlChange);
    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      handleUrlChange();
    };
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>🚀 URL Format Documentation</h3>
        <p><strong>SmartFiltero uses a clean, future-proof URL structure:</strong></p>
        <ul style={{ marginLeft: '20px' }}>
          <li><strong>Single select:</strong> <code>status=is:paid</code></li>
          <li><strong>Single negative:</strong> <code>status=is-not:cancel</code></li>
          <li><strong>Multi include:</strong> <code>city=any:new_york|chicago</code></li>
          <li><strong>Multi exclude:</strong> <code>city=not-any:new_york|chicago</code></li>
          <li><strong>Text search:</strong> <code>search=keyword</code></li>
          <li><strong>Mixed filters:</strong> <code>status=is:paid&city=any:new_york|chicago</code></li>
        </ul>
        <p><strong>Try it:</strong> Select filters and watch the URL update in real-time!</p>
      </div>

      <SmartFiltero
        {...args}
        items={basicItems}
        withUrl={true}
        onChangeSelection={(items) => setSelectedItems(items)}
        operators={[
          {value: 'is', label: 'is'},
          {value: 'is-not', label: 'is not'},
          {value: 'any', label: 'any of'},
          {value: 'not-any', label: 'not any of'},
        ]}
      />

      <div className="selected-items">
        <h3>Selected Items</h3>
        <pre>{JSON.stringify(selectedItems, null, 2)}</pre>
        
        <h3>Current URL</h3>
        <pre style={{ wordBreak: 'break-all' }}>{currentUrl}</pre>
        
        <h3>Filter Parameters (excluding Storybook params)</h3>
        <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', fontFamily: 'monospace' }}>
          {(() => {
            const params = new URLSearchParams(window.location.search);
            const storybookParams = ['args', 'globals', 'viewMode', 'id'];
            storybookParams.forEach(param => params.delete(param));
            
            const filterParams: string[] = [];
            Array.from(params.entries()).forEach(([key, value]) => {
              if (!storybookParams.includes(key)) {
                filterParams.push(`${key}=${value}`);
              }
            });
            
            return filterParams.length > 0 ? filterParams.join('&') : 'No filter parameters';
          })()}
        </div>
      </div>
    </div>
  );
};

UrlSyncAdvanced.args = {
  items: basicItems,
};

UrlSyncAdvanced.parameters = {
  docs: {
    description: {
      story: 'Advanced URL sync example showing the pipe separator format and real-time URL updates.',
    },
  },
};

// ============================================================================
// Stories: Event Handlers
// ============================================================================

/**
 * Use event handlers to react to filter selections and removals.
 * Perfect for triggering side effects like API calls, analytics, or dynamic item updates.
 */
export const WithEventHandlers: StoryFn<SmartFilteroProps> = (args) => {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [filterItems, setFilterItems] = useState<Item[]>(basicItems);
  const [eventLog, setEventLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setEventLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 10));
  };

  const handleItemClick = (item: Item, subItem: SubItem) => {
    addLog(`✅ Selected: ${item.label} → ${subItem.label}`);
    
    // Example: Dynamically add a new filter when "paid" status is selected
    if (item.value === 'status' && subItem.value === 'paid') {
      addLog('💰 Triggering special logic for paid orders...');
      
      // Example: Update city options
      setFilterItems(prevItems => 
        prevItems.map(filterItem => {
          if (filterItem.value === 'city' && filterItem.subItems) {
            return {
              ...filterItem,
              subItems: filterItem.subItems.map(sub =>
                sub.value === 'new_york'
                  ? { ...sub, label: 'New York (Premium)' }
                  : sub
              ),
            };
          }
          return filterItem;
        })
      );
    }
  };

  const handleItemRemove = (item: Item, subItem: SubItem) => {
    addLog(`❌ Removed: ${item.label} → ${subItem.label}`);
    
    // Example: Revert changes when filter is removed
    if (item.value === 'status' && subItem.value === 'paid') {
      addLog('🔄 Reverting changes...');
      setFilterItems(basicItems);
    }
  };

  return (
    <div>
      <SmartFiltero
        {...args}
        items={filterItems}
        onItemClick={handleItemClick}
        onItemRemoveClick={handleItemRemove}
        onChangeSelection={(items) => {
          setSelectedItems(items);
          addLog(`📊 Selection updated: ${items.length} active filters`);
        }}
      />
      <div className="selected-items">
        <h3>Selected Items</h3>
        <pre>{JSON.stringify(selectedItems, null, 2)}</pre>
        
        <h3>Event Log</h3>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '10px', 
          borderRadius: '4px',
          maxHeight: '200px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {eventLog.length > 0 ? (
            eventLog.map((log, idx) => <div key={idx}>{log}</div>)
          ) : (
            <div style={{ color: '#999' }}>No events yet. Try selecting or removing filters!</div>
          )}
        </div>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          💡 Notice how selecting "Status → Paid" updates the city options dynamically!
        </p>
      </div>
    </div>
  );
};

WithEventHandlers.args = {
  items: basicItems,
  operators: [
    { value: 'is', label: 'is' },
    { value: 'any', label: 'any of' },
  ],
};

WithEventHandlers.parameters = {
  docs: {
    description: {
      story: `
Use \`onItemClick\` and \`onItemRemoveClick\` to react to filter changes:

- **Dynamic item updates**: Modify filter options based on selections
- **Analytics**: Track filter usage
- **API calls**: Trigger data fetching when filters change
- **Side effects**: Update other parts of your application

In this example, selecting "Paid" status dynamically updates city options!
      `,
    },
  },
};

// ============================================================================
// Stories: Text Search
// ============================================================================

/**
 * SmartFiltero supports free-text search queries.
 * Users can type and select a search query that appears as a selected item.
 */
export const WithTextSearch: StoryObj<SmartFilteroProps> = {
  render: BasicTemplate,
  args: {
    items: basicItems,
    searchItem: {
      label: 'Search for this text',
      icon: Tag,
    },
    inputPlaceholder: 'Type to search or filter...',
    onChangeSelection: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: `
Text search allows users to enter free-form queries:

1. Type in the input field
2. A search option appears in the dropdown
3. Click it to add the search query as a filter
4. The search query appears as a selected item

Customize the search item label and icon using \`searchItem\` prop.
        `,
      },
    },
  },
};

/**
 * Pre-populate a search query when the component loads.
 */
export const WithDefaultSearchQuery: StoryObj<SmartFilteroProps> = {
  render: BasicTemplate,
  args: {
    items: basicItems,
    defaultSearchQuery: 'laptop',
    inputPlaceholder: 'Search products...',
    onChangeSelection: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Pre-populate the search input with a default query using `defaultSearchQuery`.',
      },
    },
  },
};

// ============================================================================
// Stories: Complete Examples
// ============================================================================

/**
 * A complete, production-ready example combining all features:
 * - Multiple filter types
 * - Async data loading
 * - URL synchronization
 * - Custom operators
 * - Event handlers
 */
export const CompleteExample: StoryFn<SmartFilteroProps> = (args) => {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useState(window.location.search);

  useEffect(() => {
    const handleUrlChange = () => setSearchParams(window.location.search);
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const filterParams = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    const storybookParams = ["viewMode", "id", "globals", "args"];
    storybookParams.forEach((key) => params.delete(key));
    return params.toString() || 'No filter parameters';
  }, [searchParams]);

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '15px', background: '#e8f5e9', borderRadius: '8px', border: '1px solid #4caf50' }}>
        <h3 style={{ marginTop: 0 }}>🎯 Complete Example</h3>
        <p>This example demonstrates all SmartFiltero features working together:</p>
        <ul style={{ marginLeft: '20px' }}>
          <li>✅ Static filter items (Status, City)</li>
          <li>✅ URL synchronization</li>
          <li>✅ Custom operators (is, is not, any of, not any of)</li>
          <li>✅ Text search</li>
          <li>✅ Event callbacks</li>
        </ul>
      </div>

      <SmartFiltero
        {...args}
        items={basicItems}
        withUrl={true}
        operators={[
          { value: 'is', label: 'is' },
          { value: 'is-not', label: 'is not' },
          { value: 'any', label: 'any of' },
          { value: 'not-any', label: 'not any of' },
        ]}
        inputPlaceholder="Search orders or filter by status, city..."
        searchItem={{
          label: 'Search for this text',
          icon: Tag,
        }}
        onItemClick={(item, subItem) => {
          console.log(`Selected: ${item.label} → ${subItem.label}`);
        }}
        onChangeSelection={(items) => {
          setSelectedItems(items);
        }}
      />

      <div className="selected-items">
        <h3>Selected Filters</h3>
        <pre>{JSON.stringify(selectedItems, null, 2)}</pre>
        <h3>URL Parameters</h3>
        <pre>{filterParams}</pre>
      </div>
    </div>
  );
};

CompleteExample.parameters = {
  docs: {
    description: {
      story: 'A complete example showcasing all SmartFiltero features working together in a production-ready setup.',
    },
  },
};
