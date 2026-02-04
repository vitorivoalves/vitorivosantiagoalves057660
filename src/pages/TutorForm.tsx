import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { TutorService } from '../services/tutorService';
import { PetService } from '../services/petService';
import { maskPhone, maskCPF, unmask } from '../utils/masks';
import Loading from '../components/Loading';
import type { Pet, Tutor } from '../types';

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
  
  // Estados de Upload de Foto (NOVO)
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Estados de Pets
  const [linkedPets, setLinkedPets] = useState<Pet[]>([]);
  
  // Autocomplete
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing) {
      loadTutorData();
    }
    
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [id]);

  useEffect(() => {
    if (isEditing && searchTerm && !selectedPet) {
      const timer = setTimeout(() => {
        searchPets(searchTerm);
      }, 300);
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
    } catch (error) {
      alert('Erro ao carregar dados do tutor.');
      navigate('/tutores');
    } finally {
      setLoading(false);
    }
  };

  const searchPets = async (nome: string) => {
    try {
      const { data } = await PetService.getAll(0, nome, 10); 
      setSearchResults(data);
      setShowDropdown(true);
    } catch (error) {
      console.error("Erro na busca de pets");
    }
  };

  const handleSelectPet = (pet: Pet) => {
    setSelectedPet(pet);
    setSearchTerm(`${pet.nome} (${pet.raca})`);
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedPet(null);
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleLinkPet = async () => {
    if (!selectedPet) return alert('Pesquise e selecione um Pet primeiro.');
    try {
      await TutorService.vincularPet(Number(id), selectedPet.id);
      alert(`Pet ${selectedPet.nome} vinculado!`);
      handleClearSelection();
      loadTutorData();
    } catch (error) {
      alert('Erro ao vincular.');
    }
  };

  const handleUnlinkPet = async (petId: number) => {
    if (!confirm('Desvincular este pet?')) return;
    try {
      await TutorService.desvincularPet(Number(id), petId);
      loadTutorData(); 
    } catch (error) {
      alert('Erro ao desvincular.');
    }
  };

  const onSubmit = async (data: TutorFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        cpf: Number(unmask(data.cpf)), 
        telefone: unmask(data.telefone)
      };

      let currentId = id;

      if (isEditing) {
        await TutorService.save(payload, id);
        alert('Tutor atualizado com sucesso!');
      } else {
        const response = await TutorService.save(payload);
        // @ts-ignore
        currentId = response.data.id;
        alert('Tutor criado com sucesso!');
        navigate('/tutores'); 
      }

      // Upload de Foto
      if (foto && currentId) {
        await TutorService.uploadPhoto(currentId, foto);
      }

    } catch (error) {
      console.error(error);
      alert('Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !linkedPets.length && isEditing) return <Loading />;

  return (
    <div className="container" style={{ maxWidth: '800px', paddingTop: '40px', paddingBottom: '100px' }}>
       <button onClick={() => navigate('/tutores')} className="btn-secondary" style={{ marginBottom: '20px' }}>
        &larr; Voltar para Lista
      </button>

      <h2>{isEditing ? 'Editar Tutor & Pets' : 'Novo Tutor'}</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="card" style={{ display: 'block' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Dados Pessoais</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
                <label>Nome Completo</label>
                <input {...register("nome", { required: "Obrigatório" })} placeholder="Nome" />
                {errors.nome && <span style={{ color: 'red' }}>{errors.nome.message}</span>}
            </div>
            <div>
                <label>E-mail</label>
                <input type="email" {...register("email", { required: "Obrigatório" })} placeholder="email@exemplo.com" />
            </div>
            <div>
                <label>CPF</label>
                <input 
                    {...register("cpf", { required: "Obrigatório" })} 
                    placeholder="000.000.000-00"
                    onChange={(e) => setValue('cpf', maskCPF(e.target.value))}
                />
            </div>
            <div>
                <label>Telefone</label>
                <input 
                    {...register("telefone", { required: "Obrigatório" })} 
                    placeholder="(00) 00000-0000"
                    onChange={(e) => setValue('telefone', maskPhone(e.target.value))}
                />
            </div>
        </div>
        
        <label>Endereço</label>
        <input {...register("endereco", { required: "Obrigatório" })} placeholder="Endereço completo" />

        {/* Input de Foto (NOVO) */}
        <div style={{ marginTop: '20px' }}>
            <label>Foto de Perfil</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {preview && (
                    <img src={preview} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f09433' }} />
                )}
                <input type="file" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                        setFoto(e.target.files[0]);
                        setPreview(URL.createObjectURL(e.target.files[0]));
                    }
                }} accept="image/*" />
            </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '20px' }}>
          {loading ? 'Salvando...' : 'Salvar Dados do Tutor'}
        </button>
      </form>

      {isEditing && (
        <div className="card" style={{ display: 'block', marginTop: '30px', border: '1px solid #444' }}>
            <h3 style={{ marginTop: 0, color: '#f09433' }}>Gerenciamento de Pets</h3>
            
            <div style={{ background: '#252525', padding: '15px', borderRadius: '8px', marginBottom: '30px', position: 'relative' }} ref={searchWrapperRef}>
                <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Buscar Pet para Vincular</label>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder="Digite o nome do pet..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setSelectedPet(null);
                                setShowDropdown(true);
                            }}
                            onFocus={() => {
                                if (searchTerm && !selectedPet) setShowDropdown(true);
                            }}
                            style={{ 
                                margin: 0, 
                                width: '100%', 
                                background: selectedPet ? '#2e3a2e' : '#1a1a1a', 
                                borderColor: selectedPet ? '#4caf50' : '#444'
                            }}
                        />
                        
                        {searchTerm && (
                            <span 
                                onClick={handleClearSelection}
                                style={{ 
                                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', 
                                    cursor: 'pointer', color: '#aaa', fontWeight: 'bold' 
                                }}
                            >
                                ✕
                            </span>
                        )}

                        {showDropdown && searchResults.length > 0 && (
                            <ul style={{
                                position: 'absolute', top: '100%', left: 0, right: 0,
                                background: '#333', border: '1px solid #555', borderRadius: '0 0 8px 8px',
                                maxHeight: '200px', overflowY: 'auto', padding: 0, margin: 0, listStyle: 'none', zIndex: 10
                            }}>
                                {searchResults.map(pet => (
                                    <li 
                                        key={pet.id}
                                        onClick={() => handleSelectPet(pet)}
                                        style={{
                                            padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #444',
                                            display: 'flex', justifyContent: 'space-between'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#444'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <span>{pet.nome}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{pet.raca}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button 
                        type="button" 
                        className="btn-primary" 
                        onClick={handleLinkPet} 
                        disabled={!selectedPet}
                        style={{ height: '50px', width: '120px', margin: 0 }}
                    >
                        Vincular
                    </button>
                </div>
            </div>

            <h4>Pets Vinculados ({linkedPets.length})</h4>
            {linkedPets.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: '#666' }}>Nenhum pet vinculado a este tutor.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {linkedPets.map(pet => (
                        <div key={pet.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#121212', padding: '10px 15px', borderRadius: '8px', border: '1px solid #333' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="material-icons" style={{ color: '#aaa' }}>pets</span>
                                <span><strong>{pet.nome}</strong> <span style={{ color: '#777', fontSize: '0.9rem' }}>({pet.raca})</span></span>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => handleUnlinkPet(pet.id)}
                                style={{ background: 'transparent', border: '1px solid #e57373', color: '#e57373', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                                Desvincular
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default TutorForm;