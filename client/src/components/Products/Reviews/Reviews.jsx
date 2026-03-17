'use client';

import React, { useState } from 'react';

import toast from 'react-hot-toast';

const Reviews = ({
  product,
  token,
  user,
  onSubmitReview,
  requireReviewApproval,
  API,
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [showThanks, setShowThanks] = useState(false);
  const [reviewHover, setReviewHover] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to render star icons for fractional ratings
  const renderStars = (rating = 0, sizeClass = 'text-lg') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<i key={i} className={`fas fa-star ${sizeClass} text-yellow-400`}></i>);
      } else if (rating >= i - 0.5) {
        stars.push(<i key={i} className={`fas fa-star-half-alt ${sizeClass} text-yellow-400`}></i>);
      } else {
        stars.push(<i key={i} className={`far fa-star ${sizeClass} text-yellow-400`}></i>);
      }
    }
    return stars;
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    // Validate form fields
    if (!reviewEmail || !reviewEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!reviewComment || !reviewComment.trim()) {
      toast.error('Review comment is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call parent's submit handler with guest review data
      await onSubmitReview({
        rating: reviewRating,
        comment: reviewComment,
        name: reviewName || 'Anonymous',
        email: reviewEmail,
      });

      // Reset form on success
      setShowReviewForm(false);
      setReviewRating(5);
      setReviewComment('');
      setReviewName('');
      setReviewEmail('');
      setShowThanks(true);
      setTimeout(() => setShowThanks(false), 3500);
    } catch (err) {
      const errorMsg = err?.message || 'Failed to submit review';

      // Check if it's a duplicate review error - handle multiple message formats
      if (
        errorMsg.includes('already submitted') ||
        errorMsg.includes('Only one review') ||
        errorMsg.includes('already added') ||
        errorMsg.includes('duplicate') ||
        err?.status === 400
      ) {
        toast.error('You have already added a review with this email. Only one review per product per email is allowed.');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get all reviews from product
  const reviewsArr = Array.isArray(product?.reviews) ? product.reviews : [];

  // Always filter to only show approved reviews on product page
  // - When approval is NOT required: reviews auto-approve on submission, so they show immediately
  // - When approval IS required: reviews stay pending until admin approves, then they show
  const filteredReviews = reviewsArr.length > 0
    ? reviewsArr.filter(r => r && r.isApproved === true)
    : [];

  // Sort: newest first
  const sortedReviews = filteredReviews.slice().sort((a, b) => {
    const dateA = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
    const dateB = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
    return dateB - dateA;
  });

  // Determine visible reviews
  const visibleReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 8);
  const totalReviews = filteredReviews.length;
  const hasMoreReviews = totalReviews > 8;

  return (
    <div className="bg-white p-10 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Customer Reviews & Ratings</h2>

      {/* Rating Summary & Breakdown */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Rating Summary */}
        <div className="bg-linear-to-br from-gray-100 to-gray-200 p-8 rounded-xl border-2 border-gray-400 text-center">
          <div className="text-3xl font-bold text-gray-800 mb-4">{product?.rating || 4.6}</div>
          <div className="flex justify-center mb-4 text-3xl">
            {renderStars(product?.rating || 0, 'text-3xl')}
          </div>
          <p className="text-gray-700 font-semibold">
            Based on {totalReviews} verified reviews
          </p>
        </div>

        {/* Rating Breakdown */}
        <div className="col-span-2 space-y-4">
          {(() => {
            const total = filteredReviews.length || 0;
            const counts = [5, 4, 3, 2, 1].map((s) =>
              filteredReviews.filter(r => Math.round(Number(r?.rating || 0)) === s).length
            );
            return [5, 4, 3, 2, 1].map((stars, idx) => {
              const count = counts[idx];
              const percent = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-4">
                  <span className="font-semibold text-gray-700 w-16">{stars} Star</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gray-800 h-full transition-all"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-600 font-semibold w-12">{percent}%</span>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Reviews List and Form */}
      <div className="border-t pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900">Recent Reviews</h3>
          <button
            onClick={() => setShowReviewForm((s) => !s)}
            className="py-2 px-4 text-[10px] sm:text-xl bg-black text-white rounded-lg font-semibold hover:bg-black transition"
          >
            {showReviewForm ? 'Cancel' : 'Write a review'}
          </button>
        </div>

        {/* Thank You Message */}
        {showThanks && (
          <div className="mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-800">
            Thank you — your review has been submitted.
          </div>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700">Your Rating</label>
                <div className="mt-2 flex items-center gap-2" role="radiogroup" aria-label="Your rating">
                  {[1, 2, 3, 4, 5].map((i) => {
                    const filled = i <= (reviewHover || reviewRating);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReviewRating(i)}
                        onMouseEnter={() => setReviewHover(i)}
                        onMouseLeave={() => setReviewHover(0)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setReviewRating(i);
                          }
                        }}
                        aria-checked={reviewRating === i}
                        role="radio"
                        aria-label={`${i} star${i > 1 ? 's' : ''}`}
                        className={`focus:outline-none ${filled ? 'text-yellow-500' : 'text-gray-300'} text-2xl transition cursor-pointer`}
                      >
                        {filled ? <i className="fas fa-star"></i> : <i className="far fa-star"></i>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* User Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700">Your Name (Optional)</label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="Enter your name or leave blank"
                  className="w-full mt-2 p-3 border rounded-lg bg-white text-gray-700 focus:border-gray-400 focus:outline-none"
                />
              </div>

              {/* User Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700">Your Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={reviewEmail}
                  onChange={(e) => setReviewEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full mt-2 p-3 border rounded-lg bg-white text-gray-700 focus:border-gray-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">Your Review</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                placeholder="Share your experience with this product..."
                className="w-full mt-2 p-3 border rounded-lg focus:border-gray-400 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="text-right">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`py-3 px-6 rounded-lg font-semibold transition ${isSubmitting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-black text-white hover:bg-black'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner animate-spin mr-2"></i>
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Reviews Grid */}
        <div className="space-y-6">
          {visibleReviews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleReviews.map((review) => {
                const reviewKey = review?._id ? `review-${review._id}` : `review-${Math.random()}`;
                const userName = review?.name || review?.user?.name || 'Customer';
                const userEmail = review?.user?.email || '';
                const rating = Number(review?.rating || 0);
                const comment = review?.comment || '';
                const isApproved = review?.isApproved === true;
                const reviewDate = new Date(review?.createdAt || review?.updatedAt || Date.now());
                const dateString = reviewDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={reviewKey}
                    className={`p-6 rounded-lg border transition-all hover:shadow-md ${isApproved
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-gray-50 border-gray-200'
                      }`}
                  >
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">{userName}</p>
                        {userEmail && (
                          <p className="text-xs text-gray-900">{userEmail}</p>
                        )}
                        {isApproved && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div className="flex text-gray-800">
                        {renderStars(rating, 'text-xs')}
                      </div>
                    </div>

                    {/* Review Comment */}
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 mb-3">
                      {comment}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 font-semibold mb-2">No reviews yet</p>
              <p className="text-gray-900 text-sm">
                Be the first to share your experience with this product!
              </p>
            </div>
          )}

          {/* Show More / Show Less Button */}
          {hasMoreReviews && (
            <div className="flex justify-center pt-6 border-t">
              <button
                onClick={() => setShowAllReviews((prev) => !prev)}
                className="py-2 px-6 bg-black text-white rounded-lg font-semibold hover:bg-black transition-colors"
              >
                {showAllReviews ? 'Show fewer reviews' : `Show all ${totalReviews} reviews`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
