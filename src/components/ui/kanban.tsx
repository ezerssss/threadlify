'use client';

import * as React from 'react';
import { cn, formatISODate } from '@/lib/utils';
import {
  defaultDropAnimation,
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from '@dnd-kit/core';
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Slot } from '@radix-ui/react-slot';
import { PostType } from '@/types/posts';

interface KanbanContextProps<T> {
  columns: Record<string, T[]>;
  setColumns: (columns: Record<string, T[]>) => void;
  getItemId: (item: T) => string;
  columnIds: string[];
  activeId: UniqueIdentifier | null;
  setActiveId: (id: UniqueIdentifier | null) => void;
  findContainer: (id: UniqueIdentifier) => string | undefined;
  isColumn: (id: UniqueIdentifier) => boolean;
}

const KanbanContext = React.createContext<KanbanContextProps<any>>({
  columns: {},
  setColumns: () => {},
  getItemId: () => '',
  columnIds: [],
  activeId: null,
  setActiveId: () => {},
  findContainer: () => undefined,
  isColumn: () => false,
});

const ColumnContext = React.createContext<{
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners | undefined;
  isDragging?: boolean;
  disabled?: boolean;
}>({
  attributes: {} as DraggableAttributes,
  listeners: undefined,
  isDragging: false,
  disabled: false,
});

const ItemContext = React.createContext<{
  listeners: DraggableSyntheticListeners | undefined;
  isDragging?: boolean;
  disabled?: boolean;
}>({
  listeners: undefined,
  isDragging: false,
  disabled: false,
});

const dropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
};

export interface KanbanMoveEvent {
  event: DragEndEvent;
  activeContainer: string;
  activeIndex: number;
  overContainer: string;
  overIndex: number;
}

export interface KanbanRootProps<T> {
  value: Record<string, T[]>;
  onValueChange: React.Dispatch<React.SetStateAction<Record<string, T[]>>>;
  getItemValue: (item: T) => string;
  children: React.ReactNode;
  className?: string;
  onMove?: (event: KanbanMoveEvent) => void;
}

function Kanban<T>({ value, onValueChange, getItemValue, children, className, onMove }: KanbanRootProps<T>) {
  const columns = value;
  const setColumns = onValueChange;
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const [projected, setProjected] = React.useState<{
    container: string | null;
    index: number | null;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columnIds = React.useMemo(() => Object.keys(columns), [columns]);

  const isColumn = React.useCallback((id: UniqueIdentifier) => columnIds.includes(id as string), [columnIds]);

  const findContainer = React.useCallback(
    (id: UniqueIdentifier) => {
      if (isColumn(id)) return id as string;
      return columnIds.find((key) => columns[key].some((item) => getItemValue(item) === id));
    },
    [columns, columnIds, getItemValue, isColumn],
  );

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setProjected(null);

      if (!over) return;

      if (onMove && !isColumn(active.id)) {
        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(over.id);

        if (activeContainer && overContainer) {
          const overItems = columns[overContainer];
          const activeIndex = columns[activeContainer].findIndex((item: T) => getItemValue(item) === active.id);
          let overIndex = columns[overContainer].findIndex((item: T) => getItemValue(item) === over.id);

          if (isColumn(over.id)) {
            if (activeContainer === overContainer) {
              overIndex = activeIndex;
            } else {
              if (overItems.length < 1) {
                overIndex = 0;
              } else {
                const firstEl = document.querySelector<HTMLElement>(
                  `[data-slot="kanban-item"][data-value="${getItemValue(overItems[0])}"]`
                );
                const lastEl = document.querySelector<HTMLElement>(
                  `[data-slot="kanban-item"][data-value="${getItemValue(overItems[overItems.length - 1])}"]`
                );

                if (!firstEl || !lastEl) {
                  overIndex = overItems.length;
                } else {
                  const rectTop = active.rect.current.translated?.top ?? 0;
                  const pointerY = event.delta.y + rectTop; // approximate pointer position
                  if (pointerY < firstEl.getBoundingClientRect().top) {
                    overIndex = 0;
                  } else if (pointerY > lastEl.getBoundingClientRect().bottom) {
                    overIndex = overItems.length;
                  } 
                }
              }
            }
          }

          onMove({
            event,
            activeContainer,
            activeIndex,
            overContainer,
            overIndex,
          });
        }
      }
    },
    [columnIds, columns, findContainer, getItemValue, isColumn, setColumns, onMove, setProjected],
  );

  const contextValue = React.useMemo(
    () => ({
      columns,
      setColumns,
      getItemId: getItemValue,
      columnIds,
      activeId,
      projected,
      setActiveId,
      findContainer,
      isColumn,
    }),
    [columns, setColumns, getItemValue, columnIds, activeId, findContainer, isColumn, projected],
  );

  return (
    <KanbanContext.Provider value={contextValue}>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div data-slot="kanban" data-dragging={activeId !== null} className={cn(className)}>
          {children}
        </div>
      </DndContext>
    </KanbanContext.Provider>
  );
}

export interface KanbanBoardProps {
  className?: string;
  children: React.ReactNode;
}

function KanbanBoard({ children, className }: KanbanBoardProps) {
  const { columnIds } = React.useContext(KanbanContext);

  return (
    <SortableContext items={columnIds} strategy={rectSortingStrategy}>
      <div data-slot="kanban-board" className={cn('grid auto-rows-fr sm:grid-cols-3 gap-4', className)}>
        {children}
      </div>
    </SortableContext>
  );
}

export interface KanbanColumnProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function KanbanColumn({ value, className, children, disabled }: KanbanColumnProps) {
  const {
    setNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging: isSortableDragging,
  } = useSortable({
    id: value,
    disabled,
  });

  const { activeId, isColumn } = React.useContext(KanbanContext);
  const isColumnDragging = activeId ? isColumn(activeId) : false;

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  } as React.CSSProperties;

  return (
    <ColumnContext.Provider value={{ attributes, listeners, isDragging: isColumnDragging, disabled }}>
      <div
        data-slot="kanban-column"
        data-value={value}
        data-dragging={isSortableDragging}
        data-disabled={disabled}
        ref={setNodeRef}
        style={style}
        className={cn(
          'group/kanban-column flex flex-col',
          isSortableDragging && 'opacity-50',
          disabled && 'opacity-50',
          className,
        )}
      >
        {children}
      </div>
    </ColumnContext.Provider>
  );
}

export interface KanbanColumnHandleProps {
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
  cursor?: boolean;
}

function KanbanColumnHandle({ asChild, className, children, cursor = true }: KanbanColumnHandleProps) {
  const { attributes, listeners, isDragging, disabled } = React.useContext(ColumnContext);

  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="kanban-column-handle"
      data-dragging={isDragging}
      data-disabled={disabled}
      {...attributes}
      {...listeners}
      className={cn(
        'opacity-0 transition-opacity group-hover/kanban-column:opacity-100',
        cursor && (isDragging ? '!cursor-grabbing' : '!cursor-grab'),
        className,
      )}
    >
      {children}
    </Comp>
  );
}

export interface KanbanItemProps {
  value: string;
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function KanbanItem({ value, asChild = false, className, children, disabled }: KanbanItemProps) {
  const {
    setNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging: isSortableDragging,
  } = useSortable({
    id: value,
    disabled,
  });

  const { activeId, isColumn } = React.useContext(KanbanContext);
  const isItemDragging = activeId ? !isColumn(activeId) : false;

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  } as React.CSSProperties;

  const Comp = asChild ? Slot : 'div';

  return (
    <ItemContext.Provider value={{ listeners, isDragging: isItemDragging, disabled }}>
      <Comp
        data-slot="kanban-item"
        data-value={value}
        data-dragging={isSortableDragging}
        data-disabled={disabled}
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn(isSortableDragging && 'opacity-50', disabled && 'opacity-50', className)}
      >
        {children}
      </Comp>
    </ItemContext.Provider>
  );
}

export interface KanbanItemHandleProps {
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
  cursor?: boolean;
}

function KanbanItemHandle({ asChild, className, children, cursor = true }: KanbanItemHandleProps) {
  const { listeners, isDragging, disabled } = React.useContext(ItemContext);

  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="kanban-item-handle"
      data-dragging={isDragging}
      data-disabled={disabled}
      {...listeners}
      className={cn(cursor && (isDragging ? '!cursor-grabbing' : '!cursor-grab'), className)}
    >
      {children}
    </Comp>
  );
}

interface PlaceholderProps {
  post: PostType
}

export function Placeholder() {
  const { activeId, isColumn } = React.useContext(KanbanContext);
  const [dimensions, setDimensions] = React.useState<{ width: number; height: number } | null>(null);

  React.useEffect(() => {
    if (activeId) {
      const element = document.querySelector(
        `[data-slot="kanban-${isColumn(activeId) ? 'column' : 'item'}"][data-value="${activeId}"]`,
      );
      if (element) {
        const rect = element.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    } else {
      setDimensions(null);
    }
  }, [activeId]);

  const style = {
    height: dimensions?.height,
  } as React.CSSProperties;

  return <div
        style={style}
        className="bg-card touch-none rounded-md border p-3 shadow-xs pointer-events-none cursor-grabbing"
      />

  // const notHighPriorityBadgeColor = post.priority === "medium" ? "default" : "secondary";
  // const badgeColor = post.priority === "high" ? "destructive" : notHighPriorityBadgeColor;

  // return <div className="bg-card touch-none rounded-md border p-3 shadow-xs pointer-events-none opacity-50">
  //     <div className="flex flex-col gap-2.5">
  //       <div className="flex items-center justify-between gap-2">
  //         <span className="line-clamp-2 text-sm font-medium">{post.title}</span>
  //         <Badge
  //           variant={badgeColor}
  //           className="pointer-events-none h-5 shrink-0 rounded-sm px-1.5 text-[11px] capitalize"
  //         >
  //           {post.priority}
  //         </Badge>
  //       </div>
  //       <div className="text-muted-foreground flex items-center justify-between text-xs">
  //         <div className="flex items-center gap-1">
  //           <SimpleIcon icon={siReddit} className="size-4" />
  //           <span className="line-clamp-1">{post.author}</span>
  //         </div>
  //         {post.postCreatedAt && (
  //           <time className="text-[10px] whitespace-nowrap">{formatISODate(post.postCreatedAt)}</time>
  //         )}
  //       </div>
  //     </div>
  //   </div>
}

export interface KanbanColumnContentProps {
  value: string;
  className?: string;
  children: React.ReactNode[];
}

function KanbanColumnContent({ value, className, children }: KanbanColumnContentProps) {
  const { columns, getItemId } = React.useContext(KanbanContext);

  const itemIds = React.useMemo(() => columns[value].map(getItemId), [columns, getItemId, value]);

  return (
    <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
      <div data-slot="kanban-column-content" className={cn('flex flex-col gap-2', className)}>
        {children}
      </div>
    </SortableContext>
  );
}

export interface KanbanOverlayProps {
  className?: string;
  children?: React.ReactNode | ((params: { value: UniqueIdentifier; variant: 'column' | 'item' }) => React.ReactNode);
}

function KanbanOverlay({ children, className }: KanbanOverlayProps) {
  const { activeId, isColumn } = React.useContext(KanbanContext);
  const [dimensions, setDimensions] = React.useState<{ width: number; height: number } | null>(null);

  React.useEffect(() => {
    if (activeId) {
      const element = document.querySelector(
        `[data-slot="kanban-${isColumn(activeId) ? 'column' : 'item'}"][data-value="${activeId}"]`,
      );
      if (element) {
        const rect = element.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    } else {
      setDimensions(null);
    }
  }, [activeId]);

  const style = {
    width: dimensions?.width,
    height: dimensions?.height,
  } as React.CSSProperties;

  const content = React.useMemo(() => {
    if (!activeId) return null;
    if (typeof children === 'function') {
      return children({
        value: activeId,
        variant: isColumn(activeId) ? 'column' : 'item',
      });
    }
    return children;
  }, [activeId, children, isColumn]);

  return (
    <DragOverlay dropAnimation={dropAnimationConfig}>
      <div
        data-slot="kanban-overlay"
        data-dragging={true}
        style={style}
        className={cn('pointer-events-none', className, activeId ? '!cursor-grabbing' : '')}
      >
        {content}
      </div>
    </DragOverlay>
  );
}

export {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanColumnContent,
  KanbanOverlay,
};
