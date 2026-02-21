import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ItemCard = ({ item, onRequest }) => {
    const isFree = item.type === 'GIFT';

    const getTypeColor = (type) => {
        switch (type) {
            case 'GIFT': return 'bg-green-100 text-green-800 hover:bg-green-200';
            case 'RENT': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
            case 'SALE': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                {item.images && item.images.length > 0 ? (
                    <img
                        src={item.images[0]}
                        alt={item.title}
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

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    {/* Owner Info */}
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border border-gray-200">
                            <AvatarImage src={item.owner?.avatarUrl} />
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                {item.owner?.avatar || item.owner?.name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-charcoal">{item.owner?.name}</span>
                            <span className="text-[10px] text-muted-green">{item.condition}</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <Button
                        size="sm"
                        className="rounded-full px-4 h-8 bg-black hover:bg-gray-800 text-white shadow-none"
                        onClick={() => onRequest(item)}
                    >
                        Request
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ItemCard;
