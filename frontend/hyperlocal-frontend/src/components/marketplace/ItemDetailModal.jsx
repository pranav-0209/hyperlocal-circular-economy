import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { requestItem } from '../../services/marketplaceService';

const ItemDetailModal = ({ item, open, onOpenChange }) => {
    const [message, setMessage] = useState("Hi, is this still available?");
    const [isRequesting, setIsRequesting] = useState(false);

    if (!item) return null;

    const handleRequest = async () => {
        setIsRequesting(true);
        try {
            await requestItem(item.id, message);
            toast.success('Request sent successfully!');
            onOpenChange(false);
        } catch {
            toast.error('Failed to send request');
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl overflow-hidden">
                {/* Header Image */}
                <div className="relative h-64 bg-gray-100">
                    <img
                        src={item.images?.[0] || item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-charcoal backdrop-blur-md shadow-sm hover:bg-white">
                            {item.category}
                        </Badge>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-charcoal mb-1">{item.title}</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="material-symbols-outlined text-lg">location_on</span>
                                <span>{item.communityName || 'My Community'}</span>
                                <span>•</span>
                                <span>{item.condition}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-primary">
                                {item.price ? `₹${item.price}` : 'Free'}
                                {item.type === 'RENT' && <span className="text-sm font-normal text-gray-500">/day</span>}
                            </div>
                            <Badge variant="outline" className="mt-1">{item.type}</Badge>
                        </div>
                    </div>

                    <div className="prose prose-sm max-w-none text-gray-600 mb-8">
                        <p>{item.description}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between mb-6 border border-gray-100">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                <AvatarImage src={item.owner?.avatarUrl} />
                                <AvatarFallback>{item.owner?.avatar || 'US'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-charcoal">{item.owner?.name}</p>
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">verified</span>
                                    Verified Neighbor
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">View Profile</Button>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-charcoal">Message to owner</label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                        <Button onClick={handleRequest} disabled={isRequesting} className="w-full">
                            {isRequesting ? 'Sending Request...' : 'Send Request'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ItemDetailModal;
