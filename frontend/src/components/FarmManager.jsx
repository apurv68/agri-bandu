import React, { useState, useEffect } from 'react';
import { 
  Sprout, Calendar, Plus, CheckCircle2, Clock, AlertCircle, 
  Trash2, MapPin, Layers, Droplet, Shield, Scissors, Sparkles,
  ChevronRight, X, Bell, Check, Edit2
} from 'lucide-react';

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
  { id: 'spray', label: 'Spraying / दवा छिड़काव', icon: Shield, color: '#d97706', bg: '#fffbeb' },
  { id: 'irrigation', label: 'Irrigation / सिंचाई', icon: Droplet, color: '#2563eb', bg: '#eff6ff' },
  { id: 'fertilizer', label: 'Fertilizer / खाद-उर्वरक', icon: Sprout, color: '#16a34a', bg: '#f0fdf4' },
  { id: 'pruning', label: 'Weeding & Pruning / निराई-कटाई', icon: Scissors, color: '#9333ea', bg: '#faf5ff' },
  { id: 'harvest', label: 'Harvesting / फसल कटाई', icon: Calendar, color: '#ea580c', bg: '#fff7ed' }
];

const GROWTH_STAGES = [
  '🌱 Germination (अंकुरण)',
  '🌿 Vegetative Growth (वृद्धि)',
  '🌸 Flowering Stage (फूल आना)',
  '🍅 Fruiting Stage (फल लगना)',
  '🌾 Maturity & Harvest (परिपक्वता)'
];

const DEFAULT_FARMS = [
  {
    id: 'farm-1',
    name: 'Plot A - North Field (उत्तर खेत)',
    location: 'Noida, Sector 135',
    size: '2.5 Acres',
    soilType: 'Alluvial (जलोढ़ मिट्टी)',
    crop: 'Tomato (टमाटर)',
    cropVariety: 'Pusa Ruby',
    sowingDate: '2026-09-15',
    harvestDate: '2026-12-20',
    stage: '🌸 Flowering Stage (फूल आना)',
    health: 'Under Treatment (झुलसा उपचार)'
  },
  {
    id: 'farm-2',
    name: 'Plot B - Tubewell Block (नलकूप खेत)',
    location: 'Noida Village',
    size: '4.0 Acres',
    soilType: 'Loam (दोमट मिट्टी)',
    crop: 'Potato (आलू)',
    cropVariety: 'Kufri Jyoti',
    sowingDate: '2026-10-01',
    harvestDate: '2027-01-15',
    stage: '🌿 Vegetative Growth (वृद्धि)',
    health: 'Healthy (स्वस्थ)'
  }
];

const DEFAULT_TASKS = [
  {
    id: 'task-1',
    farmId: 'farm-1',
    farmName: 'Plot A - North Field',
    category: 'spray',
    title: 'Neem Oil Spray for Early Blight (नीम तेल छिड़काव)',
    dosage: '5 ml Neem Oil per 1L water + 2 drops mild soap',
    date: '2026-10-16',
    time: '07:00 AM',
    completed: false,
    urgent: true
  },
  {
    id: 'task-2',
    farmId: 'farm-1',
    farmName: 'Plot A - North Field',
    category: 'irrigation',
    title: 'Drip Irrigation Session (ड्रिप सिंचाई 2 घंटे)',
    dosage: 'Root-zone watering only, keep leaves dry',
    date: '2026-10-17',
    time: '06:30 AM',
    completed: false,
    urgent: false
  },
  {
    id: 'task-3',
    farmId: 'farm-2',
    farmName: 'Plot B - Tubewell Block',
    category: 'fertilizer',
    title: 'Urea Top Dressing & Bio-NPK (यूरिया एवं जैव उर्वरक)',
    dosage: '40 kg per acre before secondary watering',
    date: '2026-10-18',
    time: '08:00 AM',
    completed: false,
    urgent: false
  }
];

export default function FarmManager({ user, onScanRedirect }) {
  // Load persisted farms & tasks from localStorage
  const [farms, setFarms] = useState(() => {
    const saved = localStorage.getItem('agri_bandhu_farms');
    return saved ? JSON.parse(saved) : DEFAULT_FARMS;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('agri_bandhu_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [activeTab, setActiveTab] = useState('farms'); // 'farms' | 'tasks' | 'calendar'
  const [taskFilter, setTaskFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [selectedFarmId, setSelectedFarmId] = useState(farms[0]?.id || '');

  // Modals state
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // New Farm form state
  const [newFarm, setNewFarm] = useState({
    name: '',
    location: 'Noida, UP',
    size: '2 Acres',
    soilType: 'Alluvial (जलोढ़ मिट्टी)',
    crop: 'Tomato (टमाटर)',
    cropVariety: 'Standard Hybrid',
    sowingDate: new Date().toISOString().split('T')[0],
    harvestDate: '',
    stage: GROWTH_STAGES[1],
    health: 'Healthy (स्वस्थ)'
  });

  // New Task form state
  const [newTask, setNewTask] = useState({
    farmId: farms[0]?.id || '',
    category: 'spray',
    title: '',
    dosage: '',
    date: new Date().toISOString().split('T')[0],
    time: '07:00 AM',
    repeat: 'none'
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('agri_bandhu_farms', JSON.stringify(farms));
  }, [farms]);

  useEffect(() => {
    localStorage.setItem('agri_bandhu_tasks', JSON.stringify(tasks));
  }, [tasks]);

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
      location: 'Noida, UP',
      size: '2 Acres',
      soilType: 'Alluvial (जलोढ़ मिट्टी)',
      crop: 'Tomato (टमाटर)',
      cropVariety: 'Standard Hybrid',
      sowingDate: new Date().toISOString().split('T')[0],
      harvestDate: '',
      stage: GROWTH_STAGES[1],
      health: 'Healthy (स्वस्थ)'
    });
  };

  // Delete Farm Handler
  const handleDeleteFarm = (farmId) => {
    if (window.confirm('Are you sure you want to delete this farm plot?')) {
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
      farmName: matchedFarm?.name || 'General Farm',
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
      time: '07:00 AM',
      repeat: 'none'
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
        padding: '1.5rem 1.75rem',
        color: '#ffffff',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 4px 20px rgba(18, 57, 36, 0.15)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.6rem' }}>🌾</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              My Farm & Crop Schedules (मेरा खेत और कार्य अनुसूची)
            </h2>
          </div>
          <p style={{ color: '#bbf7d0', fontSize: '0.9rem', margin: '0.35rem 0 0 0' }}>
            Schedule crops, irrigation, fertilizer, and spray reminders for your farm plots
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setShowAddFarmModal(true)}
            className="btn-primary"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
          >
            <Plus size={18} />
            <span>+ Add Farm (खेत जोड़ें)</span>
          </button>

          <button
            onClick={() => setShowAddTaskModal(true)}
            className="btn-amber"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
          >
            <Calendar size={18} />
            <span>+ Schedule Task (कार्य जोड़ें)</span>
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
              Total Plots (कुल खेत)
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#14281d' }}>
              {farms.length} Plots
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
              Active Crops (बोई गई फसलें)
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#14281d' }}>
              {new Set(farms.map(f => f.crop)).size} Varieties
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
              Pending Tasks (बाकी कार्य)
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#14281d' }}>
              {pendingCount} Tasks
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
              🌾 Registered Farm Plots ({farms.length})
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
              <Plus size={16} /> Add New Plot
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {farms.map((farm) => (
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
                      <span>{farm.location} · {farm.size}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteFarm(farm.id)}
                    title="Delete Farm"
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
                          {farm.crop} ({farm.cropVariety})
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          Sown on {farm.sowingDate}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      background: farm.health.includes('Healthy') ? '#ecfdf5' : '#fffbeb',
                      color: farm.health.includes('Healthy') ? '#059669' : '#d97706',
                      border: `1px solid ${farm.health.includes('Healthy') ? '#a7f3d0' : '#fde68a'}`,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}>
                      {farm.health}
                    </span>
                  </div>

                  <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>
                    {farm.stage}
                  </div>
                </div>

                {/* Plot Task Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                  <span style={{ color: '#4b5563' }}>
                    Soil: <strong>{farm.soilType}</strong>
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
                    + Add Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Scheduled Tasks & Reminders */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#14281d', fontWeight: 800, margin: 0 }}>
              📅 Farm Tasks & Reminders ({tasks.length})
            </h3>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', background: '#e9eee5', borderRadius: '10px', padding: '3px' }}>
              {['all', 'pending', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTaskFilter(f)}
                  style={{
                    background: taskFilter === f ? '#123924' : 'transparent',
                    color: taskFilter === f ? '#ffffff' : '#4b5563',
                    border: 'none',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Done'}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredTasks.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                <Calendar size={38} color="#9ca3af" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ color: '#14281d', fontWeight: 800, margin: 0 }}>No Tasks in this Filter</h4>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                  Click below to schedule irrigation, fertilizing, or spraying reminders.
                </p>
                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="btn-amber"
                  style={{ marginTop: '1rem', fontSize: '0.85rem', padding: '0.65rem 1.25rem' }}
                >
                  + Add New Reminder
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{
                              background: catObj.bg,
                              color: catObj.color,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              marginBottom: '0.3rem'
                            }}>
                              <CatIcon size={12} />
                              {catObj.label.split('/')[0]}
                            </span>

                            <h4 style={{
                              fontSize: '0.98rem',
                              fontWeight: 800,
                              color: task.completed ? '#6b7280' : '#14281d',
                              textDecoration: task.completed ? 'line-through' : 'none',
                              margin: 0
                            }}>
                              {task.title}
                            </h4>
                          </div>

                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            title="Delete Task"
                            style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {task.dosage && (
                          <p style={{ color: '#4b5563', fontSize: '0.82rem', margin: '0.35rem 0 0.5rem 0', lineHeight: '1.4' }}>
                            📝 {task.dosage}
                          </p>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.4rem', fontSize: '0.78rem' }}>
                          <span style={{ color: '#15803d', fontWeight: 600 }}>
                            📍 {task.farmName}
                          </span>

                          <span style={{
                            color: '#b45309',
                            background: '#fffbeb',
                            padding: '0.15rem 0.55rem',
                            borderRadius: '999px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}>
                            <Clock size={12} /> {task.date} · {task.time}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Add Farm Modal */}
      {showAddFarmModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 20, 16, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#14281d', fontWeight: 800, fontSize: '1.25rem' }}>
                <Sprout size={24} color="#15803d" />
                <span>Add Farm Plot (नया खेत जोड़ें)</span>
              </div>
              <button onClick={() => setShowAddFarmModal(false)} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddFarm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>
                  Farm / Plot Name (खेत का नाम):
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Plot #3 (उत्तर वाला खेत)"
                  value={newFarm.name}
                  onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#14281d' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>
                    Plot Size (क्षेत्रफल):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2.5 Acres / 5 बीघा"
                    value={newFarm.size}
                    onChange={(e) => setNewFarm({ ...newFarm, size: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>
                    Location (स्थान):
                  </label>
                  <input
                    type="text"
                    value={newFarm.location}
                    onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>
                    Crop Sown (बोई जाने वाली फसल):
                  </label>
                  <select
                    value={newFarm.crop}
                    onChange={(e) => setNewFarm({ ...newFarm, crop: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}
                  >
                    {CROPS_LIST.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>
                    Variety (किस्म):
                  </label>
                  <input
                    type="text"
                    value={newFarm.cropVariety}
                    onChange={(e) => setNewFarm({ ...newFarm, cropVariety: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>
                    Sowing Date (बुवाई तिथि):
                  </label>
                  <input
                    type="date"
                    value={newFarm.sowingDate}
                    onChange={(e) => setNewFarm({ ...newFarm, sowingDate: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>
                    Current Growth Stage (अवस्था):
                  </label>
                  <select
                    value={newFarm.stage}
                    onChange={(e) => setNewFarm({ ...newFarm, stage: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}
                  >
                    {GROWTH_STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '0.85rem' }}
                >
                  Save Farm Plot (खेत सहेजें)
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddFarmModal(false)}
                  className="btn-secondary"
                  style={{ padding: '0.85rem' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task / Reminder Modal */}
      {showAddTaskModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 20, 16, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#14281d', fontWeight: 800, fontSize: '1.25rem' }}>
                <Calendar size={24} color="#d97706" />
                <span>Schedule Crop Task / Reminder (कार्य शेड्यूल करें)</span>
              </div>
              <button onClick={() => setShowAddTaskModal(false)} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>
                  Select Farm Plot (खेत चुनें):
                </label>
                <select
                  value={newTask.farmId}
                  onChange={(e) => setNewTask({ ...newTask, farmId: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}
                >
                  {farms.map(f => (
                    <option key={f.id} value={f.id}>{f.name} - ({f.crop})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>
                  Task Category (कार्य का प्रकार):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                  {TASK_CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isSelected = newTask.category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setNewTask({ ...newTask, category: cat.id })}
                        style={{
                          padding: '0.55rem',
                          borderRadius: '10px',
                          border: isSelected ? `2px solid ${cat.color}` : '1px solid #e5eae1',
                          background: isSelected ? cat.bg : '#ffffff',
                          color: isSelected ? cat.color : '#4b5563',
                          fontWeight: 700,
                          fontSize: '0.76rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon size={14} />
                        <span>{cat.label.split('/')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>
                  Task Description / Title (कार्य का विवरण):
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neem Oil Spray 5ml/L, Drip irrigation 2 hrs"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>
                  Dosage / Field Action Instructions (मात्रा व निर्देश):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spray in early morning 7-9 AM, avoid direct sun"
                  value={newTask.dosage}
                  onChange={(e) => setNewTask({ ...newTask, dosage: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>
                    Scheduled Date (तिथि):
                  </label>
                  <input
                    type="date"
                    required
                    value={newTask.date}
                    onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>
                    Time (समय):
                  </label>
                  <input
                    type="text"
                    value={newTask.time}
                    onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="btn-amber"
                  style={{ flex: 1, padding: '0.85rem' }}
                >
                  Set Task Reminder (रिमाइंडर सेट करें)
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="btn-secondary"
                  style={{ padding: '0.85rem' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
