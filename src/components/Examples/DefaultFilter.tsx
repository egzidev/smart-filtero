import React from 'react';
import { ChevronDown } from 'lucide-react'; // Adjust the import path based on your project setup.

// Interface for props
interface DefaultFilterProps {
  customers: string[];
  statuses: string[];
  total: string[];
  cities: string[];
  onSearch: (searchText: string) => void;
}

const DefaultFilter: React.FC<DefaultFilterProps> = ({ customers, statuses, total,cities, onSearch }) => {
  return (
    <div className="grid gap-3 mb-4 grid-cols-12">
      <div className="grid grid-cols-1 col-span-2">
        <select
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
        >
          <option value="Author">Customer</option>
          {customers.map((customer, index) => (
            <option key={index} value={customer}>
              {customer}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" />
      </div>

      <div className="grid grid-cols-1 col-span-2">
        <select
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
        >
          <option value="Label">Status</option>
          {statuses.map((status, index) => (
            <option key={index} value={status}>
              {status}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" />
      </div>

      <div className="grid grid-cols-1 col-span-2">
        <select
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
        >
          <option value="Assignee">Total</option>
          {total.map((t, index) => (
            <option key={index} value={t}>
              {t}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" />
      </div>

      <div className="grid grid-cols-1 col-span-2">
        <select
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
        >
          <option value="Assignee">Cities</option>
          {cities.map((t, index) => (
            <option key={index} value={t}>
              {t}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" />
      </div>

      {/* Search Input */}
      <div className="grid grid-cols-1 col-span-4">
        <input
          name="search"
          type="text"
          placeholder="Search"
          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          onChange={(e) => onSearch(e.target.value)} // Call the onSearch prop function on input change
        />
      </div>
    </div>
  );
};

export default DefaultFilter;