import React, { useState } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { updateSiteContent } from '../../lib/content';
import { Button } from '../ui/Button';
import { Edit2, Save, X, Youtube } from 'lucide-react';

export function ContentManager() {
  const { content, refreshContent } = useContent();
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>(null);

  const handleEdit = (key: string) => {
    setEditing(key);
    setEditValue(content[key].value);
  };

  const handleSave = async () => {
    if (!editing || !content[editing]) return;

    try {
      await updateSiteContent(content[editing].id, editValue);
      await refreshContent();
      setEditing(null);
      setEditValue(null);
    } catch (error) {
      console.error('Failed to update content:', error);
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setEditValue(null);
  };

  const renderEditField = (item: any) => {
    switch (item.type) {
      case 'text':
        return (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        );
      case 'menu':
      case 'logo':
        return (
          <textarea
            value={JSON.stringify(editValue, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setEditValue(parsed);
              } catch (error) {
                setEditValue(e.target.value);
              }
            }}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
          />
        );
      case 'youtube':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
              <input
                type="text"
                value={editValue.url}
                onChange={(e) => setEditValue({ ...editValue, url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={editValue.title}
                onChange={(e) => setEditValue({ ...editValue, title: e.target.value })}
                placeholder="How It Works"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editValue.description}
                onChange={(e) => setEditValue({ ...editValue, description: e.target.value })}
                placeholder="Learn how our platform works..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Site Content Management</h2>
      
      <div className="space-y-4">
        {Object.values(content).map((item: any) => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {item.key.replace(/_/g, ' ').toUpperCase()}
                </h3>
                <p className="text-sm text-gray-500">Type: {item.type}</p>
              </div>
              {editing === item.key ? (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="flex items-center"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(item.key)}
                  className="flex items-center"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            
            <div className="mt-2">
              {editing === item.key ? (
                renderEditField(item)
              ) : (
                <pre className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                  {JSON.stringify(item.value, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}