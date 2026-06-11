import React, { useState } from 'react'
import { GripVertical, Trash2, Edit2, Plus } from 'lucide-react'

// Reusable Kanban Board Component
// Props:
// - columns: Array of column objects {id, title, color, cards: [...]}
// - onCardClick: Callback when card is clicked
// - onCardDelete: Callback when card delete is clicked
// - onAddCard: Callback for add new card button
// - onDragEnd: Callback for drag and drop (optional)

export default function KanbanBoard({
  columns = [],
  onCardClick = () => {},
  onCardDelete = () => {},
  onAddCard = () => {},
  onDragEnd = () => {},
  cardContentRenderer = null // Custom renderer for card content
}) {
  const [draggedCard, setDraggedCard] = useState(null)
  const [sourceColumn, setSourceColumn] = useState(null)

  const handleDragStart = (e, card, columnId) => {
    setDraggedCard(card)
    setSourceColumn(columnId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault()
    if (draggedCard && sourceColumn !== targetColumnId) {
      onDragEnd({
        card: draggedCard,
        sourceColumn,
        targetColumn: targetColumnId
      })
    }
    setDraggedCard(null)
    setSourceColumn(null)
  }

  const getColumnColor = (color) => {
    const colorMap = {
      green: 'bg-green-50 border-green-200',
      yellow: 'bg-yellow-50 border-yellow-200',
      red: 'bg-red-50 border-red-200',
      blue: 'bg-blue-50 border-blue-200',
      purple: 'bg-purple-50 border-purple-200',
      gray: 'bg-gray-50 border-gray-200',
      default: 'bg-gray-50 border-gray-200'
    }
    return colorMap[color] || colorMap.default
  }

  const getCardBgColor = (status) => {
    const statusMap = {
      green: 'bg-green-100 border-green-300',
      yellow: 'bg-yellow-100 border-yellow-300',
      red: 'bg-red-100 border-red-300',
      blue: 'bg-blue-100 border-blue-300',
      ontrack: 'bg-green-100',
      atrisk: 'bg-yellow-100',
      blocked: 'bg-red-100',
      completed: 'bg-green-100'
    }
    return statusMap[status] || 'bg-white border'
  }

  return (
    <div className="w-full h-full overflow-x-auto pb-2">
      <div className="flex gap-4 md:gap-6 min-w-max p-4 md:p-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`flex flex-col w-72 md:w-80 rounded-lg border-2 ${getColumnColor(column.color)} shadow-sm flex-shrink-0`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="p-3 md:p-4 border-b bg-white dark:bg-gray-800 rounded-t-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 text-sm md:text-base">
                  {column.icon && <span>{column.icon}</span>}
                  {column.title}
                </h3>
                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                  {column.cards?.length || 0}
                </span>
              </div>
              {column.subtitle && (
                <p className="text-xs text-gray-600 dark:text-gray-400">{column.subtitle}</p>
              )}
            </div>

            {/* Cards Container */}
            <div className="flex-1 p-2 md:p-3 space-y-2 md:space-y-3 overflow-y-auto min-h-[200px] md:min-h-96">
              {column.cards && column.cards.length > 0 ? (
                column.cards.map((card) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card, column.id)}
                    onClick={() => onCardClick(card)}
                    className={`${getCardBgColor(card.status)} p-2 md:p-3 rounded-md border-2 cursor-move hover:shadow-md transition-shadow group`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        {cardContentRenderer ? (
                          cardContentRenderer(card)
                        ) : (
                          <>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">{card.title}</h4>
                                {card.subtitle && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{card.subtitle}</p>
                                )}
                              </div>
                              <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100" />
                            </div>

                            {card.details && (
                              <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300 mb-2">
                                {card.details.map((detail, idx) => (
                                  <p key={idx}>{detail}</p>
                                ))}
                              </div>
                            )}

                            {card.tags && card.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {card.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onCardDelete(card.id, column.id)
                          }}
                          className="text-[10px] uppercase tracking-wider font-bold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800 px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 md:py-12 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No cards yet</p>
                </div>
              )}
            </div>

            {/* Add Card Button */}
            <div className="p-2 md:p-3 border-t bg-white dark:bg-gray-800 rounded-b-md">
              <button
                onClick={() => onAddCard(column.id)}
                className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add {column.title}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
