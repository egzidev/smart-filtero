import React, { useState} from 'react';
import {Meta, StoryFn} from '@storybook/react';
import SmartFiltero from "./../components/SmartFiltero";
import {SmartFilteroProps} from '@/types';
import {User, Tag, CircleDollarSign, MapPin, CircleX, Clock, CheckCircle, LucideBanknote} from 'lucide-react';
import './style.css';

export default {
  title: 'Smart Filtero',
  component: SmartFiltero,
} as Meta;

const items = [
  {id: 'customer_username', label: 'Customer', icon: User, isAsync: true},
  {id: 'investor_username', label: 'Investor', icon: LucideBanknote, isAsync: true},
  {id: 'status', label: 'Status', icon: Tag},
  {id: 'total', label: 'Total', icon: CircleDollarSign},
  {id: 'city', label: 'City', icon: MapPin},
];

const staticSubItems = {
  status: [
    {label: 'Canceled', icon: CircleX},
    {label: 'In-progress', icon: Clock},
    {label: 'Paid', icon: CheckCircle},
  ],
  total: [
    {label: 'Less than $100', min: 0, max: 100},
    {label: '$100 - $200', min: 100, max: 200},
    {label: '$200 - $300', min: 200, max: 300},
    {label: '$300 - $400', min: 300, max: 400},
    {label: '$400 - $500', min: 400, max: 500},
    {label: 'More than $500', min: 500, max: Infinity},
  ],
  city: [
    {label: 'New York'},
    {label: 'Los Angeles'},
    {label: 'Chicago'},
    {label: 'Houston'},
    {label: 'Phoenix'},
    {label: 'Philadelphia'},
    {label: 'San Antonio'},
    {label: 'San Diego'},
    {label: 'Dallas'},
    {label: 'San Jose'},
    {label: 'Austin'},
    {label: 'Jacksonville'},
    {label: 'Fort Worth'},
    {label: 'Columbus'},
  ]
};

// Fetch function for customers
const fetchCustomers = async (query = '') => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/users${query ? `?name_like=${query}` : ''}`);
  const data = await response.json();
  return data.map((user: { name: string, icon: any }) => ({
    label: user.name,
    icon: User,
  }));
};

// Function to get URL search parameters and convert them to selected items
const getSelectedItemsFromURL = () => {
  const params = new URLSearchParams(window.location.search);

  // Remove unwanted keys
  ["viewMode", "id", "globals"].forEach((key) => params.delete(key));

  return Array.from(params.toString())
};


const AsyncTemplate: StoryFn<SmartFilteroProps> = (args) => {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [investors, setInvestors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [fetching, setFetching] = useState(false);

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
        <pre>Url: {getSelectedItemsFromURL()}</pre>
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
