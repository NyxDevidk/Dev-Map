import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { FaTrash } from 'react-icons/fa';

const Panel = styled.div<{ theme: any }>`
  width: 320px;
  background: rgba(30, 30, 40, 0.92);
  border-left: 1.5px solid ${props => props.theme.border};
  padding: 28px 24px 24px 24px;
  color: ${props => props.theme.text};
  transition: all 0.3s ease;
  box-shadow: -4px 0 24px 0 rgba(0,0,0,0.10);
  backdrop-filter: blur(6px);
`;

const Title = styled.h3<{ theme: any }>`
  margin: 0 0 24px 0;
  color: ${props => props.theme.primary};
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const PropertyGroup = styled.div`
  margin-bottom: 22px;
`;

const Label = styled.label<{ theme: any }>`
  display: block;
  margin-bottom: 8px;
  color: ${props => props.theme.text};
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.2px;
`;

const Input = styled.input<{ theme: any }>`
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid ${props => props.theme.border};
  border-radius: 7px;
  background: rgba(40,40,50,0.95);
  color: ${props => props.theme.text};
  font-size: 15px;
  transition: all 0.2s;
  margin-bottom: 2px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.primary}33;
    background: rgba(60,60,80,1);
  }
`;

const ColorPicker = styled.input<{ theme: any }>`
  width: 100%;
  height: 40px;
  padding: 4px;
  border: 1.5px solid ${props => props.theme.border};
  border-radius: 7px;
  background: rgba(40,40,50,0.95);
  cursor: pointer;
`;

const Button = styled.button<{ theme: any }>`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 7px;
  background: linear-gradient(90deg, #ff4f6f 0%, #ff6f6f 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;

  &:hover {
    background: linear-gradient(90deg, #ff2f4f 0%, #ff4f4f 100%);
    transform: scale(1.03);
  }
  &:active {
    filter: brightness(0.95);
    transform: scale(0.98);
  }
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
  opacity?: number;
  rotation?: number;
  stroke?: string;
  strokeWidth?: number;
  points?: number[];
}

interface PropertiesPanelProps {
  selectedBlock: Block | null;
  onUpdateBlock: (block: Block) => void;
  onDeleteBlock: (id: string) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedBlock,
  onUpdateBlock,
  onDeleteBlock,
}) => {
  const { theme } = useTheme();

  if (!selectedBlock) {
    return (
      <Panel theme={theme}>
        <Title theme={theme}>Nenhum elemento selecionado</Title>
        <p>Selecione um elemento para editar suas propriedades</p>
      </Panel>
    );
  }

  const handleChange = (property: keyof Block, value: any) => {
    onUpdateBlock({
      ...selectedBlock,
      [property]: value,
    });
  };

  return (
    <Panel theme={theme}>
      <Title theme={theme}>Propriedades</Title>
      
      <PropertyGroup>
        <Label theme={theme}>Posição X</Label>
        <Input
          theme={theme}
          type="number"
          value={selectedBlock.x}
          onChange={(e) => handleChange('x', Number(e.target.value))}
        />
      </PropertyGroup>

      <PropertyGroup>
        <Label theme={theme}>Posição Y</Label>
        <Input
          theme={theme}
          type="number"
          value={selectedBlock.y}
          onChange={(e) => handleChange('y', Number(e.target.value))}
        />
      </PropertyGroup>

      <PropertyGroup>
        <Label theme={theme}>Largura</Label>
        <Input
          theme={theme}
          type="number"
          value={selectedBlock.width}
          onChange={(e) => handleChange('width', Number(e.target.value))}
        />
      </PropertyGroup>

      <PropertyGroup>
        <Label theme={theme}>Altura</Label>
        <Input
          theme={theme}
          type="number"
          value={selectedBlock.height}
          onChange={(e) => handleChange('height', Number(e.target.value))}
        />
      </PropertyGroup>

      {selectedBlock.type === 'text' && (
        <>
          <PropertyGroup>
            <Label theme={theme}>Texto</Label>
            <Input
              theme={theme}
              type="text"
              value={selectedBlock.text}
              onChange={(e) => handleChange('text', e.target.value)}
            />
          </PropertyGroup>

          <PropertyGroup>
            <Label theme={theme}>Tamanho da Fonte</Label>
            <Input
              theme={theme}
              type="number"
              value={selectedBlock.fontSize || 16}
              onChange={(e) => handleChange('fontSize', Number(e.target.value))}
            />
          </PropertyGroup>
        </>
      )}

      <PropertyGroup>
        <Label theme={theme}>Cor</Label>
        <ColorPicker
          theme={theme}
          type="color"
          value={selectedBlock.color || '#000000'}
          onChange={(e) => handleChange('color', e.target.value)}
        />
      </PropertyGroup>

      <PropertyGroup>
        <Label theme={theme}>Opacidade</Label>
        <Input
          theme={theme}
          type="number"
          min="0"
          max="1"
          step="0.1"
          value={selectedBlock.opacity ?? 1}
          onChange={(e) => handleChange('opacity', Number(e.target.value))}
        />
      </PropertyGroup>

      <PropertyGroup>
        <Label theme={theme}>Rotação</Label>
        <Input
          theme={theme}
          type="number"
          min="0"
          max="360"
          value={selectedBlock.rotation ?? 0}
          onChange={(e) => handleChange('rotation', Number(e.target.value))}
        />
      </PropertyGroup>

      <PropertyGroup>
        <Label theme={theme}>Cor da Borda</Label>
        <ColorPicker
          theme={theme}
          type="color"
          value={selectedBlock.stroke || '#000000'}
          onChange={(e) => handleChange('stroke', e.target.value)}
        />
      </PropertyGroup>

      <PropertyGroup>
        <Label theme={theme}>Espessura da Borda</Label>
        <Input
          theme={theme}
          type="number"
          min="0"
          max="10"
          value={selectedBlock.strokeWidth ?? 1}
          onChange={(e) => handleChange('strokeWidth', Number(e.target.value))}
        />
      </PropertyGroup>

      {selectedBlock.type === 'image' && (
        <PropertyGroup>
          <Label theme={theme}>Escolher Imagem</Label>
          <Input
            theme={theme}
            type="file"
            accept="image/*"
            style={{ padding: 0, background: 'none' }}
            onChange={e => {
              const file = e.target.files && e.target.files[0];
              if (file) {
                const url = URL.createObjectURL(file);
                handleChange('imageUrl', url);
              }
            }}
          />
        </PropertyGroup>
      )}

      <Button
        theme={theme}
        onClick={() => onDeleteBlock(selectedBlock.id)}
      >
        {FaTrash({ style: { marginRight: 4 } })} Excluir Elemento
      </Button>
    </Panel>
  );
};

export default PropertiesPanel; 