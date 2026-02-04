import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PetService } from '../services/petService';
import Loading from '../components/Loading';
import type { Pet } from '../types';

const PetList: React.FC = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(0);

  const carregarPets = async () => {
    setLoading(true);
    try {
      const { data } = await PetService.getAll(pagina, busca);
      setPets(data);
    } catch (error) { console.error("Erro ao carregar pets"); } finally { setLoading(false); }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => carregarPets(), 500);
    return () => clearTimeout(timeoutId);
  }, [pagina, busca]);

  if (loading && !pets.length) return <Loading />;

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <h2 style={{ margin: 0, color: '#e0e0e0', fontSize: '1.5rem' }}>Pets</h2>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar pet..." 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ padding: '12px', background: '#1e1e1e', border: '1px solid #333' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {pets.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>Nenhum pet encontrado.</p>
        ) : (
          pets.map((pet) => (
            <div 
              key={pet.id} 
              className="card" 
              onClick={() => navigate(`/pets/${pet.id}`)}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                cursor: 'pointer',
                padding: '12px 16px', /* Mais compacto */
                marginBottom: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {/* Foto Redonda no Balão */}
                <div style={{ 
                  width: '45px', height: '45px', borderRadius: '50%', 
                  background: pet.foto ? `url(${pet.foto.url}) center/cover` : '#333',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid #444', flexShrink: 0
                }}>
                  {!pet.foto && <span className="material-icons" style={{ color: '#666', fontSize: '20px' }}>pets</span>}
                </div>
                
                <div>
                  <strong style={{ fontSize: '1rem', color: '#e0e0e0', display: 'block' }}>{pet.nome}</strong>
                  <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '2px' }}>
                    {pet.raca} • {pet.idade} anos
                  </div>
                </div>
              </div>
              <span className="material-icons" style={{ color: '#444', fontSize: '20px' }}>chevron_right</span>
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px' }}>
        <button className="btn-secondary" disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>Anterior</button>
        <span style={{alignSelf:'center', color:'#666', fontSize:'0.9rem'}}>{pagina + 1}</span>
        <button className="btn-secondary" disabled={pets.length < 10} onClick={() => setPagina(pagina + 1)}>Próxima</button>
      </div>

      {/* Botão Flutuante (FAB) */}
      <button className="fab" onClick={() => navigate('/pets/novo')}>
        <span className="material-icons">add</span>
      </button>
    </div>
  );
};

export default PetList;