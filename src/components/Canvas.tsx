import React, { useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Image, Transformer, Line } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Stage as StageType } from 'konva/lib/Stage';
import type { Transformer as TransformerType } from 'konva/lib/shapes/Transformer';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

const CanvasContainer = styled.div<{ theme: any }>`
  flex: 1;
  background-color: ${props => props.theme.surface};
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
`;

interface Block {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  type: 'text' | 'image' | 'block' | 'brush';
  imageUrl?: string;
  color?: string;
  fontSize?: number;
  rotation?: number;
  opacity?: number;
  stroke?: string;
  strokeWidth?: number;
  points?: number[];
}

interface CanvasProps {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  selectedBlock: Block | null;
  setSelectedBlock: React.Dispatch<React.SetStateAction<Block | null>>;
  toolMode: 'select' | 'brush' | 'eraser';
  searchTerm: string;
}

const MIN_SIZE = 50;

const Canvas: React.FC<CanvasProps> = ({
  blocks,
  setBlocks,
  selectedBlock,
  setSelectedBlock,
  toolMode,
  searchTerm,
}) => {
  const { theme } = useTheme();
  const transformerRef = useRef<TransformerType>(null);
  const selectedNodeRef = useRef<any>(null);
  const stageRef = useRef<StageType>(null);
  const isDrawing = useRef(false);
  const currentPointsRef = useRef<number[]>([]);
  const [drawingVersion, setDrawingVersion] = React.useState(0);

  useEffect(() => {
    if (selectedBlock && transformerRef.current && selectedNodeRef.current) {
      const transformer = transformerRef.current;
      const layer = transformer.getLayer();
      if (layer) {
        transformer.nodes([selectedNodeRef.current]);
        layer.batchDraw();
      }
    }
  }, [selectedBlock]);

  const handleDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
    const id = e.target.id();
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === id 
          ? { ...block, x: Math.round(e.target.x()), y: Math.round(e.target.y()) }
          : block
      )
    );
  }, [setBlocks]);

  const handleTransformEnd = useCallback((e: KonvaEventObject<Event>) => {
    const id = e.target.id();
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    setBlocks(prevBlocks => 
      prevBlocks.map(block => {
        if (block.id === id) {
          if (block.type === 'text') {
            const newHeight = Math.max(MIN_SIZE, Math.round(block.height * scaleY));
            const fontSize = Math.max(8, Math.round((block.fontSize || 16) * scaleY));
            node.scaleX(1);
            node.scaleY(1);
            return {
              ...block,
              x: node.x(),
              y: node.y(),
              width: Math.max(MIN_SIZE, Math.round(block.width * scaleX)),
              height: newHeight,
              fontSize,
            };
          }
          const newBlock = {
            ...block,
            x: node.x(),
            y: node.y(),
            width: Math.max(MIN_SIZE, Math.round(block.width * scaleX)),
            height: Math.max(MIN_SIZE, Math.round(block.height * scaleY)),
          };
          node.scaleX(1);
          node.scaleY(1);
          return newBlock;
        }
        return block;
      })
    );
  }, [setBlocks]);

  const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedBlock(null);
    }
  }, [setSelectedBlock]);

  const handleResize = useCallback(() => {
    if (stageRef.current) {
      stageRef.current.width(window.innerWidth);
      stageRef.current.height(window.innerHeight);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Função para iniciar desenho
  const handleMouseDown = (e: any) => {
    if (toolMode !== 'brush') return;
    isDrawing.current = true;
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    if (pointerPosition) {
      currentPointsRef.current = [pointerPosition.x, pointerPosition.y];
      setDrawingVersion(v => v + 1);
    }
  };

  // Função para desenhar
  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || toolMode !== 'brush') return;
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    if (pointerPosition) {
      currentPointsRef.current = [...currentPointsRef.current, pointerPosition.x, pointerPosition.y];
      setDrawingVersion(v => v + 1);
    }
  };

  // Função para finalizar desenho
  const handleMouseUp = (e: any) => {
    if (!isDrawing.current || toolMode !== 'brush') return;
    isDrawing.current = false;
    if (currentPointsRef.current.length > 4) {
      const newBrush: Block = {
        id: Date.now().toString(),
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        type: 'brush',
        points: currentPointsRef.current,
        stroke: '#000000', // Pode usar cor padrão ou do tema
        strokeWidth: 3,
      };
      setBlocks(prev => [...prev, newBrush]);
    }
    currentPointsRef.current = [];
    setDrawingVersion(v => v + 1);
  };

  // Função para apagar traços (brush)
  const handleEraser = (e: any) => {
    if (toolMode !== 'eraser') return;
    if (!e.evt || e.evt.buttons !== 1) return;
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;
    // Verifica se algum brush está próximo do ponteiro
    const ERASER_RADIUS = 16;
    const isNear = (points: number[]) => {
      for (let i = 0; i < points.length; i += 2) {
        const dx = points[i] - pointerPosition.x;
        const dy = points[i + 1] - pointerPosition.y;
        if (Math.sqrt(dx * dx + dy * dy) < ERASER_RADIUS) return true;
      }
      return false;
    };
    const newBlocks = blocks.filter(block => {
      if (block.type !== 'brush') return true;
      if (block.points && isNear(block.points)) return false;
      return true;
    });
    if (newBlocks.length !== blocks.length) {
      setBlocks(newBlocks);
    }
  };

  const renderBlock = useCallback((block: Block) => {
    const isSelected = selectedBlock?.id === block.id;
    // Lógica de destaque de busca
    const lowerSearchTerm = searchTerm.toLowerCase();
    const isMatch = searchTerm.length > 0 && 
                    ((block.type === 'text' && block.text?.toLowerCase().includes(lowerSearchTerm)) ||
                     (block.type !== 'text' && block.id.toLowerCase().includes(lowerSearchTerm))); // Exemplo: busca por ID para outros tipos

    const commonProps = {
      key: block.id,
      id: block.id,
      x: block.x,
      y: block.y,
      draggable: toolMode === 'select', // Só arrastar no modo seleção
      onDragEnd: toolMode === 'select' ? handleDragEnd : undefined, // Aplicar onDragEnd APENAS no modo seleção
      onClick: () => toolMode === 'select' && setSelectedBlock(block),
      onTransformEnd: handleTransformEnd,
      cornerRadius: 8,
      shadowColor: isSelected ? theme.primary : (isMatch ? theme.secondary : 'transparent'),
      shadowBlur: isSelected ? 10 : (isMatch ? 8 : 0),
      shadowOpacity: isSelected ? 0.5 : (isMatch ? 0.4 : 0),
      shadowOffset: { x: 0, y: 0 },
      ref: isSelected ? selectedNodeRef : undefined,
      opacity: isMatch && searchTerm.length > 0 ? 1 : (searchTerm.length > 0 ? 0.4 : (block.opacity ?? 1)), // Destaca ou esmaece
      rotation: block.rotation ?? 0,
      stroke: block.stroke,
      strokeWidth: block.strokeWidth,
    };

    switch (block.type) {
      case 'text':
        return (
          <Text
            {...commonProps}
            fill={block.color || theme.text}
            text={block.text || ''}
            fontSize={block.fontSize || 16}
            padding={8}
            background={isSelected ? theme.secondary : 'transparent'}
          />
        );
      case 'image':
        return block.imageUrl ? (
          <Image
            {...{ ...commonProps, fill: undefined }}
            width={block.width}
            height={block.height}
            image={(() => { const img = new window.Image(); img.src = block.imageUrl!; return img; })()}
          />
        ) : null;
      default:
        return (
          <Rect
            {...commonProps}
            width={block.width}
            height={block.height}
            fill={isSelected ? theme.secondary : theme.surface}
            stroke={isSelected ? theme.primary : theme.border}
            strokeWidth={isSelected ? 2 : 1}
          />
        );
    }
  }, [selectedBlock, theme, handleDragEnd, handleTransformEnd, setSelectedBlock, toolMode, searchTerm]);

  return (
    <CanvasContainer theme={theme} key={drawingVersion}>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onClick={toolMode === 'select' ? handleStageClick : undefined}
        onMouseDown={toolMode === 'brush' ? handleMouseDown : toolMode === 'eraser' ? handleEraser : undefined}
        onMousemove={toolMode === 'brush' ? handleMouseMove : toolMode === 'eraser' ? handleEraser : undefined}
        onMouseup={toolMode === 'brush' ? handleMouseUp : undefined}
      >
        <Layer>
          {blocks.map(renderBlock)}
          {/* Linha sendo desenhada */}
          {toolMode === 'brush' && currentPointsRef.current.length > 0 && (
            <Line
              points={currentPointsRef.current}
              stroke={theme.primary}
              strokeWidth={3}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation="source-over"
            />
          )}
          {selectedBlock && toolMode === 'select' && (
            <Transformer
              ref={transformerRef as React.RefObject<TransformerType>}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < MIN_SIZE || newBox.height < MIN_SIZE) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
    </CanvasContainer>
  );
};

export default Canvas; 