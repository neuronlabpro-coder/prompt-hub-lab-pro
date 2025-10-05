import React, { useState } from 'react';
import { X, Save, Wand2, Languages, Plus } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useCategories, useSubcategories, useModels } from '../hooks/useSupabase';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Badge } from './ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { estimateTokens } from '../lib/utils';

interface CreatePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: {
    title: string;
    content_es: string;
    content_en: string;
    category: string;
    subcategory_id?: string;
    preferred_model_id?: string;
    tags: string[];
  }) => void;
}

export function CreatePromptModal({ isOpen, onClose, onSave }: CreatePromptModalProps) {
  const [activeTab, setActiveTab] = useState<'es' | 'en'>('es');
  const [title, setTitle] = useState('');
  const [contentEs, setContentEs] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [contentType, setContentType] = useState<'text' | 'image' | 'video'>('text');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();
  const { categories } = useCategories();
  const { subcategories } = useSubcategories(selectedCategory);
  const { models } = useModels();

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Set default category
      if (categories.length > 0 && !selectedCategory) {
        setSelectedCategory(categories[0].id);
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, selectedCategory]);

  if (!isOpen) return null;

  const currentContent = activeTab === 'es' ? contentEs : contentEn;
  const setCurrentContent = activeTab === 'es' ? setContentEs : setContentEn;
  const currentTokens = estimateTokens(currentContent);

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
  })).concat([{ value: 'new', label: '+ Crear nueva categoría' }]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleGenerateIdeas = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const ideas = [
      'Actúa como un experto en {tema} y proporciona una guía detallada paso a paso.',
      'Eres un consultor especializado en {área}. Analiza la siguiente situación y ofrece recomendaciones.',
      'Como {rol_profesional}, explica {concepto} de manera clara y con ejemplos prácticos.',
    ];
    
    const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
    setCurrentContent(randomIdea);
    setIsGenerating(false);
  };

  const handleTranslate = async () => {
    const sourceContent = activeTab === 'es' ? contentEs : contentEn;
    if (!sourceContent.trim()) return;

    setIsTranslating(true);
    // Simulate translation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const translatedContent = `[Traducción simulada] ${sourceContent}`;
    if (activeTab === 'es') {
      setContentEn(translatedContent);
    } else {
      setContentEs(translatedContent);
    }
    setIsTranslating(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type based on content type
    const validTypes = contentType === 'image' 
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      : ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de archivo inválido', `Por favor selecciona un archivo ${contentType === 'image' ? 'de imagen' : 'de video'} válido`);
      return;
    }

    // Validate file size (max 500MB for video, 10MB for images)
    const maxSize = contentType === 'video' ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Archivo muy grande', `El tamaño máximo es ${contentType === 'video' ? '500MB' : '10MB'}`);
      return;
    }

    setMediaFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setMediaFile(null);
    setMediaPreview('');
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'new') {
      setShowNewCategory(true);
      setSelectedCategory('');
    } else {
      setShowNewCategory(false);
      setSelectedCategory(value);
      setSelectedSubcategory(''); // Reset subcategory when category changes
    }
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      // In a real app, this would create the category in the database
      console.log('Creating new category:', newCategoryName);
      toast.success('Categoría creada', `"${newCategoryName}" creada exitosamente`);
      setShowNewCategory(false);
      setNewCategoryName('');
      // For now, just select the first category
      setSelectedCategory(categories[0]?.id || '');
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !contentEs.trim()) {
      toast.warning('Campos requeridos', 'Por favor completa el título y contenido en español');
      return;
    }

    if ((contentType === 'image' || contentType === 'video') && !mediaFile) {
      toast.warning('Archivo requerido', `Por favor sube ${contentType === 'image' ? 'una imagen' : 'un video'}`);
      return;
    }

    let mediaUrl = undefined;

    // Upload media file if present
    if (mediaFile) {
      try {
        const formData = new FormData();
        formData.append('file', mediaFile);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Error al subir el archivo');
        }

        const data = await response.json();
        mediaUrl = data.url;
      } catch (error) {
        toast.error('Error', 'No se pudo subir el archivo');
        return;
      }
    }
    
    onSave({
      title: title.trim(),
      content_es: contentEs.trim(),
      content_en: contentEn.trim() || contentEs.trim(),
      category: selectedCategory,
      subcategory_id: selectedSubcategory || undefined,
      preferred_model_id: selectedModel || undefined,
      tags,
    });

    // Reset form
    setTitle('');
    setContentEs('');
    setContentEn('');
    setSelectedSubcategory('');
    setSelectedModel('');
    setContentType('text');
    setMediaFile(null);
    setMediaPreview('');
    setTags([]);
    setTagInput('');
    onClose();
  };

  const handleClose = () => {
    // Reset form on close
    setTitle('');
    setContentEs('');
    setContentEn('');
    setTags([]);
    setTagInput('');
    setSelectedCategory('');
    setShowNewCategory(false);
    setNewCategoryName('');
    setContentType('text');
    setMediaFile(null);
    setMediaPreview('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-4xl h-[90vh] w-full mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-100">Crear Nuevo Prompt</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-6">
            {/* Title and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Generador de Artículos SEO"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoría
                </label>
                {showNewCategory ? (
                  <div className="flex gap-2">
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nombre de la nueva categoría"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleCreateCategory}
                      disabled={!newCategoryName.trim()}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Crear
                    </Button>
                    <Button
                      onClick={() => {
                        setShowNewCategory(false);
                        setNewCategoryName('');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Select
                    options={categoryOptions}
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  />
                )}
              </div>
            </div>

            {/* Content Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Prompt *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setContentType('text')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    contentType === 'text'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-gray-600 bg-gray-700/50 text-gray-400 hover:border-gray-500'
                  }`}
                  data-testid="button-type-text"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">📝</span>
                    <span className="text-sm font-medium">Texto</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setContentType('image')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    contentType === 'image'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-gray-600 bg-gray-700/50 text-gray-400 hover:border-gray-500'
                  }`}
                  data-testid="button-type-image"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">🖼️</span>
                    <span className="text-sm font-medium">Imagen</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setContentType('video')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    contentType === 'video'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-gray-600 bg-gray-700/50 text-gray-400 hover:border-gray-500'
                  }`}
                  data-testid="button-type-video"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">🎥</span>
                    <span className="text-sm font-medium">Video</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Media Upload for Image/Video */}
            {(contentType === 'image' || contentType === 'video') && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {contentType === 'image' ? 'Subir Imagen' : 'Subir Video'} *
                </label>
                {!mediaPreview ? (
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                    <input
                      type="file"
                      id="media-upload"
                      accept={contentType === 'image' ? 'image/*' : 'video/*'}
                      onChange={handleFileChange}
                      className="hidden"
                      data-testid="input-media-upload"
                    />
                    <label
                      htmlFor="media-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
                        {contentType === 'image' ? '🖼️' : '🎥'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300">
                          Click para seleccionar {contentType === 'image' ? 'imagen' : 'video'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {contentType === 'image' 
                            ? 'JPG, PNG, GIF, WEBP (máx. 10MB)'
                            : 'MP4, WEBM, MOV (máx. 500MB)'}
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="relative border border-gray-600 rounded-lg overflow-hidden">
                    {contentType === 'image' ? (
                      <img src={mediaPreview} alt="Preview" className="w-full h-48 object-cover" />
                    ) : (
                      <video src={mediaPreview} className="w-full h-48 object-cover" controls />
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                      data-testid="button-remove-media"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Subcategory and Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subcategoría
                </label>
                <Select
                  options={[
                    { value: '', label: 'Sin subcategoría' },
                    ...subcategories.map(sub => ({
                      value: sub.id,
                      label: sub.name,
                    }))
                  ]}
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  disabled={!selectedCategory || subcategories.length === 0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Modelo Preferido
                </label>
                <Select
                  options={[
                    { value: '', label: 'Sin modelo preferido' },
                    ...models.map(model => ({
                      value: model.id,
                      label: `${model.name} (${model.providers?.name || 'Unknown'})`,
                    }))
                  ]}
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Escribe un tag y presiona Enter"
                className="w-full mb-2"
              />
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-600"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Variables Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-blue-400">
                💡 <strong>Usa variables</strong> para crear prompts dinámicos: <code className="bg-gray-700 px-1 rounded">{'{nombre}'}</code>, <code className="bg-gray-700 px-1 rounded">{'{tema}'}</code>, <code className="bg-gray-700 px-1 rounded">{'{objetivo}'}</code>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Las variables se pueden gestionar desde el panel de administración
              </p>
            </div>

            {/* Content Tabs */}
            <div>
              <div className="flex border-b border-gray-700 mb-4">
                <button
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'es'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('es')}
                >
                  Español ({estimateTokens(contentEs)} tokens)
                </button>
                <button
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'en'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('en')}
                >
                  English ({estimateTokens(contentEn)} tokens)
                </button>
              </div>

              {/* Content Editor */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateIdeas}
                    disabled={isGenerating}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        Ideas IA
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleTranslate}
                    disabled={isTranslating || !currentContent.trim()}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {isTranslating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        Traduciendo...
                      </>
                    ) : (
                      <>
                        <Languages className="h-4 w-4" />
                        Traducir {activeTab === 'es' ? 'a EN' : 'a ES'}
                      </>
                    )}
                  </Button>
                </div>

                <textarea
                  value={currentContent}
                  onChange={(e) => setCurrentContent(e.target.value)}
                  placeholder={`Escribe tu prompt en ${activeTab === 'es' ? 'español' : 'inglés'}...`}
                  className="w-full h-64 p-4 border border-gray-600 bg-gray-900 text-gray-100 rounded-lg resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm overflow-y-auto"
                />

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{currentContent.length} caracteres · {currentTokens} tokens</span>
                  <span>Usa {'{variables}'} para parámetros dinámicos</span>
                </div>
              </div>
            </div>

            {/* Preview */}
            {(contentEs || contentEn) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Vista Previa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <div className="text-sm text-gray-300 mb-2">
                      <strong>{title || 'Título del prompt'}</strong>
                    </div>
                    <div className="font-mono text-sm text-gray-100 whitespace-pre-wrap">
                      {currentContent || 'Contenido del prompt...'}
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 flex-shrink-0">
          <div className="text-sm text-gray-400">
            * Los campos marcados son obligatorios
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim() || !contentEs.trim()}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar Prompt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}