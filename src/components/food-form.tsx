'use client';

import { useState, useEffect } from 'react';
import { MealType, AIFoodAnalysis, FoodPreset } from '@/types';

type InputMode = 'manual' | 'ai-text' | 'photo';

interface Props {
  selectedDate: string;
  prefill: FoodPreset | null;
  onSubmit: (entry: {
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
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
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState<MealType>('Breakfast');
  const [servingSize, setServingSize] = useState('');

  const [aiText, setAiText] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiFilled, setAiFilled] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (prefill) {
      setFoodName(prefill.name);
      setCalories(String(prefill.calories));
      setProtein(String(prefill.protein || 0));
      setCarbs(String(prefill.carbs || 0));
      setFat(String(prefill.fat || 0));
      setServingSize(prefill.serving_size);
      setMode('manual');
    }
  }, [prefill]);

  function clearForm() {
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
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
    setProtein(String(data.protein || 0));
    setCarbs(String(data.carbs || 0));
    setFat(String(data.fat || 0));
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

  function openFilePicker() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/heic';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      setPhotoFile(file);
      setAiError(null);
      setAiFilled(false);
      setPhotoPreview(URL.createObjectURL(file));
    };
    input.click();
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
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      meal_type: mealType,
      serving_size: serving,
      date: selectedDate,
    });
    clearForm();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  const tabs: { key: InputMode; label: string; icon: React.ReactNode }[] = [
    { key: 'manual', label: 'Manual', icon: <PenIcon /> },
    { key: 'ai-text', label: 'Describe', icon: <ChatIcon /> },
    { key: 'photo', label: 'Photo', icon: <CameraIcon /> },
  ];

  const showFormFields = mode === 'manual' || aiFilled;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Log a Meal</h2>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setMode(tab.key); setAiError(null); setAiFilled(false); }}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              mode === tab.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* AI Text input */}
      {mode === 'ai-text' && !aiFilled && (
        <div className="mb-5 animate-fade-in">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Describe what you ate
          </label>
          <textarea
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder='e.g., "I had a turkey sandwich with chips and a Coke for lunch"'
            rows={3}
            maxLength={1000}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none placeholder:text-slate-300"
          />
          <button
            type="button"
            onClick={handleAnalyzeText}
            disabled={aiLoading || !aiText.trim()}
            className="mt-2.5 w-full bg-emerald-500 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-600 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {aiLoading ? (
              <>
                <Spinner />
                Analyzing...
              </>
            ) : (
              <>
                <SparkleIcon />
                Analyze with AI
              </>
            )}
          </button>
        </div>
      )}

      {/* Photo upload */}
      {mode === 'photo' && !aiFilled && (
        <div className="mb-5 animate-fade-in">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Upload a food photo
          </label>
          {photoPreview ? (
            <div className="space-y-3">
              <div className="relative inline-block">
                <img
                  src={photoPreview}
                  alt="Food preview"
                  className="w-28 h-28 object-cover rounded-xl border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 text-white rounded-full text-xs flex items-center justify-center hover:bg-slate-700 transition-colors"
                >
                  &times;
                </button>
              </div>
              <button
                type="button"
                onClick={handleAnalyzePhoto}
                disabled={aiLoading}
                className="w-full bg-emerald-500 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-600 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <Spinner />
                    Analyzing photo...
                  </>
                ) : (
                  <>
                    <SparkleIcon />
                    Analyze with AI
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openFilePicker}
              className="w-full border-2 border-dashed border-slate-200 rounded-xl py-8 text-sm text-slate-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all flex flex-col items-center gap-2"
            >
              <CameraIcon />
              <span>Click to select a photo or take one</span>
            </button>
          )}
        </div>
      )}

      {/* AI error */}
      {aiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-start gap-2 animate-fade-in">
          <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" />
          </svg>
          {aiError}
        </div>
      )}

      {/* AI filled banner */}
      {aiFilled && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <SparkleIcon />
            <span>AI pre-filled — review and edit before saving.</span>
          </div>
          <button
            type="button"
            onClick={() => { setAiFilled(false); setFoodName(''); setCalories(''); setProtein(''); setCarbs(''); setFat(''); setServingSize(''); }}
            className="text-emerald-500 hover:text-emerald-700 text-xs font-medium ml-2 shrink-0"
          >
            Try again
          </button>
        </div>
      )}

      {/* Photo preview when AI filled */}
      {aiFilled && mode === 'photo' && photoPreview && (
        <div className="mb-4">
          <img src={photoPreview} alt="Analyzed food" className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
        </div>
      )}

      {/* Form fields */}
      {showFormFields && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Food Name</label>
              <input
                type="text"
                value={foodName}
                onChange={(e) => { setFoodName(e.target.value); onClearPrefill(); }}
                placeholder="e.g., Chicken Breast"
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Calories</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => { setCalories(e.target.value); onClearPrefill(); }}
                placeholder="e.g., 165"
                required
                min="0"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Meal Type</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                {mealTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Serving Size</label>
              <input
                type="text"
                value={servingSize}
                onChange={(e) => { setServingSize(e.target.value); onClearPrefill(); }}
                placeholder="e.g., 100g"
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Macro fields */}
          <div className="mt-3">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Macros (optional)</label>
            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="Protein"
                  min="0"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-300 pr-7"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-300">g</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="Carbs"
                  min="0"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-slate-300 pr-7"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-300">g</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  placeholder="Fat"
                  min="0"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent placeholder:text-slate-300 pr-7"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-300">g</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={justAdded}
            className={`mt-4 w-full py-3 rounded-xl font-semibold transition-all text-sm ${
              justAdded
                ? 'bg-emerald-600 text-white scale-[0.98]'
                : 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700'
            }`}
          >
            {justAdded ? 'Added!' : 'Add Entry'}
          </button>
        </div>
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

function PenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
    </svg>
  );
}
