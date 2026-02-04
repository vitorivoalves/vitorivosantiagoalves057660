import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { TutorService } from '../services/tutorService';
import { PetService } from '../services/petService';
import { maskPhone, maskCPF, unmask } from '../utils/masks';
import Loading from '../components/Loading';
import type { Pet } from '../types';

interface TutorFormData {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: string;
}

const TutorForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); 
  const isEditing = !!id;
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TutorFormData>();
  const [loading, setLoading] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [linkedPets, setLinkedPets] = useState<Pet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing) loadTutorData();
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [id]);

  useEffect(() => {
    if (isEditing && searchTerm && !selectedPet) {
      const timer = setTimeout(() => searchPets(searchTerm), 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, isEditing]);

  const loadTutorData = async () => {
    try {
      setLoading(true);
      const tutor = await TutorService.getById(id!);
      setValue('nome', tutor.nome);
      setValue('email', tutor.email);
      setValue('endereco', tutor.endereco);
      setValue('telefone', maskPhone(tutor.telefone)); 
      setValue('cpf', maskCPF(String(tutor.cpf).padStart(11, '0')));
      if (tutor.pets) setLinkedPets(tutor.pets);
      if (tutor.foto) setPreview(tutor.foto.url);
    } catch (error) { navigate('/tutores'); } finally { setLoading(false); }
  };

  const searchPets = async (nome: string) => {
    try {
      const { data } = await PetService.getAll(0, nome, 10); 
      setSearchResults(data); setShowDropdown(true);
    } catch (error) { console.error("Erro na busca de pets"); }
  };

  const handleSelectPet = (pet: Pet) => {
    setSelectedPet(pet); setSearchTerm(`${pet.nome} (${pet.raca})`); setShowDropdown(false);
  };

  const handleLinkPet = async () => {
    if (!selectedPet) return alert('Selecione um Pet.');
    try {
      await TutorService.vincularPet(Number(id), selectedPet.id);
      alert('Vinculado!'); setSelectedPet(null); setSearchTerm(''); setSearchResults([]); loadTutorData();
    } catch (error) { alert('Erro ao vincular.'); }
  };

  const handleUnlinkPet = async (petId: number) => {
    if (!confirm('Desvincular este pet?')) return;
    try { await TutorService.desvincularPet(Number(id), petId); loadTutorData(); } catch (error) { alert('Erro ao desvincular.'); }
  };

  const onSubmit = async (data: TutorFormData) => {
    setLoading(true);
    try {
      const payload = { ...data, cpf: Number(unmask(data.cpf)), telefone: unmask(data.telefone) };
      let currentId = id;
      if (isEditing) await TutorService.save(payload, id);
      else {
        const res = await TutorService.save(payload);
        // @ts-ignore
        currentId = res.data.id;
      }
      if (foto && currentId) await TutorService.uploadPhoto(currentId, foto);
      alert('Salvo!'); if (!isEditing) navigate('/tutores');
    } catch (error) { alert('Erro ao salvar.'); } finally { setLoading(false); }
  };

  if (loading && !isEditing) return <Loading />;

  return (
    <div className="container" style={{ maxWidth: '800px', paddingTop: '40px', paddingBottom: '100px' }}>
       {/* Botão Voltar Corrigido */}
       <button onClick={() => navigate('/tutores')} className="btn-secondary" style={{ marginBottom: '20px' }}>
         <span className="material-icons">arrow_back</span> Voltar
       </button>

      <h2>{isEditing ? 'Editar Tutor' : 'Novo Tutor'}</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="card" style={{ borderTop: '4px solid #90caf9' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px', color: '#90caf9' }}>Dados Pessoais</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div><label>Nome Completo</label><input {...register("nome", { required: true })} />{errors.nome && <span style={{color:'#ef9a9a'}}>Erro</span>}</div>
            <div><label>E-mail</label><input type="email" {...register("email", { required: true })} /></div>
            <div><label>CPF</label><input {...register("cpf", { required: true })} onChange={(e) => setValue('cpf', maskCPF(e.target.value))} /></div>
            <div><label>Telefone</label><input {...register("telefone", { required: true })} onChange={(e) => setValue('telefone', maskPhone(e.target.value))} /></div>
        </div>
        <div style={{ marginTop: '15px' }}><label>Endereço</label><input {...register("endereco", { required: true })} /></div>
        
        <div style={{ marginTop: '20px' }}><label>Foto de Perfil</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px' }}>
                {preview && <img src={preview} alt="Preview" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #90caf9' }} />}
                <input type="file" onChange={(e) => { if (e.target.files?.[0]) { setFoto(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])); } }} accept="image/*" />
            </div>
        </div>

        {/* Botão Salvar Corrigido */}
        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '24px', width: '100%' }}>
          <span className="material-icons">save</span> {loading ? 'Salvando...' : 'Salvar Dados'}
        </button>
      </form>

      {isEditing && (
        <div className="card" style={{ marginTop: '30px', borderTop: '4px solid #80deea' }}>
            <h3 style={{ marginTop: 0, color: '#80deea' }}>Pets Vinculados</h3>
            <div style={{ background: '#2d2d2d', padding: '20px', borderRadius: '8px', marginBottom: '20px', position: 'relative' }} ref={searchWrapperRef}>
                <label style={{color: '#80deea'}}>Vincular Pet</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <input type="text" placeholder="Buscar por nome..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setSelectedPet(null); setShowDropdown(true); }} style={{ margin: 0 }} />
                        {showDropdown && searchResults.length > 0 && (
                            <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#2d2d2d', border: '1px solid #444', maxHeight: '200px', overflowY: 'auto', padding: 0, margin: 0, listStyle: 'none', zIndex: 10 }}>
                                {searchResults.map(pet => (
                                    <li key={pet.id} onClick={() => handleSelectPet(pet)} style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #444', color: '#e0e0e0' }}>
                                        {pet.nome} <span style={{fontSize:'0.85rem', color:'#aaa'}}>({pet.raca})</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {/* Botão Adicionar Corrigido */}
                    <button type="button" className="btn-primary" onClick={handleLinkPet} disabled={!selectedPet} style={{ width: 'auto', padding: '0 20px', backgroundColor: '#80deea' }}>
                      <span className="material-icons" style={{color: '#121212'}}>add</span>
                    </button>
                </div>
            </div>

            {linkedPets.map(pet => (
                <div key={pet.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2d2d2d', padding: '16px', marginBottom: '10px', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <span className="material-icons" style={{ color: '#80deea' }}>pets</span>
                         <span style={{ color: '#fff', fontWeight: 500 }}>{pet.nome}</span>
                    </div>
                    {/* Botão Remover Corrigido */}
                    <button type="button" onClick={() => handleUnlinkPet(pet.id)} style={{ color: '#ef9a9a', background: 'transparent', border: '1px solid #ef9a9a', padding: '6px 12px', borderRadius: '16px', fontSize: '0.9rem' }}>
                        <span className="material-icons" style={{fontSize: '18px'}}>delete</span> Remover
                    </button>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default TutorForm;