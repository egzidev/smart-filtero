import React, {useEffect, useMemo, useState} from 'react';
import {Meta, StoryFn} from '@storybook/react';
import SmartFiltero from "./../components/SmartFiltero";
import {SmartFilteroProps} from '@/types';
import {User, Tag, MapPin, CircleX, Clock, CheckCircle, LucideBanknote} from 'lucide-react';
import './style.css';

export default {
  title: 'Smart Filtero',
  component: SmartFiltero,
  tags: ["autodocs"],
} as Meta;

const items = [
  {value: 'customer_username', label: 'Customer', icon: User, isAsync: true},
  {value: 'investor_username', label: 'Investor', icon: LucideBanknote, isAsync: true},
  {value: 'status', label: 'Status', icon: Tag},
  {value: 'city', label: 'City', icon: MapPin},
];

const staticSubItems = {
  status: [
    {value: 'cancel', label: 'Canceled', icon: CircleX},
    {value: 'in-progress', label: 'In-progress', icon: Clock},
    {value: 'paid', label: 'Paid', icon: CheckCircle},
  ],
  city: [
    {value: 'new_york', label: 'New York'},
    {value: 'los_angeles', label: 'Los Angeles'},
    {value: 'chicago', label: 'Chicago'},
    {value: 'houston', label: 'Houston'},
    {value: 'phoenix', label: 'Phoenix'},
    {value: 'philadelphia', label: 'Philadelphia'},
    {value: 'san_antonio', label: 'San Antonio'},
    {value: 'san_diego', label: 'San Diego'},
    {value: 'dallas', label: 'Dallas'},
    {value: 'san_jose', label: 'San Jose'},
    {value: 'austin', label: 'Austin'},
    {value: 'jacksonville', label: 'Jacksonville'},
    {value: 'fort_worth', label: 'Fort Worth'},
    {value: 'columbus', label: 'Columbus'},
  ]
};

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

const AsyncTemplate: StoryFn<SmartFilteroProps> = (args) => {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [investors, setInvestors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [fetching, setFetching] = useState(false);

  const [searchParams, setSearchParams] = useState(window.location.search);

  useEffect(() => {
    const handleUrlChange = () => setSearchParams(window.location.search);

    window.addEventListener('popstate', handleUrlChange); // Listen for back/forward events
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const getSelectedItemsFromURL = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    ["viewMode", "id", "globals", "args"].forEach((key) => params.delete(key));
    console.log('params:', params.toString()  );
    return Array.from(params.toString());
  }, [searchParams]);

  const loadInvestors = async (query = '') => {
    setFetching(true);
    try {
      const data = await fetchCustomers(query);
      setInvestors(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setFetching(false);
    }
  };

  const loadCustomers = async (query = '') => {
    setFetching(true);
    try {
      const data = await fetchCustomers(query);
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setFetching(false);
    }
  };

  const fetchFunctions = {
    customer_username: loadCustomers,
    investor_username: loadInvestors,
  };

  const updatedSubItems = {
    ...staticSubItems,
    customer_username: customers,
    investor_username: investors
  };

  return (
    <div>
      {/* Render SmartFiltero */}
      <SmartFiltero
        {...args}
        subItems={updatedSubItems}
        fetching={fetching}
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
  subItems: staticSubItems,
  fetching: false,
};

// With placeholder
export const WithPlaceholder = AsyncTemplate.bind({});
WithPlaceholder.args = {
  items,
  subItems: staticSubItems,
  fetching: false,
  inputPlaceholder: 'Input placeholder',
};

// without withoutUrl true
export const WithoutUrl = AsyncTemplate.bind({});
WithoutUrl.args = {
  items,
  subItems: staticSubItems,
  fetching: false,
  withoutUrl: true,
};

// with defaultSelectedItems
export const WithDefaultSelectedItems = AsyncTemplate.bind({});
WithDefaultSelectedItems.args = {
  items,
  subItems: staticSubItems,
  defaultSelectedItems: [
    {itemValue: 'city', subItemValue: 'new_york'},
  ],
};
