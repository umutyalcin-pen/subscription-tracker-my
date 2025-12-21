import React from 'react';
import { useSubscriptions } from '../context/SubscriptionContext';
import SubscriptionCard from './SubscriptionCard';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sürüklenebilir kart wrapper'ı
const SortableCard = ({ sub, total }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: sub.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <SubscriptionCard sub={sub} total={total} />
        </div>
    );
};

const Treemap = () => {
    const { subscriptions, totalMonthly, reorderSubscriptions } = useSubscriptions();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px hareket edildikten sonra sürükleme başlar
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = subscriptions.findIndex((s) => s.id === active.id);
            const newIndex = subscriptions.findIndex((s) => s.id === over.id);
            const newOrder = arrayMove(subscriptions, oldIndex, newIndex);
            reorderSubscriptions(newOrder);
        }
    };

    return (
        <div className="treemap-container glass-panel" id="treemap-export">
            {subscriptions.length === 0 ? (
                <div className="empty-state">
                    <p>Henüz abonelik eklenmedi.</p>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={subscriptions.map(s => s.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="treemap-grid">
                            {subscriptions.map(sub => (
                                <SortableCard key={sub.id} sub={sub} total={totalMonthly} />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
};

export default Treemap;
