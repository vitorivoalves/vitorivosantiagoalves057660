import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { PetService } from '../services/petService';
import { TutorService } from '../services/tutorService';
import Loading from '../components/Loading';
import type { Tutor } from '../types';

interface PetFormData {
  nome: string;
  raca: string;
  idade: number;
  especie?: string;
}

const PetForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PetFormData>();
  const [loading, setLoading] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [linkedTutors, setLinkedTutors] = useState<Tutor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Tutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing) loadPetData();
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [id]);

  useEffect(() => {
    if (isEditing && searchTerm && !selectedTutor) {
      const timer = setTimeout(() => searchTutors(searchTerm), 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, isEditing]);

  const loadPetData = async () => {
    try {
      setLoading(true);
      const pet = await PetService.getById(id!);
      setValue('nome', pet.nome);
      setValue('raca', pet.raca);
      setValue('idade', pet.idade);
      if (pet.foto) setPreview(pet.foto.url);
      if (pet.tutores) setLinkedTutors(pet.tutores);
    } catch (error) { navigate('/pets'); } finally { setLoading(false); }
  };

  const searchTutors = async (nome: string) => {
    try {
      const data = await TutorService.getAll(0, nome);
      setSearchResults(data.content);
      setShowDropdown(true);
    } catch (error) { console.error("Erro busca tutores"); }
  };

  const handleSelectTutor = (tutor: Tutor) => {
    setSelectedTutor(tutor); setSearchTerm(tutor.nome); setShowDropdown(false);
  };

  const handleLinkTutor = async () => {
    if (!selectedTutor) return alert('Selecione um tutor.');
    try {
      await TutorService.vincularPet(selectedTutor.id, Number(id));
      alert('Tutor vinculado!');
      setSelectedTutor(null); setSearchTerm(''); setSearchResults([]); loadPetData();
    } catch (error: any) { alert(`Erro: ${error.response?.data?.message || 'Falha ao vincular'}`); }
  };

  const handleUnlinkTutor = async (tutorId: number) => {
    if (!confirm('Remover este tutor?')) return;
    try {
      await TutorService.desvincularPet(tutorId, Number(id));
      loadPetData();
    } catch (error) { alert('Erro ao desvincular.'); }
  };

  const onSubmit = async (data: PetFormData) => {
    setLoading(true);
    try {
      let petId = id;
      if (isEditing) await PetService.save(data, id);
      else {
        const res = await PetService.save(data);
        // @ts-ignore
        petId = res.data.id;
      }
      if (foto && petId) await PetService.uploadPhoto(petId, foto);
      alert('Salvo com sucesso!');
      if (!isEditing) navigate('/pets');
    } catch (error) { alert('Erro ao salvar.'); } finally { setLoading(false); }
  };

  if (loading && !isEditing) return <Loading />;

  return (
    <div className="container" style={{ maxWidth: '800px', paddingTop: '40px', paddingBottom: '100px' }}>
      {/* Botão Voltar Corrigido */}
      <button onClick={() => navigate('/pets')} className="btn-secondary" style={{ marginBottom: '20px' }}>
        <span className="material-icons">arrow_back</span> Voltar
      </button>

      <h2 style={{color: '#e0e0e0'}}>{isEditing ? 'Editar Pet' : 'Novo Pet'}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="card" style={{ borderTop: '4px solid #90caf9' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px', color: '#90caf9' }}>
          Dados do Pet
        </h3>

        <div style={{ display: 'grid', gap: '15px' }}>
            <div>
                <label>Nome do Pet</label>
                <input {...register("nome", { required: true })} placeholder="Ex: Rex" />
                {errors.nome && <span style={{ color: '#ef9a9a' }}>Obrigatório</span>}
            </div>
            <div>
                <label>Espécie</label>
                <select {...register("especie")}>
                    <option value="Cachorro">Cachorro</option>
                    <option value="Gato">Gato</option>
                    <option value="Outro">Outro</option>
                </select>
            </div>
            <div>
                <label>Raça</label>
                <input {...register("raca")} placeholder="Ex: Vira-lata" />
            </div>
            <div>
                <label>Idade (anos)</label>
                <input type="number" {...register("idade", { required: true })} placeholder="0" />
            </div>
            <div>
                <label>Foto de Perfil</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px' }}>
                    {preview && <img src={preview} alt="Preview" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #90caf9' }} />}
                    <input type="file" onChange={(e) => { if (e.target.files?.[0]) { setFoto(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])); } }} accept="image/*" />
                </div>
            </div>
        </div>

        {/* Botão Salvar Corrigido */}
        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '24px', width: '100%' }}>
          <span className="material-icons">save</span>
          {loading ? 'Salvando...' : 'Salvar Registro'}
        </button>
      </form>

      {isEditing && (
        <div className="card" style={{ marginTop: '30px', borderTop: '4px solid #80deea' }}>
            <h3 style={{ marginTop: 0, color: '#80deea' }}>Tutores Responsáveis</h3>
            
            <div style={{ background: '#2d2d2d', padding: '20px', borderRadius: '8px', marginBottom: '20px', position: 'relative' }} ref={searchWrapperRef}>
                <label style={{color: '#80deea'}}>Vincular Tutor</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <input 
                            type="text" 
                            placeholder="Buscar por nome..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setSelectedTutor(null); setShowDropdown(true); }}
                            onFocus={() => { if(searchTerm && !selectedTutor) setShowDropdown(true); }}
                            style={{ margin: 0 }}
                        />
                        {showDropdown && searchResults.length > 0 && (
                            <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#2d2d2d', border: '1px solid #444', maxHeight: '200px', overflowY: 'auto', padding: 0, margin: 0, listStyle: 'none', zIndex: 10, boxShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>
                                {searchResults.map(tutor => (
                                    <li key={tutor.id} onClick={() => handleSelectTutor(tutor)} style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #444', color: '#e0e0e0' }}>
                                        <strong>{tutor.nome}</strong> <span style={{fontSize: '0.85rem', color: '#9e9e9e'}}>({tutor.cpf})</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {/* Botão Adicionar Corrigido */}
                    <button type="button" className="btn-primary" onClick={handleLinkTutor} disabled={!selectedTutor} style={{ width: 'auto', padding: '0 20px', backgroundColor: '#80deea' }}>
                       <span className="material-icons" style={{color: '#121212'}}>add</span>
                    </button>
                </div>
            </div>

            {linkedTutors.map(tutor => (
                <div key={tutor.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2d2d2d', padding: '16px', marginBottom: '10px', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="material-icons" style={{ color: '#80deea' }}>person</span>
                        <div>
                           <div style={{ color: '#fff', fontWeight: 500 }}>{tutor.nome}</div>
                           <div style={{ color: '#aaa', fontSize: '0.85rem' }}>{tutor.telefone}</div>
                        </div>
                    </div>
                    {/* Botão Remover Corrigido */}
                    <button type="button" onClick={() => handleUnlinkTutor(tutor.id)} style={{ color: '#ef9a9a', background: 'transparent', fontSize: '0.9rem', border: '1px solid #ef9a9a', padding: '6px 12px', borderRadius: '16px' }}>
                       <span className="material-icons" style={{fontSize: '18px'}}>delete</span> Remover
                    </button>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default PetForm;