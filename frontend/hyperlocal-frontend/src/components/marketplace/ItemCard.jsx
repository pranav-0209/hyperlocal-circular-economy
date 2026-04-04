import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '../../context/AuthContext';
import useSecureImageSource from '../../hooks/useSecureImageSource';
import RatingStars from '../ui/RatingStars';

const ItemCard = ({ item, onRequest }) => {
    const { user } = useAuth();
    const isFree = item.type === 'GIFT';
    const rawImageSrc = item.images?.[0] ?? item.thumbnailUrl ?? null;
    const { resolvedSource: resolvedImageSrc, isLoading: isResolvingImage } = useSecureImageSource(rawImageSrc);
    const { resolvedSource: resolvedOwnerAvatar } = useSecureImageSource(item.owner?.avatarUrl);
    const [failedImageSource, setFailedImageSource] = useState(null);
    const hasImage = Boolean(resolvedImageSrc) && failedImageSource !== resolvedImageSrc;
    const currentUserId = user?.id ?? user?.userId;
    const ownerId = item?.owner?.userId ?? item?.owner?.id;
    const isOwner = currentUserId != null && ownerId != null && String(currentUserId) === String(ownerId);
    const isFullyBooked = Boolean(item?.isFullyBooked);
    const canBorrow = !isOwner && !isFullyBooked;
    const listingAverage = Number(item?.averageRating ?? item?.rating ?? 0);
    const listingTotal = Number(item?.totalReviews ?? 0);

    const getTypeColor = (type) => {
        switch (type) {
            case 'GIFT': return 'bg-green-100 text-green-800 hover:bg-green-200';
            case 'RENT': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
            case 'SALE': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onRequest(item)}
            onKeyDown={(e) => e.key === 'Enter' && onRequest(item)}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full cursor-pointer"
        >
            {/* Image Container */}
            <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
                {isResolvingImage && (
                    <div className="absolute inset-0 z-10 bg-gray-100/80 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-400 animate-spin">progress_activity</span>
                    </div>
                )}
                {hasImage ? (
                    <img
                        src={resolvedImageSrc}
                        alt={item.title}
                        onError={() => setFailedImageSource(resolvedImageSrc)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="material-symbols-outlined text-5xl">image</span>
                    </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className={`${getTypeColor(item.type)} font-bold border-0 shadow-sm`}>
                        {item.type}
                    </Badge>
                </div>

                {isFullyBooked && (
                    <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-rose-200 bg-rose-50 text-rose-700">
                            <span className="material-symbols-outlined text-sm">event_busy</span>
                            Fully Booked
                        </span>
                    </div>
                )}

                {/* Price Tag */}
                <div className="absolute bottom-3 right-3">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm text-charcoal">
                        {isFree ? 'Free' : `₹${item.price}${item.type === 'RENT' ? '/day' : ''}`}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <div className="mb-1 flex justify-between items-start">
                    <h3 className="font-bold text-lg text-charcoal line-clamp-1 group-hover:text-primary transition-colors">
                        {item.title}
                    </h3>
                </div>

                <p className="text-muted-green text-sm line-clamp-2 mb-4 flex-1">
                    {item.description}
                </p>

                <div className="mb-3">
                    {listingTotal > 0 ? (
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100">
                            <span className="text-[11px] font-bold text-amber-800">{listingAverage.toFixed(1)}</span>
                            <RatingStars rating={listingAverage} size={14} />
                            <span className="text-[11px] text-amber-700">{listingTotal} review{listingTotal === 1 ? '' : 's'}</span>
                        </div>
                    ) : (
                        <span className="text-[11px] text-muted-green bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full inline-flex">New listing</span>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    {/* Owner Info */}
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border border-gray-200">
                            <AvatarImage src={resolvedOwnerAvatar ?? undefined} />
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                {item.owner?.avatar || item.owner?.name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-charcoal">{item.owner?.name}</span>
                            <span className="text-[10px] text-muted-green">{isOwner ? 'Your listing' : item.condition}</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <Button
                        size="sm"
                        disabled={!isOwner && !canBorrow}
                        className={`rounded-full px-4 h-8 shadow-none ${
                            isOwner
                                ? 'bg-primary/10 hover:bg-primary/15 text-primary'
                                : canBorrow
                                    ? 'bg-black hover:bg-gray-800 text-white'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={(event) => {
                            event.stopPropagation();
                            if (!isOwner && !canBorrow) return;
                            onRequest(item);
                        }}
                    >
                        {isOwner ? 'Manage' : (canBorrow ? 'Request' : 'Fully Booked')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ItemCard;
