'use client';

import { useState, useRef, useEffect } from 'react';
import { MealType, AIFoodAnalysis } from '@/types';

type InputMode = 'manual' | 'ai-text' | 'photo';

interface Props {
  selectedDate: string;
  prefill: { name: string; calories: number; serving_size: string } | null;
  onSubmit: (entry: {
    food_name: string;
    calories: number;
    meal_type: MealType;
    serving_size: string;
    date: string;
  }) => void;
  onClearPrefill: () => void;
}

const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function FoodForm({ selectedDate, prefill, onSubmit, onClearPrefill }: Props) {
  const [mode, setMode] = useState<InputMode>('manual');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [mealType, setMealType] = useState<MealType>('Breakfast');
  const [servingSize, setServingSize] = useState('');

  const [aiText, setAiText] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiFilled, setAiFilled] = useState(false);

  useEffect(() => {
    if (prefill) {
      setFoodName(prefill.name);
      setCalories(String(prefill.calories));
      setServingSize(prefill.serving_size);
      setMode('manual');
    }
  }, [prefill]);

  function clearForm() {
    setFoodName('');
    setCalories('');
    setServingSize('');
    setMealType('Breakfast');
    setAiText('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setAiError(null);
    setAiFilled(false);
    onClearPrefill();
  }

  function applyAIResult(data: AIFoodAnalysis) {
    setFoodName(data.food_name);
    setCalories(String(data.calories));
    setMealType(data.meal_type);
    setServingSize(data.serving_size);
    setAiFilled(true);
    setAiError(null);
  }

  async function handleAnalyzeText() {
    if (!aiText.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/analyze-food-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: aiText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "Couldn't identify the food — try describing it differently.");
        return;
      }
      applyAIResult(data);
    } catch {
      setAiError("Couldn't reach the AI service — please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setAiError(null);
    setAiFilled(false);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }

  async function handleAnalyzePhoto() {
    if (!photoFile) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const formData = new FormData();
      formData.append('image', photoFile);
      const res = await fetch('/api/analyze-food-photo', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "Couldn't identify the food — try describing it instead.");
        return;
      }
      applyAIResult(data);
    } catch {
      setAiError("Couldn't reach the AI service — please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = foodName.trim();
    const cal = Number(calories);
    const serving = servingSize.trim();
    if (!name || !cal || !serving) return;

    onSubmit({
      food_name: name,
      calories: cal,
      meal_type: mealType,
      serving_size: serving,
      date: selectedDate,
    });
    clearForm();
  }

  const tabs: { key: InputMode; label: string; icon: string }[] = [
    { key: 'manual', label: 'Manual', icon: '✏️' },
    { key: 'ai-text', label: 'Describe', icon: '💬' },
    { key: 'photo', label: 'Photo', icon: '📷' },
  ];

  const showFormFields = mode === 'manual' || aiFilled;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Log a Meal</h2>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setMode(tab.key); setAiError(null); setAiFilled(false); }}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              mode === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* AI Text input */}
      {mode === 'ai-text' && !aiFilled && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Describe what you ate
          </label>
          <textarea
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder='e.g., "I had a turkey sandwich with chips and a Coke for lunch"'
            rows={3}
            maxLength={1000}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          />
          <button
            type="button"
            onClick={handleAnalyzeText}
            disabled={aiLoading || !aiText.trim()}
            className="mt-2 w-full bg-blue-500 text-white py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {aiLoading ? (
              <>
                <Spinner />
                Analyzing...
              </>
            ) : (
              'Analyze with AI'
            )}
          </button>
        </div>
      )}

      {/* Photo upload */}
      {mode === 'photo' && !aiFilled && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Upload a food photo
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          {photoPreview ? (
            <div className="space-y-3">
              <div className="relative inline-block">
                <img
                  src={photoPreview}
                  alt="Food preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 text-white rounded-full text-xs flex items-center justify-center hover:bg-gray-700"
                >
                  &times;
                </button>
              </div>
              <button
                type="button"
                onClick={handleAnalyzePhoto}
                disabled={aiLoading}
                className="w-full bg-blue-500 text-white py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <Spinner />
                    Analyzing photo...
                  </>
                ) : (
                  'Analyze with AI'
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg py-8 text-sm text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-colors"
            >
              Click to select a photo or take one
            </button>
          )}
        </div>
      )}

      {/* AI error */}
      {aiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {aiError}
        </div>
      )}

      {/* AI filled banner */}
      {aiFilled && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center justify-between">
          <span>AI pre-filled the form — review and edit before saving.</span>
          <button
            type="button"
            onClick={() => { setAiFilled(false); setFoodName(''); setCalories(''); setServingSize(''); }}
            className="text-blue-500 hover:text-blue-700 text-xs font-medium ml-2 shrink-0"
          >
            Try again
          </button>
        </div>
      )}

      {/* Photo preview in filled state */}
      {aiFilled && mode === 'photo' && photoPreview && (
        <div className="mb-4">
          <img
            src={photoPreview}
            alt="Analyzed food"
            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )}

      {/* Form fields */}
      {showFormFields && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Food Name</label>
              <input
                type="text"
                value={foodName}
                onChange={(e) => { setFoodName(e.target.value); onClearPrefill(); }}
                placeholder="e.g., Chicken Breast"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Calories</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => { setCalories(e.target.value); onClearPrefill(); }}
                placeholder="e.g., 165"
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Meal Type</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                {mealTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Serving Size</label>
              <input
                type="text"
                value={servingSize}
                onChange={(e) => { setServingSize(e.target.value); onClearPrefill(); }}
                placeholder="e.g., 100g"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 transition-colors text-sm"
          >
            Add Entry
          </button>
        </>
      )}
    </form>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
