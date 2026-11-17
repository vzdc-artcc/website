'use client';
import React, {useState} from 'react';
import {Box, Button, IconButton, List, ListItem, ListItemText, Typography} from '@mui/material';
import {ArrowDownward, ArrowUpward} from '@mui/icons-material';
import {toast} from "react-toastify";

export type OrderItem = {
    id: string,
    name: string,
    order: number,
};

export default function OrderList({items, onSubmit}: {
    items: OrderItem[],
    onSubmit: (items: OrderItem[]) => Promise<unknown>,
}) {
    const [submitting, setSubmitting] = useState(false);
    const [orderedItems, setOrderedItems] = useState<OrderItem[]>([...items].sort((a, b) => a.order - b.order));

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newItems = [...orderedItems];
        const [removed] = newItems.splice(index, 1);
        newItems.splice(direction === 'up' ? index - 1 : index + 1, 0, removed);
        setOrderedItems(newItems.map((item, idx) => ({...item, order: idx + 1})));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await onSubmit(orderedItems);
        } catch {
            toast.error("Failed to save the new order.");
            return;
        } finally {
            setSubmitting(false);
        }
        toast.success("Order updated successfully!");
    };

    if (items.length === 0) {
        return <Typography>No items found.</Typography>;
    }

    return (
        <Box>
            <List>
                {orderedItems.map((item, index) => (
                    <ListItem key={item.id}>
                        <ListItemText primary={item.name}/>
                        <IconButton
                            onClick={() => moveItem(index, 'up')}
                            disabled={index === 0}
                        >
                            <ArrowUpward/>
                        </IconButton>
                        <IconButton
                            onClick={() => moveItem(index, 'down')}
                            disabled={index === orderedItems.length - 1}
                        >
                            <ArrowDownward/>
                        </IconButton>
                    </ListItem>
                ))}
            </List>
            <Button variant="contained" color="primary" onClick={handleSubmit} disabled={submitting}>
                Submit Order
            </Button>
        </Box>
    );
}