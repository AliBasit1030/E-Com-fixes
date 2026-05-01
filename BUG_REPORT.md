# BUG REPORT

### 1. Login/Register error handling missing
- **Issue:** Login and Register pages did not handle API errors (e.g., wrong credentials, validation errors). The UI would not show any error message, leaving the user confused.
- **Resolution:** Added try/catch blocks in AuthContext and pages to catch errors from the API and display them in the UI.

### 2. Duplicate API calls for products and categories
- **Issue:** The Products page was making multiple API calls for products (4 times) and categories (2 times) on initial load and user actions, causing unnecessary network requests and potential performance issues.
- **Resolution:** Refactored the useEffect hooks to ensure categories are fetched only once on mount, and products are fetched only when the selected category or search term changes. This eliminated redundant API calls and optimized frontend behavior.

### 3. Pagination not implemented in Products page
- **Issue:** The Products page did not support pagination. All products matching the search or category were fetched for the first page only, and there were no pagination controls in the UI. This limited the user to viewing only the first set of results and made navigation through large product lists impossible.
- **Resolution:** Added pagination support to the frontend. The Products page now sends the correct `page` parameter to the backend, displays pagination controls (Prev, Next, page numbers), and updates the product list when the page changes. The backend already supported pagination, so no changes were needed there.

### 4. Duplicate cart API calls
- **Issue:** The `/api/cart` endpoint was being called twice when loading the Cart page, causing unnecessary network requests and potential performance issues. This was due to React Strict Mode or multiple renders triggering the `fetchCart` function more than once.
- **Resolution:** Added a ref guard in the Cart page to ensure `fetchCart` is only called once per mount, preventing duplicate API calls even in development or Strict Mode.

### 5. Consecutive API calls on cart add/remove/quantity update
- **Issue:** The cart API was being called on every single add, remove, or quantity change action (e.g., every click of plus/minus or remove), resulting in multiple consecutive API calls and unnecessary network traffic.
- **Resolution:** Implemented debounce logic for cart quantity updates and actions. Now, the API call is only sent after the user stops interacting (adding, removing, or changing quantity) for a short delay, reducing redundant requests and improving performance.

### 6. Redundant 'items' field in cart API response
- **Issue:** The cart API response included the 'items' array both as a top-level field and inside the 'data' cart object, causing unnecessary duplication.
- **Resolution:** Removed the redundant 'data' field from the cart API response. Now, only 'items' and 'total' are returned, making the response cleaner and more efficient for frontend consumption.

