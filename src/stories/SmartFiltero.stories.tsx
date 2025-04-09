import React, {useEffect, useMemo, useState} from 'react';
import {Meta, StoryFn} from '@storybook/react';
import SmartFiltero from "./../components/SmartFiltero";
import {SmartFilteroProps} from '@/types';
import {User, Tag,  CircleX, Clock, CheckCircle} from 'lucide-react';
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

  useEffect(() => {
    const handleUrlChange = () => setSearchParams(window.location.search);

    window.addEventListener('popstate', handleUrlChange); // Listen for back/forward events
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const getSelectedItemsFromURL = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    ["viewMode", "id", "globals", "args"].forEach((key) => params.delete(key));
    console.log('params:', params.toString());
    return Array.from(params.toString());
  }, [searchParams]);

  const fetchFunctions = {
    customer_username: fetchCustomers,
  };

  return (
    <div>
      {/* Render SmartFiltero */}
      <SmartFiltero
        {...args}
        fetchFunctions={fetchFunctions}
        getSelectedItems={(items) => {
          console.log('Selected Items:', items);
          setSelectedItems([...items]);
        }}
      />

      {/* Display Selected Items */}
      <div className="selected-items">
        <h3>Selected Items</h3>
        <pre>{JSON.stringify(selectedItems, null, 2)}</pre>
        <pre>URL Params: {getSelectedItemsFromURL}</pre>
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
