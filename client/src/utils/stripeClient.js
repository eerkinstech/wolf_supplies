import { loadStripe } from '@stripe/stripe-js';

let stripePromise = null;

export const getStripe = () => {
  if (stripePromise) return stripePromise;
  const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!pk) {
    stripePromise = Promise.resolve(null);
    return stripePromise;
  }
  stripePromise = loadStripe(pk);
  return stripePromise;
};

export default getStripe;
