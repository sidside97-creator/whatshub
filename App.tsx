import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import GroupCard from './components/GroupCard';
import AddGroupModal from './components/AddGroupModal';
import AdminDashboard from './components/AdminDashboard';
import { Group, Category } from './types';
import { Search, SlidersHorizontal, Lock, Loader2, Database } from 'lucide-react';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  // --- CHARGEMENT DES DONNÉES DEPUIS SUPABASE ---
  const fetchGroups = async () => {
    setIsLoading(true);
    if (!supabase) {
      setError("La connexion à la base de données n'est pas configurée.");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Mapping des données (Supabase retourne snake_case ou lowercase par défaut)
        const mappedGroups: Group[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          description: d.description,
          link: d.link,
          category: d.category as Category,
          // Gestion des noms de colonnes potentiellement en minuscules
          membersCount: d.membersCount || d.memberscount || 0,
          isVerified: d.isVerified || d.isverified || false,
          createdAt: new Date(d.created_at).getTime()
        }));
        setGroups(mappedGroups);
      }
    } catch (err) {
      console.error("Erreur chargement Supabase:", err);
      setError("Impossible de charger les groupes. Vérifiez votre connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            group.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || group.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [groups, searchQuery, selectedCategory]);

  // --- ACTIONS BASE DE DONNÉES (CRUD) ---

  const handleAddGroup = async (groupData: Omit<Group, 'id' | 'createdAt'>) => {
    if (!supabase) return;

    try {
      if (editingGroup) {
        // MODE MODIFICATION
        const { error } = await supabase
          .from('groups')
          .update({
            name: groupData.name,
            description: groupData.description,
            link: groupData.link,
            category: groupData.category,
            membersCount: groupData.membersCount,
            isVerified: groupData.isVerified
          })
          .eq('id', editingGroup.id);

        if (error) throw error;
      } else {
        // MODE CRÉATION
        const { error } = await supabase
          .from('groups')
          .insert([{
            name: groupData.name,
            description: groupData.description,
            link: groupData.link,
            category: groupData.category,
            membersCount: groupData.membersCount,
            isVerified: false // Par défaut non vérifié
            // created_at est géré automatiquement par Supabase
          }]);

        if (error) throw error;
      }

      // Recharger la liste après modification
      fetchGroups();
      setIsModalOpen(false);
      setEditingGroup(null);
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
      alert("Une erreur est survenue lors de la sauvegarde.");
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Mise à jour optimiste de l'UI
      setGroups(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert("Impossible de supprimer ce groupe.");
    }
  };

  const handleUpdateGroup = async (updatedGroup: Group) => {
    // Utilisé par le dashboard admin pour toggleVerify
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('groups')
        .update({ isVerified: updatedGroup.isVerified })
        .eq('id', updatedGroup.id);

      if (error) throw error;

      setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
    } catch (err) {
      console.error("Erreur mise à jour:", err);
    }
  };

  const handleEditClick = (group: Group) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const toggleAdmin = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
    } else {
      const password = prompt("Entrez le mot de passe administrateur :");
      if (password === "admin") {
        setIsAdminMode(true);
      } else if (password) {
        alert("Mot de passe incorrect");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <Header onAddClick={() => {
        setEditingGroup(null);
        setIsModalOpen(true);
      }} />
      
      {/* Admin Dashboard Overlay */}
      {isAdminMode && (
        <AdminDashboard 
          groups={groups}
          onDelete={handleDeleteGroup}
          onUpdate={handleUpdateGroup}
          onEdit={handleEditClick}
          onClose={() => setIsAdminMode(false)}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <div className="text-center mb-10 space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Trouvez votre groupe <span className="text-green-600">WhatsApp</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Rejoignez des communautés actives, discutez de vos passions et développez votre réseau sur WhatsHub.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between sticky top-20 z-10 bg-slate-50/95 backdrop-blur py-2">
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400 group-focus-within:text-green-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un groupe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
            />
          </div>

          <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
             <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === 'All' 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Tous
                </button>
                {Object.values(Category).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat 
                        ? 'bg-green-600 text-white shadow-md' 
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 size={40} className="animate-spin text-green-600 mb-4" />
            <p>Chargement des groupes...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
            <Database size={48} className="mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-bold text-red-800 mb-2">Configuration requise</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-sm text-red-500">
              Assurez-vous d'avoir ajouté les variables VITE_SUPABASE_URL et VITE_SUPABASE_KEY dans votre déploiement Vercel.
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && (
          filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4 text-slate-400">
                <SlidersHorizontal size={32} />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Aucun groupe trouvé</h3>
              <button 
                onClick={() => {
                  setEditingGroup(null);
                  setIsModalOpen(true);
                }}
                className="mt-6 text-green-600 font-semibold hover:text-green-700"
              >
                Ajouter le premier groupe &rarr;
              </button>
            </div>
          )
        )}
      </main>

      <AddGroupModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingGroup(null);
        }} 
        onSubmit={handleAddGroup}
        initialData={editingGroup}
      />

       {/* Footer */}
       <footer className="border-t border-slate-200 mt-auto bg-white">
        <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} WhatsHub. Tous droits réservés.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
             <button onClick={toggleAdmin} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
               <Lock size={14} /> Admin
             </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;