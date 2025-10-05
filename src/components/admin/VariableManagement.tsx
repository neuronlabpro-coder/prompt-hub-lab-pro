import React, { useState } from 'react';
import { Plus, Edit, Trash2, Variable } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { useToast } from '../../hooks/useToast';

interface PromptVariable {
  id: string;
  name: string;
  label: string;
  description?: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  defaultValue?: string;
  options?: string[];
  required: boolean;
}

interface VariableManagementProps {
  variables: PromptVariable[];
  onCreateVariable: (variable: Omit<PromptVariable, 'id'>) => void;
  onUpdateVariable: (variableId: string, updates: Partial<PromptVariable>) => void;
  onDeleteVariable: (variableId: string) => void;
}

export function VariableManagement({
  variables,
  onCreateVariable,
  onUpdateVariable,
  onDeleteVariable,
}: VariableManagementProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingVariable, setEditingVariable] = useState<PromptVariable | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    description: '',
    type: 'text' as 'text' | 'number' | 'select' | 'textarea',
    defaultValue: '',
    options: '',
    required: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const options = formData.type === 'select' 
      ? formData.options.split(',').map(o => o.trim()).filter(Boolean)
      : undefined;

    if (editingVariable) {
      onUpdateVariable(editingVariable.id, {
        ...formData,
        options,
      });
      toast.success('Variable actualizada', `"${formData.label}" actualizada exitosamente`);
      setEditingVariable(null);
    } else {
      onCreateVariable({
        ...formData,
        options,
      });
      toast.success('Variable creada', `"${formData.label}" creada exitosamente`);
      setIsCreating(false);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      label: '',
      description: '',
      type: 'text',
      defaultValue: '',
      options: '',
      required: false,
    });
  };

  const handleEdit = (variable: PromptVariable) => {
    setEditingVariable(variable);
    setFormData({
      name: variable.name,
      label: variable.label,
      description: variable.description || '',
      type: variable.type,
      defaultValue: variable.defaultValue || '',
      options: variable.options?.join(', ') || '',
      required: variable.required,
    });
    setIsCreating(true);
  };

  const handleDelete = (variableId: string, variableName: string) => {
    if (confirm(`¿Eliminar variable "${variableName}"?`)) {
      onDeleteVariable(variableId);
      toast.success('Variable eliminada', 'La variable ha sido eliminada');
    }
  };

  const typeOptions = [
    { value: 'text', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'textarea', label: 'Texto largo' },
    { value: 'select', label: 'Selección' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">Gestión de Variables</h2>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
          data-testid="button-create-variable"
        >
          <Plus className="h-4 w-4" />
          Nueva Variable
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingVariable ? 'Editar Variable' : 'Nueva Variable'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre (para usar en prompts) *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ej: nombre_usuario"
                    required
                    data-testid="input-variable-name"
                  />
                  <p className="text-xs text-gray-500 mt-1">Usa: {`{${formData.name || 'nombre'}}`}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Etiqueta (para formulario) *
                  </label>
                  <Input
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="ej: Nombre de usuario"
                    required
                    data-testid="input-variable-label"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descripción de la variable"
                  data-testid="input-variable-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo *
                  </label>
                  <Select
                    options={typeOptions}
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    data-testid="select-variable-type"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Valor por defecto
                  </label>
                  <Input
                    value={formData.defaultValue}
                    onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                    placeholder="Opcional"
                    data-testid="input-variable-default"
                  />
                </div>
              </div>

              {formData.type === 'select' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Opciones (separadas por comas)
                  </label>
                  <Input
                    value={formData.options}
                    onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                    placeholder="Opción 1, Opción 2, Opción 3"
                    data-testid="input-variable-options"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={formData.required}
                  onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                  className="rounded"
                  data-testid="checkbox-variable-required"
                />
                <label htmlFor="required" className="text-sm text-gray-300">
                  Campo requerido
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" data-testid="button-save-variable">
                  {editingVariable ? 'Actualizar' : 'Crear Variable'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingVariable(null);
                    resetForm();
                  }}
                  data-testid="button-cancel-variable"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {variables.map((variable) => (
          <Card key={variable.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Variable className="h-5 w-5 text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-gray-100">{variable.label}</h3>
                    <code className="text-xs text-gray-400">{`{${variable.name}}`}</code>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(variable)}
                    data-testid={`button-edit-variable-${variable.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(variable.id, variable.label)}
                    data-testid={`button-delete-variable-${variable.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </div>
              
              {variable.description && (
                <p className="text-sm text-gray-400 mb-2">{variable.description}</p>
              )}
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary">{variable.type}</Badge>
                {variable.required && <Badge variant="default">Requerido</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
