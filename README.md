# Performance Render Optimization Example

## Overview
This project demonstrates how to prevent unnecessary re-renders in React components using `React.memo` and `useCallback`.

## Key Techniques
1. `React.memo`: Prevents re-rendering of a component if its props haven't changed
2. `useCallback`: Memoizes callback functions to maintain referential equality

## Performance Testing
- Open browser console
- Watch console logs to see when components re-render
- Click items and observe render behavior

### Expected Behavior
- First render: All items log a render
- Subsequent clicks should not cause unnecessary re-renders of unchanged items

## Running the Project
```bash
npm install
npm start
```

## Performance Insights
- Unnecessary re-renders can significantly impact application performance
- Use React DevTools Profiler to measure render performance
- Memoization helps optimize list and grid component rendering
