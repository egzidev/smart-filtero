# SmartFiltero Example Usage

This guide demonstrates how to integrate and use the `SmartFiltero` component in a React project for dynamic filtering functionality.

---

## Prerequisites

- React >= 16.8 (for hooks)
- Install the following dependencies:

```bash
npm install smart-filtero lucide-react
```

Ensure you’ve added smart-filtero styles:

```jsx
import 'smart-filtero/dist/smart-filtero.css';
```

Example Code

Here’s a step-by-step example of using SmartFiltero to create a filterable interface.

1. Define Filter Options

Define the items you want to include in the filters:

```jsx
import { User, Tag, CircleDollarSign, MapPin, CheckCircle, CircleX, Clock} from 'lucide-react';

const items = [
    {id: 'customer_username', label: 'Customer',  icon: User},
    {id: 'status', label: 'Status', icon: Tag},
    {id: 'total', label: 'Total', icon: CircleDollarSign},
    {id: 'city', label: 'City', icon: MapPin},
]

const subItems = {
    customer_username: [
      {label: 'John Doe'},
      {label: 'John Doe'},
      {label: 'Leo Do'},
    ],
    status: [
      {label: 'Canceled', icon: CircleX},
      {label: 'In-progress', icon: Clock},
      {label: 'Paid', icon: CheckCircle},
    ],
    total: [
        {id: 'less_than_100', label: 'Less than $100'},
        {id: 'more_than_100', label: 'More than $100'},
    ],
    city: [
        {id: 'new_york', label: 'New York'},
        {id: 'los_angeles', label: 'Los Angeles'},
    ],
}
```

2. Integrate the SmartFiltero Component

Integrate the `SmartFiltero` component in your React component:

```jsx
import React, { useState } from 'react';
import SmartFiltero from 'smart-filtero';
import 'smart-filtero/dist/smart-filtero.css';


const Example = () => {
    return (
        <SmartFiltero
            items={items}
            subItems={subItems}
        />
    );
}
