import Slider from '../Slider/Slider';
import FeaturedProducts from '../Products/FeaturedProducts/FeaturedProducts';
import FeaturedCategories from '../Categories/FeaturedCategories/FeaturedCategories';
import Newsletter from '../Newsletter/Newsletter';
import CustomSection from '../CustomSection/CustomSection';

const BLOCK_REGISTRY = {
    slider: {
        name: 'Slider',
        icon: '🎠',
        component: Slider,
        defaultContent: {
            slides: [
                {
                    id: 1,
                    image: '/uploads/placeholder.png',
                    title: 'Daily Grocery Order and Get Express Delivery',
                    description: 'Fresh products delivered to your doorstep in 30 minutes',
                    backgroundColor: 'from-gray-50 to-gray-100',
                    buttonText: 'Explore Shop',
                    buttonLink: '/products'
                },
                {
                    id: 2,
                    image: '/uploads/placeholder.png',
                    title: 'New Arrivals This Week',
                    description: 'Discover the latest products just added to our collection',
                    backgroundColor: 'from-blue-50 to-cyan-50',
                    buttonText: 'View All',
                    buttonLink: '/products'
                },
                {
                    id: 3,
                    image: '/uploads/placeholder.png',
                    title: 'Limited Time Special Offer',
                    description: 'Get amazing discounts on your favorite items',
                    backgroundColor: 'from-pink-50 to-rose-50',
                    buttonText: 'Shop Sale',
                    buttonLink: '/products'
                }
            ]
        },
        category: 'Featured'
    },

    featuredProducts: {
        name: 'Featured Products',
        icon: '🛍️',
        component: FeaturedProducts,
        defaultContent: {
            title: 'Featured Products',
            limit: 6,
            columns: 3,
            layout: 'grid',
            spacing: 'md',
            imageBorderRadius: 'md',
            titleFontSize: 'lg',
            descFontSize: 'sm'
        },
        category: 'Products'
    },

    featuredCategories: {
        name: 'Featured Categories',
        icon: '📂',
        component: FeaturedCategories,
        defaultContent: {
            title: 'Shop by Category',
            limit: 6,
            columns: 3,
            layout: 'grid',
            spacing: 'md',
            imageBorderRadius: 'md',
            titleFontSize: 'lg',
            descFontSize: 'sm'
        },
        category: 'Categories'
    },

    newsletter: {
        name: 'Newsletter',
        icon: '📧',
        component: Newsletter,
        defaultContent: {
            layout: 'layout1',
            title: 'Subscribe to Our Newsletter',
            subtitle: '',
            description: 'Get the latest updates delivered to your inbox',
            inputPlaceholder: 'Enter your email',
            buttonText: 'Subscribe',
            successTitle: "You're subscribed!",
            successMessage: 'Thanks — check your email for the welcome offer.',
            bgColor: 'var(--color-bg-secondary)',
            accentColor: 'gray-400',
            textColor: 'var(--color-text-primary)',
            padding: 64,
            borderRadius: 16,
            imageColWidth: 35,
            logoImage: '',
            benefits: [
                { id: '1', title: 'No Spam', description: 'Only curated deals' },
                { id: '2', title: 'Early Access', description: 'Subscriber-only previews' },
                { id: '3', title: 'Easy Opt-out', description: 'One click to unsubscribe' }
            ],
            stats: [
                { id: '1', value: '500K+', label: 'Subscribers' },
                { id: '2', value: '50+', label: 'Weekly Deals' },
                { id: '3', value: '30%', label: 'Average Savings' }
            ]
        },
        category: 'Forms'
    },

    customSection: {
        name: 'Custom Section',
        icon: '🎨',
        component: CustomSection,
        defaultContent: {
            title: 'Custom Section',
            gap: 16,
            sectionPadding: 20,
            backgroundColor: 'var(--color-bg-primary)',
            backgroundImage: '',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundOpacity: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            groups: [],
            items: [
                {
                    id: '1',
                    type: 'heading',
                    text: 'Welcome to Our Store',
                    size: 'lg',
                    color: 'var(--color-text-primary)',
                    align: 'left',
                    width: '100%',
                    padding: 8,
                    margin: 0,
                    opacity: 1
                },
                {
                    id: '2',
                    type: 'text',
                    text: 'Discover our amazing collection of products',
                    size: 'md',
                    color: 'var(--color-text-light)',
                    align: 'left',
                    width: '100%',
                    padding: 6,
                    margin: 0,
                    opacity: 1
                },
                {
                    id: '3',
                    type: 'button',
                    text: 'Shop Now',
                    link: '/products',
                    bgColor: 'var(--color-accent-primary)',
                    align: 'left',
                    width: 'auto',
                    padding: 6,
                    margin: 0,
                    opacity: 1
                }
            ]
        },

        category: 'Custom'
    }
};

export const getAvailableBlocks = () => {
    return Object.entries(BLOCK_REGISTRY).map(([key, value]) => ({
        type: key,
        ...value
    }));
};

export const getBlocksByCategory = () => {
    const categories = {};
    Object.entries(BLOCK_REGISTRY).forEach(([key, value]) => {
        const category = value.category || 'Other';
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push({
            type: key,
            ...value
        });
    });
    return categories;
};

export const getBlockComponent = (blockType) => {
    return BLOCK_REGISTRY[blockType]?.component || null;
};

export const getBlockDefaultContent = (blockType) => {
    return BLOCK_REGISTRY[blockType]?.defaultContent || {};
};

export const registerBlock = (blockType, blockConfig) => {
    BLOCK_REGISTRY[blockType] = blockConfig;
};

export default BLOCK_REGISTRY;
