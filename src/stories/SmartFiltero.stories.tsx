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
    ["viewMode", "id", "globals", "args"].forEach((key) => params.delete(key));
    console.log('params:', params.toString());
    return Array.from(params.toString());
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
        <pre>URL Params: {onChangeSelectionFromURL}</pre>
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

// without withoutUrl true
export const WithUrl = AsyncTemplate.bind({});
WithUrl.args = {
  items,
  withUrl: true,
};

// with defaultSelectedItems
export const WithDefaultSelectedItems = AsyncTemplate.bind({});
WithDefaultSelectedItems.args = {
  items,
  defaultSelectedItems: [
    {itemValue: 'city', subItemValue: 'new_york'},
  ],
};
