#!/bin/bash
# Add 'use client' directive to all page files that use React hooks

cd "$(dirname "$0")"

# List of all page files that need 'use client'
pages=(
  "src/pages/HomePage.jsx"
  "src/pages/ProductsPage.jsx"
  "src/pages/ProductDetailPage.jsx"
  "src/pages/CategoriesPage.jsx"
  "src/pages/CategoryDetailPage.jsx"
  "src/pages/CartPage.jsx"
  "src/pages/CheckoutPage.jsx"
  "src/pages/WishlistPage.jsx"
  "src/pages/AdminLoginPage.jsx"
  "src/pages/AboutUsPage.jsx"
  "src/pages/ContactUsPage.jsx"
  "src/pages/OrderDetailPage.jsx"
  "src/pages/OrderLookupPage.jsx"
  "src/pages/PaymentOptionsPage.jsx"
  "src/pages/NotFound404Page.jsx"
  "src/pages/DynamicPage.jsx"
  "src/pages/SitemapPage.jsx"
  "src/pages/LoginPage.jsx"
  "src/pages/RegisterPage.jsx"
  "src/pages/AccountPage.jsx"
  "src/pages/AuthFlipPage.jsx"
  "src/pages/HomePageNew.jsx"
  "src/pages/HomePageElementor.jsx"
  "src/pages/policies/ShippingPage.jsx"
  "src/pages/policies/ReturnsPage.jsx"
  "src/pages/policies/PrivacyPage.jsx"
  "src/pages/policies/TermsPage.jsx"
  "src/pages/policies/FAQPage.jsx"
  "src/pages/admin/AdminDashboardPage.jsx"
  "src/pages/admin/AdminProductsPage.jsx"
  "src/pages/admin/AdminAddProductPage.jsx"
  "src/pages/admin/AdminReviewsPage.jsx"
  "src/pages/admin/AdminCollectionsPage.jsx"
  "src/pages/admin/AdminCategoriesPage.jsx"
  "src/pages/admin/AdminMediaLibraryPage.jsx"
  "src/pages/admin/AdminInventoryPage.jsx"
  "src/pages/admin/AdminRolesPage.jsx"
  "src/pages/admin/AdminPagesSEOPage.jsx"
  "src/pages/admin/AdminCreatePagePage.jsx"
  "src/pages/admin/AdminEditPagePage.jsx"
  "src/pages/admin/AdminOrdersPage.jsx"
  "src/pages/admin/AdminCustomersPage.jsx"
  "src/pages/admin/AdminAnalyticsPage.jsx"
  "src/pages/admin/AdminMenuPage.jsx"
  "src/pages/admin/AdminChatPage.jsx"
  "src/pages/admin/AdminCouponsPage.jsx"
  "src/pages/admin/AdminURLRedirectPage.jsx"
  "src/pages/admin/AdminSlidersPage.jsx"
)

echo "Adding 'use client' directive to page files..."

for page in "${pages[@]}"; do
  if [ -f "$page" ]; then
    # Check if file already starts with 'use client'
    if ! head -1 "$page" | grep -q "'use client'"; then
      # Prepend 'use client'; directive
      sed -i "1s/^/'use client';\n\n/" "$page"
      echo "✓ Updated: $page"
    else
      echo "✓ Already has: $page"
    fi
  else
    echo "✗ Not found: $page"
  fi
done

echo "Done!"
