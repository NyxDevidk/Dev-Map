import React, { useState } from 'react';
import styled from 'styled-components';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

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

const DEFAULT_BLOCK_CONFIG = {
  x: 100,
  y: 100,
  color: '#000000',
  opacity: 1,
  stroke: '#000000',
  strokeWidth: 1,
  rotation: 0,
};

const BLOCK_TYPES = {
  block: {
    width: 150,
    height: 100,
    type: 'block' as const,
  },
  text: {
    width: 200,
    height: 40,
    type: 'text' as const,
    text: 'Novo texto',
    fontSize: 16,
  },
  image: {
    width: 200,
    height: 200,
    type: 'image' as const,
    imageUrl: '',
  },
  brush: {
    width: 0,
    height: 0,
    type: 'brush' as const,
    points: [],
    stroke: '#000000',
    strokeWidth: 3,
    color: undefined,
  },
};

const AppContainer = styled.div<{ theme: any }>`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
  transition: all 0.3s ease;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [history, setHistory] = useState<Block[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [toolMode, setToolMode] = useState<'select' | 'brush' | 'eraser'>('select');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const addToHistory = (newBlocks: Block[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBlocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const createNewBlock = (type: keyof typeof BLOCK_TYPES) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      ...DEFAULT_BLOCK_CONFIG,
      ...BLOCK_TYPES[type],
      color: theme.text,
    };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    addToHistory(newBlocks);
    setSelectedBlock(newBlock);
  };

  const handleAddBlock = () => createNewBlock('block');
  const handleAddText = () => createNewBlock('text');
  const handleAddImage = () => createNewBlock('image');

  const handleUpdateBlock = (updatedBlock: Block) => {
    const newBlocks = blocks.map((block) =>
      block.id === updatedBlock.id ? updatedBlock : block
    );
    setBlocks(newBlocks);
    addToHistory(newBlocks);
    if (selectedBlock && selectedBlock.id === updatedBlock.id) {
      setSelectedBlock(updatedBlock);
    }
  };

  const handleDeleteBlock = (id: string) => {
    const newBlocks = blocks.filter((block) => block.id !== id);
    setBlocks(newBlocks);
    addToHistory(newBlocks);
    setSelectedBlock(null);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBlocks(history[newIndex]);
      setSelectedBlock(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBlocks(history[newIndex]);
      setSelectedBlock(null);
    }
  };

  // Exportar projeto como JSON
  const handleExportProject = () => {
    const dataStr = JSON.stringify(blocks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projeto-devmap.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importar projeto de JSON
  const handleImportProject = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          setBlocks(json);
          setSelectedBlock(null);
        } else {
          alert('Arquivo inválido!');
        }
      } catch {
        alert('Erro ao importar arquivo!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <AppContainer theme={theme}>
      <Toolbar
        onAddBlock={handleAddBlock}
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        onUndo={handleUndo}
        onRedo={handleRedo}
        toolMode={toolMode}
        setToolMode={setToolMode}
        onExportProject={handleExportProject}
        onImportProject={handleImportProject}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />
      <MainContent>
        <Canvas
          blocks={blocks}
          setBlocks={setBlocks}
          selectedBlock={selectedBlock}
          setSelectedBlock={setSelectedBlock}
          toolMode={toolMode}
          searchTerm={searchTerm}
        />
        <PropertiesPanel
          selectedBlock={selectedBlock}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
        />
      </MainContent>
    </AppContainer>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App; 