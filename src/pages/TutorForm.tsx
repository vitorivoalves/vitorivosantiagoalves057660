import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { TutorService } from '../services/tutorService';
import { PetService } from '../services/petService';
import { maskPhone, maskCPF, unmask } from '../utils/masks';
import Loading from '../components/Loading';
import type { Pet } from '../types';

interface TutorFormData { nome: string; email: string; telefone: string; endereco: string; cpf: string; }

const TutorForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { register, handleSubmit, setValue } = useForm<TutorFormData>();
  
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
    if (isEditing) loadData();
    const clickOut = (e: MouseEvent) => { if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) setShowDropdown(false); };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => { if(isEditing && searchTerm && !selectedPet) searchPets(searchTerm) }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadData = async () => {
    try {
        setLoading(true);
        const tutor = await TutorService.getById(id!);
        setValue('nome', tutor.nome); setValue('email', tutor.email); setValue('endereco', tutor.endereco);
        setValue('telefone', maskPhone(tutor.telefone)); setValue('cpf', maskCPF(String(tutor.cpf).padStart(11, '0')));
        if(tutor.foto) setPreview(tutor.foto.url);
        if(tutor.pets) setLinkedPets(tutor.pets);
    } catch(e) { navigate('/tutores'); } finally { setLoading(false); }
  };

  const searchPets = async (term: string) => {
    try { const { data } = await PetService.getAll(0, term); setSearchResults(data); setShowDropdown(true); } catch(e){}
  };

  const handleLink = async () => {
      if(!selectedPet) return;
      try { await TutorService.vincularPet(Number(id), selectedPet.id); loadData(); setSelectedPet(null); setSearchTerm(''); }
      catch(e) { alert('Erro ao vincular'); }
  };

  const handleUnlink = async (pId: number) => {
      if(!confirm('Desvincular pet?')) return;
      try { await TutorService.desvincularPet(Number(id), pId); loadData(); } catch(e){ alert('Erro'); }
  };

  // NOVO: Deletar Tutor
  const handleDelete = async () => {
    if (!confirm('ATENÇÃO: Excluir este tutor também removerá seus vínculos. Continuar?')) return;
    try {
        await TutorService.delete(id!);
        alert('Tutor excluído.');
        navigate('/tutores');
    } catch (error) { alert('Erro ao excluir.'); }
  };

  const onSubmit = async (data: TutorFormData) => {
      setLoading(true);
      try {
          const payload = { ...data, cpf: Number(unmask(data.cpf)), telefone: unmask(data.telefone) };
          let tId = id;
          if(isEditing) await TutorService.save(payload, id);
          else { const res = await TutorService.save(payload); tId = (res as any).data.id; }
          if(foto && tId) await TutorService.uploadPhoto(tId, foto);
          alert('Salvo!'); if(!isEditing) navigate('/tutores');
      } catch(e){ alert('Erro ao salvar'); } finally { setLoading(false); }
  };

  if (loading && !isEditing) return <Loading />;

  return (
    <div className="container">
       <button onClick={() => navigate('/tutores')} className="btn-secondary" style={{marginBottom: 20}}>
         <span className="material-icons">arrow_back</span> Voltar
       </button>
       <h2 style={{color:'#e0e0e0'}}>{isEditing ? 'Editar Tutor' : 'Novo Tutor'}</h2>
       
       <form onSubmit={handleSubmit(onSubmit)} className="card" style={{borderTop: '4px solid #90caf9'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15}}>
              <div><label>Nome</label><input {...register('nome')} /></div>
              <div><label>Email</label><input type="email" {...register('email')} /></div>
              <div><label>CPF</label><input {...register('cpf')} onChange={e => setValue('cpf', maskCPF(e.target.value))} /></div>
              <div><label>Telefone</label><input {...register('telefone')} onChange={e => setValue('telefone', maskPhone(e.target.value))} /></div>
          </div>
          <div style={{marginTop:15}}><label>Endereço</label><input {...register('endereco')} /></div>
          <div style={{marginTop:15}}>
              <label>Foto</label>
              <div style={{display:'flex', gap:10, alignItems:'center', marginTop:5}}>
                {preview && <img src={preview} style={{width:50, height:50, borderRadius:'50%', objectFit:'cover'}} />}
                <input type="file" onChange={e => { if(e.target.files?.[0]) { setFoto(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])) }}} />
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
           <h3 style={{color:'#80deea', marginTop:0}}>Pets</h3>
           <div style={{background:'#2d2d2d', padding:15, borderRadius:8, marginBottom:15}} ref={searchWrapperRef}>
               <div style={{display:'flex', gap:10}}>
                   <div style={{flex:1, position:'relative'}}>
                       <input placeholder="Buscar pet..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setSelectedPet(null)}} onFocus={() => setShowDropdown(true)} />
                       {showDropdown && searchResults.length > 0 && (
                           <ul style={{position:'absolute', top:'100%', left:0, right:0, background:'#333', zIndex:10, listStyle:'none', padding:0, margin:0, border:'1px solid #444'}}>
                               {searchResults.map(p => (
                                   <li key={p.id} onClick={() => {setSelectedPet(p); setSearchTerm(p.nome); setShowDropdown(false)}} style={{padding:10, cursor:'pointer', borderBottom:'1px solid #444'}}>{p.nome}</li>
                               ))}
                           </ul>
                       )}
                   </div>
                   <button type="button" className="btn-primary" onClick={handleLink} disabled={!selectedPet}><span className="material-icons">add</span></button>
               </div>
           </div>
           {linkedPets.map(p => (
               <div key={p.id} style={{display:'flex', justifyContent:'space-between', padding:10, borderBottom:'1px solid #333'}}>
                   <span style={{display:'flex', alignItems:'center', gap:5}}><span className="material-icons" style={{color:'#80deea'}}>pets</span> {p.nome}</span>
                   <button type="button" onClick={() => handleUnlink(p.id)} style={{background:'none', color:'#ef9a9a'}}>Remover</button>
               </div>
           ))}
        </div>
       )}
    </div>
  );
};
export default TutorForm;