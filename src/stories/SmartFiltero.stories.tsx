import React, {useEffect, useMemo, useState} from 'react';
import {Meta, StoryFn} from '@storybook/react';
import SmartFiltero from "./../components/SmartFiltero";
import {Item, SmartFilteroProps, SubItem} from '@/types';
import {User, Tag, CircleX, Clock, CheckCircle} from 'lucide-react';
import './style.css';

export default {
  title: 'Smart Filtero',
  component: SmartFiltero,
  tags: ["autodocs"],
} as Meta;


// Fetch function for customers
const fetchCustomers = async (query = '') => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/users${query ? `?name_like=${query}` : ''}`);
  const data = await response.json();
  return data.map((user: { username: string, name: string, icon: any }) => ({
    value: user.username,
    label: user.name,
    icon: User,
  }));
};

const items = [
  {
    value: 'status',
    label: 'Status',
    icon: Tag,
    subItems: [
      {
        value: 'cancel',
        label: 'Canceled',
        icon: CircleX,
      },
      {
        value: 'in-progress',
        label: 'In-progress',
        icon: Clock,
      },
      {
        value: 'paid',
        label: 'Paid',
        icon: CheckCircle,
      },
    ],
  },
  {
    value: 'city',
    label: 'City',
    icon: Tag,
    subItems: [
      {value: 'new_york', label: 'New York'},
      {value: 'los_angeles', label: 'Los Angeles'},
      {value: 'chicago', label: 'Chicago'},
    ],
  },
  {
    value: 'customer_username',
    label: 'Customer',
    icon: User,
    subItems: [],
    isAsync: true,
  }
];

const AsyncTemplate: StoryFn<SmartFilteroProps> = (args) => {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useState(window.location.search);
  const [filterItems, setFilterItems] = useState<Item[]>(items);

  useEffect(() => {
    const handleUrlChange = () => setSearchParams(window.location.search);

    window.addEventListener('popstate', handleUrlChange); // Listen for back/forward events
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const onChangeSelectionFromURL = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    // Remove Storybook-specific parameters
    const storybookParams = ["viewMode", "id", "globals", "args"];
    storybookParams.forEach((key) => params.delete(key));
    console.log('Filtered params:', params.toString());
    return params.toString() || 'No filter parameters';
  }, [searchParams]);

  const fetchFunctions = {
    customer_username: fetchCustomers,
  };

  const onClickStatusPaid = (item: Item, subItem: SubItem) => {
    // console.log(`[SELECTED] ${item.label} → ${subItem.label}`);

    // Example 1: Trigger special behavior for "status: paid"
    if (item.value === 'status' && subItem.value === 'paid') {
      console.log('Triggering discount logic for paid orders...');

      const updatedItems = filterItems.map((filterItem) => {
        if (filterItem.value === 'city' && filterItem.subItems) {
          return {
            ...filterItem,
            subItems: filterItem.subItems.map((sub) =>
              sub.value === 'new_york'
                ? {...sub, value: 'egzi', label: 'Egzi'}
                : sub
            ),
          };
        }
        return filterItem;
      });
      setFilterItems(updatedItems);
    }

    if (item.value === 'status' && subItem.value === 'cancel') {
      setFilterItems(prevItems => {
        return [
          ...prevItems,
          {
            value: 'doctor',
            label: 'Doctor',
            icon: Tag,
            subItems: [
              {
                value: 'doctor_1',
                label: 'Doctor 1',
                icon: Tag,
              }
            ],
          }
        ]
      })
    }
  }

  const onClickRemoveStatusPaid = (item: Item, subItem: SubItem) => {
    // console.log(`[REMOVED] ${item.label} → ${subItem.label}`);

    // Example 1: Revert modified data
    if (item.value === 'status' && subItem.value === 'paid') {
      console.log('Reverting city names back to original...');
      // remove doctor item
      setFilterItems(items)
    }

    if (item.value === 'status' && subItem.value === 'cancel') {
      console.log('Reverting city names back to original...');
      // remove doctor item
      setFilterItems(prevItems => {
        return prevItems.filter(item => item.value !== 'doctor');
      })
    }
  }

  return (
    <div>
      {/* Render SmartFiltero */}
      <SmartFiltero
        {...args}
        items={filterItems}
        fetchFunctions={fetchFunctions}
        // onItemClick={onClickStatusPaid}
        // onItemRemoveClick={onClickRemoveStatusPaid}
        onChangeSelection={(items) => {
          // console.log('Selected Items:', items);
          setSelectedItems(items.map(item => ({ ...item })))
          // setSelectedItems(prevItems => prevItems);
        }}
        operators={[
          {value: 'is', label: 'is'},
          {value: 'is-not', label: 'is not'},
          {value: 'any', label: 'any of'},
          {value: 'not-any', label: 'not any of'},
        ]}
      />

      {/* Display Selected Items */}
      <div className="selected-items">
        <h3>Selected Items</h3>
        <pre>{JSON.stringify(selectedItems, null, 2)}</pre>
        <h3>Filter URL Params</h3>
        <pre>{onChangeSelectionFromURL}</pre>
      </div>
    </div>
  );
};

// Default Story
export const Default = AsyncTemplate.bind({});
Default.args = {
  items,
};

// With placeholder
export const WithPlaceholder = AsyncTemplate.bind({});
WithPlaceholder.args = {
  items,
  inputPlaceholder: 'Input placeholder',
};

// With URL params
export const WithUrl = AsyncTemplate.bind({});
WithUrl.args = {
  items,
  withUrl: true,
};

// For testing URL params more explicitly
export const WithUrlDebug: StoryFn<SmartFilteroProps> = (args) => {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [currentUrl, setCurrentUrl] = useState(window.location.href);
  const [filterItems, setFilterItems] = useState<Item[]>(items);

  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentUrl(window.location.href);
    };

    // Listen for URL changes
    window.addEventListener('popstate', handleUrlChange);
    
    // Also listen for pushstate/replacestate (for programmatic changes)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      handleUrlChange();
    };
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      handleUrlChange();
    };

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  const fetchFunctions = {
    customer_username: fetchCustomers,
  };

  return (
    <div>
      <SmartFiltero
        {...args}
        items={filterItems}
        fetchFunctions={fetchFunctions}
        withUrl={true}
        onChangeSelection={(items) => {
          console.log('Selected Items:', items);
          setSelectedItems(items);
        }}
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
        <pre>{currentUrl}</pre>
        <h3>Filter URL Params (excluding Storybook params)</h3>
        <pre>{(() => {
          const params = new URLSearchParams(window.location.search);
          // Remove Storybook-specific parameters
          const storybookParams = ['args', 'globals', 'viewMode', 'id'];
          storybookParams.forEach(param => params.delete(param));
          return params.toString() || 'No filter parameters';
        })()}</pre>
      </div>
    </div>
  );
};

WithUrlDebug.args = {
  items,
};

// Pipe Separator URL Format showcase  
export const PipeSeparatorUrls: StoryFn<SmartFilteroProps> = (args) => {
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

  const fetchFunctions = { customer_username: fetchCustomers };

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>🚀 Pipe Separator URL Format</h3>
        <p><strong>Clean, Future-Proof URL Structure:</strong></p>
        <ul style={{ marginLeft: '20px' }}>
          <li><strong>Single operators:</strong> <code>status=is:active</code></li>
          <li><strong>Single negative:</strong> <code>status=not:inactive</code></li>
          <li><strong>Multi include:</strong> <code>category=any:shoes|sneakers</code></li>
          <li><strong>Multi exclude:</strong> <code>brand=not:any:nike|adidas</code></li>
          <li><strong>Future ready:</strong> <code>date=between:2024-01-01|2024-12-31</code></li>
        </ul>
        <p><strong>Try:</strong> Select Status → "is" → Paid, then City → "any of" → Multiple cities</p>
      </div>

      <SmartFiltero
        {...args}
        items={items}
        fetchFunctions={fetchFunctions}
        withUrl={true}
        onChangeSelection={(items) => setSelectedItems(items)}
        operators={[
          {value: 'is', label: 'is'},
          {value: 'is-not', label: 'is not'},
          {value: 'any', label: 'any of'},
          {value: 'not-any', label: 'not any of'},
          // Future operators that work with pipe format:
          // {value: 'contains', label: 'contains'},
          // {value: 'between', label: 'between'},
          // {value: 'greater', label: 'greater than'},
        ]}
      />

      <div className="selected-items">
        <h3>Selected Items</h3>
        <pre>{JSON.stringify(selectedItems, null, 2)}</pre>
        
        <h3>🎯 Pipe Separator URL Parameters</h3>
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
        
        <h3>📋 URL Format Examples</h3>
        <div style={{ fontSize: '14px', marginTop: '10px', lineHeight: '1.6' }}>
          <div><strong>Single-select:</strong> <code>status=is:paid</code></div>
          <div><strong>Single-select negative:</strong> <code>status=is-not:cancel</code></div>
          <div><strong>Multi-select include:</strong> <code>city=any:new_york|chicago</code></div>
          <div><strong>Multi-select exclude:</strong> <code>city=not-any:new_york|chicago</code></div>
          <div><strong>Mixed filters:</strong> <code>status=is:paid&city=any:new_york|chicago</code></div>
          <div><strong>Future range:</strong> <code>date=between:2024-01-01|2024-12-31</code></div>
        </div>
        
        <div style={{ marginTop: '15px', padding: '10px', background: '#e8f5e8', borderRadius: '4px' }}>
          <strong>✅ Benefits of Pipe Separator:</strong>
          <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
            <li>No routing conflicts with Next.js/Remix</li>
            <li>Clear semantic separation</li>
            <li>Easy programmatic parsing</li>
            <li>Clean nested depth support</li>
            <li>Future-proof for any operator type</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

PipeSeparatorUrls.args = {
  items,
};

// with defaultSelectedItems
export const WithDefaultSelectedItems = AsyncTemplate.bind({});
WithDefaultSelectedItems.args = {
  items,
  defaultSelectedItems: [
    {itemValue: 'city', subItemValue: 'new_york'},
  ],
};
