import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ItemCard from './ItemCard';
import { Button } from "@/components/ui/button";

// Defined outside component to prevent recreation on each render
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const MarketplaceGrid = ({ items, isLoading, onRequest, onCreate }) => {
    const shouldReduceMotion = useReducedMotion();
    // Loading State
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 h-[350px] animate-pulse">
                        <div className="bg-gray-200 h-48 rounded-xl mb-4" />
                        <div className="bg-gray-200 h-6 w-3/4 rounded mb-2" />
                        <div className="bg-gray-200 h-4 w-1/2 rounded mb-4" />
                        <div className="flex justify-between mt-auto pt-4">
                            <div className="bg-gray-200 h-8 w-8 rounded-full" />
                            <div className="bg-gray-200 h-8 w-20 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Empty State
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl text-gray-400">inventory_2</span>
                </div>
                <h3 className="text-xl font-bold text-charcoal mb-2">No items found</h3>
                <p className="text-muted-green mb-6 max-w-md mx-auto">
                    There are no items listed here yet. Be the first to share something with your community!
                </p>
                <Button onClick={onCreate} className="shadow-lg">
                    <span className="material-symbols-outlined mr-2">add_circle</span>
                    List an Item
                </Button>
            </div>
        );
    }

    // Grid
    return (
        <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial={shouldReduceMotion ? false : 'hidden'}
            animate="show"
        >
            {items.map((item) => (
                <motion.div
                    key={item.id}
                    variants={itemVariants}
                >
                    <ItemCard item={item} onRequest={onRequest} />
                </motion.div>
            ))}
        </motion.div>
    );
};

export default MarketplaceGrid;
