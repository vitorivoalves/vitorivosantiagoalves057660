import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { PetService } from '../services/petService';
import { TutorService } from '../services/tutorService';
import Loading from '../components/Loading';
import type { Tutor } from '../types';

interface PetFormData { nome: string; raca: string; idade: number; especie?: string; }

const PetForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<PetFormData>();
  
  const [loading, setLoading] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [linkedTutors, setLinkedTutors] = useState<Tutor[]>([]);
  
  // Autocomplete States
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Tutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing) loadData();
    // Fecha dropdown ao clicar fora
    const clickOut = (e: MouseEvent) => {
        if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => { if(isEditing && searchTerm && !selectedTutor) searchTutors(searchTerm) }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const pet = await PetService.getById(id!);
      setValue('nome', pet.nome); setValue('raca', pet.raca); setValue('idade', pet.idade);
      if (pet.foto) setPreview(pet.foto.url);
      if (pet.tutores) setLinkedTutors(pet.tutores);
    } catch (e) { navigate('/pets'); } finally { setLoading(false); }
  };

  const searchTutors = async (term: string) => {
    try {
        const res = await TutorService.getAll(0, term);
        setSearchResults(res.content); setShowDropdown(true);
    } catch(e) {}
  };

  const handleLink = async () => {
    if(!selectedTutor) return;
    try { await TutorService.vincularPet(selectedTutor.id, Number(id)); loadData(); setSelectedTutor(null); setSearchTerm(''); }
    catch(e) { alert('Erro ao vincular.'); }
  };

  const handleUnlink = async (tId: number) => {
    if(!confirm('Desvincular tutor?')) return;
    try { await TutorService.desvincularPet(tId, Number(id)); loadData(); } catch(e) { alert('Erro.'); }
  };

  // NOVO: Função de Deletar Pet
  const handleDelete = async () => {
    if (!confirm('ATENÇÃO: Deseja realmente excluir este pet do sistema? Essa ação não pode ser desfeita.')) return;
    try {
      await PetService.delete(id!);
      alert('Pet excluído com sucesso.');
      navigate('/pets');
    } catch (error) {
      alert('Erro ao excluir. Verifique se existem pendências.');
    }
  };

  const onSubmit = async (data: PetFormData) => {
    setLoading(true);
    try {
      let petId = id;
      if (isEditing) await PetService.save(data, id);
      else { const res = await PetService.save(data); petId = (res as any).data.id; }
      if (foto && petId) await PetService.uploadPhoto(petId, foto);
      alert('Salvo!'); if(!isEditing) navigate('/pets');
    } catch (e) { alert('Erro ao salvar.'); } finally { setLoading(false); }
  };

  if (loading && !isEditing) return <Loading />;

  return (
    <div className="container">
      <button onClick={() => navigate('/pets')} className="btn-secondary" style={{marginBottom: 20}}>
        <span className="material-icons">arrow_back</span> Voltar
      </button>

      <h2 style={{color:'#e0e0e0'}}>{isEditing ? 'Editar Pet' : 'Novo Pet'}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="card" style={{borderTop: '4px solid #90caf9'}}>
        <div style={{display:'grid', gap: 15}}>
          <div><label>Nome</label><input {...register('nome')} /></div>
          <div><label>Espécie</label><select {...register('especie')}><option>Cachorro</option><option>Gato</option><option>Outro</option></select></div>
          <div><label>Raça</label><input {...register('raca')} /></div>
          <div><label>Idade</label><input type="number" {...register('idade')} /></div>
          <div>
             <label>Foto</label>
             <div style={{display:'flex', gap:10, alignItems:'center', marginTop:5}}>
               {preview && <img src={preview} style={{width:50, height:50, borderRadius:'50%', objectFit:'cover'}} />}
               <input type="file" onChange={e => { if(e.target.files?.[0]) { setFoto(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])) }}} />
             </div>
          </div>
        </div>
        
        <div style={{display: 'flex', gap: '10px', marginTop: 25}}>
            <button type="submit" className="btn-primary" style={{flex: 1}}>
                <span className="material-icons">save</span> Salvar
            </button>
            
            {/* NOVO: Botão Excluir */}
            {isEditing && (
                <button type="button" onClick={handleDelete} className="btn-secondary" style={{borderColor: '#ef9a9a', color: '#ef9a9a'}}>
                    <span className="material-icons">delete</span> Excluir
                </button>
            )}
        </div>
      </form>

      {isEditing && (
        <div className="card" style={{marginTop: 30, borderTop: '4px solid #80deea'}}>
           <h3 style={{color:'#80deea', marginTop:0}}>Tutores</h3>
           <div style={{background:'#2d2d2d', padding:15, borderRadius:8, marginBottom:15}} ref={searchWrapperRef}>
              <div style={{display:'flex', gap:10}}>
                 <div style={{flex:1, position:'relative'}}>
                    <input placeholder="Buscar tutor..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setSelectedTutor(null);}} onFocus={() => setShowDropdown(true)} />
                    {showDropdown && searchResults.length > 0 && (
                        <ul style={{position:'absolute', top:'100%', left:0, right:0, background:'#333', zIndex:10, listStyle:'none', padding:0, margin:0, border:'1px solid #444'}}>
                           {searchResults.map(t => (
                               <li key={t.id} onClick={() => {setSelectedTutor(t); setSearchTerm(t.nome); setShowDropdown(false)}} style={{padding:10, cursor:'pointer', borderBottom:'1px solid #444'}}>{t.nome}</li>
                           ))}
                        </ul>
                    )}
                 </div>
                 <button type="button" className="btn-primary" onClick={handleLink} disabled={!selectedTutor}><span className="material-icons">add</span></button>
              </div>
           </div>
           {linkedTutors.map(t => (
               <div key={t.id} style={{display:'flex', justifyContent:'space-between', padding:10, borderBottom:'1px solid #333'}}>
                   <span style={{display:'flex', alignItems:'center', gap:5}}><span className="material-icons" style={{color:'#80deea'}}>person</span> {t.nome}</span>
                   <button type="button" onClick={() => handleUnlink(t.id)} style={{background:'none', color:'#ef9a9a'}}>Remover</button>
               </div>
           ))}
        </div>
      )}
    </div>
  );
};
export default PetForm;