import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, Image, Video } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  title: string;
  content_es: string;
  content_en: string;
  category: string;
  subcategory_id?: string;
  tags: string[];
  price: number;
  is_for_sale: boolean;
  media_url?: string;
  media_type?: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content_es: '',
    content_en: '',
    category: '',
    subcategory_id: '',
    tags: '',
    price: '',
    is_for_sale: true,
    media_url: '',
    media_type: 'image',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch products for sale
      const { data: productsData, error: productsError } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch subcategories
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .order('name');

      if (subcategoriesError) throw subcategoriesError;
      setSubcategories(subcategoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const promptData = {
      title: formData.title,
      content_es: formData.content_es,
      content_en: formData.content_en,
      category: formData.category,
      subcategory_id: formData.subcategory_id || null,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      price: parseFloat(formData.price),
      is_for_sale: formData.is_for_sale,
      media_url: formData.media_url || null,
      media_type: formData.media_type || null,
    };

    try {
      if (editingProduct) {
        // Update
        const { error } = await supabase
          .from('prompts')
          .update(promptData as any)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Producto actualizado', 'El producto se actualizó correctamente');
      } else {
        // Create
        const { error } = await supabase
          .from('prompts')
          .insert(promptData as any);

        if (error) throw error;
        toast.success('Producto creado', 'El producto se creó correctamente');
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error', 'No se pudo guardar el producto');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      content_es: product.content_es,
      content_en: product.content_en,
      category: product.category,
      subcategory_id: product.subcategory_id || '',
      tags: product.tags?.join(', ') || '',
      price: product.price?.toString() || '',
      is_for_sale: product.is_for_sale || false,
      media_url: product.media_url || '',
      media_type: product.media_type || 'image',
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Producto eliminado', 'El producto se eliminó correctamente');
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error', 'No se pudo eliminar el producto');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content_es: '',
      content_en: '',
      category: '',
      subcategory_id: '',
      tags: '',
      price: '',
      is_for_sale: true,
      media_url: '',
      media_type: 'image',
    });
    setEditingProduct(null);
    setIsFormOpen(false);
  };

  const filteredSubcategories = subcategories.filter(
    (sub) => sub.category_id === formData.category
  );

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Productos/Prompts</h2>
        <Button onClick={() => setIsFormOpen(true)} data-testid="button-create-product">
          <Plus className="h-4 w-4 mr-2" />
          Crear Producto
        </Button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    data-testid="input-title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Precio ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    data-testid="input-price"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory_id: '' })}
                    required
                    data-testid="select-category"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subcategoría</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100"
                    value={formData.subcategory_id}
                    onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                    disabled={!formData.category}
                    data-testid="select-subcategory"
                  >
                    <option value="">Ninguna</option>
                    {filteredSubcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <textarea
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg"
                placeholder="Prompt (Español)"
                value={formData.content_es}
                onChange={(e) => setFormData({ ...formData, content_es: e.target.value })}
                rows={4}
                required
                data-testid="textarea-content-es"
              />

              <textarea
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg"
                placeholder="Prompt (English)"
                value={formData.content_en}
                onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                rows={4}
                required
                data-testid="textarea-content-en"
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags (separados por coma)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="marketing, seo, ventas"
                  data-testid="input-tags"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Media</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100"
                    value={formData.media_type}
                    onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
                    data-testid="select-media-type"
                  >
                    <option value="image">Imagen</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">URL de Imagen/Video</label>
                  <Input
                    value={formData.media_url}
                    onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                    placeholder="https://..."
                    data-testid="input-media-url"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_for_sale}
                  onChange={(e) => setFormData({ ...formData, is_for_sale: e.target.checked })}
                  data-testid="checkbox-for-sale"
                />
                <span>Activar para venta</span>
              </label>

              <div className="flex gap-2">
                <Button type="submit" data-testid="button-save-product">
                  <Check className="h-4 w-4 mr-2" />
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm} data-testid="button-cancel">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{product.title}</h3>
                  <p className="text-sm text-gray-500">${product.price?.toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {product.is_for_sale ? (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded">En Venta</span>
                    ) : (
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-2 py-1 rounded">No Disponible</span>
                    )}
                    {product.media_type && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded flex items-center gap-1">
                        {product.media_type === 'video' ? <Video className="h-3 w-3" /> : <Image className="h-3 w-3" />}
                        {product.media_type}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(product)} data-testid={`button-edit-${product.id}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(product.id)} data-testid={`button-delete-${product.id}`}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
