const NewsletterSubscription = require('../models/NewsletterSubscription');

/**
 * Subscribe to newsletter
 */
const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if already subscribed
    let subscription = await NewsletterSubscription.findOne({ email: email.toLowerCase() });

    if (subscription) {
      // If unsubscribed, resubscribe
      if (subscription.status === 'unsubscribed') {
        subscription.status = 'subscribed';
        subscription.unsubscribedAt = null;
        await subscription.save();
        return res.status(200).json({
          success: true,
          message: 'Welcome back! You have been resubscribed to our newsletter',
          data: subscription
        });
      }
      // If already subscribed
      return res.status(200).json({
        success: true,
        message: 'Email already subscribed',
        data: subscription
      });
    }

    // Create new subscription
    subscription = new NewsletterSubscription({
      email: email.toLowerCase(),
      status: 'subscribed',
      verified: true, // Auto-verify for now (can implement email verification later)
      verifiedAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    await subscription.save();

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: subscription
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message || 'Error subscribing to newsletter'
    });
  }
};

/**
 * Get all newsletter subscriptions (Admin only)
 */
const getNewsletterSubscriptions = async (req, res) => {
  try {
    const { status = 'subscribed', limit = 50, skip = 0 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const subscriptions = await NewsletterSubscription.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await NewsletterSubscription.countDocuments(query);

    res.status(200).json({
      success: true,
      data: subscriptions,
      total,
      count: subscriptions.length
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching newsletter subscriptions'
    });
  }
};

/**
 * Get single newsletter subscription
 */
const getNewsletterSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await NewsletterSubscription.findById(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching subscription'
    });
  }
};

/**
 * Unsubscribe from newsletter
 */
const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const subscription = await NewsletterSubscription.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        status: 'unsubscribed',
        unsubscribedAt: new Date()
      },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in newsletter'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
      data: subscription
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message || 'Error unsubscribing from newsletter'
    });
  }
};

/**
 * Update newsletter subscription status (Admin only)
 */
const updateNewsletterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['subscribed', 'unsubscribed', 'bounced'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status required (subscribed, unsubscribed, bounced)'
      });
    }

    const subscription = await NewsletterSubscription.findByIdAndUpdate(
      id,
      {
        status,
        unsubscribedAt: status === 'unsubscribed' ? new Date() : null
      },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription status updated',
      data: subscription
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message || 'Error updating subscription'
    });
  }
};

/**
 * Delete newsletter subscription (Admin only)
 */
const deleteNewsletterSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await NewsletterSubscription.findByIdAndDelete(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription deleted'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting subscription'
    });
  }
};

/**
 * Get newsletter statistics (Admin only)
 */
const getNewsletterStats = async (req, res) => {
  try {
    const total = await NewsletterSubscription.countDocuments();
    const subscribed = await NewsletterSubscription.countDocuments({ status: 'subscribed' });
    const unsubscribed = await NewsletterSubscription.countDocuments({ status: 'unsubscribed' });
    const bounced = await NewsletterSubscription.countDocuments({ status: 'bounced' });

    res.status(200).json({
      success: true,
      data: {
        total,
        subscribed,
        unsubscribed,
        bounced,
        subscriptionRate: total > 0 ? ((subscribed / total) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching statistics'
    });
  }
};

module.exports = {
  subscribeNewsletter,
  getNewsletterSubscriptions,
  getNewsletterSubscription,
  unsubscribeNewsletter,
  updateNewsletterStatus,
  deleteNewsletterSubscription,
  getNewsletterStats
};

