import React, { useState } from 'react';
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { useToast } from '../../hooks/useToast';

interface Subcategory {
  id: string;
  name: string;
  description?: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
}

interface SubcategoryManagementProps {
  subcategories: Subcategory[];
  categories: Category[];
  onCreateSubcategory: (subcategory: Omit<Subcategory, 'id'>) => void;
  onUpdateSubcategory: (subcategoryId: string, updates: Partial<Subcategory>) => void;
  onDeleteSubcategory: (subcategoryId: string) => void;
}

export function SubcategoryManagement({
  subcategories,
  categories,
  onCreateSubcategory,
  onUpdateSubcategory,
  onDeleteSubcategory,
}: SubcategoryManagementProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSubcategory) {
      onUpdateSubcategory(editingSubcategory.id, formData);
      toast.success('Subcategoría actualizada', `"${formData.name}" actualizada exitosamente`);
      setEditingSubcategory(null);
    } else {
      onCreateSubcategory(formData);
      toast.success('Subcategoría creada', `"${formData.name}" creada exitosamente`);
      setIsCreating(false);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category_id: categories[0]?.id || '',
    });
  };

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      description: subcategory.description || '',
      category_id: subcategory.category_id,
    });
    setIsCreating(true);
  };

  const handleDelete = (subcategoryId: string, subcategoryName: string) => {
    if (confirm(`¿Eliminar subcategoría "${subcategoryName}"?`)) {
      onDeleteSubcategory(subcategoryId);
      toast.success('Subcategoría eliminada', 'La subcategoría ha sido eliminada');
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Sin categoría';
  };

  const subcategoriesByCategory = categories.map(category => ({
    category,
    subcategories: subcategories.filter(s => s.category_id === category.id),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">Gestión de Subcategorías</h2>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
          data-testid="button-create-subcategory"
        >
          <Plus className="h-4 w-4" />
          Nueva Subcategoría
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingSubcategory ? 'Editar Subcategoría' : 'Nueva Subcategoría'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoría Principal *
                </label>
                <Select
                  options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  data-testid="select-parent-category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej: Email Marketing"
                  required
                  data-testid="input-subcategory-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descripción"
                  data-testid="input-subcategory-description"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" data-testid="button-save-subcategory">
                  {editingSubcategory ? 'Actualizar' : 'Crear Subcategoría'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingSubcategory(null);
                    resetForm();
                  }}
                  data-testid="button-cancel-subcategory"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {subcategoriesByCategory.map(({ category, subcategories: subs }) => (
        <div key={category.id} className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-blue-400" />
            {category.name}
            <Badge variant="secondary">{subs.length} subcategorías</Badge>
          </h3>
          
          {subs.length === 0 ? (
            <p className="text-sm text-gray-500 ml-7">No hay subcategorías</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-7">
              {subs.map((sub) => (
                <Card key={sub.id} className="bg-gray-800/50">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-100">{sub.name}</h4>
                        {sub.description && (
                          <p className="text-xs text-gray-400 mt-1">{sub.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(sub)}
                          data-testid={`button-edit-subcategory-${sub.id}`}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(sub.id, sub.name)}
                          data-testid={`button-delete-subcategory-${sub.id}`}
                        >
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
