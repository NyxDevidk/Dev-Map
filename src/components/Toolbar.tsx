import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { FaCube, FaFont, FaImage, FaPaintBrush, FaEraser, FaUndo, FaRedo, FaLink, FaSun, FaMoon } from 'react-icons/fa';

const ToolbarContainer = styled.div<{ theme: any }>`
  display: flex;
  padding: 16px 32px;
  background: rgba(30, 30, 40, 0.92);
  border-bottom: 1.5px solid ${props => props.theme.border};
  gap: 18px;
  align-items: center;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10);
  z-index: 10;
  backdrop-filter: blur(6px);
`;

const ToolButton = styled.button<{ theme: any; active?: boolean }>`
  padding: 12px 22px;
  border: none;
  border-radius: 8px;
  background: ${({ active, theme }) => active ? theme.primary : 'rgba(50,50,60,0.85)'};
  color: ${({ active, theme }) => active ? 'white' : theme.text};
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: ${({ active }) => active ? '0 2px 12px 0 rgba(0,0,0,0.12)' : 'none'};
  transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.1s;
  border: 1.5px solid transparent;
  &:hover {
    background: ${({ theme, active }) => active ? theme.primary : 'rgba(80,80,100,0.95)'};
    color: ${({ theme }) => theme.primary};
    transform: translateY(-2px) scale(1.04);
  }
  &:active {
    transform: scale(0.97);
    filter: brightness(0.95);
  }
`;

const ThemeToggle = styled(ToolButton)`
  margin-left: auto;
  background: linear-gradient(90deg, #4f8cff 0%, #6f6fff 100%);
  color: white;
  border: none;
  font-size: 18px;
`;

interface ToolbarProps {
  onAddBlock?: () => void;
  onAddText?: () => void;
  onAddImage?: () => void;
  onConnect?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  toolMode: 'select' | 'brush' | 'eraser';
  setToolMode: (mode: 'select' | 'brush' | 'eraser') => void;
  onExportProject?: () => void;
  onImportProject?: (file: File) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddBlock,
  onAddText,
  onAddImage,
  onConnect,
  onUndo,
  onRedo,
  toolMode,
  setToolMode,
  onExportProject,
  onImportProject,
}) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  return (
    <ToolbarContainer theme={theme}>
      <ToolButton theme={theme} active={toolMode === 'select'} onClick={() => { setToolMode('select'); if (onAddBlock) onAddBlock(); }} title="Selecionar e adicionar bloco">
        {FaCube({})} Bloco
      </ToolButton>
      <ToolButton theme={theme} onClick={onAddText} title="Adicionar Texto">
        {FaFont({})} Texto
      </ToolButton>
      <ToolButton theme={theme} onClick={onAddImage} title="Adicionar Imagem">
        {FaImage({})} Imagem
      </ToolButton>
      <ToolButton theme={theme} active={toolMode === 'brush'} onClick={() => setToolMode(toolMode === 'brush' ? 'select' : 'brush')} title="Pincel">
        {FaPaintBrush({})} Pincel
      </ToolButton>
      <ToolButton theme={theme} active={toolMode === 'eraser'} onClick={() => setToolMode(toolMode === 'eraser' ? 'select' : 'eraser')} title="Borracha">
        {FaEraser({})} Borracha
      </ToolButton>
      <ToolButton theme={theme} onClick={onConnect} title="Conectar">
        {FaLink({})}
      </ToolButton>
      <ToolButton theme={theme} onClick={onUndo} title="Desfazer">
        {FaUndo({})}
      </ToolButton>
      <ToolButton theme={theme} onClick={onRedo} title="Refazer">
        {FaRedo({})}
      </ToolButton>
      <ToolButton theme={theme} onClick={onExportProject} title="Exportar Projeto">
        📤 Exportar
      </ToolButton>
      <ToolButton as="label" theme={theme} title="Importar Projeto">
        📥 Importar
        <input type="file" accept="application/json" style={{ display: 'none' }} onChange={e => {
          if (e.target.files && e.target.files[0] && onImportProject) {
            onImportProject(e.target.files[0]);
          }
        }} />
      </ToolButton>
      <ThemeToggle theme={theme} onClick={toggleTheme} title="Alternar Tema">
        {isDarkMode ? FaSun({}) : FaMoon({})}
      </ThemeToggle>
    </ToolbarContainer>
  );
};

export default Toolbar; 