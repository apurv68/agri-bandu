import React, { useState, useEffect } from 'react';
import { 
  Sprout, Calendar, Plus, CheckCircle2, Clock, AlertCircle, 
  Trash2, MapPin, Layers, Droplet, Shield, Scissors, Sparkles,
  ChevronRight, X, Bell, Check, Edit2
} from 'lucide-react';
import { TRANSLATIONS } from '../translations';

const CROPS_LIST = [
  { id: 'tomato', name: 'Tomato (टमाटर)', icon: '🍅', duration: '90-120 days' },
  { id: 'potato', name: 'Potato (आलू)', icon: '🥔', duration: '90-110 days' },
  { id: 'wheat', name: 'Wheat (गेहूं)', icon: '🌾', duration: '120-140 days' },
  { id: 'corn', name: 'Corn / Maize (मक्का)', icon: '🌽', duration: '85-100 days' },
  { id: 'rice', name: 'Paddy / Rice (धान)', icon: '🌾', duration: '110-130 days' },
  { id: 'mustard', name: 'Mustard (सरसों)', icon: '🌼', duration: '100-125 days' },
  { id: 'cotton', name: 'Cotton (कपास)', icon: '🌱', duration: '150-180 days' },
  { id: 'sugarcane', name: 'Sugarcane (गन्ना)', icon: '🎋', duration: '300-360 days' }
];

const TASK_CATEGORIES = [
  { id: 'spray', labelEn: 'Spraying', labelHi: 'दवा छिड़काव', icon: Shield, color: '#d97706', bg: '#fffbeb' },
  { id: 'irrigation', labelEn: 'Irrigation', labelHi: 'सिंचाई', icon: Droplet, color: '#2563eb', bg: '#eff6ff' },
  { id: 'fertilizer', labelEn: 'Fertilizer', labelHi: 'खाद-उर्वरक', icon: Sprout, color: '#16a34a', bg: '#f0fdf4' },
  { id: 'pruning', labelEn: 'Weeding & Pruning', labelHi: 'निराई-कटाई', icon: Scissors, color: '#9333ea', bg: '#faf5ff' },
  { id: 'harvest', labelEn: 'Harvesting', labelHi: 'फसल कटाई', icon: Calendar, color: '#ea580c', bg: '#fff7ed' }
];

const GROWTH_STAGES = [
  { en: '🌱 Germination', hi: '🌱 अंकुरण' },
  { en: '🌿 Vegetative Growth', hi: '🌿 वानस्पतिक वृद्धि' },
  { en: '🌸 Flowering Stage', hi: '🌸 फूल आने की अवस्था' },
  { en: '🍅 Fruiting Stage', hi: '🍅 फल / दाना लगना' },
  { en: '🌾 Maturity & Harvest', hi: '🌾 परिपक्वता एवं कटाई' }
];

export default function FarmManager({ user, onScanRedirect, lang = 'hi' }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.hi;

  // Clean empty initialization scoped to user account (Fix 2: No fake preloaded default farms/tasks)
  const storageUserKey = user ? (user.id || user.email) : 'guest';
  const farmsKey = `agri_farms_${storageUserKey}`;
  const tasksKey = `agri_tasks_${storageUserKey}`;

  const [farms, setFarms] = useState(() => {
    const saved = localStorage.getItem(farmsKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Exclude legacy dummy farms
        return parsed.filter(f => f.id !== 'farm-1' && f.id !== 'farm-2');
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(tasksKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Exclude legacy dummy tasks
        return parsed.filter(t => t.id !== 'task-1' && t.id !== 'task-2' && t.id !== 'task-3');
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [taskFilter, setTaskFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [selectedFarmId, setSelectedFarmId] = useState(farms[0]?.id || '');

  // Modals state
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // New Farm form state
  const [newFarm, setNewFarm] = useState({
    name: '',
    location: '',
    size: '',
    soilType: lang === 'hi' ? 'जलोढ़ दोमट मिट्टी' : 'Alluvial Loam',
    crop: 'Tomato (टमाटर)',
    cropVariety: 'Standard Hybrid',
    sowingDate: new Date().toISOString().split('T')[0],
    harvestDate: '',
    stage: lang === 'hi' ? '🌿 वानस्पतिक वृद्धि' : '🌿 Vegetative Growth',
    health: lang === 'hi' ? 'स्वस्थ (Healthy)' : 'Healthy'
  });

  // New Task form state
  const [newTask, setNewTask] = useState({
    farmId: farms[0]?.id || '',
    category: 'spray',
    title: '',
    dosage: '',
    date: new Date().toISOString().split('T')[0],
    time: '07:00 AM'
  });

  // Persist to localStorage per user
  useEffect(() => {
    localStorage.setItem(farmsKey, JSON.stringify(farms));
  }, [farms, farmsKey]);

  useEffect(() => {
    localStorage.setItem(tasksKey, JSON.stringify(tasks));
  }, [tasks, tasksKey]);

  // Add Farm Handler
  const handleAddFarm = (e) => {
    e.preventDefault();
    if (!newFarm.name.trim()) return;

    const createdFarm = {
      ...newFarm,
      id: `farm-${Date.now()}`
    };

    const updated = [createdFarm, ...farms];
    setFarms(updated);
    setSelectedFarmId(createdFarm.id);
    setShowAddFarmModal(false);
    setNewFarm({
      name: '',
      location: '',
      size: '',
      soilType: lang === 'hi' ? 'जलोढ़ दोमट मिट्टी' : 'Alluvial Loam',
      crop: 'Tomato (टमाटर)',
      cropVariety: 'Standard Hybrid',
      sowingDate: new Date().toISOString().split('T')[0],
      harvestDate: '',
      stage: lang === 'hi' ? '🌿 वानस्पतिक वृद्धि' : '🌿 Vegetative Growth',
      health: lang === 'hi' ? 'स्वस्थ (Healthy)' : 'Healthy'
    });
  };

  // Delete Farm Handler
  const handleDeleteFarm = (farmId) => {
    const confirmMsg = lang === 'hi' ? 'क्या आप इस खेत के रिकॉर्ड को हटाना चाहते हैं?' : 'Are you sure you want to delete this farm plot?';
    if (window.confirm(confirmMsg)) {
      const updated = farms.filter(f => f.id !== farmId);
      setFarms(updated);
      setTasks(tasks.filter(t => t.farmId !== farmId));
      if (selectedFarmId === farmId) {
        setSelectedFarmId(updated[0]?.id || '');
      }
    }
  };

  // Add Task Handler
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const matchedFarm = farms.find(f => f.id === newTask.farmId) || farms[0];
    const createdTask = {
      ...newTask,
      id: `task-${Date.now()}`,
      farmName: matchedFarm?.name || (lang === 'hi' ? 'सामान्य खेत' : 'General Farm'),
      completed: false,
      urgent: false
    };

    setTasks([createdTask, ...tasks]);
    setShowAddTaskModal(false);
    setNewTask({
      farmId: farms[0]?.id || '',
      category: 'spray',
      title: '',
      dosage: '',
      date: new Date().toISOString().split('T')[0],
      time: '07:00 AM'
    });
  };

  // Toggle Task Completed
  const handleToggleTask = (taskId) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  // Delete Task
  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'pending') return !t.completed;
    if (taskFilter === 'completed') return t.completed;
    return true;
  });

  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <div style={{ maxWidth: '1280px', margin: '1.25rem auto 3rem auto', padding: '0 1rem' }}>
      
      {/* Top Banner Header */}
      <div style={{
        background: '#123924',
        borderRadius: '20px',
        padding: '1.75rem',
        color: '#ffffff',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 25px rgba(18, 57, 36, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#86efac', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>
            <Sprout size={18} />
            <span>{t.tabFarms}</span>
          </div>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0.3rem 0 0 0', color: '#ffffff' }}>
            {t.farmTitle}
          </h2>
          <p style={{ color: '#bbf7d0', fontSize: '0.9rem', margin: '0.3rem 0 0 0', opacity: 0.9 }}>
            {t.farmSubtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowAddFarmModal(true)}
            className="btn-primary"
            style={{ padding: '0.7rem 1.3rem', fontSize: '0.88rem' }}
          >
            <Plus size={18} />
            <span>{t.addNewFarmBtn}</span>
          </button>

          <button
            onClick={() => {
              if (farms.length === 0) {
                setShowAddFarmModal(true);
              } else {
                setShowAddTaskModal(true);
              }
            }}
            className="btn-amber"
            style={{ padding: '0.7rem 1.3rem', fontSize: '0.88rem' }}
          >
            <Calendar size={18} />
            <span>{t.addNewTaskBtn}</span>
          </button>
        </div>
      </div>

      {/* Stats Quick Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Total Farms */}
        <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#15803d'
          }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>
              {lang === 'hi' ? 'कुल खेत (Plots)' : 'Total Plots'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#14281d' }}>
              {farms.length} {lang === 'hi' ? 'खेत' : 'Plots'}
            </div>
          </div>
        </div>

        {/* Active Crops */}
        <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: '#fef3c7',
            border: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d97706'
          }}>
            <Sprout size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>
              {lang === 'hi' ? 'बोई गई फसलें' : 'Active Crops'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#14281d' }}>
              {new Set(farms.map(f => f.crop)).size} {lang === 'hi' ? 'फसलें' : 'Crops'}
            </div>
          </div>
        </div>

        {/* Pending Reminders */}
        <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb'
          }}>
            <Bell size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>
              {lang === 'hi' ? 'लंबित कार्य' : 'Pending Tasks'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#14281d' }}>
              {pendingCount} {lang === 'hi' ? 'कार्य' : 'Tasks'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Farms List & Right Tasks Schedule */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
        
        {/* Left Column: Farm Plots List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#14281d', fontWeight: 800, margin: 0 }}>
              🌾 {t.tabFarms} ({farms.length})
            </h3>
            <button
              onClick={() => setShowAddFarmModal(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#15803d',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <Plus size={16} /> {t.addNewFarmBtn}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {farms.length === 0 ? (
              /* Clean Empty State for Farms (Fix 2) */
              <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', background: '#ffffff', borderRadius: '20px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#f0fdf4',
                  border: '1.5px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  color: '#15803d'
                }}>
                  <Sprout size={32} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#14281d', margin: '0 0 0.4rem 0' }}>
                  {t.emptyFarmsTitle}
                </h4>
                <p style={{ color: '#6b7280', fontSize: '0.88rem', maxWidth: '360px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
                  {t.emptyFarmsSub}
                </p>
                <button
                  onClick={() => setShowAddFarmModal(true)}
                  className="btn-primary"
                  style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
                >
                  <Plus size={18} />
                  <span>{t.addNewFarmBtn}</span>
                </button>
              </div>
            ) : (
              farms.map((farm) => (
                <div 
                  key={farm.id}
                  className="glass-panel"
                  style={{
                    padding: '1.25rem',
                    border: selectedFarmId === farm.id ? '2px solid #16a34a' : '1px solid #e5eae1',
                    background: '#ffffff',
                    boxShadow: selectedFarmId === farm.id ? '0 4px 16px rgba(22, 163, 74, 0.15)' : '0 2px 8px rgba(18, 57, 36, 0.04)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#14281d', margin: 0 }}>
                        {farm.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6b7280', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                        <MapPin size={14} color="#15803d" />
                        <span>{farm.location || 'Local Farm'} · {farm.size || '1 Acre'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteFarm(farm.id)}
                      title={t.deleteBtn}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        padding: '0.25rem'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Crop & Growth Stage Card */}
                  <div style={{
                    background: '#f8faf6',
                    border: '1px solid #e2ebd8',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    marginBottom: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>
                          {CROPS_LIST.find(c => farm.crop.includes(c.name.split(' ')[0]))?.icon || '🌱'}
                        </span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#14281d' }}>
                            {farm.crop} {farm.cropVariety ? `(${farm.cropVariety})` : ''}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {t.sowingDateLabel}: {farm.sowingDate}
                          </div>
                        </div>
                      </div>

                      <span style={{
                        background: farm.health?.includes('Healthy') || farm.health?.includes('स्वस्थ') ? '#ecfdf5' : '#fffbeb',
                        color: farm.health?.includes('Healthy') || farm.health?.includes('स्वस्थ') ? '#059669' : '#d97706',
                        border: `1px solid ${farm.health?.includes('Healthy') || farm.health?.includes('स्वस्थ') ? '#a7f3d0' : '#fde68a'}`,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        {farm.health || 'Healthy'}
                      </span>
                    </div>

                    <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>
                      {farm.stage}
                    </div>
                  </div>

                  {/* Plot Task Action */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                    <span style={{ color: '#4b5563' }}>
                      {t.soilTypeLabel}: <strong>{farm.soilType}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setNewTask({ ...newTask, farmId: farm.id });
                        setShowAddTaskModal(true);
                      }}
                      style={{
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        color: '#15803d',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      + {t.addNewTaskBtn}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Scheduled Tasks & Reminders */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#14281d', fontWeight: 800, margin: 0 }}>
              📅 {t.tabTasks} ({tasks.length})
            </h3>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', background: '#e9eee5', borderRadius: '10px', padding: '3px' }}>
              {[
                { id: 'all', label: lang === 'hi' ? 'सभी' : 'All' },
                { id: 'pending', label: lang === 'hi' ? 'लंबित' : 'Pending' },
                { id: 'completed', label: lang === 'hi' ? 'पूर्ण' : 'Done' }
              ].map((fObj) => (
                <button
                  key={fObj.id}
                  onClick={() => setTaskFilter(fObj.id)}
                  style={{
                    background: taskFilter === fObj.id ? '#123924' : 'transparent',
                    color: taskFilter === fObj.id ? '#ffffff' : '#4b5563',
                    border: 'none',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {fObj.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredTasks.length === 0 ? (
              /* Clean Empty State for Tasks (Fix 2) */
              <div className="glass-panel" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
                <Calendar size={38} color="#9ca3af" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ color: '#14281d', fontWeight: 800, margin: 0 }}>{t.emptyTasksTitle}</h4>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.3rem', maxWidth: '340px', margin: '0.3rem auto 1rem auto' }}>
                  {t.emptyTasksSub}
                </p>
                <button
                  onClick={() => {
                    if (farms.length === 0) {
                      setShowAddFarmModal(true);
                    } else {
                      setShowAddTaskModal(true);
                    }
                  }}
                  className="btn-amber"
                  style={{ fontSize: '0.85rem', padding: '0.65rem 1.25rem' }}
                >
                  <Plus size={16} />
                  <span>{t.addNewTaskBtn}</span>
                </button>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const catObj = TASK_CATEGORIES.find(c => c.id === task.category) || TASK_CATEGORIES[0];
                const CatIcon = catObj.icon;

                return (
                  <div
                    key={task.id}
                    className="glass-panel"
                    style={{
                      padding: '1.1rem',
                      background: task.completed ? '#f9fafb' : '#ffffff',
                      border: task.completed ? '1px solid #e5e7eb' : '1px solid #e5eae1',
                      opacity: task.completed ? 0.75 : 1,
                      boxShadow: '0 2px 8px rgba(18, 57, 36, 0.04)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                      
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          border: task.completed ? '2px solid #16a34a' : '2px solid #cbd5e1',
                          background: task.completed ? '#16a34a' : '#ffffff',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}
                      >
                        {task.completed && <Check size={16} strokeWidth={3} />}
                      </button>

                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{
                            background: catObj.bg,
                            color: catObj.color,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}>
                            <CatIcon size={12} />
                            {lang === 'hi' ? catObj.labelHi : catObj.labelEn}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>
                            {task.farmName}
                          </span>
                        </div>

                        <div style={{
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          color: task.completed ? '#6b7280' : '#14281d',
                          textDecoration: task.completed ? 'line-through' : 'none'
                        }}>
                          {task.title}
                        </div>

                        {task.dosage && (
                          <div style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: '0.2rem' }}>
                            🥣 {task.dosage}
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.45rem', fontSize: '0.78rem', color: '#6b7280' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Calendar size={13} color="#15803d" />
                            {task.date}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={13} color="#d97706" />
                            {task.time}
                          </span>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.2rem' }}
                      >
                        <Trash2 size={15} />
                      </button>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* ADD FARM MODAL */}
      {showAddFarmModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 20, 16, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '520px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '2rem',
            border: '1px solid #e5eae1',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: 800 }}>
                <Sprout size={22} />
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#14281d' }}>{t.addNewFarmBtn}</h3>
              </div>
              <button onClick={() => setShowAddFarmModal(false)} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddFarm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                  {t.farmNameLabel} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'hi' ? 'उदा. उत्तरी खेत / ट्यूबवेल प्लॉट' : 'e.g. North Plot / Well Acre'}
                  value={newFarm.name}
                  onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                    {t.farmSizeLabel}
                  </label>
                  <input
                    type="text"
                    placeholder="2.5 Acres"
                    value={newFarm.size}
                    onChange={(e) => setNewFarm({ ...newFarm, size: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                    {t.farmLocationLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'hi' ? 'गांव / क्षेत्र' : 'Village / Sector'}
                    value={newFarm.location}
                    onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                    {t.farmCropLabel}
                  </label>
                  <select
                    value={newFarm.crop}
                    onChange={(e) => setNewFarm({ ...newFarm, crop: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff' }}
                  >
                    {CROPS_LIST.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                    {t.sowingDateLabel}
                  </label>
                  <input
                    type="date"
                    value={newFarm.sowingDate}
                    onChange={(e) => setNewFarm({ ...newFarm, sowingDate: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddFarmModal(false)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#4b5563', fontWeight: 700, cursor: 'pointer' }}
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '0.75rem' }}
                >
                  {t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {showAddTaskModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 20, 16, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '520px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '2rem',
            border: '1px solid #e5eae1',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: 800 }}>
                <Calendar size={22} />
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#14281d' }}>{t.addNewTaskBtn}</h3>
              </div>
              <button onClick={() => setShowAddTaskModal(false)} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                  {lang === 'hi' ? 'खेत का चयन करें' : 'Select Farm Plot'} *
                </label>
                <select
                  value={newTask.farmId}
                  onChange={(e) => setNewTask({ ...newTask, farmId: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff' }}
                >
                  {farms.length > 0 ? (
                    farms.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.crop})</option>
                    ))
                  ) : (
                    <option value="">{lang === 'hi' ? 'सामान्य खेत' : 'General Farm'}</option>
                  )}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                  {lang === 'hi' ? 'कार्य श्रेणी' : 'Task Category'}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {TASK_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewTask({ ...newTask, category: cat.id })}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '999px',
                        border: newTask.category === cat.id ? `2px solid ${cat.color}` : '1px solid #cbd5e1',
                        background: newTask.category === cat.id ? cat.bg : '#ffffff',
                        color: newTask.category === cat.id ? cat.color : '#4b5563',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {lang === 'hi' ? cat.labelHi : cat.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                  {lang === 'hi' ? 'कार्य का विवरण / नाम' : 'Task Title / Action'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'hi' ? 'उदा. नीम तेल छिड़काव / यूरिया खाद' : 'e.g. Neem Oil Spray / Top Dressing'}
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                  {lang === 'hi' ? 'मात्रा / निर्देश (वैकल्पिक)' : 'Dosage / Instructions'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'hi' ? 'उदा. 5ml प्रति लीटर पानी में' : 'e.g. 5ml per 1L water'}
                  value={newTask.dosage}
                  onChange={(e) => setNewTask({ ...newTask, dosage: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                    {lang === 'hi' ? 'तारीख' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={newTask.date}
                    onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                    {lang === 'hi' ? 'समय' : 'Time'}
                  </label>
                  <input
                    type="text"
                    value={newTask.time}
                    placeholder="07:00 AM"
                    onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#4b5563', fontWeight: 700, cursor: 'pointer' }}
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="btn-amber"
                  style={{ flex: 1, padding: '0.75rem' }}
                >
                  {t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
