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

  // Estados de Tutores
  const [linkedTutors, setLinkedTutors] = useState<Tutor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Tutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing) {
      loadPetData();
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
    if (isEditing && searchTerm && !selectedTutor) {
      const timer = setTimeout(() => {
        searchTutors(searchTerm);
      }, 300);
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
      // O endpoint /v1/pets/{id} retorna os tutores vinculados no objeto 'tutores'
      // conforme documentação do Swagger[cite: 760].
      if (pet.tutores) setLinkedTutors(pet.tutores);
    } catch (error) {
      navigate('/pets');
    } finally {
      setLoading(false);
    }
  };

  const searchTutors = async (nome: string) => {
    try {
      const data = await TutorService.getAll(0, nome);
      setSearchResults(data.content);
      setShowDropdown(true);
    } catch (error) {
      console.error("Erro busca tutores");
    }
  };

  const handleSelectTutor = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setSearchTerm(tutor.nome);
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedTutor(null);
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleLinkTutor = async () => {
    if (!selectedTutor) return alert('Selecione um tutor.');
    try {
      [cite_start]// API: POST /v1/tutores/{id}/pets/{petId} [cite: 621]
      await TutorService.vincularPet(selectedTutor.id, Number(id));
      alert('Tutor vinculado!');
      handleClearSelection();
      loadPetData();
    } catch (error) {
      alert('Erro ao vincular.');
    }
  };

  const handleUnlinkTutor = async (tutorId: number) => {
    if (!confirm('Remover tutor?')) return;
    try {
      [cite_start]// API: DELETE /v1/tutores/{id}/pets/{petId} [cite: 649]
      await TutorService.desvincularPet(tutorId, Number(id));
      loadPetData();
    } catch (error) {
      alert('Erro ao desvincular.');
    }
  };

  const onSubmit = async (data: PetFormData) => {
    setLoading(true);
    try {
      const payload = { ...data };
      let petId = id;

      if (isEditing) {
        await PetService.save(payload, id);
      } else {
        const response = await PetService.save(payload);
        // @ts-ignore
        petId = response.data.id;
      }

      if (foto && petId) {
        await PetService.uploadPhoto(petId, foto);
      }

      alert('Pet salvo!');
      if (!isEditing) navigate('/pets');
    } catch (error) {
      alert('Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFoto(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  if (loading && !isEditing) return <Loading />;

  return (
    <div className="container" style={{ maxWidth: '800px', paddingTop: '40px', paddingBottom: '100px' }}>
      <button onClick={() => navigate('/pets')} className="btn-secondary" style={{ marginBottom: '20px' }}>
        &larr; Voltar
      </button>

      <h2>{isEditing ? 'Editar Pet' : 'Novo Pet'}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="card" style={{ display: 'block' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Dados do Pet</h3>

        <div style={{ marginBottom: '15px' }}>
            <label>Nome</label>
            <input {...register("nome", { required: true })} placeholder="Ex: Rex" />
            {errors.nome && <span style={{ color: 'red' }}>Obrigatório</span>}
        </div>

        <div style={{ marginBottom: '15px' }}>
            <label>Espécie</label>
            <select {...register("especie")} style={{ width: '100%', padding: '10px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}>
                <option value="Cachorro">Cachorro</option>
                <option value="Gato">Gato</option>
                <option value="Outro">Outro</option>
            </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
            <label>Raça</label>
            <input {...register("raca")} placeholder="Ex: Vira-lata" />
        </div>

        <div style={{ marginBottom: '15px' }}>
            <label>Idade (anos)</label>
            <input type="number" {...register("idade", { required: true })} placeholder="0" />
        </div>

        <div style={{ marginBottom: '20px' }}>
            <label>Foto</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {preview && <img src={preview} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />}
                <input type="file" onChange={handleFileChange} accept="image/*" />
            </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>

      {isEditing && (
        <div className="card" style={{ display: 'block', marginTop: '30px', border: '1px solid #444' }}>
            <h3 style={{ marginTop: 0, color: '#f09433' }}>Tutores</h3>
            
            <div style={{ background: '#252525', padding: '15px', borderRadius: '8px', marginBottom: '30px', position: 'relative' }} ref={searchWrapperRef}>
                <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Vincular Tutor</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <input 
                            type="text" 
                            placeholder="Nome do tutor..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setSelectedTutor(null); setShowDropdown(true); }}
                            onFocus={() => { if(searchTerm && !selectedTutor) setShowDropdown(true); }}
                            style={{ margin: 0, width: '100%', background: selectedTutor ? '#2e3a2e' : '#1a1a1a' }}
                        />
                        {showDropdown && searchResults.length > 0 && (
                            <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#333', border: '1px solid #555', maxHeight: '200px', overflowY: 'auto', padding: 0, margin: 0, listStyle: 'none', zIndex: 10 }}>
                                {searchResults.map(tutor => (
                                    <li key={tutor.id} onClick={() => handleSelectTutor(tutor)} style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #444' }}>
                                        <strong>{tutor.nome}</strong> (CPF: {tutor.cpf})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button type="button" className="btn-primary" onClick={handleLinkTutor} disabled={!selectedTutor} style={{ height: '50px', width: '100px', margin: 0 }}>
                        +
                    </button>
                </div>
            </div>

            {linkedTutors.map(tutor => (
                <div key={tutor.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#121212', padding: '10px', marginBottom: '10px', borderRadius: '8px' }}>
                    <span>{tutor.nome}</span>
                    <button onClick={() => handleUnlinkTutor(tutor.id)} style={{ color: '#e57373', background: 'none', border: 'none', cursor: 'pointer' }}>Remover</button>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default PetForm;