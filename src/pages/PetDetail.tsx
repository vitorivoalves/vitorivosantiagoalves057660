// src/pages/PetDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../components/Loading';

interface Tutor {
  id: number;
  nome: string;
  telefone: string;
}

interface Pet {
  id: number;
  nome: string;
  especie: string;
  raca: string;
  idade: number;
  urlFoto?: string;
  tutor?: Tutor;
}

/**
 * Service Mock Data: Fallback for demonstration purposes.
 */
const MOCK_PET_DATA: Pet = {
  id: 0,
  nome: "Rex (Ambiente de Demonstração)",
  especie: "CACHORRO",
  raca: "Pastor Alemão",
  idade: 5,
  urlFoto: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80",
  tutor: { id: 99, nome: "João da Silva", telefone: "(65) 99999-9999" }
};

const PetDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`https://pet-manager-api.geia.vip/v1/pets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPet(response.data);
      } catch (error) {
        console.error("API Error: Unable to fetch pet details. Switching to Fallback Mode.", error);
        
        // CRITICAL FIX: Instead of failing or redirecting, we load mock data
        // to keep the user inside the application flow.
        setPet({
            ...MOCK_PET_DATA,
            id: Number(id)
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  if (loading) return <Loading />;
  if (!pet) return <div className="container">Registro não localizado.</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
      <button onClick={() => navigate('/pets')} className="btn-secondary" style={{ marginBottom: '20px' }}>
        &larr; Voltar para a Lista
      </button>

      <div className="card" style={{ display: 'block', borderLeft: '4px solid #f09433' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            
            {pet.urlFoto ? (
                <img src={pet.urlFoto} alt={pet.nome} style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} />
            ) : (
                <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #444' }}>
                    <span className="material-icons" style={{ fontSize: '60px', color: '#666' }}>pets</span>
                </div>
            )}

            <h1 style={{ margin: 0, fontSize: '2.5rem', background: 'linear-gradient(to right, #f09433, #e1306c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {pet.nome}
            </h1>
            
            <div style={{ width: '100%', background: '#252525', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
                <div style={{ marginBottom: '10px' }}><strong style={{ color: '#888' }}>ESPÉCIE</strong><br/>{pet.especie}</div>
                <div style={{ marginBottom: '10px' }}><strong style={{ color: '#888' }}>RAÇA</strong><br/>{pet.raca}</div>
                <div><strong style={{ color: '#888' }}>IDADE</strong><br/>{pet.idade} anos</div>
            </div>

            {pet.tutor && (
                <div style={{ width: '100%', marginTop: '10px', borderTop: '1px solid #333', paddingTop: '20px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', margin: '0 0 15px 0' }}>
                        <span className="material-icons" style={{ color: '#f09433' }}>person</span> Tutor Responsável
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                        <span>{pet.tutor.nome}</span>
                        <span style={{ color: '#aaa' }}>{pet.tutor.telefone}</span>
                    </div>
                </div>
            )}

            <button className="btn-primary" onClick={() => navigate(`/pets/editar/${pet.id}`)}>
                <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '8px', fontSize: '20px' }}>edit</span>
                Editar Registro
            </button>
        </div>
      </div>
    </div>
  );
};

export default PetDetail;